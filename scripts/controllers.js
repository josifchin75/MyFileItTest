angular.module('app.controllers', [])

.controller('loginCtrl', function ($scope, FileItService, $ionicPopup, $state, Camera, AppUser) {
    $scope.init = function () {
        $scope.data = {};
        $scope.pageTitle = '<img src="images/MyFileIT_Icon.png" /><label>Login</label>';
        AppUser.logout();
        //debug
        $scope.data.username = 'josifchin75@gmail.com';
        $scope.data.password = 'jopass12';
    }

    $scope.login = function () {
        function callback(data) {
            $scope.data.username = '';
            $scope.data.password = '';
            FileItService.setCurrentUser(data.AppUsers[0]);

            $state.go('tabsController.main');
        }
        function failCallback() {
            var alertPopup = $ionicPopup.alert({
                title: 'Login failed!',
                template: 'Please check your credentials!'
            });
        }

        if ($scope.data.username != undefined && $scope.data.username.length > 0 && $scope.data.password != undefined && $scope.data.password.length > 0) {
            FileItService.loginUser($scope.data.username, $scope.data.password, callback, failCallback);
        } else {
            failCallback();
        }
        /* .success(callback)
         .error(function (data) {
             var alertPopup = $ionicPopup.alert({
                 title: 'Login failed!',
                 template: 'Please check your credentials!'
             });
         });*/
    }

    $scope.init();

})

