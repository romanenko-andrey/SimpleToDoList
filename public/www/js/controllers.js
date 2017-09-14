angular.module('myToDoList.controllers', [])

.controller('AppController', ['$scope', '$rootScope', '$state', '$rootScope', '$ionicModal', '$localStorage' ,'AuthFactory', function ($scope, $rootScope, $state, $rootScope, $ionicModal, $localStorage, AuthFactory) {
  

    $scope.loginData = $localStorage.getObject('userinfo','{}');
  
    $rootScope.appLang = "en";
  
    
    $scope.loggedIn = false;

    if(AuthFactory.isAuthenticated()) {
        $scope.loggedIn = true;
        $scope.username = AuthFactory.getUsername();
    };

    // Создание модульного окна входа в систему
    $ionicModal.fromTemplateUrl('www/templates/login.html', {
        scope: $scope,
        animation: 'slide-in-up'  
    })
    .then(function(modal) {
        $scope.modalLogin = modal;
    });

  // Triggered in the login modal to close it
    $scope.closeLogin = function() {
        $scope.modalLogin.hide();
    };

  // Open the login modal
    $scope.openLogin = function() {
        $scope.modalLogin.show();
    };
    
    $scope.logOut = function() {
        AuthFactory.logout();
        $scope.loggedIn = false;
        $scope.username = '';
        $rootScope.todoLists = {};
        $rootScope.list = {};

       if ($rootScope.appLang == "ru")
          $state.go('ru.home')
        else
          $state.go('en.home');
    };    

   // Вход в систему при нажатии кнопки на форме
    $scope.doLogin = function() {
        console.debug('Doing login', $scope.loginData);
        $localStorage.storeObject('userinfo', $scope.loginData);
        AuthFactory.login($scope.loginData);
        $scope.closeLogin();
    };
  
  // Создание модульного окна регистрации
    $scope.registration={};
    $ionicModal.fromTemplateUrl('www/templates/register.html', {
        scope: $scope,
        animation: 'slide-in-up'  
    })
    .then(function(modal) {
        $scope.modalReg = modal;
    });

  // Triggered in the login modal to close it
    $scope.closeRegistartion = function() {
        $scope.modalReg.hide();
    };

  // Open the login modal
    $scope.startRegistartion = function() {
        $scope.modalReg.show();
    };
 
  // Регистрация при нажатии кнопки на форме
    $scope.doRegister = function() {
       console.debug('Doing registration', $scope.registration);
       AuthFactory.register($scope.registration);
       $scope.closeRegistartion();
    };
    
    $rootScope.$on('login:Successful', function () {
        $scope.loggedIn = AuthFactory.isAuthenticated();
        $scope.username = AuthFactory.getUsername();
        //console.debug('Доступ разрешен');
        //перейти на страничку с todolist
        if ($rootScope.appLang == "ru")
          $state.go('ru.todolists')
        else
          $state.go('en.todolists');
      
        $rootScope.readToDoLists(function(){
           //console.debug('go to todolist')
        });
        
       
    });
        
    $rootScope.$on('registration:Successful', function () {
        $scope.loggedIn = AuthFactory.isAuthenticated();
        $scope.username = AuthFactory.getUsername();
    });
    
}])





