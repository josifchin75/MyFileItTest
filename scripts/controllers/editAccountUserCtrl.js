mainApp
.controller('editAccountUserCtrl', function ($scope, FileItService, $ionicPopup, $state) {
    $scope.data = {
        currentUser: FileItService.currentUser()//,
        //primaryAccountHolder: currentUser.PRIMARYAPPUSERID == null
        //TODO: not sure how to handle this yet
    };

    $scope.updateUser = function () {
        function failedUpdateCallback(result) {
            var alertPopup = $ionicPopup.alert({
                title: 'Update failed',
                template: 'Update failed.'
            });
        }

        function successCallback(result) {
            $state.go('main');
        }
        if ($scope.validUpdateUser()) {
            FileItService.updateUser($scope.data.currentUser, successCallback, failedUpdateCallback);
        }
    };

    $scope.validUpdateUser = function () {
        var result = true;
        var message = '';

        var data = $scope.data.currentUser;

        if (data.FIRSTNAME.length == 0 || data.LASTNAME.length == 0) {
            result = false;
            message += "<br/>Please enter your name.";
        }

        if (!result) {
            var alertPopup = $ionicPopup.alert({
                title: "Incomplete",
                template: message
            });
        }

        return result;
    };
});