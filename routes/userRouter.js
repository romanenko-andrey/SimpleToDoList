// ..routes/userRouter.js

//GET запрос для localhost:3000/user - только для администратора
//POST запрос для localhost:3000/user/register - регистрация
//POST запрос для localhost:3000/user/login - вход в систему
//GET запрос для localhost:3000/logout - выход из системы

//подключаемся к http-express-роутеру
var express = require('express');
var router = express.Router();

//модуль проверки подлинности запросов
var passport = require('passport');

//для проверки подлиности используется стратегия 'local'
var LocalStrategy = require('passport-local').Strategy;

//база данных пользователей
var User = require('../models/userModel');


//функция проверки пользователя
var Verify = require('./verify');

//задать параметры для различных запросов
router.get('/', Verify.verifyAdmin, function(req, res, next) {
  //res.send('respond with a resource');
  User.find({}, function (err, users) {
        if (err) throw err;
        res.json(users);
    }); 
});

//users/register - для добавления нового пользователя в базу
//данные об пользователе должны быть заголовке в виде
//json-файла с полями username и password
router.post('/register', function(req, res) {
    User.register(new User({ username : req.body.username }),
      req.body.password, function(err, user) {
        if (err) {
            return res.status(500).json({err: err});
        };
        //добавляем Имя и Фамилию пользователя если они указаны в заголовке при инициализации пользователя
        if(req.body.firstname) {
            user.firstname = req.body.firstname;
        }
        if(req.body.lastname) {
            user.lastname = req.body.lastname;
        }
        //сохраняем изменения и затем
        //регистрируем пользователя
        user.save(function(err,user) {
            passport.authenticate('local')(req, res, function () {
                return res.status(200).json({status: 'Регистрация пользователя прошла успешно!'});
            });
        });
    });
}); //ebd of POST to /register

//users/login - для идентификации пользователя
//данные об пользователе должны быть в заголовке в виде
//json-файла с полями username и password
//если вход был успешным возвращает json-объект с полем token
//которое затем должно участвовать во всех запросах
//конкретного пользователя
router.post('/login', function(req, res, next) {
  
   passport.authenticate('local', function(err, user, info) {
    
    if (err) {
      return next(err);
    };
       
    if (!user) {
        return res.status(401).json({ err: info  });
    };
       
    req.logIn(user, function(err) {
        if (err) {
        return res.status(500).json({
          err: 'Такого пользователя нет в базе!'
        });
        }
        
        //var token = Verify.getToken(user);
        var token = Verify.getToken({
            "username": user.username, 
            "_id": user._id,
            "admin": user.admin
        });
        //возвращает тoken-ключ в ответе
        res.status(200).json({
            status: 'Идентификация успешно выполнена! Получите ключ доступа ...',
            success: true,
            token: token    //строка верификации пользователя
        });
    });
  })(req,res,next);
    
    
    

}); //end of POST to /login

//users/logout - выйти из системы и заблокировать 
//доступ к сайту и базе данных
router.get('/logout', function(req, res) {
    req.logout();
  res.status(200).json({
    status: 'Bye!'
  });
});

module.exports = router;