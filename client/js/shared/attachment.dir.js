/**
 * Created by zoonman on 12/16/16.
 */
app.directive('attachment', [function() {
      return {
        restrict: 'E',
        scope: {attachment: '<'},
        templateUrl: '../../tpl/attachment.tpl',
        replace: true
      };
}]);
