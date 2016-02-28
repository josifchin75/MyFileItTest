angular.module('app.controllers', [])

.controller('loginCtrl', function ($scope, FileItService, $ionicPopup, $state, Camera, AppUser, FamilyUsers) {
    $scope.init = function () {
        $scope.data = {};

        //debug
       // $scope.data.username = 'josifchin75@gmail.com';
        //$scope.data.password = 'jopass12';

        //$scope.data.username = 'skbutcher1@yahoo.com';
        //$scope.data.password = 'Sandy12';
    }

    $scope.$on('$ionicView.beforeEnter', function () {
        AppUser.logout();
    });

    $scope.login = function () {
        function callback(data) {
            $scope.data.username = '';
            $scope.data.password = '';
            FileItService.setCurrentUser(data.AppUsers[0]);

            var user = data.AppUsers[0];
            var primaryAppUserId = user.PRIMARYAPPUSERID == null ? user.ID : user.PRIMARYAPPUSERID;
            function onLoadFamily(data) {
                $state.go('main', { appUserId: user.ID });
            }

            FamilyUsers.loadFamilyUsers(primaryAppUserId, onLoadFamily);
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

.controller('scanDocumentsCtrl', function ($scope, Camera, FileItService, ScanDocument, $ionicPopup, $state, ViewDocument, Documents) {
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

    $scope.$on('$ionicView.beforeEnter', function () {
        $scope.init();
    });

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

            $scope.getScanDocumentType();
            //$scope.confirm();
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
            }).then(refreshDocs);

            function onSuccessAlertClosed() {
                $state.go('memberCard');
            }

            function refreshDocs() {
                Documents.loadUserDocuments($scope.data.familyUserId, null, onSuccessAlertClosed);
            }
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
        function onFail() {
        }

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

    $scope.getScanDocumentType = function () {
        if ($scope.validUpload(false)) {
            $scope.data.comment = '';
            $state.go('scanDocumentType');
        }
    };

    $scope.confirm = function () {
        if ($scope.validUpload(true)) {
            $scope.data.familyUserName = $scope.getFamilyUserName();
            ScanDocument.setObject($scope.data);
            $state.go('scanDocumentsConfirm');
        }
    };

    $scope.validUpload = function (validateType) {
        var result = true;
        var title = "Incomplete";
        var message = "";
        var data = $scope.data;
        if (validateType) {
            if (data.documentTypeId == undefined || data.documentTypeId == -1) {
                message += "Please select a document type.</br>";
                result = false;
            }

            if (data.familyUserId == undefined || data.familyUserId == -1) {
                message += "Please select a family user to upload for.</br>";
                result = false;
            }
            //if (data.comment == undefined || data.comment.length == 0) {
            //    message += "Please enter a brief comment for your own reference.</br>";
            //    result = false;
            //}
        }

        if (data.currentImage == undefined || data.currentImage.length == 0) {
            message += "Please select an image to upload.</br>";
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

.controller('viewYourDocumentsCtrl', function ($scope, ViewDocument, FileItService, $ionicPopup, $state, $filter, $ionicSlideBoxDelegate) {
    $scope.init = function () {
        $scope.data = ViewDocument.getObject();
        $scope.data.currentUser = FileItService.currentUser();
        $scope.data.associatedImageId = -1;
        $scope.data.selectedEventDocumentId = -1;
    }

    $scope.initFull = function () {
        $scope.data.associatedCount = 0;
        $scope.data.organizationName = '';
    };

    /********************/
    // selected images
    $scope.selection = [];

    $scope.$on('$ionicView.beforeEnter', function () {
        $scope.init();
    });

    // helper method to get selected fruits
    $scope.selectedImages = function selectedImages() {
        return $scope.data.selectedImages;
        //assoc
        //return $filter('filter')($scope.data.searchImages, { selected: true });
    };

    $scope.associatedDocuments = function associatedDocuments() {
        var eventDocs = $scope.data.eventDocuments;
        var result = [];

        for (var i = 0; i < eventDocs.length; i++) {
            if (eventDocs[i].associated == true && eventDocs[i].alreadyAssociated != true) { //this can be undefined
                result.push(eventDocs[i]);
            }
        }
        return result;
        //return $filter('filter')($scope.data.eventDocuments, { associated: true, alreadyAssociated: false });
    };

    //$scope.associatedDocuments = function associatedDocuments() {
    //    return $filter('filter')($scope.data.eventDocuments, { associated: true, alreadyAssociated: false });
    //};

    // watch docs for changes
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

        FileItService.getOrganizations(null, $scope.data.organizationSearch, successSearch, failSearch);
    };

    $scope.searchEvents = function () {
        function onSuccess() {
            var i = 0;
        }

        ViewDocument.searchEvents($scope.data.familyUserId, $scope.data.organizationId == -1 ? null : $scope.data.organizationId, null, $scope.data.eventSearch, onSuccess);
    };

    $scope.slideHasChanged = function (index) {
        $scope.data.associatedImageId = $scope.data.associatedImages[index].ID;
    };

    $scope.repeatDone = function () {
        $ionicSlideBoxDelegate.update();
        $scope.$apply();
    };

    $scope.associateImage = function (eventDocumentId) {
        //alert(eventDocumentId);
        //$scope.getEventDocument(eventDocumentId).show = true;
        //$scope.navigateAndSave('documentSlider');
        $scope.data.associatedImages = $scope.data.selectedImages;
        $scope.data.associatedImageId = $scope.data.associatedImages[0].ID;
        $scope.data.selectedEventDocumentId = eventDocumentId
        var title = 'Select an Image';
        var message = eventDocumentId;

        var alertPopup = $ionicPopup.show({
            title: title,
            templateUrl: 'templates/documentSlider.html',
            cssClass: 'document-slider',
            scope: $scope,
            cache: false,
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
                         //e.preventDefault();
                         return $scope.data.associatedImageId;
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
        /*
        setTimeout(function () {
            $ionicSlideBoxDelegate.update();
            $scope.$apply();
        },500);*/

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

    //$scope.allowUndo = function (obj) {
    //    return (obj.associatedAllowUndo && obj.associated);
    //};

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

    $scope.goToMemberCard = function () {
        $state.go('memberCard');
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
                        obj.alreadyAssociated = true;
                    } else {
                        obj.associated = false;
                        obj.associatedAllowUndo = false;
                    }
                    $scope.data.eventDocuments.push(obj);
                }

                //$scope.data.eventDocuments = data.TeamEventDocuments;
                try {
                    var org = $scope.getOrganization($scope.data.organizationId);
                    $scope.data.organizationName = $scope.data.organizationId > -1 ? org.NAME : '-';
                } catch (ex) {
                    alert(ex);
                }
                $state.go('shareAssociateTest');
                //$scope.navigateAndSave('shareAssociateTest');
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
            function goToConfirm() {
                $scope.data.associatedCount = $scope.associatedDocuments().length;
                $scope.navigateAndSave('confirmDocumentShare');
            }

            function goToMemberCard() {
                $scope.navigateAndSave('memberCard');
            }

            var allDocs = $scope.data.eventDocuments;
            var allAssociated = true;
            for (var i = 0; i < allDocs.length; i++) {
                if (allDocs[i].associated == false) {
                    allAssociated = false;
                    break;
                }
            }

            if (!allAssociated) {
                var confirmPopup = $ionicPopup.confirm({
                    title: 'Associate',
                    template: 'Not all of your documents are associated. Would you still like to continue?'
                });

                confirmPopup.then(function (res) {
                    if (res) {
                        goToConfirm();
                    } else {
                       // goToMemberCard();
                    }
                });
            } else {
                goToConfirm();
            }
        }
    };

    $scope.allDocumentsAreAssociated = function () {
        var allAssociated = true;
        for (var i = 0; i < $scope.data.eventDocuments.length; i++) {
            var document = $scope.data.eventDocuments[i];
            if (!document.alreadyAssociated) {
                allAssociated = false;
                break;
            }
        }
        return allAssociated;
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
            if (associated[i].alreadyAssociated != true) {
                data.push($scope.generateAssociateDocumentDTO(associated[i]))
            }
        }
        //shareSuccess();
        FileItService.associateDocumentsToTeamEventDocuments(data, shareSuccess);
    };

    $scope.filterShares = function (item) {
        return (item.associated && item.alreadyAssociated != true);
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
        //if (!$scope.data.accepted) {
        //    $scope.data.errorMessage += "\nPlease accept the agreement.";
        //    $scope.data.errorTitle = "Cannot send invitation";
        //    result = false;
        //}

        return result;
    }

    $scope.sendInvitationEmail = function () {
        function callback(data) {
            $scope.init();
            $state.go('main');
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

.controller('mainCtrl', function ($scope, FileItService, $ionicPopup, $state) {
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

    .controller('mainCardsCtrl', function ($scope, FileItService, FamilyUser, $state, Documents, FamilyUsers) {
        $scope.init = function () {
            $scope.data = {
                currentUser: FileItService.currentUser(),
                familyUsers: FamilyUsers.getObject()
            };
        };

        //insure that it refreshes!
        $scope.$on('$ionicView.beforeEnter', function () {
            $scope.data.familyUsers = FamilyUsers.getObject();
            currentUser = FileItService.currentUser();
        });

        //occurs when leaving
        $scope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            // var i = 0;
        });

        $scope.reloadRoute = function () {
            $route.reload();
        };

        $scope.loadFamilyUsers = function () {
            $scope.data.familyUsers = FamilyUsers.getObject();
        };

        $scope.showSex = function (obj, sex) {
            return obj.SEX == sex;
        };

        $scope.selectUser = function (obj) {
            //alert(obj.ID);
            FamilyUser.setObject(obj);
            function onSuccess() {
                $state.go('memberCard');
            }
            Documents.loadUserDocuments(obj.ID, null, onSuccess);
        };


        $scope.init();
    })

    .controller('memberCardCtrl', function ($scope, FileItService, FamilyUser, $state, Documents, ScanDocument, $ionicModal, ViewDocument, $filter, $ionicPopup, AvailableShareKeys) {
        $scope.init = function () {
            $scope.data = {
                familyUser: FamilyUser.getObject(),
                documents: Documents.getObject(),
                availableShareKeys: AvailableShareKeys.getObject(),
                promocode: '',
                currentUser: FileItService.currentUser()
            };
            if ($scope.data.documents.length == 0) {
                Documents.loadUserDocuments();
            }
        };

        //insure that it refreshes!
        $scope.$on('$ionicView.beforeEnter', function () {
            $scope.data.documents = Documents.getObject();
            $scope.data.familyUser = FamilyUser.getObject();
            $scope.imageSrc = '';
            myScroll = new iScroll('wrapper',
                { zoom: true, zoomMax: 6 });
        });

        $scope.showSex = function (obj, sex) {
            return obj.SEX == sex;
        };

        $scope.showVerify = function (obj) {
            return obj.VerifiedAppUserId == null && $scope.data.currentUser.IsCoach == true && $scope.data.currentUser.ID != $scope.data.familyUser.ID;
        };

        $scope.isCoachVerifying = function () {
            return $scope.data.currentUser.IsCoach == true && $scope.data.currentUser.ID != $scope.data.familyUser.PRIMARYAPPUSERID;
        };

        $scope.hasShareKey = function (obj) {
            return obj.ShareKeys.length > 0;
        };

        $scope.showLargeImage = function () {
            return typeof $scope.imageSrc != 'undefined' && $scope.imageSrc != '';
        };

        $scope.showModal = function (image) {
            var templateUrl = 'templates/image-popover.html';
            $scope.imageSrc = "data:image/png;base64," + image.Base64Image;
            return;
        }

        // Close the modal
        $scope.closeModal = function () {
            $scope.modal.hide();
            $scope.modal.remove()
        };

        $scope.editMemberProfile = function () {
            $state.go('addFamilyMembers.update', { familyUser: true });
        };

        $scope.getDocument = function () {
            var obj = ScanDocument.getObject();
            obj.familyUserId = $scope.data.familyUser.ID;
            obj.familyUserName = $scope.data.familyUser.FIRSTNAME + ' ' + $scope.data.familyUser.LASTNAME;

            ScanDocument.setObject(obj);
            $state.go('scanDocuments');
        };

        $scope.validateSelectedDocuments = function () {
            var result = false;
            if ($scope.selectedImages().length > 0) {
                result = true;
            } else {
                var alertPopup = $ionicPopup.alert({
                    title: 'Select Documents',
                    template: 'Please select some of your documents.'
                });
            }
            return result;
        };

        $scope.emergencyShare = function () {
            if ($scope.setViewDocument()) {
                $state.go('emergencyShare');
            }
        };

        $scope.shareDocuments = function () {
            if ($scope.setViewDocument()) {
                $state.go('shareEventSelect');
            }
        };

        $scope.setViewDocument = function () {
            var valid = false;
            if ($scope.validateSelectedDocuments()) {
                var obj = {
                    familyUserId: $scope.data.familyUser.ID,
                    selectedImages: $scope.selectedImages(),
                    selectDocumentIds: [],
                    images: Documents.getObject()
                };
                ViewDocument.setObject(obj);
                ViewDocument.searchEvents($scope.data.familyUser.ID, null, '');
                valid = true;
            }
            return valid;
        };

        $scope.findDocument = function (documentId) {
            var docs = $scope.data.documents;
            var result = {};
            for (var i = 0; i < docs.length; i++) {
                if (docs[i].ID == documentId) {
                    result = docs[i];
                    break;
                }
            }
            return result;
        };

        $scope.verifyDocument = function (documentId, teamEventDocumentId) {
            function verifyDoc() {
                var verifyAppUserId = $scope.data.currentUser.ID;

                function onVerifySuccess(data) {
                    var doc = $scope.findDocument(documentId);
                    doc.VerifiedAppUserId = $scope.data.currentUser.ID;
                    doc.VerifiedDate = moment().format();
                    return;

                    var docs = $scope.data.documents;
                    var result = [];
                    for (var i = 0; i < docs.length; i++) {
                        if (docs[i].ID == documentId) {
                            docs[i].VERIFIEDAPPUSERID = $scope.data.currentUser.ID;
                            docs[i].VERIFIEDDATE = moment().format();
                        }
                        result.push(docs[i]);
                    }
                    Documents.setObject(result);
                    $scope.data.documents = result;
                }

                function onVerifyFail() {

                }

                FileItService.verifyDocument(documentId, verifyAppUserId, teamEventDocumentId, onVerifySuccess, onVerifyFail);
            }

            var title = 'Verify?';
            var message = "Are you sure this document is correct?";

            $scope.confirmMessage(title, message, verifyDoc);
        };

        $scope.rejectDocument = function (teamEventDocumentId) {
            function reject() {
                var appUserId = $scope.data.familyUser.ID;

                function rejectSuccess() {
                    var docs = $scope.data.documents;
                    var result = [];
                    for (var i = 0; i < docs.length; i++) {
                        if (docs[i].TeamEventDocumentId != teamEventDocumentId) {
                            result.push(docs[i]);
                        }
                    }
                    $scope.data.documents = result;
                }

                function rejectFail() {

                }

                FileItService.rejectTeamEventDocumentShare(appUserId, teamEventDocumentId, rejectSuccess, rejectFail);
            }

            var title = 'Reject?';
            var message = "Are you sure you want to reject this document?";

            $scope.confirmMessage(title, message, reject);
        };

        $scope.deleteDocument = function (fileName) {
            function remove() {
                var appUserId = $scope.data.familyUser.ID;

                function removeSuccess() {
                    var docs = $scope.data.documents;
                    var result = [];
                    for (var i = 0; i < docs.length; i++) {
                        if (docs[i].DOCUMENTID != fileName) {
                            result.push(docs[i]);
                        }
                    }
                    $scope.data.documents = result;
                }

                function removeFail() {

                }

                FileItService.deleteAppUserDocument(appUserId, fileName, removeSuccess, removeFail);
            }

            var title = 'Delete?';
            var message = "Are you sure you want to remove this document?";

            $scope.confirmMessage(title, message, remove);
        };

        $scope.confirmMessage = function (title, message, onOk, onCancel) {
            var confirmPopup = $ionicPopup.confirm({
                title: title,
                template: message
            });

            confirmPopup.then(function (res) {
                if (res) {
                    if (typeof onOk == 'function') {
                        onOk();
                    }
                } else {
                    if (typeof onCancel == 'function') {
                        onCancel();
                    }
                }
            });
        };

        $scope.associateKey = function () {
            function goToMemberPage() {
                $state.go('memberShareKey');
            }

            $scope.searchKeys(goToMemberPage);
        };

        $scope.searchKeys = function (onSuccess) {
            function onGetKeys(data) {
                $scope.data.availableShareKeys = data.ShareKeys;
                AvailableShareKeys.setObject(data.ShareKeys);
                if (typeof onSuccess == 'function') {
                    onSuccess(data);
                }
            }

            function onGetError() { }

            FileItService.getAvailableShareKeysByPromoCodeAndPrimaryUser($scope.data.currentUser.ID, $scope.data.promocode, onGetKeys, onGetError);
        };

        $scope.goToMemberCard = function () {
            $state.go('memberCard');
        };

        $scope.selectShareKey = function (shareKeyId) {
            var appUserId = $scope.data.familyUser.ID;

            function keySuccess() {
                $scope.data.familyUser.ShareKeys = [];
                $scope.data.familyUser.ShareKeys.push({ ID: shareKeyId });

                var message = 'The key you selected has been activated. You may now share documents!';
                var alertPopup = $ionicPopup.alert({
                    title: 'Key has been used.',
                    template: message
                });
                alertPopup.then(function () {
                    $scope.goToMemberCard();
                });
            }

            function keyFail() { }

            FileItService.associateShareKeyToUser(
                        appUserId,
                        shareKeyId,
                        keySuccess,
                        keyFail);
        };

        $scope.goToMainCard = function () {
            $state.go('memberCard');
        };

        /*****************************************/
        $scope.selectedImages = function selectedImages() {
            return $filter('filter')($scope.data.documents, { selected: true });
        };

        $scope.associatedDocuments = function associatedDocuments() {
            var eventDocs = $scope.data.eventDocs;
            var result = [];

            for (var i = 0; i < eventDocs.length; i++) {
                if (eventDocs[i].associated == true && eventDocs[i].alreadyAssociated == true) {
                    result.push(eventDocs[i]);
                }
            }
            return result;
            //return $filter('filter')($scope.data.eventDocuments, { associated: true, alreadyAssociated: false });
        };

        // watch docs for changes
        $scope.$watch('searchImages|filter:{selected:true}', function (nv) {
            $scope.selection = nv.map(function (img) {
                return img.ID;
            });
        }, true);
        /************************************************/

        $scope.init();
    })

.controller('settingsCtrl', function ($scope, FileItService) {
    $scope.init = function () {
        $scope.data = {
            currentUser: FileItService.currentUser()
        };
    };

    $scope.init();
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

.controller('sharingKeyManagementCtrl', function ($scope, FileItService, $ionicPopup, $state) {
    $scope.init = function () {
        $scope.data = {
            currentUser: FileItService.currentUser(),
            promocode: '',
            shareKeys: [],
            familyUsers: [],
            availableFamilyUsers: [],
            currentShareKeyId: -1,
            shareKeyAppUserId: -1,
            selectedUserId: -1
        };

        function successGetFamily(data) {
            for (var i = 0; i < data.AppUsers.length; i++) {
                data.AppUsers[i].show = data.AppUsers[i].ShareKeys.length > 0;
                $scope.data.familyUsers.push(data.AppUsers[i]);
            }

            $scope.searchKeys();
        }

        function onGetError() { }

        var user = $scope.data.currentUser;
        var primaryAppUserId = user.PRIMARYAPPUSERID == null ? user.ID : user.PRIMARYAPPUSERID;
        FileItService.getFamilyUsers(primaryAppUserId, successGetFamily, onGetError);
    };

    $scope.searchKeys = function () {
        function onGetKeys(data) {
            $scope.data.shareKeys = data.ShareKeys;
        }

        function onGetError() { }

        FileItService.getAvailableShareKeysByPromoCodeAndPrimaryUser($scope.data.currentUser.ID, $scope.data.promocode, onGetKeys, onGetError);
    };

    $scope.selectShareKeyUser = function (id) {
        $scope.data.currentShareKeyId = id;
        $scope.data.shareKeyAppUserId = -1;
        $scope.createAvailableFamilyMembers();

        var title = 'Select a Family Member';
        var alertPopup = $ionicPopup.show({
            title: title,
            templateUrl: 'templates/selectUser.html',
            cssClass: 'document-slider',
            scope: $scope,
            buttons: [
                 {
                     text: 'Cancel',
                     onTap: function (e) {
                         $scope.data.shareKeyAppUserId = -1;
                         return $scope.data.shareKeyAppUserId;
                     }
                 },
                 {
                     text: '<b>Associate</b>',
                     type: 'button-positive',
                     onTap: function (e) {
                         return $scope.data.shareKeyAppUserId;
                     }
                 }]
        });
        alertPopup.then(function () {
            var userId = $scope.data.shareKeyAppUserId;
            if (userId > -1) {
                //find the correct sharekey and set the appuserid to value, set associate = true
                var k = $scope.getShareKey($scope.data.currentShareKeyId);
                var f = $scope.getFamilyMember(userId);
                k.APPUSERID = userId;
                k.associate = true;
                k.AppUserName = f.FIRSTNAME + ' ' + f.LASTNAME;
            }
            return;
        });
    };
    $scope.updateShareKeys = function () {
        //get all keys set as associated = true
        var keysToPost = [];
        var keys = $scope.data.shareKeys;
        for (var i = 0; i < keys.length; i++) {
            if (keys[i].associate) {
                keysToPost.push(keys[i]);
            }
        }

        if (keysToPost.length > 0) {
            function postSuccess() {
                var message = 'Your keys have been matched to your family members.';

                var alertPopup = $ionicPopup.alert({
                    title: 'Success',
                    template: message
                });
                alertPopup.then(function () {
                    $scope.init();
                });
            }

            //post them to service recursively
            function postKeys(keys) {
                if (keys.length > 0) {
                    var k = keys.pop();
                    FileItService.associateShareKeyToUser(
                        k.APPUSERID,
                        k.ID,
                        function () { postKeys(keysToPost); });
                } else {
                    postSuccess();
                }
            }
            postKeys(keysToPost);
        } else {
            var title = 'No Selections';
            var message = 'Please associate some members to your keys.';
            var alertPopup = $ionicPopup.alert({
                title: title,
                template: message
            });

        }

    };
    $scope.getShareKey = function (id) {
        var result = {};

        var keys = $scope.data.shareKeys;
        for (var i = 0; i < keys.length; i++) {
            if (keys[i].ID == id) {
                result = keys[i];
                break;
            }
        }

        return result;
    };
    $scope.getFamilyMember = function (id) {
        var result = null;

        var users = $scope.data.familyUsers;
        for (var i = 0; i < users.length; i++) {
            if (users[i].ID == id) {
                result = users[i];
                break;
            }
        }

        return result;
    };

    $scope.createAvailableFamilyMembers = function () {
        var users = $scope.data.familyUsers;
        var keys = $scope.data.shareKeys;
        var availableUsers = [];

        function findUser(id) {
            var result = false;
            for (var j = 0; j < keys.length; j++) {
                if (keys[j].APPUSERID == id) {
                    result = true;
                    break;
                }
            }
            return result;
        }

        for (var i = 0; i < users.length; i++) {
            if (!findUser(users[i].ID)) {
                availableUsers.push(users[i]);
            }
        }

        $scope.data.availableFamilyUsers = availableUsers;
    };

    $scope.init();
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
})

.controller('setUpTeamAndPlayersCtrl', function ($scope) {

})

.controller('scannerSettingsCtrl', function ($scope) {

})

.controller('newAccountCtrl', function ($scope, FileItService, $ionicPopup, $state, AppUser, EmailHelper, PasswordHelper, DateHelper, FamilyUsers) {
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

    $scope.clearData = function () {
        $scope.data.userName = null;
        $scope.data.password = null;
        $scope.data.confirmPassword = null;
        $scope.data.firstName = null;
        $scope.data.lastName = null;
        $scope.data.phoneNumber = null;
        $scope.data.phoneNumber = null;
        $scope.data.emailAddress = null;
        $scope.data.sex = null;
        $scope.data.relationShipTypeId = null;
        $scope.data.appUserTypeId = null;
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
                              $scope.clearData();
                              $state.go('main');
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
                FileItService.setCurrentUser(data.AppUsers[0]);
                var user = data.AppUsers[0];
                var primaryAppUserId = user.PRIMARYAPPUSERID == null ? user.ID : user.PRIMARYAPPUSERID;

                FamilyUsers.loadFamilyUsers(primaryAppUserId, successAdd);
               // successAdd();

                //this is removed for now Dec29-2015
                ////todo: this may be important!!! it needs to be fixed.
                //var appUserTypeId = 5;
                //var startDate = DateHelper.serializeDate(new Date());
                //var expiresDate = DateHelper.serializeDate(new Date());
                //var yearCode = '2015';
                //var sportTypeId = 1;
                ////AssociateAppUserToOrganization(string user, string pass, int appUserId, int appUserTypeId, int organizationId, DateTime startDate, DateTime expiresDate, int? yearCode, int sportTypeId)
                //FileItService.associateAppUserToOrganization(data.AppUsers[0].ID, appUserTypeId, $scope.data.organizationId, startDate, expiresDate, yearCode, sportTypeId, successAdd);
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
        //if (data.appUserTypeId == undefined || data.appUserTypeId == -1) {
        //    result = false;
        //    errorMessage += '<br/>Please select a user type.';
        //}
        if (!hasValue('emailAddress')) {
            result = false;
            errorMessage += '<br/>Please enter an email address';
        }
        if (!EmailHelper.validEmail(data.emailAddress)) {
            result = false;
            errorMessage += '<br/>Please enter a valid email address';
        }
        //if (data.organizationId == undefined || data.organizationId == -1) {
        //    result = false;
        //    errorMessage += '<br/>Please select an organization.';
        //}

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
    .controller('addFamilyMembersCtrl', function ($scope, FileItService, $ionicPopup, $state, EmailHelper, FamilyUser, FamilyUsers) {
        $scope.init = function (obj) {

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
                sex: '',
                adding: true
            };
            function loadObject() {
                if (typeof obj != 'undefined') {
                    obj = FamilyUser.getObject();
                    //load up the controls
                    $scope.data.ID = obj.ID;
                    $scope.data.userName = obj.USERNAME;
                    $scope.data.firstName = obj.FIRSTNAME;
                    $scope.data.lastName = obj.LASTNAME;
                    $scope.data.relationShipTypeId = obj.RELATIONSHIPTYPEID;
                    $scope.data.phoneNumber = obj.PHONE;
                    $scope.data.emailAddress = obj.EMAILADDRESS;
                    $scope.data.appUserTypeId = obj.APPUSERTYPEID;
                    $scope.data.sex = obj.SEX;
                    $scope.data.adding = false;
                    $scope.data.dtoObject = obj;
                }
            }

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
                loadObject();
            }

            function failRef() { }

            var user = $scope.data.currentUser;
            var primaryAppUserId = user.PRIMARYAPPUSERID == null ? user.ID : user.PRIMARYAPPUSERID;
            FileItService.getFamilyUsers(primaryAppUserId, successGetFamily, failRef);
        };

        $scope.$on('$ionicView.beforeEnter', function () {
            var user = eval('(' + $state.params.familyUser + ')');
            $scope.init(user);
        });


        $scope.validAddFamilyMember = function () {
            var result = true;
            var errorTitle = "Incomplete";
            var errorMessage = "";

            var data = $scope.data;
            function hasValue(key) {
                return data[key] != undefined && data[key].length > 0;
            }

            //if (!hasValue('userName')) {
            //    result = false;
            //    errorMessage += 'No username entered.';
            //}
            //if (!hasValue('password')) {
            //    result = false;
            //    errorMessage += 'No password entered.';
            //}
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
                        template: $scope.data.adding ? 'Your family member has been added!' : 'Your family member has been updated!',
                        buttons: [
                          {
                              text: '<b>Ok</b>',
                              type: 'button-positive',
                              onTap: function (e) {

                              }
                          }]
                    });

                if (!$scope.data.adding) {
                    //TODO: should have used the FamilyUser to pass in the object!!!
                    angular.extend($scope.data.dtoObject, appUserDTO);
                    FamilyUser.setObject($scope.data.dtoObject);
                    $scope.goToMain();
                } else {
                    $scope.init();
                }
            }

            if ($scope.validAddFamilyMember()) {
                var data = $scope.data;

                var appUserDTO = {
                    USERNAME: data.currentUser.USERNAME,//data.userName,
                    PASSWORD: data.currentUser.PASSWORD,
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
                if (!$scope.data.adding) {

                }

                function failAddAppUser(data) {
                }

                if ($scope.data.adding) {
                    FileItService.addAppUser(appUserDTO, successAdd, failAddAppUser);
                } else {
                    appUserDTO.ID = $scope.data.ID;
                    FileItService.updateUser(appUserDTO, successAdd, failAddAppUser);
                }
            }
        }

        $scope.goToMain = function () {
            if ($scope.data.adding) {
                function onLoadFamily(data) {
                    $state.go('main', { appUserId: $scope.data.currentUser.ID });
                }

                FamilyUsers.loadFamilyUsers($scope.data.currentUser.ID, onLoadFamily);
            } else {
                $state.go($scope.data.adding ? 'main' : 'memberCard');
            }

        };

        $scope.init();
    })

    .controller('teamCtrl', function ($scope, TeamPlayer, FileItService, $ionicPopup, $state, EmailHelper, DateHelper, Documents, FamilyUser) {
        $scope.init = function () {
            $scope.data = TeamPlayer.getObject();
            $scope.data.currentUser = FileItService.currentUser();
            $scope.data.organization = null;
            if ($scope.data.teamEvents.length == 0) {
                $scope.searchEvents();
            }
        };

        $scope.$on('$ionicView.beforeEnter', function () {
            $scope.init();
        });

        $scope.displayDate = function (val) {
            return DateHelper.displayDate(val);
        };

        $scope.searchOrganizations = function () {
            function successSearch(data) {
                $scope.data.organizations = data.Organizations;
            }

            function failSearch(data) {

            }

            FileItService.getOrganizations(null, $scope.data.organizationSearch, successSearch, failSearch)
        };

        $scope.searchEvents = function (callback) {
            function successSearch(data) {
                $scope.data.teamEvents = data.TeamEvents;
                if (typeof callback == 'function') {
                    callback();
                }
            }

            function failSearch(data) {

            }
            //appUserId, organizationId, teamEventId, searchName,
            FileItService.getTeamEventsByCoach($scope.data.currentUser.ID, null, successSearch, failSearch);
            //FileItService.getTeamEventsByAppUser($scope.data.currentUser.ID, $scope.data.organization == null ? null : $scope.data.organization.ID, null, $scope.data.eventSearch, successSearch, successSearch);
        };

        $scope.getPlayers = function (callback) {
            function loadPlayers(data) {
                $scope.data.players = data.TeamEventPlayerRosters;
                if (typeof callback == 'function') {
                    callback();
                }
            }

            function failPlayers() { }

            FileItService.getTeamEventPlayerRosters(null, $scope.data.teamEvent.ID, loadPlayers, failPlayers);
        };

        $scope.getUploadPlayers = function (callback) {
            function getUploadPlayers(data) {
                $scope.data.uploadPlayers = data.AppUsers;
                if (typeof callback == 'function') {
                    callback();
                }
            }

            function failUploadPlayers() { }

            FileItService.getTeamEventPlayersWithUploads($scope.data.teamEvent.ID, getUploadPlayers, failUploadPlayers);
        };

        $scope.addPlayerUpload = function (obj) {
            function callback() {
                $scope.getUploadPlayers($scope.getPlayers);
            }
            $scope.addPlayer(obj, callback);
        };

        $scope.addPlayerNew = function (obj) {
            function callback() {
                $scope.searchMembers($scope.getPlayers);
            }
            $scope.addPlayer(obj, callback);
        };

        $scope.addPlayer = function (userObj, callback) {
            var tepRosterObj = {
                TEAMEVENTID: $scope.data.teamEvent.ID,
                APPUSERID: userObj.ID,
                PLAYERPOSITION: '.',
                JERSEYNUMBER: null
            };

            /*
        public int ID { get; set; }
        public int TEAMEVENTID { get; set; }
        public Nullable<int> APPUSERID { get; set; }
        public string PLAYERPOSITION { get; set; }
        public Nullable<int> JERSEYNUMBER { get; set; }
        public Nullable<System.DateTime> DATECREATED { get; set; }
        public int? USERSTAGETYPEID { get; set; }
            */

            function addSuccess() {
                // $scope.getUploadPlayers($scope.getPlayers);
                callback();
            }

            function addFail() { }

            FileItService.addTeamEventPlayerRoster(tepRosterObj, addSuccess, addFail);//: function (teamEventPlayerRoster, success, fail)
        };

        $scope.removePlayer = function (id) {
            function addSuccess() {
                $scope.getPlayers();
            }

            function addFail() { }

            FileItService.removeTeamEventPlayerRoster(id, addSuccess, addFail);
        }

        $scope.viewPlayer = function (player) {
            function getUserSuccess(data) {
                var user = data.AppUsers[0];

                FamilyUser.setObject(user);
                function onSuccess() {
                    $state.go('memberCard');
                }
                //need to get appuser

                Documents.loadUserDocuments(user.ID, $scope.data.teamEvent.ID, onSuccess);
            }
            function getUserFail() { }

            FileItService.getAppUsers(player.APPUSERID, '', getUserSuccess, getUserFail);
        };

        $scope.searchMembers = function (callback) {
            function successGetMembers(data) {
                $scope.data.searchedMembers = data.AppUsers;
                if (typeof callback == 'function') {
                    callback();
                }
            }

            function failGetMembers() { }

            FileItService.getAppUsersByNameSexEmail($scope.data.currentUser.ID, $scope.data.teamEvent.ID, $scope.data.firstNameSearch, $scope.data.lastNameSearch, $scope.data.emailSearch, $scope.data.sex, successGetMembers, failGetMembers);
        };

        $scope.start = function () {
            //TeamPlayer.clear();
            $scope.init();
        };

        $scope.showSex = function (obj, sex) {
            return obj.Sex == sex;
        };

        $scope.selectEvent = function () {
            if ($scope.data.organization == null) {
                $scope.showMessage('Incomplete', 'Please select an organization.');
            } else {
                TeamPlayer.setObject($scope.data);
                $state.go('teamSelectEvent');
            }
        };

        $scope.viewPlayers = function () {
            if ($scope.data.teamEvent == null) {
                $scope.showMessage('Incomplete', 'Please select a team event.');
            } else {
                function navigateTeam() {
                    TeamPlayer.setObject($scope.data);
                    $state.go('teamViewPlayers');
                }
                $scope.getPlayers(navigateTeam);

            }
        };

        $scope.goUploadPlayers = function () {
            function navigateToPending() {
                TeamPlayer.setObject($scope.data);
                $state.go('teamAddPending');
            }
            $scope.getUploadPlayers(navigateToPending);
        };

        $scope.showMessage = function (title, message) {
            var alertPopup = $ionicPopup.alert({
                title: title,
                template: message
            });
        };

        //$scope.init();
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


.controller('shareHasBeenSentCtrl', function ($scope) {

})

    .controller('aboutCtrl', function ($scope) {
        $scope.init = function () {
            var data = {
                version: "1.0"
            };
            $scope.data = data;
        };

        $scope.init();
    })

.controller('sideMenuCtrl', function ($scope, $rootScope, FileItService) {
    $scope = $rootScope;
    $scope.init = function () {
        $scope.UserId = FileItService.currentUser().ID;
    }

    $scope.$on('$ionicView.beforeEnter', function () {
        $scope.init();
    });

    $scope.loggedIn = function () {
        var user = FileItService.currentUser();
        var result = false;
        result = typeof user != 'undefined' && user != null;

        return result;
    };

    $scope.isCoach = function () {
        var user = FileItService.currentUser();
        var result = false;
        var isCoach = typeof user != 'undefined' && user != null && user.IsCoach;
        result = typeof user != 'undefined' && isCoach;

        return result;
    };

    //$scope.init();
})

.controller('emergencyShareCtrl', function ($scope, FileItService, $ionicPopup, $state, ViewDocument, EmailHelper) {
    $scope.init = function () {
        $scope.data = ViewDocument.getObject();
        $scope.data.currentUser = FileItService.currentUser();
        $scope.data.confirmed = false;
        $scope.data.emergencyEmailAddress = '';
        $scope.data.emailMessage = '';

        //debug
        //$scope.data.emergencyEmailAddress = 'josifchin75@gmail.com';
    };

    $scope.$on('$ionicView.beforeEnter', function () {
        $scope.init();
    });

    $scope.sendEmergencyShare = function () {
        function emergencySuccess() {
            $scope.showMessage('Success', 'An emergency email has been sent to ' + $scope.data.emergencyEmailAddress);
            $state.go('main');
        }

        function emergencyFail(data) {
            $scope.showMessage('Error', 'There was an error sending the emergency email.\n' + data.message);
        }

        var docIds = [];
        var images = $scope.data.selectedImages;
        for (var i = 0; i < images.length; i++) {
            docIds.push(images[i].ID);
        }
        if ($scope.validEmergencyShare()) {
            FileItService.addEmergencyShare($scope.data.currentUser.ID, docIds, $scope.data.emergencyEmailAddress, $scope.data.emailMessage, emergencySuccess, emergencyFail);
        }
    };

    $scope.validEmergencyShare = function () {
        var result = true;
        var message = '';

        if (!$scope.data.confirmed) {
            message += 'Please confirm the emergency share.';
        }

        if (typeof $scope.data.emergencyEmailAddress == 'undefined' || $scope.data.emergencyEmailAddress == null || $scope.data.emergencyEmailAddress.length == 0) {
            message += "Please enter an email address to send the emergency share to.";
        } else {
            if (!EmailHelper.validEmail($scope.data.emergencyEmailAddress)) {
                message += "Please enter a valid email address.";
            }
        }



        if (message.length > 0) {
            $scope.showMessage('Incomplete', message);
            result = false;
        }

        return result;
    };

    $scope.showMessage = function (title, message) {
        var alertPopup = $ionicPopup.alert({
            title: title,
            template: message
        });
    };
})

