app.factory('feed', function (Restangular) {
  return {
    list: function () {
      return Restangular.one('user', 111).getList('feed');
    }
  }
});