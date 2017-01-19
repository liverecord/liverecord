/**
 * Created by zoonman on 11/27/16.
 */

app.controller(
    'TopicStubCtrl',
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

       CategoriesFactory.load().then(function(cats) {
         if ($routeParams.category) {
           CategoriesFactory.active($routeParams.category);
           $scope.activeCategory = CategoriesFactory.active();
           $document[0].title = $scope.activeCategory.name;
         } else {
           $scope.activeCategory = CategoriesFactory.active();
         }
       });
     }
    ]
);
