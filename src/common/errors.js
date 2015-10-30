var httpStatus = require('http-status');


function deserializeError(rawError) {
    if (rawError.type) {
        var errorClass = registry[rawError.type];
        if (errorClass && errorClass.deserialize) {
            return errorClass.deserialize(rawError);
        }
    }
    var err = new Error(rawError.message);
    for (var key in rawError) {
        if (key !== 'message') {
            if (rawError.hasOwnProperty(key)) {
                err[key] = rawError[key];
            }
        }
    }
    return err;
}

function serializeError(errorObj) {

    console.log(errorObj);

    if (errorObj.isBrowserVisible && errorObj.serialize) {
        return errorObj.serialize();
    }

    var error = {};

    if (errorObj.isBrowserVisible) {
        error.type = errorObj.__proto__.name;
        error.message = errorObj.message;
    } else {
        error.type = 'Error';
    }

    error.status = errorObj.status || httpStatus.INTERNAL_SERVER_ERROR;

    if (!error.message) {
        error.message = httpStatus[error.status];
    }

    return error;
}

class BaseError extends Error {
    constructor(message) {
        super();

        if (Error.hasOwnProperty('captureStackTrace'))
            Error.captureStackTrace(this, this.constructor);
        else
            Object.defineProperty(this, 'stack', {
                value: (new Error()).stack
            });

        Object.defineProperty(this, 'message', {
            value: message
        });

        this.isBrowserVisible = false;
        this.isUserVisible = false;
    }
}

class BrowserError extends BaseError {
    constructor(message) {
        super(message);

        this.isBrowserVisible = true;
        this.isUserVisible = false;
    }
}

class UserError extends BrowserError {
    constructor(message) {
        super(message);

        this.isBrowserVisible = true;
        this.isUserVisible = true;

        function i18nMessage() {
            throw new BaseError('i18nMessage not implemented!')
        }
    }
}

class ValidationError extends UserError {
    constructor(i18nKey, i18nData, what) {
        super('Validation Error: ' + i18nKey + ', ' + i18nData);

        this.i18nKey = i18nKey;
        this.i18nData = i18nData;
        this.what = what;
    }

    i18nMessage(t) {
        // TODO
        return 'Validation Error: ' + this.i18nKey + ', ' + this.i18nData;
    }

    serialize() {
        return {
            type: this.constructor.name,
            i18nKey: this.i18nKey,
            i18nData: this.i18nData,
            what: this.what
        };
    }

    static deserialize(errorRaw) {
        return new ValidationError(errorRaw.i18nKey, errorRaw.i18nData, errorRaw.what);
    }
}

var registry = {};

function addToRegistry(errorClass) {
    registry[errorClass.name] = errorClass;
}

[
    ValidationError
].forEach(addToRegistry);

module.exports = {
    deserializeError: deserializeError,
    serializeError: serializeError,
    addToRegistry: addToRegistry,
    ErrorBase: BaseError,
    BrowserError: BrowserError,
    UserError: UserError,
    ValidationError: ValidationError
};
