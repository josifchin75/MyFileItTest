mainApp
.service('Documents', ['FileItService', function (FileItService) {
    var docs = [];

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
}]);