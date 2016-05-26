mainApp
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
});