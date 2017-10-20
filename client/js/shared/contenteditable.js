/**
 * Created by zoonman on 2/25/17.
 */

app.directive('contenteditable', ['$timeout', function($timeout) {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      // update value
      var setViewValue = function() {
        // console.timeStamp('setViewValue');
        ctrl.$setViewValue(elm.html());
      };
      // update model
      [
        'change',
        'blur',
        'focus',
        'click',
        'mousedown',
        'mouseup',
        'paste',
        'keydown',
        'keypress',
        'keyup'
      ].map(function(eventName) {
        elm.on(eventName, function(event) {
          if (scope.$ctrl[eventName + 'Handler']) {
            scope.$ctrl[eventName + 'Handler'](event);
          }
          setViewValue();
        });
      });


      var refreshModel = function() {
        setViewValue();
        $timeout(refreshModel, 500);
      };

      refreshModel();

      // model -> view
      ctrl.$render = function() {
        elm.html(ctrl.$viewValue);
        elm.on('click', function(evt) {
          evt.preventDefault();
        });
      };
      // load init value from DOM
      setViewValue();
    }
  };
}]);

