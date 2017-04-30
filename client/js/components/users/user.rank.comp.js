

/**
 *
 * @param {{Object}} socket
 * @param {{Object}}  $rootScope
 * @param {{Object}}  $scope
 * @param {{Object}}  $window
 * @param {{Object}}  $translate
 * @param {{Object}}  $localStorage
 * @param {{Object}}  $sessionStorage
 */

app.component('lrRank', {
      templateUrl: '../../../tpl/users.rank.comp.tpl',
      bindings: {
        user: '<'
      }
    }
);
