
// see http://requirejs.org/docs/node.html#nodeModules
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(["../lib/lodash/lodash"], function(_) {
    "use strict";

    /**
     * @param mRequiredIssues {Object.<string, Array<string>>} map between plugin name and the issues detected for it
     * @return {string}
     */
    function getErrorMessage_missing_required_service(mRequiredIssues) {
        var sMsgHeader = "Not all required services are provided: \n";
        return _createIssuesDetailedInfo(mRequiredIssues, sMsgHeader, "missing required services --->");
    }

    /**
     * @param mProvidedIssues {Object.<string, Array<string>>} map between plugin name and the issues detected for it
     * @return {string}
     */
    function getErrorMessage_configured_but_not_required_or_provided(mProvidedIssues) {
        var sMsgHeader = "Inconsistent Service Definition\
			- Not all configured services are required or provided: \n";
        return _createIssuesDetailedInfo(mProvidedIssues, sMsgHeader, "services not required or provided --->");
    }

    function _createIssuesDetailedInfo(mPluginNameToIssues, sMsgHeader, sMsgLineInfo) {
        var sFullMsg = _.reduce(mPluginNameToIssues, function(sFullMsg, aIssues, sPluginName) {
                var sCurrPluginMsg = "Plugin: " + sPluginName + " " + sMsgLineInfo + " " + aIssues.join(", ") + "\n";
                return sFullMsg + sCurrPluginMsg;
            },
            sMsgHeader);

        return sFullMsg;
    }

    return {
        getErrorMessage_configured_but_not_required_or_provided: getErrorMessage_configured_but_not_required_or_provided,
        getErrorMessage_missing_required_service: getErrorMessage_missing_required_service
    };

});
