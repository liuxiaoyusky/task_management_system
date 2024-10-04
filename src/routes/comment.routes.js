const express = require('express');
const { check } = require('express-validator');
const { createComment, getCommentsByTask, updateComment, deleteComment } = require('../controllers/comment.controller');

const router = express.Router();

// Create a comment (taskId and content are in the query parameters)
router.post(
    '/',
    [
        check('taskId').isInt().withMessage('Task ID must be an integer'),
        check('content', 'Content is required').not().isEmpty(),
    ],
    createComment
);

// Get comments by task ID (using query parameters)
router.get(
    '/',
    [
        check('taskId').isInt().withMessage('Task ID must be an integer'),
    ],
    getCommentsByTask
);

// Update a comment (using query parameters)
router.put(
    '/',
    [
        check('taskId').isInt().withMessage('Task ID must be an integer'),
        check('commentId').isInt().withMessage('Comment ID must be an integer'),
        check('content', 'Content is required').not().isEmpty(),
    ],
    updateComment
);

// Delete a comment (using query parameters)
router.delete(
    '/',
    [
        check('taskId').isInt().withMessage('Task ID must be an integer'),
        check('commentId').isInt().withMessage('Comment ID must be an integer'),
    ],
    deleteComment
);

module.exports = router;
