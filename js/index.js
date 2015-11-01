/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var app = {
    // Application Constructor
    initialize: function () {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    onDeviceReady: function () {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function (id) {
        switch (id) {
            case "deviceready":
                //pgAlert("DEVICE READY", function() {}, "ready", null);
                this.initDevice();
                break;
        }

        console.log('Received Event: ' + id);
    },
    initDevice: function () {
        debugger;
        serviceHelper.init();
        dbHelper.init();
        screenHelper.changeScreen(
            "login",
            "LOGIN PAGE",
            null,
            function () {
            }
        );
    },
    writeLog: function (message, isError) {
        //write to file?
        console.log((isError ? "ERROR" : "LOG  "), message);
        fileHelper.writeFile("log.txt", message, false, null);
    },
    getSetting: function (key) {
        return window.localStorage.getItem(key);
    },
    setSetting: function (key, value) {

        window.localStorage.setItem(key, value);
        return true; //??
    },
    removeSetting: function (key) {
        window.localStorage.removeItem(key);
    }
};

window.onerror = function (e, f, g) {
    app.writeLog(e + f + g, true);
    console.log("window.onerror ", e, f, g);
};