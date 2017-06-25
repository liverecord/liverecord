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
    'liveRecord',
    [
      'ngSanitize', 'ngLocale',
      'ngAnimate', 'ngRoute', 'ngStorage', 'ngMessages',
      'pascalprecht.translate', 'tmh.dynamicLocale',
      '720kb.socialshare', '720kb.tooltips'
    ]
    );

app.constant('LOCALES', {
  'locales': {
    'en_US': 'English',
    'ru_RU': 'Русский'
  },
  'preferredLocale': 'en_US'
});

app.config([
  '$locationProvider', '$routeProvider',
  '$localStorageProvider', '$sessionStorageProvider',
  '$translateProvider', 'tmhDynamicLocaleProvider',
  'tooltipsConfProvider',
  'LOCALES',
  function($locationProvider, $routeProvider,
      $localStorageProvider, $sessionStorageProvider, $translateProvider,
      tmhDynamicLocaleProvider, tooltipsConfProvider, LOCALES) {
    //
    $routeProvider
        .when('/ask', {
          controller: 'EditTopicController',
          templateUrl: '../tpl/topic.edit.tpl'
        })
        .when('/ask?category=:category', {
          controller: 'EditTopicController',
          templateUrl: '../tpl/topic.edit.tpl'
        })
        .when('/edit/:slug', {
              controller: 'EditTopicController',
              templateUrl: '../tpl/topic.edit.tpl'
        })
        .when('/settings', {
              controller: 'SettingsController',
              templateUrl: '../tpl/settings.tpl'
        })
        .when('/admin', {
          controller: 'AdminController',
          templateUrl: '../tpl/admin.tpl'
        })


        .when('/help/:section', {
          controller: 'HelpController',
          controllerAs: 'uctl',
          templateUrl: '../tpl/help.tpl'
        })

        .when('/users/password/restore', {
          controller: 'UsersPasswordRestoreController',
          controllerAs: 'uprc',
          templateUrl: '../tpl/users.password.restore.tpl'
        })
        .when('/users/signup', {
          controller: 'UsersSignUpController',
          controllerAs: 'usuc',
          templateUrl: '../tpl/users.signup.tpl'
        })
        .when('/users/signin', {
          controller: 'UsersSignInController',
          templateUrl: '../tpl/users.signin.tpl'
        })
        .when('/users/:slug', {
          controller: 'UsersInfoController',
          templateUrl: '../tpl/users.info.tpl'
        })
        .when('/users', {
          controller: 'UsersOnlineController',
          templateUrl: '../tpl/users.tpl'
        })

        .when('/:category/:topic', {
          controller: 'TopicDetailsController',
          controllerAs: 'topic',
          templateUrl: '../tpl/topic.view.tpl'
        })
        .when('/:category', {
          controller: 'TopicStubController',
          controllerAs: 'topicStub',
          templateUrl: '../tpl/topics.tpl'
        })
        .when('/', {
          controller: 'WelcomeController',
          templateUrl: '../tpl/welcome.tpl'
        })
        .otherwise('/');

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

    $translateProvider.useMissingTranslationHandlerLog();
    $translateProvider.useStaticFilesLoader({
      prefix: '/dist/l/lr-',
      suffix: '.json'
    });
    $translateProvider.useMessageFormatInterpolation();
    tmhDynamicLocaleProvider.localeLocationPattern(
        '/dist/l/angular-locale_{{locale}}.js'
    );
    var language = window.navigator.userLanguage || window.navigator.language;
    var langLength = language.length, localeFound = false;
    for (var probingLocale in LOCALES.locales) {
      if (language == probingLocale.substr(0, langLength) &&
          LOCALES.locales.hasOwnProperty(probingLocale)) {
        $translateProvider.preferredLanguage(probingLocale);
        localeFound = true;
        break;
      }
    }
    if (!localeFound) {
      $translateProvider.preferredLanguage('en_US');
    }
    $translateProvider.useSanitizeValueStrategy('escape');
    $translateProvider.fallbackLanguage(['en_US', 'ru_RU']);

    tooltipsConfProvider.configure({
      'smart': true,
      'size': 'medium',
      'speed': 'fast',
      'tooltipTemplateUrlCache': true
      //etc...
    });
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
              [
                'updated',
                'updates',
                'slug',
                'title'
              ].map(function(prop) {
                if (item.hasOwnProperty(prop)) {
                  newItems[i][prop] = item[prop];
                }
              });
            } else {
              //item.updated = newItems[i].updated;
              [
                'updated',
                'updates',
                'slug',
                'title'
              ].map(function(prop) {
                if (newItems[i].hasOwnProperty(prop)) {
                  item[prop] = newItems[i][prop];
                }
              });
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
