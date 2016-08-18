//app.js


//простой HTTP-сервер для одностраничного приложения
var express = require('express');

//модуль для работы с путями файлов и папок
var path = require('path');

//обработчик favicon
var favicon = require('serve-favicon');

//выводит информацию в консоль сервера о полученных запросах
var morganLogger = require('morgan');

//расшифровывает cookie в заголовке запроса 
//и сохраняет их в req.cookies и req.secret 
var cookieParser = require('cookie-parser');

//расшифровывает заголовки запроса и сохраняет данные в req.body
var bodyParser = require('body-parser');

//Роутеры
var routes = require('./routes/index'); //стандартный
var userRouter = require('./routes/userRouter');
var toDoListRouter = require('./routes/toDoListRouter');
var queryRouter = require('./routes/queryRouter');



//константы: путь к базе данных 
//и секретный ключ для генерации JSONWebTokens
var config = require('./config');

//модуль подключения к базе данных MongoDB
var mongoose = require('mongoose');

//сторока ниже добавлена по рекомендации  
//http://stackoverflow.com/questions/38138445/node3341-deprecationwarning-mongoose-mpromise - чтобы не было предупреждений mongodb
mongoose.Promise = global.Promise;
mongoose.connect(config.mongoUrl);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'ошибка подключения:'));
db.once('open', function () {
    // we're connected!
    console.log("Подключение к базе данных - успешно");
});

//HTTP-сервер
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

//morganLogger: combined || common || dev || short || tiny
app.use(morganLogger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());


//модуль проверки подлинности запросов
var passport = require('passport');
//для проверки подлиности используется стратегия 'local'
var LocalStrategy = require('passport-local').Strategy;
//база данных пользователей
var User = require('./models/userModel');

//инициализация паспорта
app.use(passport.initialize());
//и привязка его к стратегии 'local'
//для других сервисов нужно подключать дополнительные стратегии
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


/*закоментировано для отладки содержания заголовков
app.use(function(req, res, next) {
  console.log(req.headers);
  console.log('------------------------------------');        

  next();
}); */

//информация для пользователей доступна если она находится 
//на сервере в папке public (например: localhost:3000/favicon.ico)
app.use(express.static(path.join(__dirname, 'public')));

//роутеры для обслуживания запросов по указанным путям
app.use('/', routes);
app.use('/users', userRouter);
app.use('/todolist', toDoListRouter);
app.use('/queries', queryRouter);


//Ошиьбка 400 - ничего не найдено
app.use(function(req, res, next) {
  var err = new Error('Упс! Тут ничего нет ....');
  err.status = 404;
  next(err);
});

// Обработчики ошибок


// Выводит клиенту json-отчет об ошибке
//'development'||'production' database
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    //res.render('error', {message: err.message,error: err});
    res.json( {
      message: err.message,
      error: err
    });  
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render({
    message: err.message,
    error: {}
  });
});

//используется в /bin/www для создания и запуска http-сервера
module.exports = app;
