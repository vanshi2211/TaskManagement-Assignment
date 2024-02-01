//POST
// 1. Create task - input is title, description and due_date with jwt auth token
// 2. Create sub task - input is task_id
//GET
// 3. Get all user task(with filter like priority, due date and proper pagination etc)
// 4. Get all user sub tasks (with filter like task_id if passed)
//PATCH/PUT
// 5. Update task- due_date, status-”TODO” or “DONE” can be changed
// 6. Update subtask - only status can be updated - 0,1
//DELETE
// 7. Delete task(soft deletion)
// 8. Delete sub task(soft deletion)
const {validateToken} = require("../services/authentication");
const { Router } = require('express');
const {Task,SubTask} = require('../models/task');
const {calculatePriority} = require('../utils/taskUtils');
const router = Router();
const {checkForAuthenticationCookie} = require('../middleware/authentication');
const {generateUniqueNumericTaskId,generateUniqueNumericSubTaskId} = require("../utils/taskUtils");
//GET
router.get("/:id",async(req,res)=>{
    try{
        const user_id = req.params.id;
        console.log("req.cookies['token']: ",req.cookies['token']);

        const tokenObject = req.cookies['token'];
        if(!tokenObject){return res.status(400).json({ error: 'User not logged in!'});}
        const token = tokenObject.token;

        console.log("Token:", token);   
        const idObject = validateToken(token);
        const id = String(idObject._id);
        console.log(idObject);
        console.log("id:",id);
        if(user_id !== id)
        {
            console.log(user_id);
            return res.status(400).json({ error: 'Mismatched user IDs', provided_id: user_id, expected_id: id });
        }
        const {priority,due_date,page=1,limit = 10} = req.query;
        let query;
        if(priority)query.priority = priority;
        if(due_date)query.due_date = {$gte: new Date(due_date)};
        console.log("query:",query);     
        if(!query)
        {
            
            const task = await Task.find({user_id: user_id}).populate('subtasks');
            return res.json({success: true, task});
        }
        const totalCount = await Task.countDocuments(query);
        const tasks = await Task.find(query)
            .sort({due_date:1})
            .skip((page-1) *limit)
            .limit(limit);
        
        res.json({success: true,totalCount, tasks});
    }
    catch(error)
    {
        console.error('Error fetching tasks',error);
        res.status(500).json({success: false, error:'Internal server error'});
    }
   
});
router.get("/:id/subtask",async(req,res)=>{
    try{
        const userId = req.params.id;
        const { task_id } = req.query;
        console.log("req.cookies['token']: ",req.cookies['token']);

        const tokenObject = req.cookies['token'];
        if(!tokenObject){return res.status(400).json({ error: 'User not logged in!'});}
        const token = tokenObject.token;

        console.log("Token:", token);   
        const idObject = validateToken(token);
        const id = String(idObject._id);
        console.log(idObject);
        console.log("id:",id);
        if(userId !== id)
        {
            return res.status(400).json({ error: 'Mismatched user IDs', provided_id: userId, expected_id: id });
        }
        let task;
        let taskId;
        let subTask;
        if(!task_id)
        {
            task = await Task.find({user_id:userId});
            taskId = task[0].id;
            subTask = await SubTask.find({task_id:taskId});
            console.log("task: ",task,"taskid: ",taskId,"subTask:",subTask);
        }
        else{
                subTask = await SubTask.find({task_id});
        }
        res.json({success: true, subTask});
    }
    catch(error)
    {
        console.error('Error in fetching subtasks',error);
        res.status(500).json({success:false, error:'Internal server error'});
    }
 })

 //POST
router.post("/:userId",async(req,res)=>{
    try{
        console.log("req.cookies['token']: ",req.cookies['token']);

        const tokenObject = req.cookies['token'];
        if(!tokenObject){return res.status(400).json({ error: 'User not logged in!'});}
        const token = tokenObject.token;

        console.log("Token:", token);   
        const user_id = req.params.userId;
        const idObject = validateToken(token);
        const id = String(idObject._id);
        console.log(idObject);
        console.log("id:",id);
        if(user_id !== id)
        {
            console.log(user_id);
            return res.status(400).json({ error: 'Mismatched user IDs', provided_id: user_id, expected_id: id });
        }
        const {title, description,due_date} = req.body;
        const priority = calculatePriority(due_date);
        //const status = 'TODO';
        const taskId = await generateUniqueNumericTaskId();

        const task  = new Task ({title, description, due_date, priority,user_id,id: taskId});
        await task.save();
        res.json({success: true,task});
    }
    catch(error)
    {
        console.error(error);
        res.status(500).json({success:false, error:'Internal server Error'});
    }
    
   
});

router.post("/:userId/subtask",async(req,res)=>{
        const tokenObject = req.cookies['token'];
        if(!tokenObject){return res.status(400).json({ error: 'User not logged in!'});}
        const token = tokenObject.token;

        console.log("Token:", token);   
        const user_id = req.params.userId;
        const idObject = validateToken(token);
        const id = String(idObject._id);
        console.log(idObject);
        console.log("id:",id);
        if(user_id !== id)
        {
            console.log(user_id);
            return res.status(400).json({ error: 'Mismatched user IDs', provided_id: user_id, expected_id: id });
        }
        try{
            const {task_id} = req.body;
            const task = await Task.findOne({ id: task_id });

            if (!task) {
                return res.status(404).json({ error: 'Task not found' });
            }

            const userId = task.user_id;

            console.log('User ID associated with the task:', userId);

            if(user_id!==String(userId))
            {
                console.log("user_id: ",user_id,"userID:", userId);
                return res.json({msg: 'The task id is invalid'});
            }


            const newSubTask  = new SubTask({
                id: await generateUniqueNumericSubTaskId(task_id),
                task_id

            });
            await newSubTask.save();
            res.json({success:true,subtask: newSubTask});
        }
        catch(error)
        {
            console.error('Error creating subtask: ',error);
            res.status(500).json({success:false, error:'Internal server error'});
        }
});


