
var errors = require('../errors');
var ValidationError = errors.ValidationError;


function validateNewDisplayName(newDisplayName) {

    if (newDisplayName.length < 5) {
        throw new ValidationError('validate.displayName.under5characters', null, 'displayName')
    }

    if (newDisplayName.length > 20) {
        throw new ValidationError('validate.displayName.over20characters', null, 'displayName')
    }

    // I've been pretty strict about what a valid username can look like
    // I might change or remove it later, but it will do for now
    var match = newDisplayName.match(/[^a-zA-Z0-9_.]/g);
    if (match) {
        var matchUnique = new Array(new Set(match));
        throw new ValidationError('validate.displayName.invalidCharacters', matchUnique, 'displayName');
    }

    // The first character should be even more specific
    var matchFirst = newDisplayName.charAt(0).match(/[^a-zA-Z]/g);
    if (matchFirst) {
        throw new ValidationError('validate.displayName.invalidFirstCharacter', matchFirst, 'displayName');
    }
}

module.exports = {
    validateNewDisplayName: validateNewDisplayName
};
