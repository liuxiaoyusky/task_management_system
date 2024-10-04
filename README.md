
# Task Management API

A task management API built with Node.js, Express, Prisma, MySQL, and Redis. The application can be run locally or in Docker.

## Table of Contents
- [Getting Started](#getting-started)
- [Running Locally](#running-locally)
- [Running in Docker](#running-in-docker)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Database Migrations](#database-migrations)
- [Testing](#testing)

## Getting Started

### Prerequisites

To run the app, ensure you have the following installed:

- Node.js (v14 or later)
- Docker (if running in Docker)
- Docker Compose (if running in Docker)
- MySQL (if running locally)

### Installation

1. Install the dependencies:

    ```bash
    npm install
    ```

### Environment Variables

You need to set up your environment variables for different environments (local and Docker). The environment variables are defined in `.env` files.

- `.env.local`: Used for local development.
- `.env.docker`: Used for running in Docker.

Example `.env.local`:
```env
PORT=3000
DATABASE_URL="mysql://root:rootpassword@localhost:3307/taskdb"
REDIS_URL="redis://localhost:6378"
```

Example `.env.docker`:
```env
PORT=3000
DATABASE_URL="mysql://root:rootpassword@mysql:3306/taskdb"
REDIS_URL="redis://redis:6379"
```

### Running Locally

1. Make sure MySQL and Redis are installed and running on your local machine. You can configure their respective ports in the `.env.local` file.

2. Apply Prisma migrations (if any):

    ```bash
    npx prisma migrate dev
    ```

3. Start the application:

    ```bash
    npm start
    ```

4. The server should now be running on `http://localhost:3000`.

### Running in Docker

1. Ensure Docker and Docker Compose are installed on your machine.

2. Build and start the Docker containers:

    ```bash
    docker-compose up --build
    ```

3. The API should now be running at `http://localhost:3000`.

4. You can verify that the containers are running with:

    ```bash
    docker ps
    ```

This should show the `api`, `mysql`, and `redis` containers running.

### Stopping the Docker Containers

To stop the running containers:

```bash
docker-compose down
```

### Database Migrations

When running migrations with Prisma in Docker:

1. Run the migration command inside the `api` container:

    ```bash
    docker-compose exec api npx prisma migrate deploy
    ```

### API Endpoints

#### Task Endpoints

| Method | Endpoint                            | Query Parameters               | Body Parameters                        | Description                          |
|--------|-------------------------------------|---------------------------------|----------------------------------------|--------------------------------------|
| GET    | `/task/tasks`                             | None                            | None                                   | Fetch all tasks                      |
| GET    | `/task`                             | `id` (required)                 | None                                   | Fetch a task by ID                   |
| POST   | `/task`                             | None                            | `title`, `description`                 | Create a new task                    |
| PUT    | `/task`                             | `id` (required)                 | `title`, `description`                 | Update a task by ID                  |
| DELETE | `/task`                             | `id` (required)                 | None                                   | Delete a task by ID                  |

### Comment Endpoints

| Method | Endpoint                            | Query Parameters               | Body Parameters                        | Description                          |
|--------|-------------------------------------|---------------------------------|----------------------------------------|--------------------------------------|
| POST   | `/comments`                         | `taskId` (required), `content`  | None                                   | Create a new comment for a task      |
| GET    | `/comments`                         | `taskId` (required)             | None                                   | Fetch all comments for a specific task |
| PUT    | `/comments`                         | `commentId` (required), `taskId` (required), `content` | None | Update a comment by ID               |
| DELETE | `/comments`                         | `commentId` (required), `taskId` (required) | None | Delete a comment by ID               |

### Endpoint Details

#### Task Endpoints

1. **Fetch All Tasks**
   - **Method**: `GET`
   - **URL**: `/task`
   - **Query Parameters**: None
   - **Response**:
      - `200`: Returns a list of tasks with their associated comments.
      - `500`: Server error.

2. **Fetch Task by ID**
   - **Method**: `GET`
   - **URL**: `/task`
   - **Query Parameters**:
      - `id` (required): The ID of the task to fetch.
   - **Response**:
      - `200`: Returns the task details.
      - `404`: Task not found.
      - `400`: Task ID is required.
      - `500`: Server error.

3. **Create a Task**
   - **Method**: `POST`
   - **URL**: `/task`
   - **Body Parameters**:
      - `title` (required): The title of the task.
      - `description` (required): The description of the task.
   - **Response**:
      - `201`: Task successfully created.
      - `500`: Server error.

4. **Update a Task**
   - **Method**: `PUT`
   - **URL**: `/task`
   - **Query Parameters**:
      - `id` (required): The ID of the task to update.
   - **Body Parameters**:
      - `title` (required): The updated title of the task.
      - `description` (required): The updated description of the task.
   - **Response**:
      - `200`: Task successfully updated.
      - `404`: Task not found.
      - `400`: Task ID is required.
      - `500`: Server error.

5. **Delete a Task**
   - **Method**: `DELETE`
   - **URL**: `/task`
   - **Query Parameters**:
      - `id` (required): The ID of the task to delete.
   - **Response**:
      - `200`: Task successfully deleted.
      - `404`: Task not found.
      - `400`: Task ID is required.
      - `500`: Server error.

#### Comment Endpoints

1. **Create a Comment**
   - **Method**: `POST`
   - **URL**: `/comments`
   - **Query Parameters**:
      - `taskId` (required): The ID of the task to add the comment to.
      - `content` (required): The content of the comment.
   - **Response**:
      - `201`: Comment successfully created.
      - `404`: Task not found.
      - `500`: Server error.

2. **Fetch Comments by Task**
   - **Method**: `GET`
   - **URL**: `/comments`
   - **Query Parameters**:
      - `taskId` (required): The ID of the task to fetch comments for.
   - **Response**:
      - `200`: Returns an array of comments.
      - `404`: Task not found.
      - `500`: Server error.

3. **Update a Comment**
   - **Method**: `PUT`
   - **URL**: `/comments`
   - **Query Parameters**:
      - `commentId` (required): The ID of the comment to update.
      - `taskId` (required): The ID of the task the comment belongs to.
      - `content` (required): The updated content of the comment.
   - **Response**:
      - `200`: Comment successfully updated.
      - `404`: Task or comment not found.
      - `500`: Server error.

4. **Delete a Comment**
   - **Method**: `DELETE`
   - **URL**: `/comments`
   - **Query Parameters**:
      - `commentId` (required): The ID of the comment to delete.
      - `taskId` (required): The ID of the task the comment belongs to.
   - **Response**:
      - `200`: Comment successfully deleted.
      - `404`: Task or comment not found.
      - `500`: Server error.

### Testing

To run the tests, use:

```bash
npm test
```
