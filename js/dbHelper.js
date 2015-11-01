/***********************
File: 			dbHelper.js
Date: 			01Nov2015
Created: 		J Osifchin
Description: 	control to handle database calls
***************************/
var dbHelper = {
    dbContext: {},
    init: function () {
        var db = window.openDatabase("ecoa", "1.0", "ecoa", 1000000);
        this.dbContext = db;
    },
    executeSql: function (sql, pars, callback) {
        this.dbContext.transaction(function (tx) {
            tx.executeSql(
                sql,
                pars, 
                function (tx2, results) {
                    if (typeof callback == "function") {
                        callback(tx2, dbController.formatData(results));
                    }
                },
                function (tx, error) {
                    dbHelper.dbErrorCallback(error);
                }
            );
        }),
        dbHelper.dbErrorCallback
    },
    formatData: function (results) {
        //format the data to a consistent format
        var formattedResults = [];
        var len = results.rows.length;
        if (len > 0) {
            for (var i = 0; i < len; i++) {
                formattedResults.push(results.rows.item(i));
            }
        }
        return formattedResults;
    },
    dbErrorCallback: function (error) {
        var message = "SQLite Error: ERROR CODE " + error.code + ': ' + error.message;
        //var title = "SQLite Error";
        app.writeLog(message, true);
    }
};

