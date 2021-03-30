const passport = require('passport');
const router = require('express').Router();

router.get('/checkLogged', (req, res) => {
    console.log(req.user);
    if(req.user){
        res.send(req.user)
        res.status(401).send("Not Authorized");
    }
    else
    {
        res.send(req.user)
    }
});

// Google Auth
router.get('/google', passport.authenticate("google", {
    scope: ['profile', 'email']
}));

// CallBack
router.get('/google/callback', passport.authenticate("google", {
    failureRedirect: "/",
}), (req, res) => {
    res.redirect("http://localhost:3000/select_page")
});

// Logout
router.get('/logout', (req, res) => {
    req.logOut();
    req.session.destroy((err) => {})
    res.redirect("/");
});

module.exports = router;