// userUtils.js

const User = require('../models/users'); // Import your User model

async function generateUniqueNumericId() {
  try {
    // Find the user with the highest numeric _id
    const highestUser = await User.findOne({}, {}, { sort: { id: -1 } });

    // If there are no users, start with a default value (e.g., 1)
    const nextId = highestUser ? highestUser.id + 1 : 1;

    return nextId;
  } catch (error) {
    console.error('Error generating unique numeric ID:', error);
    throw error;
  }
}

module.exports = {
  generateUniqueNumericId,
};
