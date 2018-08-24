const angular = require('angular');

((() => {
  const app = angular.module('telegram');

  app.controller(
    'HomeController',
    ['$scope',
      '$http',
      '$window',
      function ($scope, $http, $window) { // eslint-disable-line func-names
        const $windowRef = $window;
        $scope.userData = {
          isLoggedIn: false,
        };

        $scope.pageData = {
          active: {},
          content: {},
        };

        $scope.logout = () => {
          $http.get('/backendServices/logout')
            .then(() => {
              $windowRef.location = '/';
            });
        };
      }],
  );
})());