.controller('scanDocumentsCtrl', function ($scope, Camera, FileItService, ScanDocument, $ionicPopup, $state, ViewDocument) {
    $scope.init = function () {
        $scope.data = ScanDocument.getObject();
        $scope.data.currentUser = FileItService.currentUser();

        function successRef(data) {
            $scope.data.documentTypes = data.KeyValueData;
            function successGetFamily(data) {
                $scope.data.familyUsers = data.AppUsers;
            }
            var user = $scope.data.currentUser;
            var primaryAppUserId = user.PRIMARYAPPUSERID == null ? user.ID : user.PRIMARYAPPUSERID;
            FileItService.getFamilyUsers(primaryAppUserId, successGetFamily, failRef);
        }

        function failRef(data) {
        }

        FileItService.getReferenceData('DocumentType', successRef, failRef);
    };

    $scope.getPhoto = function (find) {
        function onSuccessPic(imageData) {
            $scope.data.currentImage = imageData;
            $scope.data.currentImageSrc = "data:image/jpeg;base64," + imageData;
            $scope.data.filename = 'test.jpg';

            $scope.data.cabinetId = $scope.data.currentUser.CABINETID;
            for (var i = 0; i < $scope.data.organizations.length; i++) {
                if ($scope.data.organizations[i].ID == $scope.data.organizationId) {
                    $scope.data.cabinetId = $scope.data.organizations[i].CABINETID;
                    break;
                }
            }

            $scope.data.documentTypeName = "";
            for (var i = 0; i < $scope.data.documentTypes.length; i++) {
                if ($scope.data.documentTypes[i].Key == $scope.data.documentTypeId) {
                    $scope.data.documentTypeName = $scope.data.documentTypes[i].Value;
                    break;
                }
            }

            $scope.confirm();
        }

        function onFail(message) {
            var alertPopup = $ionicPopup.alert({
                title: 'Error uploading',
                template: message
            });
        }
        var options = {
            quality: 25,
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

    $scope.uploadPhoto = function () {
        //upload the image
        function uploadSuccess() {
            //reload docs
            function resetSearch() {
                //ViewDocument.searchDocuments();
            }
            ViewDocument.loadDocuments(FileItService.currentUser(), resetSearch);
            var alertPopup = $ionicPopup.alert({
                title: 'Success',
                template: 'Your file has been uploaded.'
            });
            $state.go('tabsController.main');
        }
        function getDate() {
            var d = moment.utc();
            var result = '\/Date(' + d + ')\/';
            return result;
        }

        var documentObj = {
            CABINETID: $scope.data.cabinetId,
            APPUSERID: $scope.data.familyUserId,
            SCANDATE: getDate(),
            FIRSTNAME: $scope.data.currentUser.FIRSTNAME,
            LASTNAME: $scope.data.currentUser.LASTNAME,
            DOCUMENTTYPEID: $scope.data.documentTypeId,
            COMMENT: $scope.data.comment,
            DOCUMENTDATE: getDate(),
            DOCUMENTSTATUSID: 0,
            DATECREATED: getDate(),
            VERIFIEDDATE: getDate(),
            VERIFIEDAPPUSERID: $scope.data.failAddAppUser
        };
        /*
        VERIFIEDDATE = fileCabinetDocumentEF.VERIFIEDDATE;
        VERIFIEDAPPUSERID = fileCabinetDocumentEF.VERIFIEDAPPUSERID;
        DOCUMENTLOCATION = fileCabinetDocumentEF.DOCUMENTLOCATION;
        DOCUMENTSTATUSID = fileCabinetDocumentEF.DOCUMENTSTATUSID;
        DATECREATED = fileCabinetDocumentEF.DATECREATED;
        */
        if ($scope.data.confirmed) {
            //organizationId, fileName, base64Image, documentObject, success, fail
            FileItService.uploadFileCabinetDocument($scope.data.familyUserId, $scope.data.filename, $scope.data.currentImage, documentObj, uploadSuccess, onFail);
        } else {
            var alertPopup = $ionicPopup.alert({
                title: 'Agreement',
                template: 'Please accept the agreement!'
            });
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

    $scope.confirm = function () {
        if ($scope.validUpload()) {
            ScanDocument.setObject($scope.data);
            $state.go('scanDocumentsConfirm');
        }
    };

    $scope.validUpload = function () {
        var result = true;
        var title = "Incomplete";
        var message = "";
        var data = $scope.data;

        if (data.documentTypeId == undefined || data.documentTypeId == -1) {
            message += "Please select a document type.</br>";
            result = false;
        }

        if (data.familyUserId == undefined || data.familyUserId == -1) {
            message += "Please select a family user to upload for.</br>";
            result = false;
        }

        if (data.currentImage == undefined || data.currentImage.length == 0) {
            message += "Please select an image to upload.</br>";
            result = false;
        }

        if (data.comment == undefined || data.comment.length == 0) {
            message += "Please enter a brief comment for your own reference.</br>";
            result = false;
        }


        if (!result) {
            var alertPopup = $ionicPopup.alert({
                title: title,
                template: message
            });
        }
        return result;
    };

    $scope.init();
})

.controller('viewYourDocumentsCtrl', function ($scope, ViewDocument, FileItService, $ionicPopup, $state) {
    $scope.init = function () {
        function getFamilyRef() {
            function successGetFamily(data) {
                $scope.data.familyUsers = data.AppUsers;
            }

            function failRef() { }
            $scope.data = ViewDocument.getObject();
            //ViewDocument.searchDocuments();

            var user = $scope.data.currentUser;
            var primaryAppUserId = user.PRIMARYAPPUSERID == null ? user.ID : user.PRIMARYAPPUSERID;
            FileItService.getFamilyUsers(primaryAppUserId, successGetFamily, failRef);
        }

        $scope.data = ViewDocument.getObject();
        $scope.data.currentUser = FileItService.currentUser();
        ViewDocument.loadDocuments(FileItService.currentUser(), getFamilyRef);
        $scope.data.selectedImages = [$scope.data.searchImages[0]];
        //get the documents
        //$scope.getAllDocuments();
    }


    $scope.getAllDocuments = function () {
        function successGetAll(data) {
            //data:image/png;base64,
            $scope.data.images = data.Documents;
            ViewDocument.setObject($scope.data);
            ViewDocument.searchDocuments();
        }

        function errorGetAll(data) {
        }
        var id = $scope.data.currentUser.PRIMARYAPPUSERID != null ? $scope.data.currentUser.PRIMARYAPPUSERID : $scope.data.currentUser.ID;
        FileItService.getFamilyDocuments(id, successGetAll, errorGetAll);
    };

    $scope.searchDocuments = function () {
        ViewDocument.searchDocuments();
    };

    $scope.goToSelectUser = function () {
        $scope.navigateAndSave('shareUserSelect');
    };

    $scope.goToDocumentSelect = function () {
        var valid = true;
        if ($scope.data.familyUserId == undefined || $scope.data.familyUserId == -1) {
            valid = false;
            $scope.showError('Incomplete', 'Please select a member.');
        }
        if (valid) {
            $scope.navigateAndSave('shareDocumentSelect');
        }
    }

    $scope.goToEventSelect = function () {
        var valid = true;

        if (valid) {
            $scope.navigateAndSave('shareEventSelect');
        }
    };

    $scope.goToAssociate = function () {
        var valid = true;

        if (valid) {
            $scope.navigateAndSave('shareAssociate');
        }
    };


    $scope.goToConfirm = function () {
        var valid = true;

        if (valid) {
            $scope.navigateAndSave('confirmDocumentShare');
        }
    };

    $scope.navigateAndSave = function (screen) {
        ViewDocument.setObject($scope.data);
        $state.go(screen);  
    };

    $scope.showError = function(title, message){
        var alertPopup = $ionicPopup.alert({
            title: title,
            template: message
        });
    }

    $scope.init();
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
        currentUser: FileItService.currentUser()
    };
})

.controller('settingsCtrl', function ($scope) {

})

.controller('forgotPasswordCtrl', function ($scope, FileItService, $ionicPopup, $state, EmailHelper) {
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
    };
})

.controller('logOutCtrl', function ($scope) {

})

.controller('sharingKeyManagementCtrl', function ($scope) {

})

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
            $state.go('tabsController.settings');
        }

        if (($scope.data.newPassword != $scope.data.confirmPassword) || ($scope.data.newPassword.length == 0)) {
            failCallback('New password doesn\'t match the confirm password.');
        } else {
            if (!PasswordHelper.validPassword($scope.data.newPassword)) {
                failCallback(PasswordHelper.getPasswordFormatError());
            } else {
                $scope.data.currentUser.PASSWORD = $scope.data.newPassword;
                FileItService.updateUser($scope.data.currentUser, successCallback, failedUpdateCallback);
            }
        }
    };
})

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
            $state.go('tabsController.settings');
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
})

