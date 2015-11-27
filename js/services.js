angular.module('app.services', [])

.factory('BlankFactory', [function(){

}])

.service('BlankService', [function(){

}])

.service('UserService',function( $q, $http, LoginService){
    return {
        updateUser: function (appUser, successCallback, failCallback) {
            var deferred = $q.defer();
            var promise = deferred.promise;
            var url = 'http://fileit.cloudapp.net/MyFileItService/MyFileItAppService.svc/rest/UpdateAppUser';
            //string user, string pass, AppUserDTO appUser
            $http.post(url, { user: "admin", pass: "admin", appUser: appUser })
                .success(function (response) {  
                    if (response.Success) {
                        LoginService.currentUser = appUser;
                        successCallback(response);
                    } else {
                        failCallback(response);
                    }
                });
            return promise;
        }
    }
})

.service('LoginService', function ($q, $http) {
    var currentUser;

    return {
        loginUser: function (name, pw, loginCallback, failCallback) {
            var deferred = $q.defer();
            var promise = deferred.promise;
            var url = 'http://fileit.cloudapp.net/MyFileItService/MyFileItAppService.svc/rest/LoginAppUser';

            //string user, string pass, string appUserName, string appUserPass
            $http.post(url, { user: "admin", pass: "admin", appUserName: name, appUserPass: pw })
                .success(function (response) {
                    if (response.Success) {
                        currentUser = response.AppUsers[0];
                        loginCallback(response);
                    } else {
                        failCallback(response);
                    }
                });
            /*
            if (name == 'user' && pw == 'secret') {
                deferred.resolve('Welcome ' + name + '!');
            } else {
                deferred.reject('Wrong credentials.');
            }
            promise.success = function (fn) {
                promise.then(fn);
                return promise;
            }
            promise.error = function (fn) {
                promise.then(null, fn);
                return promise;
            }*/
            return promise;
        },
        currentUser: function () {
            return currentUser;
        }
    }
})
;

