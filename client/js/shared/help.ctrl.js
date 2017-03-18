/**
 * Created by zoonman on 11/27/16.
 */

app.controller(
    'HelpController',
    ['socket',
     '$scope',
     'CategoriesFactory',
     '$routeParams',
     '$timeout',
     'PerfectScrollBar',
     '$localStorage',
     '$document',
     function(socket,
              $scope,
              CategoriesFactory,
              $routeParams,
              $timeout,
              PerfectScrollBar,
              $localStorage,
         $document) {

       PerfectScrollBar.setup('topic');
       $document[0].title = 'Help';


     }
    ]
);
