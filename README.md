# Task Management Assignment
Welcome to the Task Management Assignment!

## Prerequisites
Before you begin, ensure you have met the following requirements:

- Node.js installed on your machine.
- npm (Node Package Manager) to install project dependencies.

In order to run the project, set up a `.env` file and include the `MONGO_URI` variable, equal to the database connection string. The default port is set to 8000.

## Features

1. **Create Task:**
   - Input includes title, description, and due_date with JWT authentication token.

2. **Create Subtask:**
   - Input is task_id.

3. **Get All User Tasks:**
   - With filters like priority, due date, and proper pagination.

4. **Get All User Subtasks:**
   - With filters like task_id if passed.

5. **Update Task:**
   - Due_date and status ("TODO" or "DONE") can be changed.

6. **Update Subtask:**
   - Status (0 or 1) can be updated.

7. **Delete Task:**
   - Soft deletion.

8. **Delete Subtask:**
   - Soft deletion.

Additional features include signup and signin using JWT authentication tokens.

## Cron Jobs

- **Change Priority of Task:**
  - Based on due_date of the task.

- **Voice Calling Using Twilio:**
  - Prioritized calling - users with priority 0, then 1, and finally 2.
