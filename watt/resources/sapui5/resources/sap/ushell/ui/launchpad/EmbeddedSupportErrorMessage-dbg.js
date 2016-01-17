/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.ushell.ui.launchpad.EmbeddedSupportErrorMessage.
jQuery.sap.declare("sap.ushell.ui.launchpad.EmbeddedSupportErrorMessage");
jQuery.sap.require("sap.ushell.library");
jQuery.sap.require("sap.m.Dialog");


/**
 * Constructor for a new ui/launchpad/EmbeddedSupportErrorMessage.
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
 * <ul>
 * <li>{@link sap.ushell.ui.launchpad.EmbeddedSupportErrorMessage#event:afterClose afterClose} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li></ul>
 * </li>
 * </ul> 
 *
 * 
 * In addition, all settings applicable to the base type {@link sap.m.Dialog#constructor sap.m.Dialog}
 * can be used as well.
 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * Add your documentation for the newui/launchpad/EmbeddedSupportErrorMessage
 * @extends sap.m.Dialog
 * @version 1.32.6
 *
 * @constructor
 * @public
 * @name sap.ushell.ui.launchpad.EmbeddedSupportErrorMessage
 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
 */
sap.m.Dialog.extend("sap.ushell.ui.launchpad.EmbeddedSupportErrorMessage", { metadata : {

	library : "sap.ushell",
	events : {
		"afterClose" : {}
	}
}});


/**
 * Creates a new subclass of class sap.ushell.ui.launchpad.EmbeddedSupportErrorMessage with name <code>sClassName</code> 
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
 * @name sap.ushell.ui.launchpad.EmbeddedSupportErrorMessage.extend
 * @function
 */

sap.ushell.ui.launchpad.EmbeddedSupportErrorMessage.M_EVENTS = {'afterClose':'afterClose'};


/**
 *
 * @name sap.ushell.ui.launchpad.EmbeddedSupportErrorMessage#afterClose
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'afterClose' event of this <code>sap.ushell.ui.launchpad.EmbeddedSupportErrorMessage</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.ushell.ui.launchpad.EmbeddedSupportErrorMessage</code>.<br/> itself. 
 *  
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.ushell.ui.launchpad.EmbeddedSupportErrorMessage</code>.<br/> itself.
 *
 * @return {sap.ushell.ui.launchpad.EmbeddedSupportErrorMessage} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.EmbeddedSupportErrorMessage#attachAfterClose
 * @function
 */

/**
 * Detach event handler <code>fnFunction</code> from the 'afterClose' event of this <code>sap.ushell.ui.launchpad.EmbeddedSupportErrorMessage</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.ushell.ui.launchpad.EmbeddedSupportErrorMessage} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.EmbeddedSupportErrorMessage#detachAfterClose
 * @function
 */

/**
 * Fire event afterClose to attached listeners.
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.ushell.ui.launchpad.EmbeddedSupportErrorMessage} <code>this</code> to allow method chaining
 * @protected
 * @name sap.ushell.ui.launchpad.EmbeddedSupportErrorMessage#fireAfterClose
 * @function
 */

// Start of sap/ushell/ui/launchpad/EmbeddedSupportErrorMessage.js
(function () {
    "use strict";
    /*global jQuery, sap, navigator*/

    jQuery.sap.require("sap.m.Dialog");
    jQuery.sap.require("sap.m.Button");
    jQuery.sap.require("sap.ushell.resources");

    jQuery.sap.declare("sap.ushell.ui.launchpad.EmbeddedSupportErrorMessage");

    /**
     * EmbeddedSupportErrorMessage
     *
     * @name sap.ushell.ui.launchpad.EmbeddedSupportErrorMessage
     * @private
     * @since 1.20.0
     */

    sap.ushell.ui.launchpad.EmbeddedSupportErrorMessage.prototype.open = function () {
        var oContactSupportButton,
            oCloseButton;

        this.translationBundle = sap.ushell.resources.i18n;
        oContactSupportButton = new sap.m.Button({
            id : sap.ui.core.ElementMetadata.uid("supportBtn"),
            text : this.translationBundle.getText("contactSupportBtn"),
            press : function () {
                this.close();
                jQuery.sap.require("sap.ushell.ui.footerbar.ContactSupportButton");
                this.oContactSupport = new sap.ushell.ui.footerbar.ContactSupportButton(
                    "ContactSupportErrorMsg",{
                        visible : true
                    });
                if (this.oContactSupport) {
                    this.oContactSupport.showContactSupportDialog();
                    //oContactSupport is redundant after creation of the Contact Support Dialog.
                    this.oContactSupport.destroy();
                }
            }.bind(this)
        });
        oCloseButton = new sap.m.Button({
            id : sap.ui.core.ElementMetadata.uid("closeBtn"),
            text : this.translationBundle.getText("close"),
            press : function () {
                this.close();
            }.bind(this)
        });

        this.setType(sap.m.DialogType.Message);
        this.setIcon('sap-icon://alert');
        this.setRightButton(oCloseButton);
        this.setLeftButton(oContactSupportButton);
        this._addStyleClassToContent();
        this.addStyleClass('sapMMessageBoxError');
        this.attachAfterClose(function () {
            this.destroy();
        }.bind(this));

        //call the parent sap.m.Dialog open method
        if (sap.m.Dialog.prototype.open) {
            sap.m.Dialog.prototype.open.apply(this, arguments);
        }
    };

    sap.ushell.ui.launchpad.EmbeddedSupportErrorMessage.prototype._addStyleClassToContent = function () {
        var aContent = this.getContent(),
            oCurrentContent,
            index;

        for (index in aContent){
            oCurrentContent = aContent[index];
            if (oCurrentContent.getMetadata().getName() === "sap.m.Text" && !oCurrentContent.aCustomStyleClasses){
                oCurrentContent.addStyleClass("sapMMsgBoxText");
            }
        }
    };
}());
