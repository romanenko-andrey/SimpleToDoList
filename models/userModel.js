// ..models/userModel.js

//подключаемся к базе используя Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//добавляем проверку подлиности 
var passportLocalMongoose = require('passport-local-mongoose');

//данные об пользователе
//могут быть любые + пол + адрес и пр.
//если admin = true то у него будут особые полномочия
var User = new Schema({
    username: String,
    password: String,
	
    firstname: {
      type: String,
        default: ''
    },
    lastname: {
      type: String,
        default: ''
    },
    admin:   {
        type: Boolean,
        default: false
    }
});

User.methods.getName = function() {
    return (this.firstname + ' ' + this.lastname);
};

User.plugin(passportLocalMongoose);

//дать доступ к коллекции db.users 
module.exports = mongoose.model('User', User);