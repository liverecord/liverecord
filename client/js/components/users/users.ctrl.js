/**
 * Created by zoonman on 11/27/16.
 */

app.controller('UsersCtrl', ['socket', '$scope', 'PerfectScrollBar', '$routeParams', function(socket, $scope, PerfectScrollBar, $routeParams) {
    //
    $scope.userInfo = {};
    socket.emit('user', {slug: $routeParams.slug}, function(response) {
        $scope.userInfo = response;

        PerfectScrollBar.setup('topic');

    });

}]);
