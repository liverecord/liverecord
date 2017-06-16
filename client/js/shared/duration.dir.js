/**
 * Created by zoonman on 12/16/16.
 */
app.directive('lrDuration', [function() {
  console.log('lrDuration!!!');

  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      console.log('lrDuration:', element, attrs);

      scope.$watch(attrs.lrDuration, function(value) {
        console.log('attrs.lrDuration', attrs.lrDuration);
        function spanTag(className, content) {
          return '<span class="' + className + '">' + content + '</span>';
        }
        function trailingZero(num) {
          if (num < 10) {
            return '0' + num;
          } else {
            return '' + num;
          }
        }

        function minutesSeconds(ts) {
          var seconds = Math.round(ts % 60);
          var minutes = Math.round(Math.floor(ts % 3600 / 60));
          return spanTag('minutes', minutes) +
              spanTag('delimiter', ':') +
              spanTag('seconds', trailingZero(seconds));
        }

        function hours(ts) {
          var hours = Math.round(Math.floor(ts % 86400 / 3600));
          return spanTag('hours', hours) +
              spanTag('delimiter', ':') + minutesSeconds(ts);
        }
        
        var ts = value / 1000;
        if (ts < 3600) {
          // less than hour
          element[0].innerHTML = minutesSeconds(ts);
        } else if (ts < 86400) {
          // less than a day
          element[0].innerHTML = hours(ts);
        } else {
          // a day or more
          var days = Math.round(Math.floor(ts / 86400));
          element[0].innerHTML = spanTag('hours', days) +
              spanTag('delimiter', ', ') + hours(ts);

        }
      });
    }
  };
}
]);
