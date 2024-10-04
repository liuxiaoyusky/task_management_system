const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { validationResult } = require('express-validator');
const { checkTaskExists } = require('./task.controller'); // Import the checkTaskExists function

// Create a new comment for a task
const createComment = async (req, res) => {
    const {taskId } = req.query; // Use query parameters
    const { content } = req.query; // Pass content in query as well

    // Validate the input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Check if the task exists
        const task = await checkTaskExists(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Create the comment in the database
        const comment = await prisma.comment.create({
            data: {
                content,
                taskId: parseInt(taskId),
            },
        });

        return res.status(201).json(comment);
    } catch (error) {
        console.error('Error creating comment:', error);
        return res.status(500).json({ message: 'Error creating comment', error: error.message });
    }
};

// Get all comments for a specific task
const getCommentsByTask = async (req, res) => {
    const { taskId } = req.query;

    try {
        const task = await checkTaskExists(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const comments = await prisma.comment.findMany({
            where: { taskId: parseInt(taskId) },
        });

        return res.json(comments);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching comments', error });
    }
};

// Update a comment by ID
const updateComment = async (req, res) => {
    const { commentId, taskId } = req.query; // Use query parameters
    const { content } = req.query; // Pass content in query as well

    // Validate the input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const task = await checkTaskExists(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const comment = await prisma.comment.findUnique({
            where: { id: parseInt(commentId) },
        });

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const updatedComment = await prisma.comment.update({
            where: { id: parseInt(commentId) },
            data: { content },
        });

        return res.json(updatedComment);
    } catch (error) {
        return res.status(500).json({ message: 'Error updating comment', error });
    }
};

// Delete a comment by ID
const deleteComment = async (req, res) => {
    const { commentId, taskId } = req.query;

    try {
        const task = await checkTaskExists(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const comment = await prisma.comment.findUnique({
            where: { id: parseInt(commentId) },
        });

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        await prisma.comment.delete({
            where: { id: parseInt(commentId) },
        });

        return res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Error deleting comment', error });
    }
};

module.exports = { createComment, getCommentsByTask, updateComment, deleteComment };
