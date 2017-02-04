/**
 * Created by zoonman on 11/27/16.
 */

app.controller('SettingsController',
    ['socket',
     '$scope',
     '$rootScope',
     '$localStorage',
     'PerfectScrollBar',

      'wpf',
      '$document',
      function(socket,
          $scope,
          $rootScope,
          $localStorage,
          PerfectScrollBar,
          wpf,
          $document) {
        //
        var l = {
          bad_slug: 'Используйте другой псевдоним',
          not_found: 'Ошибка сохранения данных, проверьте поля',
          picture_is_bad: 'Используйте другое изображение',
          invalid_email: 'Используйте другой email',
        };

        $scope.l = l;
        $scope.sending = false;
        $scope.message = '';
        $scope.profile = angular.copy($rootScope.user);

        $rootScope.$watch('user', function(newv, oldv) {
          $scope.profile = angular.copy($rootScope.user);
        });

        $scope.$localStorage = $localStorage;

        $document[0].title = 'Настройки';

        $rootScope.experimental = $localStorage.experimental;


        console.log('init SettingsCtrl')

        $scope.$watch('profile', function(newv, oldv) {
          socket.emit('user.validate', $scope.profile, function(response) {
            'use strict';
            console.log('user.validate', response);
            if (response.email) {
              $scope.userForm.email.$valid = false;
              $scope.userForm.email.$invalid = true;
            }
            if (response.slug) {
              $scope.userForm.slug.$valid = false;
              $scope.userForm.slug.$invalid = true;
            }
          });
        });

        $scope.update = function() {
          $scope.sending = true;
          $scope.message = '';
          socket.emit('user.update', $scope.profile, function(response) {
                console.log('l', response);
                $scope.sending = false;
                if (response.success) {
                  $rootScope.user.name = $scope.profile.name;
                  $rootScope.user.email = $scope.profile.email;
                  $rootScope.user.picture = $scope.profile.picture;
                  $rootScope.user.slug = $scope.profile.slug;
                  $rootScope.$applyAsync();
                } else {
                  $scope.message = l[response.error] || 'error';
                }
              }
          );
        };

        try {

          var setupUploader = function() {
            var uploadSocket = io.connect();
            var uploader = new SocketIOFileUpload(uploadSocket);
            uploader.addEventListener('start', function(event) {
                  event.file.meta.avatar = true;
                  console.log(event)

                }
            );
            uploader.listenOnInput(document.getElementById('profileAvatar'));
            uploader.addEventListener('error', function(event) {
                  $scope.message = event.message;
                  $scope.$applyAsync();
                }
            );
            uploadSocket.on('user.avatar', function(payload) {
                  console.log(payload);
                  $scope.profile.picture = window.location.protocol + '//' +
                      window.location.host + '/' + encodeURI(
                          payload.absolutePath.replace(/^\//, '')
                      );
                  $scope.$applyAsync();
                }
            );
          };

          if (socket.self.connected) {
            setupUploader();
          } else {
            socket.on('connect', setupUploader);
          }

        }
        catch (e) {
          console.error(e);
          $scope.$applyAsync();
        }
        $scope.$applyAsync();
        PerfectScrollBar.setup('wrapper');

      }
    ]
);
