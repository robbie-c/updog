var setFunctions = require('set-functions');
var RTCPeerConnection = require('rtcpeerconnection');

var logger = require('../../common/logger');

function shouldBeCaller(mySocketId, peerSocketId) {
    if (mySocketId == peerSocketId) {
        throw new Error('Identical Ids!');
    }
    return mySocketId > peerSocketId;
}

class Peer {
    /**
     *
     * @param {PeerManager} parentPeerManager
     * @param peerSocketId
     */
    constructor(parentPeerManager, peerSocketId) {

        this.parentPeerManager = parentPeerManager;
        this.peerSocketId = peerSocketId;

        this.isCaller = shouldBeCaller(parentPeerManager.parentChatManager.mySocketId, peerSocketId);
        logger.info('isCaller', this.isCaller);

        this.peerConnection = null;
        this.peerConnectionConfig = this.parentPeerManager.parentChatManager.peerConnectionConfig;

        this.streamPromise = this.parentPeerManager.awaitLocalStream();

        this.offerOptions = {
            mandatory: {
                OfferToReceiveAudio: true,
                OfferToReceiveVideo: this.parentPeerManager.parentChatManager.config.video
            }
        };

        this.started = false;
        this.hasRemoteStream = false;
    }

    start() {
        if (this.started) {
            return;
        }

        this.started = true;
        this._stateChanged();

        logger.info('peer config', this.peerConnectionConfig);
        this.peerConnection = new RTCPeerConnection(this.peerConnectionConfig, {
            optional: [
                {DtlsSrtpKeyAgreement: true},
                {RtpDataChannels: true}
            ]
        });
        var pc = this.peerConnection;

        pc.on('ice', function (candidate) {
            this.sendPeerMessage({
                type: 'ice',
                iceCandidate: candidate
            });
        }.bind(this));

        pc.on('addStream', function (evt) {
            logger.info('got remote stream', evt.stream);
            this.hasRemoteStream = true;
            this._stateChanged();
            this.parentPeerManager.addRemoteStream(evt.stream, this.peerSocketId);
        }.bind(this));

        pc.on('removeStream', function (evt) {
            logger.info('stream removed!', evt.stream);
        }.bind(this));

        pc.on('signalingStateChange', function () {
            logger.info('onsignalingstatechange event detected!', pc.signalingState);

            this._stateChanged();

            if (pc.signalingState === 'closed') {
                this.end();
                this.parentPeerManager.removeRemoteStream(this.peerSocketId);
            }
        }.bind(this));

        pc.on('iceConnectionStateChange', function () {
            logger.info('ice connection state:', pc.iceConnectionState);
            this._stateChanged();
        }.bind(this));

        if (this.isCaller) {
            logger.info('await local media for peer', this.peerSocketId);
            this.streamPromise.then(function (stream) {
                logger.info('got local media for peer', stream);
                pc.addStream(stream);
                pc.offer(this.offerOptions, function (err, offer) {
                    if (err) {
                        logger.info('failed to create offer', err);
                    } else {
                        this._sendOffer(offer);
                    }
                }.bind(this));
            }.bind(this));
        }
    }

    end() {
        logger.info('ending connection to', this.peerSocketId);
        if (this.peerConnection && this.peerConnection.signalingState !== 'closed') {
            this.peerConnection.close();
        }
    }

    _receiveIce(message) {
        var candidate = message.iceCandidate;
        var pc = this.peerConnection;
        logger.info('remote ice', candidate);

        if (message.iceCandidate) {
            pc.processIce(message.iceCandidate);
        }
    }

    _receiveOffer(message) {
        var offer = message.offer;
        var pc = this.peerConnection;

        logger.info('got offer', offer);

        pc.handleOffer(offer, function(err) {
            if (err) {
                logger.error(err);
            } else {
                logger.info('awaiting local media to reply to peer', this.peerSocketId);
                this.streamPromise.then((stream) => {
                    logger.info('got local media for peer', stream);
                    pc.addStream(stream);
                    pc.answer(this.offerOptions, function (err, answer) {
                        if (err) {
                            logger.info('error in creating answer', err);
                        } else {
                            this._sendAnswer(answer);
                        }
                    }.bind(this));
                });
            }
        }.bind(this));
    }

    _receiveAnswer(message) {
        var answer = message.answer;
        var pc = this.peerConnection;

        logger.info('got answer', answer);
        pc.handleAnswer(answer);
    }

