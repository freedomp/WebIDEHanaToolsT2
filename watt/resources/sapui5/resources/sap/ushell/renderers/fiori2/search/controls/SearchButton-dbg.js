/* global jQuery, sap, window */
(function() {
    "use strict";

    jQuery.sap.require('sap.m.Button');

    sap.m.Button.extend('sap.ushell.renderers.fiori2.search.controls.SearchButton', {

        constructor: function(sId, options) {
            options = jQuery.extend({}, {
                icon: sap.ui.core.IconPool.getIconURI("search"),
                tooltip: sap.ushell.resources.i18n.getText("search")
            }, options);
            sap.m.Button.prototype.constructor.apply(this, [sId, options]);
            this.addStyleClass('searchBtn');
        },

        renderer: 'sap.m.ButtonRenderer'

    });

})();
