angular.module('app.directives', [])


    .directive('fileitHeader', function () {
        return {
            restrict: 'E',
            scope: {
                fileitTitle: '@',
                hideLogout: '@'
            },
            templateUrl: 'templates/fileit-header.html'
        };
    })
        .directive('fileitLoginHeader', function () {
            return {
                restrict: 'E',
                scope: {
                    fileitTitle: '@',
                    hideLogout: '@'
                },
                templateUrl: 'templates/fileit-login-header.html'
            };
        })

.directive('blankDirective', [function(){

}]);

