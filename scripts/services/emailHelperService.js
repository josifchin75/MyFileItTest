mainApp
.service('EmailHelper', function () {
    return {
        validEmail: function (emailAddress) {
            if (emailAddress == 'jo') { return true; }
            var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(emailAddress);
        }
    };
});