mainApp
.controller('loginCtrl', function ($scope, FileItService, $ionicPopup, $state, Camera, AppUser, FamilyUsers) {
    $scope.init = function () {
        $scope.data = {};

        //debug
       // $scope.data.username = 'josifchin75@gmail.com';
       // $scope.data.password = 'jopass12';

        //$scope.data.username = 'sandy@synergysportsclub.com'
        //$scope.data.password = 'synergy1';

        //$scope.data.username = 'skbutcher1@yahoo.com';
        //$scope.data.password = 'Sandy12';

        //$scope.data.username = 'Johndoe@gmail.com';
        //$scope.data.password = 'johndoe12'; 

        //$scope.data.username = 'johndemo@gmail.com';
        // $scope.data.password = 'demo12';
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

});