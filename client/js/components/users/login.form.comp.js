/**
 * Created by zoonman on 12/12/16.
 */

function usersLoginController(socket, $rootScope, $scope, $window, $localStorage, $sessionStorage) {

    var l = {
        jwt_cannot_be_created: 'Проход в рай запрещен',
        password_verification_failed: 'Что-то не то с паролем, давай еще разок.',
        password_mismatch: 'Коль не помнишь свой пароль, попробуй восстанови',
        users_hash_cannot_be_created: 'Кошмар какой-то, нельзя создать хэш пароля! Скажи разрабу, что он ленивая скотина, накосячила в коде.',
        user_cannot_be_saved: 'Кишильбе-Мишельбе Насяльника, низя юзерва создавать никак! База упаля...'
    };

    if ($rootScope.user) {
        $scope.user = $rootScope.user;
    } else {
        $scope.user = false;
    }
    $scope.authData = {email: '', 'password': ''};

    $localStorage.$default({
        rememberMe: true
    });

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
            console.log('l',response);
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
                $scope.message = l[response.error] || 'error';
            }
        });
    };
}

app.component('usersLoginForm', {
    templateUrl: '/dist/t/users.login.tpl',
    controller: usersLoginController,
    bindings: {
        user: '='
    }
});
