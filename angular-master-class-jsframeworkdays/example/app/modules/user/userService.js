app.factory('user', function (appConfig, $http, $q, $localStorage) {
  var accessLevels = routingConfig.accessLevels,
    userRoles = routingConfig.userRoles,
    currentUser = {};

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
      })
        .success(function (data, status, headers) {
          changeUser({
            authToken: headers('Authorization'),
            role: data.role
          });
          defer.resolve();
        })
        .error(function () {
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