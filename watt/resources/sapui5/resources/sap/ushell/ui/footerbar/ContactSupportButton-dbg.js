/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.ushell.ui.footerbar.ContactSupportButton.
jQuery.sap.declare("sap.ushell.ui.footerbar.ContactSupportButton");
jQuery.sap.require("sap.ushell.library");
jQuery.sap.require("sap.m.Button");


/**
 * Constructor for a new ui/footerbar/ContactSupportButton.
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
 * Add your documentation for the newui/footerbar/CreateTicketButton
 * @extends sap.m.Button
 * @version 1.32.6
 *
 * @constructor
 * @public
 * @name sap.ushell.ui.footerbar.ContactSupportButton
 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
 */
sap.m.Button.extend("sap.ushell.ui.footerbar.ContactSupportButton", { metadata : {

	library : "sap.ushell"
}});


/**
 * Creates a new subclass of class sap.ushell.ui.footerbar.ContactSupportButton with name <code>sClassName</code> 
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
 * @name sap.ushell.ui.footerbar.ContactSupportButton.extend
 * @function
 */

// Start of sap/ushell/ui/footerbar/ContactSupportButton.js
/*global jQuery, sap*/

(function () {
    "use strict";
    /*global jQuery, sap, window*/

    jQuery.sap.require("sap.ushell.resources");
    jQuery.sap.require("sap.ushell.ui.launchpad.AccessibilityCustomData");
    jQuery.sap.declare("sap.ushell.ui.footerbar.ContactSupportButton");

    /**
     * ContactSupportButton
     *
     * @name sap.ushell.ui.footerbar.ContactSupportButton
     * @private
     * @since 1.16.0
     */
    sap.ushell.ui.footerbar.ContactSupportButton.prototype.init = function () {
        this.setIcon('sap-icon://email');
        this.setWidth('100%');
        this.setText(sap.ushell.resources.i18n.getText("contactSupportBtn"));
        this.setTooltip(sap.ushell.resources.i18n.getText("contactSupportBtn_tooltip"));
        this.attachPress(this.showContactSupportDialog);
        this.setEnabled();// disables button if shell not initialized
    };

    sap.ushell.ui.footerbar.ContactSupportButton.prototype.showContactSupportDialog = function () {
        jQuery.sap.require("sap.ushell.services.Container");
        jQuery.sap.require("sap.ui.layout.form.SimpleForm");
        jQuery.sap.require("sap.m.TextArea");
        jQuery.sap.require("sap.m.Link");
        jQuery.sap.require("sap.m.Label");
        jQuery.sap.require("sap.m.Text");
        jQuery.sap.require("sap.m.Dialog");
        jQuery.sap.require("sap.m.Button");
        jQuery.sap.require("sap.ushell.UserActivityLog");

        this.translationBundle = sap.ushell.resources.i18n;
        this.oClientContext = sap.ushell.UserActivityLog.getMessageInfo();
        this.oLink = new sap.m.Link({text: this.translationBundle.getText("technicalDataLink")});
        this.oBottomSimpleForm = new sap.ui.layout.form.SimpleForm("bottomForm", {editable: false, content: [this.oLink]});
        this.sendButton = new sap.m.Button("contactSupportSendBtn", {
            text: this.translationBundle.getText("sendBtn"),
            enabled: false,
            press: function () {
                var oSupportTicketService = sap.ushell.Container.getService("SupportTicket"),
                    oText = this.oTextArea.getValue(),
                    oSupportTicketData = {text: oText, clientContext: this.oClientContext},
                    promise = oSupportTicketService.createTicket(oSupportTicketData);

                promise.done(function () {
                    sap.ushell.Container.getService("Message").info(this.translationBundle.getText("supportTicketCreationSuccess"));
                }.bind(this));
                promise.fail(function () {
                    sap.ushell.Container.getService("Message").error(this.translationBundle.getText("supportTicketCreationFailed"));
                }.bind(this));

                this.oDialog.close();
            }.bind(this)
        });
        this.cancelButton = new sap.m.Button("contactSupportCancelBtn", {
            text: this.translationBundle.getText("cancelBtn"),
            press: function () {
                this.oDialog.close();
            }.bind(this)
        });
        this.oTextArea = new sap.m.TextArea("textArea", {
            rows: 7,
            liveChange: function () {
                if (/\S/.test(this.oTextArea.getValue())) {
                    this.sendButton.setEnabled(true);
                } else {
                    this.sendButton.setEnabled(false);
                }
            }.bind(this)
        });

        this.oTopSimpleForm = new sap.ui.layout.form.SimpleForm("topForm", {editable: false, content: [this.oTextArea]});
        this.oDialog = new sap.m.Dialog({
            id: "ContactSupportDialog",
            title: this.translationBundle.getText("contactSupportBtn"),
            contentWidth : "29.6rem",
            leftButton: this.sendButton,
            rightButton: this.cancelButton,
            initialFocus: "textArea",
            afterOpen: function () {
                //Fix ios 7.1 bug in ipad4 where there is a gray box on the screen when you close the keyboards
                jQuery("#textArea").on("focusout", function () {
                    window.scrollTo(0, 0);
                });
            },
            afterClose: function () {
                this.oDialog.destroy();
            }.bind(this)
        }).addStyleClass("sapUshellContactSupportDialog");

        this.oTextArea.setPlaceholder(this.translationBundle.getText("txtAreaPlaceHolderHeader"));
        this.oLink.attachPress(this._embedLoginDetailsInBottomForm.bind(this));
        this.oDialog.addCustomData(new sap.ushell.ui.launchpad.AccessibilityCustomData({
            key: "aria-label",
            value: this.translationBundle.getText("ContactSupportArialLabel"),
            writeToDom: true
        }));
        this.oDialog.addContent(this.oTopSimpleForm);
        this.oDialog.addContent(this.oBottomSimpleForm);
        this.oDialog.open();
    };

    sap.ushell.ui.footerbar.ContactSupportButton.prototype._embedLoginDetailsInBottomForm = function () {
        this.oDialog.removeContent(this.oBottomSimpleForm.getId());
        this.oBottomSimpleForm.destroy();
        var applicationType = "",
            url = "",
            additionalInformation = "",
            aBotomFormContent = [];

        if (this.oClientContext.navigationData.applicationInformation) {
            applicationType = this.oClientContext.navigationData.applicationInformation.applicationType;
            url = this.oClientContext.navigationData.applicationInformation.url;
            additionalInformation = this.oClientContext.navigationData.applicationInformation.additionalInformation;
        }
        aBotomFormContent.push(new sap.m.Text({text: this.translationBundle.getText("loginDetails")}).addStyleClass('sapUshellContactSupportHeaderInfoText'));
        aBotomFormContent.push(new sap.m.Label({text: this.translationBundle.getText("userFld")}));
        aBotomFormContent.push(new sap.m.Text({text: this.oClientContext.userDetails.fullName || ''}));
        aBotomFormContent.push(new sap.m.Label({text: this.translationBundle.getText("serverFld")}));
        aBotomFormContent.push(new sap.m.Text({text: window.location.host }));
        if (this.oClientContext.userDetails.eMail && this.oClientContext.userDetails.eMail !== '') {
            aBotomFormContent.push(new sap.m.Label({text: this.translationBundle.getText("eMailFld")}));
            aBotomFormContent.push(new sap.m.Text({text: this.oClientContext.userDetails.eMail || ''}));
        }
        aBotomFormContent.push(new sap.m.Label({text: this.translationBundle.getText("languageFld")}));
        aBotomFormContent.push(new sap.m.Text({text: this.oClientContext.userDetails.Language || ''}));

        if (this.oClientContext.shellState === "app" || this.oClientContext.shellState === "standalone") {
            //Required to align the following Text under the same column.
            aBotomFormContent.push(new sap.m.Text({text: ''}));
            aBotomFormContent.push(new sap.m.Text({text: this.translationBundle.getText("navigationDataFld")}).addStyleClass('sapUshellContactSupportHeaderInfoText'));
            aBotomFormContent.push(new sap.m.Label({text: this.translationBundle.getText("hashFld")}));
            aBotomFormContent.push(new sap.m.Text({text: this.oClientContext.navigationData.navigationHash || ''}));
            //Required to align the following Text under the same column.
            aBotomFormContent.push(new sap.m.Text({text: ''}));
            aBotomFormContent.push(new sap.m.Text({text: this.translationBundle.getText("applicationInformationFld")}).addStyleClass('sapUshellContactSupportHeaderInfoText'));
            aBotomFormContent.push(new sap.m.Label({text: this.translationBundle.getText("applicationTypeFld")}));
            aBotomFormContent.push(new sap.m.Text({text: applicationType}));
            aBotomFormContent.push(new sap.m.Label({text: this.translationBundle.getText("urlFld")}));
            aBotomFormContent.push(new sap.m.Text({text: url}));
            aBotomFormContent.push(new sap.m.Label({text: this.translationBundle.getText("additionalInfoFld")}));
            aBotomFormContent.push(new sap.m.Text({text: additionalInformation}));
        }
        this.oBottomSimpleForm = new sap.ui.layout.form.SimpleForm('technicalInfoBox', {
            layout: sap.ui.layout.form.SimpleFormLayout.ResponsiveLayout,
            content: aBotomFormContent
        }).addStyleClass("sapUshellTechnicalInfoBox");
        if (sap.ui.Device.os.ios && sap.ui.Device.system.phone) {
            this.oBottomSimpleForm.addStyleClass("sapUshellContactSupportFixWidth");
        }

        var originalAfterRenderSimpleForm = this.oBottomSimpleForm.onAfterRendering;
        this.oBottomSimpleForm.onAfterRendering = function () {
            originalAfterRenderSimpleForm.apply(this, arguments);
            var node = jQuery(this.getDomRef());
            node.attr("tabIndex", 0);
            jQuery.sap.delayedCall(700, node, function () {
                this.focus();
            });
        };

        this.oDialog.addContent(this.oBottomSimpleForm);
    };

    sap.ushell.ui.footerbar.ContactSupportButton.prototype.setEnabled = function (bEnabled) {
        if (!sap.ushell.Container) {
            if (this.getEnabled()) {
                jQuery.sap.log.warning(
                    "Disabling 'Contact Support' button: unified shell container not initialized",
                    null,
                    "sap.ushell.ui.footerbar.ContactSupportButton"
                );
            }
            bEnabled = false;
        }
        sap.m.Button.prototype.setEnabled.call(this, bEnabled);
    };
}());
