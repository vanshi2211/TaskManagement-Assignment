const {Schema, model} = require("mongoose");
const taskSchema = new Schema(
{
        id: {
            type: Number
        },
        title: {
            type:String,
            required: true
        },
        description: {
            type:String,
            required: true
        },
        due_date: Date,
        priority:Number,
        status: {type:String, enum: ['TODO','IN_PROGRESS','DONE'],default:'TODO'},
        deleted_at:{ type: Date, default: null},
        user_id:Number,
        subtasks: { type: Schema.Types.ObjectId, ref: 'SubTask' }

});

const subTask = new Schema(
{
        id : {type: Number},  //Subtask ID is same as parent Task's ID.
        task_id: {type:Number, ref:'taskSchema'},
        status: {type: Number,enum:[0,1], default:0},
        created_at : {type:Date, default:Date.now},
        updated_at : {type:Date, default:Date.now},
        deleted_at : {type:Date, default:null},

});
const  Task = model('task',taskSchema);
const SubTask = model('sub-tasks',subTask)
module.exports = {Task,SubTask};