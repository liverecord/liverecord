/**
 * Created by zoonman on 11/6/16.
 */

if (window.history && window.history.pushState) {
  // we are good
} else {
  if (window.confirm('Your browser is so old that stinks! Would like to update it now?')) {
    window.location = 'http://browsehappy.com/?locale=en';
  }
}

// polyfill to get length
Object.prototype.numberOfKeys = function() {
  return Object.keys(this).length;
};

Array.prototype._idMerge = function(secondArray) {
  for (var j = 0, jl = secondArray.length; j < jl; j++) {
    var foundIndex = -1;
    for (var i = 0, il = this.length; i < il; i++) {
      if (secondArray[j].hasOwnProperty('_id') &&
          this[i].hasOwnProperty('_id') &&
          secondArray[j]._id === this[i]._id) {
        foundIndex = i;
      }
    }
    if (foundIndex > -1) {
      this[foundIndex] = secondArray[j];
    } else {
      this.unshift(secondArray[j]);
    }
  }
  return this;
};

var app = angular.module(
    'app',
    [
      'ngSanitize',
      'ngAnimate', 'ngRoute', 'ngStorage', '720kb.socialshare'
    ]
    );

app.config([
  '$locationProvider', '$routeProvider',
  '$localStorageProvider', '$sessionStorageProvider',
  function(
      $locationProvider, $routeProvider,
      $localStorageProvider, $sessionStorageProvider) {
    //
    $routeProvider.when('/ask', {
      controller: 'NewTopicCtrl',
      templateUrl: '/dist/t/topic.new.tpl'
    }).when('/ask?category=:category', {
      controller: 'NewTopicCtrl',
      templateUrl: '/dist/t/topic.new.tpl'
    }).when('/settings', {
      controller: 'SettingsCtrl',
      templateUrl: '/dist/t/settings.tpl'
    }).when('/users/:slug', {
      controller: 'UsersCtrl',
      controllerAs: 'uctl',

      templateUrl: '/dist/t/users.tpl'
    }).when('/users/password/restore', {
      controller: 'UsersPasswordRestoreCtrl',
      controllerAs: 'uctl',

      templateUrl: '/dist/t/users.password.restore.tpl'
    }).when('/:category/:topic', {
      controller: 'TopicDetailsCtrl',
      controllerAs: 'topic',

      templateUrl: '/dist/t/topic.tpl'
    }).when('/:category', {
      controller: 'TopicStubCtrl',
      controllerAs: 'topicStub',
      templateUrl: '/dist/t/topics.tpl'
    }).when('/', {
      controller: 'WelcomeCtrl',
      templateUrl: '/dist/t/welcome.tpl'
    }).otherwise('/');

    $locationProvider.html5Mode({
      enabled: true,
      requireBase: false
    });

    $localStorageProvider.setKeyPrefix('lr_');
    $sessionStorageProvider.setKeyPrefix('lr_');

    if ($localStorageProvider.supported()) {
      var deviceId = $localStorageProvider.get('deviceId');
      if (!deviceId) {
        deviceId = Math.random().toString(36).substring(2, 15);
        $localStorageProvider.set('deviceId', deviceId);
      }
    } else {
      alert('Enable Local storage!');
    }

  }
]);

app.run(function(PerfectScrollBar) {
  PerfectScrollBar.setup('topics');
  FastClick.attach(document.body);
});

function array_id_merge(firstArray, secondArray, slug) {
  var items = [], newItems = [];
  items = items.concat(firstArray);
  items = items.concat(secondArray);

  var extractValueToCompare = function(item) {
    if (angular.isObject(item)) {
      return item['_id'];
    } else {
      return item;
    }
  };

  angular.forEach(items, function(item) {
        var isDuplicate = false;
        for (var i = 0; i < newItems.length; i++) {
          var a = extractValueToCompare(newItems[i]);
          var b = extractValueToCompare(item);
          if (angular.equals(a, b)) {
            isDuplicate = true;
            //break;
            if (newItems[i].updated < item.updated) {
              newItems[i].updated = item.updated;
            } else {
              item.updated = newItems[i].updated;
            }
          }
        }
        if (!isDuplicate) {
          if (slug) {
            item.active = (item.slug === slug);
          }

          newItems.push(item);
        }
      }
  );
  items = newItems;
  return items;
}
