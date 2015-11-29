var Connector = require('./Connector');

class PageConnector extends Connector {
    constructor(config, extraEvents) {
        var myEvents = [
            'self user'
        ];
        super(config, myEvents.concat(extraEvents || []));
        var _this = this;

        this.socket.on('self user', function (user) {
            _this.emit('self user', user);
        })
    }

    useToken(token, callback) {
        this.socket.emit('token', token, callback);
    }
}

module.exports = PageConnector;
