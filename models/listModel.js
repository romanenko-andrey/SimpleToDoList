// ..models/listModel.js

//подключаемся к базе используя Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//структура одного task из toDoList
var task = new Schema({
    task:  {
        type: String,
        required: true
    },
    //статус none || completed
    status:  {
        type: String,
        default: "",
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


// create a schema
var toDoListSchema = new Schema({
    //id-создателя toDolist в формате mongodb
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    //наименование toDoList
	name: { 
        type: String, 
        required: true 
    },
	//tasks - массив из task
    tasks:[task],
    
    temp: {type: String}
}, {
    //сохранять временные метки
    timestamps: true
});

//подключим или создадим колекцию toDoLists
//в которой будут лежать документы формата toDoListSchema
//которые в свою очередь содержат документы формата task
var ToDoLists = mongoose.model('ToDoList', toDoListSchema);

//дать доступ к коллекции db.todolists 
module.exports = ToDoLists;