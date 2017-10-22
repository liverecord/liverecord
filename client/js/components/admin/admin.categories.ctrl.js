/**
 * Created by zoonman on 11/27/16.
 */

app.controller(
    'AdminCategoriesController',
    ['socket',
      '$scope',
      '$routeParams',
      '$timeout',
      'PerfectScrollBar',
      '$document',
      'CategoriesFactory',
      function(socket,
          $scope,
          $routeParams,
          $timeout,
          PerfectScrollBar,
          $document,
          CategoriesFactory) {

        //

        function returnEmptyCategory() {
          return {
            description: '',
            name: '',
            order: 100,
            slug: ''
          };
        }
        $scope.category = returnEmptyCategory();
        $scope.showCategoryEditForm = false;
        $scope.editing = false;
        $scope.sendButtonActive = true;

        $scope.editCategory = function(categoryId) {
          $scope.showCategoryEditForm = true;
          $scope.editing = true;
          if (categoryId) {
            for (let cat of $scope.categories) {
              if (categoryId === cat._id) {
                $scope.category = cat;
              }
            }
          } else {
            $scope.category = returnEmptyCategory();
          }
        };

        $scope.saveCategory = function() {
          $scope.sendButtonActive = false;
          socket.emit('category.save', $scope.category, function(categoryData) {
            console.log('category.save', categoryData);
            $scope.category = categoryData;
            $scope.sendButtonActive = true;
            $scope.showCategoryEditForm = false;
            $scope.loadCategories();

          });
        };

        $scope.deleteCategory = function(categoryId) {
          $scope.showCategoryEditForm = false;
          socket.emit('category.delete', categoryId, function(categoryData) {
            // remove category
            $scope.sendButtonActive = true;
            $scope.loadCategories();

          });
        };

        $scope.categories = [];
        

        $scope.loadCategories = function() {
          socket.emit('categories', {}, function(result) {
            $scope.categories = result;
            $rootScope.categories = result;
            PerfectScrollBar.setup('topic');
          });
          CategoriesFactory.load(1);
        };
        $scope.loadCategories();

        window.addEventListener('resize', function() {
          PerfectScrollBar.setup('topic');
        });
        PerfectScrollBar.setup('topic');

      }
    ]
);
