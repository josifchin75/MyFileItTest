mainApp
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
});