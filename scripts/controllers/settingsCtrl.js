mainApp
.controller('settingsCtrl', function ($scope, FileItService) {
    $scope.init = function () {
        $scope.data = {
            currentUser: FileItService.currentUser()
        };
    };

    $scope.init();
});