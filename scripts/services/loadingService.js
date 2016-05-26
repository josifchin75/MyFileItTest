mainApp
.service('loadingService', function ($ionicLoading) {
    return {
        show: function () {
            $ionicLoading.show({
                template: '<ion-spinner icon="bubbles"></ion-spinner><div>Loading...</div>'
            });
        },
        hide: function () {
            $ionicLoading.hide();
        }
    }
});