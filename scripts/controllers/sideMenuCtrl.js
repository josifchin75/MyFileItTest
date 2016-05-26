mainApp
.controller('sideMenuCtrl', function ($scope, $rootScope, FileItService) {
    $scope = $rootScope;
    $scope.init = function () {
        var user = FileItService.currentUser();
        $scope.UserId = (typeof user != 'undefined' && user != null) ? user.ID : null;
    }

    $scope.$on('$ionicView.beforeEnter', function () {
        $scope.init();
    });

    $scope.loggedIn = function () {
        var user = FileItService.currentUser();
        var result = false;
        result = typeof user != 'undefined' && user != null;

        return result;
    };

    $scope.isCoach = function () {
        var user = FileItService.currentUser();
        var result = false;
        var isCoach = typeof user != 'undefined' && user != null && user.IsCoach;
        result = typeof user != 'undefined' && isCoach;

        return result;
    };

    //$scope.init();
});