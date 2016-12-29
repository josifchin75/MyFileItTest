mainApp
.controller('scanDocumentsCtrl', function ($scope, Camera, FileItService, ScanDocument, $ionicPopup, $state, ViewDocument, Documents) {
    $scope.init = function () {
        $scope.data = ScanDocument.getObject();
        $scope.data.currentUser = FileItService.currentUser();
       

        function successRef(data) {
            $scope.data.documentTypes = [];
            for (var i = 0; i < data.DocumentTypes.length; i++) {
                $scope.data.documentTypes.push({
                    Key: data.DocumentTypes[i].ID,
                    Value: data.DocumentTypes[i].NAME
                });
            }
            //$scope.data.documentTypes = data.KeyValueData;
            function successGetFamily(data) {
                $scope.data.familyUsers = data.AppUsers;
            }
            var user = $scope.data.currentUser;
            var primaryAppUserId = user.PRIMARYAPPUSERID == null ? user.ID : user.PRIMARYAPPUSERID;
            FileItService.getFamilyUsers(primaryAppUserId, successGetFamily, failRef);
        }

        function failRef(data) {
        }
        FileItService.getDocumentTypes(currentUser.ID, successRef, failRef);
        //FileItService.getReferenceData('DocumentType', successRef, failRef);
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
                $state.go('memberCardSimple');
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
            AMOUNT: $scope.data.amount * 100
            //VERIFIEDDATE: getDate(),
            //VERIFIEDAPPUSERID: $scope.data.failAddAppUser
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
            if (data.amount == undefined || data.amount.length == 0) {
                message += "Please enter an amount.</br>";
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
});