const {Task, SubTask} = require('../models/task');
async function generateUniqueNumericTaskId() {
    try {
      const highestTask = await Task.findOne({}, {}, { sort: { id: -1 } });
      const nextId = highestTask ? highestTask.id + 1 : 1;
      return nextId;
    } catch (error) {
      console.error('Error generating unique numeric Task ID:', error);
      throw error;
    }
  }
  
  async function generateUniqueNumericSubTaskId(taskId) {
    try {
      const highestSubTask = await SubTask.findOne({task_id:taskId}, {}, { sort: { id: -1 } });
      
      const nextId = highestSubTask ? highestSubTask.id + 1 : 1;
      console.log("uniqueID:",nextId);
      return nextId;
    } catch (error) {
      console.error('Error generating unique numeric SubTask ID:', error);
      throw error;
    }
  }

  function calculatePriority(dueDate) {
    // Check if dueDate is provided
    if (!dueDate) {
      // Default priority if dueDate is not provided
      return 0;
    }
  
    // Calculate the remaining days until the due date
    const currentDate = new Date();
    const dueDateTime = new Date(dueDate);
    const timeDifference = dueDateTime - currentDate;
    const remainingDays = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
  
    // Implement your priority logic based on the remaining days
    // Example: If due date is within 3 days, set higher priority
    if (remainingDays == 0) {
      return 0; // High priority
    } else if (remainingDays <= 2) {
      return 1; // Medium priority
    } else if(remainingDays<=4){
      return 2; // Low priority
    }
    else{
      return 3;
    }
  }
  
  module.exports =  {generateUniqueNumericTaskId , generateUniqueNumericSubTaskId, calculatePriority};