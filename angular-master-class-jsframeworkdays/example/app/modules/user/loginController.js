app.controller('loginController', function ($scope, user, $state) {

  $scope.auth = function () {
    $scope.authError = false;

    user.login($scope.login, $scope.password).then(
      function () {
        var route = user.getUser().role == routingConfig.userRoles.admin ? 'admin' : 'home';
        $state.go(route);
      },
      function () {
        $scope.authError = true;
      });
  };
})