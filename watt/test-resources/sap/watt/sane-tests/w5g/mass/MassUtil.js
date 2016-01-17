define(["sap/watt/lib/lodash/lodash",
	"sap/watt/saptoolsets/fiori/editor/plugin/ui5wysiwygeditor/utils/W5gUtils"], function (_, w5gUtils) {
	"use strict";

	var sDefaultNamespace = 'sap.m';
	var aPrefixes = ['add', 'set', 'insert'];

	return {
		sOpenChevron: '<',
		sOpenChevronEnd: '</',
		sClosingChevron: '>\n\r',
		mNamespaces: {
			"sap.m.semantic": "sap.m.semantic",
			"sap.ui.unified": "unified",
			"sap.ui.core.mvc": "mvc",
			"sap.ui.core": "core",
			"sap.ui.layout.form": "f",
			"sap.ui.layout": "l",
			"sap.ui.table": "table",
			"sap.ui.commons": "commons",
			"sap.ui.ux3": "ux3",
			"sap.ushell.ui.footerbar": "footerbar",
			"sap.suite.ui.commons": "sCommons",
			"sap.uxap": "uxap"
		},

		/**
		 * Generates Random XML
		 * @param {Array<string>} aAllControlNames Array of control names
		 * @param {number} iControlsNumber How many controls on one view
		 * @return {string}
		 */
		generateXMLView: function (aAllControlNames, iControlsNumber) {
			var sViewContent = '';
			var sSetter = '';
			var that = this;
			jQuery.sap.require("sap.ui.core.util.serializer.Serializer");
			jQuery.sap.require("sap.ui.core.util.serializer.delegate.XML");
			var oDefaultNamespace = new sap.ui.core.util.serializer.delegate.XML(sDefaultNamespace);

			for (var i = 0; i < iControlsNumber; i++) {
				var oRandControl = this.getRandomControl(aAllControlNames, 'sap.ui.core.Control');
				var aAggregations = this.getControlAggregationsNames(oRandControl);
				for (var sAggName in aAggregations) {
					var oAggControl;
					jQuery.each(aPrefixes, function (idx, sPrefix) {
						sSetter = sPrefix + _.capitalize(sAggName);
						if (oRandControl[sSetter] && typeof oRandControl[sSetter] === 'function') {
							oAggControl = that.getRandomControl(aAllControlNames, aAggregations[sAggName].type);
							if (oAggControl) {
								try {
									oRandControl[sSetter](oAggControl);
								} catch (e) {
									console.log(e);
								}
							}
						}
					});
				}

				var sXMLRandControlWithAggregation = this.serialize(oRandControl, oDefaultNamespace);
				//namespaces replace
				sXMLRandControlWithAggregation = this.checkAndReplaceNamespaces(sXMLRandControlWithAggregation, this.mNamespaces);
				//collect controls into single XML
				sViewContent += sXMLRandControlWithAggregation + '\n\r';
			}
			var sNamespace = this.createNamespaces(this.mNamespaces);
			return this.wrapWithTag('mvc:View', sNamespace, sViewContent);
		},

		/**
		 * Serialization to XML string
		 * @param {object} oRandControl
		 * @param {object} oDefaultNamespace
		 * @return {string}
		 */
		serialize: function (oRandControl, oDefaultNamespace) {
			var oSerializer = new sap.ui.core.util.serializer.Serializer(oRandControl, oDefaultNamespace, false);
			return oSerializer.serialize();
		},

		/**
		 * create namespaces section in the XML
		 * @param {Object.<string, string>} mNamespaces
		 * @return {string}
		 */
		createNamespaces: function (mNamespaces) {
			var sResult = "xmlns=\"" + sDefaultNamespace + '\"';
			for (var value in mNamespaces) {
				sResult += ' xmlns:' + mNamespaces[value] + '=\"' + value + '\"';
			}
			return sResult;
		},

		/**
		 * Function changes long namespaces with shortcuts
		 * @param {string} sXML - XML string
		 * @param {Object.<string, string>} mNamespaces - map of namespaces
		 * @return {string}
		 */
		checkAndReplaceNamespaces: function (sXML, mNamespaces) {
			_.forEach(mNamespaces, function (sShort, sNamespace) {
				var re = new RegExp(sNamespace, 'g');
				sXML = sXML.replace(re, sShort);
			});
			return sXML;
		},

		/**
		 * Returns array of controls for specific aggregation type
		 * @param {Array<string>} aAllControlNames
		 * @param {string} sType
		 * @return {Array<sap.ui.core.Control>}
		 */
		getControlsForAggregationType: function (aAllControlNames, sType) {
			var aControls = [];
			aAllControlNames.forEach(function (sName) {

				if (w5gUtils.isBaseOf(sName, sType, window) && sName !== 'sap.ui.core.mvc.XMLView') {
					try {
						jQuery.sap.require(sName);
						var oControlClass = jQuery.sap.getObject(sName);
						var oControl = new oControlClass();
						aControls.push(oControl);
					} catch (e) {
						console.log(e);
					}
				}
			});
			return aControls;
		},

		/**
		 * Gets control from list of controls randomly by aggregation type
		 * @param {Array<string>} aAllControlNames - List of controls
		 * @param {string} sParentAggType - Aggregation type
		 * @return {sap.ui.core.Control} - Random Control for aggregation
		 */
		getRandomControl: function (aAllControlNames, sParentAggType) {
			var aAllControls = this.getControlsForAggregationType(aAllControlNames, sParentAggType);
			var index = Math.floor(Math.random() * aAllControls.length);
			return aAllControls[index];
		},

		/**
		 * <sTag sNameSpace>sBody</sTag>
		 * @param {string} sTag
		 * @param {string} sNameSpace
		 * @param {string} sBody
		 * @return {string}
		 */
		wrapWithTag: function (sTag, sNameSpace, sBody) {
			return this.addOpenChevrons(sTag, sNameSpace) + sBody + this.addCloseChevrons(sTag);
		},

		/**
		 * Get Control Aggregations Names
		 * @param {sap.ui.core.Control} oControl
		 * @return {Object.<string, object>}
		 */
		getControlAggregationsNames: function (oControl) {
			return oControl && oControl.getMetadata().getAggregations();
		},

		/**
		 * Wrap tag and namespaces with chevrons <sTag namespace>
		 * @param {string} sTag
		 * @param  {string} sNamespace
		 * @return {string}
		 */
		addOpenChevrons: function (sTag, sNamespace) {
			return sNamespace ?
			this.sOpenChevron + sTag + ' ' + sNamespace + this.sClosingChevron :
			this.sOpenChevron + sTag + this.sClosingChevron;
		},

		/**
		 * Wrap tag and namespaces with chevrons </sTag>
		 * @param {string} sTag
		 * @return {string}
		 */
		addCloseChevrons: function (sTag) {
			return this.sOpenChevronEnd + sTag + this.sClosingChevron;
		}
	};
});