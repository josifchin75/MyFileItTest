mainApp
.service('AvailableShareKeys', [function () {
    var availableShareKeys = [];

    return {
        init: function () {
            availableShareKeys = [];
        },
        getObject: function () {
            return availableShareKeys;
        },
        setObject: function (obj) {
            availableShareKeys = obj;
        }
    };
}]);