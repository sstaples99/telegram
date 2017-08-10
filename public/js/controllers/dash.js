(function() {
    var app = angular.module('telegram');

    app.controller('DashController', ["$scope", "$http", "$window", function($scope, $http, $window) {

        $scope.checkStatus = function() {
            $http.get("/backendServices/isLoggedIn")
                .then(function(res) {
                    console.log(res.data);
                    if (!res.data.loggedIn) $window.location = "/";
                    else {
                        $scope.userData.isLoggedIn = true;
                        $http.get("/backendServices/getUser")
                            .then(function(res) {
                                if (res.data) $scope.userData.user = res.data;
                                else console.log("Error: ", res.data.err);
                            });
                    }
                })
        };

        $scope.pullEvents = function() {
            $http.post("/backendServices/getEvents", $scope.pageData.active.org)
                .then(function(res) {
                    if (!res.data.success) console.log("Error loading events");
                    else $scope.pageData.content.events = res.data.data;
                });
        };

        $scope.pullOrgs = function() {
            $http.get("/backendServices/getOrgs")
                .then(function(res) {
                    if (!res.data) console.log("Error finding organizations");
                    else {
                        $scope.userData.orgs = res.data;
                        $scope.pageData.active.org = $scope.userData.orgs[0];
                        $scope.pullEvents();
                    }
                });
        };

        $scope.updateCard = function(path, item) {
            var path = "/backendServices/update" + path.charAt(0).toUpperCase() + path.slice(1);
            $http.put(path, item)
                .then(function(res) {
                    if (!res.data.success) console.log(res.data.err);
                });
        };

        $scope.toggleService = function(s) {
            $scope.pageData.active.service = s;
        };

        $scope.toggleOrg = function(o) {
            $scope.pageData.active.org = o;
        };

        $scope.toggleCard = function(id) {
            $("#edits-" + id).slideToggle();
        };

        $scope.initPickers = function() {
            $(".date-time-picker").datetimepicker();
        };


    }]);

    app.filter('dateInMillis', function() {
        return function(dateString) {
            return Date.parse(dateString);
        };
    });
}());