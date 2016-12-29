/**
 * Created by zoonman on 12/16/16.
 */

app.controller('NewTopicCtrl', ['socket', '$scope', 'CategoriesFactory', '$location', function(socket, $scope, CategoriesFactory, $location) {
    $scope.question = {
        title: '',
        body: '# TEST'
    };
    $scope.previewHtml = '';
    if ($scope.categories) {

    }
    $scope.question.category = CategoriesFactory.active();
    var sending = false;
    $scope.ask = function() {
        if (!sending && $scope.question.title.length > 0) {
            sending = true;
            socket.emit('ask', $scope.question, function(confirmation) {
                sending = false;
                console.log('confirmation', confirmation);

                $location.path('/' + $scope.question.category.slug + '/' + confirmation.data.slug);
            });
        }
    };
}]);
