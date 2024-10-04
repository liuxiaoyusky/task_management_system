require('dotenv').config({
    path: (() => {
        switch (process.env.NODE_ENV) {
            case 'docker':
                return '.env.docker';
            default:
                return '.env.local';
        }
    })()
});

const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL;
const REDIS_URL = process.env.REDIS_URL;



// Import your routes here
const taskRoutes = require('./routes/task.routes');
const commentRoutes = require('./routes/comment.routes');

// Middleware
app.use(express.json());

// Use the routes
app.use('/task', taskRoutes);
app.use('/comments', commentRoutes);

// Export the app for testing purposes
module.exports = app;

// Start the server if this file is being run directly
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Database URL: ${DATABASE_URL}`);
        console.log(`Redis URL: ${REDIS_URL}`);
    });
}
