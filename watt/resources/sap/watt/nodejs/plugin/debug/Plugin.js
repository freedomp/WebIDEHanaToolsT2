define(function () {
	"use strict";
	return {
        initialize: function initialize() {
            require.config({
                waitSeconds: 0,
                paths: {
                    "nodejsdebug": "sap/watt/nodejs/plugin/debug/service"
                }
            });
        }
    };
});