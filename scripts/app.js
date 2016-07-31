// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
var mainApp = angular.module('app', ['ionic', 'app.controllers', 'app.routes', 'app.services', 'app.directives', 'ngAnimate'])

.run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        setTimeout(function () {
            $('.splash').slideUp('slow');
        }, 2000);

        if (window.cordova && typeof window.cordova.plugins != 'undefined' &&  window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }

        //alert(app.platform());
        if (typeof IAP != 'undefined' && typeof IAP.load == 'function') {
            IAP.load();
        }

    });
})
 .run(function ($rootScope, $location) {
     $rootScope.$on('$stateChangeStart',
        function (event, toState, toParams, fromState, fromParams) {
            //var state = toState.name;
            //switch (state) {
            //    case "tabsController.main":
            //        //event.targetScope.$broadcast('logged-in');
            //        break;
            //}
        });
 })
;

var app = {
    // Application Constructor
    initialize: function () {
        this.bindEvents();
    },
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    onDeviceReady: function () {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function (id) {
        // alert('load');
        //$('.splash').slideUp('slow');
        console.log('Received Event: ' + id);

        switch (id) {
            case 'deviceready':
                app.deviceReadyCallback();
        }
    },
    platform: function () {
        return getPlatform();
    },
    deviceReadyCallback: function () {
        setTimeout(loadAdMob, 500);
    }
};

function getPlatform() {
    var deviceType = (navigator.userAgent.match(/iPad/i)) == "iPad" ? "iOS" : (navigator.userAgent.match(/iPhone/i)) == "iPhone" ? "iOS" : (navigator.userAgent.match(/Android/i)) == "Android" ? "Android" : (navigator.userAgent.match(/BlackBerry/i)) == "BlackBerry" ? "BlackBerry" : "web";
    return deviceType;
}


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