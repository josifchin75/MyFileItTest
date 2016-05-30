mainApp
.service('Documents', ['FileItService', function (FileItService) {
    var docs = [];
    var simpleDocList = [];

    return {
        loadUserDocuments: function (appUserId, teamEventId, onSuccess) {
            var viewDoc = this;
            function successGetAll(data) {
                //alert(JSON.stringify(data));
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
        loadUserDocumentsSimple: function (appUserId, teamEventId, onSuccess) {
            var viewDoc = this;
            function successGetAll(data) {
                //alert(JSON.stringify(data));
                simpleDocList = data.Documents;
                if (typeof onSuccess == 'function') {
                    onSuccess();
                }
            }

            function errorGetAll(data) {
            }
            //var teamEventId = null;
            FileItService.getAppUserDocumentsSimple(appUserId, teamEventId, successGetAll, errorGetAll);
        },
        init: function () {
            docs = [];
        },
        getObject: function () {
            return docs;
        },
        setObject: function (obj) {
            docs = obj;
        },
        getSimpleListObject: function () {
            return simpleDocList;
        },
        setSimpleListObject: function (obj) {
            simpleDocList = obj;
        }
    };
}]);