.controller('RegisterController', ['$scope', '$localStorage', 'AuthFactory', function ($scope, $localStorage, AuthFactory) {
    $scope.registration={};
       
    $scope.doRegister = function() {
        //console.debug('Doing registration', $scope.registration);
        AuthFactory.register($scope.registration);
    };
}])

	
.controller('ListController', ['$scope', '$rootScope', '$ionicPopup', 'listFactory', 'favoriteFactory', 'AuthFactory', function ($scope, $rootScope, $ionicPopup, listFactory, favoriteFactory, AuthFactory) {

    $scope.tab = 1;
    $scope.filtText = '';
    $scope.showDetails = false;
    $scope.showFavorites = false;
    $scope.showMenu = false;
    $scope.message = "Loading ...";
 
  
    $scope.loggedIn = function() {
      return AuthFactory.isAuthenticated();
    };
  
    $rootScope.readToDoLists = function(callback){
      listFactory.query(
        function (response) {
            $rootScope.todoLists = response;
            $scope.showMenu = true;
            console.debug(response);
            if (callback) callback();
        },
        function (response) {
            if ($rootScope.appLang == "ru")
            $scope.message = "Ошибка: " + response.status + " " + (response.status = 403) ? "Превышено время ожидания! Необходимо выйти и заново зайти в систему под своим именем." : response.statusText
            else
            $scope.message = "Error: " + response.status + " " + (response.status = 403) ? "Timeout! You must exit and re-enter the system under your name" : response.statusText

            
            
            $ionicPopup.alert({
              
               title: 'Authorisation Error!',
              
               template:  $scope.message 
            });
          
          
        });
    };
    
    $rootScope.readToDoLists();
  
    $scope.select = function (setTab) {
        $scope.tab = setTab;

        if (setTab === 2) {
            $scope.filtText = "full";
        } else if (setTab === 3) {
            $scope.filtText = "static";
        } else if (setTab === 4) {
            $scope.filtText = "sort";
        } else {
            $scope.filtText = "brief";
        }
    };

    $scope.isSelected = function (checkTab) {
        return ($scope.tab === checkTab);
    };
  
    $scope.isReady = function (stat, task) {
        console.debug(task.task, task.status, stat)
        return (task.status == "true");
    };


  // Выводим окно для Добавления имени новой задачи
  $scope.showAddListPopup = function() {
     $scope.newList = {};

    var myPopup = $ionicPopup.show({
      template: '<input type="text" ng-model="newList.name">',
      title: 'Add new list <br> Добавить новый список',
      subTitle: 'Pleace, enter name of the new task<br>Пожалуйста введите имя нового списка',
      scope: $scope,
      buttons: [
        { text: 'Cancel Отмена' },
        {
          text: 'Add Добавить',
          type: 'button-positive',
          onTap: function(e) {
            if ($scope.newList.name) {
              e.preventDefault();
              //console.debug('Новый список',  $scope.newList.name);
              
              listFactory.save($scope.newList) 
             .$promise.then(
                function (response) {
                    console.debug(response);
                    $rootScope.readToDoLists();
                    myPopup.close();
                },
                function (response) {
                    $scope.message = "Error: " + response.status + " " + response.statusText;
                    console.debug($scope.message);
                    myPopup.close();
                });
            
            }
          }
        }
      ]
    });

    myPopup.then(function(res) {
      //myPopup.close();
    });

 };//end of showAddListPopup function

  
  $scope.deleteList = function(listId) {
      //console.debug('deleting list id', listId);
      
      $ionicPopup.confirm({
          title: 'Deleting task (Удаление задачи)',
          template: 'You are realy want to delete the list? (Вы действительно хотите удалить этот список?)'
      }).then(function(res) {
          if(res) {
            //console.debug('Так решили Вы!');
            
            listFactory.delete({
                id:listId 
            })
            .$promise.then(
                  function (response) {
                      //обновим список
                      console.debug(response);
                      $rootScope.readToDoLists();
                  },
                  function (response) {
                      $scope.message = "Error: " + response.status + " " + (response.status = 403) ? "Вы не прошли идентификацию (Authorisation Error)" : response.statusText;

                      $ionicPopup.alert({
                         title: 'Deleting error! (Ошибка при удалении списка!)',
                         template:  $scope.message 
                      });
                  }
              );
        } else {
           //console.debug('Вы отказались...');
             
          }
          });
    
  };
  
 $scope.editNameList = function(listId, newName) {
    console.debug('edit name of list id', listId);
    $scope.newName = {};
    $scope.newName.name = newName;
    var myPopup = $ionicPopup.show({
      template: '<input type="text" ng-model="newName.name">',
      title: 'Remame todolist (Переименовать список дел)',
      subTitle: 'Pleace enter new name of the list <br>(Пожалуйста введите новое имя списка)',
      scope: $scope,
      buttons: [
        { text: 'Cancel Отмена' },
        {
          text: 'Save Запомнить',
          type: 'button-positive',
          onTap: function(e) {
            if (newName) {
              e.preventDefault();
              //console.debug('Новое имя списка',  $scope.newName);
                          
              listFactory.update(
                {id : listId}, $scope.newName) 
             .$promise.then(
                function (response) {
                    console.debug(response);
                    $rootScope.readToDoLists();
                    myPopup.close();
                },
                function (response) {
                    $scope.message = "Error: " + response.status + " " + response.statusText;
                    console.debug($scope.message);
                    myPopup.close();
                });
            
            }
          }
        }
      ]
    });

    myPopup.then(function(res) {
      //myPopup.close();
    });

  };
  
}]) //end of ListController


