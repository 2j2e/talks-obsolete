var app = angular.module('app', ['ui.router', 'restangular', 'ngStorage'])

  .run(function ($rootScope, $state, user) {

    // Check user authorization during navigation
    $rootScope.$on('$stateChangeStart', function (event, next) {
      if (next.name != 'login'
        && (!user.authorize(next.access) || !user.isLoggedIn())) {
        event.preventDefault(); //prevents from resolving requested url
        $state.go('login');
      }
    });

  });