mainApp
    .controller('teamCtrl', function ($scope, TeamPlayer, FileItService, $ionicPopup, $state, EmailHelper, DateHelper, Documents, FamilyUser) {
        $scope.init = function () {
            $scope.data = TeamPlayer.getObject();
            $scope.data.currentUser = FileItService.currentUser();
            $scope.data.organization = null;
            if ($scope.data.teamEvents.length == 0) {
                $scope.searchEvents();
            }
        };

        $scope.$on('$ionicView.beforeEnter', function () {
            $scope.init();
        });

        $scope.displayDate = function (val) {
            return DateHelper.displayDate(val);
        };

        $scope.searchOrganizations = function () {
            function successSearch(data) {
                $scope.data.organizations = data.Organizations;
            }

            function failSearch(data) {

            }

            FileItService.getOrganizations(null, $scope.data.organizationSearch, successSearch, failSearch)
        };

        $scope.searchEvents = function (callback) {
            function successSearch(data) {
                $scope.data.teamEvents = data.TeamEvents;
                if (typeof callback == 'function') {
                    callback();
                }
            }

            function failSearch(data) {

            }
            //appUserId, organizationId, teamEventId, searchName,
            FileItService.getTeamEventsByCoach($scope.data.currentUser.ID, null, successSearch, failSearch);
            //FileItService.getTeamEventsByAppUser($scope.data.currentUser.ID, $scope.data.organization == null ? null : $scope.data.organization.ID, null, $scope.data.eventSearch, successSearch, successSearch);
        };

        $scope.getPlayers = function (callback) {
            function loadPlayers(data) {
                $scope.data.players = data.TeamEventPlayerRosters;
                if (typeof callback == 'function') {
                    callback();
                }
            }

            function failPlayers() { }

            FileItService.getTeamEventPlayerRosters(null, $scope.data.teamEvent.ID, loadPlayers, failPlayers);
        };

        $scope.getUploadPlayers = function (callback) {
            function getUploadPlayers(data) {
                $scope.data.uploadPlayers = data.AppUsers;
                if (typeof callback == 'function') {
                    callback();
                }
            }

            function failUploadPlayers() { }

            FileItService.getTeamEventPlayersWithUploads($scope.data.teamEvent.ID, getUploadPlayers, failUploadPlayers);
        };

        $scope.addPlayerUpload = function (obj) {
            function callback() {
                $scope.getUploadPlayers($scope.getPlayers);
            }
            $scope.addPlayer(obj, callback);
        };

        $scope.addPlayerNew = function (obj) {
            function callback() {
                $scope.searchMembers($scope.getPlayers);
            }
            $scope.addPlayer(obj, callback);
        };

        $scope.addPlayer = function (userObj, callback) {
            var tepRosterObj = {
                TEAMEVENTID: $scope.data.teamEvent.ID,
                APPUSERID: userObj.ID,
                PLAYERPOSITION: '.',
                JERSEYNUMBER: null
            };

            /*
        public int ID { get; set; }
        public int TEAMEVENTID { get; set; }
        public Nullable<int> APPUSERID { get; set; }
        public string PLAYERPOSITION { get; set; }
        public Nullable<int> JERSEYNUMBER { get; set; }
        public Nullable<System.DateTime> DATECREATED { get; set; }
        public int? USERSTAGETYPEID { get; set; }
            */

            function addSuccess() {
                // $scope.getUploadPlayers($scope.getPlayers);
                callback();
            }

            function addFail() { }

            FileItService.addTeamEventPlayerRoster(tepRosterObj, addSuccess, addFail);//: function (teamEventPlayerRoster, success, fail)
        };

        $scope.removePlayer = function (id) {
            function addSuccess() {
                $scope.getPlayers();
            }

            function addFail() { }

            FileItService.removeTeamEventPlayerRoster(id, addSuccess, addFail);
        }

        $scope.viewPlayer = function (player) {
            function getUserSuccess(data) {
                var user = data.AppUsers[0];

                FamilyUser.setObject(user);
                function onSuccess() {
                    $scope.data.currentUser.verifying = true;
                    $state.go('memberCard');
                }
                //need to get appuser

                Documents.loadUserDocuments(user.ID, $scope.data.teamEvent.ID, onSuccess);
            }
            function getUserFail() { }

            FileItService.getAppUsers(player.APPUSERID, '', getUserSuccess, getUserFail);
        };

        $scope.searchMembers = function (callback) {
            function successGetMembers(data) {
                $scope.data.searchedMembers = data.AppUsers;
                if (typeof callback == 'function') {
                    callback();
                }
            }

            function failGetMembers() { }

            FileItService.getAppUsersByNameSexEmail($scope.data.currentUser.ID, $scope.data.teamEvent.ID, $scope.data.firstNameSearch, $scope.data.lastNameSearch, $scope.data.emailSearch, $scope.data.sex, successGetMembers, failGetMembers);
        };

        $scope.start = function () {
            //TeamPlayer.clear();
            $scope.init();
        };

        $scope.showSex = function (obj, sex) {
            return obj.Sex == sex;
        };

        $scope.selectEvent = function () {
            if ($scope.data.organization == null) {
                $scope.showMessage('Incomplete', 'Please select an organization.');
            } else {
                TeamPlayer.setObject($scope.data);
                $state.go('teamSelectEvent');
            }
        };

        $scope.viewPlayers = function () {
            if ($scope.data.teamEvent == null) {
                $scope.showMessage('Incomplete', 'Please select a team event.');
            } else {
                function navigateTeam() {
                    TeamPlayer.setObject($scope.data);
                    $state.go('teamViewPlayers');
                }
                $scope.getPlayers(navigateTeam);

            }
        };

        $scope.goUploadPlayers = function () {
            function navigateToPending() {
                TeamPlayer.setObject($scope.data);
                $state.go('teamAddPending');
            }
            $scope.getUploadPlayers(navigateToPending);
        };

        $scope.showMessage = function (title, message) {
            var alertPopup = $ionicPopup.alert({
                title: title,
                template: message
            });
        };

        //$scope.init();
    });