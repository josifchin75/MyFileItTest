mainApp
.controller('newAccountCtrl', function ($scope, FileItService, $ionicPopup, $state, AppUser, EmailHelper, PasswordHelper, DateHelper, FamilyUsers) {
    $scope.init = function () {

        $scope.data = AppUser.getObject();

        function successRef(data) {
            $scope.data.relationShipTypes = data.KeyValueData;
            FileItService.getReferenceData('AppUserType', successUserRef, failRef);
        }

        function successUserRef(data) {
            $scope.data.appUserTypes = data.KeyValueData;
        }

        function failRef(data) {
        }

        FileItService.getReferenceData('RelationShipType', successRef, failRef);
    };

    $scope.clearData = function () {
        $scope.data.userName = null;
        $scope.data.password = null;
        $scope.data.confirmPassword = null;
        $scope.data.firstName = null;
        $scope.data.lastName = null;
        $scope.data.phoneNumber = null;
        $scope.data.phoneNumber = null;
        $scope.data.emailAddress = null;
        $scope.data.sex = null;
        $scope.data.relationShipTypeId = null;
        $scope.data.appUserTypeId = null;
    };

    $scope.addAccountUserName = function () {
        function isValid() {
            if ($scope.data.emailAddress == undefined || $scope.data.emailAddress.length == 0) {
                $scope.data.emailAddress = $scope.data.userName;
            }
            AppUser.setObject($scope.data);
            $state.go('newAccountProfile');
        }
        $scope.validateUserName(isValid);
    };

    $scope.addAccountUser = function () {
        function successAdd() {
            var alertPopup = $ionicPopup.alert(
                {
                    title: 'Success',
                    template: 'Your account has been added!',
                    buttons: [
                      {
                          text: '<b>Ok</b>',
                          type: 'button-positive',
                          onTap: function (e) {
                              $scope.clearData();
                              $state.go('main');
                          }
                      }]
                });
        }

        if ($scope.validAddAccount()) {
            var data = $scope.data;

            var appUserDTO = {
                USERNAME: data.userName,
                PASSWORD: data.password,
                FIRSTNAME: data.firstName,
                LASTNAME: data.lastName,
                ADDRESS1: '.',
                ADDRESS2: '.',
                CITY: '.',
                STATECODE: 'PA',
                ZIPCODE: '.',
                PHONE: data.phoneNumber,
                MOBILEPHONENUMBER: data.phoneNumber,
                EMAILADDRESS: data.emailAddress,
                SEX: data.sex,
                RELATIONSHIPTYPEID: data.relationShipTypeId,
                APPUSERTYPEID: data.appUserTypeId,
                APPUSERSTATUSID: 2
            };


            function successAddAppUser(data) {
                FileItService.setCurrentUser(data.AppUsers[0]);
                var user = data.AppUsers[0];
                var primaryAppUserId = user.PRIMARYAPPUSERID == null ? user.ID : user.PRIMARYAPPUSERID;

                FamilyUsers.loadFamilyUsers(primaryAppUserId, successAdd);
                // successAdd();

                //this is removed for now Dec29-2015
                ////todo: this may be important!!! it needs to be fixed.
                //var appUserTypeId = 5;
                //var startDate = DateHelper.serializeDate(new Date());
                //var expiresDate = DateHelper.serializeDate(new Date());
                //var yearCode = '2015';
                //var sportTypeId = 1;
                ////AssociateAppUserToOrganization(string user, string pass, int appUserId, int appUserTypeId, int organizationId, DateTime startDate, DateTime expiresDate, int? yearCode, int sportTypeId)
                //FileItService.associateAppUserToOrganization(data.AppUsers[0].ID, appUserTypeId, $scope.data.organizationId, startDate, expiresDate, yearCode, sportTypeId, successAdd);
            }

            function failAddAppUser(data) {
            }

            FileItService.addAppUser(appUserDTO, successAddAppUser, failAddAppUser);
        }
    };

    $scope.searchOrganizations = function () {
        function successSearch(data) {
            $scope.data.organizations = data.Organizations;
        }

        function failSearch(data) {

        }

        FileItService.getOrganizations(null, $scope.data.organizationSearch, successSearch, failSearch)
    };

    $scope.validateUserName = function (success) {
        var result = true;
        var errorTitle = 'Invalid Entry';
        var errorMessage = '';

        if ($scope.data.userName == undefined || $scope.data.userName.length == 0 || !EmailHelper.validEmail($scope.data.userName)) {
            result = false;
            errorMessage += 'Invalid username / email address.\n'
        }

        if ($scope.data.password == undefined || $scope.data.password.length == 0) {
            result = false;
            errorMessage += 'Please enter a password.\n'
        } else {
            if ($scope.data.password != $scope.data.confirmPassword) {
                result = false;
                errorMessage += 'Passwords do not match.\n'
            } else {
                if (!PasswordHelper.validPassword($scope.data.password)) {
                    result = false;
                    errorMessage += PasswordHelper.getPasswordFormatError();
                }
            }
        }

        function fail(title, message) {
            var alertPopup = $ionicPopup.alert({
                title: title,
                template: message
            });
        }

        if (!result) {
            fail(errorTitle, errorMessage);
        } else {
            //validate against the server
            FileItService.checkUserExists($scope.data.userName, success, function () { fail('Invalid username', 'Username / password already exists') });
        }

    };

    $scope.validAddAccount = function () {
        var result = true;
        var errorTitle = "Incomplete";
        var errorMessage = "";

        var data = $scope.data;
        function hasValue(key) {
            return data[key] != undefined && data[key].length > 0;
        }

        if (!hasValue('userName')) {
            result = false;
            errorMessage += 'No username entered.';
        }
        if (!hasValue('password')) {
            result = false;
            errorMessage += 'No password entered.';
        }
        if (!hasValue('firstName') || !hasValue('lastName')) {
            result = false;
            errorMessage += '<br/>Please enter your name.';
        }
        if (data.relationShipTypeId == undefined || data.relationShipTypeId == -1) {
            result = false;
            errorMessage += '<br/>Please select a relationship type.';
        }
        if (!hasValue('phoneNumber')) {
            result = false;
            errorMessage += '<br/>Please enter a phone number';
        }
        if (data.sex == '') {
            result = false;
            errorMessage += '<br/>Please specify your sex.';
        }
        //if (data.appUserTypeId == undefined || data.appUserTypeId == -1) {
        //    result = false;
        //    errorMessage += '<br/>Please select a user type.';
        //}
        if (!hasValue('emailAddress')) {
            result = false;
            errorMessage += '<br/>Please enter an email address';
        }
        if (!EmailHelper.validEmail(data.emailAddress)) {
            result = false;
            errorMessage += '<br/>Please enter a valid email address';
        }
        //if (data.organizationId == undefined || data.organizationId == -1) {
        //    result = false;
        //    errorMessage += '<br/>Please select an organization.';
        //}

        if (!result) {
            var alertPopup = $ionicPopup.alert({
                title: errorTitle,
                template: errorMessage
            });
        }

        return result;
    };

    $scope.init();
});