/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.ushell.ui.footerbar.LogoutButton.
jQuery.sap.declare("sap.ushell.ui.footerbar.LogoutButton");
jQuery.sap.require("sap.ushell.library");
jQuery.sap.require("sap.m.Button");


/**
 * Constructor for a new ui/footerbar/LogoutButton.
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
 * A logout button for the UShell footerbar.
 * @extends sap.m.Button
 * @version 1.32.6
 *
 * @constructor
 * @public
 * @name sap.ushell.ui.footerbar.LogoutButton
 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
 */
sap.m.Button.extend("sap.ushell.ui.footerbar.LogoutButton", { metadata : {

	library : "sap.ushell"
}});


/**
 * Creates a new subclass of class sap.ushell.ui.footerbar.LogoutButton with name <code>sClassName</code> 
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
 * @name sap.ushell.ui.footerbar.LogoutButton.extend
 * @function
 */

// Start of sap/ushell/ui/footerbar/LogoutButton.js
(function () {
    "use strict";
    /*global jQuery, sap*/

    jQuery.sap.declare("sap.ushell.ui.footerbar.LogoutButton");

    jQuery.sap.require("sap.ushell.resources");

    /**
     * LogoutButton
     *
     * @name sap.ushell.ui.footerbar.LogoutButton
     * @private
     * @since 1.16.0
     */
    sap.ushell.ui.footerbar.LogoutButton.prototype.init = function () {
        this.setIcon('sap-icon://log');
        this.setTooltip(sap.ushell.resources.i18n.getText("logoutBtn_tooltip"));
        this.setWidth('100%');
        this.setText(sap.ushell.resources.i18n.getText("logoutBtn_title"));
        this.attachPress(this.logout);
        this.setEnabled();  // disables button if shell not initialized
        //call the parent sap.m.Button init method
        if (sap.m.Button.prototype.init) {
            sap.m.Button.prototype.init.apply(this, arguments);
        }
    };

    sap.ushell.ui.footerbar.LogoutButton.prototype.logout = function () {
        jQuery.sap.require('sap.m.MessageBox');
        var bShowLoadingScreen = true,
            bIsLoadingScreenShown = false,
            oLoading = new sap.ushell.ui.launchpad.LoadingDialog({text: ""});

        sap.ushell.Container.getGlobalDirty().done(function (dirtyState) {
            bShowLoadingScreen = false;
            if (bIsLoadingScreenShown === true) {
                oLoading.exit();
                oLoading = new sap.ushell.ui.launchpad.LoadingDialog({text: ""});
            }

            var _getLogoutDetails = function (dirtyState) {
                var oLogoutDetails = {},
                    oResourceBundle = sap.ushell.resources.i18n;

                if (dirtyState === sap.ushell.Container.DirtyState.DIRTY) {
                    // show warning only if it is sure that there are unsaved changes
                    oLogoutDetails.message = oResourceBundle.getText('unsaved_data_warning_popup_message');
                    oLogoutDetails.icon = sap.m.MessageBox.Icon.WARNING;
                    oLogoutDetails.messageTitle = oResourceBundle.getText("unsaved_data_warning_popup_title");
                } else {
                    // show 'normal' logout confirmation in all other cases, also if dirty state could not be determined
                    oLogoutDetails.message = oResourceBundle.getText('logoutConfirmationMsg');
                    oLogoutDetails.icon = sap.m.MessageBox.Icon.QUESTION;
                    oLogoutDetails.messageTitle = oResourceBundle.getText("logoutMsgTitle");
                }

                return oLogoutDetails;
            };

            var oLogoutDetails = _getLogoutDetails(dirtyState);
            sap.m.MessageBox.show(oLogoutDetails.message, oLogoutDetails.icon,
                oLogoutDetails.messageTitle, [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                function (oAction) {
                    if (oAction === sap.m.MessageBox.Action.OK) {
                        oLoading.openLoadingScreen();
                        oLoading.showAppInfo(sap.ushell.resources.i18n.getText('beforeLogoutMsg'), null);
                        sap.ushell.Container.logout();
                    }
                }, sap.ui.core.ElementMetadata.uid("confirm"));
        });
        if (bShowLoadingScreen === true) {
            oLoading.openLoadingScreen();
            bIsLoadingScreenShown = true;
        }
    };

    sap.ushell.ui.footerbar.LogoutButton.prototype.setEnabled = function (bEnabled) {
        if (!sap.ushell.Container) {
            if (this.getEnabled()) {
                jQuery.sap.log.warning(
                    "Disabling 'Logout' button: unified shell container not initialized",
                    null,
                    "sap.ushell.ui.footerbar.LogoutButton"
                );
            }
            bEnabled = false;
        }
        sap.m.Button.prototype.setEnabled.call(this, bEnabled);
    };



}());
