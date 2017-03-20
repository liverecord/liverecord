/**
 * Created by zoonman on 11/27/16.
 */

app.controller(
    'AdminController',
    ['socket',
     '$scope',
     '$routeParams',
     '$timeout',
     'PerfectScrollBar',
     '$localStorage',
     '$document',
     function(socket,
              $scope,
              $routeParams,
              $timeout,
              PerfectScrollBar,
              $localStorage,
         $document) {

       $scope.command = '';
       //
       $scope.broadcastCommand = function() {
         'use strict';
         console.log('aaa', $scope.command);
         socket.emit('command', $scope.command);
       };


     }
    ]
);
