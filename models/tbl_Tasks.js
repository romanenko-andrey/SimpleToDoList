// ..models/tbl_Tasks.js

//подключаемся к базе используя Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//структура одного task из toDoList
var taskSchema = new Schema({
	projectId: {
        type: mongoose.Schema.Types.ObjectId,
 
    },
	projectName :{ type: String},
	
	postedBy: {
        type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
    },
    task:  {
        type: String,
        required: true
    },

    status:  {
        type: Boolean,
        default: false,
    },
    //приоритет задачи
    rating:  {
        type: Number,
        min: 1,
        max: 10,
        default: 5
    },
	deadline: {
		type: Date
	}
}, {
    //сохранять временные метки
    timestamps: true
});

//подключим или создадим колекцию tbl_Tasks
//в которой будут лежать все задачи всех пользователей всех листов

var AllTasks = mongoose.model('tbl_task', taskSchema);


module.exports = AllTasks;