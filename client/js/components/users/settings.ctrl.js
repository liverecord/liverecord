/**
 * Created by zoonman on 11/27/16.
 */

app.controller('SettingsCtrl', ['socket', '$scope', '$rootScope', '$localStorage',  'PerfectScrollBar',
function(socket, $scope, $rootScope, $localStorage, PerfectScrollBar) {
    //
    $scope.l = {};
    $scope.sending = false;
    $scope.message = '';
    $scope.profile = angular.copy($rootScope.user);
    $scope.$localStorage = $localStorage;



    console.log('init SettingsCtrl')

    $scope.update = function() {
        $scope.sending = true;
        $scope.message = '';
        socket.emit('user.update', $scope.profile, function(response) {
            console.log('l',response);
            $scope.sending = false;
            if (response.success) {
                $rootScope.user.name = $scope.profile.name;
                $rootScope.user.email = $scope.profile.email;
                $rootScope.user.picture = $scope.profile.picture;
            } else {
                $scope.message = l[response.error] || 'error';
            }
        });
    };

    try {

        var  setupUploader = function() {
            var uploadSocket = io.connect();
            var uploader = new SocketIOFileUpload(uploadSocket);
            uploader.addEventListener("start", function(event){
                event.file.meta.avatar = true;
                console.log(event)

            });
            uploader.listenOnInput(document.getElementById("profileAvatar"));
            uploader.addEventListener("error", function(event) {
                $scope.message = event.message;
                $scope.$applyAsync();
            });
            uploadSocket.on('user.avatar', function(payload) {
                console.log(payload);
                $scope.profile.picture = window.location.protocol + '//' + window.location.host +  '/' + payload.absoluteUrl.replace(/^\//, '');
                $scope.$applyAsync();
            });
        };

        if (socket.self.connected) {
            setupUploader()
        } else {
            socket.on('connect', setupUploader);
        }




    } catch (e) {
        console.error(e);
        $scope.$applyAsync();
    }
    $scope.$applyAsync();
    PerfectScrollBar.setup('wrapper');

}]);
