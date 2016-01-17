/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2013 SAP SE. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.watt.platform.plugin.qrcode.lib.QRCode.
jQuery.sap.declare("sap.watt.platform.plugin.qrcode.lib.QRCode");
//jQuery.sap.require("sap.watt.platform.plugin.qrcode.lib.library");
jQuery.sap.require("sap.ui.core.Control");


/**
 * Constructor for a new QRCode.
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
 * <ul>
 * <li>{@link #getValue value} : string (default: "")</li></ul>
 * <li>{@link #getIsURL isUrl} : boolean (default: false)</li></ul>
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
 * @param {string} [sId] id for the new control, generated automatically if no id is given
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * The QRCode Generator
 * @extends sap.ui.core.Control
 *
 * @author
 * @version 0.15.0-SNAPSHOT
 *
 * @constructor
 * @public
 * @name sap.watt.platform.plugin.qrcode.lib.QRCode
 */
sap.ui.core.Control.extend("sap.watt.platform.plugin.qrcode.lib.QRCode", {
	metadata: {

		// ---- object ----

		// ---- control specific ----
		library: "sap.watt.platform.plugin.qrcode.lib",
		properties: {
			"value": {type: "string", group: "Misc", defaultValue: ""},
			"isUrl": {type: "boolean", group: "Misc", defaultValue: false}
		}
	}
});


/**
 * Creates a new subclass of class sap.watt.platform.plugin.qrcode.lib.QRCode with name <code>sClassName</code>
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
 * @name sap.watt.platform.plugin.qrcode.lib.QRCode.extend
 * @function
 */


/**
 * Getter for property <code>value</code>.
 *
 *
 * Default value is <code>""</code>
 *
 * @return {sap.ui.core.URI} the value of property <code>value</code>
 * @public
 * @name sap.watt.platform.plugin.qrcode.lib.QRCode#getValue
 * @function
 */

/**
 * Setter for property <code>value</code>.
 *
 * Default value is <code>""</code>
 *
 * @param {sap.ui.core.URI} sValue  new value for property <code>value</code>
 * @return {sap.watt.platform.plugin.qrcode.lib.QRCode} <code>this</code> to allow method chaining
 * @public
 * @name sap.watt.platform.plugin.qrcode.lib.QRCode#setValue
 * @function
 */

sap.watt.platform.plugin.qrcode.lib.QRCode.prototype.init = function () {

};

sap.watt.platform.plugin.qrcode.lib.QRCode.prototype.onAfterRendering = function () {
	this.$().find("#qr-code").qrcode(this.getValue());
};

sap.watt.platform.plugin.qrcode.lib.QRCode.prototype.setValue = function (sValue) {
	var replaced;
	if (this.getIsUrl()) {
		sValue = this._fixURIIfRelative(sValue);
		replaced = sValue.replace(/\/\//g, "/").replace(/:\//g, "://");
	}
	else {
		replaced = sValue;
	}

	this.setProperty("value", replaced, false);
};

sap.watt.platform.plugin.qrcode.lib.QRCode.prototype.setIsUrl = function (sValue) {
	this.setProperty("isUrl", sValue, false);
	if (sValue) {
		this.setValue(this.getValue());
	}
};

sap.watt.platform.plugin.qrcode.lib.QRCode.prototype._fixURIIfRelative = function (sValue) {
	if (!sValue.match(/^https?:\/\//g)) { //If url is relative
		var link;
		if (sValue.match(/^\//g)) { //if the relative url start with '/'
			link = window.location.origin;
			return link + sValue;
		}
		else {
			var origin = window.location.origin;
			var path = window.location.pathname;
			path = path.substring(0, path.lastIndexOf("/"));
			link = origin + path;
			return link + "/" + sValue;
		}
	} else {
		return sValue;
	}
};