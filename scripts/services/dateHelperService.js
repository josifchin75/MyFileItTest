mainApp
    .service('DateHelper', function () {
    return {
        serializeDate: function (val) {
            var d = moment(val);
            var utc = d.utc();
            var result = '\/Date(' + utc + ')\/';
            return result;
        },
        displayDate: function (val) {
            val = 'new ' + val.replace(/\//g, '');
            return moment(eval(val)).format('MMM DD, YYYY');
        }
    };
});