.controller('ListDetailController', ['$scope', '$rootScope', '$state', '$stateParams', '$ionicPopover', '$timeout', '$ionicModal', 'listFactory', 'taskFactory','$ionicPopup', function ($scope, $rootScope, $state, $stateParams, $ionicPopover, $timeout, $ionicModal, listFactory, taskFactory, $ionicPopup) {

    $rootScope.list = {};
    $scope.showList = false;
    $scope.message = "Loading ...";
    $scope.sortBy = "имени задания";
    $scope.orderText = "task";
  
    $scope.reverseBy = "убыванию";
    $scope.reverseSort = true;
    
    $scope.shouldShowDelete = false;
    $scope.shouldShowReorder = false;
    
    $scope.changeSort = function(setTab){
      console.debug(setTab);
      if (setTab == "имени задания" || setTab =="task name") {
            this.orderText = "task";
        } else if (setTab == "рейтингу" || setTab =="rating") {
            this.orderText = "rating";
        } else if (setTab == "готовности" || setTab =="ready status") {
            this.orderText = "status";
        } else if (setTab == "времени завершения" || setTab =="deadline") {
            this.orderText = "deadline";
        };
    };
  
    $scope.changeReverseSort = function(setTab){
      this.reverseSort = true;
      if (setTab === "возрастанию" || setTab === "ascending") 
        this.reverseSort = false;
      console.debug(setTab, this.reverseSort);
    };
  
    //$scope.list = 
    //получить todolist по его id  
    $scope.getList = function(){
      
     listFactory.get({
         id: $stateParams.id
        })
        .$promise.then(
            function (response) {
                $rootScope.list = response;
                $scope.showList = true;
                // console.debug(response);
                //определим просроченные задания
                $scope.readyTasks = 0;
                $scope.foolTasks = 0;
                for (var i=0; i< $rootScope.list.tasks.length; i++){
                  var listTime = new Date($rootScope.list.tasks[i].deadline);
                  $rootScope.list.tasks[i].timeover = false;
                
                  if ($rootScope.list.tasks[i].status != "true") {
                     if (listTime.getTime() < Date.now()) {      $rootScope.list.tasks[i].timeover = true;
                        $scope.foolTasks++;                   
                     };
                  } else $scope.readyTasks++;
               

                };
                $scope.allTasks = $rootScope.list.tasks.length;
            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            }
        );
    };
    //вызвать функцию и получить todolist
    $scope.getList();
  
    //возвращает отдельную задачу по ее id
    $scope.getTask = function(task_id){
      
      console.debug('test for id=', task_id);
      
      $scope.temp = taskFactory.get({
        id:$stateParams.id, taskId: task_id
      })
      .$promise.then(
            function (response) {
                console.debug(response);
            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
                console.debug($scope.message);
            }
        );
    };

    //удаляет отдельную задачу по ее id
    $scope.deleteTask = function(task_id){
      
      console.debug('test for id=', task_id);
      
      $ionicPopup.confirm({
          title: 'Delete task (Удаление задачи)',
          template: 'Are you realy want to delete the task? (Вы действительно хотите удалить это задание?)'
      }).then(function(res) {
          if(res) {
            //console.debug('Так решили Вы!');
            
            taskFactory.delete({
                id:$stateParams.id, 
                taskId: task_id
            })
            .$promise.then(
                  function (response) {
                      //обновим список
                      console.debug(response);
                      $scope.getList();
                  },
                  function (response) {
                      $scope.message = "Error: " + response.status + " " + (response.status = 403) ? "Authorisation Error (Вы не прошли идентификацию)" : response.statusText;

                      $ionicPopup.alert({
                         title: 'Deleting error <br> (Ошибка при удалении задачи!)',
                         template:  $scope.message 
                      });
                  }
              );
        } else {
           //console.debug('Вы отказались...');
             
          }
          });
      };
      
      
  
  
   var template = '<ion-popover-view class="popover"><ion-content> <ion-list><ion-item ng-click="addFavorite(dish.id)">Поднять рейтинг</ion-item><ion-item ng-click="openAddModal()">Понизить рейтинг</ion-item> </ion-list> </ion-content></ion-popover-view>';

    $scope.popover = $ionicPopover.fromTemplate(template, {
       scope: $scope
    });  
  
    $scope.openPopover = function($event) {
        $scope.popover.show($event);

        $timeout(function () {
            $scope.popover.hide();;
        }, 3000);
    };

    $scope.closePopover = function() {
        $scope.popover.hide();
    };
  
  // Создаем модальное окно для вызова формы Редактирования задачи
  $scope.edition = {};
  
  $ionicModal.fromTemplateUrl('www/templates/edittask.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.editform = modal;
  });

  // Triggered in the reserve modal to close it
  $scope.closeEditForm = function() {
    $scope.editform.hide();
  };

  // Open the reserve modal
  $scope.showEditForm = function(id) {
   
    $scope.edition = {};
    
    for (var i=0; i< $scope.list.tasks.length; i++){
      if ($scope.list.tasks[i]._id == id) {
        $scope.edition = $scope.list.tasks[i];
        $scope.edition.status2 = $scope.list.tasks[i].status;
      }
    };

   $scope.edition.deadtime = new Date($scope.edition.deadline);
    
    $scope.editform.show();
  };

  // функция обработчика Submit-операции
  $scope.doEdit = function(task_id) {
    
    console.debug('test for id=', task_id);
  
    if ($scope.edition.deadtime) {
       this.edition.deadline = $scope.edition.deadtime;
       console.debug(this.edition.deadline);
    }
    
    
    $scope.changedTask = {};
    $scope.changedTask.task =  $scope.edition.task;
    $scope.changedTask.rating =  $scope.edition.rating;
    $scope.changedTask.deadline =  $scope.edition.deadline;
    $scope.changedTask.status =  $scope.edition.status2;
    //$scope.changedTask.status =  $scope.edition.status2=='YES' ? true : false;
    
    console.debug('Измененная задача',  $scope.changedTask);

    if (task_id != 0 ) {
      
    taskFactory.update({
        id:$stateParams.id, 
        taskId: task_id
    },  $scope.changedTask)
    .$promise.then(
          function (response) {
              //обновим список
              //console.debug(response);
              $scope.getList();
              $rootScope.readToDoLists();
          },
          function (response) {
              $scope.message = "Error: " + response.status + " " + (response.status = 403) ? "Authorisation Error (Вы не прошли идентификацию)" : response.statusText;

              $ionicPopup.alert({
                 title: 'Saving error! Ошибка при записи изменений!',
                 template:  $scope.message 
              });
              $scope.getList();
          }
      )} else {
        taskFactory.save($scope.changedTask)
        .$promise.then(
          function (response) {
              //обновим список
              //console.debug(response);
              $scope.getList();
          },
          function (response) {
              $scope.message = "Error: " + response.status + " " + (response.status = 403) ? "Authorisation Error (Вы не прошли идентификацию)" : response.statusText;

              $ionicPopup.alert({
                 title: 'Creating error! Ошибка при создании нового задания!',
                 template:  $scope.message 
              });
              $scope.getList();
          }
      )
      
      
    }
    
     $scope.edition = {};
     $scope.closeEditForm();

  };   
  
  $scope.changeStatus  =function(){
    $scope.edition.status2 = !$scope.edition.status2
    console.debug("edition.status:", $scope.edition.status2 )
  };
  
  $scope.isAvailable = function(is_available){
    return !!is_available;
  } 
 
  
}])


