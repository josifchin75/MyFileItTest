mainApp
.service('ScanDocument', [function () {
    var documentDTO = {
        currentImage: null,
        currentImageSrc: 'no image',
        organizationSearch: '',
        organizations: [],
        organizationId: -1,
        documentTypes: [],
        documentTypeId: -1,
        familyUsers: [],
        familyUserId: -1,
        filename: '',
        familyUserName: '',
        cabinetId: '',
        documentTypeName: '',
        confirmed: false
    };

    return {
        getObject: function () {
            return documentDTO;
        },
        setObject: function (obj) {
            documentDTO = obj;
        }
    };
}]);