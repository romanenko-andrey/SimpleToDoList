//toDoListRouter.js

//подключаемся к http-express-роутеру
var express = require('express');
var router = express.Router();

//расшифровывает заголовки запроса и сохраняет данные в req.body
var bodyParser = require('body-parser');

//функции верификации пользователей
var Verify = require('./verify');

//подключение структирированной коллекции базы данных 
var ToDoLists = require('../models/listModel');
var AllTasks = require('../models/tbl_Tasks');
var dbltask = require('../models/dbltasks');

//расшифруем запрос
router.use(bodyParser.json());

//задать параметры для различных запросов
router.route('/')

	.get(function(req, res, next){
	    console.debug('get-query =', req.query);
		//расшифровываем запрос		
		var query = [];
		for (q in req.query) {
			var w = {};
			//при наличии преобразуем регулярное выражение
			var r = req.query[q].match(/"(\$\w+)":{"(\w+)":"\$regExp\((.+)\)"/);
			if (r) {
				//console.debug("regExp=", r);
				var o1 = {};
				o1[r[2]] = new RegExp(r[3]);
				w[r[1]] = o1;
				//console.debug('reg-object=', w);
			} else
				w = JSON.parse(req.query[q]);
			//console.debug(w, typeof w);
			query.push (w);
		};
		
		//query = [{ $match: { task: /^N/ } } ];
		
		if (req.query == {}) {
		AllTasks.find( {}  )
            .populate('postedBy')
			.select( {}  )
			.exec(function (err, lists) {
				if (err) next(err);
				res.json(lists);
			}) 
		}else { //тестовые задания
			console.debug('query=', query);
			AllTasks.aggregate(query, 
				function (err, result) {
				if (err) {
					console.debug(err);
					res.json(err);
				};
				res.json(result);
				console.debug(result);
			});
		
		}
	})
	

	.post(function(req, res, next){
		console.debug(req.body);
		AllTasks.remove(function (err, list) {
			if (err) next(err);
			console.debug('The AllLists was removed!');
					
			AllTasks.insertMany( req.body,  function (err, list) {
				if (err) next(err);
				console.debug('Новый список создан! ' + list);
				res.json(list);
			});
		});
	
	
		
	});
	
	
	
router.route('/:listId')	
 //удалить задачу по его номеру
	.delete(function(req, res, next){
         AllTasks.findById(req.params.listId, function (err, list) {
            if (err) next(err);
            
			list.remove(function (err, list) {
				if (err) next(err);
				console.debug('The list was removed!');
				res.json(list);
			});

        });
	});
	
router.route('/dbltask')	  
	.get(function(req,res,next){
		console.debug('get-query =', req.query, typeof req.query);
		
		console.debug('get-query[0] =', req.query[0], typeof req.query[0]);
		//JSON.parse(req.query));
		var query = {};
		if (req.query[0]) 
		   query = JSON.parse(req.query[0]);
		dbltask.find( query )
            .populate('postedBy')
			.select( {}  )
			.exec(function (err, lists) {
				if (err) next(err);
				res.json(lists);
			}) 
		
	})
	
module.exports = router;
