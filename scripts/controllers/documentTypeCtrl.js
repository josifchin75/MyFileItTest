mainApp
    .controller('documentTypeCtrl', function ($scope, FileItService, AlertService) {
        $scope.init = function () {
            var data = {
                newDocumentType: "",
                currentUser: FileItService.currentUser()
            };
            $scope.data = data;
            $scope.loadDocumentTypes();
        };

        $scope.$on('$ionicView.beforeEnter', function () {
            $scope.init();
        });

        $scope.loadDocumentTypes = function () {
            var successRef = function (data) {
                $scope.data.documentTypes = [];
                for (var i = 0; i < data.DocumentTypes.length; i++) {
                    if (data.DocumentTypes[i].APPUSERID != null) {
                        $scope.data.documentTypes.push(data.DocumentTypes[i]);
                    }
                }
            };

            var failRef = function () { };

            FileItService.getDocumentTypes(currentUser.ID, successRef, failRef);
        };

        $scope.addDocumentType = function () {
            if ($scope.validAddDocument()) {
                function successCallback() {
                    function messageCallback() {
                        $scope.data.newDocumentType = "";
                        $scope.loadDocumentTypes();
                    }

                    AlertService.showMessage("Success", $scope.data.newDocumentType + " has been added.", messageCallback);
                }

                function failCallback() { }

                FileItService.addDocumentType($scope.data.currentUser.ID, $scope.data.newDocumentType, successCallback, failCallback)
            }
        };

        $scope.validAddDocument = function () {
            var result = true;
            var message = '';

            if (typeof $scope.data.newDocumentType == 'undefined' || $scope.data.newDocumentType == null || $scope.data.newDocumentType.length == 0) {
                message += 'Please enter a new document type.';
                result = false;
            }

            if (!result) {
                AlertService.showMessage("Incomplete", message, null);
            }

            return result;
        };

        $scope.init();
    });