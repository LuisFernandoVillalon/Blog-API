const Comment = require('../models/comment');
const Post = require('../models/post');
const utils = require('../utils/utils');
const { body } = require('express-validator');
const { checkValidationErrors, checkIdExists, checkDBOperationResult } = utils;

exports.get_comments = async function (req, res, next) {
	try {
		const { postid } = req.params;
		checkIdExists(
			res,
			postid,
			'GET COMMENTS: Post id not found',
			'comments'
		);

		const comments = await Comment.find({ post_ref: postid }).populate(
			'user_ref post_ref'
		);

		if (comments === null || comments.length === 0) {
			res.status(200).json({
				message: 'GET COMMENTS: No comments available for this post',
				comments
			});
		} else {
			res.status(200).json({
				message: 'GET COMMENTS: Comments retrieved successfully',
				comments
			});
		}
	} catch (err) {
		console.log(
			'GET COMMENTS: Error while trying to retrieve all comments for a post'
		);
		console.log(err);
		res.status(500).json({
			message:
				'GET COMMENTS: Error while trying to retrieve all comments for a post',
			error: err.message
		});
	}
};

exports.create_comment = [
	body('comment')
		.isLength({ min: 1 })
		.trim()
		.escape()
		.withMessage('Comment content cannot be empty'),
	body('user_ref')
		.isLength({ min: 1 })
		.trim()
		.escape()
		.withMessage('User ref cannot be empty'),
	async function (req, res, next) {
		try {
			console.log(req.body);
			const { comment, user_ref } = req.body;
			const { postid } = req.params;

			checkValidationErrors(
				req,
				res,
				'CREATE COMMENT: Error with fields'
			);
			checkIdExists(
				res,
				user_ref,
				'CREATE COMMENTS: User id not found',
				'comment'
			);
			checkIdExists(
				res,
				postid,
				'CREATE COMMENTS: Post id not found',
				'comment'
			);

			const postResult = await Post.findById(postid);
			if (postResult === null) {
				throw {
					message: 'CREATE COMMENT: Post id not found',
					errors: ['Cannot create a comment without a valid post id']
				};
			}

			const newComment = new Comment({
				timestamp: new Date(),
				comment: comment,
				user_ref: user_ref,
				post_ref: postid
			});

			await newComment.save();

			res.status(200).json({
				message: 'CREATE COMMENT: Comment created successfully',
				comment: newComment
			});
		} catch (err) {
			console.log(
				'CREATE COMMENT: Error while trying to create a comment'
			);
			console.log(err);
			res.status(500).json({
				message:
					'CREATE COMMENT: Error while trying to create a comment',
				errors: err.errors
			});
		}
	}
];

exports.delete_comment = async function (req, res, next) {
	try {
		const { commentid } = req.params;

		checkIdExists(res, commentid, 'Comment id not found', 'comment');

		const deletedComment = await Comment.findByIdAndDelete(commentid);

		checkDBOperationResult(
			res,
			deletedComment,
			'Comment deleted successfully',
			'Comment id not found',
			'comment'
		);
	} catch (err) {
		console.log('DELETE COMMENT: Error while trying to delete a comment');
		console.log(err);
		res.status(500).json({
			message: 'DELETE COMMENT: Error while trying to delete a comment',
			errors: err.errors
		});
	}
};

exports.update_comment = [
	body('comment')
		.isLength({ min: 1 })
		.trim()
		.escape()
		.withMessage('Comment content cannot be empty'),
	// body('user_ref')
	// 	.isLength({ min: 1 })
	// 	.trim()
	// 	.escape()
	// 	.withMessage('User ref cannot be empty'),
	async function (req, res, next) {
		try {
			const { comment, user_ref } = req.body;
			const { postid, commentid } = req.params;
			console.log(user_ref._id)
			checkValidationErrors(
				req,
				res,
				'UPDATE COMMENT: Error with fields'
			);
			checkIdExists(
				res,
				user_ref._id,
				'UPDATE COMMENTS: User id not found',
				'comment'
			);
			checkIdExists(
				res,
				postid,
				'UPDATE COMMENTS: Post id not found',
				'comment'
			);

			const updatedComment = new Comment({
				timestamp: new Date(),
				comment,
				user_ref: user_ref._id,
				postid,
				_id: commentid
			});

			const postResult = await Post.findById(postid);
			if (postResult === null) {
				throw {
					message: 'UPDATE COMMENT: Post id not found',
					errors: ['Cannot update a comment without a valid post id']
				};
			}

			const commentResult = await Comment.findByIdAndUpdate(
				commentid,
				updatedComment
			);

			checkDBOperationResult(
				res,
				commentResult,
				'UPDATE COMMENT: Comment updated successfully',
				'UPDATE COMMENT: Could not find comment to udpate',
				'comment'
			);
		} catch (err) {
			console.log(
				'UPDATE COMMENT: Error while trying to update a comment'
			);
			console.log(err);
			res.status(500).json({
				message:
					'UPDATE COMMENT: Error while trying to update a comment',
				errors: err.errors
			});
		}
	}
];