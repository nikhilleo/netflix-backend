
require("dotenv").config();
const GoogleStratergy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
var method = '';

// module.exports = function (passport) {
//     console.log("IN CONTROLLER");
//     console.log(passport);
//     passport.use(new GoogleStratergy({
//         clientID: process.env.GOOGLE_CLIENT_ID,
//         clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//         callbackURL: "/auth/google/callback"
//     }, async (accessToken, refreshToken, profile, done) => {
//         console.log(profile);
//         const newUser = {
//             googleId: profile.id,
//             displayName: profile.displayName,
//             firstName: profile.name.givenName,
//             lastName: profile.name.familyName,
//             image: profile.photos[0].value
//         }
//         console.log(newUser);
//         try {
//             let user = await User.findOne({
//                 googleId: profile.id
//             });
//             if (user) {
//                 done(null, user);
//             } else {
//                 user1 = await new User(newUser);
//                 await user1.save();
//                 done(null, user1)
//             }
//             method = "google";
//         } catch (error) {
//             console.log(error);
//             console.log(error);
//         }
//     }))

module.exports = function (passport) {
    passport.use(new GoogleStratergy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback"
    }, async (accessToken, refreshToken, profile, done) => {
        // console.log(profile);
        const newUser = {
            googleId: profile.id,
            displayName: profile.displayName,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            image: profile.photos[0].value
        }
        // console.log(newUser);
        try {
            let user = await User.findOne({
                googleId: profile.id
            });
            if (user) {
                console.log("USER ALREADY FOUND")
                done(null, user);
            } else {
                user1 = await new User(newUser);
                await user1.save();
                done(null, user1)
            }
            method = "google";
        } catch (error) {
            console.log(error);
        }
    }))


    passport.serializeUser((user, done) => {
        console.log("In Serialize:", user);
        done(null, user._id);
    });

    passport.deserializeUser((id, done) => {
        switch (method) {
            case "google":
                User.findById(id, (err, user) => done(err, user));
                break;
            default:
                done(null,null);
                break;
        }
    });
}