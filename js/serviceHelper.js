/***********************
File: 			serviceHelper.js
Date: 			01Nov2015
Created: 		J Osifchin
Description: 	control to handle service posts
***************************/
var serviceHelper = {
    init: function () {
        $.ajaxSetup({
            cache: false,
            crossDomain: true,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            async: false
        });

        $.support.cors = true;
    },
    ajaxGet: function (url, successCallback, errorCallback) {
        $.ajax({
            type: 'GET',
            url: url,
            beforeSend: function (xhr) {
                //xhr.setRequestHeader('Authorization', serviceController.getAuthHeader());
            },
            success: function (val) {
                console.log(val);
                if (typeof successCallback == "function") {
                    successCallback(val);
                }
            },
            error: function (xhr, status, error) {
                if (typeof errorCallback == "function") {
                    errorCallback(xhr, status, error);
                }
                window.onerror(error);
            }
        });
    },
    authHeaderKey: "authHeader",
    setAuthHeader: function (userid, password) {
        var auth = "Basic " + Base64.encode(userid + ":" + password);
        app.setSetting(this.authHeaderKey, auth);
    },
    getAuthHeader: function () {
        return app.getSetting(this.authHeaderKey);
    },
    ajaxPost: function (url, data, successCallback, errorCallback) {
        $.ajax({
            type: 'POST',
            url: url,
            data: data,
            cache: false,
            crossDomain: true,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            async: false,
            beforeSend: function (xhr) {
                //xhr.setRequestHeader('Authorization', serviceController.getAuthHeader());
            },
            success: function (val) {
                console.log(val);
                if (typeof successCallback == "function") {
                    successCallback(val);
                }
            },
            error: function (xhr, status, error) {
                if (typeof errorCallback == "function") {
                    errorCallback(xhr, status, error);
                }
                window.onerror(error);
            }
        });
    }

};