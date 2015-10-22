
var WebRTCAdaptor = require('webrtc-adapter');

var setFunctions = require('set-functions');

function shouldBeCaller(mySocketId, peerSocketId) {
    if (mySocketId == peerSocketId) {
        throw new Error('Identical Ids!');
    }
    return (mySocketId > peerSocketId);
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
        console.log('isCaller', this.isCaller);

        this.peerConnection = null;
        this.peerConnectionConfig = this.parentPeerManager.parentChatManager.peerConnectionConfig;
    }

    start() {
        var self = this;

        console.log('peer config', this.peerConnectionConfig);
        this.peerConnection = new WebRTCAdaptor.RTCPeerConnection(this.peerConnectionConfig);
        var pc = this.peerConnection;

        pc.onicecandidate = function (evt) {
            self.sendPeerMessage({
                iceCandidate: evt.candidate
            });
        };
        pc.onaddstream = function (evt) {
            console.log('got remote stream', evt.stream);
            //self.parentPeerManager.addStream(evt.stream, self.peerSocketId);
        };

        if (this.isCaller) {
            this.parentPeerManager.awaitLocalStream()
                .then((stream) => {
                    pc.addStream(stream);
                    pc.createOffer(function(offer) {
                        console.log('created offer', offer);
                        pc.setLocalDescription(offer);
                        self.sendPeerMessage({
                            sessionDescription: offer
                        })
                    });
                });
        }
    }

    _receiveIceCandidateMessage(message) {
        console.log('got ice candidate');
        var candidate = new WebRTCAdaptor.RTCIceCandidate(message.iceCandidate);
        this.peerConnection.addIceCandidate(candidate);
    }

    _receiveSessionDescriptionMessage(message) {
        var self = this;
        var pc = this.peerConnection;

        console.log('got session description');
        var description = new WebRTCAdaptor.RTCSessionDescription(message.sessionDescription);
        pc.setRemoteDescription(description);

        this.parentPeerManager.awaitLocalStream()
            .then((stream) => {
                pc.addStream(stream);
                pc.createAnswer(function(offer) {
                    console.log('created answer', offer);
                    pc.setLocalDescription(offer);
                    self.sendPeerMessage({
                        sessionDescription: offer
                    })
                });
            });
    }

    receivePeerMessage(peerMessage) {
        console.log('receive', peerMessage);
        if (peerMessage.iceCandidate) {
            this._receiveIceCandidateMessage(peerMessage);
        } else if (peerMessage.sessionDescription) {
            this._receiveSessionDescriptionMessage(peerMessage);
        }
    }

    sendPeerMessage(peerMessage) {
        console.log('send', peerMessage);
        this.parentPeerManager.sendMessage({
            to: this.peerSocketId,
            content: peerMessage
        })
    }

}

export default class PeerManager {
    /**
     *
     * @param {ChatManager} parentChatManager
     */
    constructor (parentChatManager) {
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

        console.log([...oldParticipantIds]);
        console.log([...newParticipantIds]);

        var addedParticipantIds = setFunctions.subtract(newParticipantIds, oldParticipantIds);
        var removedParticipantIds = setFunctions.subtract(oldParticipantIds, newParticipantIds);

        var addedParticipants = {};
        addedParticipantIds.forEach(function(participantId) {
            addedParticipants[participantId] = newParticipantIds[participantId];
        });
        var removedParticipants = {};
        removedParticipantIds.forEach(function(participantId) {
            removedParticipants[participantId] = removedParticipantIds[participantId];
        });

        this.handleAddedParticipants(addedParticipants);

    }

    sendMessage(message) {
        this.parentChatManager.sendWebRTCPeerMessage(message);
    }

    receiveMessage(message) {
        console.log('got message from peer', message);
        if (message && message.from) {
            var peer = this.peers[message.from];
            if (peer) {
                peer.receivePeerMessage(message.content);
            } else {
                console.log('could not find peer', message.from, this.peers);
            }
        }
    }

    handleAddedParticipants(addedParticipants) {
        console.log('handle added participants');
        for (var peerId in addedParticipants) {
            if( addedParticipants.hasOwnProperty( peerId ) ) {
                console.log('new peer', peerId);
                var peer = new Peer(this, peerId);
                this.peers[peerId] = peer;
                peer.start();
            }
        }
    }

    awaitLocalStream() {
        return this.parentChatManager.awaitLocalStream();
    }
}




