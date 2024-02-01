const cron = require('node-cron');
const twilio = require('twilio');
const Task = require('./models/task'); 
const User = require('./models/users'); 


// Twilio credentials
const accountSid = process.env.ACCOUNTSID;
const authToken = process.env.AUTHTOKEN;
const twilioClient = new twilio(accountSid, authToken);

// Function to change task priority based on due_date
const changeTaskPriority = async () => {
    try {
        const tasks = await Task.find({ due_date: { $lt: new Date() } }).sort('due_date');

        tasks.forEach(async (task, index) => {
            // Change task priority based on index
            await Task.findByIdAndUpdate(task._id, { priority: index });
        });

        console.log('Task priorities updated successfully.');
    } catch (error) {
        console.error('Error updating task priorities:', error);
    }
};

// Function to initiate voice calls based on user priority
const initiateVoiceCalls = async () => {
    try {
        const users = await User.find().sort('priority');

        for (const user of users) {
            // Check if the user has a valid phone number
            if (user.phoneNumber) {
                try {

                    await twilioClient.calls.create({
                        twiml: '<Response><Say>Hello! This is an reminder. Your task due date has passed!</Say></Response>', // Replace with your Twilio Voice URL
                        to: user.phoneNumber,
                        from: "+16592877607", // Replace with your Twilio phone number
                    });

                    console.log(`Voice call initiated for user ${user.name} (${user.phoneNumber}).`);
                    break; 
                } catch (callError) {
                    console.error(`Error initiating voice call for user ${user.name} (${user.phoneNumber}):`, callError);
                }
            }
        }
    } catch (error) {
        console.error('Error fetching users:', error);
    }
};


// It will run every day at 1 AM to change task priorities based on due_date
cron.schedule('0 1 * * *', changeTaskPriority);

// It will run every day at 2 AM to initiate voice calls for overdue tasks based on user priority
cron.schedule('0 2 * * *', initiateVoiceCalls);

exports.modules = {changeTaskPriority,initiateVoiceCalls};