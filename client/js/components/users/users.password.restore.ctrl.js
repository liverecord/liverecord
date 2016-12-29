/**
 * Created by zoonman on 11/27/16.
 */

app.controller('UsersPasswordRestoreCtrl', ['socket', '$scope', '$timeout', function(socket, $scope, $timeout) {
    //
    $scope.authData = {email: ''};
    $scope.message = '';
    $scope.sending = false;
    $scope.send = function() {
        $scope.sending = true;
        socket.emit('user.password.restore', {email: $scope.authData.email}, function(response) {
            $scope.message = 'Отправлено! Доставка почты обычно в пределах нескольких минут. Если через 15 минут вы не получили письмо, проверьте папку Спам.';
            $scope.sending = false;
        });
    };

}]);
