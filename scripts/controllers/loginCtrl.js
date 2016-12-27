mainApp
.controller('loginCtrl', function ($scope, FileItService, $ionicPopup, $state, Camera, AppUser, FamilyUsers, AlertService) {
    $scope.init = function () {
        $scope.data = {};

        //debug
        $scope.data.username = 'josifchin75@gmail.com';
        $scope.data.password = 'jopass34';

        $scope.data.username = 'jono@gmail.com'
        $scope.data.password = 'jopass12';

        //$scope.data.username = 'skbutcher1@yahoo.com';
        //$scope.data.password = 'Sandy12';

        //$scope.data.username = 'ben.franklin@myoata.com';
        //$scope.data.password = 'ben.franlklin1234';

        //$scope.data.username = 'James.Dory@myoata.com';
        //$scope.data.password = 'james123';

        //$scope.data.username = 'Johndoe@gmail.com';
        //$scope.data.password = 'johndoe12'; 

        //$scope.data.username = 'johndemo@gmail.com';
        // $scope.data.password = 'demo12';

        //$scope.data.username = 'sbutcher1@gmail.com';
        //$scope.data.password = 'sandy9451';
    }

    $scope.$on('$ionicView.beforeEnter', function () {
        AppUser.logout();
        //if (typeof admob != 'undefined') {
        //    admob.showBanner(admob.BannerSize.BANNER, admob.Position.BOTTOM_APP);
        //} else {
        //    AlertService.showMessage('Admob', 'admob not found');
        //}
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

            function initFamily() {
                FamilyUsers.loadFamilyUsers(primaryAppUserId, onLoadFamily);
            }

            //don't show the ads if they have sharekeys
            if (!user.ShowAds && typeof admob != 'undefined') {
                admob.destroyBannerView();
            }

            //if (user.RemindUserForSignUp) {
            // $scope.RemindUserForShareKeys(user, initFamily);
            //} else {
            initFamily();
            //FamilyUsers.loadFamilyUsers(primaryAppUserId, onLoadFamily);
            //}
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

    $scope.RemindUserForShareKeys = function (user, callback) {
        //show the message
        var message = 'Don\'t forget to purchase a sharekey to share your documents!<sharekey-url user-id="' + user.ID + '"></sharekey-url>';
        AlertService.showMessage("MyFileIT", message, callback);
    };

    $scope.tryAdMob = function () {
        loadAdMob();
    };

    $scope.init();

});