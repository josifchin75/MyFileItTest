mainApp
    .service('StateHelper', [function () {
        return {
            refresh: function (state) {
                state.go(state.current.name);
            }
        };
    }]);