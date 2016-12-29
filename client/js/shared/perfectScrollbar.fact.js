/**
 * Created by zoonman on 12/12/16.
 */

app.factory('PerfectScrollBar', ['$timeout',function ($timeout) {
    function initContainer(container) {
        var topicCont = document.getElementById(container);
        console.info('psb', container, topicCont);
        if (topicCont && Ps) {
            if (topicCont.classList.contains('ps-container')) {
                Ps.update(topicCont);
            } else {
                Ps.initialize(topicCont);
            }
        }
    }

    var service = {
        setup: function(container) {
            $timeout(function() {
                initContainer(container);
            }, 1);
        }
    };
    return service;
}]);
