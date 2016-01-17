// iteration 0 ok
/* global jQuery, sap, window */
(function() {
    "use strict";

    jQuery.sap.require('sap.ushell.renderers.fiori2.search.SearchHelper');
    var SearchHelper = sap.ushell.renderers.fiori2.search.SearchHelper;

    jQuery.sap.declare('sap.ushell.renderers.fiori2.search.UXLog');
    var module = sap.ushell.renderers.fiori2.search.UXLog = {};

    jQuery.extend(module, {

        logLines: [],

        log: function() {
            this._log.apply(this, arguments);
        },

        _log: function(text) {
            this.logLines.push(text);
            this._save();
        },

        _save: function() {
            jQuery.ajax({
                type: 'PUT',
                url: '/uxlog.txt',
                data: this.logLines.join('\n') + '\n',
                contentType: 'text/plain'
            });
            this.logLines = [];
        }

    });

    module._save = SearchHelper.delayedExecution(module._save, 2000);

})();
