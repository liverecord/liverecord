/**
 * Created by zoonman on 12/12/16.
 */

app.controller('CategoriesController', function($rootScope, CategoriesFactory) {
      $rootScope.categories = CategoriesFactory.categories;
      CategoriesFactory.load().then(function(categories) {
        $rootScope.categories = categories;
        $rootScope.$applyAsync();
      });
    }
);
