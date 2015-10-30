var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var userValidation = require('../../common/validation/user');

var ValidationError = require('../../common/errors').ValidationError;

var userSchema = mongoose.Schema({
    displayName: String,
    local: {
        email: String,
        password: String
    },
    google: {
        id: String,
        token: String,
        email: String,
        name: String
    }
});

userSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.local.password);
};

userSchema.methods.isComplete = function () {
    // right now just make sure they have a displayName

    if (!this.displayName) {
        return false;
    }

    return true;
};

var User = mongoose.model('User', userSchema);

export default User;


export function completeProfile (user, data, callback) {
    if (user.displayName) {
        throw new ValidationError('user.alreadyHasDisplayName', user.displayName, 'displayName');
    }

    try {
        userValidation.validateNewDisplayName(data.displayName);
    } catch (e) {
        return callback(e);
    }

    user.displayName = data.displayName;

    user.save(function(err) {
        if (err) {
            callback(err);
        } else {
            callback(null, {
                isComplete: user.isComplete()
            })
        }
    });
}
