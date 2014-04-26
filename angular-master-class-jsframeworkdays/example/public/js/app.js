var app = angular.module('app', ['ui.router', 'restangular', 'ngStorage']).run(function ($rootScope, $state, user) {
  // Check user authorization during navigation
  $rootScope.$on('$stateChangeStart', function (event, next) {
    if (next.name != 'login' && (!user.authorize(next.access) || !user.isLoggedIn())) {
      event.preventDefault(); //prevents from resolving requested url
      $state.go('login');
    }
  });
});

app.constant('appConfig', {
  apiUrl: 'http://localhost:3000/api/'
});

// Type definitions for Angular JS 1.1.5+ (ui.router module)
// Project: https://github.com/angular-ui/ui-router
// Definitions by: Michel Salib <michelsalib@hotmail.com>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
/// <reference path="angular.d.ts" />

// Type definitions for Angular JS 1.2+
// Project: http://angularjs.org
// Definitions by: Diego Vilar <http://github.com/diegovilar>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
/// <reference path="../jquery/jquery.d.ts" />


/// <reference path="../../definedTypes/angular.d.ts" />
/// <reference path="../../definedTypes/angular-ui-router.d.ts" />
var App;
(function (App) {
  var AdminController = (function () {
    function AdminController($scope, user, $state) {
      this.$scope = $scope;
      this.user = user;
      this.$state = $state;
      this.$scope.viewModel = this;
    }

    AdminController.prototype.logout = function () {
      this.user.logout();
      this.$state.go('login');
    };
    AdminController.$inject = ['$scope', 'user', '$state'];
    return AdminController;
  })();
  App.AdminController = AdminController;
})(App || (App = {}));

angular.module('app').controller('adminController', App.AdminController);

app.constant('appConfig', {
  apiUrl: 'http://bazinga.herokuapp.com/api/'
});

app.config(function ($stateProvider, $urlRouterProvider, RestangularProvider, appConfig) {
  var access = routingConfig.accessLevels;

  $urlRouterProvider.otherwise('/home');
  $stateProvider.state('login', {
    url: '/login',
    templateUrl: 'modules/user/login.html',
    controller: 'loginController',
    access: access.anon
  }).state('home', {
      url: '/home',
      templateUrl: 'modules/home/index.html',
      controller: 'homeController',
      access: access.user
    }).state('admin', {
      url: '/admin',
      templateUrl: 'modules/admin/index.html',
      controller: 'adminController',
      access: access.admin
    });

  RestangularProvider.setBaseUrl(appConfig.apiUrl);
});

(function (exports) {
  var userRoles = {
    'public': 1,
    user: 2,
    admin: 4
  };

  exports.userRoles = userRoles;
  exports.accessLevels = {
    'public': userRoles.public | userRoles.user | userRoles.admin,
    anon: userRoles.public,
    user: userRoles.user | userRoles.admin,
    admin: userRoles.admin
  };
})(typeof exports === 'undefined' ? this['routingConfig'] = {} : exports);

app.factory('feed', function (Restangular) {
  return {
    list: function () {
      return Restangular.one('user', 111).getList('feed');
    }
  };
});

app.controller('homeController', function ($scope, feed, user, $state) {
  feed.list().then(function (data) {
    $scope.feed = data;
  });

  $scope.logout = function () {
    user.logout();
    $state.go('login');
  };
});

app.controller('loginController', function ($scope, user, $state) {
  $scope.auth = function () {
    $scope.authError = false;

    user.login($scope.login, $scope.password).then(function () {
      var route = user.getUser().role == routingConfig.userRoles.admin ? 'admin' : 'home';
      $state.go(route);
    }, function () {
      $scope.authError = true;
    });
  };
});

app.factory('user', function (appConfig, $http, $q, $localStorage) {
  var accessLevels = routingConfig.accessLevels, userRoles = routingConfig.userRoles, currentUser = {};

  var changeUser = function (user) {
    $localStorage.user = currentUser = user;
    $http.defaults.headers.common.Authorization = 'Basic ' + user.authToken;
  };

  changeUser($localStorage.user || { authToken: '', role: userRoles.public });

  return {
    getUser: function () {
      return currentUser;
    },
    authorize: function (accessLevel, role) {
      if (role == undefined)
        role = currentUser.role;
      return accessLevel & role;
    },
    login: function (login, password) {
      var defer = $q.defer();
      $http.post(appConfig.apiUrl + 'auth', {
        login: login,
        password: password
      }).success(function (data, status, headers) {
          changeUser({
            authToken: headers('Authorization'),
            role: data.role
          });
          defer.resolve();
        }).error(function () {
          defer.reject();
        });

      return defer.promise;
    },
    isLoggedIn: function () {
      return currentUser.role == userRoles.user || currentUser.role == userRoles.admin;
    },
    logout: function () {
      delete $localStorage.user;
      changeUser({ authToken: '', role: userRoles.public });
    }
  };
});
