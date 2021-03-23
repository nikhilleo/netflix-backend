const passport = require('passport');
const router = require('express').Router();

// Google Auth
router.get('/google', passport.authenticate("google", {
    scope: ['profile', 'email']
}));

// CallBack
router.get('/google/callback', passport.authenticate("google", {
    failureRedirect: "/",
}), (req, res) => {
    res.redirect("/")
});

// Logout
router.get('/logout', (req, res) => {
    req.logOut();
    req.session.destroy((err) => {})
    res.redirect("/");
});

module.exports = router;