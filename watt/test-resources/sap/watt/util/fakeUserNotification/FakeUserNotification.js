define(function() {
    "use strict";

    var _bResult;

    return {
        confirm: function(oControl) {
            return {bResult : _bResult};
        },

        confirmYesNo: function(oControl, title) {
            return _bResult;
        },

        info: function(oControl) {
        },

        warning: function(oControl) {
        },

        alert: function(oControl) {
        },

        liteInfo: function(sMessage, bAutoDisappear) {
        },

        liteInfoWithAction: function(sMessage, sCommandId, bAutoDisappear, oCommandExecuteValue) {
        },

        setConfirmValue : function(returnValue){
            _bResult = returnValue;
        }
    };
});