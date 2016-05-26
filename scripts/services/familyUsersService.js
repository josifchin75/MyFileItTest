mainApp
.service('FamilyUsers', ['FileItService', function (FileItService) {
    var familyUsers = [];

    return {
        loadFamilyUsers: function (primaryAppUserId, onSuccess) {
            var family = this;
            function successGetFamily(data) {
                family.setObject(data.AppUsers);
                if (typeof onSuccess == 'function') {
                    onSuccess(data);
                }
            }

            function failRef() { }

            FileItService.getFamilyUsers(primaryAppUserId, successGetFamily, failRef);
        },
        init: function () {
            familyUsers = [];
        },
        getObject: function () {
            return familyUsers;
        },
        setObject: function (obj) {
            familyUsers = obj;
        }
    };
}]);