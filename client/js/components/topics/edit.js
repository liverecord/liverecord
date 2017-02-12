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
      'CategoriesFactory',
      'socket',
      function(
          $document,
          $localStorage,
          $location,
          $scope,
          $timeout,
          $routeParams,
          CategoriesFactory,
          socket) {

        var socketUploader;

        $scope.topic = {
          title: '',
          body: '',
          private: false,
          acl: []
        };
        $scope.topic.category = CategoriesFactory.active() || '';



        $scope.previewHtml = '';
        $scope.lookupEmail = '';

        $scope.sendButtonActive = false;

        var refreshTitle = function() {
          $document[0].title = 'Создать тему ' +
              ($scope.topic.title || '') +
              ' в разделе ' +
              ($scope.topic.category.name || '') +
              ' на форуме СПО';
        };

        refreshTitle();
        $timeout(refreshTitle, 5000);

        var storageTitleKey = function() {
          return 'topic_new_title_' + $scope.topic.category._id;
        };

        var storageBodyKey = function() {
          return 'topic_new_body_' + $scope.topic.category._id;
        };

        $scope.topic
            .title = $localStorage[storageTitleKey()] || '';
        $scope.topic
            .body = $localStorage[storageBodyKey()] || '';

        $scope.editing = !!$routeParams.slug;

        if ($routeParams.slug) {
          socket.emit('topic.get', {slug: $routeParams.slug}, function(response) {
            if (response.success) {
              $scope.topic = response.topic;
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

        var sending = false;
        $scope.removeFromAcl = function(friend) {
          'use strict';
          $scope.topic.acl = $scope.topic.acl.filter(function(item) {
            return item._id != friend._id;
          });
        };
        $scope.lookupAndAddToAcl = function() {
          'use strict';
          socket.emit('user.lookup', $scope.lookupEmail, function(result) {
            if (result.success) {
              $scope.topic.acl = array_id_merge($scope.topic.acl, [result.user]);
              $scope.lookupEmail = '';
            } else {
              alert('Email "' + $scope.lookupEmail + '" не найден! ' +
                  'Пользователь должен быть зарегистрирован на форуме.');
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
                $timeout(function() {
                  $location.path(
                      '/' + $scope.topic.category.slug + '/' +
                      confirmation.data.slug
                  );
                }, 100);
              }
            });
          } else {
            alert('Проверьте правильность заполнения полей!');
          }
        };


        $scope.$on('$destroy', function(event) {
              if (socketUploader) {
                socketUploader.disconnect();
              }
            }
        );

        try {
          socketUploader = io.connect();
          var uploader = new SocketIOFileUpload(socketUploader);
          // uploader.maxFileSize = 1024 * 1024 * 10;

          document
              .getElementById('pickFile')
              .addEventListener('click', uploader.prompt, false);

          //uploader.listenOnDrop(document.getElementById("topic"));

          var commentElement = document.getElementById('questionDetails');
          uploader.listenOnDrop(commentElement);
          var acceptObject = function(event) {
            commentElement.style.cursor = 'copy';
            commentElement.style.backgroundColor = '#81A5D4';
          };
          var declineObject = function(event) {
            commentElement.style.cursor = 'none';
            commentElement.style.backgroundColor = '';
          };
          var restoreTarget = function(event) {
            commentElement.style.cursor = 'default';
            commentElement.style.backgroundColor = '';
          };

          commentElement.addEventListener('dragenter', function(event) {
                acceptObject(event);
              }
          );
          commentElement.addEventListener('dragover', function(event) {
                acceptObject(event);
              }
          );
          commentElement.addEventListener('dragleave', function(event) {
                restoreTarget(event);
              }
          );
          commentElement.addEventListener('drop', function(event) {
                restoreTarget(event);
              }
          );
          commentElement.addEventListener('dragend', function(event) {
                restoreTarget(event);
              }
          );
          commentElement.addEventListener('dragexit', function(event) {
                restoreTarget(event);
              }
          );

          socketUploader.on('file.uploaded', function(payload) {
                console.log(payload);
                var url = '/' + payload.absolutePath.replace(/^\//, '');

                var text = '\n<a href="' + url + '">';

                const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif'];
                if (IMAGE_EXTENSIONS.indexOf(payload.extension) > -1) {
                  // an image
                  text += '<img src="' + url + '" alt="' +
                      payload.friendlyName + '"';
                  if (payload.hasAlpha) {
                    text += ' class="alpha"';
                  }
                  text += '>';
                } else {
                  text += payload.friendlyName;
                }
                text += '</a>\n';

            $scope.topic.body = $scope.topic.body + text;
                $scope.$applyAsync();
              }
          );
          uploader.addEventListener('error', function(data) {
                if (data.code === 1) {
                  alert('Используйте файлы не более 10 MB');
                }
                console.log('upload error', data);
              }
          );

        }
        catch (e) {
          console.error(e)
        }

        //

      }]);
