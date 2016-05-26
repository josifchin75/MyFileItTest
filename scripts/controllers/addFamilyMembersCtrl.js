mainApp
    .controller('addFamilyMembersCtrl', function ($scope, FileItService, $ionicPopup, $state, EmailHelper, FamilyUser, FamilyUsers) {
        $scope.init = function (obj) {

            $scope.data = {
                currentUser: FileItService.currentUser(),
                familyUsers: [],
                appUserTypes: [],
                relationShipTypes: [],
                userName: '',
                firstName: '',
                lastName: '',
                relationShipTypeId: -1,
                phoneNumber: '',
                emailAddress: '',
                appUserTypeId: -1,
                sex: '',
                adding: true
            };
            function loadObject() {
                if (typeof obj != 'undefined') {
                    obj = FamilyUser.getObject();
                    //load up the controls
                    $scope.data.ID = obj.ID;
                    $scope.data.userName = obj.USERNAME;
                    $scope.data.firstName = obj.FIRSTNAME;
                    $scope.data.lastName = obj.LASTNAME;
                    $scope.data.relationShipTypeId = obj.RELATIONSHIPTYPEID;
                    $scope.data.phoneNumber = obj.PHONE;
                    $scope.data.emailAddress = obj.EMAILADDRESS;
                    $scope.data.appUserTypeId = obj.APPUSERTYPEID;
                    $scope.data.sex = obj.SEX;
                    $scope.data.adding = false;
                    $scope.data.dtoObject = obj;
                }
            }

            function successGetFamily(data) {
                $scope.data.familyUsers = data.AppUsers;
                FileItService.getReferenceData('RelationShipType', successRef, failRef);
            }

            function successRef(data) {
                $scope.data.relationShipTypes = data.KeyValueData;
                FileItService.getReferenceData('AppUserType', successUserRef, failRef);
            }

            function successUserRef(data) {
                var lookup = 'User/Player';
                for (var i = 0; i < data.KeyValueData.length; i++) {
                    if (data.KeyValueData[i].Value == lookup) {
                        // $scope.data.appUserTypes = data.KeyValueData[i];
                        $scope.data.appUserTypeId = data.KeyValueData[i].Key;
                        break;
                    }
                }
                loadObject();
            }

            function failRef() { }

            var user = $scope.data.currentUser;
            var primaryAppUserId = user.PRIMARYAPPUSERID == null ? user.ID : user.PRIMARYAPPUSERID;
            FileItService.getFamilyUsers(primaryAppUserId, successGetFamily, failRef);
        };

        $scope.$on('$ionicView.beforeEnter', function () {
            var user = eval('(' + $state.params.familyUser + ')');
            $scope.init(user);
        });


        $scope.validAddFamilyMember = function () {
            var result = true;
            var errorTitle = "Incomplete";
            var errorMessage = "";

            var data = $scope.data;
            function hasValue(key) {
                return data[key] != undefined && data[key].length > 0;
            }

            //if (!hasValue('userName')) {
            //    result = false;
            //    errorMessage += 'No username entered.';
            //}
            //if (!hasValue('password')) {
            //    result = false;
            //    errorMessage += 'No password entered.';
            //}
            if (!hasValue('firstName') || !hasValue('lastName')) {
                result = false;
                errorMessage += '<br/>Please enter a name.';
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
                errorMessage += '<br/>Please specify a sex.';
            }

            if (!hasValue('emailAddress')) {
                result = false;
                errorMessage += '<br/>Please enter an email address';
            }
            if (!EmailHelper.validEmail(data.emailAddress) && data.emailAddress.length > 0) {
                result = false;
                errorMessage += '<br/>Please enter a valid email address';
            }

            if (!result) {
                var alertPopup = $ionicPopup.alert({
                    title: errorTitle,
                    template: errorMessage
                });
            }

            return result;
        };

        $scope.addFamilyMember = function () {
            function successAdd() {
                var alertPopup = $ionicPopup.alert(
                    {
                        title: 'Success',
                        template: $scope.data.adding ? 'Your family member has been added!' : 'Your family member has been updated!',
                        buttons: [
                          {
                              text: '<b>Ok</b>',
                              type: 'button-positive',
                              onTap: function (e) {

                              }
                          }]
                    });

                if (!$scope.data.adding) {
                    //TODO: should have used the FamilyUser to pass in the object!!!
                    angular.extend($scope.data.dtoObject, appUserDTO);
                    FamilyUser.setObject($scope.data.dtoObject);
                    $scope.goToMain();
                } else {
                    $scope.init();
                }
            }

            if ($scope.validAddFamilyMember()) {
                var data = $scope.data;

                var appUserDTO = {
                    USERNAME: data.currentUser.USERNAME,//data.userName,
                    PASSWORD: data.currentUser.PASSWORD,
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
                    APPUSERSTATUSID: 2,
                    PRIMARYAPPUSERID: $scope.data.currentUser.ID
                };
                if (!$scope.data.adding) {

                }

                function failAddAppUser(data) {
                }

                if ($scope.data.adding) {
                    FileItService.addAppUser(appUserDTO, successAdd, failAddAppUser);
                } else {
                    appUserDTO.ID = $scope.data.ID;
                    FileItService.updateUser(appUserDTO, successAdd, failAddAppUser);
                }
            }
        }

        $scope.goToMain = function () {
            if ($scope.data.adding) {
                function onLoadFamily(data) {
                    $state.go('main', { appUserId: $scope.data.currentUser.ID });
                }

                FamilyUsers.loadFamilyUsers($scope.data.currentUser.ID, onLoadFamily);
            } else {
                $state.go($scope.data.adding ? 'main' : 'memberCard');
            }

        };

        $scope.init();
    });