/**
 * Created by zoonman on 11/27/16.
 */

app.controller(
    'TopicStubCtrl',
    ['socket', '$scope', 'CategoriesFactory', '$routeParams', '$timeout', 'PerfectScrollBar', '$localStorage', function(socket, $scope, CategoriesFactory, $routeParams, $timeout, PerfectScrollBar, $localStorage) {


        $scope.activeCategory = CategoriesFactory.active();


        $timeout(function() {


        console.log('$scope.activeCategory', $scope.activeCategory)
    }, 1000);

}]);
