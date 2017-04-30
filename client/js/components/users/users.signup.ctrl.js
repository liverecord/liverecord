/**
 * Created by zoonman on 11/27/16.
 */

app.controller('UsersSignUpController',
    ['socket',
     '$scope',
     'PerfectScrollBar',
     '$document',
     '$translate',
     function(socket, $scope, PerfectScrollBar, $document, $translate) {
       //
       $document[0].title = 'Sign Up';
       $translate('Sign Up').then(function(translation) {
         $document[0].title = translation;
       });
       PerfectScrollBar.setup('topic');
     }
    ]
);
