/**
 * Created by zoonman on 11/27/16.
 */

app.controller('UsersInfoController',
    ['socket',
     '$scope',
     'PerfectScrollBar',
     '$routeParams',
     '$document',
     function(socket, $scope, PerfectScrollBar, $routeParams, $document) {
       //
       $document[0].title = '';
       $scope.userInfo = {};
       socket.emit('user', {slug: $routeParams.slug}, function(response) {
         $scope.userInfo = response;
         $document[0].title = response.name;
         PerfectScrollBar.setup('topic');
       });
       PerfectScrollBar.setup('topic');
     }
    ]
);