//PATCH
router.patch("/:taskId",async(req,res)=>{
        console.log("req.cookies['token']: ",req.cookies['token']);
        const task_id = req.params.taskId;
        const tokenObject = req.cookies['token'];
        if(!tokenObject){return res.status(400).json({ error: 'User not logged in!'});}
        const token = tokenObject.token;
        
        console.log("Token:", token);   
        const task = await Task.find({id:task_id});
        if(task.length === 0){return res.json({msg: 'no task exists with this Id.'})};
        console.log("task:",task);
        const user_id = task[0].user_id;
        const idObject = validateToken(token);
        const id = idObject._id;
        console.log(idObject);
        console.log("id:",id);
        if(user_id !== id)
        {
            console.log(user_id);
            return res.status(400).json({ error: 'User doesn\'t have access to this task. ' });
        }
    try{
        const {due_date, status} = req.body;
        
        const task = await Task.findOneAndUpdate({id:task_id}, {due_date,status});
        let subTask;
        console.log(task);
        if(status){
            subTask = await SubTask.updateMany({task_id:task_id,deleted_at:null},{ $set: { status: 1 , updated_at: new Date()} });
        };
        console.log("subtask:",subTask);
        res.json({success:true, msg: 'Task and subTask updated successfully'});
    }
    catch(err)
    {
        console.error(err);
        res.status(500).json({success: false, err: "Server Error"});
    }
});

router.patch("/subtask/:taskId",async(req,res)=>{
        
    try{

        const tokenObject = req.cookies['token'];
        if(!tokenObject){return res.status(400).json({ error: 'User not logged in!'});}
        const token = tokenObject.token;

        console.log("Token:", token);   
        const task_id = req.params.taskId;
        const task = await Task.findOne({id:task_id});
        console.log("Task:",task);
        const user_id = task.user_id;
        const idObject = validateToken(token);
        const Id = idObject._id;
        console.log(idObject);
        console.log("id:",Id);
        if(user_id !== Id)
        {
            console.log(user_id);
            return res.status(400).json({ error: 'User doesn\'t have access to this task.', provided_id: user_id, expected_id: Id });
        }


        const {id,status} = req.body;
        const subtask = await SubTask.findOneAndUpdate({task_id,id,deleted_at:null},{status , updated_at: new Date()});
        console.log("subtask:",subtask);
        if(!subtask){return res.json({msg:'Subtask with this ID doesn\'t exist'})};
        res.json({success:true, msg:'Sub Task has been updated'});
    }
    catch(err)
    {
        console.error(err);
        res.status(500).json({success: false, err: "Server Error"});
    }
})


//DELETE

router.delete("/:userId",async(req,res)=>{
    console.log("req.cookies['token']: ",req.cookies['token']);

        const tokenObject = req.cookies['token'];
        if(!tokenObject){return res.status(400).json({ error: 'User not logged in!'});}
        const token = tokenObject.token;

        console.log("Token:", token);   
        const user_id = req.params.userId;
        const idObject = validateToken(token);
        const id = String(idObject._id);
        console.log(idObject);
        console.log("id:",id);
        if(user_id !== id)
        {
            console.log(user_id);
            return res.status(400).json({ error: 'Mismatched user IDs', provided_id: user_id, expected_id: id });
        }
    try{
        const {task_id} = req.body;
        console.log(task_id);
        const subtask = await SubTask.updateMany({task_id,deleted_at:null},{deleted_at:new Date()});
        const task = await Task.findOneAndUpdate({id:task_id,deleted_at:null,user_id},{deleted_at:new Date()});
        console.log("TASKS:",subtask,task);
        if(!task){return res.json({msg:'Task with this ID doesn\'t exist'})};
        res.json({success:true,msg: 'Task deleted successfully'});
    }
    catch(error)
    {
        console.error('Error deleting task:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });

    }
});
router.delete("/subtask/:userId",async(req,res)=>{
        const tokenObject = req.cookies['token'];
        if(!tokenObject){return res.status(400).json({ error: 'User not logged in!'});}
        const token = tokenObject.token;

        console.log("Token:", token);   
        const user_id = req.params.userId;
        const idObject = validateToken(token);
        const id = String(idObject._id);
        console.log(idObject);
        console.log("id:",id);
        if(user_id !== id)
        {
            console.log(user_id);
            return res.status(400).json({ error: 'Mismatched user IDs', provided_id: user_id, expected_id: id });
        }
    try{
        const{task_id,id} = req.body;
        const userId = req.params.userId;
        const subtask = await SubTask.findOneAndUpdate({task_id,id,deleted_at:null},{deleted_at:new Date()});
        console.log("task",subtask);
        if(!subtask){return res.status(404).json({msg:'Task not found'})};
        res.json({success:true,msg: 'Sub-task deleted successfully'});
    }
    catch(err)
    {
        console.error('Error deleting task:', err);
        res.status(500).json({ success: false, error: 'Internal Server Error' });

    }
})
module.exports = router;