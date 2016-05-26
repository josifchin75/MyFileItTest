mainApp
.controller('editAccountLoginCtrl', function ($scope, FileItService, $ionicPopup, $state, PasswordHelper) {
    $scope.data = {
        currentUser: FileItService.currentUser(),
        newPassword: '',
        confirmPassword: ''
    };

    $scope.updateLogin = function () {
        function failCallback(message) {
            var alertPopup = $ionicPopup.alert({
                title: 'Invalid password',
                template: message
            });
        }

        function failedUpdateCallback() {
            var alertPopup = $ionicPopup.alert({
                title: 'Update failed',
                template: 'Update failed.'
            });
        }

        function successCallback() {
            $scope.data.newPassword = '';
            $scope.data.confirmPassword = '';
            $state.go('main');
        }

        /*if (($scope.data.newPassword != $scope.data.confirmPassword) || ($scope.data.newPassword.length == 0)) {
            failCallback('New password doesn\'t match the confirm password.');
        } else {*/
        if (!PasswordHelper.validPassword($scope.data.newPassword)) {
            failCallback(PasswordHelper.getPasswordFormatError());
        } else {
            $scope.data.currentUser.PASSWORD = $scope.data.newPassword;
            FileItService.updateUser($scope.data.currentUser, successCallback, failedUpdateCallback);
        }
        // }
    };
});