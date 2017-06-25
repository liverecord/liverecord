/**
 * Created by zoonman on 11/27/16.
 */

app.controller('UsersSignInController',
    ['socket',
      '$scope',
      'PerfectScrollBar',
      '$routeParams',
      '$document',
      '$rootScope',
      '$location',
      '$translate',
      function(socket,
          $scope,
          PerfectScrollBar,
          $routeParams,
          $document,
          $rootScope,
          $location,
          $translate) {
        //
        $document[0].title = 'Sign In';
        $translate('Sign In').then(function(translation) {
          $document[0].title = translation;
        });
        PerfectScrollBar.setup('topic');

        $scope.$watch('user', function(n, o) {
          if ($scope.user && n) {
            $location.path('/users/' + $scope.user.slug);
          }
        });

      }
    ]
);
