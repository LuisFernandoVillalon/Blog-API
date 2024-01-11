const User = require('../models/user');
const utils = require('../utils/utils');
const { body } = require('express-validator');
const {
    checkValidationErrors,
    checkUserExists,
    generatePassword,
    checkValidPassword,
    issueJWT
} = utils;

exports.sign_up_post = [
    body('username')
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body('email')
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body('password')
        .trim()
        .isLength({ min: 1 })
        .escape()
        .withMessage('Password must be at least 6 characters'),
    body('confirmPassword')
		.trim()
		.isLength({ min: 1 })
		.escape()
		.withMessage('Password must be at least 6 characters')
		.custom(async function (value, { req }) {
			// Use the custom method w/ a CB func to ensure that both passwords match, return an error if so
			if (value !== req.body.password) {
				throw new Error('Passwords must be the same');
			}

			return true;
		}),

    async function (req, res, next) {
        try {
            checkValidationErrors(req, res, 'SIGN UP: Error with fields');

            const { username, email, password } = req.body;
            
            if (await checkUserExists(username) || await checkUserExists(email) ) {
                console.log("username or email exists");
                throw {
                    message: "SIGN UP: Error when checking for username or email exists",
                    errors: ["Username or email already exists"]
                };
            }

            const hashPassword = await generatePassword(password);
            const newUser = new User({
                username: username, 
                email: email,
                password: hashPassword,
                admin_status: false
            });

            const newUserResult = await newUser.save();
            console.log("user does not exists");
            res.status(200).json({
                user: newUserResult
            });
        } catch (err) {
            console.log('SIGN UP: Error while trying to save new user in db');
			console.log(err);
			res.status(500).json({
				message: 'SIGN UP: Error while trying to save new user in db',
				errors: err.errors
			});
        }
    }
]

exports.log_in_post = async function (req, res, next) {
	try {
		const { email, password } = req.body;
        console.log(email);
		const foundUser = await User.findOne({ email });

		if (!foundUser) {
			throw {
				message: 'LOG IN: Error while trying to log in user',
				errors: ['Cannot find user']
			};
		}

		if (await checkValidPassword(foundUser.password, password)) {
			const { token, expiresIn } = issueJWT(foundUser);

			res.status(200).json({
				token: token,
				expiresIn: expiresIn,
				user: foundUser
			});
		} else {
			throw {
				message: 'LOG IN: Error while trying to log in user',
				errors: ['Entered wrong password']
			};
		}
	} catch (err) {
		console.log('LOG IN: Error while trying to log in user');
		console.log(err);
		res.status(500).json({
			message: 'LOG IN: Error while trying to log in user',
			errors: err.errors
		});
	}
};
