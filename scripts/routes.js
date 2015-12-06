angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
    
      
        
    .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html',
      controller: 'loginCtrl'
    })
        
      
    
      
        
    .state('scanDocuments', {
      url: '/scandocuments',
      templateUrl: 'templates/scanDocuments.html',
      controller: 'scanDocumentsCtrl'
    })
        
      
    
      
        
    .state('tabsController2.viewYourDocuments', {
      url: '/viewdocuments',
      views: {
        'tab11': {
          templateUrl: 'templates/viewYourDocuments.html',
          controller: 'viewYourDocumentsCtrl'
        }
      }
    })
        
      
    
      
        
    .state('inviteAFriend', {
      url: '/invitefriend',
      templateUrl: 'templates/inviteAFriend.html',
      controller: 'inviteAFriendCtrl'
    })
        
      
    
      
    .state('tabsController', {
      url: '/maintab',
      abstract:true,
      templateUrl: 'templates/tabsController.html'
    })
      
    
      
        
    .state('tabsController.main', {
      url: '/main',
      views: {
        'tab7': {
          templateUrl: 'templates/main.html',
          controller: 'mainCtrl'
        }
      }
    })
        
      
    
      
        
    .state('tabsController.settings', {
      url: '/Settings',
      views: {
        'tab2': {
          templateUrl: 'templates/settings.html',
          controller: 'settingsCtrl'
        }
      }
    })
        
      
    
      
        
    .state('forgotPassword', {
      url: '/forgotpassword',
      templateUrl: 'templates/forgotPassword.html',
      controller: 'forgotPasswordCtrl'
    })
        
      
    
      
        
    .state('tabsController.logOut', {
      url: '/logout',
      views: {
        'tab8': {
          templateUrl: 'templates/logOut.html',
          controller: 'logOutCtrl'
        }
      }
    })
        
      
    
      
        
    .state('sharingKeyManagement', {
      url: '/sharingkeymanagement',
      templateUrl: 'templates/sharingKeyManagement.html',
      controller: 'sharingKeyManagementCtrl'
    })
        
      
    
      
        
    .state('editAccountLogin', {
      url: '/editaccountlogin',
      templateUrl: 'templates/editAccountLogin.html',
      controller: 'editAccountLoginCtrl'
    })
        
      
    
      
        
    .state('editAccountUser', {
      url: '/editaccountuser',
      templateUrl: 'templates/editAccountUser.html',
      controller: 'editAccountUserCtrl'
    })
        
      
    
      
        
    .state('setUpTeamAndPlayers', {
      url: '/setupteam',
      templateUrl: 'templates/setUpTeamAndPlayers.html',
      controller: 'setUpTeamAndPlayersCtrl'
    })
        
      
    
      
        
    .state('scannerSettings', {
      url: '/scannersettings',
      templateUrl: 'templates/scannerSettings.html',
      controller: 'scannerSettingsCtrl'
    })
        
      
    
      
        
    .state('newAccount', {
      url: '/newacount',
      templateUrl: 'templates/newAccount.html',
      controller: 'newAccountCtrl'
    })
        
      
    
      
        
    .state('newAccountProfile', {
      url: '/newaccountprofile',
      templateUrl: 'templates/newAccountProfile.html',
      controller: 'newAccountCtrl'
    })
        
      
    
      
        
    .state('success', {
      url: '/newaccountsuccess',
      templateUrl: 'templates/success.html',
      controller: 'successCtrl'
    })
        
      
    
      
        
    .state('forgottenPasswordSent', {
      url: '/forgottenpasswordsuccess',
      templateUrl: 'templates/forgottenPasswordSent.html',
      controller: 'forgottenPasswordSentCtrl'
    })
        
      
    
      
        
    .state('confirmDocument', {
      url: '/scanconfirm',
      templateUrl: 'templates/confirmDocument.html',
      controller: 'confirmDocumentCtrl'
    })
        
      
    
      
        
    .state('uploadSuccess', {
      url: '/uploadsuccess',
      templateUrl: 'templates/uploadSuccess.html',
      controller: 'uploadSuccessCtrl'
    })
        
      
    
      
        
    .state('errorHasOccurred', {
      url: '/errorpage',
      templateUrl: 'templates/errorHasOccurred.html',
      controller: 'errorHasOccurredCtrl'
    })
        
      
    
      
        
    .state('tabsController2.viewImages', {
      url: '/viewImages',
      views: {
        'tab9': {
          templateUrl: 'templates/viewImages.html',
          controller: 'viewImagesCtrl'
        }
      }
    })
        
      
    
      
    .state('tabsController2', {
      url: '/page26',
      abstract:true,
      templateUrl: 'templates/tabsController2.html'
    })
      
    
      
        
    .state('tabsController2.shareDocuments', {
      url: '/sharedocuments',
      views: {
        'tab10': {
          templateUrl: 'templates/shareDocuments.html',
          controller: 'shareDocumentsCtrl'
        }
      }
    })
        
      
    
      
        
    .state('confirmDocumentShare', {
      url: '/confirmdocumentshare',
      templateUrl: 'templates/confirmDocumentShare.html',
      controller: 'confirmDocumentShareCtrl'
    })
        
      
    
      
        
    .state('emergencyShare', {
      url: '/emergencyShare',
      templateUrl: 'templates/emergencyShare.html',
      controller: 'emergencyShareCtrl'
    })
        
      
    
      
        
    .state('shareHasBeenSent', {
      url: '/shareSent',
      templateUrl: 'templates/shareHasBeenSent.html',
      controller: 'shareHasBeenSentCtrl'
    })
        
      
    ;

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');

});