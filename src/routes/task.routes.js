const express = require('express');
const { check, validationResult } = require('express-validator');
const { getTasks, getTaskById, createTask, updateTask, deleteTask } = require('../controllers/task.controller');

const router = express.Router();

// Get tasks route
router.get('/tasks', getTasks);

// Get a single task by ID
router.get('/', getTaskById);

// Create task route with validation
router.post(
    '/',
    [
        check('title', 'Title is required').not().isEmpty(),
        check('description', 'Description is required').not().isEmpty(),
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    createTask
);

// Update task by ID
router.put(
    '/',
    [
        check('title', 'Title is required').not().isEmpty(),
        check('description', 'Description is required').not().isEmpty(),
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    updateTask
);

// Delete task by ID
router.delete('/', deleteTask);

module.exports = router;
