const passport = require('passport');
const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
require('dotenv').config();
const User = require('../models/user');

passport.use(
	new JWTStrategy(
		{
			jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
			secretOrKey: process.env.SECRET_KEY
		},
		async function (jwtPayload, done) {
			try {
				const user = await User.findById(jwtPayload.sub);
				console.log('PASSPORT JWT STRATEGY: What is User');
				console.log(user);
				return done(null, user);
			} catch (err) {
				console.log(
					'PASSPORT JWT STRATEGY: Error when verifying token'
				);
				return done(null, false);
			}
		}
	)
);