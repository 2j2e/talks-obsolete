app.config(function ($stateProvider, $urlRouterProvider, RestangularProvider, appConfig) {
  var access = routingConfig.accessLevels;

  $urlRouterProvider.otherwise('/home');
  $stateProvider
    .state('login', {
      url: '/login',
      templateUrl: 'modules/user/login.html',
      controller: 'loginController',
      access: access.anon
    })
    .state('home', {
      url: '/home',
      templateUrl: 'modules/home/index.html',
      controller: 'homeController',
      access: access.user
    })
    .state('admin', {
      url: '/admin',
      templateUrl: 'modules/admin/index.html',
      controller: 'adminController',
      access: access.admin
    });

  RestangularProvider.setBaseUrl(appConfig.apiUrl);
});