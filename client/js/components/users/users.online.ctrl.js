/**
 * Created by zoonman on 11/27/16.
 */

app.controller('UsersOnlineController',
    ['socket',
     '$scope',
     'PerfectScrollBar',
     '$routeParams',
     function(socket, $scope, PerfectScrollBar, $routeParams) {
       //
       $scope.users = [];
       socket.emit('user.online', {}, function(response) {
             $scope.users = response.users || [];

             PerfectScrollBar.setup('topic');

           }
       );
     }
    ]
);
