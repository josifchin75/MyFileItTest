angular.module('app.services', [])

.factory('BlankFactory', [function () {

}])

.factory('Camera', ['$q', function ($q) {

    return {
        getPicture: function (options, onSuccess, onFail) {
            var q = $q.defer();

            navigator.camera.getPicture(function (result) {
                // Do any magic you need
                //onSuccess(result);
                q.resolve(result);
            }, function (err) {
                q.reject(err);
            }, options);

            return q.promise;
        }
    }
}])

.service('BlankService', [function () {

}])

.service('AppUser', [function () {
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
        getObject: function () {
            return userDTO;
        },
        setObject: function (obj) {
            userDTO = obj;
        }
    };
}])

.service('FileItService', function ($q, $http) {
    var currentUser;
    var baseUrl = 'http://fileit.cloudapp.net/MyFileItService/MyFileItAppService.svc/rest/';

    return {
        //GetReferenceData(string user, string pass, string referenceTableName)
        getReferenceData: function (referenceTableName, success, fail) {
            var deferred = $q.defer();
            var promise = deferred.promise;
            var url = this.baseUrl() + 'GetReferenceData';

            //string user, string pass, string appUserName, string appUserPass
            $http.post(url, { user: this.adminUser(), pass: this.adminPass(), referenceTableName: referenceTableName })
                .success(function (response) {
                    if (response.Success) {
                        success(response);
                    } else {
                        fail(response);
                    }
                });
            return promise;
        },
        //GetOrganizations(string user, string pass, int? organizationId, string nameLookup)
        getOrganizations: function (organizationId, lookup, successCallback, failCallback) {
            var deferred = $q.defer();
            var promise = deferred.promise;
            var url = this.baseUrl() + 'GetOrganizations';

            $http.post(url, { user: this.adminUser(), pass: this.adminPass(),organizationId: organizationId, nameLookup: lookup })
                .success(function (response) {
                    if (response.Success) {
                        successCallback(response);
                    } else {
                        failCallback(response);
                    }
                });
            return promise;
        },
        updateUser: function (appUser, successCallback, failCallback) {
            var deferred = $q.defer();
            var promise = deferred.promise;
            var url = this.baseUrl() + 'UpdateAppUser';
            //string user, string pass, AppUserDTO appUser
            $http.post(url, { user: this.adminUser(), pass: this.adminPass(), appUser: appUser })
                .success(function (response) {
                    if (response.Success) {
                        this.currentUser = appUser;
                        successCallback(response);
                    } else {
                        failCallback(response);
                    }
                });
            return promise;
        },
        loginUser: function (name, pw, loginCallback, failCallback) {
            var deferred = $q.defer();
            var promise = deferred.promise;
            var url = this.baseUrl() + 'LoginAppUser';

            //string user, string pass, string appUserName, string appUserPass
            $http.post(url, { user: this.adminUser(), pass: this.adminPass(), appUserName: name, appUserPass: pw })
                .success(function (response) {
                    if (response.Success) {
                        currentUser = response.AppUsers[0];
                        loginCallback(response);
                    } else {
                        failCallback(response);
                    }
                });
            return promise;
        },
        forgotPassword: function (email, success, fail) {
            var deferred = $q.defer();
            var promise = deferred.promise;
            var url = this.baseUrl() + 'ForgotPassword';

            //string user, string pass, string appUserName, string appUserPass
            $http.post(url, { user: this.adminUser(), pass: this.adminPass(), emailAddress: email })
                .success(function (response) {
                    if (response.Success) {
                        success(response);
                    } else {
                        fail(response);
                    }
                });
            return promise;
        },
        //AddAppUser(string user, string pass, AppUserDTO appUser)
        addAppUser: function (appUserDTO, success, fail) {
            var deferred = $q.defer();
            var promise = deferred.promise;
            var url = this.baseUrl() + 'AddAppUser';

            $http.post(url, { user: this.adminUser(), pass: this.adminPass(), appUser: appUserDTO })
                .success(function (response) {
                    if (response.Success) {
                        success(response);
                    } else {
                        fail(response);
                    }
                })
                 .error(function (data, status, headers, config) {
                     // this isn't happening:
                     alert(data);
                 });
            return promise;
        },
        //GetInvitationToShareEmailText(string user, string pass)
        getInvitationToShareEmailText: function (success, fail) {
            var deferred = $q.defer();
            var promise = deferred.promise;
            var url = this.baseUrl() + 'GetInvitationToShareEmailText';

            //string user, string pass, string appUserName, string appUserPass
            $http.post(url, { user: this.adminUser(), pass: this.adminPass() })
                .success(function (response) {
                    if (response.Success) {
                        success(response);
                    } else {
                        fail(response);
                    }
                });
            return promise;
        },
        sendInvitationEmail: function (email, message, success, fail) {
            //SendInvitationEmail(string user, string pass, string emailAddress, string message)
            var deferred = $q.defer();
            var promise = deferred.promise;
            var url = this.baseUrl() + 'SendInvitationEmail';

            //string user, string pass, string appUserName, string appUserPass
            $http.post(url, { user: this.adminUser(), pass: this.adminPass(), emailAddress: email, message: message })
                .success(function (response) {
                    if (response.Success) {
                        success(response);
                    } else {
                        fail(response);
                    }
                });
            return promise;
        },
        currentUser: function () {
            return currentUser;
        },
        adminUser: function () { return "admin"; },
        adminPass: function () { return "admin"; },
        baseUrl: function () {
            return baseUrl;
        }

    }
})

//.service('LoginService', function ($q, $http) {
//    var currentUser;

//    return {
//        loginUser: function (name, pw, loginCallback, failCallback) {
//            var deferred = $q.defer();
//            var promise = deferred.promise;
//            var url = 'http://fileit.cloudapp.net/MyFileItService/MyFileItAppService.svc/rest/LoginAppUser';

//            //string user, string pass, string appUserName, string appUserPass
//            $http.post(url, { user: "admin", pass: "admin", appUserName: name, appUserPass: pw })
//                .success(function (response) {
//                    if (response.Success) {
//                        currentUser = response.AppUsers[0];
//                        loginCallback(response);
//                    } else {
//                        failCallback(response);
//                    }
//                });
//            /*
//            if (name == 'user' && pw == 'secret') {
//                deferred.resolve('Welcome ' + name + '!');
//            } else {
//                deferred.reject('Wrong credentials.');
//            }
//            promise.success = function (fn) {
//                promise.then(fn);
//                return promise;
//            }
//            promise.error = function (fn) {
//                promise.then(null, fn);
//                return promise;
//            }*/
//            return promise;
//        },
//        currentUser: function () {
//            return currentUser;
//        }
//    }
//})
;

