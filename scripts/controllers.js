angular.module('app.controllers', [])

.controller('loginCtrl', function ($scope, FileItService, $ionicPopup, $state, Camera) {
    $scope.data = {};
    $scope.pageTitle = '<img src="images/MyFileIT_Icon.png" /><label>Login</label>';

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

        FileItService.loginUser($scope.data.username, $scope.data.password, callback, failCallback);
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

.controller('inviteAFriendCtrl', function ($scope, FileItService, $ionicPopup, $state) {
    $scope.init = function () {
        $scope.data = {
            currentUser: FileItService.currentUser(),
            toName: '',
            emailAddress: '',
            message: '',
            accepted: false,
            errorTitle: 'Error',
            errorMessage: 'An error has occurred.'
        };

        function getTextSuccess(data) {
            $scope.data.message = data;
        }
        function getTextFail() {
            $scope.data.message = "Please send me an invitation to MyFileIT.";
        }

        FileItService.getInvitationToShareEmailText(getTextSuccess, getTextFail);
    };

    $scope.validPage = function () {
        var result = true;
        $scope.data.errorMessage = '';
        if ($scope.data.toName.length == 0) {
            $scope.data.errorMessage += "\nPlease enter a name to send to.";
            $scope.data.errorTitle = "Cannot send invitation";
            result = false;
        }
        if ($scope.data.emailAddress.length == 0) {
            $scope.data.errorMessage += "\nPlease enter an email address to send to.";
            $scope.data.errorTitle = "Cannot send invitation";
            result = false;
        }
        if (!$scope.data.accepted) {
            $scope.data.errorMessage += "\nPlease accept the agreement.";
            $scope.data.errorTitle = "Cannot send invitation";
            result = false;
        }

        return result;
    }

    $scope.sendInvitationEmail = function () {
        function callback(data) {
            $scope.init();
            $state.go('tabsController.main');
            var alertPopup = $ionicPopup.alert({
                title: 'Invitation sent!',
                template: 'Your invitation has been sent.'
            });
        }
        function failCallback(data) {
            var alertPopup = $ionicPopup.alert({
                title: 'Error sending invitation!',
                template: data.Message
            });
        }
        if ($scope.validPage()) {
            FileItService.sendInvitationEmail($scope.data.emailAddress, $scope.data.message, callback, failCallback);
        } else {
            var alertPopup = $ionicPopup.alert({
                title: $scope.data.errorTitle,
                template: $scope.data.errorMessage
            });
        }
    };

    $scope.init();
})

.controller('mainCtrl', function ($scope, FileItService) {
    $scope.data = {
        currentUser: FileItService.currentUser(),
    };
})

.controller('settingsCtrl', function ($scope) {

})

.controller('forgotPasswordCtrl', function ($scope, FileItService, $ionicPopup, $state) {
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
        if ($scope.data.emailAddress.length > 0) {
            FileItService.forgotPassword($scope.data.emailAddress, callback, failCallback);
        } else {
            var alertPopup = $ionicPopup.alert({
                title: 'Invalid email!',
                template: 'Please enter an email address.'
            });
        }
    };
})

.controller('logOutCtrl', function ($scope) {

})

.controller('sharingKeyManagementCtrl', function ($scope) {

})

.controller('editAccountLoginCtrl', function ($scope, FileItService, $ionicPopup, $state) {
    $scope.data = {
        currentUser: FileItService.currentUser(),
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
            FileItService.updateUser($scope.data.currentUser, successCallback, failedUpdateCallback);
        }
    };
})

.controller('editAccountUserCtrl', function ($scope, FileItService, $ionicPopup, $state) {
    $scope.data = {
        currentUser: FileItService.currentUser()//,
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

        FileItService.updateUser($scope.data.currentUser, successCallback, failedUpdateCallback);
    };
})

.controller('setUpTeamAndPlayersCtrl', function ($scope) {

})

.controller('scannerSettingsCtrl', function ($scope) {

})

