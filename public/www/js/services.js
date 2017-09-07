angular.module('myToDoList.services', [])

//.constant("baseURL", "http://localhost:3000/")
//.constant("baseURL", "https://expresstest-aromanenko.c9users.io/")
.constant("baseURL", "https://todo-list-roand.herokuapp.com/")

.factory('listFactory', ['$resource', 'baseURL', function ($resource, baseURL) {

        return $resource(baseURL + "todolist/:id", {id:"@Id"}, {
            'update': {
                method: 'PUT'
            }
        
        });

}])

.factory('taskFactory', ['$resource', 'baseURL', function ($resource, baseURL) {

        return $resource(baseURL + "todolist/:id/tasks/:taskId", {id:"@Id", taskId: "@TaskId"}, {
            'update': {
                method: 'POST'
            },
          
            'delete_task': {
                method: 'DELETE'
            }
        });

}])


.factory('corporateFactory', ['$resource', 'baseURL', function ($resource, baseURL) {


    return $resource(baseURL + "leadership/:id", null, {
            'update': {
                method: 'PUT'
            }
        });

}])


.factory('favoriteFactory', ['$resource', 'baseURL', function ($resource, baseURL) {


    return $resource(baseURL + "favorites/:id", null, {
            'update': {
                method: 'PUT'
            },
            'query':  {method:'GET', isArray:false}
        });

}])

.factory('feedbackFactory', ['$resource', 'baseURL', function ($resource, baseURL) {


    return $resource(baseURL + "feedback/:id", null, {
            'update': {
                method: 'PUT'
            }
        });

}])


.factory('queriesFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
    var queries = [
      ['get all statuses, not repeating, alphabetically ordered',
       'SELECT distinct(status)FROM `tbl_Tasks` order by `status`',
        [{$group: { _id: "$status", count: { $sum: 1 } } }, {$sort: {_id: 1}}]
      ],
      
      ['get the count of all tasks in each project, order by tasks count descending',
       'SELECT *, (SELECT count(*) from tbl_Tasks tT where tP.ID = tT.PROJECT_ID) as TaskCount FROM `tbl_Projects` as tP order by TaskCount DESC',
       [{ $group: { _id: "$projectId", count: { $sum: 1 } } } , {$sort: {count: 1}}] 
      ],
      
      ['get the count of all tasks in each project, order by projects names',
      'SELECT *, (SELECT count(*) from tbl_tasks tT where tP.ID = tT.PROJECT_ID) as TaskCount FROM `tbl_projects` as tP order by tP.`NAME` DESC',
      [{ $group: { _id: "$projectName", count: { $sum: 1 } } } , {$sort: {_id: 1}}]
      ],
      
      ['get the tasks for all projects having the name beginning with “N” letter',
      'SELECT * FROM `tbl_Tasks` as tT LEFT JOIN `tbl_Projects` as tP on tT.`PROJECT_ID` = tP.ID WHERE tP.Name LIKE BINARY  "N%"',
      [{ $match: { task: "$regExp(^N)" } } ]
      ],
      
      ['get the list of all projects containing the ‘a’ letter in the middle of the name, and show the tasks count near each project. Mention that there can exist projects without tasks and tasks with project_id=NULL',
      'SELECT ROUND(Length(tP.`NAME`)/2), tP.`NAME`, (SELECT COUNT(*) FROM tbl_Tasks tT WHERE tT.PROJECT_ID = tP.ID) FROM `tbl_Projects` as tP WHERE SUBSTRING(tP.`NAME`, ROUND(Length(tP.`NAME`)/2), 1) = BINARY "S"',
      [{ $match: { task: "$regExp(a)" } }, { $group: { _id: "$projectId", count: { $sum: 1 } } } , {$sort: {count: 1}}]
      ],
      
      ['get the list of tasks with duplicate names. Order alphabetically',
      'SELECT DESCRIPTION FROM `tbl_Tasks` HAVING COUNT(DESCRIPTION) > 1 order by DESCRIPTION asc',
      [{ $group: { _id: "$task", count: { $sum: 1 }, taskId:{$addToSet: "$_id"} } }, {$sort: {_id: 1}}, {$out : "dbltasks"}],
      [{count: {'$gte':2}}] 
      ],
      
      ['get the list of tasks having several exact matches of both name and status, from the project [‘Garage’. Order by matches count',
      'SELECT *, (SELECT COUNT(*) FROM tbl_Tasks tTsub WHERE tTsub.ID <> tT.id AND tTsub.DESCRIPTION = tT.DESCRIPTION AND tT.IS_DONE = tTsub.IS_DONE)as Mathc_Count FROM `tbl_Tasks` as tT LEFT JOIN tbl_Projects as tP on tT.Project_id = tP.ID HAVING Mathc_Count > 1 ',
      [{ $match: { projectName: "Garage" } }, { $group: { _id: { task: "$task", stat: "$status" } , count: { $sum: 1 }, taskId:{$addToSet: "$_id"} } }, {$sort: {count: -1}},  {$out : "dbltasks"}],
      [{count: {'$gte':2}}] 
      ],
      
      ['get the list of project names having more than 10 tasks in status ‘completed’. Order by project_id',
      'SELECT tP.`NAME` FROM `tbl_Projects` as tP HAVING (SELECT COUNT(*) FROM `tbl_Tasks` as tT WHERE tT.`Project_id` = tP.`ID` and tT.`IS_DONE` = 1) > 10 order by tP.`NAME` ASC',
      [{ $group: { _id: { project: "$projectName", stat: "$status" } , count: { $sum: 1 } } }, {$sort: {projectId: 1}}, {$out : "dbltasks"}],
      [{"_id.stat": true, count: {$gte:2} }]
      ]
    ];
    
    var qFac = {};
    qFac.resourse = 
      $resource(baseURL + "queries", null, {
            'update': {
                method: 'PUT'
            },
            'save': {
                method: 'POST',
                isArray : true
            },
        'query': {
                method: 'GET',
                isArray : true
            },
        'get': {
                method: 'GET',
                isArray : true
            },
        });
  
  qFac.dublTask = 
      $resource(baseURL + "queries/dbltask", null, {
            'update': {
                method: 'PUT'
            },
            'query': {
                method: 'GET',
               isArray : true
            },
            'get': {
                method: 'GET',
                isArray : true
            },
  });
  
  
  
  qFac.getTask = function(n){
      if (queries[n])
        return queries[n]
      else return {};
    };
   qFac.getAllTask = function(){
       return queries;
    };
  
    return qFac;

}])


