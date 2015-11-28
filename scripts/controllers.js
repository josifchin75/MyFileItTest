angular.module('app.controllers', [])

.controller('loginCtrl', function ($scope, UserService, $ionicPopup, $state, Camera) {
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

        UserService.loginUser($scope.data.username, $scope.data.password, callback, failCallback);
        /* .success(callback)
         .error(function (data) {
             var alertPopup = $ionicPopup.alert({
                 title: 'Login failed!',
                 template: 'Please check your credentials!'
             });
         });*/
    }

    $scope.getPhoto = function () {
        
        //function takePicture(find) {
        //    alert('in controller' + navigator.camera);
        //    //alert($scope.navigator.camera);
        //    navigator.camera.getPicture(onSuccessPic, onFail, {
        //        quality: 10,
        //        destinationType: navigator.camera.DestinationType.DATA_URL,
        //        sourceType: (find ? navigator.camera.PictureSourceType.PHOTOLIBRARY : navigator.camera.PictureSourceType.CAMERA)
        //    });
        //}

        function onSuccessPic(imageData) {
            $scope.data.currentImage = imageData;
            $scope.data.currentImageSrc = "data:image/jpeg;base64," + imageData;
        }

        function onFail(message) {
            alert('Failed because: ' + message);
        }
        var options = {
                    quality: 10,
                    destinationType: navigator.camera.DestinationType.DATA_URL,
                    sourceType: (find ? navigator.camera.PictureSourceType.PHOTOLIBRARY : navigator.camera.PictureSourceType.CAMERA)
                };

        Camera.getPicture(options).then(function (imageURI) {
            onSuccessPic(imageURI);
        }, function (err) {
            onFail(err);
            console.err(err);
        });
        //takePicture(true);
    };
})

.controller('scanDocumentsCtrl', function ($scope, Camera) {
    $scope.data = {
        currentImage: null,
        currentImageSrc: 'no image'
    };

    $scope.getPhoto = function (find) {

        function onSuccessPic(imageData) {
            $scope.data.currentImage = imageData;
            $scope.data.currentImageSrc = "data:image/jpeg;base64," + imageData;
        }

        function onFail(message) {
            alert('Failed because: ' + message);
        }
        var options = {
            quality: 10,
            destinationType: navigator.camera.DestinationType.DATA_URL,
            sourceType: (find ? navigator.camera.PictureSourceType.PHOTOLIBRARY : navigator.camera.PictureSourceType.CAMERA)
        };

        Camera.getPicture(options).then(function (imageURI) {
            onSuccessPic(imageURI);
        }, function (err) {
            onFail(err);
            console.err(err);
        });
        //takePicture(true);
    };
})

.controller('viewYourDocumentsCtrl', function ($scope) {

})

.controller('inviteAFriendCtrl', function ($scope) {

})

.controller('mainCtrl', function ($scope, UserService) {
    $scope.data = {
        currentUser: UserService.currentUser(),
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

.controller('editAccountLoginCtrl', function ($scope, UserService, $ionicPopup, $state) {
    $scope.data = {
        currentUser: UserService.currentUser(),
        newPassword: '',
        confirmPassword: ''
    };

    $scope.updateLogin = function () {
        function failCallback() {
            var alertPopup = $ionicPopup.alert({
                title: 'Invalid password',
                template: 'New password doesn\'t match the confirm password.'
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
            $state.go('tabsController.settings');
        }

        if (($scope.data.newPassword != $scope.data.confirmPassword) || ($scope.data.newPassword.length == 0)) {
            failCallback();
        } else {
            $scope.data.currentUser.PASSWORD = $scope.data.newPassword;
            UserService.updateUser($scope.data.currentUser, successCallback, failedUpdateCallback);
        }
    };
})

.controller('editAccountUserCtrl', function ($scope, UserService, $ionicPopup, $state) {
    $scope.data = {
        currentUser: UserService.currentUser()//,
        //primaryAccountHolder: currentUser.PRIMARYAPPUSERID == null
        //TODO: not sure how to handle this yet
    };

    $scope.updateLogin = function () {
        function failedUpdateCallback(result) {
            var alertPopup = $ionicPopup.alert({
                title: 'Update failed',
                template: 'Update failed.'
            });
        }

        function successCallback(result) {
            $state.go('tabsController.settings');
        }

        UserService.updateUser($scope.data.currentUser, successCallback, failedUpdateCallback);
    };
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
