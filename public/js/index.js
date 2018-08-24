const angular = require('angular');
require('angular-route');
require('angular-messages');
require('ng-file-upload');

const app = angular.module('telegram', ['ngRoute', 'ngFileUpload']);
app.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) { // eslint-disable-line func-names
  $routeProvider
    .when('/', {
      templateUrl: '/views/login.html',
      controller: 'LoginController',
    })
    .when('/dashboard/:org?/:service?', {
      templateUrl: '/views/dash.html',
      controller: 'DashController',
    })
    .otherwise({
      redirectTo: '/',
    });
  $locationProvider.html5Mode(true);
}]);

app.filter('iif', () => (input, trueValue, falseValue) => (input ? trueValue : falseValue));

require('./controllers/login');
require('./controllers/home');
require('./controllers/dash');
