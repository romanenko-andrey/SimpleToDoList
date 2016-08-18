angular.module('mobiCuisine.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $myLocalStorage, $ionicPlatform, $cordovaCamera) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Загружаем данные пользователя из LocalStorage ну его ПК если есть
  $scope.loginData = $myLocalStorage.getObject('userinfo','{}');

  // Создадим модальное окно пошаблону, которое будет использоваться далее
  $ionicModal.fromTemplateUrl('www/templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Сохраняем данные введенные пользователем
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);
    $myLocalStorage.storeObject('userinfo',$scope.loginData);
    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
    
  //функции для модального окна reserve.html  
  $scope.reservation = {};

  // Создаем модальное окно для вызова формы Резервирования столика
  $ionicModal.fromTemplateUrl('www/templates/reserve.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.reserveform = modal;
  });

  // Triggered in the reserve modal to close it
  $scope.closeReserve = function() {
    $scope.reserveform.hide();
  };

  // Open the reserve modal
  $scope.reserve = function() {
    $scope.reserveform.show();
  };

  // функция обработчика Submit-операции
  $scope.doReserve = function() {
    console.log('Doing reservation', $scope.reservation);

    // Simulate a reservation delay. Remove this and replace with your reservation
    // code if using a server system
    $timeout(function() {
      $scope.closeReserve();
    }, 1000);
  };    
  
  //окно регистрации с вводом фотографии с камеры
  $scope.registration = {};
  // Create the registration modal that we will use later
    $ionicModal.fromTemplateUrl('www/templates/register.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.registerform = modal;
    });

    // Triggered in the registration modal to close it
    $scope.closeRegister = function () {
        $scope.registerform.hide();
    };

    // Open the registration modal
    $scope.register = function () {
        $scope.registerform.show();
    };

    // Perform the registration action when the user submits the registration form
    $scope.doRegister = function () {
        // Simulate a registration delay. Remove this and replace with your registration
        // code if using a registration system
        $timeout(function () {
            $scope.closeRegister();
        }, 1000);
    };
    
   $ionicPlatform.ready(function() {
        var options = {
            quality: 50,
            destinationType: 0,//Camera.DestinationType.DATA_URL,
            sourceType: 1, //Camera.PictureSourceType.CAMERA,
            allowEdit: true,
            encodingType: 0,//Camera.EncodingType.JPEG,
            targetWidth: 200,
            targetHeight: 200,
            popoverOptions: 0,//CameraPopoverOptions,
            saveToPhotoAlbum: false
        };
         $scope.takePicture = function() {
            $cordovaCamera.getPicture(options).then(function(imageData) {
                $scope.registration.imgSrc = "data:image/jpeg;base64," + imageData;
            }, function(err) {
                console.log(err);
            });

            $scope.registerform.show();

        };
    });
  
})


