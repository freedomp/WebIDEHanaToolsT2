// Copyright (c) 2009-2014 SAP SE, All Rights Reserved

(function () {
    "use strict";
    /*global jQuery, sap */
    /*jslint nomen: true */

    sap.ui.jsview("sap.ushell.components.tiles.applauncherdynamic.DynamicTile", {
        getControllerName: function () {
            return "sap.ushell.components.tiles.applauncherdynamic.DynamicTile";
        },
        createContent: function (oController) {
            this.setHeight('100%');
            this.setWidth('100%');
        },
        getTileControl: function() {
            jQuery.sap.require('sap.ushell.ui.tile.DynamicTile');
            var oController = this.getController();
            return new sap.ushell.ui.tile.DynamicTile(
                {
                    title: "{/data/display_title_text}",
                    subtitle: "{/data/display_subtitle_text}",
                    info: "{/data/display_info_text}",
                    infoState: "{/data/display_info_state}",
                    icon: "{/data/display_icon_url}",
                    numberUnit: "{/data/display_number_unit}",
                    numberValue: "{/data/display_number_value}",
                    numberDigits: "{/data/display_number_digits}",
                    numberState: "{/data/display_number_state}",
                    numberFactor: "{/data/display_number_factor}",
                    stateArrow: "{/data/display_state_arrow}",
                    targetURL: "{/nav/navigation_target_url}",
                    highlightTerms: "{/search/display_highlight_terms}",
                    press : [ oController.onPress, oController ]
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