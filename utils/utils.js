const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const { validationResult } = require('express-validator');
const ObjectId = require('mongoose').Types.ObjectId;
require('dotenv').config();

//Check is a string is a valid id used in mongoose.
function isObjectIdValid(id) {
    return ObjectId.isValid(id)
        ? String(new ObjectId(id) == id)
            ? true
            : false
        : false; 
}

function checkValidationErrors(req, res, message) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const validationErrors = errors.array().map((e) => {
            return e.msg;
        })
        throw {
            message,
            errors: validationErrors
        };
    }
}

async function checkUserExists(username) {
	try {
		const isUserInDB = await User.find({ username });
		if (isUserInDB.length > 0) {
			return true;
		}

		return false;
	} catch (err) {
		throw {
			message: 'CHECK USER EXISTS: Error when checking for users exists',
			errors: [err.message]
		};
	}
}

async function generatePassword(userPassword) {
	try {
		const saltRounds = 10;
		const hashPassword = await bcrypt.hash(userPassword, saltRounds);

		return hashPassword;
	} catch (err) {
		throw {
			message: 'GENERATE PASSWORD: Error when trying to hash password',
			errors: [err.message]
		};
	}
}

async function checkValidPassword(foundUserPassword, inputPassword) {
	const match = await bcrypt.compare(inputPassword, foundUserPassword);
	return match ? true : false;
}

function issueJWT(user) {
	const _id = user._id;
	const expiresIn = '7d';
	const payload = {
		sub: _id,
		iat: Date.now()
	};
	const signedToken = jwt.sign(payload, process.env.SECRET_KEY, {
		expiresIn: expiresIn
	});

	return {
		token: `Bearer ${signedToken}`,
		expiresIn: expiresIn
	};
}

function checkDBOperationResult(
	res,
	dbResult,
	successMessage,
	errorMessage,
	key
) {
	if (dbResult === null || dbResult.length === 0) {
		throw {
			message: errorMessage,
			errors: [errorMessage]
		};
	} else {
		res.status(200).json({
			message: successMessage,
			[key]: dbResult
		});
	}
}

function checkIdExists(res, id, message, key) {
	if (isObjectIdValid(id) === false) {
		console.log('wrong id');
		throw {
			message,
			errors: [message]
		};
	} else {
		console.log('good id');
	}
}

module.exports = {
    isObjectIdValid,
    checkValidationErrors,
    checkUserExists,
    generatePassword,
    checkValidPassword,
    issueJWT,
    checkDBOperationResult,
    checkIdExists
}