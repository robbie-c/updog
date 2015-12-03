'use strict';

var shortid = require('shortid');

var logger = require('../../common/logger');
var events = require('../../common/constants/events');

var pubsub = require('../pubsub');

var rooms = {};

function joinRoom(io, client, roomName, callback) {

    if (!roomName) {
        // TODO do other sanity checks on the room name
        client.emit(events.FAILED_JOIN_ROOM, 'room.name.invalid');
        return;
    }

    var room;
    if (rooms.hasOwnProperty(roomName)) {
        room = rooms[roomName];
    } else {
        room = rooms[roomName] = new RoomSignaler(io, roomName);
    }

    if (room.io != io) {
        throw new Error('Invalid io!');
    }

    room.clientRequestsJoin(client, callback);
}


/**
 * An object that handles all the logic and communication for clients in a room together
 *
 */
class RoomSignaler {
    constructor(io, roomName) {
        this.io = io;
        this.roomName = roomName;
        this.room = null;
        this.roomSubscription = null;
        this.participants = {}
    }

    clientRequestsJoin(client, callback) {
        this.getRoom()
            .then(function (room) {
                if (client.roomSignaler) {
                    logger.error('already in a room');
                    client.emit(events.FAILED_JOIN_ROOM, 'room.alreadyin');
                } else if (!room.canBeAccessedByUser(client.user)) {
                    logger.error('bad permission');
                    client.emit(events.FAILED_JOIN_ROOM, 'room.permission');
                } else {
                    // join succeeded!
                    client.roomSignaler = this;
                    client.join(this.roomName);

                    logger.log('join succeeded', client.id);

                    this.participants[client.id] = {
                        client: client,
                        user: client.user,
                        userSubscription: client.user ? pubsub.user.subscribe(client.user._id, this._userChanged.bind(this, client.id)) : null
                    };

                    this.attachRoomEventsToClient(client);

                    logger.info('client joined room', client.id, this.roomName);

                    // TODO shouldn't need this, because we're about to broadcast the whole thing to the whole room
                    var roomData = this._getRoomData();
                    callback(roomData);

                    this._roomChanged();
                }
            }.bind(this))
            .catch(function (err) {
                logger.error(err);
            });
    }

    attachRoomEventsToClient(client) {
        client.on('disconnect', this._clientDisconnect.bind(this, client));
        client.on(events.WEBRTC_PEER_MESSAGE, this._webrtcPeerMessage.bind(this, client));
        client.on(events.TEXT_CHAT_MESSAGE, this._textChatMessage.bind(this, client));
    }

    _webrtcPeerMessage(client, message) {
        if (!message) {
            logger.info('empty message!');
            return;
        }

        if (!message.to) {
            logger.info('no to field specified!');
            return;
        }

        var otherParticipant = this.participants[message.to];
        if (!otherParticipant) {
            logger.info('couldnt find other client', message.to);
            return;
        }

        message.from = client.id;
        otherParticipant.client.emit(events.WEBRTC_PEER_MESSAGE, message);
    }

    _textChatMessage(client, message, callback) {
        if (!message) {
            logger.info('empty message!');
            return;
        }

        // copy the things we care about into the new message, ignore other keys
        var safeMessage = {
            contents: message.contents,
            clientTime: message.clientTime,
            type: message.type,

            fromClientId: client.id,
            fromUserId: client.user ? client.user._id : null,
            serverTime: Date.now(),
            _id: shortid.generate()
        };

        // TODO store message in mongodb

        callback(); // TODO might need to send some data depending on whether the message succeeded
        this.io.to(this.roomName).emit(events.TEXT_CHAT_MESSAGE, safeMessage);
    }

    _clientDisconnect(client) {
        if (this.participants[client.id].userSubscription) {
            this.participants[client.id].userSubscription.close();
        }
        delete this.participants[client.id];
        this._broadcastRoomData();
    }

    //noinspection JSUnusedLocalSymbols
    _userChanged(socketId, user) {
        // don't actually need the arguments, because we just pull the users out of the clients
        // however in future they might be useful if we want to send only changes

        this._broadcastRoomData();
    }

    getRoom() {
        if (this.room) {
            return Promise.resolve(this.room);
        } else {
            return new Promise(function (resolve, reject) {
                var subscriptionCallback = (function (err, room) {
                    if (err) {
                        // TODO error handling
                        logger.error('failed to get room', err);
                    } else {
                        this._roomChanged(room);
                        if (resolve) {
                            resolve(room);
                            resolve = null;
                            reject = null;
                        }
                    }
                }).bind(this);

                this.roomSubscription = pubsub.room.subscribe(this.roomName, subscriptionCallback);
            }.bind(this));
        }
    }

    _roomChanged(newRoom) {
        this.room = newRoom;

        // TODO check that everyone in the room is still allowed to be here

        this._broadcastRoomData();
    }

    _broadcastRoomData() {
        // TODO long term goal but only send changes rather than the whole thing
        var roomData = this._getRoomData();

        logger.log('broadcasting to room', this.roomName, roomData);

        this.io.to(this.roomName).emit(events.ROOM_DATA_CHANGED, roomData);
    }

    _getRoomData() {
        var participants = {};
        var users = {};

        // sanitise participants, e.g. remove the subscription object and sanitise the user
        for (let socketId of Object.keys(this.participants)) {
            let userClient = this.participants[socketId];
            let user = userClient.user;

            if (user) {
                user = user.sanitise();
                users[user._id] = user;
            }

            participants[socketId] = {
                user: user
            }
        }

        return {
            participants: participants,
            users: users
        };
    }

    close() {
        // TODO forcibly disconnected any clients still connected (there should be none)

        this.roomSubscription.close();
        this.roomSubscription = null;

        delete rooms[this.roomName]; // TODO del?
    }
}

module.exports = {
    joinRoom: joinRoom,
    RoomSignaler: RoomSignaler
};
