const angular = require('angular');
const _ = require('lodash');

((() => {
  const app = angular.module('telegram');

  app.controller(
    'LoginController',
    ['$scope', '$http', '$window', function ($scope, $http, $window) { // eslint-disable-line func-names
      const $windowRef = $window;
      $scope.login = () => {
        console.log('ay');
        $http.post('/backendServices/user/login', {
          email: $scope.email,
          password: $scope.password,
        }).then((res) => {
          console.log('yo', res);
          if (res.data.success) {
            $windowRef.location = '/dashboard';
          } else {
            $scope.loginError = true;
            _.set($scope, 'loginStatus.internalServerError', true);
          }
        });
      };

      $scope.signupStatus = {
        internalServerError: false,
      };

      $scope.login();
    }],
  );
})());
