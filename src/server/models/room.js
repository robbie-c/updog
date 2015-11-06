var mongoose = require('mongoose');

var logger = require('../../common/logger');

var roomSchema = mongoose.Schema({
    _id: String,
    ownerUserId: mongoose.Schema.Types.ObjectId,
    claimedOn: Date,
    isPublic: Boolean,
    members: [
        {
            userId: mongoose.Schema.Types.ObjectId
        }
    ],
    settings: {
        video: Boolean
    }
});

roomSchema.methods.canBeAccessedByUser = function (user) {
    if (this.isPublic) {
        // anyone can access a public room
        return true;
    }
    if (user) {
        if (this.ownerUserId === user._id) {
            // the owner of a room can access it
            return true;
        }

        for (var i = 0; i < this.members.length; i++) {
            var memberEntry = this.members[i];
            if (memberEntry.userId === user._id) {
                // members of a room can access it
                return true;
            }
        }
    }

    return false;
};

roomSchema.statics.findOrCreateDefault = function (roomName) {
    return new Promise(function (resolve, reject) {
        var defaultRoom = new Room({
            _id: roomName,
            ownerUserId: null,
            claimedOn: null,
            isPublic: true,
            members: [],
            settings: {
                video: true
            }
        });
        defaultRoom.save(function (err, room) {
            if (err) {
                if (err.name === 'MongoError' && err.code === 11000) {
                    // room already exists, return it
                    Room.findOne({
                        _id: roomName
                    }, function (err, room) {
                        if (err) {
                            reject(err);
                        } else if (room) {
                            resolve(room);
                        } else {
                            // deleted after we tried to create, but before we tried to find
                            // start again from the beginning and hope deletions are rare
                            Room.findOrCreateDefault(roomName).then(resolve, reject);
                        }
                    });
                } else {
                    logger.error(err);
                    // other error
                    reject(err);
                }
            } else {
                resolve(room);
            }
        })
    });

};

var Room = mongoose.model('Room', roomSchema);

module.exports = Room;
