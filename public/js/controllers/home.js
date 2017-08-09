(function() {
  var app = angular.module('telegram');

  app.controller('HomeController', ['$scope', '$http', '$window', function($scope, $http, $window) {

    $scope.userData = {
      isLoggedIn: false
    };

    $scope.pageData = {};

    $scope.logout = function() {
      $http.get('/backendServices/logout')
        .then(function(res) {
          $window.location = "/";
        });
    }


  }]);

}());
