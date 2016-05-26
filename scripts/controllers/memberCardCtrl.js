mainApp
    .controller('memberCardCtrl', function ($scope, FileItService, FamilyUser, $state, Documents, ScanDocument, $ionicModal, ViewDocument, $filter, $ionicPopup, AvailableShareKeys, LocalDocuments) {
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
            $scope.data.currentUser = FileItService.currentUser();
            myScroll = new iScroll('wrapper',
                { zoom: true, zoomMax: 6 });
        });

        $scope.showSex = function (obj, sex) {
            return obj.SEX == sex;
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
            $state.go('memberCard');
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
            if (typeof nv != 'undefined') {
                $scope.selection = nv.map(function (img) {
                    return img.ID;
                });
            }
        }, true);
        /************************************************/

        $scope.init();
    });