(function (exports) {

  var userRoles = {
    'public': 1, // 001
    user: 2, // 010
    admin: 4  // 100
  };

  exports.userRoles = userRoles;
  exports.accessLevels = {
    'public': userRoles.public | // 111
      userRoles.user |
      userRoles.admin,
    anon: userRoles.public,  // 001
    user: userRoles.user |   // 110
      userRoles.admin,
    admin: userRoles.admin    // 100
  };
})(typeof exports === 'undefined' ? this['routingConfig'] = {} : exports);
