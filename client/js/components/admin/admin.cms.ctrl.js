/**
 * Created by zoonman on 11/27/16.
 */

app.controller(
    'AdminCmsController',
    ['socket',
      '$scope',
      '$routeParams',
      '$timeout',
      'PerfectScrollBar',
      '$localStorage',
      '$document',
      function(socket,
          $scope,
          $routeParams,
          $timeout,
          PerfectScrollBar,
          $localStorage,
          $document) {

        //

        function returnEmptyPage() {
          return {
            title: '',
            description: '',
            name: '',
            menu: '',
            body: '',
            slug: ''
          };
        }
        $scope.page = returnEmptyPage();
        $scope.showPageEditForm = false;
        $scope.editing = false;
        $scope.sendButtonActive = true;

        $scope.editPage = function(pageId) {
          $scope.showPageEditForm = true;
          $scope.editing = true;
          if (pageId) {
            socket.emit('page', {_id: pageId }, function(err, pageData) {
              $scope.page = pageData;
            });
          } else {
            $scope.page = returnEmptyPage();
          }
        };

        $scope.savePage = function() {
          $scope.sendButtonActive = false;
          socket.emit('page.save', $scope.page, function(pageData) {
            console.log('page.save', pageData);
            $scope.page = pageData;
            $scope.sendButtonActive = true;
          });
        };

        $scope.deletePage = function(pageId) {
          $scope.showPageEditForm = false;
          socket.emit('page.delete', pageId, function(pageData) {
            // remove page
            $scope.sendButtonActive = true;
          });
        };

        $scope.pages = [];
        socket.emit('page.list', {}, function(result) {
          $scope.pages = result;
          PerfectScrollBar.setup('topic');
        });

        window.addEventListener('resize', function() {
          PerfectScrollBar.setup('topic');
        });
        PerfectScrollBar.setup('topic');

      }
    ]
);
