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
    .directive('sharekeyUrl', function (FileItService) {
        return {
            restrict: 'E',
            scope: {
                userId: '@'
            },
            templateUrl: 'templates/sharekey-url.html',
            link: function (scope, element, attrs) {
                scope.openUrl = function (id) {
                    if (typeof id == 'undefined') {
                        id = FileItService.currentUser().ID;
                    }
                    //alert(shareKeySKU);
                    //alert(JSON.stringify(IAP));
                    //alert(IAP.buy);
                    IAP.buy(shareKeySKU);
                    return;
                    
                    var url = 'https://myfileit.net/Processing/?UId=' + id;
                    window.open(url, '_system', 'location=yes');
                    //window.open('http://my123filit.com/Pages/IFrame.aspx?UId=' + id, '_system', 'location=yes');
                    return false;
                }
            }
        };
    })
    .directive('helpLink', function () {
        return {
            restrict: 'E',
            scope: {
            },
            templateUrl: 'templates/help-link.html',
            link: function (scope, element, attrs) {
                scope.openHelpUrl = function (id) {
                    var url = 'http://myfileithelpcenter.myfileit.com/Help_Center.html';
                    window.open(url, '_system', 'location=yes');
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

