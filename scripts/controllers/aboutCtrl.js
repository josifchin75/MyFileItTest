mainApp
    .controller('aboutCtrl', function ($scope) {
        $scope.init = function () {
            var data = {
                version: "1.0.22"
            };
            $scope.data = data;
        };

        $scope.init();
    });