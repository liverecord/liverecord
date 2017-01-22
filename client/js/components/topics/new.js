/**
 * Created by zoonman on 12/16/16.
 */

app.controller(
    'NewTopicCtrl',
    [
      '$document',
      '$localStorage',
      '$location',
      '$scope',
      '$timeout',
      'CategoriesFactory',
      'socket',
      function(
          $document,
          $localStorage,
          $location,
          $scope,
          $timeout,
          CategoriesFactory,
          socket) {

        $scope.question = {
          title: '',
          body: ''
        };
        $scope.question.category = CategoriesFactory.active() || '';

        $scope.question
            .title = $localStorage['topic_new_title_' +
            $scope.question.category._id] || '';
        $scope.question
            .body = $localStorage['topic_new_body_' +
            $scope.question.category._id] || '';


        $scope.previewHtml = '';

        $scope.sendButtonActive = false;

        var refreshTitle = function() {
          $document[0].title = 'Создать тему ' +
              ($scope.question.title || '') +
              ' в разделе ' +
              ($scope.question.category.name || '') +
              ' на форуме СПО';
        };

        refreshTitle();
        $timeout(refreshTitle, 5000);

        var storageTitleKey = function() {
          return 'topic_new_title_' + $scope.question.category._id;
        };

        var storageBodyKey = function() {
          return 'topic_new_body_' + $scope.question.category._id;
        };

        $scope.$watch('question.category', refreshTitle);


          $scope.$watch('question.title', function(newValue, oldValue) {
          if (newValue) {
            $scope.sendButtonActive = newValue.length >= 1;
            $localStorage[storageTitleKey()] = $scope.question.title;
          } else {
            $scope.sendButtonActive = false;
            if ($localStorage[storageTitleKey()]) {
              delete $localStorage[storageTitleKey()];
            }
          }
          refreshTitle();
          return newValue;
        });
        $scope.$watch('question.body', function(newValue, oldValue) {
          if (newValue) {
            $scope.sendButtonActive = newValue.length >= 1;
            $localStorage[storageBodyKey()] = $scope.question.body;
          } else {
            $scope.sendButtonActive = false;
            if ($localStorage[storageBodyKey()]) {
              delete $localStorage[storageBodyKey()];
            }
          }
          return newValue;
        });

        var sending = false;
        $scope.ask = function() {
          if (!sending && $scope.question.title.length > 0) {
            sending = true;
            socket.emit('ask', $scope.question, function(confirmation) {
              sending = false;
              console.log('confirmation', confirmation);
              $scope.question.title = '';
              $scope.question.body = '';
              $scope.$applyAsync();
              $location.path(
                  '/' + $scope.question.category.slug + '/' +
                  confirmation.data.slug
              );
            });
          }
        };
      }]
);
