// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('app', ['ionic', 'app.controllers', 'app.routes', 'app.services', 'app.directives','ngAnimate'])

.run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
        //setTimeout(function () { $('.splash').hide();}, 1000);
    });
});



//window.onerror = function (message, url, line, col, error) {
//    var stopPropagation = debug ? false : true;
//    var data = {
//        type: 'javascript',
//        url: window.location.hash,
//        localtime: Date.now()
//    };
//    if (message) { data.message = message; }
//    if (url) { data.fileName = url; }
//    if (line) { data.lineNumber = line; }
//    if (col) { data.columnNumber = col; }
//    if (error) {
//        if (error.name) { data.name = error.name; }
//        if (error.stack) { data.stack = error.stack; }
//    }

//    if (debug) {
//        console.log('exception', data);
//        window.alert('Error: ' + data.message);
//    } else {
//        track('exception', data);
//    }
//    return stopPropagation;
//};