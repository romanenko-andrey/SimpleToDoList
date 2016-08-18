// ..models/tbl_Tasks.js

//подключаемся к базе используя Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var taskSchema = new Schema({
	 any: {}
}, 
 { _id: false, strict: false }
);

//подключим или создадим колекцию tbl_Tasks
//в которой будут лежать все задачи всех пользователей всех листов

var dblTasks = mongoose.model('dbltask', taskSchema);


module.exports = dblTasks;