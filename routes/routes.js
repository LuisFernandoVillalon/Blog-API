const express = require('express');
const router = express.Router();
const passport = require('passport');
const auth_controller = require('../controllers/authController');
const post_controller = require('../controllers/postController');
const comment_controller = require('../controllers/commentController');


router.get("/", function (req, res, next) {
    res.status(200).json('You reached the blog api');
});

//AUTH
router.post('/sign-up', auth_controller.sign_up_post);
router.post('/log-in', auth_controller.log_in_post);

//POST
router.get('/posts', post_controller.get_posts);
router.get('/posts/:postid', post_controller.get_post_detail);
router.post(
	'/posts',
	passport.authenticate('jwt', { session: false }),
	post_controller.create_post
);
router.delete(
	'/posts/:postid',
	passport.authenticate('jwt', { session: false }),
	post_controller.delete_post
);
router.put(
	'/posts/:postid',
	passport.authenticate('jwt', { session: false }),
	post_controller.update_post
);

//COMMENT
router.get(
	'/posts/:postid/comments',
	// passport.authenticate('jwt', { session: false }),
	comment_controller.get_comments
);
router.post('/posts/:postid/comments', comment_controller.create_comment);
router.delete(
	'/posts/:postid/comments/:commentid',
	passport.authenticate('jwt', { session: false }),
	comment_controller.delete_comment
);
router.put(
	'/posts/:postid/comments/:commentid',
	passport.authenticate('jwt', { session: false }),
	comment_controller.update_comment
);

module.exports = router;
