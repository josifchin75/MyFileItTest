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

    $scope.getFamilyUserName = function () {
        var result = '';
        for (var i = 0; i < $scope.data.familyUsers.length; i++) {
            if ($scope.data.familyUsers[i].ID == $scope.data.familyUserId) {
                result = $scope.data.familyUsers[i].FIRSTNAME + ' ' + $scope.data.familyUsers[i].LASTNAME;
                break;
            }
        }

        return result;
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
            // ViewDocument.loadDocuments(FileItService.currentUser(), resetSearch);
            $scope.init();

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
            $scope.data.familyUserName = $scope.getFamilyUserName();
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

.controller('viewYourDocumentsCtrl', function ($scope, ViewDocument, FileItService, $ionicPopup, $state, $filter) {
    $scope.init = function () {
        $scope.data = ViewDocument.getObject();
        $scope.data.currentUser = FileItService.currentUser();
        $scope.data.associatedImageId = -1;
        $scope.data.selectedEventDocumentId = -1;
        //getFamilyRef();
    }

    $scope.initFull = function () {
        $scope.data.associatedCount = 0;
        $scope.data.organizationName = '';
    };

    /********************/
    // selected images
    $scope.selection = [];

    // helper method to get selected fruits
    $scope.selectedImages = function selectedImages() {
        return $filter('filter')($scope.data.searchImages, { selected: true });
    };

    $scope.associatedDocuments = function associatedDocuments() {
        return $filter('filter')($scope.data.eventDocuments, { associated: true });
    };

    // watch fruits for changes
    $scope.$watch('searchImages|filter:{selected:true}', function (nv) {
        $scope.selection = nv.map(function (img) {
            return img.ID;
        });
    }, true);
    /*****************************/

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

    $scope.searchOrganizations = function () {
        function successSearch(data) {
            $scope.data.organizations = data.Organizations;
            $scope.searchEvents();
        }

        function failSearch(data) {

        }

        FileItService.getOrganizations(null, $scope.data.organizationSearch, successSearch, failSearch)
    };

    $scope.searchEvents = function () {
        function successSearch(data) {
            $scope.data.events = data.TeamEvents;
            for (var i = 0; i < $scope.data.events.length; i++) {
                $scope.data.events[i].show = false;
            }
        }

        function failSearch(data) {

        }
        //appUserId, organizationId, teamEventId, searchName,
        FileItService.getTeamEventsByAppUser($scope.data.familyUserId, $scope.data.organizationId == -1 ? null : $scope.data.organizationId, null, $scope.data.eventSearch, successSearch, failSearch)
    };

    $scope.slideHasChanged = function (index) {
        $scope.data.associatedImageId = $scope.data.associatedImages[index].ID;
    };

    $scope.associateImage = function (eventDocumentId) {
        //alert(eventDocumentId);
        //$scope.getEventDocument(eventDocumentId).show = true;
        //$scope.navigateAndSave('documentSlider');
        $scope.data.associatedImages = $scope.selectedImages();
        $scope.data.associatedImageId = $scope.data.associatedImages[0].ID;
        $scope.data.selectedEventDocumentId = eventDocumentId
        var title = 'Select an Image';
        var message = eventDocumentId;
        var alertPopup = $ionicPopup.show({
            title: title,
            templateUrl: 'templates/documentSlider.html',
            cssClass: 'document-slider',
            scope: $scope,
            buttons: [
                 {
                     text: 'Cancel',
                     onTap: function (e) {
                         $scope.data.associatedImageId = -1;
                         return $scope.data.associatedImageId;
                     }
                 },
                 {
                     text: '<b>Associate</b>',
                     type: 'button-positive',
                     onTap: function (e) {
                         if (0 == 1) {
                             //don't allow the user to close unless he enters wifi password
                             e.preventDefault();
                         } else {
                             //alert($scope.data.associatedImageId);
                             return $scope.data.associatedImageId;
                         }
                     }
                 }]
        });
        alertPopup.then(function (res) {
            var eventDoc = $scope.getEventDocument(eventDocumentId);
            eventDoc.associatedId = res;
            eventDoc.associated = res > -1;
            eventDoc.associatedAllowUndo = res > -1;
            eventDoc.Base64ImageThumb = $scope.getSelectedImageBase64Thumb(res);
        });


        // $scope.navigateAndSave('documentSlider');
    };

    $scope.undoAssociate = function (eventDocumentId) {
        var obj = $scope.getEventDocument(eventDocumentId);
        obj.associated = false;
        obj.associatedAllowUndo = false;
        obj.associatedId = -1;
        obj.Base64Image = null;
        obj.Base64ImageThumb = null;
    };

    $scope.getEventDocument = function (eventDocumentId) {
        var result = null;
        if (eventDocumentId > -1) {
            var docs = $scope.data.eventDocuments;

            for (var i = 0; i < docs.length; i++) {
                if (docs[i].ID == eventDocumentId) {
                    result = docs[i];
                    break;
                }
            }
        }

        return result;
    };

    $scope.getOrganization = function (organizationId) {
        var result = null;
        if (organizationId > -1) {
            var orgs = $scope.data.organizations;

            for (var i = 0; i < orgs.length; i++) {
                if (orgs[i].ID == organizationId) {
                    result = orgs[i];
                    break;
                }
            }
        } else {
            result = { NAME: "Unknown" };
        }

        return result;
    };

    $scope.getSelectedImageBase64 = function (selectedImageId) {
        var result = null;

        if (selectedImageId > -1) {
            var images = $scope.data.associatedImages;
            for (var i = 0; i < images.length; i++) {
                if (images[i].ID == selectedImageId) {
                    result = images[i].Base64Image;
                    break;
                }
            }
        }

        return result;
    };

    $scope.getSelectedImageBase64Thumb = function (selectedImageId) {
        var result = null;

        if (selectedImageId > -1) {
            var images = $scope.data.associatedImages;
            for (var i = 0; i < images.length; i++) {
                if (images[i].ID == selectedImageId) {
                    result = images[i].Base64ImageThumb;
                    break;
                }
            }
        }

        return result;
    };

    $scope.getImageById = function (id) {
        var result = null;

        var images = $scope.data.images;
        for (var i = 0; i < images.length; i++) {
            if (images[i].ID == id) {
                result = images[i];
                break;
            }
        }

        return result;
    };

    $scope.goToSelectUser = function () {
        function getFamilyRef() {
            function successGetFamily(data) {
                $scope.data.familyUsers = data.AppUsers;
                $scope.navigateAndSave('shareUserSelect');
            }

            function failRef() { }

            $scope.data = ViewDocument.getObject();
            //ViewDocument.searchDocuments();
            if ($scope.data.selectedImages == undefined) {
                $scope.data.selectedImages = { list: [$scope.data.searchImages[0]] };
            }

            var user = $scope.data.currentUser;
            var primaryAppUserId = user.PRIMARYAPPUSERID == null ? user.ID : user.PRIMARYAPPUSERID;
            FileItService.getFamilyUsers(primaryAppUserId, successGetFamily, failRef);
        }

        $scope.data = ViewDocument.getObject();
        $scope.data.currentUser = FileItService.currentUser();
        //  ViewDocument.loadDocuments(FileItService.currentUser(), getFamilyRef);

        getFamilyRef();
    };

    $scope.goToDocumentSelect = function () {
        var valid = true;
        if ($scope.data.familyUserId == undefined || $scope.data.familyUserId == -1) {
            valid = false;
            $scope.showError('Incomplete', 'Please select a member.');
        }
        if (valid) {
            function nav() {
                $scope.navigateAndSave('shareDocumentSelect');
            }

            ViewDocument.loadUserDocuments($scope.data.familyUserId, nav);
        }
    }

    $scope.goToEventSelect = function () {
        var valid = true;
        if ($scope.selectedImages().length == 0) {
            valid = false;
            $scope.showError("Incomplete", "Please select the documents you would like to share.");
        }

        if (valid) {
            $scope.navigateAndSave('shareEventSelect');
            //this could be an async issue!!
            $scope.searchEvents();
        }
    };

    $scope.goToAssociate = function () {
        var valid = true;

        if ($scope.data.eventId == undefined || $scope.data.eventId == -1) {
            valid = false;
            $scope.showError("Incomplete", "Please select an event to associate your documents to.");
        }

        if (valid) {
            function loadEventDocuments(data) {
                $scope.data.eventDocuments = [];
                for (var i = 0; i < data.TeamEventDocuments.length; i++) {
                    var obj = data.TeamEventDocuments[i];
                    if (obj.DocumentId != null) {
                        //get the set up data
                        obj.associated = true;
                        obj.associatedAllowUndo = false;
                        obj.Base64ImageThumb = $scope.getImageById(obj.DocumentId).Base64ImageThumb;
                    }
                    $scope.data.eventDocuments.push(obj);
                }
                $scope.data.eventDocuments = data.TeamEventDocuments;
                $scope.data.organizationName = $scope.getOrganization($scope.data.organizationId).NAME;
                $scope.navigateAndSave('shareAssociate');
            }

            FileItService.getAppUserTeamEventDocumentsByTeamEvent($scope.data.familyUserId, $scope.data.eventId, loadEventDocuments);
        }
    };


    $scope.goToConfirm = function () {
        var valid = true;

        if ($scope.associatedDocuments().length == 0) {
            valid = false;
            $scope.showError("Incomplete", "Please associate some documents to share.");
        }

        if (valid) {
            $scope.data.associatedCount = $scope.associatedDocuments().length;
            $scope.navigateAndSave('confirmDocumentShare');
        }
    };

    $scope.shareDocuments = function () {
        //share the documents
        function shareSuccess() {
            $scope.init();
            $scope.initFull();
            $scope.navigateAndSave('shareHasBeenSent');
        };

        function shareFail(data) {
            $scope.showError("Error", "We're sorry. There was an error sharing your documents. Please try again later." + data.Message);
        }
        //confirmDocumentShare
        var data = [];
        var associated = $scope.associatedDocuments();
        for (var i = 0; i < associated.length; i++) {
            data.push($scope.generateAssociateDocumentDTO(associated[i]))
        }
        //shareSuccess();
        FileItService.associateDocumentsToTeamEventDocuments(data, shareSuccess);
    };

    $scope.generateAssociateDocumentDTO = function (obj) {
        var result = {
            appUserId: $scope.data.familyUserId,
            organizationId: $scope.data.organizationId,
            fileCabinetDocumentId: obj.associatedId,
            teamEventDocumentId: obj.ID,
            comment: $scope.data.comment + '',
            emergency: false,
            remove: false
        };

        return result;
        /*
        [DataMember]
        public int appUserId { get; set; }
        [DataMember]
        public int organizationId { get; set; }
        [DataMember]
        public int fileCabinetDocumentId { get; set; }
        [DataMember]
        public int teamEventDocumentId { get; set; }
        [DataMember]
        public string comment { get; set; }
        [DataMember]
        public bool emergency { get; set; }
        [DataMember]
        public bool remove { get; set; }*/
    };

    $scope.navigateAndSave = function (screen) {
        ViewDocument.setObject($scope.data);
        $state.go(screen);
    };

    $scope.showError = function (title, message) {
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
    $scope.init = function () {
        $scope.data = {
            currentUser: FileItService.currentUser(),
            familyUsers: []
        };

        function successGetFamily(data) {
            $scope.data.familyUsers = data.AppUsers;
        }

        function failRef() { }

        var user = $scope.data.currentUser;
        var primaryAppUserId = user.PRIMARYAPPUSERID == null ? user.ID : user.PRIMARYAPPUSERID;
        FileItService.getFamilyUsers(primaryAppUserId, successGetFamily, failRef);
    }

    $scope.init();
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

.controller('newAccountCtrl', function ($scope, FileItService, $ionicPopup, $state, AppUser, EmailHelper, PasswordHelper, DateHelper) {
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

        function successAddThenAssociate() {
            //AssociateAppUserToOrganization(string user, string pass, int appUserId, int appUserTypeId, int organizationId, DateTime startDate, DateTime expiresDate, int? yearCode, int sportTypeId)
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
                FileItService.setCurrentUser(data.AppUsers[0]);

                //todo: this may be important!!! it needs to be fixed.
                var appUserTypeId = 5;
                var startDate = DateHelper.serializeDate(new Date());
                var expiresDate = DateHelper.serializeDate(new Date());
                var yearCode = '2015';
                var sportTypeId = 1;
                //AssociateAppUserToOrganization(string user, string pass, int appUserId, int appUserTypeId, int organizationId, DateTime startDate, DateTime expiresDate, int? yearCode, int sportTypeId)
                FileItService.associateAppUserToOrganization(data.AppUsers[0].ID, appUserTypeId, $scope.data.organizationId, startDate, expiresDate, yearCode, sportTypeId, successAdd);
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
    .controller('addFamilyMembersCtrl', function ($scope, FileItService, $ionicPopup, $state, EmailHelper) {
        $scope.init = function () {

            $scope.data = {
                currentUser: FileItService.currentUser(),
                familyUsers: [],
                appUserTypes: [],
                relationShipTypes: [],
                userName: '',
                firstName: '',
                lastName: '',
                relationShipTypeId: -1,
                phoneNumber: '',
                emailAddress: '',
                appUserTypeId: -1,
                sex: ''
            };

            function successGetFamily(data) {
                $scope.data.familyUsers = data.AppUsers;
                FileItService.getReferenceData('RelationShipType', successRef, failRef);
            }

            function successRef(data) {
                $scope.data.relationShipTypes = data.KeyValueData;
                FileItService.getReferenceData('AppUserType', successUserRef, failRef);
            }

            function successUserRef(data) {
                var lookup = 'User/Player';
                for (var i = 0; i < data.KeyValueData.length; i++) {
                    if (data.KeyValueData[i].Value == lookup) {
                        // $scope.data.appUserTypes = data.KeyValueData[i];
                        $scope.data.appUserTypeId = data.KeyValueData[i].Key;
                        break;
                    }
                }

            }

            function failRef() { }

            var user = $scope.data.currentUser;
            var primaryAppUserId = user.PRIMARYAPPUSERID == null ? user.ID : user.PRIMARYAPPUSERID;
            FileItService.getFamilyUsers(primaryAppUserId, successGetFamily, failRef);
        };

        $scope.validAddFamilyMember = function () {
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
                errorMessage += '<br/>Please enter a name.';
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
                errorMessage += '<br/>Please specify a sex.';
            }

            if (!hasValue('emailAddress')) {
                result = false;
                errorMessage += '<br/>Please enter an email address';
            }
            if (!EmailHelper.validEmail(data.emailAddress) && data.emailAddress.length > 0) {
                result = false;
                errorMessage += '<br/>Please enter a valid email address';
            }

            if (!result) {
                var alertPopup = $ionicPopup.alert({
                    title: errorTitle,
                    template: errorMessage
                });
            }

            return result;
        };

        $scope.addFamilyMember = function () {
            function successAdd() {
                var alertPopup = $ionicPopup.alert(
                    {
                        title: 'Success',
                        template: 'Your family member has been added!',
                        buttons: [
                          {
                              text: '<b>Ok</b>',
                              type: 'button-positive',
                              onTap: function (e) {
                                  //$state.go('tabsController.main');
                              }
                          }]
                    });
                $scope.init();
            }

            if ($scope.validAddFamilyMember()) {
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
                    APPUSERSTATUSID: 2,
                    PRIMARYAPPUSERID: $scope.data.currentUser.ID
                };


                function failAddAppUser(data) {
                }

                FileItService.addAppUser(appUserDTO, successAdd, failAddAppUser);
            }
        }

        $scope.init();
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


