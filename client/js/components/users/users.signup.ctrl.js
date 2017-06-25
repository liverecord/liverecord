/**
 * Created by zoonman on 11/27/16.
 */

app.controller('UsersSignUpController',
    ['socket',
     '$scope',
     'PerfectScrollBar',
     '$document',
     '$location',
     '$translate',
     function(socket, $scope, PerfectScrollBar, $document, $location, $translate) {
       //
       $document[0].title = 'Sign Up';
       $translate('Sign Up').then(function(translation) {
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
