mainApp
.controller('viewYourDocumentsCtrl', function ($scope, ViewDocument, FileItService, $ionicPopup, $state, $filter, $ionicSlideBoxDelegate, $timeout) {
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
        //ViewDocument.clearEvents();
        $scope.searchOrganizations();
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
        if (typeof nv != 'undefined') {
            $scope.selection = nv.map(function (img) {
                return img.ID;
            });
        }
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
        if (typeof $scope.data.organizationSearch == 'undefined' || $scope.data.organizationSearch == null) {
            $scope.data.organizationSearch = '';
        }
        if ($scope.data.organizationSearch.length > 0) {
            FileItService.getOrganizations(null, $scope.data.organizationSearch, successSearch, failSearch);
        } else {
            $scope.data.organizations = [];
            ViewDocument.clearEvents();
        }
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
        //$scope.getEventDocument(eventDocumentId).show = true;
        //$scope.navigateAndSave('documentSlider');
        $scope.data.associatedImages = $scope.data.selectedImages;
        $scope.data.associatedImageId = $scope.data.associatedImages[0].ID;
        $scope.data.selectedEventDocumentId = eventDocumentId
        var title = 'Select an Image';
        var message = eventDocumentId;

        function openDialog() {
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
        }

        $timeout(openDialog);
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

    $scope.resendDocuments = function () {
        function resendSuccess() {
            $scope.showError("Success", "Your documents have been resent.");
            $state.go('memberCardSimple');
        }

        function resendFail() { }

        var appUserId = $scope.data.familyUserId;
        var teamEventId = $scope.data.eventId;

        FileItService.resendAssociatedDocuments(appUserId, teamEventId, resendSuccess, resendFail);
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
        $state.go('memberCardSimple');
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

        //if ($scope.associatedDocuments().length == 0) {
        //    valid = false;
        //    $scope.showError("Incomplete", "Please associate some documents to share.");
        //}

        if (valid) {
            function goToConfirm() {
                // $scope.data.associatedCount = $scope.associatedDocuments().length;
                $scope.data.organizationName = $scope.data.organizations[0].NAME;
                $scope.data.eventName = $scope.data.events[0].NAME;
                $scope.navigateAndSave('confirmDocumentShare');
            }

            function goToMemberCard() {
                $scope.navigateAndSave('memberCardSimple');
            }

            goToConfirm();
        }
    };

    $scope.allDocumentsAreAssociated = function () {
        var allAssociated = true;
        //for (var i = 0; i < $scope.data.eventDocuments.length; i++) {
        //    var document = $scope.data.eventDocuments[i];
        //    if (!document.alreadyAssociated) {
        //        allAssociated = false;
        //        break;
        //    }
        //}
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
        var images = $scope.selectedImages();
        for (var i = 0; i < images.length; i++) {
            data.push($scope.generateAssociateDocumentDTO(images[i]))
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
            fileCabinetDocumentId: obj.ID,
            teamEventId: $scope.data.eventId,
            comment: (typeof $scope.data.comment != 'undefined') ? $scope.data.comment + '' : '',
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
});