    _sendIce(candidate) {
        this.sendPeerMessage({
            type: 'ice',
            iceCandidate: candidate
        })
    }

    _sendOffer(offer) {
        this.sendPeerMessage({
            type: 'offer',
            offer: offer
        });
    }

    _sendAnswer(answer) {
        this.sendPeerMessage({
            type: 'answer',
            answer: answer
        })
    }

    receivePeerMessage(peerMessage) {
        switch (peerMessage.type) {
            case 'ice':
                this._receiveIce(peerMessage);
                break;
            case 'offer':
                this._receiveOffer(peerMessage);
                break;
            case 'answer':
                this._receiveAnswer(peerMessage);
                break;
        }
    }

    sendPeerMessage(peerMessage) {
        this.parentPeerManager.sendMessage({
            to: this.peerSocketId,
            content: peerMessage
        })
    }

    getState() {
        var pc = this.peerConnection;
        if (!this.started) {
            return 'Not started';
        } else {
            var s = this.isCaller ? "(Caller)" : "(Callee)";
            if (pc) {
                s += " signaling: " + pc.signalingState + ", ice: " + pc.iceConnectionState;
            }
            return s;
        }
    }

    _stateChanged() {
        this.parentPeerManager.stateChanged();
    }

}

export default class PeerManager {
    /**
     *
     * @param {ChatManager} parentChatManager
     */
    constructor(parentChatManager) {
        this.parentChatManager = parentChatManager;
        this.peers = {};
        this.participants = {};
    }

    updateParticipants(newParticipants) {

        var oldParticipantIds = new Set(Object.keys(this.participants));
        var newParticipantIds = new Set(Object.keys(newParticipants));

        // remove ourself from the list of new participants
        if (this.parentChatManager.mySocketId) {
            newParticipantIds.delete(this.parentChatManager.mySocketId);
        }

        var addedParticipantIds = setFunctions.subtract(newParticipantIds, oldParticipantIds);
        var removedParticipantIds = setFunctions.subtract(oldParticipantIds, newParticipantIds);

        var addedParticipants = {};
        addedParticipantIds.forEach(function (participantId) {
            addedParticipants[participantId] = newParticipantIds[participantId];
        });
        var removedParticipants = {};
        removedParticipantIds.forEach(function (participantId) {
            removedParticipants[participantId] = removedParticipantIds[participantId];
        });

        this.handleAddedParticipants(addedParticipants);
        this.handleRemovedParticipants(removedParticipants);

        this.participants = newParticipants;

        logger.info('updated participants', this.participants);
    }

    sendMessage(message) {
        this.parentChatManager.sendWebRTCPeerMessage(message);
    }

    receiveMessage(message) {
        if (message && message.from) {
            var peer = this.peers[message.from];
            if (peer) {
                peer.receivePeerMessage(message.content);
            } else {
                logger.info('could not find peer', message.from, this.peers);
            }
        }
    }

    handleAddedParticipants(addedParticipants) {
        logger.info('handle added participants');
        for (var peerId in addedParticipants) {
            if (addedParticipants.hasOwnProperty(peerId)) {
                logger.info('new peer', peerId);
                var peer = new Peer(this, peerId);
                this.peers[peerId] = peer;
                peer.start();
            }
        }
    }

    handleRemovedParticipants(removedParticipants) {
        logger.info('handle removed participants');
        for (var peerSocketId in removedParticipants) {
            if (removedParticipants.hasOwnProperty(peerSocketId)) {
                logger.info('remove peer', peerSocketId);
                var peer = this.peers[peerSocketId];
                if (peer) {
                    peer.end();
                    delete this.peers[peerSocketId];
                }
            }
        }
    }

    awaitLocalStream() {
        return this.parentChatManager.awaitLocalStream();
    }

    addRemoteStream(stream, peerSocketId) {
        this.parentChatManager.addRemoteStream(stream, peerSocketId);
    }

    removeRemoteStream(peerSocketId) {
        this.parentChatManager.removeRemoteStream(peerSocketId);
    }

    stateChanged() {
        this.parentChatManager.peerStateChanged()
    }

    getState() {
        var state = {};
        for (var peerSocketId in this.peers) {
            if (this.peers.hasOwnProperty(peerSocketId)) {
                state[peerSocketId] = this.peers[peerSocketId].getState();
            }
        }
        return state;
    }
}




