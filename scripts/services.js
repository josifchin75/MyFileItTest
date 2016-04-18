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

    .service('StateHelper', [function () {
        return {
            refresh: function (state) {
                state.go(state.current.name);
            }
        };
    }])



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
}])

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
    }])

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
         }])

    .service('LocalDocuments', function () {
        // var localDocuments = window.localStorage.getItem('localDocuments');
        documentFileName = 'MyFileItDocuments.txt';

        return {
            getLocalDocuments: function (appUserId, callback) {

                //function fileIsRead(result) {
                //    //var result = null;
                //    alert(result);
                //    if (typeof result != 'undefined' && result != null && result != '') {
                //        result = eval('(' + result + ')');
                //    } else {
                //        result = [];
                //    }
                //    callback(result);
                //}
                //fileHelper.readFile(appUserId + "_" + documentFileName, fileIsRead);

                function dataIsRead(tx, rows) {
                    var result = [];
                    if (rows.length > 0) {
                        result = eval('(' + rows[0].Documents + ')');
                    }
                    callback(result);
                }

                var sql = 'Select Documents from MyFileItDocument where AppUserId = ?';
                var pars = [appUserId];
                //dbHelper.executeSql(sql, pars, dataIsRead);

                //this has no data calls
                callback([]);

                //var result = window.localStorage.getItem('localDocuments');
                //if (typeof result != 'undefined' && result != null && result != '') {
                //    result = eval('(' + result + ')');
                //} else {
                //    result = [];
                //}
                //return result;
            },
            setLocalDocuments: function (appUserId, obj, callback) {
                //var fileName = appUserId + "_" + documentFileName;

                //function fileWritten() {
                //    if (typeof callback == 'function') {
                //        callback();
                //    }
                //}
                var sql = "INSERT OR REPLACE INTO MyFileItDocument (AppUserId,Documents) VALUES (?,?)";
                var pars = [appUserId, JSON.stringify(obj)];
                dbHelper.executeSql(sql, pars, callback);
                //fileHelper.writeFile(fileName, JSON.stringify(obj), true, fileWritten);
                //window.localStorage.setItem('localDocuments', JSON.stringify(obj));
            },
            getLocalDocumentsIdList: function (appUserId, callback) {
                function gotDocs(docs) {
                    var result = [];
                    if (docs.length > 0) {
                        for (var i = 0; i < docs.length; i++) {
                            result.push(docs[i].ID);
                        }
                    }
                    callback(result);
                }

                this.getLocalDocuments(appUserId, gotDocs);
            }
        };
    })

        .service('Documents', ['FileItService', function (FileItService) {
            var docs = [];

            return {
                loadUserDocuments: function (appUserId, teamEventId, onSuccess) {
                    var viewDoc = this;
                    function successGetAll(data) {
                        docs = data.Documents;
                        if (typeof onSuccess == 'function') {
                            onSuccess();
                        }
                    }

                    function errorGetAll(data) {
                    }
                    //var teamEventId = null;
                    FileItService.getAppUserDocuments(appUserId, teamEventId, successGetAll, errorGetAll);
                },
                init: function () {
                    docs = [];
                },
                getObject: function () {
                    return docs;
                },
                setObject: function (obj) {
                    docs = obj;
                }
            };
        }])

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
        }])

 .service('ScanDocument', [function () {
     var documentDTO = {
         currentImage: null,
         currentImageSrc: 'no image',
         organizationSearch: '',
         organizations: [],
         organizationId: -1,
         documentTypes: [],
         documentTypeId: -1,
         familyUsers: [],
         familyUserId: -1,
         filename: '',
         familyUserName: '',
         cabinetId: '',
         documentTypeName: '',
         confirmed: false
     };

     return {
         getObject: function () {
             return documentDTO;
         },
         setObject: function (obj) {
             documentDTO = obj;
         }
     };
 }])

