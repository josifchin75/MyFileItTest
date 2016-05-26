mainApp
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
            dbHelper.executeSql(sql, pars, dataIsRead);

            //this has no data calls
            //callback([]);

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
});