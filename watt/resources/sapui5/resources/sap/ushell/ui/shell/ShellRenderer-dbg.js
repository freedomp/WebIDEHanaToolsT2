/*!
 * ${copyright}
 */
/*global sap*/
// Provides default renderer for control sap.ushell.ui.shell.Shell
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Renderer', './ShellLayoutRenderer'],
    function (jQuery, Renderer, ShellLayoutRenderer) {
        "use strict";


        /**
         * Renderer for the sap.ushell.ui.shell.Shell
         * @namespace
         */
        var ShellRenderer = Renderer.extend(ShellLayoutRenderer);


        return ShellRenderer;

}, /* bExport= */ true);