.service('ViewDocument', ['FileItService', function (FileItService) {
    var documentDTO = {
        searchImages: [],

        familyUsers: [],
        familyUserId: -1,
        searchString: '',
        userIdFilterType: '',
        images: [],
        thumbs: [],
        selectedDocumentIds: [],
        organizationId: -1,
        organizationSearch: '',
        eventId: -1,
        eventSearch: '',
        events: [],
        eventDocumentId: -1,
        comment: [],
        eventDocuments: []
        // selectedImages: []
        //need to retain associations?
    };

    return {
        getObject: function () {
            return documentDTO;
        },
        setObject: function (obj) {
            documentDTO = obj;
        },
        loadDocuments: function (currentUser, onSuccess) {
            var viewDoc = this;
            function successGetAll(data) {
                //data:image/png;base64,
                documentDTO.images = data.Documents;
                viewDoc.searchDocuments();
                if (typeof onSuccess == 'function') {
                    onSuccess();
                }
            }

            function errorGetAll(data) {
            }

            if (documentDTO.images == undefined || documentDTO.images.length == 0) {
                var id = currentUser.PRIMARYAPPUSERID != null ? currentUser.PRIMARYAPPUSERID : currentUser.ID;
                FileItService.getFamilyDocuments(id, successGetAll, errorGetAll);
            } else {
                onSuccess();
            }
        },
        loadUserDocuments: function (appUserId, onSuccess) {
            var viewDoc = this;
            function successGetAll(data) {
                //data:image/png;base64,
                documentDTO.images = data.Documents;
                viewDoc.searchDocuments();
                if (typeof onSuccess == 'function') {
                    onSuccess();
                }
            }

            function errorGetAll(data) {
            }
            var teamEventId = null;
            FileItService.getAppUserDocuments(appUserId, teamEventId, successGetAll, errorGetAll);
        },
        searchDocuments: function () {
            //filter the docs if necessary
            var search = documentDTO.searchString;
            var patt = new RegExp(search.toLowerCase());

            var foundImages = [];
            for (var i = 0; i < documentDTO.images.length; i++) {
                var img = documentDTO.images[i];
                if (search.length > 0) {
                    if (patt.test(img.COMMENT.toLowerCase()) || patt.test(img.DocumentTypeName.toLowerCase())) {
                        foundImages.push(img);
                    }
                } else {
                    foundImages.push(img);
                }
            }
            documentDTO.searchImages = foundImages;//$scope.data.images;
        },
        clearEvents: function () {
            documentDTO.events = [];
        },
        searchEvents: function (appUserId, organizationId, eventSearch, onSuccess) {
            function successSearch(data) {
                documentDTO.events = data.TeamEvents;
                for (var i = 0; i < documentDTO.events.length; i++) {
                    documentDTO.events[i].show = false;
                }
                if (typeof onSuccess == 'function') {
                    onSuccess();
                }
            }

            function failSearch(data) {
                documentDTO.events = [];
            }
            //appUserId, organizationId, teamEventId, searchName,
            FileItService.getTeamEventsByAppUser(appUserId, organizationId, null, null, successSearch, failSearch)
        },
        init: function () {
            documentDTO = {};
        }
    };
}])

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
     }])

.service('EmailHelper', function () {
    return {
        validEmail: function (emailAddress) {
            if (emailAddress == 'jo') { return true; }
            var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(emailAddress);
        }
    };
})

.service('PasswordHelper', function () {
    return {
        validPassword: function (password) {
            //password is 4-15 chars and contain at least one digit
            var re = /^(?=.*\d).{4,15}$/;
            return re.test(password);
        },
        getPasswordFormatError: function () {
            return 'Password must be 4 to 15 characters and contain a numeric digit.';
        }
    };
})

