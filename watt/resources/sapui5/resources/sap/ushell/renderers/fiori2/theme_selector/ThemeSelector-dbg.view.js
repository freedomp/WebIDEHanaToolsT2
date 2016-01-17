// Copyright (c) 2009-2014 SAP SE, All Rights Reserved

(function () {
    "use strict";
    /*global jQuery, sap, document, self */
    /*jslint plusplus: true, nomen: true, vars: true */

    jQuery.sap.require("sap.ushell.resources");
    jQuery.sap.require("sap.ushell.services.Container");

    sap.ui.jsview("sap.ushell.renderers.fiori2.theme_selector.ThemeSelector", {

        createContent: function (oController) {
            var oThemeListItem = this._getThemeListItemTemplate(),
                that = this,
                onSelectHandler = function (oEvent) {
                var oItem = oEvent.getParameters().listItem;
                that.oController.setCurrentThemeId(oItem.getBindingContext().getProperty("id"));
            };
            this.oList = new sap.m.List('themeSelectorList', {
                includeItemInSelection: true,
                mode: "SingleSelectLeft",
                items: {
                    path: "/options",
                    template: oThemeListItem
                },
                selectionChange: onSelectHandler
            });
            return this.oList;
        },

        getControllerName: function () {
            return "sap.ushell.renderers.fiori2.theme_selector.ThemeSelector";
        },

        _getThemeListItemTemplate : function () {
            return new sap.m.StandardListItem({
                title: "{name}",
                selected: "{isSelected}"
            });
        }
    });

}());