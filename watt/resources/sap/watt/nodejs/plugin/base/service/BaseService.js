jQuery.sap.require("sap.ui.core.IconPool");

define([], function () {

    "use strict";

    function CoreService() {

        this.onStarted = function onStarted(event) {
            // force own css to be loaded. CSS declares font family and loads font
            sap.watt.includeCSS(require.toUrl("sap.xs.nodejs.base/css/nodejs-base.css"));

            // usage example: "sap-icon://functionflow/functionFlowView"

            // debugger icons
            sap.ui.core.IconPool.addIcon("debugger", "debug", "nodejs-base-icons", "e000", true);
            sap.ui.core.IconPool.addIcon("resume", "debug", "nodejs-base-icons", "e001", true);
            sap.ui.core.IconPool.addIcon("stepinto", "debug", "nodejs-base-icons", "e002", true);
            sap.ui.core.IconPool.addIcon("stepover", "debug", "nodejs-base-icons", "e003", true);
            sap.ui.core.IconPool.addIcon("stepreturn", "debug", "nodejs-base-icons", "e004", true);
            sap.ui.core.IconPool.addIcon("pause", "debug", "nodejs-base-icons", "e005", true);
            sap.ui.core.IconPool.addIcon("disconnected", "debug", "nodejs-base-icons", "e006", true);
            sap.ui.core.IconPool.addIcon("connected", "debug", "nodejs-base-icons", "e007", true);
        };
    }

    return new CoreService();
});
