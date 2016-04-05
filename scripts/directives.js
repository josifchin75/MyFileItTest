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
                    var promoCode = '';
                    var last4Digits = '';
                    var amount = 5.99;
                    var salesRepId = 1;
                    var numKeys = 1;
                    //alert(shareKeySKU);
                    //alert(JSON.stringify(IAP));
                    //alert(IAP.buy);

                    function addShareSuccess() {
                        alert('Your share key has been added to MyFileIT!');
                    }

                    function addShareFail(message) {
                        alert('Failed to add share key. Please contact MyFileIT support.');
                        //alert(message);
                    }

                    if (app.platform() == 'iOS') {
                        function shareKeySuccess(productId) {
                            FileItService.addShareKey(id, new Date(), promoCode, last4Digits, amount, salesRepId, numKeys, addShareSuccess, addShareFail);
                        };
                        IAP.purchaseCallback = shareKeySuccess; //send a callback to be removed after purchase
                        //shareKeySuccess();
                        IAP.buy(shareKeySKU);
                    } else {
                        var url = 'https://myfileit.net/Processing/?UId=' + id;
                        window.open(url, '_system', 'location=yes');
                        //window.open('http://my123filit.com/Pages/IFrame.aspx?UId=' + id, '_system', 'location=yes');
                    }
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

