define(
    [], //dependencies
    function () {

        function System() {
        }

        System.currentTimeMillis = function () {
            return new Date().getMilliseconds();
        };

        return System;
    });