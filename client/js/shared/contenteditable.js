/**
 * Created by zoonman on 2/25/17.
 */

app.directive('contenteditable', ['$timeout', function($timeout) {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {

      var setViewValue = function() {
        ctrl.$setViewValue(elm.html());
        if (scope.$ctrl.keyUpHandler) {
          scope.$ctrl.keyUpHandler();
        }
      };
      // update model
      elm.on('change', setViewValue);
      elm.on('blur', setViewValue);
      elm.on('keyup', function(evt) {
        setViewValue();
      });


      var refreshModel = function() {
        setViewValue();
        $timeout(refreshModel, 1000);
      };

      refreshModel();

      // model -> view
      ctrl.$render = function() {
        elm.html(ctrl.$viewValue);
      };

      console.log('scope', scope);

      // load init value from DOM
      setViewValue();
    }
  };
}]);

