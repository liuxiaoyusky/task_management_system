const request = require('supertest');
const app = require('../src/server'); // Adjust path as needed
const { prisma } = require('@prisma/client'); // Adjust path as needed
const redisClient = require('../src/middlewares/cache.middleware'); // Adjust path as needed

describe('Comment API Endpoints', () => {
    let taskId;
    let commentId;

    // Mock Redis functions
    beforeAll(async () => {
        await redisClient.sendCommand(['FLUSHALL']); // Flush all Redis data before tests

        // Create a task first to attach comments to
        const taskResponse = await request(app)
            .post('/task')
            .send({
                title: 'Task for Comments',
                description: 'This task is for comment testing'
            });

        taskId = taskResponse.body.id;
    });

    afterAll(async () => {
        await redisClient.sendCommand(['FLUSHALL']); // Clean up after all tests
        await redisClient.quit(); // Disconnect Redis after tests
    });

    // Test for creating a comment
    it('should create a new comment', async () => {
        const response = await request(app)
            .post('/comments')  // Update path here
            .query({
                taskId: taskId,
                content: 'This is a test comment'
            });

        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('id');
        commentId = response.body.id; // Save the comment ID for later use
    });

    // Test for fetching all comments by taskId
    it('should fetch all comments for a task', async () => {
        const response = await request(app)
            .get('/comments')  // Update path here
            .query({ taskId: taskId });

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0]).toHaveProperty('content', 'This is a test comment');
    });

    // Test for updating the comment by commentId and taskId
    it('should update the comment', async () => {
        const updatedContent = 'Updated comment content';

        const response = await request(app)
            .put('/comments')  // Update path here
            .query({
                commentId: commentId,
                taskId: taskId,
                content: updatedContent
            });

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('content', updatedContent);
    });

    // Test for deleting the comment by commentId and taskId
    it('should delete the comment', async () => {
        const response = await request(app)
            .delete('/comments')  // Update path here
            .query({
                commentId: commentId,
                taskId: taskId
            });

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('message', 'Comment deleted successfully');
    });

    // Test for trying to fetch the deleted comment
    it('should return 404 when trying to fetch a deleted comment', async () => {
        const response = await request(app)
            .get('/comments')  // Update path here
            .query({
                taskId: taskId
            });

        expect(response.statusCode).toBe(200); // Comment list returns empty but does not 404
        expect(response.body.length).toBe(0);
    });
});
