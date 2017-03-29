/**
 * Created by zoonman on 2/25/17.
 */

app.directive('contenteditable', function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      // view -> model
      elm.on('blur', function() {
            ctrl.$setViewValue(elm.html());
          }
      );

      var refreshModel = function() {
        ctrl.$setViewValue(elm.html());
        window.setTimeout(refreshModel, 1000);
      };

      refreshModel();

      // model -> view
      ctrl.$render = function() {
        elm.html(ctrl.$viewValue);
      };

      // load init value from DOM
      ctrl.$setViewValue(elm.html());
    }
  };
});
