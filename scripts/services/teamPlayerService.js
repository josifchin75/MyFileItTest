mainApp
.service('TeamPlayer', [function () {
    var data = {
        organization: null,
        organizations: [],
        organizationSearch: '',
        teamEvent: null,
        teamEvents: [],
        teamEventSearch: '',
        players: [],
        uploadPlayers: [],
        newPlayer: {
            firstName: '',
            lastName: '',
            sex: '',
            emailAddress: ''
        },
        firstNameSearch: '',
        lastNameSearch: '',
        emailSearch: '',
        sex: '',
        searchedMembers: []
    };

    return {
        clear: function () {
            data.organization = null;
            data.teamEvent = null;
            data.organizationSearch = '';
            data.teamEventSearch = '';
        },
        getObject: function () {
            return data;
        },
        setObject: function (obj) {
            data = obj;
        }
    };
}]);