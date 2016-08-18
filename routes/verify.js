//verify.js
//Модуль проверки пользователей
//берет JSONWebTokens из запроса

//подключаем коллекцию users базы данных 
var User = require('../models/userModel');

// модуль создания и проверки JSONWebTokens
var jwt = require('jsonwebtoken'); 

//подключаем ключ шифрования
var config = require('../config.js');

//функция генерациии строки идентификации
exports.getToken = function (user) {
    return jwt.sign(user, config.secretKey, {
        expiresIn: 3600
    });
};

//прверка прав доступа для обычных пользователей
exports.verifyOrdinaryUser = function (req, res, next) {
    //ищем в теле заголовка или в url-параметрах или post-параметрах значение x-access-token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    // расшифровка token 
    if (token) {
        // расшифровываем ключ по моему секретному ключу
        jwt.verify(token, config.secretKey, function (err, decoded) {
            if (err) {
                var err = new Error('Вы не авторизованы!');
                err.status = 403;
                return next(err);
            } else {
                //все в порядке - сохраняем расшифрованное 
                //значение в параметер req.decoded для 
                //использования в других роутерах
                //в decoded._doc вся информация о пользователе
                // .username
                // .admin
                // .hash
                // .id 
                req.decoded = decoded;
                console.log('verify', decoded);
                next();
            }
        });
    } else {
        // ключа не найдено
        // позвращаю ошибку
        var err = new Error('Нет ключа доступа!');
        err.status = 403;
        return next(err);
    }
};

//прверка прав доступа для админисратора сайта
exports.verifyAdmin = function (req, res, next) {
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, config.secretKey, function (err, decoded) {
            if (err) {
                var err = new Error('You are not authenticated!');
                err.status = 401;
                return next(err);
            } else {
                //в decoded._doc вся информация о пользователе
                // .username
                // .admin
                // .hash
                // .id 
				
                console.log(decoded);
				                
                req.decoded = decoded;
                if (req.decoded.admin) {
                    next()
                }
                else {
                    var err = new Error('Команда доступна только администратору сайта!');
                    err.status = 401;
                    return next(err);
                };
            }
        });
    } else {
        // ключа не найдено
        // позвращаю ошибку
        var err = new Error('No token provided!');
        err.status = 403;
        return next(err);
    }
};