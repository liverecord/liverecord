/**
 * Created by zoonman on 12/12/16.
 */


app.controller('WelcomeCtrl', ['$scope', 'socket', '$rootScope','$window', 'PerfectScrollBar', '$document', function($scope, socket, $rootScope, $window, PerfectScrollBar, $document) {
    console.log('WelcomeCtrl...')
    PerfectScrollBar.setup('topic');

    $document[0].title = 'LinuxQuestions';

}]);

