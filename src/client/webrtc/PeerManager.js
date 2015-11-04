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

var logger = require('../../common/logger');

var setFunctions = require('set-functions');

function shouldBeCaller(mySocketId, peerSocketId) {
    if (mySocketId == peerSocketId) {
        throw new Error('Identical Ids!');
    }
    var isCaller = (mySocketId > peerSocketId);
    logger.log('me', mySocketId, 'peer', peerSocketId, 'isCaller', isCaller);
    return isCaller;

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
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
        };

        this.started = false;
        this.hasLocalDescription = false;
        this.hasRemoteDescription = false;
        this.hasAtLeastOneIce = false;
        this.startedMakingAnswer = false;
        this.hasMadeAnswer = false;
        this.hasRemoteStream = false;
    }

    start() {
        if (this.started) {
            return;
        }

        var self = this;

        this.started = true;
        this._stateChanged();

        logger.info('peer config', this.peerConnectionConfig);
        this.peerConnection = new RTCPeerConnection(this.peerConnectionConfig);
        var pc = this.peerConnection;

        pc.onicecandidate = function (evt) {
            self.sendPeerMessage({
                iceCandidate: evt.candidate
            });
        };

        pc.onaddstream = function (evt) {
            logger.info('got remote stream', evt.stream);
            self.hasRemoteStream = true;
            self._stateChanged();
            self.parentPeerManager.addRemoteStream(evt.stream, self.peerSocketId);
        };

        pc.onremovestream = function (evt) {
            logger.info('stream removed!', evt.stream);
        };

        pc.onsignalingstatechange = function () {
            logger.info('onsignalingstatechange event detected!', pc.signalingState);

            if (pc.signalingState === 'closed') {
                self.end();
                self.parentPeerManager.removeRemoteStream(self.peerSocketId);
            }
        };

        if (this.isCaller) {
            logger.info('await local media for peer', this.peerSocketId);
            this.streamPromise.then((stream) => {
                logger.info('got local media for peer', stream);
                pc.addStream(stream);
                pc.createOffer(function (offer) {
                    self._gotLocalDescription(offer);
                }, function (err) {
                    logger.info('failed to create offer', err)
                }, self.offerOptions);
            });
        }
    }

    end() {
        logger.info('ending connection to', this.peerSocketId);
        if (this.peerConnection && this.peerConnection.signalingState !== 'closed') {
            this.peerConnection.close();
        }
    }

    _receiveIceCandidateMessage(message) {
        logger.info('ice');

        var candidate = new RTCIceCandidate(message.iceCandidate);
        this.peerConnection.addIceCandidate(candidate);

        this.hasAtLeastOneIce = true;

        if (!this.isCaller) {
            this._makeReplyIfReady()
        }
    }

    _receiveSessionDescriptionMessage(message) {
        var pc = this.peerConnection;

        logger.info('got session description');
        var description = new RTCSessionDescription(message.sessionDescription);
        pc.setRemoteDescription(description);

        this.hasRemoteDescription = true;
        this._stateChanged();

        if (!this.isCaller) {
            this._makeReplyIfReady()
        }
    }

    _makeReplyIfReady() {
        var self = this;
        var pc = this.peerConnection;

        if (this.hasRemoteDescription) {
            if (!this.startedMakingAnswer) {
                this.startedMakingAnswer = true;
                logger.info('awaiting local media to reply to peer', this.peerSocketId);
                this.streamPromise.then((stream) => {
                    logger.info('got local media for peer', stream);
                    pc.addStream(stream);
                    pc.createAnswer(function (answer) {
                        self._gotLocalDescription(answer);
                    }, function (err) {
                        logger.info('error in creating answer', err);
                    });
                });
            }
        }
    }

    _gotLocalDescription(description) {
        var self = this;
        var pc = this.peerConnection;

        logger.info('got local description', description);

        this.hasLocalDescription = true;
        this._stateChanged();

        pc.setLocalDescription(description, function () {
            self.sendPeerMessage({
                sessionDescription: description
            });
        }, function () {
            logger.info('set local description failed')

        });
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

    getState() {
        if (!this.started) {
            return 'Not started';
        } else if (this.isCaller && !this.hasLocalDescription) {
            return "(Caller) Waiting to generate local description to send"
        } else if (this.isCaller && this.hasLocalDescription && !this.hasRemoteDescription) {
            return "(Caller) Sent offer, waiting for answer"
        } else if (this.isCaller && this.hasLocalDescription && this.hasRemoteDescription && !this.hasRemoteStream) {
            return "(Caller) Sent offer, got answer, waiting for stream"
        } else if (this.isCaller && this.hasLocalDescription && this.hasRemoteDescription && this.hasRemoteStream) {
            return "(Caller) Has remote stream"
        } else if (!this.isCaller && !this.hasRemoteDescription) {
            return "(Callee) Waiting for offer"
        } else if (!this.isCaller && this.hasRemoteDescription && !this.hasLocalDescription) {
            return "(Callee) Has offer, waiting to create answer"
        } else if (!this.isCaller && this.hasRemoteDescription && this.hasLocalDescription && !this.hasRemoteStream) {
            return "(Callee) Has offer, sent answer, waiting for stream"
        } else if (!this.isCaller && this.hasRemoteDescription && this.hasLocalDescription && this.hasRemoteStream) {
            return "(Callee) Has remote stream"
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




