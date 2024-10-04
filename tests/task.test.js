const request = require('supertest');
const app = require('../src/server'); // Assuming this is the entry point to your Express app
const { prisma } = require('@prisma/client'); // Adjust path to prisma client
const redisClient = require('../src/middlewares/cache.middleware'); // Adjust the path to your Redis client

describe('Task API Endpoints', () => {
    let taskId; // We will create a task and use its id for subsequent tests

    // Mock Redis functions
    beforeAll(async () => {
        await redisClient.sendCommand(['FLUSHALL']); // Flush all Redis data before tests
    });

    afterAll(async () => {
        await redisClient.sendCommand(['FLUSHALL']); // Clean up after all tests
        await redisClient.quit(); // Disconnect Redis after tests
    });

    // Test for creating a task
    it('should create a new task', async () => {
        const response = await request(app)
            .post('/task')
            .send({
                title: 'Test Task',
                description: 'This is a test task'
            });

        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('id');
        taskId = response.body.id; // Save task ID for later use
    });

    // Test for getting the newly created task by query parameter
    it('should fetch the created task', async () => {
        const response = await request(app)
            .get('/task')
            .query({ id: taskId }); // Pass the task ID as a query parameter

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('id', taskId);
        expect(response.body).toHaveProperty('title', 'Test Task');
        expect(response.body).toHaveProperty('description', 'This is a test task');
    });

    // Test for updating the task by query parameter
    it('should update the task', async () => {
        const updatedData = {
            title: 'Updated Task Title',
            description: 'Updated task description'
        };

        const response = await request(app)
            .put('/task')
            .query({ id: taskId }) // Pass the task ID as a query parameter
            .send(updatedData);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('title', updatedData.title);
        expect(response.body).toHaveProperty('description', updatedData.description);
    });

    // Test for deleting the task by query parameter
    it('should delete the task', async () => {
        const response = await request(app)
            .delete('/task')
            .query({ id: taskId }); // Pass the task ID as a query parameter

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('message', 'Task deleted successfully');
    });

    // Test for trying to delete a non-existing task
    it('should return 404 when trying to delete a non-existing task', async () => {
        const response = await request(app)
            .delete('/task')
            .query({ id: taskId }); // Try to delete the task again

        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty('message', 'Task not found');
    });

    // Test for trying to fetch the deleted task
    it('should return 404 when trying to fetch a deleted task', async () => {
        const response = await request(app)
            .get('/task')
            .query({ id: taskId }); // Try to fetch the deleted task

        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty('message', 'Task not found');
    });
});