.service('DateHelper', function () {
    return {
        serializeDate: function (val) {
            var d = moment(val);
            var utc = d.utc();
            var result = '\/Date(' + utc + ')\/';
            return result;
        },
        displayDate: function (val) {
            val = 'new ' + val.replace(/\//g, '');
            return moment(eval(val)).format('MMM DD, YYYY');
        }
    };
})

.service('FileItService', function ($q, $http, loadingService, LocalDocuments) {
    var currentUser;
    //var baseUrl = 'http://fileit.cloudapp.net/MyFileItService/MyFileItAppService.svc/rest/';
    //var baseUrl = 'http://myfileit.net/MyFileItService/MyFileItAppService.svc/rest/';
    var baseUrl = 'https://myfileit.net/MyFileItService/MyFileItAppService.svc/rest/';
    var referenceLists = {};
    //baseUrl = 'http://localhost:37533/MyFileItAppService.svc/rest';
    return {
        basePost: function (routeUrl, obj, successCallback, failCallback) {
            var deferred = $q.defer();
            var promise = deferred.promise;
            var url = this.baseUrl() + routeUrl;

            loadingService.show();
            $http.post(url, obj)
                .success(function (response) {
                    loadingService.hide();
                    if (response.Success != undefined) {
                        if (response.Success) {
                            successCallback(response);
                        } else {
                            failCallback(response);
                        }
                    } else {
                        successCallback(response);
                    }
                })
                .error(function (response) {
                    alert(response);
                    loadingService.hide();
                });
            return promise;
        },
        //GetReferenceData(string user, string pass, string referenceTableName)
        getReferenceData: function (referenceTableName, success, fail) {
            var routeUrl = 'GetReferenceData';
            var data = {
                user: this.adminUser(),
                pass: this.adminPass(),
                referenceTableName: referenceTableName
            };
            //speed up the reference data lookups
            var refLists = this.referenceLists();
            if (refLists[referenceTableName]) {
                var data = {};
                data.KeyValueData = refLists[referenceTableName];
                if (typeof success == 'function') {
                    return success(data);
                }
            } else {
                function keepRefData(data) {
                    refLists[referenceTableName] = data.KeyValueData;
                    if (typeof success == 'function') {
                        return success(data);
                    }
                }
                return this.basePost(routeUrl, data, keepRefData, fail);
            }
        },
        //GetOrganizations(string user, string pass, int? organizationId, string nameLookup)
        getOrganizations: function (organizationId, lookup, successCallback, failCallback) {
            var routeUrl = 'GetOrganizations';
            var data = {
                user: this.adminUser(),
                pass: this.adminPass(),
                organizationId: organizationId,
                nameLookup: lookup
            };

            return this.basePost(routeUrl, data, successCallback, failCallback);
        },
        checkUserExists: function (appUserName, successCallback, failCallback) {
            //CheckAppUserExists(string user, string pass, string appUserName)
            var routeUrl = 'CheckAppUserExists';
            var data = {
                user: this.adminUser(),
                pass: this.adminPass(),
                appUserName: appUserName
            };
            //this is a weird scenario
            function callback(val) {
                if (!val) {
                    successCallback();
                } else {
                    failCallback();
                }
            }

            return this.basePost(routeUrl, data, callback, failCallback);
        },
        updateUser: function (appUser, successCallback, failCallback) {
            var routeUrl = 'UpdateAppUser';
            var data = {
                user: this.adminUser(),
                pass: this.adminPass(),
                appUser: appUser
            };

            return this.basePost(routeUrl, data, successCallback, failCallback);
        },
        loginUser: function (name, pw, loginCallback, failCallback) {
            var routeUrl = 'LoginAppUser';
            var data = {
                user: this.adminUser(),
                pass: this.adminPass(),
                appUserName: name,
                appUserPass: pw
            };

            return this.basePost(routeUrl, data, loginCallback, failCallback);
        },
        forgotPassword: function (email, success, fail) {
            var routeUrl = 'ForgotPassword';
            var data = {
                user: this.adminUser(),
                pass: this.adminPass(),
                emailAddress: email
            };

            return this.basePost(routeUrl, data, success, fail);
        },
        //AddAppUser(string user, string pass, AppUserDTO appUser)
        addAppUser: function (appUserDTO, success, fail) {
            var routeUrl = 'AddAppUser';
            var data = {
                user: this.adminUser(),
                pass: this.adminPass(),
                appUser: appUserDTO
            };

            return this.basePost(routeUrl, data, success, fail);
        },
        getFamilyUsers: function (primaryAppUserId, success, fail) {
            var routeUrl = 'GetFamilyUsers';
            var data = {
                user: this.adminUser(),
                pass: this.adminPass(),
                primaryAppUserId: primaryAppUserId
            };

            return this.basePost(routeUrl, data, success, fail);
        },
        //GetAppUsers(string user, string pass, int? appUserId, string nameLookup)
        getAppUsers: function (appUserId, nameLookup, success, fail) {
            var routeUrl = 'GetAppUsers';
            var data = {
                user: this.adminUser(),
                pass: this.adminPass(),
                appUserId: appUserId,
                nameLookup: nameLookup
            };

            return this.basePost(routeUrl, data, success, fail);
        },
        //GetAppUsersByNameSexEmail(string user, string pass, int appUserId, string firstName, string lastName, string parentEmailAddress, string sex
        getAppUsersByNameSexEmail: function (appUserId, teamEventId, firstName, lastName, parentEmailAddress, sex, success, fail) {
            var routeUrl = 'GetAppUsersByNameSexEmail';
            var data = {
                user: this.adminUser(),
                pass: this.adminPass(),
                appUserId: appUserId,
                teamEventId: teamEventId,
                firstName: firstName,
                lastName: lastName,
                parentEmailAddress: parentEmailAddress,
                sex: sex
            };

            return this.basePost(routeUrl, data, success, fail);
        },
        //GetCoachMembers(string user, string pass, int appUserId, int? organizationId, int? teamEventId, string nameLookup, string parentEmailAddress)
        getCoachMembers: function (appUserId, organizationId, teamEventId, nameLookup, parentEmailAddress, success, fail) {
            var routeUrl = 'GetCoachMembers';
            var data = {
                user: this.adminUser(),
                pass: this.adminPass(),
                appUserId: appUserId,
                organizationId: organizationId,
                teamEventId: teamEventId,
                nameLookup: nameLookup,
                parentEmailAddress: parentEmailAddress
            };

            return this.basePost(routeUrl, data, success, fail);
        },

        getAppUserDocuments: function (appUserId, teamEventId, success, fail) {
            var routeUrl = 'GetAppUserDocuments';
            var serviceUser = this.adminUser();
            var servicePass = this.adminPass();
            var svc = this;
            var downloadedDocsVar;

            function mainAppGet(downloadedDocumentIds) {
                var data = {
                    user: serviceUser,
                    pass: servicePass,
                    appUserId: appUserId,
                    teamEventId: teamEventId,
                    downloadedDocumentIds: downloadedDocumentIds
                };

                function retainDocuments(data) {
                    //keep any documents not found already 
                    //also add the existing ones to the response
                    //data.Documents
                    //var downloadedDocs = LocalDocuments.getLocalDocuments();
                    loadingService.show();
                    function processRetained(downloadedDocs) {
                        for (var i = 0; i < data.Documents.length; i++) {
                            downloadedDocs.push(data.Documents[i]);
                        }
                        downloadedDocsVar = downloadedDocs;
                        LocalDocuments.setLocalDocuments(appUserId, downloadedDocs, postSaveDocs);
                    }

                    function postSaveDocs() {
                        if (typeof success == 'function') {
                            var response = {
                                Documents: downloadedDocsVar
                            };

                            success(response);
                        }
                        loadingService.hide();
                    }

                    LocalDocuments.getLocalDocuments(appUserId, processRetained);
                }

                return svc.basePost(routeUrl, data, retainDocuments, fail);
            }

            LocalDocuments.getLocalDocumentsIdList(appUserId, mainAppGet);
        },
        //DeleteAppUserDocument(string user, string pass, int appUserId, string documentId)
        deleteAppUserDocument: function (appUserId, documentId, success, fail) {
            var routeUrl = 'DeleteAppUserDocument';
            var data = {
                user: this.adminUser(),
                pass: this.adminPass(),
                appUserId: appUserId,
                documentId: documentId
            };

            return this.basePost(routeUrl, data, success, fail);
        },
        //VerifyDocument(string user, string pass, int documentId, int verifyAppUserId)
        verifyDocument: function (documentId, verifyAppUserId, teamEventDocumentId, success, fail) {
            var routeUrl = 'VerifyDocument';
            var data = {
                user: this.adminUser(),
                pass: this.adminPass(),
                documentId: documentId,
                verifyAppUserId: verifyAppUserId,
                teamEventDocumentId: teamEventDocumentId
            };

            return this.basePost(routeUrl, data, success, fail);
        },
        getFamilyDocuments: function (appUserId, success, fail) {
            var routeUrl = 'GetFamilyDocuments';
            var data = {
                user: this.adminUser(),
                pass: this.adminPass(),
                primaryAppUserId: appUserId
            };

            return this.basePost(routeUrl, data, success, fail);
        },
        uploadFileCabinetDocument: function (appUserId, fileName, base64Image, documentObject, success, fail) {
            var routeUrl = 'UploadFileCabinetDocument';
            var data = {
                user: this.adminUser(),
                pass: this.adminPass(),
                appUserId: appUserId,
                filename: fileName,
                base64Image: base64Image,
                doc: documentObject
            };

            return this.basePost(routeUrl, data, success, fail);
            /*
            var deferred = $q.defer();
            var promise = deferred.promise;
            var url = this.baseUrl() + 'UploadFileCabinetDocument';

            //UploadFileCabinetDocument(string user, string pass, int organizationId, string filename, string base64Image, FileCabinetDocumentDTO doc)
            $http.post(url, { user: this.adminUser(), pass: this.adminPass(), organizationId: organizationId, filename: fileName, base64Image: base64Image, doc: documentObject })
                .success(function (response) {
                    if (response.Success) {
                        success(response);
                    } else {
                        fail(response);
                    }
                })
                 .error(this.serviceFailCallback);
            return promise;*/
        },
        //GetInvitationToShareEmailText(string user, string pass)
        getInvitationToShareEmailText: function (success, fail) {
            var routeUrl = 'GetInvitationToShareEmailText';
            var data = {
                user: this.adminUser(),
                pass: this.adminPass()
            };

            return this.basePost(routeUrl, data, success, fail);
        },
        sendInvitationEmail: function (email, message, success, fail) {
            var routeUrl = 'SendInvitationEmail';
            var data = {
                user: this.adminUser(),
                pass: this.adminPass(),
                emailAddress: email,
                message: message
            };

            return this.basePost(routeUrl, data, success, fail);
        },
        //GetTeamEventsByAppUser(string user, string pass, int appUserId, int? organizationId, int? teamEventId, string name)
        getTeamEventsByAppUser: function (appUserId, organizationId, teamEventId, searchName, success, fail) {
            var routeUrl = 'GetTeamEventsByAppUser';
            var data = {
                user: this.adminUser(),
                pass: this.adminPass(),
                appUserId: appUserId,
                organizationId: organizationId,
                teamEventId: teamEventId,
                name: searchName
            };

            return this.basePost(routeUrl, data, success, fail);
        },

        //GetTeamEventsByCoach(string user, string pass, int appUserId, string name
        getTeamEventsByCoach: function (appUserId, searchName, success, fail) {
            var routeUrl = 'GetTeamEventsByCoach';
            var data = {
                user: this.adminUser(),
                pass: this.adminPass(),
                appUserId: appUserId,
                name: searchName
            };

            return this.basePost(routeUrl, data, success, fail);
        },
        //GetAppUserTeamEventDocumentsByTeamEvent(string user, string pass, int appUserId, int teamEventId)
        getAppUserTeamEventDocumentsByTeamEvent: function (appUserId, teamEventId, success, fail) {
            var routeUrl = 'GetAppUserTeamEventDocumentsByTeamEvent';
            var data = {
                user: this.adminUser(),
                pass: this.adminPass(),
                appUserId: appUserId,
                teamEventId: teamEventId
            };

            return this.basePost(routeUrl, data, success, fail);
        },
        //AssociateAppUserToOrganization(string user, string pass, int appUserId, int appUserTypeId, int organizationId, DateTime startDate, DateTime expiresDate, int? yearCode, int sportTypeId)
        associateAppUserToOrganization: function (appUserId, appUserTypeId, organizationId, startDate, expiresDate, yearCode, sportTypeId, success, fail) {
            var routeUrl = 'AssociateAppUserToOrganization';
            var data = {
                user: this.adminUser(),
                pass: this.adminPass(),
                appUserId: appUserId,
                appUserTypeId: appUserTypeId,
                organizationId: organizationId,
                startDate: startDate,
                expiresDate: expiresDate,
                yearCode: yearCode,
                sportTypeId: sportTypeId
            };

            return this.basePost(routeUrl, data, success, fail);
        },
        //AssociateDocumentsToTeamEventDocuments(string user, string pass, List<AssociateDocumentDTO> associations)
        associateDocumentsToTeamEventDocuments: function (associations, success, fail) {
            var routeUrl = 'AssociateDocumentsToTeamEventDocuments';
            var data = {
                user: this.adminUser(),
                pass: this.adminPass(),
                associations: associations
            };

            return this.basePost(routeUrl, data, success, fail);
        },
        //ResendAssociatedDocuments(string user, string pass, int appUserId, int teamEventId)
        resendAssociatedDocuments: function (appUserId, teamEventId, success, fail) {
            var routeUrl = 'ResendAssociatedDocuments';
            var data = {
                user: this.adminUser(),
                pass: this.adminPass(),
                appUserId: appUserId,
                teamEventId: teamEventId
            };

            return this.basePost(routeUrl, data, success, fail);
        },
        //RejectTeamEventDocumentShare(string user, string pass, int shareId)
        rejectTeamEventDocumentShare: function (appUserId, teamEventDocumentId, success, fail) {
            var routeUrl = 'RejectTeamEventDocumentShare';
            var data = {
                user: this.adminUser(),
                pass: this.adminPass(),
                appUserId: appUserId,
                teamEventDocumentId: teamEventDocumentId
            };

            return this.basePost(routeUrl, data, success, fail);
        },
        // GetAvailableShareKeysByPromoCodeAndPrimaryUser(string user, string pass, int primaryAppUserId, string promocode)
        getAvailableShareKeysByPromoCodeAndPrimaryUser: function (primaryAppUserId, promocode, success, fail) {
            var routeUrl = 'GetAvailableShareKeysByPromoCodeAndPrimaryUser';
            var data = {
                user: this.adminUser(),
                pass: this.adminPass(),
                primaryAppUserId: primaryAppUserId,
                promocode: promocode
            };

            return this.basePost(routeUrl, data, success, fail);
        },
        // AssociateShareKeyToUser(string user, string pass, int appUserId, int shareKeyId)
        associateShareKeyToUser: function (appUserId, shareKeyId, success, fail) {
            var routeUrl = 'AssociateShareKeyToUser';
            var data = {
                user: this.adminUser(),
                pass: this.adminPass(),
                appUserId: appUserId,
                shareKeyId: shareKeyId
            };

            return this.basePost(routeUrl, data, success, fail);
        },
        //MyFileItResult AddShareKey(string user, string pass, int primaryAppUserId, DateTime purchaseDate, string promoCode, string last4Digits, decimal amount, int salesRepId, int numKeys)
        addShareKey: function (appUserId, purchaseDate, promoCode, last4Digits, amount, salesRepId, numKeys, success, fail) {
            var routeUrl = 'AddShareKey';
            var date = '\/Date(' + (new Date().getTime()) + ')\/';
            var data = {
                user: this.adminUser(),
                pass: this.adminPass(),
                primaryAppUserId: appUserId,
                purchaseDate: date,
                promoCode: promoCode,
                last4Digits: last4Digits,
                amount: amount,
                salesRepId: salesRepId,
                numKeys: numKeys
            };

            return this.basePost(routeUrl, data, success, fail);
        },
        //GetTeamEventPlayerRosters(string user, string pass, int? teamEventPlayerRosterId, int? teamEventId)
        getTeamEventPlayerRosters: function (rosterId, teamEventId, success, fail) {
            var routeUrl = 'GetTeamEventPlayerRosters';
            var data = {
                user: this.adminUser(),
                pass: this.adminPass(),
                teamEventPlayerRosterId: rosterId,
                teamEventId: teamEventId
            };

            return this.basePost(routeUrl, data, success, fail);
        },
        //MyFileItResult GetTeamEventPlayersWithUploads(string user, string pass, int teamEventId)
        getTeamEventPlayersWithUploads: function (teamEventId, success, fail) {
            var routeUrl = 'GetTeamEventPlayersWithUploads';
            var data = {
                user: this.adminUser(),
                pass: this.adminPass(),
                teamEventId: teamEventId
            };

            return this.basePost(routeUrl, data, success, fail);
        },
        //AddTeamEventPlayerRoster(string user, string pass, TeamEventPlayerRosterDTO teamEventPlayerRoster)
        addTeamEventPlayerRoster: function (teamEventPlayerRoster, success, fail) {
            var routeUrl = 'AddTeamEventPlayerRoster';
            var data = {
                user: this.adminUser(),
                pass: this.adminPass(),
                teamEventPlayerRoster: teamEventPlayerRoster
            };

            return this.basePost(routeUrl, data, success, fail);
        },
        //RemoveTeamEventPlayerRoster(string user, string pass, int teamEventPlayerRosterId)
        removeTeamEventPlayerRoster: function (teamEventPlayerRosterId, success, fail) {
            var routeUrl = 'RemoveTeamEventPlayerRoster';
            var data = {
                user: this.adminUser(),
                pass: this.adminPass(),
                teamEventPlayerRosterId: teamEventPlayerRosterId
            };

            return this.basePost(routeUrl, data, success, fail);
        },
        //AddEmergencyShare(string user, string pass, int appUserId, int[] fileCabinetDocumentIds, string emergencyEmailAddress, string emailMessage)
        addEmergencyShare: function (appUserId, fileCabinetDocumentIds, emergencyEmailAddress, emailMessage, success, fail) {
            var routeUrl = 'AddEmergencyShare';
            var data = {
                user: this.adminUser(),
                pass: this.adminPass(),
                appUserId: appUserId,
                fileCabinetDocumentIds: fileCabinetDocumentIds,
                emergencyEmailAddress: emergencyEmailAddress,
                emailMessage: emailMessage
            };

            return this.basePost(routeUrl, data, success, fail);
        },
        currentUser: function () {
            return currentUser;
        },
        setCurrentUser: function (val) {
            currentUser = val;
        },
        //sharekeyUrl: function () {
        //    //http://my123filit.com/Pages/IFrame.aspx?UId=2
        //    return 'http://my123filit.com/Pages/IFrame.aspx?UId=' + currentUser.ID;
        //},
        adminUser: function () { return "admin"; },
        adminPass: function () { return "admin"; },
        baseUrl: function () {
            return baseUrl;
        },
        referenceLists: function () {
            return referenceLists;
        },
        serviceFailCallback: function (data, status, headers, config) {
            alert(data);
        }

    }
})

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


;

