/**
 * Created by zoonman on 12/12/16.
 */

function topicBookmarkController($rootScope, $scope) {

    var l = {
    };

    if ($rootScope.user) {
        $scope.user = $rootScope.user;
    } else {

    }
}

app.component('bookmark', {
    templateUrl: '/dist/t/topic.bookmark.tpl',
    controller: topicBookmarkController,
    bindings: {
        user: '=',
        topic: '='
    }
});
