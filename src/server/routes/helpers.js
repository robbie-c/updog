function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        if (!req.user.displayName && req.url != '/completeprofile') {
            // user needs to finish off their profile
            console.log('user needs to complete profile');
            return res.redirect('/completeprofile');
        } else {
            // logged in, do whatever we wanted to do
            console.log('user profile already completed');
            return next();
        }
    } else {
        // not logged in, go to home page
        // TODO think about which page to redirect to
        res.redirect('/');
    }
}

module.exports = {
    isLoggedIn: isLoggedIn
};
