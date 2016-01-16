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
    .directive('sharekeyUrl', function () {
        return {
            restrict: 'E',
            scope: {
                userId: '@'
            },
            templateUrl: 'templates/sharekey-url.html',
            link: function (scope, element, attrs) {
                scope.openUrl = function (id) {
                    window.open('http://my123filit.com/Pages/IFrame.aspx?UId=' + id, '_system', 'location=yes');
                    return false;
                }
            }
        };
    })
    /*This directive can be used for when ng-repeat ends - see associate images*/
    .directive('repeatDone', function () {
        return function (scope, element, attrs) {
            if (scope.$last) { // all are rendered
                scope.$eval(attrs.repeatDone);
            }
        }
    })
.directive('blankDirective', [function(){

}]);

