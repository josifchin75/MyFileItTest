mainApp
.controller('forgotPasswordCtrl', function ($scope, FileItService, $ionicPopup, $state, EmailHelper, StateHelper) {
    $scope.data = {
        emailAddress: ''
    };

    $scope.callForgotPassword = function () {
        function callback(data) {
            $scope.data.emailAddress = '';
            var alertPopup = $ionicPopup.alert({
                title: 'Password sent!',
                template: 'Your password has been sent.'
            });
            $state.go('login');
        }
        function failCallback(data) {
            var alertPopup = $ionicPopup.alert({
                title: 'Invalid email!',
                template: data.Message
            });
        }
        if ($scope.data.emailAddress.length > 0 && EmailHelper.validEmail($scope.data.emailAddress)) {
            FileItService.forgotPassword($scope.data.emailAddress, callback, failCallback);
        } else {
            var alertPopup = $ionicPopup.alert({
                title: 'Invalid email!',
                template: 'Please enter an email address.'
            });
        }
        StateHelper.refresh($state);
    };
});