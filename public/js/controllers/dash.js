(function() {
    var app = angular.module('telegram');

    app.controller('DashController', ["$scope", "$http", "$window", "Upload", "$timeout", function($scope, $http, $window, Upload, $timeout) {

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
                    else $scope.pageData.content.events = {
                        data: res.data.data
                    };
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

        $scope.dupCard = function(p, item) {
            var path = "/backendServices/dup" + p.charAt(0).toUpperCase() + p.slice(1);
            $http.post(path, item)
                .then(function(res) {
                   if (res.data.success) {
                       $scope.pageData.content[p + "s"].data.push(res.data.data);
                   } else {
                       swal("Error", "Unfortunately, the document could not be duplicated", "error");
                   }
                });
        };

        $scope.createCard = function(p) {
            var path = "/backendServices/create" + p.charAt(0).toUpperCase() + p.slice(1);
            $http.post(path, {"clientID": $scope.pageData.active.org._id})
                .then(function(res) {
                    if (res.data.success) $scope.pageData.content[p + "s"].data.push(res.data.data);
                });
        };

        $scope.deleteCard = function(p, item, idx) {
            var path = "/backendServices/delete" + p.charAt(0).toUpperCase() + p.slice(1);
            swal({
                    title: "Are you sure?",
                    text: "You will not be able to recover this document!",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Yes, delete it!",
                    closeOnConfirm: false
                }, function() {
                    $http.post(path, item)
                        .then(function(res) {
                            if (!res.data) {
                                swal("Error", "Unfortunately, the document could not be deleted", "error");
                            } else {
                                $scope.pageData.content[p + "s"].data.splice(idx,1);
                                swal("Success", "the " + p + " was deleted", "success");
                            }
                        });
            });
        };

        $scope.initMenus = function() {
            $http.post("/backendServices/getMenus", $scope.pageData.active.org)
                .then(function(res) {
                    if (!res.data.success) {
                        console.log(res.data.err);
                    } else {
                        $scope.pageData.content.items = {
                            data: res.data.data
                        };
                        var uniqMenuTags = [];
                        var menuTagsShown = [];
                        for (var i = 0; i < res.data.data.length; i++) {
                            var item = res.data.data[i];
                            for (var j = 0; j < item.tags.length; j++) {
                                if (uniqMenuTags.findIndex(function(o){return o.name === item.tags[j]}) < 0) {
                                    var tag = {
                                        name: item.tags[j],
                                        active: (uniqMenuTags.length == 0)
                                    };
                                    uniqMenuTags.push(tag);
                                    if (tag.active) menuTagsShown.push(tag.name);
                                }
                            }

                        }
                        $scope.pageData.content.items.uniqMenuTags = uniqMenuTags;
                        $scope.pageData.content.items.tagsShown = menuTagsShown;
                    }
                });
        };

        $scope.uploadImg = function(item, schema) {
            var file = item.imgFile;
            file.upload = Upload.upload({
                url: "/backendServices/uploadImg",
                data: {file: file, _id: item._id, schema: schema}
            });

            file.upload.then(function(res) {
                console.log(res.data);
                $timeout(function() {
                   item.img = res.data;
                });
            }, function(res) {
                if (res.status > 0) {
                    $scope.errorMsg = res.status + ': ' + res.data;
                }
            }, function(evt) {
                file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
            });
        };

        $scope.sortArray = function(oArr) {
            var arr = JSON.parse(JSON.stringify(oArr));
            for (var i = 0; i < arr.length; i++) {
                for (var j = 0; j < arr.length - i - 1; j++) {
                    if (arr[j].order > arr[j+1].order) {
                        var temp = arr[j];
                        arr[j] = arr[j+1];
                        arr[j+1] = temp;
                    }
                }
            }
            return arr;
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

        $scope.toggleTag = function(tag) {
            tag.active = !tag.active;
            var idx = $scope.pageData.content.items.tagsShown.findIndex(function(o) { return o === tag.name});
            if (idx < 0) $scope.pageData.content.items.tagsShown.push(tag.name);
            else delete $scope.pageData.content.items.tagsShown[idx];
        };

        $scope.tagShown = function(tag) {
            if (tag.tags.length < 1 || typeof(tag.tags === "string")) return true;
            for (var i = 0; i < tag.tags.length; i++) {
                if ($scope.pageData.content.items.tagsShown.findIndex(function(o) { return o === tag.tags[i]}) > -1) return true;
            }
            return false;
        };

        $scope.dropCallback = function(idx, item) {
            var pidx = $scope.pageData.content.items.placeholder;
            if (pidx < idx) idx -= 1;
            console.log(idx);
            if (idx == $scope.pageData.content.items.placeholder) return;

            if (idx == 0) item.order = $scope.pageData.content.items.data[0].order - 1;
            else if (idx == $scope.pageData.content.items.data.length - 2) item.order = $scope.pageData.content.items.data[idx].order + 1;
            else {
                var prev = $scope.pageData.content.items.data[idx - 1].order;
                var next = $scope.pageData.content.items.data[idx + 1].order;
                var mid = (next - prev) * 0.95;
                item.order = prev + mid;
            }
            $scope.updateCard('item', item);
            $scope.pageData.content.items.data = $scope.sortArray($scope.pageData.content.items.data);
        };


    }]);

    app.filter('dateInMillis', function() {
        return function(dateString) {
            return Date.parse(dateString);
        };
    });

    app.directive("dpLoad", function() {
       return {
           restrict: "A",
           link: function(scope, el, attrs) {
               $(el).datetimepicker();
           }
       }
    });
}());