/**
 * Created by zoonman on 12/12/16.
 */

/**
 *
 * @param {{Object}} socket
 * @param {{Object}}  $rootScope
 * @param {{Object}}  $scope
 * @param {{Object}}  $window
 * @param {{Object}}  $localStorage
 * @param {{Object}}  $sessionStorage
 */
function usersLoginController(socket,
    $rootScope,
    $scope,
    $window,
    $translate,
    $localStorage,
    $sessionStorage) {

  var l = {

  };

  if ($rootScope.user) {
    $scope.user = $rootScope.user;
  } else {
    $scope.user = false;
  }
  $scope.authData = {email: '', 'password': ''};

  $localStorage.$default({
        rememberMe: true
      }
  );

  if ($localStorage.rememberMe) {
    $scope.authData.rememberMe = true;
  }

  $scope.sending = false;
  $scope.message = '';
  $scope.auth = function() {
    $scope.sending = true;
    $localStorage.rememberMe = $scope.authData.rememberMe;
    $scope.message = '';
    socket.emit('login', $scope.authData, function(response) {
          $scope.sending = false;
          if (response.success) {

            if ($localStorage.rememberMe) {
              $scope.authData.rememberMe = true;
              $localStorage.jwt = response.token;
            } else {
              $sessionStorage.jwt = response.token;
            }
            $rootScope.user = angular.copy(response.user);
            socket.emit('authenticate', {token: response.token});
          } else {

            $translate(response.error).then(function(translation) {
              $scope.message = translation || 'error';
            });
          }
        }
    );
  };
}

app.component('usersLoginForm', {
      templateUrl: '/dist/t/users.login.tpl',
      controller: usersLoginController,
      bindings: {
        user: '='
      }
    }
);
