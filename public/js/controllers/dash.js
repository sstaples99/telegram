(function() {
    var app = angular.module('telegram');

    app.module('DashController', ["$scope", "$http", function($scope, $http) {

        $scope.checkStatus = function() {
            $http.get("/backendServices/isLoggedIn")
                .then(function(res) {
                    if (!res.data.loggedIn) $window.location = "/";
                    else {
                        $scope.userData.isLoggedIn = true;
                        $http.get("/backendServices/getUser")
                            .then(function(res) {
                                if (res.data.success) $scope.userData.user = res.data.user;
                                else console.log("Error: ", res.data.err);
                            });
                    }
                })
        };

    }]);
}());