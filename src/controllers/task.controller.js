const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const redisClient = require('../middlewares/cache.middleware');

const taskListKey = 'task_ids'; // Key for storing task IDs list

// Utility function to check if a task exists
const checkTaskExists = async (id) => {
    const cacheKey = `task_${id}`;

    // Check if task exists in Redis
    const cachedTask = await redisClient.get(cacheKey);
    if (cachedTask) {
        return JSON.parse(cachedTask);
    }

    // Check if task exists in the database
    const task = await prisma.task.findUnique({
        where: { id: parseInt(id) }
    });

    if (task) {
        // Cache the task for future requests
        await redisClient.set(cacheKey, JSON.stringify(task));
        return task;
    }

    return null; // Task not found
};

// Fetch a single task by ID (using query parameter)
const getTaskById = async (req, res) => {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ message: 'Task ID is required' });
    }

    // Check if the task exists
    const task = await checkTaskExists(id);
    if (!task) {
        return res.status(404).json({ message: 'Task not found' });
    }

    return res.json(task);
};

// Fetch all tasks
const getTasks = async (req, res) => {
    const cachedTaskIds = await redisClient.sendCommand(['LRANGE', taskListKey, '0', '-1']);
    const cachedTaskCount = cachedTaskIds.length;

    const taskCount = await prisma.task.count();

    if (cachedTaskCount === taskCount) {
        const tasks = [];
        for (const taskId of cachedTaskIds) {
            const cachedTask = await redisClient.get(`task_${taskId}`);
            if (cachedTask) {
                tasks.push(JSON.parse(cachedTask));
            }
        }
        return res.json(tasks);
    }

    const tasks = await prisma.task.findMany({ include: { comments: true } });

    await redisClient.sendCommand(['DEL', taskListKey]);
    for (const task of tasks) {
        await redisClient.set(`task_${task.id}`, JSON.stringify(task));
        await redisClient.sendCommand(['RPUSH', taskListKey, task.id.toString()]);
    }

    return res.json(tasks);
};

// Create a new task
const createTask = async (req, res) => {
    const { title, description } = req.body;

    const task = await prisma.task.create({
        data: { title, description }
    });

    const cacheKey = `task_${task.id}`;
    await redisClient.set(cacheKey, JSON.stringify(task));
    await redisClient.sendCommand(['RPUSH', taskListKey, task.id.toString()]);

    return res.status(201).json(task);
};

// Update a task by ID (using query parameter)
const updateTask = async (req, res) => {
    const { id } = req.query;
    const { title, description } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'Task ID is required' });
    }

    // Check if the task exists
    const task = await checkTaskExists(id);
    if (!task) {
        return res.status(404).json({ message: 'Task not found' });
    }

    const updatedTask = await prisma.task.update({
        where: { id: parseInt(id) },
        data: { title, description }
    });

    // Update the task in the cache
    const cacheKey = `task_${id}`;
    await redisClient.set(cacheKey, JSON.stringify(updatedTask));

    return res.json(updatedTask);
};

// Delete a task by ID (using query parameter)
const deleteTask = async (req, res) => {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ message: 'Task ID is required' });
    }

    // Check if the task exists
    const task = await checkTaskExists(id);
    if (!task) {
        return res.status(404).json({ message: 'Task not found' });
    }

    await prisma.task.delete({
        where: { id: parseInt(id) }
    });

    const cacheKey = `task_${id}`;
    // Remove task ID from task list and delete task from cache
    await redisClient.sendCommand(['LREM', taskListKey, '0', id.toString()]);
    await redisClient.del(cacheKey);

    return res.status(200).json({ message: 'Task deleted successfully' });
};

module.exports = { getTasks, getTaskById, createTask, updateTask, deleteTask, checkTaskExists };
