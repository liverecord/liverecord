/**
 * Created by zoonman on 12/12/16.
 */


app.controller('WelcomeController',
    ['$scope',
      'socket',
      '$rootScope',
      '$window',
      'PerfectScrollBar',
      '$document',

      function($scope,
          socket,
          $rootScope,
          $window,
          PerfectScrollBar,
          $document) {

        console.log('WelcomeController...')

        PerfectScrollBar.setup('topic');

        $document[0].title = 'LinuxQuestions';

      }
    ]
);

