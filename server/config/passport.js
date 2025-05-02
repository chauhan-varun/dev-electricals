const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
      scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user);
        }

        // Check if user exists with same email
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // Update existing user with Google info
          user.googleId = profile.id;
          user.authProvider = 'google';
          if (!user.profilePicture && profile.photos && profile.photos.length > 0) {
            user.profilePicture = profile.photos[0].value;
          }
          await user.save();
          return done(null, user);
        }

        // Create new user
        const newUser = new User({
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          profilePicture: profile.photos[0].value,
          authProvider: 'google'
        });

        await newUser.save();
        return done(null, newUser);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport;
