define([], function() {
	"use strict";
	var _oRegexp = RegExp("^{(.+)>(.+)}$");

	/**
	 * I18n resource bundle (encapsulates the ui5 resource bundle)
	 */

	var oI18nBundle = function(mI18n) {
		this._sLocale = window.sap.watt.getLocale();
		this._defaultBundleName = "i18n";

		var mI18nBundles = {};
		// handle mI18nBundles is of type string -> create dummy entry with defaultBundleName
		if (typeof mI18n === "string") {
			mI18nBundles[this._defaultBundleName] = mI18n;
		} else {
			mI18nBundles = mI18n;
		}
		for ( var sName in mI18nBundles) {
			// for HANA XS the properties files have suffix hdbtextbundle
			var iIndex = mI18nBundles[sName].indexOf(".hdbtextbundle");
			var sType;
			if (iIndex > 0){
				sType = ".hdbtextbundle";
				mI18nBundles[sName] = mI18nBundles[sName].substr(0,iIndex);
			}else{
				sType = ".properties";
			}
			
			var aParts = /([^\/]*)\/(.*)/.exec(mI18nBundles[sName]); 
			mI18nBundles[sName] = sap.ui.resource(aParts[1], aParts[2] + sType);
		}

		this._mI18nBundles = mI18nBundles;
		this._aResourceBundles = {};
		this["locale"] = this._sLocale;
		this.bundles = mI18nBundles;
	};

	oI18nBundle.prototype = {};

	/**
	 * Gets the text from the resource bundle
	 * 
	 * @param {string} sBundle? the resource bundle name.<br>
	 * If the 2nd parameter 'sKey' is not provided the 1st parameter can either be the key with the default bundle ('i18n'),
	 * or the bracked notation {bundle>key}.
	 * @param {string}  sKey the key
	 * @param {string[]} aArgs? List of parameters which should replace the place holders "{n}" (n is the index) in the found locale-specific string value 
	 */
	oI18nBundle.prototype.getText = function(sBundle, sKey, aArgs) { //arguments can be 2(3): sBundle, sKey, optional aArgs
		// or 2(1): skey (then default bundle is used), optional aArgs
		// use dummy entry with defaultBundleName
		if (arguments.length === 1) {
			var arr = _oRegexp.exec(arguments[0]);
			if (arr) {
				sBundle = arr[1];
				sKey = arr[2];
			} else {
				sKey = arguments[0];
				sBundle = this._defaultBundleName;
			}
		} else if (arguments.length === 2) {
			if (Array.isArray(arguments[1])) {
				aArgs = arguments[1];
				sKey = arguments[0];
				sBundle = this._defaultBundleName;
			}
		}
		if (!(typeof sBundle === "string") && typeof sKey === "string" && (!aArgs || Array.isArray(aArgs))) {
			throw new Error("Wrong arguments");
		}
		if (!this._aResourceBundles[sBundle]) {
			var sUrl = this._mI18nBundles[sBundle];
			if (sUrl) {
				// require ui5 resource bundle
				jQuery.sap.require("jquery.sap.resources");
				this._aResourceBundles[sBundle] = jQuery.sap.resources({
					url : sUrl,
					locale : this._sLocale
				});
			} else {
				throw new Error("Error getting i18n resource bundle '" + sBundle + "'");
			}
		}
		return this._aResourceBundles[sBundle].getText(sKey, aArgs);
	};

	oI18nBundle.prototype.applyTo = function(aControls) {
		var mBundles = this._mI18nBundles;

		if (!jQuery.isArray(aControls)) {
			aControls = [aControls];
		}
		for ( var sBundle in mBundles) {
			var oModel = new sap.ui.model.resource.ResourceModel({
				bundleUrl : mBundles[sBundle],
				bundleLocale : this.locale
			});
			aControls.forEach(function(oControl) {
				oControl.setModel(oModel, sBundle);
			});
		}
	};

	return oI18nBundle;

});
