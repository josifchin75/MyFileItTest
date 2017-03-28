mainApp
    .controller('memberCardCtrl', function ($scope, FileItService, FamilyUser, $state, Documents, ScanDocument, $ionicModal, ViewDocument, $filter, $ionicPopup, AvailableShareKeys, LocalDocuments, $timeout, AlertService) {
        $scope.init = function () {
            $scope.data = {
                familyUser: FamilyUser.getObject(),
                documents: Documents.getObject(),
                simpleDocuments: Documents.getSimpleListObject(),
                availableShareKeys: AvailableShareKeys.getObject(),
                promocode: '',
                currentUser: FileItService.currentUser(),
                showThumbs: false,
                documentTypeFilterId: null,
                startDateFilter: null,
                endDateFilter: null
            };
            if ($scope.data.documents.length == 0) {
                //taken out for debug
                // Documents.loadUserDocuments();
            }
            function successGetDocumentTypes(data) {
                $scope.data.documentTypes = [];
                for (var i = 0; i < data.DocumentTypes.length; i++) {
                    $scope.data.documentTypes.push({
                        Key: data.DocumentTypes[i].ID,
                        Value: data.DocumentTypes[i].NAME
                    });
                }
            }
            FileItService.getDocumentTypes($scope.data.currentUser.ID, successGetDocumentTypes, null);
            //FileItService.getReferenceData('DocumentType', successGetDocumentTypes, null);

        };

        //insure that it refreshes!
        $scope.$on('$ionicView.beforeEnter', function () {
            $scope.data.documents = Documents.getObject();
            $scope.data.simpleDocuments = Documents.getSimpleListObject();
            $scope.data.familyUser = FamilyUser.getObject();
            $scope.imageSrc = '';
            $scope.data.currentUser = FileItService.currentUser();
            $scope.data.showThumbs = false;
            $scope.data.documentTypeFilterId = null;
            $scope.data.startDateFilter = null;
            $scope.data.endDateFilter = null;

            $scope.setAmountSelected();

            $scope.hideLargeImage();
            myScroll = new iScroll('wrapper',
                { zoom: true, zoomMax: 6 });
        });

        $scope.showSex = function (obj, sex) {
            return obj.SEX == sex;
        };

        $scope.showPromoImage = function () {
            return $scope.data.currentUser.PromoCodeImage != null;
        };

        $scope.doFilter = function (document) {
            //var result = ($scope.data.documentTypeFilterId == null || $scope.data.documentTypeFilterId == "" || $scope.data.documentTypeFilterId == document.DOCUMENTTYPEID);
            //filter if blank
            var result = ($scope.data.documentTypeFilterId == "-999" || $scope.data.documentTypeFilterId == document.DOCUMENTTYPEID);
            var start = $scope.data.startDateFilter;
            var end = $scope.data.endDateFilter;
            if (result && moment(start).isValid() && moment(end).isValid()) {
                //check the dates
                result = moment(document.DOCUMENTDATE).isBetween(start, end)
            }
            if (!result && document.selected) {
                document.selected = false;
                $scope.setAmountSelected();
            }
            return result;
        };

        $scope.documentTypesFilter = function (type) {
            var documents = $scope.data.simpleDocuments;
            var result = false;
            for (var loop = 0; loop < documents.length; loop++) {
                if (type.Key == documents[loop].DOCUMENTTYPEID) {
                    result = true;
                    break;
                }
            }
            return result;
        };

        $scope.displayAmount = function (amount) {
            return ViewDocument.displayAmount(amount);
        };

        $scope.setAmountSelected = function () {
            var amount = 0;
            var selected = $scope.selectedImages();
            for (var i = 0; i < selected.length; i++) {
                amount += selected[i].AMOUNT;
            }
            $scope.amountSelected = $scope.displayAmount(amount);
        };

        $scope.totalAmountSelected = function () {
            var amount = 0;
            for (var i = 0; i < $scope.data.simpleDocuments.length; i++) {
                if ($scope.doFilter($scope.data.simpleDocuments[i])) {
                    amount += $scope.data.simpleDocuments[i].AMOUNT;
                }
            }

            return $scope.displayAmount(amount);
        };

        $scope.showVerify = function (obj) {
            if (typeof $scope.data.currentUser.verifying == 'undefined') {
                $scope.data.currentUser.verifying = false;
            }
            return obj.VerifiedAppUserId == null && $scope.data.currentUser.verifying;//$scope.data.currentUser.IsCoach == true && $scope.data.currentUser.ID != $scope.data.familyUser.ID;
        };

        $scope.isCoachVerifying = function () {
            if (typeof $scope.data.currentUser.verifying == 'undefined') {
                $scope.data.currentUser.verifying = false;
            }
            return $scope.data.currentUser.verifying;// $scope.data.currentUser.IsCoach == true && $scope.data.currentUser.ID != $scope.data.familyUser.PRIMARYAPPUSERID;
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
            $timeout(function () { $('#large-image-viewer').show('slow'); }, 500);
            return;
        }

        $scope.showModalCall = function (document) {
            function gotImage(doc) {
                document = doc;
                for (var i = 0; i < $scope.data.simpleDocuments.length; i++) {
                    if ($scope.data.simpleDocuments[i].ID == doc.ID) {
                        $scope.data.simpleDocuments[i].Base64Image = doc.Base64Image;
                        $scope.data.simpleDocuments[i].Base64ImageThumb = doc.Base64ImageThumb;
                        break;
                    }
                }

                $scope.showModal(doc);
            }
            function fail() {

            }
            //move the larege viewer to the correct thumb
            var obj = $('#large-image-viewer');
            var thumbObj = $('#document-' + document.ID).parent();

            $(obj).hide('slow', function () {
                $(obj).detach();
                $(obj).prependTo(thumbObj);
            });

            //if the image has already been show, just retain it.
            if (document.Base64Image == null) {
                FileItService.getSingleDocument(document.ID, document.TeamEventDocumentId, document.VerifiedAppUserId, gotImage, fail);
            } else {
                $scope.showModal(document);
            }
        };

        $scope.hideLargeImage = function () {
            $('#large-image-viewer').hide('slow');
        };

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
            //test if they have a trial key or a valid share key
            var currentUser = $scope.data.currentUser;
            if (currentUser.DaysLeftInTrial < 0 && !$scope.hasShareKey($scope.data.familyUser)) {
                $scope.remindAboutTrial();
            } else {

                function onSuccess() {
                    if ($scope.setViewDocument()) {
                        $state.go('shareEventSelect');
                    }
                }

                var documentIds = [];
                var allDocs = $scope.selectedImages();
                for (var i = 0; i < allDocs.length; i++) {
                    if (allDocs[i].selected && allDocs[i].Base64ImageThumb == null) {
                        documentIds.push(allDocs[i].ID);
                    }
                }

                $scope.loadThumbsFromList(documentIds, onSuccess);
            }
        };

        $scope.remindAboutTrial = function () {
            var message = '<sharekey-url user-id="' + $scope.data.currentUser.ID + '"></sharekey-url>';
            message += '  <p>MyFile-It is free to upload and save your and families personal documents. There is small per user charge for unlimited sharing their personal documents for a year. MyFile-IT App allows you a 90 day trial period to enjoy all the features including sharing. When you pay for an annual share key subscription you will also get a no ad version.</p>';
            message += '<p>You have 0 days left.   MyFile-It is free to upload and save your and families personal documents. There is small per user charge for unlimited sharing their personal documents for a year. MyFile-IT App allows you a 90 day trial period to enjoy all the features including sharing. When you pay for an annual share key subscription you will also get a no ad version.</p>';
            message += '<h3>You have 0 days left.</h3>';

            AlertService.showMessage("Trial expired", message, null);
        };

        $scope.loadThumbsFromList = function (documentIds, success) {
            function onCompleteShareDocuments(data) {
                if (data != null) {
                    //retain any thumbs or images retrieved
                    for (var i = 0; i < data.Documents.length; i++) {
                        for (var j = 0; j < $scope.data.simpleDocuments.length; j++) {
                            if ($scope.data.simpleDocuments[j].ID == data.Documents[i].ID) {
                                $scope.data.simpleDocuments[j].Base64Image = data.Documents[i].Base64Image;
                                $scope.data.simpleDocuments[j].Base64ImageThumb = data.Documents[i].Base64ImageThumb;
                                break;
                            }
                        }
                    }
                }
                if (typeof success == 'function') {
                    success(data);
                }
            }
            function fail() { }

            if (documentIds.length > 0) {
                FileItService.getAppUserDocumentsThumbs(documentIds, onCompleteShareDocuments, fail);
            } else {
                onCompleteShareDocuments(null);
            }
        };

        $scope.setViewDocument = function () {
            var valid = false;
            if ($scope.validateSelectedDocuments()) {
                var obj = {
                    familyUserId: $scope.data.familyUser.ID,
                    selectedImages: $scope.selectedImages(),
                    selectDocumentIds: [],
                    images: Documents.getSimpleListObject()
                };
                ViewDocument.setObject(obj);
                //ViewDocument.searchEvents($scope.data.familyUser.ID, null, '');
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
                    LocalDocuments.setLocalDocuments(appUserId, result, function () { });
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
            $state.go('memberCardSimple');
        };

        $scope.selectShareKey = function (shareKeyId) {
            var appUserId = $scope.data.familyUser.ID;

            function keySuccess() {
                $scope.data.familyUser.ShareKeys = [];
                $scope.data.familyUser.ShareKeys.push({ ID: shareKeyId });

                var message = 'The key you selected has been activated. You may now share documents!';
                var alertPopup = $ionicPopup.alert({
                    title: 'Key has been used successfully.',
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
            $state.go('memberCardSimple');
        };

        /*****************************************/
        $scope.selectedImages = function selectedImages() {
            return $filter('filter')($scope.data.simpleDocuments, { selected: true });
            // return $filter('filter')($scope.data.documents, { selected: true });
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
            if (typeof nv != 'undefined') {
                $scope.selection = nv.map(function (img) {
                    return img.ID;
                });
            }
        }, true);

        $scope.$watch('data.showThumbs', function (nv) {
            if (nv) {
                var documentIds = [];
                var allDocs = $scope.data.simpleDocuments;
                for (var i = 0; i < allDocs.length; i++) {
                    if (allDocs[i].Base64ImageThumb == null) {
                        documentIds.push(allDocs[i].ID);
                    }
                }

                $scope.loadThumbsFromList(documentIds);
            }
        });
        /************************************************/

        $scope.init();
    });

