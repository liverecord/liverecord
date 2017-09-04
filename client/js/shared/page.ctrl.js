/**
 * Created by zoonman on 12/12/16.
 */


app.controller('PageController',
    ['$scope',
      'socket',
      '$rootScope',
      '$window',
      'PerfectScrollBar',
      '$document',
      '$routeParams',

      function($scope,
          socket,
          $rootScope,
          $window,
          PerfectScrollBar,
          $document,
          $routeParams
          ) {

        console.log('PageController...')

        PerfectScrollBar.setup('topic');
        socket.emit(
            'page',
            {path: $routeParams.path || 'welcome'},
            function(err, data) {
              console.log('page:' , data, err)
              $scope.page = data;
              $document[0].title = data.title;
            });

        $document[0].title = '';

      }
    ]
);

