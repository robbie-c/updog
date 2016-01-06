var React = require('react');

var NavBar = require('./../navBar/NavBar.jsx');

var async = require('async');

var logger = require('../../common/logger');

var RTCPeerConnection = require('rtcpeerconnection');

var PageConnector;
if (typeof window !== 'undefined') {
    PageConnector = require('../../client/connectors/PageConnector');
} else {
    PageConnector = function () {
    };
}

var TestPage = React.createClass({

    getInitialState: function () {
        return {
            user: this.props.initialUser,
            gotSrflxIce: false,
            gotRelayIce: false,
            gotIPv6Ice: false,
            endOfIceCandidates: false
        }
    },

    render: function () {
        return (
            <div className="topLevelContent">
                <NavBar connector={this.connector}
                        initialUser={this.props.initialUser}
                        title={this.props.title}/>
                <h1>Testing your ice...</h1>
                <ul>
                    <li>Srflx: {this.state.gotSrflxIce ? "yes" : this.state.endOfIceCandidates ? "no" : "waiting"}</li>
                    <li>Relay: {this.state.gotRelayIce ? "yes" : this.state.endOfIceCandidates ? "no" : "waiting"}</li>
                    <li>IPv6: {this.state.gotIPv6Ice ? "yes" : this.state.endOfIceCandidates ? "no" : "waiting"}</li>
                </ul>
            </div>
        );
    },

    componentWillMount: function () {
        this.connector = new PageConnector();
    },

    componentDidMount: function () {
        var pc = this.peerConnection = new RTCPeerConnection(this.props.peerConnectionConfig);
        pc.on('ice', this.onIceCandidate);
        pc.on('endOfCandidates', this.onEndOfIceCandidates);
        pc.offer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true
            },
            function(err, offer) {
                if (err) {
                    console.log(err);
                }
            }
        )

    },

    onIceCandidate: function(candidate) {
        if (this.peerConnection.hadLocalStunCandidate) {
            this.setState({gotSrflxIce: true});
        }
        if (this.peerConnection.hadLocalRelayCandidate) {
            this.setState({gotRelayIce: true});
        }
        if (this.peerConnection.hadLocalIPv6Candidate) {
            this.setState({gotIPv6Ice: true});
        }
    },

    onEndOfIceCandidates: function() {
        this.setState({
            endOfIceCandidates: true
        })
    }

});

module.exports = TestPage;
