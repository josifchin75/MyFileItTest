angular.module('app.controllers', [])

.controller('loginCtrl', function ($scope, LoginService, $ionicPopup, $state) {
    $scope.data = {};

    $scope.login = function () {
        function callback(data) {
            $scope.data.username = '';
            $scope.data.password = '';
            $state.go('tabsController.main');
        }
        function failCallback() {
            var alertPopup = $ionicPopup.alert({
                title: 'Login failed!',
                template: 'Please check your credentials!'
            });
        }

        LoginService.loginUser($scope.data.username, $scope.data.password, callback, failCallback);
        /* .success(callback)
         .error(function (data) {
             var alertPopup = $ionicPopup.alert({
                 title: 'Login failed!',
                 template: 'Please check your credentials!'
             });
         });*/
    }
})

.controller('scanDocumentsCtrl', function ($scope) {

})

.controller('viewYourDocumentsCtrl', function ($scope) {

})

.controller('inviteAFriendCtrl', function ($scope) {

})

.controller('mainCtrl', function ($scope, LoginService) {
    $scope.data = {
        currentUser: LoginService.currentUser()
    };
})

.controller('settingsCtrl', function ($scope) {

})

.controller('forgotPasswordCtrl', function ($scope) {

})

.controller('logOutCtrl', function ($scope) {

})

.controller('sharingKeyManagementCtrl', function ($scope) {

})

.controller('editAccountLoginCtrl', function ($scope) {

})

.controller('editAccountUserCtrl', function ($scope) {

})

.controller('setUpTeamAndPlayersCtrl', function ($scope) {

})

.controller('scannerSettingsCtrl', function ($scope) {

})

.controller('newAccountCtrl', function ($scope) {

})

.controller('newAccountProfileCtrl', function ($scope) {

})

.controller('successCtrl', function ($scope) {

})

.controller('forgottenPasswordSentCtrl', function ($scope) {

})

.controller('confirmDocumentCtrl', function ($scope) {

})

.controller('uploadSuccessCtrl', function ($scope) {

})

.controller('errorHasOccurredCtrl', function ($scope) {

})

.controller('viewImagesCtrl', function ($scope) {

})

.controller('shareDocumentsCtrl', function ($scope) {

})

.controller('confirmDocumentShareCtrl', function ($scope) {

})

.controller('emergencyShareCtrl', function ($scope) {

})

.controller('shareHasBeenSentCtrl', function ($scope) {

})
