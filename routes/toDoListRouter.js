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



//расшифруем запрос
router.use(bodyParser.json());

//задать параметры для различных запросов
router.route('/')

	//запрос списков. Если в заголовке нет детализации
    //то возвращает все списки
	//Verify.verifyOrdinaryUser, 
	.get(Verify.verifyOrdinaryUser, function(req, res, next){
		//отдать пользователю только ЕГО списки
		//req.query = {"postedBy": req.decoded._id};
		//а администратору все
		if (!req.decoded.admin) 
		   req.query ["postedBy"] =  req.decoded._id;
		
		console.debug('req.decoded=', req.decoded);
		console.debug('get-query =', req.query);
		
		ToDoLists.find(req.query)
            .populate('postedBy')
            .exec(function (err, lists) {
            if (err) next(err);
            res.json(lists);
        });   
 
	})
	
	//создать новый список 
	.post(Verify.verifyOrdinaryUser, function(req, res, next){
        //id пользователя
	    req.body.postedBy = req.decoded._id;
		
		ToDoLists.create(req.body, function (err, list) {
			if (err) next(err);
           	console.debug('Новый список создан!', list);
			res.json(list);
		});
		
		
	})
	
	//удалить все списки - только для администратора 
	.delete(Verify.verifyAdmin, function(req, res, next){
		ToDoLists.remove({}, function (err, resp) {
			if (err) next(err);
			res.json(resp);
		});
	});

//Роутер на отlельно указынный список по его ID
router.route('/:listId')	
    //выбрать конкретный список по его ID
	.get(Verify.verifyOrdinaryUser, function(req,res,next){
		ToDoLists.findById(req.params.listId)
            .populate('postedBy')
            .exec(function (err, list) {
			
			console.debug(list.postedBy);
			console.debug(req.decoded._id);
			
			if (list.postedBy._id != req.decoded._id)
				{
					var err = new Error('Получить запись может только ее автор!');
					err.status = 401;
					return next(err);
				};
				
            if (err) next(err);
            res.json(list);
        });
	})
    //изменить имя toDoList по его ID
	.put(Verify.verifyOrdinaryUser, function(req, res, next){
        ToDoLists.findById(req.params.listId, function (err, list) {
            if (err) next(err);
            console.debug(list);
            list.name = req.body.name;
            list.save(function (err, list) {
                if (err) next(err);
                console.debug('Имя списка дел было успешно изменено!');
                res.json(list);
            });
        });
 
	})
    //удалить список по его номеру
	.delete(Verify.verifyOrdinaryUser, function(req, res, next){
     
        ToDoLists.findById(req.params.listId, function (err, list) {
            if (err) next(err);
            //если данный список создан этим пользователем или админом -можно удалять
            if (list.postedBy == req.decoded._id || req.decoded.admin){ 
                list.remove(function (err, list) {
                    if (err) next(err);
                    console.debug('The list was removed!');
                    res.json(list);
                });
            } else {
                var err = new Error('В доступе отказано!. Изменить список может только его автор.');
                err.status = 401;
                next(err);
            };
 
        });
     
	});

//работа с перечнем дел внутри списков toDoList
router.route('/:listId/tasks')
//получить список существующих дел
.get(Verify.verifyOrdinaryUser, function (req, res, next) {
    
   ToDoLists.findById(req.params.listId)
        .populate('postedBy')
        .exec(function (err, list) {
        //console.debug('toDoList = ', list);
        if (err) next(err);
        if (list.tasks) 
          res.json(list.tasks);

    });
})
//добавить дело
.post(Verify.verifyOrdinaryUser, function (req, res, next) {
    ToDoLists.findById(req.params.listId, function (err, list) {
        if (err) next(err);
        
        list.tasks.push(req.body);
        
        //console.debug(req.body);
        
        list.save(function (err, list) {
            if (err) next(err);
            console.debug('Дело добавлено в список!');
            res.json(list);
        });
    });
})
//удалить все дела из списка
.delete(Verify.verifyOrdinaryUser, function (req, res, next) {
    ToDoLists.findById(req.params.listId, function (err, list) {
        if (err) next(err);
        for (var i = (list.tasks.length - 1); i >= 0; i--) {
            list.tasks.id(list.tasks[i]._id).remove();
        }
        list.save(function (err, result) {
            if (err) next(err);
            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            res.end('Все дела из списка удалены');
        });
    });
});

router.route('/:listId/tasks/:taskId')
.get(Verify.verifyOrdinaryUser, function (req, res, next) {
    console.debug(req.params);
    ToDoLists.findById(req.params.listId)
        .populate('postedBy')
        .exec(function (err, list) {
        if (err) next(err);
		
		if (list.postedBy._id != req.decoded._id)
        {
            var err = new Error('Получить запись может только ее автор!');
            err.status = 401;
            return next(err);
        };
		
        res.json(list.tasks.id(req.params.taskId));
    });
})

//редактирование записи в списке по ее _id
//старая запись удаляется и новая записывается
//поэтоиу в данном случае нужно передавать все параметры записи
//task & status & rating
//еща нужно учитывать что _id записи после этого измениться и 
//в следующем запросе к ней нужно указвать ее новый id
.post(Verify.verifyOrdinaryUser, function (req, res, next) {
    // удалим существующую запись и вставим вместо не измененную
    ToDoLists.findById(req.params.listId, function (err, list) {
        if (err) next(err);
		
		if (list.postedBy != req.decoded._id)
        {
            var err = new Error('Изменить запись может только ее автор!');
            err.status = 401;
            return next(err);
        };
		
        list.tasks.id(req.params.taskId).remove();
               
        list.tasks.push(req.body);
        list.save(function (err, list) {
            if (err) next(err);
            console.debug('Updated lists!');
            res.json(list);
        });
    });
})

//удаление записи в списке по ее _id
.delete(Verify.verifyOrdinaryUser, function (req, res, next) {
    ToDoLists.findById(req.params.listId, function (err, list) {
        //удалить комментарий может только тот кто его опубликовал. 
        //Администратор может удалить только все комментарии целиком 
      
        if (list.postedBy != req.decoded._id)
        {
            var err = new Error('Удалить запись может только ее автор!');
            err.status = 401;
            return next(err);
        };
        
        list.tasks.id(req.params.taskId).remove();
        list.save(function (err, resp) {
            if (err) next(err);
            res.json(resp);
        });
    });
});
	
	
	
module.exports = router;