/**
 * Created by zoonman on 12/16/16.
 */

app.controller(
    'EditTopicController',
    [
      '$document',
      '$localStorage',
      '$location',
      '$scope',
      '$timeout',
      '$routeParams',
      '$translate',
      'CategoriesFactory',
      'socket',
      'wpf',
      function(
          $document,
          $localStorage,
          $location,
          $scope,
          $timeout,
          $routeParams,
          $translate,
          CategoriesFactory,
          socket,
          wpf) {

        $scope.topic = {
          category: {_id: '', name: ''},
          title: '',
          body: '',
          private: false,
          acl: []
        };

        $scope.previewHtml = '';
        $scope.lookupEmail = '';

        $scope.sendButtonActive = false;

        var refreshTitle = function() {


          $translate([
            'Create topic',
            'inside section',
            'on forum'
          ])
              .then(function(translations) {
                'use strict';
                $document[0].title = translations['Create topic'] + ' "' +
                    ($scope.topic.title || '') +
                    '"  ' +
                    translations['inside section'] + ' ' +
                    ($scope.topic.category.name || '') + ' ' +
                    translations['on forum'];
              });
        };

        refreshTitle();
        $timeout(refreshTitle, 5000);

        var storageTitleKey = function() {
          return 'topic_new_title_' + $scope.topic.category._id;
        };

        var storageBodyKey = function() {
          return 'topic_new_body_' + $scope.topic.category._id;
        };

        var storageAclKey = function() {
          return 'topic_new_acl_' + $scope.topic.category._id;
        };

        CategoriesFactory.load().then(function() {

          $scope.topic.category = CategoriesFactory.active() || '';

          $scope.topic
              .title = $localStorage[storageTitleKey()] || '';
          $scope.topic
              .body = $localStorage[storageBodyKey()] || '';
          $scope.topic
              .acl = $localStorage[storageAclKey()] || [];
          $scope.editing = !!$routeParams.slug;

        }).catch(console.log);


        if ($routeParams.slug) {
          socket.emit('topic.get', {slug: $routeParams.slug}, function(res) {
            if (res.success) {
              $scope.topic = res.topic;
            }
          });
        }



        $scope.$watch('topic.category', refreshTitle);


        $scope.$watch('topic.title', function(newValue, oldValue) {
          if (newValue) {
            $scope.sendButtonActive = newValue.length >= 1;
            $localStorage[storageTitleKey()] = $scope.topic.title;
          } else {
            $scope.sendButtonActive = false;
            if ($localStorage[storageTitleKey()]) {
              delete $localStorage[storageTitleKey()];
            }
          }
          refreshTitle();
          return newValue;
        });
        $scope.$watch('topic.body', function(newValue, oldValue) {
          if (newValue) {
            $scope.sendButtonActive = newValue.length >= 1;
            $localStorage[storageBodyKey()] = $scope.topic.body;
          } else {
            $scope.sendButtonActive = false;
            if ($localStorage[storageBodyKey()]) {
              delete $localStorage[storageBodyKey()];
            }
          }
          return newValue;
        });

        $scope.$watch('topic.acl', function(newValue, oldValue) {
          if (newValue) {
            $localStorage[storageAclKey()] = $scope.topic.acl;
          } else {
            if ($localStorage[storageAclKey()]) {
              delete $localStorage[storageAclKey()];
            }
          }
          if ($scope.topic.acl) {
            $scope.topic.private = !! $scope.topic.acl.length;
          } else {
            $scope.topic.private = false;
          }
          return newValue;
        });

        var sending = false;
        $scope.removeFromAcl = function(friend) {
          'use strict';
          $scope.topic.acl = $scope.topic.acl.filter(function(item) {
            return item._id !== friend._id;
          });
        };
        $scope.showSearchResults = false;
        $scope.updateSearchResults = function(results) {
          $scope.searchResults = results.filter(function(item) {
            return $scope.topic.acl.indexOf(item) === -1;
          });
          $scope.showSearchResults = !! $scope.searchResults.length;
        };
        $scope.runSearch = function() {

          if ($localStorage['userSearch'] &&
              $localStorage['userSearch'][$scope.lookupEmail]) {

            var results = $localStorage['userSearch'][$scope.lookupEmail];
            $scope.updateSearchResults(results || []);
            $timeout(function() {
              $scope.showSearchResults = !! $scope.searchResults.length;
            }, 100);
          } else {
            socket.emit('user.search', $scope.lookupEmail, function(results) {
              'use strict';
              $scope.updateSearchResults(results);
              if (!$localStorage['userSearch']) {
                $localStorage['userSearch'] = {};
              }
              $localStorage['userSearch'][$scope.lookupEmail] = results;
              $scope.showSearchResults = !! results.length;
              $timeout(function() {
                $scope.showSearchResults = !! results.length;
              }, 100);
            });
          }
        };

        $scope.docClick = function() {
          $scope.showSearchResults = false;
        };

        $scope.addToAcl = function(item, evt) {
          'use strict';
          $scope.topic.acl = array_id_merge($scope.topic.acl, [item]);
          if (evt) {
            evt.preventDefault();
            evt.cancelBubble = true;
          }
          $scope.updateSearchResults($scope.searchResults || []);
        };
        $scope.lookupAndAddToAcl = function() {
          'use strict';
          socket.emit('user.lookup', $scope.lookupEmail, function(result) {
            if (result.success) {
              $scope.addToAcl(result.user);
              $scope.lookupEmail = '';
            } else {
              $translate(
                  'Email {{email}} not found.',
                  {email: $scope.lookupEmail}
              )
                  .then(function(translation) {
                    alert(translation);
                  });
            }
          });
        };



        $scope.ask = function() {

          console.log($scope.addNewTopic);
          if (!sending &&
              $scope.topic.title.length > 0 &&
              $scope.addNewTopicForm.$valid) {
            sending = true;
            socket.emit('topic.save', $scope.topic, function(confirmation) {
              sending = false;
              console.log('confirmation', confirmation);
              if (confirmation.errors) {
                // error!
              } else {
                $scope.topic.title = '';
                $scope.topic.body = '';
                $scope.$applyAsync(); // reset local storage
                wpf.subscribe();
                $timeout(function() {
                  $location.path(
                      '/' + $scope.topic.category.slug + '/' +
                      confirmation.data.slug
                  );
                }, 100);
              }
            });
          } else {
            translate('Check your form data').then(function(translation) {
              alert(translation);
            });

          }
        };

        $timeout(function() {
          if ($routeParams.user) {
            $scope.topic.private = true;
            $scope.lookupEmail = $routeParams.user;
            $scope.lookupAndAddToAcl();
          }
        }, 100);





        //

      }]);
