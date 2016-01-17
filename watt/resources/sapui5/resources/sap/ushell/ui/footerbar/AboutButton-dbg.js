/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.ushell.ui.footerbar.AboutButton.
jQuery.sap.declare("sap.ushell.ui.footerbar.AboutButton");
jQuery.sap.require("sap.ushell.library");
jQuery.sap.require("sap.m.Button");


/**
 * Constructor for a new ui/footerbar/AboutButton.
 * 
 * Accepts an object literal <code>mSettings</code> that defines initial 
 * property values, aggregated and associated objects as well as event handlers. 
 * 
 * If the name of a setting is ambiguous (e.g. a property has the same name as an event), 
 * then the framework assumes property, aggregation, association, event in that order. 
 * To override this automatic resolution, one of the prefixes "aggregation:", "association:" 
 * or "event:" can be added to the name of the setting (such a prefixed name must be
 * enclosed in single or double quotes).
 *
 * The supported settings are:
 * <ul>
 * <li>Properties
 * <ul></ul>
 * </li>
 * <li>Aggregations
 * <ul></ul>
 * </li>
 * <li>Associations
 * <ul></ul>
 * </li>
 * <li>Events
 * <ul></ul>
 * </li>
 * </ul> 
 *
 * 
 * In addition, all settings applicable to the base type {@link sap.m.Button#constructor sap.m.Button}
 * can be used as well.
 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * Add your documentation for the newui/footerbar/AboutButton
 * @extends sap.m.Button
 * @version 1.32.6
 *
 * @constructor
 * @public
 * @name sap.ushell.ui.footerbar.AboutButton
 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
 */
sap.m.Button.extend("sap.ushell.ui.footerbar.AboutButton", { metadata : {

	library : "sap.ushell"
}});


/**
 * Creates a new subclass of class sap.ushell.ui.footerbar.AboutButton with name <code>sClassName</code> 
 * and enriches it with the information contained in <code>oClassInfo</code>.
 * 
 * <code>oClassInfo</code> might contain the same kind of informations as described in {@link sap.ui.core.Element.extend Element.extend}.
 *   
 * @param {string} sClassName name of the class to be created
 * @param {object} [oClassInfo] object literal with informations about the class  
 * @param {function} [FNMetaImpl] constructor function for the metadata object. If not given, it defaults to sap.ui.core.ElementMetadata.
 * @return {function} the created class / constructor function
 * @public
 * @static
 * @name sap.ushell.ui.footerbar.AboutButton.extend
 * @function
 */

// Start of sap/ushell/ui/footerbar/AboutButton.js
(function () {
    "use strict";
    /*global jQuery, sap, navigator*/

    jQuery.sap.require("sap.ui.layout.form.SimpleForm");
    jQuery.sap.require("sap.m.ObjectHeader");
    jQuery.sap.require("sap.m.VBox");
    jQuery.sap.require("sap.m.Dialog");
    jQuery.sap.require("sap.m.Button");
    jQuery.sap.require("sap.ushell.resources");

    jQuery.sap.declare("sap.ushell.ui.footerbar.AboutButton");

    /**
     * AboutButton
     *
     * @name sap.ushell.ui.footerbar.AboutButton
     * @private
     * @since 1.16.0
     */
    sap.ushell.ui.footerbar.AboutButton.prototype.init = function () {
        this.setIcon('sap-icon://hint');
        this.setWidth('100%');
        this.setText(sap.ushell.resources.i18n.getText("about"));
        this.setTooltip(sap.ushell.resources.i18n.getText("about"));
        this.attachPress(this.showAboutDialog);
        //call the parent sap.m.Button init method
        if (sap.m.Button.prototype.init) {
            sap.m.Button.prototype.init.apply(this, arguments);
        }
    };

    sap.ushell.ui.footerbar.AboutButton.prototype.showAboutDialog = function () {

        jQuery.sap.require("sap.ushell.services.AppConfiguration");

        var translationBundle = sap.ushell.resources.i18n,
            metaData = sap.ushell.services.AppConfiguration.getMetadata(),
            oSimpleForm = new sap.ui.layout.form.SimpleForm({
                id: 'aboutDialogFormID',
                editable: false,
                content : [
                    new sap.m.Label({text : translationBundle.getText("technicalName")}),
                    new sap.m.Text({text : metaData.libraryName || ''}),
                    new sap.m.Label({text : translationBundle.getText("fioriVersionFld")}),
                    new sap.m.Text({text : metaData.version || ''}),
//                    new sap.m.Label({text : translationBundle.getText("fioriBuildFld")}),
//                    new sap.m.Text({text : sap.ui.buildinfo.buildtime || ''}),
                    new sap.m.Label({text : translationBundle.getText("sapui5Fld")}),
                    new sap.m.Text({text : (sap.ui.version || "") + (' (' + (sap.ui.buildinfo.buildtime || "") + ')') || ''}),
                    new sap.m.Label({text : translationBundle.getText("userAgentFld")}),
                    new sap.m.Text({text : navigator.userAgent || ''}),
                    new sap.m.Label({text : ''})
                ]
            }),
            oHeader = new sap.m.ObjectHeader({
                title : metaData.title,
                icon : metaData.icon
            }).addStyleClass('sapUshellAboutDialogHeader'),
            oDialog,
            oVBox,
            okButton = new sap.m.Button({
                text : translationBundle.getText("okBtn"),
                press : function () {
                    oDialog.close();
                }
            });

        if (jQuery.isEmptyObject(metaData) || !metaData.icon) {
            oVBox = new sap.m.VBox({
                items: [oSimpleForm]
            });
        } else {
            oVBox = new sap.m.VBox({
                items: [oHeader, oSimpleForm]
            });
        }

        oDialog = new sap.m.Dialog({
            id: "aboutContainerDialogID",
            title: translationBundle.getText("about"),
            contentWidth : "25rem",
            horizontalScrolling: false,
            leftButton: okButton,
            afterClose : function () {
                oDialog.destroy();
            }
        });

        oDialog.addContent(oVBox);
        oDialog.open();
    };
}());