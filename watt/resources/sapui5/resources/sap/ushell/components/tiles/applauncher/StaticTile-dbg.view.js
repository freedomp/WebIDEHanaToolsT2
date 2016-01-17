// Copyright (c) 2009-2014 SAP SE, All Rights Reserved

(function () {
    "use strict";
    /*global jQuery, sap */
    /*jslint nomen: true */

    sap.ui.jsview("sap.ushell.components.tiles.applauncher.StaticTile", {
        getControllerName: function () {
            return "sap.ushell.components.tiles.applauncher.StaticTile";
        },
        createContent: function (oController) {
            this.setHeight('100%');
            this.setWidth('100%');
        },
        getTileControl: function() {
            jQuery.sap.require('sap.ushell.ui.tile.StaticTile');
            var oController = this.getController();
            return new sap.ushell.ui.tile.StaticTile(
                {
                    title: "{/config/display_title_text}",
                    subtitle: "{/config/display_subtitle_text}",
                    info: "{/config/display_info_text}",
                    infoState: "Neutral",
                    icon: "{/config/display_icon_url}",
                    targetURL: "{/nav/navigation_target_url}",
                    highlightTerms: "{/search/display_highlight_terms}",
                    press: [ oController.onPress, oController ]
                }
            );
        },
        getLinkControl: function() {
            jQuery.sap.require('sap.m.Link');
            return new sap.m.Link({
                text: "{/config/display_title_text}",
                href: "{/nav/navigation_target_url}"
            });
        }
    });
}());
