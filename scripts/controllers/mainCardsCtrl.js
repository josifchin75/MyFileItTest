mainApp
    .controller('mainCardsCtrl', function ($scope, FileItService, FamilyUser, $state, Documents, FamilyUsers) {
        $scope.init = function () {
            $scope.data = {
                currentUser: FileItService.currentUser(),
                familyUsers: FamilyUsers.getObject()
            };
        };

        //insure that it refreshes!
        $scope.$on('$ionicView.beforeEnter', function () {
            $scope.data.familyUsers = FamilyUsers.getObject();
            currentUser = FileItService.currentUser();
        });

        //occurs when leaving
        $scope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            // var i = 0;
        });

        $scope.reloadRoute = function () {
            //$route.reload();
        };

        $scope.loadFamilyUsers = function () {
            $scope.data.familyUsers = FamilyUsers.getObject();
        };

        $scope.showSex = function (obj, sex) {
            return obj.SEX == sex;
        };

        $scope.selectUser = function (obj) {
            //alert(obj.ID);
            FamilyUser.setObject(obj);
            function onSuccess() {
                $scope.data.currentUser.verifying = false;
                $state.go('memberCard');
            }
            Documents.loadUserDocuments(obj.ID, null, onSuccess);
        };


        $scope.init();
    });