.controller('setUpTeamAndPlayersCtrl', function ($scope) {

})

.controller('scannerSettingsCtrl', function ($scope) {

})

.controller('newAccountCtrl', function ($scope, FileItService, $ionicPopup, $state, AppUser, EmailHelper, PasswordHelper) {
    $scope.init = function () {

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
        function isValid() {
            if ($scope.data.emailAddress == undefined || $scope.data.emailAddress.length == 0) {
                $scope.data.emailAddress = $scope.data.userName;
            }
            AppUser.setObject($scope.data);
            $state.go('newAccountProfile');
        }
        $scope.validateUserName(isValid);
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

    $scope.validateUserName = function (success) {
        var result = true;
        var errorTitle = 'Invalid Entry';
        var errorMessage = '';

        if ($scope.data.userName == undefined || $scope.data.userName.length == 0 || !EmailHelper.validEmail($scope.data.userName)) {
            result = false;
            errorMessage += 'Invalid username / email address.\n'
        }

        if ($scope.data.password == undefined || $scope.data.password.length == 0) {
            result = false;
            errorMessage += 'Please enter a password.\n'
        } else {
            if ($scope.data.password != $scope.data.confirmPassword) {
                result = false;
                errorMessage += 'Passwords do not match.\n'
            } else {
                if (!PasswordHelper.validPassword($scope.data.password)) {
                    result = false;
                    errorMessage += PasswordHelper.getPasswordFormatError();
                }
            }
        }

        function fail(title, message) {
            var alertPopup = $ionicPopup.alert({
                title: title,
                template: message
            });
        }

        if (!result) {
            fail(errorTitle, errorMessage);
        } else {
            //validate against the server
            FileItService.checkUserExists($scope.data.userName, success, function () { fail('Invalid username', 'Username / password already exists') });
        }

    };

    $scope.validAddAccount = function () {
        var result = true;
        var errorTitle = "Incomplete";
        var errorMessage = "";

        var data = $scope.data;
        function hasValue(key) {
            return data[key] != undefined && data[key].length > 0;
        }

        if (!hasValue('userName')) {
            result = false;
            errorMessage += 'No username entered.';
        }
        if (!hasValue('password')) {
            result = false;
            errorMessage += 'No password entered.';
        }
        if (!hasValue('firstName') || !hasValue('lastName')) {
            result = false;
            errorMessage += '<br/>Please enter your name.';
        }
        if (data.relationShipTypeId == undefined || data.relationShipTypeId == -1) {
            result = false;
            errorMessage += '<br/>Please select a relationship type.';
        }
        if (!hasValue('phoneNumber')) {
            result = false;
            errorMessage += '<br/>Please enter a phone number';
        }
        if (data.sex == '') {
            result = false;
            errorMessage += '<br/>Please specify your sex.';
        }
        if (data.appUserTypeId == undefined || data.appUserTypeId == -1) {
            result = false;
            errorMessage += '<br/>Please select a user type.';
        }
        if (!hasValue('emailAddress')) {
            result = false;
            errorMessage += '<br/>Please enter an email address';
        }
        if (!EmailHelper.validEmail(data.emailAddress)) {
            result = false;
            errorMessage += '<br/>Please enter a valid email address';
        }
        if (data.organizationId == undefined || data.organizationId == -1) {
            result = false;
            errorMessage += '<br/>Please select an organization.';
        }

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

.controller('viewImagesCtrl', function ($scope, FileItService, $ionicPopup, $state) {

})

.controller('shareDocumentsCtrl', function ($scope) {

})

.controller('confirmDocumentShareCtrl', function ($scope) {

})

.controller('emergencyShareCtrl', function ($scope) {

})

.controller('shareHasBeenSentCtrl', function ($scope) {

})


