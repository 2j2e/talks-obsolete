app.controller('homeController', function ($scope, feed, user, $state) {
  feed.list().then(function (data) {
    $scope.feed = data;
  });

  $scope.logout = function () {
    user.logout();
    $state.go('login');
  }
})