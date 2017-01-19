/**
 * Created by zoonman on 12/16/16.
 */
function growlerController($rootScope, $scope) {
    var self = this;
    /**
     *
     * @type {{id: 0, title: '', ttl: 0}}
     */
    self.notifications = {};
    /**
     * @type {number}
     */
    self.notificationIndex = 0;

    /***
     *
     * @param notification
     */

    $rootScope.notifications.add = function(notification) {

    };
    $rootScope.notifications.update = function(notification) {

    };
    $rootScope.notifications.remove = function(notification) {

    };


}

app.component('lrGrowler', {
    template: '<div class="growler-notification" ng-repeat="notification in $ctrl.notifications track by id">' +
    '<div class="growler-notification-icon"><img ng-src="{{notification.icon}}" alt=""></div>' +
    '<div class="growler-notification-message"></div>' +
    '<div><a href="#" ng-click="$ctrl.remove(notification)" class="growler-notifications-close"><i class="fa fa-times"></i></a></div>' +
    '</div>',
    controller: growlerController,
    bindings: {
    }
});

app.factory('growler', function($rootScope) {
    var self = {
        index: 0,
        notifications: [],
        add: function (notification) {

            var newNotification = {__id: index};
            angular.extend(newNotification, notification);
            self.index++;
            self.notifications.push(notification)
        },
        update: function (notification) {
            if (notification.__id) {
                for (var i = 0; i < self.notifications; i++) {
                    if (self.notifications[i].__id === notification.__id) {
                        self.notifications[i] = notification;
                        break;
                    }
                }
            }
        },
        remove: function(notification) {
            if (notification.__id) {
                for (var i = 0; i < self.notifications; i++) {
                    if (self.notifications[i].__id === notification.__id) {
                        delete self.notifications[i];
                        break;
                    }
                }
            }
        }
    };
    return self;
});