.factory('$localStorage', ['$window', function ($window) {
    return {
        store: function (key, value) {
            $window.localStorage[key] = value;
        },
        get: function (key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        },
        remove: function (key) {
            $window.localStorage.removeItem(key);
        },
        storeObject: function (key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function (key, defaultValue) {
            return JSON.parse($window.localStorage[key] || defaultValue);
        }
    }
}])

.factory('AuthFactory', ['$resource', '$http', '$localStorage', '$rootScope', '$window', 'baseURL', '$ionicPopup', function($resource, $http, $localStorage, $rootScope, $window, baseURL, $ionicPopup){
    
    var authFac = {};
    var TOKEN_KEY = 'Token';
    var isAuthenticated = false;
    var username = '';
    var authToken = undefined;
    


  function loadUserCredentials() {
    var credentials = $localStorage.getObject(TOKEN_KEY,'{}');
    if (credentials.username != undefined) {
      useCredentials(credentials);
    }
  }
 
  function storeUserCredentials(credentials) {
    $localStorage.storeObject(TOKEN_KEY, credentials);
    useCredentials(credentials);
  }
 
  function useCredentials(credentials) {
    isAuthenticated = true;
    username = credentials.username;
    authToken = credentials.token;
 
    // Set the token as header for your requests!
    $http.defaults.headers.common['x-access-token'] = authToken;
  }
 
    function destroyUserCredentials() {
        authToken = undefined;
        username = '';
        isAuthenticated = false;
        $http.defaults.headers.common['x-access-token'] = authToken;
        $localStorage.remove(TOKEN_KEY);
    };
    
     
    authFac.login = function(loginData) {
      $resource(baseURL + "users/login")
      .save(loginData,
         function(response) {
            storeUserCredentials({username:loginData.username, token: response.token});
            $rootScope.$broadcast('login:Successful');
         },
         function(response){
          isAuthenticated = false;
         
          $ionicPopup.alert({
           title: 'В доступе отказано!',
           template: response.data.err.message
          }).then(function(res) {
           console.log('Доступ разрешен');
          });
         }
      );
    };
    
    authFac.logout = function() {
        $resource(baseURL + "users/logout").get(function(response){
        });
        destroyUserCredentials();
    };
    
    authFac.register = function(registerData) {
        
        $resource(baseURL + "users/register")
        .save(registerData,
           function(response) {
              //если регистрация прошла успешно то тутже
              //выполним вход в систему
              authFac.login({username:registerData.username, password:registerData.password});
              //и сохраним данные о пользователе
              $localStorage.storeObject('userinfo',
                    {username:registerData.username, password:registerData.password});
              $rootScope.$broadcast('registration:Successful');
           },
           function(response){
                    
            $ionicPopup.alert({
             title: 'Ошибка при регистрации!',
             template: response.data.err.message
            });
           }
        
        );
    };
    
    authFac.isAuthenticated = function() {
        return isAuthenticated;
    };
    
    authFac.getUsername = function() {
        return username;  
    };

    loadUserCredentials();
    
    return authFac;
    
}])
;