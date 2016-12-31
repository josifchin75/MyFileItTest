mainApp
.service('ViewDocument', ['FileItService', function (FileItService) {
    var documentDTO = {
        searchImages: [],

        familyUsers: [],
        familyUserId: -1,
        searchString: '',
        userIdFilterType: '',
        images: [],
        thumbs: [],
        selectedDocumentIds: [],
        organizationId: -1,
        organizationSearch: '',
        eventId: -1,
        eventSearch: '',
        events: [],
        eventDocumentId: -1,
        comment: [],
        eventDocuments: []
        // selectedImages: []
        //need to retain associations?
    };

    return {
        getObject: function () {
            return documentDTO;
        },
        setObject: function (obj) {
            documentDTO = obj;
        },
        loadDocuments: function (currentUser, onSuccess) {
            var viewDoc = this;
            function successGetAll(data) {
                //data:image/png;base64,
                documentDTO.images = data.Documents;
                viewDoc.searchDocuments();
                if (typeof onSuccess == 'function') {
                    onSuccess();
                }
            }

            function errorGetAll(data) {
            }

            if (documentDTO.images == undefined || documentDTO.images.length == 0) {
                var id = currentUser.PRIMARYAPPUSERID != null ? currentUser.PRIMARYAPPUSERID : currentUser.ID;
                FileItService.getFamilyDocuments(id, successGetAll, errorGetAll);
            } else {
                onSuccess();
            }
        },
        loadUserDocuments: function (appUserId, onSuccess) {
            var viewDoc = this;
            function successGetAll(data) {
                //data:image/png;base64,
                documentDTO.images = data.Documents;
                viewDoc.searchDocuments();
                if (typeof onSuccess == 'function') {
                    onSuccess();
                }
            }

            function errorGetAll(data) {
            }
            var teamEventId = null;
            FileItService.getAppUserDocuments(appUserId, teamEventId, successGetAll, errorGetAll);
        },
        searchDocuments: function () {
            //filter the docs if necessary
            var search = documentDTO.searchString;
            var patt = new RegExp(search.toLowerCase());

            var foundImages = [];
            for (var i = 0; i < documentDTO.images.length; i++) {
                var img = documentDTO.images[i];
                if (search.length > 0) {
                    if (patt.test(img.COMMENT.toLowerCase()) || patt.test(img.DocumentTypeName.toLowerCase())) {
                        foundImages.push(img);
                    }
                } else {
                    foundImages.push(img);
                }
            }
            documentDTO.searchImages = foundImages;//$scope.data.images;
        },
        clearEvents: function () {
            documentDTO.events = [];
        },
        searchEvents: function (appUserId, organizationId, eventSearch, onSuccess) {
            function successSearch(data) {
                documentDTO.events = data.TeamEvents;
                for (var i = 0; i < documentDTO.events.length; i++) {
                    documentDTO.events[i].show = false;
                }
                if (typeof onSuccess == 'function') {
                    onSuccess();
                }
            }

            function failSearch(data) {
                documentDTO.events = [];
            }
            //appUserId, organizationId, teamEventId, searchName,
            FileItService.getTeamEventsByAppUser(appUserId, organizationId, null, null, successSearch, failSearch)
        },
        init: function () {
            documentDTO = {};
        },
        displayAmount: function (amount) {
            function formatDecimal(amount, places) {
                return parseFloat(Math.round(amount * 100) / 100).toFixed(places)
            }

            return "$" + (amount > 0 ? formatDecimal((amount / 100), 2) : '0.00');
        }
    };
}]);