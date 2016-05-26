mainApp
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
});