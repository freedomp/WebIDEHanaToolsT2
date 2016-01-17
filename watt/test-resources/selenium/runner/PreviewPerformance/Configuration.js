'use strict';

// KEYS
var KEYS = {
    "HOST": "host",
    "SELENIUM_HOST": "seleniumHost",
    "USER_NAME": "P1941820563",
    "PASSWORD": "scnUser100"
};

// Some Defaults
var testConfiguration = {};
testConfiguration[KEYS.HOST] = "https://cimaster-sapwebidetest.dispatcher.neo.ondemand.com?settings=delete&test=selenium";
testConfiguration[KEYS.SELENIUM_HOST] = "http://localhost:4444/wd/hub";
testConfiguration[KEYS.USER_NAME] = "P1941820563";
testConfiguration[KEYS.PASSWORD] = "scnUser100";


module.exports = {
    KEYS: KEYS,
    url : KEYS.HOST,
    startupTimeout : 200000,
    defaultTimeout : 40000,
    templateName: 'SAPUI5 Application',
    templateCategory: 'Featured',
    projectName : 'performanceTest1',
    appHeaderTitle : 'performanceTest1',
    setParam: function setParam(key, value) {
        testConfiguration[key] = value;
    },

    getParam: function getParam(key) {
        return testConfiguration[key];
    }
};