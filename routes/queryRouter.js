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
	    console.log('get-query =', req.query);
		//расшифровываем запрос		
		var query = [];
		for (q in req.query) {
			var w = {};
			//при наличии преобразуем регулярное выражение
			var r = req.query[q].match(/"(\$\w+)":{"(\w+)":"\$regExp\((.+)\)"/);
			if (r) {
				//console.log("regExp=", r);
				var o1 = {};
				o1[r[2]] = new RegExp(r[3]);
				w[r[1]] = o1;
				//console.log('reg-object=', w);
			} else
				w = JSON.parse(req.query[q]);
			//console.log(w, typeof w);
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
			console.log('query=', query);
			AllTasks.aggregate(query, 
				function (err, result) {
				if (err) {
					console.log(err);
					res.json(err);
				};
				res.json(result);
				console.log(result);
			});
		
		}
	})
	

	.post(function(req, res, next){
		console.log(req.body);
		AllTasks.remove(function (err, list) {
			if (err) next(err);
			console.log('The AllLists was removed!');
					
			AllTasks.insertMany( req.body,  function (err, list) {
				if (err) next(err);
				console.log('Новый список создан! ' + list);
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
				console.log('The list was removed!');
				res.json(list);
			});

        });
	});
	
router.route('/dbltask')	  
	.get(function(req,res,next){
		console.log('get-query =', req.query, typeof req.query);
		
		console.log('get-query[0] =', req.query[0], typeof req.query[0]);
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

/* AGREGATION FUNCTION EXAMPLE
var getBalance = function(accountId) {
    AccountModel.aggregate([
        { $match: {
            _id: accountId
        }},
        { $unwind: "$records" },
        { $group: {
            _id: "$_id",
            balance: { $sum: "$records.amount"  }
        }}
    ], function (err, result) {
        if (err) {
            console.log(err);
            return;
        }
        console.log(result);
    });
}
*/


/*
var Person = mongoose.model('Person', yourSchema);

// find each person with a last name matching 'Ghost', selecting the `name` and `occupation` fields
Person.findOne({ 'name.last': 'Ghost' }, 'name occupation', function (err, person) {
  if (err) return handleError(err);
  console.log('%s %s is a %s.', person.name.first, person.name.last, person.occupation) // Space Ghost is a talk show host.
})

//------------------------------------------------------------
// find each person with a last name matching 'Ghost'
var query = Person.findOne({ 'name.last': 'Ghost' });

// selecting the `name` and `occupation` fields
query.select('name occupation');

// execute the query at a later time
query.exec(function (err, person) {
  if (err) return handleError(err);
  console.log('%s %s is a %s.', person.name.first, person.name.last, person.occupation) // Space Ghost is a talk show host.
})
//-----------------------------------------------------------



Person.
  find({
    occupation: /host/,
    'name.last': 'Ghost',
    age: { $gt: 17, $lt: 66 },
    likes: { $in: ['vaporizing', 'talking'] }
  }).
  limit(10).
  sort({ occupation: -1 }).
  select({ name: 1, occupation: 1 }).
  exec(callback);
  
// Using query builder
Person.
  find({ occupation: /host/ }).
  where('name.last').equals('Ghost').
  where('age').gt(17).lt(66).
  where('likes').in(['vaporizing', 'talking']).
  limit(10).
  sort('-occupation').
  select('name occupation').
  exec(callback);

*/