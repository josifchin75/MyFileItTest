mainApp
    .controller('aboutCtrl', function ($scope) {
        $scope.init = function () {
            var data = {
                version: "1.0.8"
            };
            $scope.data = data;
        };

        $scope.init();
    });