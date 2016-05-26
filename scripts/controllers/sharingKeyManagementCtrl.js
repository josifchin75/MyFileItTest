mainApp
.controller('sharingKeyManagementCtrl', function ($scope, FileItService, $ionicPopup, $state) {
    $scope.init = function () {
        $scope.data = {
            currentUser: FileItService.currentUser(),
            promocode: '',
            shareKeys: [],
            familyUsers: [],
            availableFamilyUsers: [],
            currentShareKeyId: -1,
            shareKeyAppUserId: -1,
            selectedUserId: -1
        };

        function successGetFamily(data) {
            for (var i = 0; i < data.AppUsers.length; i++) {
                data.AppUsers[i].show = data.AppUsers[i].ShareKeys.length > 0;
                $scope.data.familyUsers.push(data.AppUsers[i]);
            }

            $scope.searchKeys();
        }

        function onGetError() { }

        var user = $scope.data.currentUser;
        var primaryAppUserId = user.PRIMARYAPPUSERID == null ? user.ID : user.PRIMARYAPPUSERID;
        FileItService.getFamilyUsers(primaryAppUserId, successGetFamily, onGetError);
    };

    $scope.searchKeys = function () {
        function onGetKeys(data) {
            $scope.data.shareKeys = data.ShareKeys;
        }

        function onGetError() { }

        FileItService.getAvailableShareKeysByPromoCodeAndPrimaryUser($scope.data.currentUser.ID, $scope.data.promocode, onGetKeys, onGetError);
    };

    $scope.selectShareKeyUser = function (id) {
        $scope.data.currentShareKeyId = id;
        $scope.data.shareKeyAppUserId = -1;
        $scope.createAvailableFamilyMembers();

        var title = 'Select a Family Member';
        var alertPopup = $ionicPopup.show({
            title: title,
            templateUrl: 'templates/selectUser.html',
            cssClass: 'document-slider',
            scope: $scope,
            buttons: [
                 {
                     text: 'Cancel',
                     onTap: function (e) {
                         $scope.data.shareKeyAppUserId = -1;
                         return $scope.data.shareKeyAppUserId;
                     }
                 },
                 {
                     text: '<b>Associate</b>',
                     type: 'button-positive',
                     onTap: function (e) {
                         return $scope.data.shareKeyAppUserId;
                     }
                 }]
        });
        alertPopup.then(function () {
            var userId = $scope.data.shareKeyAppUserId;
            if (userId > -1) {
                //find the correct sharekey and set the appuserid to value, set associate = true
                var k = $scope.getShareKey($scope.data.currentShareKeyId);
                var f = $scope.getFamilyMember(userId);
                k.APPUSERID = userId;
                k.associate = true;
                k.AppUserName = f.FIRSTNAME + ' ' + f.LASTNAME;
            }
            return;
        });
    };
    $scope.updateShareKeys = function () {
        //get all keys set as associated = true
        var keysToPost = [];
        var keys = $scope.data.shareKeys;
        for (var i = 0; i < keys.length; i++) {
            if (keys[i].associate) {
                keysToPost.push(keys[i]);
            }
        }

        if (keysToPost.length > 0) {
            function postSuccess() {
                var message = 'Your keys have been matched to your family members.';

                var alertPopup = $ionicPopup.alert({
                    title: 'Success',
                    template: message
                });
                alertPopup.then(function () {
                    $scope.init();
                });
            }

            //post them to service recursively
            function postKeys(keys) {
                if (keys.length > 0) {
                    var k = keys.pop();
                    FileItService.associateShareKeyToUser(
                        k.APPUSERID,
                        k.ID,
                        function () { postKeys(keysToPost); });
                } else {
                    postSuccess();
                }
            }
            postKeys(keysToPost);
        } else {
            var title = 'No Selections';
            var message = 'Please associate some members to your keys.';
            var alertPopup = $ionicPopup.alert({
                title: title,
                template: message
            });

        }

    };
    $scope.getShareKey = function (id) {
        var result = {};

        var keys = $scope.data.shareKeys;
        for (var i = 0; i < keys.length; i++) {
            if (keys[i].ID == id) {
                result = keys[i];
                break;
            }
        }

        return result;
    };
    $scope.getFamilyMember = function (id) {
        var result = null;

        var users = $scope.data.familyUsers;
        for (var i = 0; i < users.length; i++) {
            if (users[i].ID == id) {
                result = users[i];
                break;
            }
        }

        return result;
    };

    $scope.createAvailableFamilyMembers = function () {
        var users = $scope.data.familyUsers;
        var keys = $scope.data.shareKeys;
        var availableUsers = [];

        function findUser(id) {
            var result = false;
            for (var j = 0; j < keys.length; j++) {
                if (keys[j].APPUSERID == id) {
                    result = true;
                    break;
                }
            }
            return result;
        }

        for (var i = 0; i < users.length; i++) {
            if (!findUser(users[i].ID)) {
                availableUsers.push(users[i]);
            }
        }

        $scope.data.availableFamilyUsers = availableUsers;
    };

    $scope.init();
});