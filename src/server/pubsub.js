var UniversalEvents = require('universalevents');

// TODO do this over redis

import User from './models/user';

var logger = require('../common/logger');

function safeCall(callback, err, val) {
    if (callback) {
        callback(err, val);
    }
}

class SubscribeInstance {
    constructor(parent, id, callback) {
        this.parent = parent;
        this.id = id;
        this.callback = callback;
        this.oldVal = null;
        this.closed = false;

        this.listener = function (obj) {
            this._gotValue(obj);
        }.bind(this);

        this.getAndSubscribeForChanges();
    }

    getAndSubscribeForChanges() {
        if (!this.closed) {
            this.parent.events.on(this.id, this.listener);
            this.parent.model.findOne({_id: this.id}, function (err, val) {
                if (err) {
                    safeCall(this.callback, err);
                } else {
                    this._gotValue(val);
                }
            }.bind(this));
        }
    }

    _gotValue(val) {
        if (!this.closed) {
            if (!this.oldVal || val.__v > this.oldVal.__v) {
                this.oldVal = val;
                safeCall(this.callback, null, val);
            }
        }
    }

    close() {
        this.parent.events.removeEventListener(this.id, this.listener);
        this.callback = null;
        this.parent = null;
        this.closed = true;
    }
}

class PubSub {
    constructor(model) {
        this.events = new UniversalEvents();
        this.model = model;
    }

    publish(obj) {
        var id = obj._id.toString();
        this.events.emit(id, obj);
    }

    subscribe(id, callback) {
        id = id.toString();
        return new SubscribeInstance(this, id, callback)
    }
}

module.exports = {
    user: new PubSub(User)
};
