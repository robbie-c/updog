module.exports.getRoomNameFromURL = function getRoomNameFromURL(pathname) {
    if (!pathname) {
        pathname = window.location.pathname
    }
    var components = pathname.split('/');
    return components[components.length - 1];
};
