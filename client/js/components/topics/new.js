/**
 * Created by zoonman on 12/16/16.
 */

app.controller(
    'NewTopicCtrl',
    ['socket',
      '$scope',
      'CategoriesFactory',
      '$location',
      '$document',
      '$localStorage',
      function(socket, $scope, CategoriesFactory, $location, $document, $localStorage) {

        $scope.question = {
          title: '',
          body: ''
        };
        $scope.question.category = CategoriesFactory.active();

        $scope.question.title = $localStorage['topic_new_title_' + $scope.question.category._id] || '';
        $scope.question.body = $localStorage['topic_new_body_' + $scope.question.category._id] || '';



        $document[0].title = 'Создать тему ' + $scope.question.title + ' на форуме';

        $scope.previewHtml = '';
        if ($scope.categories) {

        }

        $scope.sendButtonActive = false;


        $scope.$watch('question.title', function(newValue, oldValue) {
          if (newValue) {
            $scope.sendButtonActive = newValue.length >= 1;
            $localStorage['topic_new_title_' + $scope.question.category._id] = $scope.question.title;
          } else {
            $scope.sendButtonActive = false;
            if ($localStorage['topic_new_title_' + $scope.question.category._id]) {
              delete $localStorage['topic_new_title_' + $scope.question.category._id];
            }
          }
          return newValue;
        });
        $scope.$watch('question.body', function(newValue, oldValue) {
          if (newValue) {
            $scope.sendButtonActive = newValue.length >= 1;
            $localStorage['topic_new_body_' + $scope.question.category._id] = $scope.question.body;
          } else {
            $scope.sendButtonActive = false;
            if ($localStorage['topic_new_body_' + $scope.question.category._id]) {
              delete $localStorage['topic_new_body_' + $scope.question.category._id];
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
