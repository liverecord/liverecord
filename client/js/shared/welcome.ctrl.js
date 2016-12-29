/**
 * Created by zoonman on 12/12/16.
 */


app.controller('WelcomeCtrl', ['$scope', 'socket', '$rootScope','$window', 'PerfectScrollBar', function($scope, socket, $rootScope, $window, PerfectScrollBar) {
    console.log('WelcomeCtrl...')
    PerfectScrollBar.setup('topic');
}]);

