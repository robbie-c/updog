/* global RTCSessionDescription, RTCIceCandidate, RTCPeerConnection */

window.RTCSessionDescription = (
    window.RTCSessionDescription ||
    window.mozRTCSessionDescription ||
    window.webkitRTCSessionDescription
);

window.RTCIceCandidate = (
    window.RTCIceCandidate ||
    window.mozRTCIceCandidate ||
    window.webkitRTCIceCandidate
);

window.RTCPeerConnection = (
    window.RTCPeerConnection ||
    window.mozRTCPeerConnection ||
    window.webkitRTCPeerConnection
);

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

        this.hasAtLeastOneIce = false;
        this.hasSdp = false;
        this.hasMadeReply = false;

        this.streamPromise = this.parentPeerManager.awaitLocalStream();

        this.offerOptions = {
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
        }
    }

    start() {
        var self = this;

        console.log('peer config', this.peerConnectionConfig);
        this.peerConnection = new RTCPeerConnection(this.peerConnectionConfig);
        var pc = this.peerConnection;

        pc.onicecandidate = function (evt) {
            self.sendPeerMessage({
                iceCandidate: evt.candidate
            });
        };

        pc.onaddstream = function (evt) {
            console.log('got remote stream', evt.stream);
            self.parentPeerManager.addRemoteStream(evt.stream, self.peerSocketId);
        };

        pc.onremovestream = function (evt) {
            console.log('stream removed!', evt.stream);
        };

        pc.onsignalingstatechange = function () {
            console.log('onsignalingstatechange event detected!', pc.signalingState);

            if (pc.signalingState === 'closed') {
                self.end();
            }

            self.parentPeerManager.removeRemoteStream(self.peerSocketId);
        };

        if (this.isCaller) {
            this.streamPromise.then((stream) => {
                console.log('got local media for peer', stream);
                pc.addStream(stream);
                pc.createOffer(function (offer) {
                    console.log('created offer', offer);
                    pc.setLocalDescription(offer, function () {
                        self.sendPeerMessage({
                            sessionDescription: offer
                        })
                    });
                }, function (err) {
                    console.log('failed to create offer', err)
                }, self.offerOptions);
            });

        }
    }

    end() {
        console.log('ending connection to', this.peerSocketId);
        if (this.peerConnection && this.peerConnection.signalingState !== 'closed') {
            this.peerConnection.close();
        }
    }

    _receiveIceCandidateMessage(message) {
        console.log('ice');

        var candidate = new RTCIceCandidate(message.iceCandidate);
        this.peerConnection.addIceCandidate(candidate);
        this.hasAtLeastOneIce = true;

        if (!this.isCaller) {
            this._makeReplyIfReady()
        }
    }

    _receiveSessionDescriptionMessage(message) {
        var pc = this.peerConnection;

        console.log('got session description');
        var description = new RTCSessionDescription(message.sessionDescription);
        pc.setRemoteDescription(description);

        this.hasSdp = true;

        if (!this.isCaller) {
            this._makeReplyIfReady()
        }
    }

    _makeReplyIfReady() {
        var self = this;
        var pc = this.peerConnection;

        if (this.hasAtLeastOneIce && this.hasSdp) {
            if (!this.hasMadeReply) {
                this.hasMadeReply = true;
                this.streamPromise.then((stream) => {
                    console.log('got local media for peer', stream);
                    pc.addStream(stream);
                    pc.createAnswer(function (answer) {
                        console.log(pc.iceConnectionState, pc.iceGatheringState);
                        console.log('created answer', answer);
                        pc.setLocalDescription(answer, function () {
                            self.sendPeerMessage({
                                sessionDescription: answer
                            });
                        });
                    }, function (err) {
                        console.log('error in creating answer', err);
                    });
                });
            }
        }
    }

    receivePeerMessage(peerMessage) {
        if (peerMessage.iceCandidate) {
            this._receiveIceCandidateMessage(peerMessage);
        } else if (peerMessage.sessionDescription) {
            this._receiveSessionDescriptionMessage(peerMessage);
        }
    }

    sendPeerMessage(peerMessage) {
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

        console.log('updated participants', this.participants);
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
                console.log('could not find peer', message.from, this.peers);
            }
        }
    }

    handleAddedParticipants(addedParticipants) {
        console.log('handle added participants');
        for (var peerId in addedParticipants) {
            if (addedParticipants.hasOwnProperty(peerId)) {
                console.log('new peer', peerId);
                var peer = new Peer(this, peerId);
                this.peers[peerId] = peer;
                peer.start();
            }
        }
    }

    handleRemovedParticipants(removedParticipants) {
        console.log('handle removed participants');
        for (var peerSocketId in removedParticipants) {
            if (removedParticipants.hasOwnProperty(peerSocketId)) {
                console.log('remove peer', peerSocketId);
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
}