.controller('newAccountCtrl', function ($scope, FileItService, $ionicPopup, $state, AppUser) {
    $scope.init = function () {
        //$scope.data = {
        //    userName: '',
        //    password: '',
        //    confirmPassword: '',
        //    firstName: '',
        //    lastName: '',
        //    primaryAccountHolder: false,
        //    relationShipTypeId: -1,
        //    phoneNumber: '',
        //    appUserTypeId: -1,
        //    emailAddress: '',
        //    organizationId: -1,
        //    organizations: [
        //          { id: 1, name: "org1", radioName: "org" },
        //          { id: 2, name: "org2", radioName: "org" }
        //    ],
        //    relationShipTypes: [],
        //    appUserTypes: []
        //};
        $scope.data = AppUser.getObject();

        function successRef(data) {
            $scope.data.relationShipTypes = data.KeyValueData;
            FileItService.getReferenceData('AppUserType', successUserRef, failRef);
        }

        function successUserRef(data) {
            $scope.data.appUserTypes = data.KeyValueData;
        }

        function failRef(data) {
        }

        FileItService.getReferenceData('RelationShipType', successRef, failRef);
    };

    $scope.addAccountUserName = function () {
        if ($scope.validUserName()) {
            AppUser.setObject($scope.data);
            $state.go('newAccountProfile');
        }
    };

    $scope.addAccountUser = function () {
        function successAdd() {
            var alertPopup = $ionicPopup.alert(
                {
                    title: 'Success',
                    template: 'Your account has been added!',
                    buttons: [
                      {
                          text: '<b>Ok</b>',
                          type: 'button-positive',
                          onTap: function (e) {
                              $state.go('tabsController.main');
                          }
                      }]
                 });
        }

        if ($scope.validAddAccount()) {
            var data = $scope.data;

            var appUserDTO = {
                USERNAME: data.userName,
                PASSWORD: data.password,
                FIRSTNAME: data.firstName,
                LASTNAME: data.lastName,
                ADDRESS1: '.',
                ADDRESS2: '.',
                CITY: '.',
                STATECODE: 'PA',
                ZIPCODE: '.',
                PHONE: data.phoneNumber,
                MOBILEPHONENUMBER: data.phoneNumber,
                EMAILADDRESS: data.emailAddress,
                SEX: data.sex,
                RELATIONSHIPTYPEID: data.relationShipTypeId,
                APPUSERTYPEID: data.appUserTypeId,
                APPUSERSTATUSID: 2
            };

            /*
            ID = appUserEF.ID;
            USERNAME = appUserEF.USERNAME;
            PASSWORD = appUserEF.PASSWORD;
            PRIMARYAPPUSERID = appUserEF.PRIMARYAPPUSERID;
            FIRSTNAME = appUserEF.FIRSTNAME;
            LASTNAME = appUserEF.LASTNAME;
            ADDRESS1 = appUserEF.ADDRESS1;
            ADDRESS2 = appUserEF.ADDRESS2;
            CITY = appUserEF.CITY;
            STATECODE = appUserEF.STATECODE;
            ZIPCODE = appUserEF.ZIPCODE;
            PHONE = appUserEF.PHONE;
            MOBILEPHONENUMBER = appUserEF.MOBILEPHONENUMBER;
            EMAILADDRESS = appUserEF.EMAILADDRESS;
            EMAILADDRESS2 = appUserEF.EMAILADDRESS2;
            SEX = appUserEF.SEX;
            BIRTHDATE = appUserEF.BIRTHDATE;
            COMMENT = appUserEF.COMMENT;
            RELATIONSHIPTYPEID = appUserEF.RELATIONSHIPTYPEID;
            APPUSERTYPEID = appUserEF.APPUSERTYPEID;
            SHAREKEYID = appUserEF.SHAREKEYID;
            SHAREKEYEXPIREDATE = appUserEF.SHAREKEYEXPIREDATE;
            APPUSERSTATUSID = appUserEF.APPUSERSTATUSID;
            DATECREATED = appUserEF.DATECREATED;
            */

            function successAddAppUser(data) {
                successAdd();
            }

            function failAddAppUser(data) {
            }

            FileItService.addAppUser(appUserDTO, successAddAppUser, failAddAppUser);
        }
    };

    $scope.searchOrganizations = function () {

        function successSearch(data) {
            $scope.data.organizations = data.Organizations;
        }

        function failSearch(data) {

        }

        FileItService.getOrganizations(null, $scope.data.organizationSearch, successSearch, failSearch)
    };

    $scope.validUserName = function () {
        var result = true;
        var errorTitle = 'Invalid Entry';
        var errorMessage = '';

        if ($scope.data.userName.length == 0) {
            result = false;
            errorMessage += 'Invalid username / email address.\n'
        }

        if ($scope.data.password.length == 0) {
            result = false;
            errorMessage += 'Please enter a password.\n'
        } else {
            if ($scope.data.password != $scope.data.confirmPassword) {
                result = false;
                errorMessage += 'Passwords do not match.\n'
            }
        }

        if (!result) {
            var alertPopup = $ionicPopup.alert({
                title: errorTitle,
                template: errorMessage
            });
        }

        return result;
    };

    $scope.validAddAccount = function () {
        var result = true;

        if (!result) {
            var alertPopup = $ionicPopup.alert({
                title: errorTitle,
                template: errorMessage
            });
        }

        return result;
    };

    $scope.init();
})

//.controller('newAccountProfileCtrl', function ($scope) {

//})

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
