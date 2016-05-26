mainApp
.service('AppUser', ['$window', 'FileItService', function ($window, FileItService) {
    var userDTO = {
        userName: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        primaryAccountHolder: false,
        relationShipTypeId: -1,
        phoneNumber: '',
        sex: '',
        appUserTypeId: -1,
        emailAddress: '',
        organizationSearch: '',
        organizationId: -1,
        organizations: [
              //{ ID: 1, NAME: "org1", radioName: "org" },
              //{ ID: 2, NAME: "org2", radioName: "org" }
        ],
        relationShipTypes: [],
        appUserTypes: [],
        verifying: false
    };

    return {
        init: function () {
            userDTO = {};
        },
        logout: function () {
            this.init();
            userDTO = {}; //really kill it make sure they are logged out
            FileItService.setCurrentUser(null);
        },
        getObject: function () {
            return userDTO;
        },
        setObject: function (obj) {
            userDTO = obj;
        }
    };
}]);