.controller('MenuController', ['$scope', 'menuFactory', 'favoriteFactory', 'baseURL', '$ionicListDelegate', '$ionicPlatform', '$cordovaLocalNotification', '$cordovaToast', function ($scope, menuFactory, favoriteFactory, baseURL, $ionicListDelegate, $ionicPlatform, $cordovaLocalNotification, $cordovaToast) {
            $scope.baseURL = baseURL
            $scope.tab = 1;
            $scope.filtText = '';
            $scope.showDetails = false;
            $scope.showMenu = false;
            $scope.message = "Loading ...";
            
            menuFactory.query(
                function(response) {
                    $scope.dishes = response;
                    $scope.showMenu = true;
                },
                function(response) {
                    $scope.message = "Error: "+response.status + " " + response.statusText;
                });

                        
            $scope.select = function(setTab) {
                $scope.tab = setTab;
                
                if (setTab === 2) {
                    $scope.filtText = "appetizer";
                }
                else if (setTab === 3) {
                    $scope.filtText = "mains";
                }
                else if (setTab === 4) {
                    $scope.filtText = "dessert";
                }
                else {
                    $scope.filtText = "";
                }
            };

            $scope.isSelected = function (checkTab) {
                return ($scope.tab === checkTab);
            };
    
            $scope.toggleDetails = function() {
                $scope.showDetails = !$scope.showDetails;
            };
    
            $scope.addFavorite = function (index) {
                console.log("index is " + index);
                favoriteFactory.addToFavorites(index);
				//скрыть кнопки с полюсиком
                $ionicListDelegate.closeOptionButtons();
				
				//добавить ввод нового уведомления в верхнюю строку мобилы
				$ionicPlatform.ready(function () {
					console.log('$ionicPlatform.ready');
                    
                    /* работает только на мобилах
					$cordovaLocalNotification.schedule({
						id: 1,
						title: "Added Favorite",
						text: $scope.dishes[index].name
					}).then(function () {
						console.log('Added Favorite '+$scope.dishes[index].name);
					},
					function () {
						console.log('Failed to add Notification ');
					});
				
					//показать уведомления
					$cordovaToast
					  .show('Added Favorite '+$scope.dishes[index].name, 'long', 'center')
					  .then(function (success) {
						  // success
					  }, function (error) {
						  // error
					  });
                      */
				});
            }
        }])

        .controller('ContactController', ['$scope', function($scope) {

            $scope.feedback = {mychannel:"", firstName:"", lastName:"", agree:false, email:"" };
            
            var channels = [{value:"tel", label:"Tel."}, {value:"Email",label:"Email"}];
            
            $scope.channels = channels;
            $scope.invalidChannelSelection = false;
                        
        }])

        .controller('FeedbackController', ['$scope', 'feedbackFactory', function($scope,feedbackFactory) {
            
            $scope.sendFeedback = function() {
                
                console.log($scope.feedback);
                
                if ($scope.feedback.agree && ($scope.feedback.mychannel == "")) {
                    $scope.invalidChannelSelection = true;
                    console.log('incorrect');
                }
                else {
                    $scope.invalidChannelSelection = false;
                    feedbackFactory.save($scope.feedback);
                    $scope.feedback = {mychannel:"", firstName:"", lastName:"", agree:false, email:"" };
                    $scope.feedback.mychannel="";
                    $scope.feedbackForm.$setPristine();
                    console.log($scope.feedback);
                }
            };
        }])

        .controller('DishDetailController', ['$scope', '$stateParams', 'dish', 'menuFactory','favoriteFactory', 'baseURL', '$ionicPopup', '$ionicLoading', '$timeout', '$ionicPopover', '$ionicModal', function($scope, $stateParams, dish, menuFactory, favoriteFactory, baseURL, $ionicPopup, $ionicLoading, $timeout, $ionicPopover, $ionicModal) {
            
            $scope.baseURL = baseURL;
            $scope.dish = {};
            $scope.showDish = false;
            $scope.message="Loading ...";
            /*   $ionicLoading.show({
                template: '<ion-spinner></ion-spinner> Идет загрузка...'
            });*/
            
            $scope.dish = dish;
            /*
           // menuFactory.getDishes().get({id:parseInt($stateParams.id,10)}).$promise.then(
                function(response){
                    $scope.dish = response;
                    $scope.showDish = true;
                    //иммитация долгой загрузки ресурсов
                    $timeout(function () {
                        $ionicLoading.hide();
                    }, 1000);
                },
                function(response) {
                    $scope.message = "Error: "+response.status + " " + response.statusText;
                    //иммитация долгой загрузки ресурсов
                    $timeout(function () {
                        $ionicLoading.hide();
                    }, 1000);
                }
            );
            
            */
            $scope.addFavorite = function (index) {
                console.log("index is " + index);
                favoriteFactory.addToFavorites(index);
                $scope.popover.hide();
                $scope.showAlert();
            }

       var template = '<ion-popover-view class="popover"><ion-content> <ion-list><ion-item ng-click="addFavorite(dish.id)">Добавить к любимы блюдам</ion-item><ion-item ng-click="openAddModal()">Оставить комментарий</ion-item> </ion-list> </ion-content></ion-popover-view>';

            $scope.popover = $ionicPopover.fromTemplate(template, {
                        scope: $scope
            });         
            
      /*  такой вызов почемуто дает сбой    
            $ionicPopover.fromTemplateUrl('#/app/my-popover.html', {
                scope: $scope
            }).then(function(popover) {
               // $scope.popover = popover;
                console.log(popover)
            });
        */    
            
            $scope.openPopover = function($event) {
                $scope.popover.show($event);
                
                $timeout(function () {
                    $scope.popover.hide();;
                }, 3000);
            };
            
            $scope.closePopover = function() {
                $scope.popover.hide();
            };
         
        // Диалог подтверждения добавления в любимые блюда
         $scope.showAlert = function() {
           var alertPopup = $ionicPopup.alert({
             title: 'Блюдо добавлено!',
             template: 'Благодарим Вас за Ваш выбор'
           });

           alertPopup.then(function(res) {
             console.log('Успешный выбор. Спасибо');
           });
         };   
       
            
        //добавление комментариев
        //функции для модального окна add-comment.html  
          $scope.mycomment = {rating:5, comment:"", author:"", date:""};

          // Create the reserve modal that we will use later
          $ionicModal.fromTemplateUrl('www/templates/add-comment.html', {
            scope: $scope
          }).then(function(modal) {
            $scope.commentForm = modal;
          });

          // Triggered in the reserve modal to close it
          $scope.closeAddModal = function() {
            $scope.commentForm.hide();
          };

          // Open the reserve modal
          $scope.openAddModal = function() {
            console.log('show add modal')
            $scope.commentForm.show();
          };

          

            $scope.submitComment = function () {
                
                $scope.mycomment.date = new Date().toISOString();
                console.log($scope.mycomment);
                
                $scope.dish.comments.push($scope.mycomment);
                //
                //тут нужно записать в базу данных //menuFactory.getDishes().update({id:$scope.dish.id},$scope.dish);
                
                //$scope.commentForm.$setPristine();
                
                $scope.closeAddModal();
                
                $scope.mycomment = {rating:5, comment:"", author:"", date:""};
            };
            
            
        }])

    
       
    //Домашняя страница
    .controller('IndexController', ['$scope', 'dish_from_app', 'leader_from_up', 'promo_from_up', 'baseURL', function($scope, dish_from_app, leader_from_up, promo_from_up, baseURL) {

        $scope.baseURL = baseURL;
        $scope.showDish = false;
        $scope.message="Loading ...";

        $scope.leader = leader_from_up;
        $scope.dish =dish_from_app;
        $scope.promotion = promo_from_up; 
    }])
    //Об авторах
    .controller('AboutController', ['$scope','leaders_from_app',  'baseURL', function($scope, leaders_from_app, baseURL) {
        $scope.baseURL = baseURL;
        $scope.leaders = leaders_from_app//corporateFactory.query();
        //console.log($scope.leaders);

    }])
    //Любимые блюда
    .controller('FavoritesController', ['$scope', 'dishes', 'favorites', 'favoriteFactory', 'baseURL', '$ionicListDelegate', '$ionicPopup', '$ionicLoading', '$timeout',  function ($scope, dishes, favorites, favoriteFactory, baseURL, $ionicListDelegate, $ionicPopup, $ionicLoading, $timeout, $myLocalStorage) {

        $scope.baseURL = baseURL;
        $scope.shouldShowDelete = false;
        /*
        //пока грузятся данные показать spinner
        $ionicLoading.show({
            template: '<ion-spinner></ion-spinner> Идет загрузка...'
        });*/
        
        //получение данных пр помощи ngRoute и resolve
        $scope.favorites = favorites;

        //$scope.dishes = menuFactory.getDishes().query(
        $scope.dishes = dishes;
        /*.$promise.then (    
            function (response) {
                $scope.dishes = response;
                //иммитация долгой загрузки ресурсов
                $timeout(function () {
                    $ionicLoading.hide();
                }, 500);
            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
                //иммитация долгой загрузки ресурсов
                $timeout(function () {
                    $ionicLoading.hide();
                }, 1000);
            });
        
        console.log($scope.dishes, $scope.favorites);
       */
        
        $scope.toggleDelete = function () {
            $scope.shouldShowDelete = !$scope.shouldShowDelete;
            console.log($scope.shouldShowDelete);
        };

        $scope.deleteFavorite = function (index) {
            //всплывающее окно запроса подтверждения удаления
            var confirmPopup = $ionicPopup.confirm({
                title: 'Подтвердите удаление',
                template: 'Вы Уверены в этом?'
            });

            confirmPopup.then(function (res) {
                if (res) {
                    console.log('Ok to delete');
                    favoriteFactory.deleteFromFavorites(index);
                   
                } else {
                    console.log('Canceled delete');
                }
            });
        
            $scope.shouldShowDelete = false;
        }}])

    .filter('favoriteFilter', function () {
        return function (dishes, favorites) {
            var out = [];
            for (var i = 0; i < favorites.length; i++) {
                for (var j = 0; j < dishes.length; j++) {
                    if (dishes[j].id === favorites[i].id)
                        out.push(dishes[j]);
                }
            }
            return out;

        }});