mainApp
.service('PasswordHelper', function () {
    return {
        validPassword: function (password) {
            //password is 4-15 chars and contain at least one digit
            var re = /^(?=.*\d).{4,15}$/;
            return re.test(password);
        },
        getPasswordFormatError: function () {
            return 'Password must be 4 to 15 characters and contain a numeric digit.';
        }
    };
});