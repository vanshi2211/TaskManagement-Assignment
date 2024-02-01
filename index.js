require('dotenv').config()

const express = require('express');
const app = express();
//const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const userRoute = require('./routes/user');
const taskRoute = require('./routes/task.js');
const  {checkForAuthenticationCookie} = require('./middleware/authentication');
const {changeTaskPriority, initiateVoiceCalls} = require('./cronJob.js');
const PORT = process.env.PORT || 8000;


mongoose
    .connect(process.env.MONGO_URL)
    .then((e) => console.log("MongoDB connected"));


app.use(express.urlencoded({extended:false}));
app.use(express.json());

app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));

app.get('/testCron', (req, res) => 
{   
    changeTaskPriority;
    initiateVoiceCalls;
    res.send('Cron jobs triggered manually.');
});
app.use("/user",userRoute);
app.use("/task",taskRoute);
app.listen(PORT, () => console.log(`server started at PORT: ${PORT}`));