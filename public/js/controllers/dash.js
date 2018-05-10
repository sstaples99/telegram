(function() {
    var app = angular.module('telegram');

    app.controller('DashController', ["$scope", "$http", "$window", "Upload", "$timeout", "$routeParams", "$location", function($scope, $http, $window, Upload, $timeout, $routeParams, $location) {

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
                });
        };
        $scope.pullEvents = function() {
            $http.post("/backendServices/getEvents", $scope.pageData.active.org)
                .then(function(res) {
                    if (!res.data.success) console.log("Error loading events");
                    else {
                        $scope.pageData.content[$scope.pageData.active.org.uniqname].events = {
                            data: res.data.data
                        };
                    }
                });
        };
        $scope.getParties = function() {
            $http.post("/backendServices/getParties", $scope.pageData.active.org)
                .then(function(res) {
                    if (!res.data.success) console.log("Error loading parties");
                    else {
                        $scope.pageData.content[$scope.pageData.active.org.uniqname].parties = {
                            data: res.data.data
                        };
                    }
                });
        };
        $scope.pullOrgs = function() {
            $http.get("/backendServices/getOrgs")
                .then(function(res) {
                    if (!res.data) console.log("Error finding organizations");
                    else {
                        $scope.userData.orgs = res.data;
                        for (var i = 0; i < $scope.userData.orgs.length; i++) {
                            $scope.pageData.content[$scope.userData.orgs[i].uniqname] = {};
                        }
                        if ($routeParams.org) {
                            var idx = $scope.userData.orgs.findIndex(function(o) { return o.uniqname == $routeParams.org });
                            if (idx > -1) $scope.pageData.active.org = $scope.userData.orgs[idx];
                        } else {
                            $scope.pageData.active.org = $scope.userData.orgs[0];
                            $location.path("/dashboard/"+$scope.pageData.active.org.uniqname);
                        }
                        if ($routeParams.service) {
                            var idx = $scope.pageData.active.org.services.indexOf($routeParams.service);
                            if (idx > -1) $scope.pageData.active.service = $routeParams.service;
                        } else {
                            $scope.pageData.active.service = $scope.pageData.active.org.services[0];
                            $location.path("/dashboard/"+$scope.pageData.active.org.uniqname+"/"+$scope.pageData.active.service);
                        }
                    }
                });
        };
        $scope.initMenus = function() {
            $http.post("/backendServices/getMenus", $scope.pageData.active.org)
                .then(function(res) {
                    if (!res.data.success) {
                        console.log(res.data.err);
                    } else {
                        $scope.pageData.content[$scope.pageData.active.org.uniqname].items = {
                            data: res.data.data
                        };

                        $http.post("/backendServices/getTags", {clientID: $scope.pageData.active.org._id})
                            .then(function(response) {
                               if (response.data) {
                                   var uniqMenuTags = response.data;
                                   // var menuTagsShown = [];
                                   // for (var i = 0; i < res.data.data.length; i++) {
                                   //     var item = res.data.data[i];
                                   //     for (var j = 0; j < item.tags.length; j++) {
                                   //         if (uniqMenuTags.findIndex(function(o){return o.name === item.tags[j]}) < 0) {
                                   //             var tag = {
                                   //                 name: item.tags[j],
                                   //                 clientID: $scope.pageData.active.org._id
                                   //             };
                                   //             uniqMenuTags.push(tag);
                                   //             $http.post("/backendServices/createCard", {schema: 'tag', data: tag});
                                   //         }
                                   //     }
                                   //
                                   // }
                                   // menuTagsShown.push(uniqMenuTags[0].name);
                                   uniqMenuTags[0].active = true;
                                   uniqMenuTags.unshift({
                                     name: "all"
                                   });
                                   // $scope.pageData.content[$scope.pageData.active.org.uniqname].items.tagsShown = menuTagsShown;
                                   $scope.pageData.content[$scope.pageData.active.org.uniqname].items.uniqMenuTags = uniqMenuTags;
                               }
                            });
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

        $scope.updateCard = function(p, item) {
            if (typeof item.tags == "string") {
              item.tags = item.tags.split(",");
            }
            var data = {
                schema: p,
                data: item
            };
            console.log(item);
            $http.put("/backendServices/updateCard", data)
                .then(function(res) {
                    if (!res.data.success) console.log(res.data.err);
                });
        };
        $scope.dupCard = function(p, item) {
            var data = {
                schema: p,
                data: item
            };
            $http.post("/backendServices/dupCard", data)
                .then(function(res) {
                   if (res.data.success) {
                       res.data.data.newCard = true;
                       $scope.pageData.content[$scope.pageData.active.org.uniqname][p + "s"].data.unshift(res.data.data);
                   } else {
                       swal("Error", "Unfortunately, the document could not be duplicated", "error");
                   }
                });
        };
        $scope.initCreateCard = function(p) {
          $scope.evInit = {
            img: "/img/icons/unknown.png"
          }
          $("#ev-overlay").addClass("show-block");
          $("#init-card").addClass("show-block");
        }
        $scope.clearOverlays = function() {
          $("#ev-overlay").removeClass("show-block");
          $("#init-card").removeClass("show-block");
          $("#tag-settings").removeClass("show-block");
        }
        $scope.createCard = function(p) {
            var data = {
                schema: p,
                data: $scope.evInit
            }
            data.data.clientID = $scope.pageData.active.org._id;
            $http.post("/backendServices/createCard", data)
                .then(function(res) {
                    if (res.data.success) {
                      $scope.clearOverlays();
                      $scope.pageData.content[$scope.pageData.active.org.uniqname][p + "s"].data.push(res.data.data);
                      $("#evbox-" + res.data.data._id).addClass("new-card");
                    }
                });
        };
        $scope.deleteCard = function(p, item) {
            var data = {
                schema: p,
                data: item
            };
            swal({
                    title: "Are you sure?",
                    text: "You will not be able to recover this document!",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Yes, delete it!",
                    closeOnConfirm: false
                }, function() {
                    $http.post("/backendServices/deleteCard", data)
                        .then(function(res) {
                            if (!res.data) {
                                swal("Error", "Unfortunately, the document could not be deleted", "error");
                            } else {
                                var idx = -1;
                                for (var i = 0; i < $scope.pageData.content[$scope.pageData.active.org.uniqname][p + "s"].data.length; ++i) {
                                  if ($scope.pageData.content[$scope.pageData.active.org.uniqname][p + "s"].data[i]._id == item._id) {
                                    idx = i;
                                    break;
                                  }
                                }
                                $scope.pageData.content[$scope.pageData.active.org.uniqname][p + "s"].data.splice(idx,1);
                                swal("Success", "the " + p + " was deleted", "success");
                            }
                        });
            });
        };

        var sortArray = function(oArr) {
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
        var minOrder = function(arr) {
          var min = arr[0].order;
          for (var i = 1; i < arr.length; i++) {
              if (arr[i].order < min) min = arr[i].order;
          }
          return min;
        };
        var maxOrder = function(arr) {
            var max = arr[0].order;
            for (var i = 1; i < arr.length; i++) {
                if (arr[i].order > max) max = arr[i].order;
            }
            return max;
        };
        var setServiceParam = function(str) {
            $location.path("/dashboard/"+$scope.pageData.active.org.uniqname+"/"+str);
        };

        $scope.toggleService = function(s) {
            setServiceParam(s);
            $scope.pageData.active.service = s;
        };
        $scope.toggleOrg = function(o) {
            $scope.pageData.active = {
                org: o
            };
            $location.path("/dashboard/"+o.uniqname);
        };
        $scope.toggleOrgNav = function() {
          $("#ent-nav").toggleClass("slide-block");
          $(".pane-body").toggleClass("col-10").toggleClass("col-9");
        }
        $scope.rotateOrg = function() {
            $scope.pageData.active = {
                org: $scope.userData.orgs[($scope.userData.orgs.indexOf($scope.pageData.active.org) + 1) % $scope.userData.orgs.length]
            };
            $location.path("/dashboard/"+$scope.pageData.active.org.uniqname);
        };
        $scope.toggleCard = function(id) {
            $("#edits-" + id).slideToggle();
        };
        $scope.toggleTag = function(tag) {
            tag.active = !tag.active;
            var idx = $scope.pageData.content[$scope.pageData.active.org.uniqname].items.tagsShown.findIndex(function(o) { return o === tag.name});
            if (idx < 0) $scope.pageData.content[$scope.pageData.active.org.uniqname].items.tagsShown.push(tag.name);
            else delete $scope.pageData.content[$scope.pageData.active.org.uniqname].items.tagsShown[idx];
        };
        $scope.tagShown = function(tag) {
            if ($scope.itemSelectionKey.name == "all") return true;
            for (var i = 0; i < tag.tags.length; i++) {
                if (tag.tags[i] == $scope.itemSelectionKey.name) return true;
            }
            return false;
        };
        $scope.removeActiveTag = function() {
            delete $scope.pageData.active['tag'];
        };
        $scope.updateTag = function() {
            if ($scope.pageData.active.tag.placeholder === $scope.pageData.active.tag.name) return;
            for (var i = 0; i < $scope.pageData.content[$scope.pageData.active.org.uniqname].items.data.length; i++) {
                var item = $scope.pageData.content[$scope.pageData.active.org.uniqname].items.data[i];
                var idx = item.tags.indexOf($scope.pageData.active.tag.name);
                if (idx > -1) {
                    item.tags[idx] = $scope.pageData.active.tag.placeholder;
                    $http.put("/backendServices/updateCard", {schema: 'item', data: item});
                }
            }
            $scope.pageData.active.tag.name = $scope.pageData.active.tag.placeholder;
            $http.put("/backendServices/updateCard", {schema: 'tag', data: $scope.pageData.active.tag});
        };
        $scope.deleteTag = function(tag) {
            var data = {
                schema: 'tag',
                data: tag
            };
            swal({
                title: "Are you sure?",
                text: "You will not be able to recover this document!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, delete it!",
                closeOnConfirm: false
            }, function() {
                $http.post("/backendServices/deleteCard", data)
                    .then(function(res) {
                        console.log(res);
                        if (!res.data.data) {
                            swal("Error", "Unfortunately, the document could not be deleted", "error");
                        } else {
                            var idx = $scope.pageData.content[$scope.pageData.active.org.uniqname].items.uniqMenuTags.findIndex(function(o) {return o.name == res.data.data.name});
                            $scope.pageData.content[$scope.pageData.active.org.uniqname].items.uniqMenuTags.splice(idx,1);
                            swal("Success", "the tag was deleted", "success");

                            for (var i = 0; i < $scope.pageData.content[$scope.pageData.active.org.uniqname].items.data.length; i++) {
                                var item = $scope.pageData.content[$scope.pageData.active.org.uniqname].items.data[i];
                                var idx = item.tags.indexOf($scope.pageData.active.tag.name);
                                if (idx > -1) {
                                    item.tags.splice(idx, 1);
                                    $http.put("/backendServices/updateCard", {schema: 'item', data: item});
                                }
                            }
                        }
                    });
            });
        };
        $scope.dropCallback = function(idx, item) {
            var pidx = $scope.pageData.content[$scope.pageData.active.org.uniqname].items.placeholder;
            if (pidx < idx) idx -= 1;
            console.log(idx);
            if (idx == $scope.pageData.content[$scope.pageData.active.org.uniqname].items.placeholder) return;

            if (idx == 0) item.order = minOrder($scope.pageData.content[$scope.pageData.active.org.uniqname].items.data) - 1;
            else if (idx == $scope.pageData.content[$scope.pageData.active.org.uniqname].items.data.length - 2) item.order = maxOrder($scope.pageData.content[$scope.pageData.active.org.uniqname].items.data) + 1;
            else {
                var prev = $scope.pageData.content[$scope.pageData.active.org.uniqname].items.data[idx - 1].order;
                var next = $scope.pageData.content[$scope.pageData.active.org.uniqname].items.data[idx + 1].order;
                var mid = (next - prev) * 0.95;
                item.order = prev + mid;
            }
            console.log(item.order);
            $scope.updateCard('item', item);
            $scope.pageData.content[$scope.pageData.active.org.uniqname].items.data = sortArray($scope.pageData.content[$scope.pageData.active.org.uniqname].items.data);
        };

        $scope.updateCardFilter = function(key) {
          $scope.eventOrdering = $scope.possibleEventOrderings[key];
        }
        $scope.updateItemCardFilter = function(key) {
          $scope.itemSelectionKey.name = key.name;
        }

        $scope.possibleEventOrderings = {
          "dateN": {
            field: "start",
            reverse: true
          },
          "dateO": {
            field: "start",
            reverse: false
          },
          "featured": {
            field: "featured",
            reverse: true
          },
          "title":{
              field: "title",
              reverse: false
          }
        }
        $scope.eventOrderKey = "dateN";
        $scope.eventOrdering = $scope.possibleEventOrderings["dateN"];

        $scope.itemSelectionKey = {
          name: "all"
        };

        $scope.displayTagSettings = function() {
          $("#tag-settings").addClass("show-block");
          $("#ev-overlay").addClass("show-block");
        }

        $scope.createMenuTag = function(tag) {
          if (!tag) return;
          var tag = {
            name: tag,
            clientID: $scope.pageData.active.org._id
          };
          var postData = {
            schema: "tag",
            data: tag
          };

          $.post("/backendServices/createCard", postData)
            .then(function(res) {
                if (res.success) {
                  $scope.pageData.content[$scope.pageData.active.org.uniqname].items.uniqMenuTags.splice(1,0,res.data);
                  $scope.$apply();
                } else {
                  console.log("ay");
                }
            });
        }

        $scope.previewEvent = function(ev) {

        }



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
    app.directive("clToggle", function() {
        return {
            restrict: "A",
            link: function(scope, el, attrs) {
                $(el).click(function() {
                   $(this).toggleClass("is-active");
                   $($(this).attr("data-target-left")).toggleClass("nav-active");
                   $($(this).attr("data-target-right")).toggleClass("body-active");
                });
            }
        }
    });
    app.directive("ntToggle", function() {
        return {
            restrict: "A",
            link: function(scope, el, attrs) {
                $(el).click(function() {
                    var drop = new Drop({
                        target: $("#test"),
                        content: 'Welcome to the future!',
                        position: 'bottom left',
                        openOn: 'click'
                    });
                    alert("wassup 1");
                });
            }
        }
    });
}());
