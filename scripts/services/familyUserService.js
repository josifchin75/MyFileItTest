mainApp
.service('FamilyUser', [function () {
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
        appUserTypes: []
    };

    return {
        init: function () {
            userDTO = {};
        },
        getObject: function () {
            return userDTO;
        },
        setObject: function (obj) {
            userDTO = obj;
        }
    };
}]);