/**
 * Created by zoonman on 12/12/16.
 */

function topicBookmarkController($rootScope, $scope, socket) {
  var self = this;

  self.show = false;

  function topicObserver(newValue, oldValue, scope) {
    console.log('newValue', newValue);
    self.bookmarked = !!(newValue && newValue.bookmark);
  }

  function userObserver(newValue, oldValue, scope) {
    self.show = !!newValue;
  }

  $rootScope.$watch('user', userObserver);
  $scope.$watch('$ctrl.topic', topicObserver);

  self.bookmarkIt = function() {
    self.bookmarked = !self.bookmarked;
    if (socket && self.topic) {
      socket.emit('bookmark', {topic: self.topic._id}, function(result) {
            self.bookmarked = result.bookmarked;
          }
      );
    }
  };

}

app.component('bookmark', {
      templateUrl: '../../../tpl/topic.bookmark.tpl',
      controller: topicBookmarkController,
      controllerAs: 'wrtc',
      bindings: {
        topic: '='
      }
    }
);
