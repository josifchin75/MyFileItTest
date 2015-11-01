/***********************
File: 			fileHelper.js
Date: 			01Nov2015
Created: 		J Osifchin
Description: 	control to handle file manipulations
***************************/
var fileHelper = {
    writeFile: function (filename, text, overwrite, callback) {
        var fnCallback = function (file) {
            var textToWrite = "[" + (new Date()) + "]" + text + "\n";
            file.createWriter(function (fileWriter) {
                if (!overwrite) {
                    fileWriter.seek(fileWriter.length);
                }

                var blob = new Blob([textToWrite], { type: 'text/plain' });
                fileWriter.write(blob);

                if (typeof callback == "function") {
                    callback();
                }
            }, window.onerror);
        };
        this.runFileRoutine(filename, fnCallback);
    },
    readFile: function (filename, callback) {
        var fnCallback = function (fileObj) {
            fileObj.file(function (file) {
                var reader = new FileReader();

                reader.onloadend = function (e) {
                    console.log(this.result);
                    if (typeof callback == "function") {
                        callback(this.result);
                    }
                };

                reader.readAsText(file);
            }, window.onerror);
        };
        this.runFileRoutine(filename, fnCallback);
    },
    runFileRoutine: function (filename, callback) {
        if (typeof window.resolveLocalFileSystemURL != "undefined") {
            window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (dir) {
                dir.getFile(filename, { create: true }, function (file) {
                    if (typeof callback == "function") {
                        callback(file);
                    }
                });
            });
        }
    }
};