/***********************
File: 			dbHelper.js
Date: 			06Mar2016
Created: 		J Osifchin
Description: 	control to handle database calls
***************************/
var dbHelper = {
    dbContext: {},
    enabled: false,
    init: function () {
        if (typeof window.openDatabase != 'undefined') {
            var db = window.openDatabase("myfileit", "1.0", "myfileit", 1000000);
            this.dbContext = db;

            var sql = 'CREATE TABLE IF NOT EXISTS MyFileItDocument (AppUserId PRIMARY KEY, Documents);';
            dbHelper.executeSql(sql, []);
            this.enabled = true;
        }
    },
    executeSql: function (sql, pars, callback) {
        dbHelper.dbContext.transaction(function (tx) {
            tx.executeSql(
                sql,
                pars, 
                function (tx2, results) {
                    if (typeof callback == "function") {
                        callback(tx2, dbHelper.formatData(results));
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

    }
};

