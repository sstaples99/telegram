const angular = require('angular');
const $ = require('jquery');
const _ = require('lodash');
const swal = require('sweetalert');
require('jquery-ui-bundle');
require('jquery-datetimepicker');

((() => {
  const app = angular.module('telegram');

  app.controller(
    'DashController',
    ['$scope',
      '$http',
      '$window',
      'Upload',
      '$timeout',
      '$routeParams',
      '$location',
      function ( // eslint-disable-line func-names
        $scope, $http, $window,
        Upload, $timeout, $routeParams, $location,
      ) {
        const $windowRef = $window;

        $scope.checkStatus = () => {
          $http.get('/backendServices/user/isLoggedIn')
            .then((res) => {
              if (!res.data.loggedIn) {
                $windowRef.location = '/';
                return;
              }
              $scope.userData.isLoggedIn = true;
              return $http.get('/backendServices/user/');
            }).then((res) => {
              if (res) {
                if (res.data) $scope.userData.user = res.data;
                else console.log('Error: could not validate user.');
              }
            });
        };

        $scope.getEvents = () => {
          $http.post('/backendServices/event/', $scope.pageData.active.org)
            .then((res) => {
              if (!res.data.success) console.log('Error loading events');
              else {
                const activeOrgName = $scope.pageData.active.org.uniqname;
                $scope.pageData.content[activeOrgName].events = {
                  data: res.data.data,
                };
              }
            });
        };

        $scope.getParties = () => {
          $http.post('/backendServices/party/', $scope.pageData.active.org)
            .then((res) => {
              if (!res.data.success) console.log('Error loading parties');
              else {
                const activeOrgName = $scope.pageData.active.org.uniqname;
                $scope.pageData.content[activeOrgName].parties = {
                  data: res.data.data,
                };
              }
            });
        };
        $scope.getOrgs = () => {
          $http.get('/backendServices/organization/')
            .then((res) => {
              if (!res.data) {
                console.log('Error finding organizations');
                return;
              }
              $scope.userData.orgs = res.data;
              _.forEach($scope.userData.orgs, (org) => {
                $scope.pageData.content[org.uniqname] = {};
              });
              if ($routeParams.org) {
                const idx = $scope.userData.orgs.findIndex(o => o.uniqname === $routeParams.org);
                if (idx > -1) $scope.pageData.active.org = $scope.userData.orgs[idx];
              } else {
                [$scope.pageData.active.org] = $scope.userData.orgs;
                $location.path(`/dashboard/${$scope.pageData.active.org.uniqname}`);
              }
              if ($routeParams.service) {
                const idx = $scope.pageData.active.org.services.indexOf($routeParams.service);
                if (idx > -1) $scope.pageData.active.service = $routeParams.service;
              } else {
                [$scope.pageData.active.service] = $scope.pageData.active.org.services;
                $location.path(`/dashboard/${$scope.pageData.active.org.uniqname}/${$scope.pageData.active.service}`);
              }
            });
        };
        $scope.initMenus = () => {
          $http.post('/backendServices/menu/items', { clientID: $scope.pageData.active.org._id })
            .then((res) => {
              if (!res.data.success) {
                console.log(res.data.err);
              } else {
                $scope.pageData.content[$scope.pageData.active.org.uniqname].items = {
                  data: res.data.data,
                };

                $http.post('/backendServices/menu/', { clientID: $scope.pageData.active.org._id })
                  .then((response) => {
                    if (response.data) {
                      const uniqMenuTags = response.data.data;
                      uniqMenuTags[0].active = true;
                      uniqMenuTags.unshift({
                        name: 'all',
                      });
                      const activeOrgName = $scope.pageData.active.org.uniqname;
                      $scope.pageData.content[activeOrgName].items.uniqMenuTags = uniqMenuTags;
                    }
                  });
              }
            });
        };

        $scope.uploadImg = (item, schema) => {
          const itemRef = item;
          const file = itemRef.imgFile;
          file.upload = Upload.upload({
            url: '/backendServices/upload/img',
            data: {
              file,
              _id: itemRef._id,
              schema,
            },
          });

          file.upload.then((res) => {
            const updatedData = {
              _id: itemRef._id,
              url: res.data.replace('www.dropbox', 'dl.dropboxusercontent'),
            };
            $http.post('/backendServices/card/update', { schema, data: updatedData })
              .then((response) => {
                $timeout(() => {
                  itemRef.img = response.data.img;
                });
              });
          }, (res) => {
            if (res.status > 0) {
              $scope.errorMsg = `${res.status}: ${res.data}`;
            }
          }, (evt) => {
            file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total, 10));
          });
        };

        $scope.updateCard = (p, item) => {
          const itemRef = item;
          if (_.isString(item.tags)) {
            itemRef.tags = item.tags.split(',');
          }
          const data = {
            schema: p,
            data: item,
          };
          $http.put('/backendServices/card/', data)
            .then((res) => {
              if (!res.data.success) console.log(res.data.err);
            });
        };

        $scope.duplicateCard = (p, item) => {
          const data = {
            schema: p,
            data: item,
          };
          $http.post('/backendServices/card/duplicate', data)
            .then((res) => {
              if (res.data.success) {
                res.data.data.newCard = true;
                const activeOrgName = $scope.pageData.active.org.uniqname;
                $scope.pageData
                  .content[activeOrgName][`${p}s`]
                  .data.unshift(res.data.data);
              } else {
                swal('Error', 'Unfortunately, the document could not be duplicated', 'error');
              }
            });
        };

        $scope.initCreateCard = () => {
          $scope.evInit = {
            img: '/img/icons/unknown.png',
          };
          $('#ev-overlay').addClass('show-block');
          $('#init-card').addClass('show-block');
        };

        $scope.clearOverlays = () => {
          $('#ev-overlay').removeClass('show-block');
          $('#init-card').removeClass('show-block');
          $('#tag-settings').removeClass('show-block');
        };

        $scope.createCard = (p) => {
          if ($scope.evInit.tags && _.isString($scope.evInit.tags)) {
            $scope.evInit.tags = $scope.evInit.tags.split(',');
          }
          const data = {
            schema: p,
            data: $scope.evInit,
          };
          data.data.clientID = $scope.pageData.active.org._id;
          $http.post('/backendServices/card/', data)
            .then((res) => {
              if (res.data.success) {
                $scope.clearOverlays();
                const activeOrgName = $scope.pageData.active.org.uniqname;
                $scope.pageData.content[activeOrgName][`${p}s`].data.push(res.data.data);
                $(`#evbox-${res.data.data._id}`).addClass('new-card');
              }
            });
        };

        $scope.deleteCard = (schema, item) => {
          const data = {
            schema,
            data: item,
          };
          swal({
            title: 'Are you sure?',
            text: 'You will not be able to recover this document!',
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DD6B55',
            confirmButtonText: 'Yes, delete it!',
            closeOnConfirm: false,
          }).then(() => {
            $http.post('/backendServices/card/delete', data)
              .then((res) => {
                if (!res.data.success) {
                  swal('Error', 'Unfortunately, the document could not be deleted', 'error');
                } else {
                  const activeOrgName = $scope.pageData.active.org.uniqname;
                  const currentContent = $scope.pageData.content[activeOrgName][`${schema}s`].data;
                  _.remove(currentContent, obj => obj._id === item._id);
                  swal('Success', `the ${schema} was deleted`, 'success');
                }
              });
          });
        };

        $scope.toggleService = (s) => {
          $location.path(`/dashboard/${$scope.pageData.active.org.uniqname}/${s}`);
          $scope.pageData.active.service = s;
        };

        $scope.toggleOrg = (o) => {
          $scope.pageData.active = {
            org: o,
          };
          $location.path(`/dashboard/${o.uniqname}`);
        };

        $scope.toggleOrgNav = () => {
          $('#ent-nav').toggleClass('slide-block');
          $('.pane-body').toggleClass('col-10').toggleClass('col-9');
        };

        $scope.rotateOrg = () => {
          const userOrgs = $scope.userData.orgs;
          let activeOrg = $scope.pageData.active.org;
          const newOrgIdx = (userOrgs.indexOf(activeOrg) + 1) % userOrgs.length;
          activeOrg = userOrgs[newOrgIdx];
          $location.path(`/dashboard/${activeOrg.uniqname}`);
        };

        $scope.toggleCard = (id) => {
          $(`#edits-${id}`).slideToggle();
        };

        $scope.toggleTag = (tag) => {
          const tagRef = tag;
          const activeOrgName = $scope.pageData.active.org.uniqname;
          const pageContent = $scope.pageData.content[activeOrgName];
          tagRef.active = !tagRef.active;
          const idx = pageContent.items.tagsShown.findIndex(o => o === tag.name);
          if (idx < 0) {
            pageContent.items.tagsShown.push(tag.name);
          } else {
            delete pageContent.items.tagsShown[idx];
          }
        };

        $scope.tagShown = (tag) => {
          const tagRef = tag;
          if ($scope.itemSelectionKey.name === 'all') return true;
          if (_.isString(tagRef.tags)) {
            tagRef.tags = tagRef.tags.split(',');
          }
          if (_.includes(tagRef.tags, $scope.itemSelectionKey.name)) return true;
          return false;
        };

        $scope.removeActiveTag = () => {
          delete $scope.pageData.active.tag;
        };

        $scope.updateTag = () => {
          const activeTag = $scope.pageData.active.tag;
          const activeOrgName = $scope.pageData.active.org.uniqname;
          const pageContent = $scope.pageData.content[activeOrgName];
          if (activeTag.placeholder === activeTag.name) return;
          _.forEach(pageContent.items.data, (item) => {
            const itemRef = item;
            const idx = _.findIndex(item.tags, activeTag.name);
            if (idx > -1) {
              itemRef.tags[idx] = activeTag.placeholder;
              $http.put('/backendServices/card/', { schema: 'item', data: item });
            }
          });
          activeTag.name = activeTag.placeholder;
          $http.put('/backendServices/card/', { schema: 'tag', data: activeTag });
        };

        $scope.deleteTag = (tag) => {
          const data = {
            schema: 'tag',
            data: tag,
          };
          swal({
            title: 'Are you sure?',
            text: 'You will not be able to recover this document!',
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DD6B55',
            confirmButtonText: 'Yes, delete it!',
            closeOnConfirm: false,
          }, () => {
            $http.post('/backendServices/card/delete', data)
              .then((res) => {
                if (!res.data.data) {
                  swal('Error', 'Unfortunately, the document could not be deleted', 'error');
                } else {
                  const activeOrgName = $scope.pageData.active.org.uniqname;
                  const pageContent = $scope.pageData.content[activeOrgName];
                  const pageMenuTags = pageContent.items.uniqMenuTags;
                  _.remove(pageMenuTags, o => o.name === res.data.data.name);
                  swal('Success', 'the tag was deleted', 'success');

                  _.forEach(pageContent.items.data, (item) => {
                    const itemRef = item;
                    if (_.isString(itemRef.tags)) itemRef.tags = item.tags.split(',');
                    const activeTagName = $scope.pageData.active.tag.name;
                    const removedTags = _.remove(itemRef.tags, o => o === activeTagName);
                    if (_.size(removedTags) > 0) {
                      $http.put('/backendServices/card/', { schema: 'item', data: item });
                    }
                  });
                }
              });
          });
        };

        $scope.dropCallback = (idx, item) => {
          const itemRef = item;
          const activeOrgName = $scope.pageData.active.org.uniqname;
          const pageContent = $scope.pageData.content[activeOrgName];
          const pidx = pageContent.items.placeholder;
          if (pidx < idx) idx -= 1; // eslint-disable-line no-param-reassign
          else if (idx === pidx) {
            return;
          }

          if (idx === 0) {
            itemRef.order = _.minBy(pageContent.items.data, o => o.order).order - 1;
          } else if (idx === pageContent.items.data.length - 2) {
            itemRef.order = _.maxBy(pageContent.items.data, o => o.order).order + 1;
          } else {
            const prev = pageContent.items.data[idx - 1].order;
            const next = pageContent.items.data[idx + 1].order;
            const mid = (next - prev) * 0.95;
            itemRef.order = prev + mid;
          }
          $scope.updateCard('item', item);
          pageContent.items.data = _.sortBy(pageContent.items.data, ['order']);
        };

        $scope.updateCardFilter = (key) => {
          $scope.eventOrdering = $scope.possibleEventOrderings[key];
        };

        $scope.updateItemCardFilter = (key) => {
          $scope.itemSelectionKey.name = key.name;
        };

        $scope.possibleEventOrderings = {
          dateN: {
            field: 'start',
            reverse: true,
          },
          dateO: {
            field: 'start',
            reverse: false,
          },
          featured: {
            field: 'featured',
            reverse: true,
          },
          title: {
            field: 'title',
            reverse: false,
          },
        };
        $scope.eventOrderKey = 'dateN';
        $scope.eventOrdering = $scope.possibleEventOrderings.dateN;

        $scope.itemSelectionKey = {
          name: 'all',
        };

        $scope.displayTagSettings = () => {
          $('#tag-settings').addClass('show-block');
          $('#ev-overlay').addClass('show-block');
        };

        $scope.createMenuTag = (tag, header) => {
          if (!tag) return;
          const tag1 = {
            name: tag,
            id: tag.replace(/\W/g, ''),
            header_img: header || 'http://www.caseysnewbuffalo.com/img/backgrounds/brunch.jpg',
            clientID: $scope.pageData.active.org._id,
          };
          const postData = {
            schema: 'tag',
            data: tag1,
          };

          $.post('/backendServices/card', postData)
            .then((res) => {
              if (res.success) {
                const activeOrgName = $scope.pageData.active.org.uniqname;
                const pageContent = $scope.pageData.content[activeOrgName];
                pageContent.items.uniqMenuTags.splice(1, 0, res.data);
                $scope.$apply();
              }
            });
        };

        $scope.createTagSubmenu = (submenuTxt, tagID) => {
          $.post('/backendServices/submenu', { menuID: tagID, submenuText: submenuTxt })
            .then((res) => {
              if (res.success) {
                const activeOrgName = $scope.pageData.active.org.uniqname;
                const pageContent = $scope.pageData.content[activeOrgName];
                const uniqTags = pageContent.items.uniqMenuTags;
                const idx = _.findLastIndex(uniqTags, tag => tag._id === tagID);
                uniqTags[idx].submenus.push(submenuTxt);
                $scope.$apply();
              } else {
                console.log(res.err);
              }
            });
        };

        $scope.removeSubmenu = (submenuTxt, tagID) => {
          $.post('/backendServices/submenu/delete', { menuID: tagID, submenuText: submenuTxt })
            .then((res) => {
              if (res.success) {
                const activeOrgName = $scope.pageData.active.org.uniqname;
                const pageContent = $scope.pageData.content[activeOrgName];
                const uniqTags = pageContent.items.uniqMenuTags;
                const idx = _.findLastIndex(uniqTags, tag => tag._id === tagID);
                const submenuIdx = _.findLastIndex(uniqTags[idx].submenus, sm => sm === submenuTxt);
                uniqTags[idx].submenus.splice(submenuIdx, 1);
                $scope.$apply();
              } else {
                console.log(res.err);
              }
            });
        };
      }],
  );

  app.filter('dateInMillis', () => dateString => Date.parse(dateString));

  app.directive('dpLoad', () =>
    ({
      restrict: 'A',
      link: (scope, el) => {
        $(el).datetimepicker();
      },
    }));

  app.directive('clToggle', () =>
    ({
      restrict: 'A',
      link: (scope, el) => {
        $(el).click((evt) => {
          $(evt.currentTarget).toggleClass('is-active');
          $($(evt.currentTarget).attr('data-target-left')).toggleClass('nav-active');
          $($(evt.currentTarget).attr('data-target-right')).toggleClass('body-active');
        });
      },
    }));
})());
