mainApp
.service('AlertService', function ($ionicPopup) {
    return {
        init: function () {
        },
        showMessage: function (title, message, callback) {
            var alertPopup = $ionicPopup.alert({
                title: title,
                template: message
            });
            alertPopup.then(function (res) {
                if (typeof callback == 'function') {
                    callback(res);
                }
            });
        }
    };
});