.controller('ContactController', ['$scope', 'feedbackFactory', function ($scope, feedbackFactory) {

    $scope.feedback = {
        mychannel: "",
        firstName: "",
        lastName: "",
        agree: false,
        email: ""
    };

    var channels = [{
        value: "tel",
        label: "Tel."
    }, {
        value: "Email",
        label: "Email"
    }];

    $scope.channels = channels;
    $scope.invalidChannelSelection = false;

    $scope.sendFeedback = function () {


        if ($scope.feedback.agree && ($scope.feedback.mychannel == "")) {
            $scope.invalidChannelSelection = true;
        } else {
            $scope.invalidChannelSelection = false;
            feedbackFactory.save($scope.feedback);
            $scope.feedback = {
                mychannel: "",
                firstName: "",
                lastName: "",
                agree: false,
                email: ""
            };
            $scope.feedback.mychannel = "";
            $scope.feedbackForm.$setPristine();
        }
    };
}])



.controller('QueriesController', ['$scope', '$rootScope', '$state', 'queriesFactory', 'listFactory', function ($scope, $rootScope, $state, queriesFactory, listFactory) {
  
  $scope.selectedN = -1;
  
  $scope.isSelected = function(n){
    return n == $scope.selectedN;
  };
  
  $scope.bdResponse = {};
  
  $scope.sendQuery = function (qNumber){
     //console.debug('Пример обработки запроса №'+qNumber);
     //console.debug(queriesFactory.getTask(qNumber));
     $scope.selectedN = qNumber;
    
     queriesFactory.resourse.query(queriesFactory.getTask(qNumber)[2])
    .$promise.then(
        function (response) {
            console.debug(response);
            $scope.bdResponse = response;
           
           if (queriesFactory.getTask(qNumber).length>3) {
             
              queriesFactory.dublTask.query ( queriesFactory.getTask(qNumber)[3] )
             .$promise.then(
                function(res){
                  //console.debug(queriesFactory.getTask(qNumber)[3]);
                  //console.debug('Ответ на второй запрос:', res)
                  $scope.bdResponse = res;
           
                },
                function(res){
                  console.debug(res)
                }

             );
           } 
        },
        function (response) {
            $scope.message = "Error: " + response.status + " " + response.statusText;
            console.debug( $scope.message);
            $scope.selectedN = {}
        }
    );
    
  };
 
  
  $scope.sqlTasks = queriesFactory.getAllTask();
  
  $scope.todo = [];

  
  $scope.createTable = function(){
      listFactory.query(
        function (response) {
            $scope.todo = response;
            //console.debug("получено " + $scope.todo.length + " списков дел.");
          
            //console.debug($scope.todo);
          
            $scope.allLists = [];
            for (var i=0; i<$scope.todo.length; i++){
                //console.debug($scope.todo[i])
                for (var j=0; j<$scope.todo[i].tasks.length; j++){
                  var toSave = $scope.todo[i].tasks[j];
                  
                  toSave.postedBy = $scope.todo[i].postedBy._id;
                  toSave.projectId = $scope.todo[i]._id;
                  toSave.projectName = $scope.todo[i].name;
                  
                  $scope.allLists.push(toSave);
                };
            };
            //console.debug('allList=', $scope.allLists)
            
             queriesFactory.resourse.save($scope.allLists) 
             .$promise.then(
                function (response) {
                    //console.debug(response);
                    $scope.allLists = response;
                  
                },
                function (response) {
                    $scope.message = "Error: " + response.status + " " + response.statusText;
                    console.debug($scope.message);
                });
            
            
        },
        function (response) {
            $scope.message = "Error: " + response.status + " " + response.statusText;
            console.debug($scope.message);
          
        });
    };
  
   
  
}])



