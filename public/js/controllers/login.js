(function() {
    var app = angular.module('telegram');

    app.controller('LoginController', ['$scope', '$http', '$window', function($scope, $http, $window) {
        $scope.login = function() {
            $http.post('/backendServices/login',{
                email: $scope.email,
                password: $scope.password
            }).then(function(res) {
                if(res.data.success) {
                    $window.location = '/dashboard';
                } else {
                    $scope.loginError = true;
                    $scope.loginStatus.internalServerError = true;
                }
            });
        }

        $http.post('/backendServices/login',{
            email: "seanstapleton100@gmail.com",
            password: "Sean2323"
        }).then(function(res) {
            if(res.data.success) {
                $window.location = '/dashboard';
            } else {
                $scope.loginError = true;
                $scope.loginStatus.internalServerError = true;
            }
        });

        $scope.signupStatus = {
            internalServerError: false
        }

        $scope.login();

    }]);

}());
