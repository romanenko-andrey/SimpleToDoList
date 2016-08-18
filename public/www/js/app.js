//app.js


angular.module('myToDoList', ['ionic', 'ngResource', 'myToDoList.controllers', 'myToDoList.services'])

.run(function($ionicPlatform, $rootScope, $ionicLoading, $state, $timeout, $stateParams) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
  

  
    // внедрить реакцию на событие loading:show
    // (показать волчок)
    $rootScope.$on('loading:show', function () {
        $ionicLoading.show({
            template: '<ion-spinner></ion-spinner> Загрузка ...'
        })
    });
    // внедрить реакцию на событие loading:show
    // (скрыть волчок)
    $rootScope.$on('loading:hide', function () {
        $ionicLoading.hide();
    });

    // установить обработчик события для ui-router
    // $stateChangeStart - начало запроса
    $rootScope.$on('$stateChangeStart', function () {
        //console.log('Loading ...');
        $rootScope.$broadcast('loading:show');
    });

    // установить обработчик события для ui-router
    // $stateChangeSuccess - по успеху выполнения запроса
    $rootScope.$on('$stateChangeSuccess', function () {
       // console.log('done');
        $rootScope.$broadcast('loading:hide');
        //console.log(window.location.hash);
     
        if (window.location.hash.match(/#\/en\//)) 
            $rootScope.appLang = "en"
        else 
           $rootScope.appLang = "ru";
        console.log($rootScope.appLang);
    }); 
})

.config(function($stateProvider, $urlRouterProvider) {
  
  $stateProvider
   
   .state('en', {
    url: '/en',
    abstract: true,
    templateUrl: 'www/templates/sidebar-en.html',
    controller: 'AppController'
  })
  
  .state('ru', {
    url: '/ru',
    abstract: true,
    templateUrl: 'www/templates/sidebar-ru.html',
    controller: 'AppController'
  })

  .state('ru.home', {
    url: '/home',
    views: {
      'mainContent': {
        templateUrl: 'www/templates/home-ru.html',

      }
    }
  })
  
  .state('en.home', {
    url: '/home',
    views: {
      'mainContent': {
        templateUrl: 'www/templates/home-en.html',
      }
    }
  })
  
  .state('ru.queries', {
    url: '/queries',
    views: {
      'mainContent': {
        templateUrl: 'www/templates/queries-ru.html',
        controller: 'QueriesController' 
      }
    }
  })
  
  .state('en.queries', {
    url: '/queries',
    views: {
      'mainContent': {
        templateUrl: 'www/templates/queries-en.html',
        controller: 'QueriesController' 
      }
    }
  })
  
  .state('ru.aboutus', {
      url: '/aboutus',
      views: {
        'mainContent': {
          templateUrl: 'www/templates/aboutus-ru.html',
          controller: ''
        }
      }
    })
  
   .state('en.aboutus', {
      url: '/aboutus',
      views: {
        'mainContent': {
          templateUrl: 'www/templates/aboutus-en.html',
          controller: ''
        }
      }
    })
  
    .state('ru.todolists', {
      url: '/todolists',
      views: {
        'mainContent': {
          templateUrl: 'www/templates/todolists-ru.html',
          controller: 'ListController'
        }
      }
    })
  
    .state('en.todolists', {
      url: '/todolists',
      views: {
        'mainContent': {
          templateUrl: 'www/templates/todolists-en.html',
          controller: 'ListController'
        }
      }
    })

   .state('ru.listdetails', {
     url: '/todolists/:id',
     views: {
      'mainContent': {
        templateUrl: 'www/templates/listdetails-ru.html',
        controller: 'ListDetailController'
      }
    }
  })
  
  .state('en.listdetails', {
     url: '/todolists/:id',
     views: {
      'mainContent': {
        templateUrl: 'www/templates/listdetails-en.html',
        controller: 'ListDetailController'
      }
    }
  })
  
   .state('ru.contactus', {
      url: '/contactus',
      views: {
        'mainContent': {
          templateUrl: 'www/templates/contactus-ru.html',
          controller: ''
        }
      }
    })
  
  .state('en.contactus', {
      url: '/contactus',
      views: {
        'mainContent': {
          templateUrl: 'www/templates/contactus-en.html',
          controller: ''
        }
      }
    })
  
  .state('ru.navstack', {
      url: "/navstack",
      views: {
        'mainContent': {
          templateUrl: "www/templates/nav-stack.html"
        }
      }
    })
 .state('en.navstack', {
      url: "/navstack",
      views: {
        'mainContent': {
          templateUrl: "www/templates/nav-stack.html"
        }
      }
    }) 
  
  
  // if none of the above states are matched, use this as the fallback

  $urlRouterProvider.otherwise('/en/home');
  //$urlRouterProvider.otherwises('/app/aboutus');  
});
