define(
	[
		"sap/watt/lib/lodash/lodash",
		"./UsageMonitoringUtils",
		"./ControlMetadata"
	],
	function (_, UsageMonitoringUtils, ControlMetadata) {
		"use strict";

		jQuery.sap.require("sap.ui.commons.RichTooltip");

// Private variables and methods
// Begin
		var
			/**
			 * i18n service object
			 *
			 * @type {object}
			 * @private
			 */
			_oI18nService = null,

			/**
			 * Absolute path to WYSIWYG css images folder
			 *
			 * @type {string}
			 * @private
			 */
			_sCssImagesPath = "",

			/**
			 * A map represents composite controls
			 *
			 * @dict
			 * @private
			 */
			COMPOSITE_CONTROLS = {
				"sap.m.ObjectHeader": true,
				"sap.m.ObjectIdentifier": true,
				"sap.m.ObjectNumber": true,
				"sap.m.ObjectListItem": true,
				"sap.m.FeedListItem": true,
				"sap.m.DisplayListItem": true,
				"sap.m.StandardListItem": true
			};


		/**
		 * Gets the last segment (after the last dot) of the given name
		 *
		 * @param {string} sName
		 * @return {string}
		 *
		 * @private
		 */
		function _getPartName(sName) {
			var aSplit = (sName || "").split(".");
			return aSplit[aSplit.length - 1];
		}
// End
// Private variables and methods

		/**
		 * WYSIWYG utilities
		 *
		 * @type {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gUtils}
		 */
		var W5gUtils = {
			/**
			 * Initializes W5gUtils
			 *
			 * @param {object} oContext context.service object
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gUtils.init
			 * @function
			 * @public
			 */
			init: _.once(function (oContext) {
				jQuery.sap.assert(oContext, "oContext must be a valid service context");
				_oI18nService = _.get(oContext, "i18n");
				jQuery.sap.assert(_oI18nService, "i18n service does not exists in the given context");
			}),

			/**
			 * Gets ui5 'fakeOS' url param for the given <code>sDevice</code> device
			 *
			 * @param {string} sDevice Device name
			 * @return {string} Returns fakeOs url param
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gUtils#getFakeOsUrlParam
			 * @function
			 * @public
			 */
			getFakeOsUrlParam: function (sDevice) {
				switch (sDevice) {
					case "phone":
						return "&sap-ui-xx-fakeOS=iphone";
					case "tablet":
						return "&sap-ui-xx-fakeOS=ipad";
					default: //desktop
						return "";
				}
			},

			/**
			 * Gets the absolute path to the wysiwyg css images folder
			 *
			 * @return {string} Returns the absolute path to the css images folder
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gUtils#getCssImagesFolderPath
			 * @function
			 * @public
			 */
			getCssImagesFolderPath: function () {
				if (!_sCssImagesPath) {
					_sCssImagesPath = require.toUrl("sap/watt/saptoolsets/fiori/editor/plugin/ui5wysiwygeditor/styles/images/");
				}
				return _sCssImagesPath;
			},

			/**
			 * Gets id for design time css file
			 *
			 * @param {string} sCssFileName
			 * @return {string}
			 */
			getDesignTimeCssId: function(sCssFileName) {
				jQuery.sap.assert(/\.css$/.test(sCssFileName), "wrong css file name");
				return "w5g-" + sCssFileName.slice(0, -4).replace(/\./, "-").toLowerCase(); //remove .css
			},

			/**
			 * Gets the class name of the given <code>oControl</code> control
			 *
			 * @param {sap.ui.core.Control} oControl control
			 * @returns {string} Control name
			 *
			 * @name _getControlName
			 * @function
			 * @private
			 */
			getControlName: function (oControl) {
				return oControl && oControl.getMetadata().getName() || "";
			},

			/**
			 * Returns true if the context menu is going to be opened on a selected control.
			 * For certain controls such as unsupported, fragments, List the selection might be on the container but
			 * the real control being clicked on is its child.
			 *
			 * @param {sap.ui.core.Control} oControl - the overlay control that was being clicked on to open the context menu
			 * @param {sap.ui.core.Control} oSelectedControl - the selected control in the document
			 * @returns {Boolean}
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gUtils#isControlOrParentSelected
			 * @function
			 * @public
			 */
			isControlOrParentSelected: function (oControl, oSelectedControl) {
				if (!oControl || !oSelectedControl) {
					return false;
				}
				else if (oControl && oSelectedControl && oControl.getId() === oSelectedControl.getId()) {
					return true;
				}
				else {
					return W5gUtils.isControlOrParentSelected(W5gUtils.getWYSIWYGParent(oControl), oSelectedControl);
				}
			},

			/**
			 * Checks whether the given value can be interpreted as a binding info
			 *
			 * @param {object} oValue the value
			 * @return {boolean} Returns true if given <code>oValue</code> value an be interpreted as a binding info,
			 * false otherwise
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gUtils#isBindingValue
			 * @function
			 * @public
			 */
			isBindingValue: function (oValue) {
				return (typeof oValue === "string") && jQuery.sap.startsWith(oValue, "{") && jQuery.sap.endsWith(oValue, "}");
			},

			/**
			 * Get the file full path from module path
			 *
			 * @param {string} sDocModulePath
			 * @returns {string}
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gUtils#getDocFullPathFromModulePath
			 * @function
			 * @public
			 */
			getFileFullPathFromModulePath: function (sDocModulePath) {
				var sFile = "/file/", sTempPath, sDocPath = sDocModulePath, indexOfFile = sDocModulePath.indexOf(sFile);

				if (indexOfFile !== -1) {
					sTempPath = sDocModulePath.substring(sDocModulePath.indexOf(sFile) + sFile.length);
					sDocPath = sTempPath.substring(sTempPath.indexOf("/") + 1).replace(/\.\//g, "");

					if (!_.startsWith(sDocPath, "/")) {
						sDocPath = "/" + sDocPath;
					}
				}
				return sDocPath;
			},

			/**
			 * Returns a full file path of a controller by its view document
			 *
			 * @param {sap.ui.core.mvc.View} oView - the view control
			 * @param {Window} oWindow
			 * @returns {string} - the full file path that represent the controller path
			 *
			 * @name sap.watt.common.plugin.ui5wysiwygeditor.utils.W5gUtils#getControllerPathByView
			 * @function
			 * @public
			 */
			getControllerPathByView: function (oView, oWindow) {
				var sCtrlName = oView.getControllerName();
				if(!sCtrlName) {
					return "";
				}
				var sControllerPath = oWindow.jQuery.sap.getModulePath(sCtrlName , '.controller.js');
				return W5gUtils.getFileFullPathFromModulePath(sControllerPath);
			},


			/**
			 * Returns a full file path of a fragment or sub view control
			 * e.g. for oControl fragment called nw.epm.refapps.ext.shop.view.fragment.ProductImage returns: /nw.epm.refapps.ext.shop/view/fragment/ProductImage.fragment.xml
			 *
			 * @param {sap.ui.core.Control} oControl - the control
			 * @param {Window} oWindow
			 * @returns {string} - the full file path that represent the given oControl
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gUtils#getFilePathByControl
			 * @function
			 * @public
			 */
			getFilePathByControl: function (oControl, oWindow) {
				var sSelectedControlFullName, sSuffix, sDocModulePath;

				if (W5gUtils.isControlFragment(oControl)) {
					sSelectedControlFullName = oControl.__FragmentName;
					sSuffix = ".fragment.xml";
				}
				else if (W5gUtils.isControlSubView(oControl)) {
					sSelectedControlFullName = oControl.getViewName();
					sSuffix = ".view.xml";
				}
				else { //No meaning of file path for control that is not a fragment or a sub view
					return "";
				}

				sDocModulePath = oWindow.jQuery.sap.getModulePath(sSelectedControlFullName, sSuffix);
				return W5gUtils.getFileFullPathFromModulePath(sDocModulePath);
			},


			/**
			 * Returns true if the control is a sub view and false otherwise
			 *
			 * @param {sap.ui.core.Control} oControl - the control
			 * @returns {boolean}
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gUtils#isControlSubView
			 * @function
			 * @public
			 */
			isControlSubView: function (oControl) {
				return (oControl && oControl.getMetadata().getName() === "sap.ui.core.mvc.XMLView" &&
				oControl.getParent() && oControl.getParent().getMetadata().getName() !== "sap.ui.core.UIArea");
			},

			/**
			 * Gets window object based on control dom ref
			 *
			 * @param {sap.ui.core.Element} oElement element
			 * @return {Window} window object
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gUtils#getWindowFor
			 * @function
			 * @public
			 */
			getWindowFor: function (oElement) {
				var oElem = oElement,
					oDomRef = oElem.getDomRef();
				while (oElem && !oDomRef) {
					oElem = oElem.getParent();
					oDomRef = oElem && oElem.getDomRef && oElem.getDomRef();
				}
				if (!oDomRef) {
					return null;
				}
				var oDocument = oDomRef.ownerDocument;
				return oDocument.defaultView || oDocument.parentWindow;
			},

			/**
			 * Gets control overlay
			 *
			 * @param {sap.ui.core.Control} oControl control
			 * @param {oWindow=} oWindow window object
			 * @return {sap.ui.dt.Overlay} control overlay if any
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gUtils#getControlOverlay
			 * @function
			 * @public
			 */
			getControlOverlay: function (oControl, oWindow) {
				if (!oControl) {
					return null;
				}
				if (!oWindow) {
					oWindow = W5gUtils.getWindowFor(oControl);
				}
				var oOverlayRegistry = _.get(oWindow, "sap.ui.dt.OverlayRegistry");
				return oOverlayRegistry && oOverlayRegistry.getOverlay(oControl);
			},

			/**
			 * Returns true if the given <code>oControl</code> is a fragment and false otherwise
			 *
			 * @param {sap.ui.core.Control} oControl control
			 * @returns {boolean} returns true if the given control is a fragment
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gUtils#isControlFragment
			 * @function
			 * @public
			 */
			isControlFragment: function (oControl) {
				return Boolean(oControl && oControl.__FragmentName);
			},

			/**
			 * Returns true if the given <code>oControl</code> or at least one of control ancestors matches the test criteria.
			 * If <code>bSkipControl</code> is set to true - the control will be excluded from the check
			 *
			 * @param {sap.ui.core.Control} oControl control to check
			 * @param {Array<function>|function} vCheckList the function or array of functions used for check matching criteria.
			 * @param {object=} oWindow window object
			 * @param {boolean=} bSkipControl Whether to exclude the control from the check
			 * @return {boolean} Returns true if the given <code>oControl</code> or at least one of control ancestors matches the test criteria.
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gUtils#testAncestors
			 * @function
			 * @public
			 */
			testAncestors: function (oControl, vCheckList, oWindow, bSkipControl) {
				function test(oCtrl) {
					var bRes = false;
					_.each(vCheckList, function (fnTest) {
						if (fnTest(oCtrl)) {
							bRes = true;
							return false;
						}
					});
					return bRes;
				}

				if (!vCheckList) { //nothing to check
					return false;
				}
				if (!jQuery.isArray(vCheckList)) { //making test case array
					vCheckList = [vCheckList];
				}
				for (var iIndex = vCheckList.length - 1; iIndex >= 0; iIndex--) {
					var fnTest = vCheckList[iIndex];
					if (!(typeof fnTest === "function")) { //remove bad test case
						vCheckList.splice(iIndex, 1);
					}
				}
				if (!vCheckList.length) { //nothing to check
					return false;
				}
				if (arguments.length === 3) {
					if (typeof oWindow === "boolean") {
						bSkipControl = oWindow;
						oWindow = undefined;
					}
				}

				if (!bSkipControl) {
					if (test(oControl)) {
						return true;
					}
				}

				var oParent = W5gUtils.getWYSIWYGParent(oControl, oWindow);
				while (oParent) {
					if (test(oParent)) {
						return true;
					}
					oParent = W5gUtils.getWYSIWYGParent(oParent, oWindow);
				}
				return false;
			},

			/**
			 * Determines if the control displays several properties that cannot be changed from the canvas
			 *
			 * @param {sap.ui.core.Control} oControl control
			 * @return {boolean} Returns true if this control is composite and includes several properties on the canvas
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gUtils#isCompositeControl
			 * @function
			 * @public
			 */
			isCompositeControl: function (oControl) {
				return Boolean(oControl) && !!COMPOSITE_CONTROLS[oControl.getMetadata().getName()];
			},

			/**
			 * Determines if the control is a nested view
			 *
			 * @param {sap.ui.core.Control} oControl control
			 * @return {boolean} Returns true if this control is a nested view
			 *
			 * @name isNestedView
			 * @function
			 * @public
			 */
			isNestedView: function (oControl) {
				return !!(oControl && oControl.getParent() &&
				oControl.getMetadata().getName() === "sap.ui.core.mvc.XMLView" &&
				oControl.getParent().getMetadata().getName() !== "sap.ui.core.UIArea");
			},

			/**
			 * Returns true if the given <code>oControl</code> is a template and false otherwise
			 *
			 * @param {sap.ui.core.Control} oControl control
			 * @param {Window=} oWindow window object
			 * @returns {boolean} returns true if the control is a template
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gUtils#isControlTemplate
			 * @function
			 * @public
			 */
			isControlTemplate: function (oControl, oWindow) {
				var oInfo = W5gUtils.getWYSIWYGParentAggregationInfo(oControl, oWindow);
				return !!(oInfo.parent && oInfo.parent.getBindingInfo(oInfo.aggregationName));
			},

			/**
			 * Gets the pair of UI5 parent and its aggregation name for the given <code>oControl</code> control
			 *
			 * @param {sap.ui.core.Control} oControl control
			 * @param {oWindow=} oWindow window object
			 * @return {map<string, !sap.ui.core.Control>} returns UI5 API's parent and its aggregation name for the given control
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gUtils#getWYSIWYGParentAggregationInfo
			 * @function
			 * @public
			 */
			getWYSIWYGParentAggregationInfo: function (oControl, oWindow) {
				if (oControl) {
					var /** sap.ui.dt.Overlay */ oOverlay = W5gUtils.getControlOverlay(oControl, oWindow),
						/** sap.ui.dt.AggregationOverlay */ oParentAggregationOverlay = oOverlay && oOverlay.getParentAggregationOverlay();
					if (oParentAggregationOverlay) {
						return {
							parent: oParentAggregationOverlay.getElementInstance(),
							aggregationName: oParentAggregationOverlay.getAggregationName()
						};
					}
				}
				return {
					parent: null,
					aggregationName: null
				};
			},

			/**
			 * Removes the given control from its parent aggregation and destroy it.
			 * Updates the parent's 'selected' properties if any
			 *
			 * @param {sap.ui.core.Control} oControl control
			 * @param {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.serialization.XMLManipulator} oXmlManipulator
			 * @param {boolean} bResetSelected whether to clear all 'selected' properties or aggregations of control's parent
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gUtils#removeControl
			 * @function
			 * @public
			 */
			removeControl: function(oControl, oXmlManipulator, bResetSelected) {
				var oInfo = W5gUtils.getWYSIWYGParentAggregationInfo(oControl),
					oParent = oInfo.parent,
					oAggregation, oXMLNode, oNode, sValue, aAttributes, iIndex;

				oXmlManipulator.emitHideEvent(oControl);
				if (oParent) {
					oAggregation = oParent.getMetadata().getAggregation(oInfo.aggregationName);
					if (oAggregation.multiple) {
						oParent[oAggregation._sRemoveMutator](oControl);
					} else {
						oParent[oAggregation._sMutator](null);
					}
				}
				oControl.destroy();

				if (oParent) {
					oXMLNode = oParent.__XMLNode || {};
					aAttributes = oXMLNode.attributes || [];
					for (iIndex = aAttributes.length - 1; iIndex >= 0; iIndex--) {
						oNode = aAttributes[iIndex];
						if (/^selected/.test(oNode.name) && !W5gUtils.isBindingValue(oNode.value)) {
							sValue = bResetSelected ? undefined : W5gUtils.getPropertyOrAssociationValue(oParent, oNode.name) + "";
							if (oNode.value !== sValue) {
								oXmlManipulator.emitPropertyChangeEvent(oParent, oNode.name, sValue);
							}
						}
					}
				}
			},

			/**
			 * Removes the given control from its parent aggregation and destroys it
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gUtils#removeControl
			 * @function
			 * @public
			 */
			destroyControl: function(oControl) {
				var oInfo = W5gUtils.getWYSIWYGParentAggregationInfo(oControl),
					oParent = oInfo.parent,
					oAggregation;

				if (oParent) {
					oAggregation = oParent.getMetadata().getAggregation(oInfo.aggregationName);
					if (oAggregation.multiple) {
						oParent[oAggregation._sRemoveMutator](oControl);
					} else {
						oParent[oAggregation._sMutator](null);
					}
				}
				oControl.destroy();
			},

			/**
			 * Gets property or association value by the given <code>sPropertyOrAssociationName</code> name
			 *
			 * @param {sap.ui.core.Control} oControl control
			 * @param {string} sPropertyOrAssociationName property or association name
			 * @return {*}
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gUtils#getPropertyOrAssociationValue
			 * @function
			 * @public
			 */
			getPropertyOrAssociationValue: function(oControl, sPropertyOrAssociationName) {
				var oMetadata = oControl.getMetadata(),
					oInfo = oMetadata.getAllProperties();
				if (oInfo[sPropertyOrAssociationName]) {
					return oControl[oInfo[sPropertyOrAssociationName]._sGetter]();
				}
				oInfo = oMetadata.getAllAssociations();
				if (oInfo[sPropertyOrAssociationName]) {
					return oControl[oInfo[sPropertyOrAssociationName]._sGetter]();
				}
				return null;
			},

			/**
			 * Gets the UI5 parent of the given <code>oControl</code> control
			 *
			 * @param {sap.ui.core.Control} oControl control
			 * @param {oWindow=} oWindow window object
			 * @return {*}
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gUtils#getWYSIWYGParent
			 * @function
			 * @public
			 */
			getWYSIWYGParent: function (oControl, oWindow) {
				var /** sap.ui.dt.Overlay */ oOverlay = W5gUtils.getControlOverlay(oControl, oWindow),
					/** sap.ui.dt.AggregationOverlay */ oParentAggregationOverlay = oOverlay && oOverlay.getParentAggregationOverlay();
				if (oParentAggregationOverlay) {
					return oParentAggregationOverlay.getElementInstance();
				}
				return null;
			},

			/**
			 * Finds the template that the given <code>oControl</code> is cloned from for design time UI5 controls (iframe only)
			 *
			 * @param {sap.ui.core.Control} oControl control
			 * @returns {sap.ui.core.Control}
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gUtils#getControlTemplate
			 * @function
			 * @public
			 */
			getControlTemplate: function (oControl) {
				var oParentAggregationInfo = W5gUtils.getWYSIWYGParentAggregationInfo(oControl),
					oParent = oParentAggregationInfo.parent,
					sParentAggregationName = oParentAggregationInfo.aggregationName;
				if (!sParentAggregationName || !oParent) {
					return null;
				}
				var mBindingInfos = oParent.mBindingInfos;
				var mBindingInfo = mBindingInfos[sParentAggregationName];
				if (mBindingInfo) {
					if (mBindingInfo.parts) {
						mBindingInfo = mBindingInfo.parts[0];
					}
					return mBindingInfo.template;
				}
				return null;
			},

			/**
			 * Returns the xml node for the given <code>oControl</code>
			 *
			 * @param {sap.ui.core.Control} oControl control
			 * @returns {Element}
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gUtils#getXMLNode
			 * @function
			 * @public
			 */
			getXMLNode: function (oControl) {
				return oControl.__XMLNode || (W5gUtils.getControlTemplate(oControl) || {}).__XMLNode;
			},

			/**
			 * Returns the xml root node for the given <code>oControl</code>
			 *
			 * @param {sap.ui.core.Control} oControl control
			 * @returns {Element}
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gUtils#getXMLRootNode
			 * @function
			 * @public
			 */
			getXMLRootNode: function (oControl) {
				return oControl.__XMLRootNode || (W5gUtils.getControlTemplate(oControl) || {}).__XMLRootNode;
			},

			/**
			 * Returns true if given <code>oControl</code> is selectable in w5g canvas and false otherwise
			 *
			 * @param {sap.ui.core.Control} oControl control
			 * @param {Window=} oWindow
			 * @returns {boolean}
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gUtils#isControlSelectable
			 * @function
			 * @public
			 */
			isControlSelectable: function (oControl, oWindow) {
				var oOverlay = W5gUtils.getControlOverlay(oControl, oWindow);
				return oOverlay && oOverlay.isSelectable() || false;
			},

			/**
			 * Destroy private aggregations of the function's context control (<code>this</code>).
			 *
			 * @this {sap.ui.core.Control}
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gUtils#destroyPrivateAggregations
			 * @function
			 * @public
			 */
			destroyPrivateAggregations: function () {
				var oControl = this;

				if (oControl instanceof sap.ui.core.Control) {
					jQuery.each(oControl.getMetadata().getAllPrivateAggregations(), function () {
						var oAggregation = oControl.getAggregation(this.name);
						if (oAggregation) {
							oAggregation.destroy();
						}
					});
				}
			},

			/**
			 * Add a placeholder to sap.ui.commons.SearchField
			 * Note: this function manipulates the DOM. This is a workaround since a place holder for SearchField is not
			 * supported in SAP UI5 because of IE9 support. Web-IDE supports IE starting at IE10 and therefore we do
			 * this workaround.
			 *
			 * @param {sap.ui.commons.SearchField} oSearchField search field
			 * @param {string} sPlaceHolder placeholder's i18n key
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gUtils#addPlaceHolderToSearchField
			 * @function
			 * @public
			 */
			addPlaceHolderToSearchField: function (oSearchField, sPlaceHolder) {
				if (oSearchField) {
					oSearchField.$().find("input").attr("placeholder", W5gUtils.getText(sPlaceHolder || ""));
				}
			},

			/**
			 * Returns human readable representation of title of <code>oControl</code>
			 *
			 * @param {sap.ui.core.Control|string} oControl control or its name
			 * @returns {string} Returns control' title
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gUtils#getControlTitle
			 * @function
			 * @public
			 */
			getControlTitle: function (oControl) {
				if (!oControl) {
					return undefined;
				}
				var sName = oControl;
				if (typeof oControl !== "string") {
					if (W5gUtils.isControlFragment(oControl)) {
						return "Fragment";
					}
					sName = ControlMetadata.getDesignTimeData(oControl).name || oControl.getMetadata().getName();
				}

				sName = sName.substring(sName.lastIndexOf(".") + 1);
				if (sName === 'HBox' || sName === 'VBox') {
					return sName;
				}
				return _.startCase(sName);
			},

			/**
			 * Gets the current selected control and calls the "deleteControlWithConfirmationDialog",
			 * that performs all the checks and if needed, raise the delete confirmation dialog
			 *
			 * @param {object} oContext service context
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gUtils#deleteControlWithConfirmationDialog
			 * @function
			 * @public
			 */

			deleteControlWithConfirmationDialog_aux: function (oContext) {
				return Q.all([
					oContext.service.ui5wysiwygeditor.getCurrentSelectedControl(),
					oContext.service.ui5wysiwygeditor.getRoot()
				]).spread(function (oControl, oRoot) {
					if (oControl === oRoot) {
						return {
							bResult: false,
							sResult: "CANCEL"
						};
					}
					return W5gUtils.deleteControlWithConfirmationDialog(oControl, oContext);
				});
			},

			/**
			 * Checks if the given <code>oControl</code> contains content or not.
			 * This check is make in order to decide if need to raise a delete confirmation dialog
			 *
			 * @param {sap.ui.core.Control} oControl control
			 * @param {object} oContext service context
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gUtils#deleteControlWithConfirmationDialog
			 * @function
			 * @public
			 */
			deleteControlWithConfirmationDialog: function (oControl, oContext) {
				jQuery.sap.require("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.Utils");
				var oUtils = sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.Utils,
					aFilter = oUtils.getAggregationFilter() || [],
					oContent = _.find(oControl.getMetadata().getAllAggregations(), function (oAggregation, sName) {
						return aFilter.indexOf(sName) === -1 && oUtils.getAggregationByName(oControl, sName).length;
					});

				if (oContent) {
					var confirmYesNoPromise = oContext.service.usernotification.confirmYesNo(
						W5gUtils.getText("editor_delete_control_confirm_message", [W5gUtils.getControlTitle(oControl)])
					);
					confirmYesNoPromise.then(function (oReturn) {
						if (oReturn.bResult) {
							UsageMonitoringUtils.report("delete_confirm_OK", oControl.getMetadata().getName());
						} else {
							UsageMonitoringUtils.report("delete_confirm_CANCEL", oControl.getMetadata().getName());
						}
					}).done();
					return confirmYesNoPromise;
				}
				return {
					bResult: true,
					sResult: "YES"
				};
			},

			/**
			 * Gets the text from the resource bundle
			 *
			 * @param {string} sKey the key
			 * @param {string[]=} aArgs List of parameters which should replace the place holders "{n}"
			 * (n is the index) in the found locale-specific string value
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gUtils#getText
			 * @function
			 * @public
			 */
			getText: function (sKey, aArgs) {
				jQuery.sap.assert(_oI18nService, "W5gUtils is not initialized");
				return _oI18nService ? _oI18nService.getText.apply(_oI18nService, arguments) : sKey;
			},

			/**
			 * Applies resource bundle to the given <code>aControls</code> controls
			 *
			 * @param {Array<sap.ui.core.Control>} aControls controls list
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gUtils#applyBundleTo
			 * @function
			 * @public
			 */
			applyBundleTo: function(aControls) {
				jQuery.sap.assert(_oI18nService, "W5gUtils is not initialized");
				_oI18nService && _oI18nService.applyTo.apply(_oI18nService, arguments);
			},

			/**
			 * Finds the n-th tag on the original string based on the result of getElementsByTagName.
			 * Then calculate the start and end row/column numbers based on its offset.
			 *
			 * @param {Element} oXMLNode
			 * @param {Element} oXMLRootNode
			 * @param {string} sContent
			 * @returns {{start: {row: number, column: number}, end: {row: number, column: number}}}
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gUtils#xmlNodeToSourceRange
			 * @function
			 * @public
			 */
			xmlNodeToSourceRange: function (oXMLNode, oXMLRootNode, sContent) {
				/**
				 * @param {number} iOffset
				 * @return {{row: number, column: number}}
				 */
				function getRowAndColumnFromOffset(iOffset) {
					var sSub = sContent.substr(0, iOffset);
					var iLineNumber = _.filter(sSub, function (c) {
						return c === '\n';
					}).length;
					var iLastNewLineOffset = sSub.lastIndexOf('\n');
					return ({row: iLineNumber, column: iOffset - iLastNewLineOffset - 1});
				}

				var oDefaultReturnVal = {start: {row: 0, column: 0}, end: {row: 0, column: 0}};
				if (!oXMLNode || !oXMLRootNode) {
					return oDefaultReturnVal;
				}

				var sAllowedTagCharacters = "\\w\\.-",
					sAllowedWhitespaces = "^" + sAllowedTagCharacters,
					sAllowedMultilineContent = "((.|\\n)*?)";  //any character + carriage returns + new lines

				var oTagRegex = new RegExp("([" + sAllowedTagCharacters + "]+:)?([" + sAllowedTagCharacters + "]+)", 'g');

				var sTagName = oXMLNode.tagName,
					sShortTag = oTagRegex.exec(sTagName)[2],
					sOpeningTagPattern = "<" + sTagName + "[" + sAllowedWhitespaces + "]",
					sClosingTagPattern =
						// long closing
						"[" + sAllowedWhitespaces + "]" + sAllowedMultilineContent + "\/" + sTagName + ">"
						+ "|" +
						// short closing
						"<" + sTagName + "[" + sAllowedWhitespaces + "]" + sAllowedMultilineContent + "\/>",
					/** RegExp */ rOpeningTagRegex = new RegExp(sOpeningTagPattern, 'g'),
					iGlobalTagStart = 0,
					iLocationOfNextOpenTag, iNumberOfOpenedTagsSeen, iLocationOfNextCloseTag, iCurrentLocation;

				try {
					_.find(oXMLRootNode.getElementsByTagName(sShortTag), function (oNode) {
						// the regex we run on the code is for the tag short name and its namespace
						if (oNode.tagName === sTagName) {
							iGlobalTagStart = rOpeningTagRegex.exec(sContent).index;
							return (oNode === oXMLNode);
						}
					});
					iNumberOfOpenedTagsSeen = 1;
					iCurrentLocation = iLocationOfNextCloseTag = iGlobalTagStart;
					// reset without global flag to search each iteration from scratch
					rOpeningTagRegex = new RegExp(sOpeningTagPattern);
					while (iNumberOfOpenedTagsSeen > 0) {
						// search open tag beside the current one
						var openExecResult = rOpeningTagRegex.exec(sContent.substring(iCurrentLocation + 1, sContent.length));
						iLocationOfNextOpenTag = openExecResult ? openExecResult.index + iCurrentLocation + 1 : -1;
						// search close tag including the current one to cover a case where the open is also close
						var closeExecResult = (new RegExp(sClosingTagPattern)).exec(sContent.substring(iCurrentLocation, sContent.length));
						iLocationOfNextCloseTag = closeExecResult.index + closeExecResult[0].length + iCurrentLocation;
						if (iLocationOfNextOpenTag === -1 || iLocationOfNextOpenTag > iLocationOfNextCloseTag) {
							iNumberOfOpenedTagsSeen--;
							iCurrentLocation = iLocationOfNextCloseTag;
						} else {
							iCurrentLocation = iLocationOfNextOpenTag + 1;
							if (iLocationOfNextOpenTag < iLocationOfNextCloseTag) {
								iNumberOfOpenedTagsSeen++;
							}
						}
						// if they are equal, ignore them
					}
					var start = getRowAndColumnFromOffset(iGlobalTagStart);
					var end = getRowAndColumnFromOffset(iLocationOfNextCloseTag);
					return {start: start, end: end};
				} catch (e) {
					jQuery.sap.log.error(e);
					return oDefaultReturnVal;
				}
			},

			/**
			 * Opens in Layout Editor the given view from the given project
			 *
			 * @param {string} sProjectName - the project name
			 * @param {string} sViewName - the view name located in the given projectName
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gUtils#openViewFromProject
			 * @function
			 * @public
			 */
			openViewFromProject: function (oContext, sProjectName, sViewName) {
				var oService = oContext.service, sFilePath;

				sFilePath = "/" + sProjectName + "/view/" + sViewName + ".view.xml";

				return oService.document.getDocumentByPath(sFilePath)
					.then(function (oDocument) {
						return oService.repositorybrowser.setSelection(oDocument, true).then(function () {
							return oService.content.open(oDocument, oService.ui5wysiwygeditor);
						});
					});
			},

			/**
			 * Returns all the aggregations of oParentControl where it is valid to place oControl
			 *
			 * @param {sap.ui.core.Control} oParentControl
			 * @param {sap.ui.core.Control} oControl
			 * @return {Array<sap.ui.dt.AggregationOverlay>}
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gUtils#getValidAggregations
			 * @function
			 * @public
			 */
			getValidAggregations: function (oParentControl, oControl) {
				jQuery.sap.require('sap.ui.dt.ElementUtil');
				var oParentOverlay = W5gUtils.getControlOverlay(oParentControl);
				var aAggregationOverlays = _.values(oParentOverlay.getAggregationOverlays());
				return aAggregationOverlays.filter(function (oAggregationOverlay) {
					return W5gUtils.isValidForAggregation(oParentControl, oAggregationOverlay, oControl);
				});
			},

			/**
			 * Returns true if the given aggregation overlay contain the given element
			 *
			 * @param {sap.ui.dt.AggregationOverlay} oAggregationOverlay
			 * @param {sap.ui.core.Element} oDraggedElement
			 * @return {boolean}
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gUtils#canAggregationOverlayContain
			 * @function
			 * @public
			 */
			canAggregationOverlayContain: function (oAggregationOverlay, oDraggedElement) {
				var oParentElement = oAggregationOverlay.getElementInstance();
				return W5gUtils.isValidForAggregation(oParentElement, oAggregationOverlay, oDraggedElement);
			},

			/**
			 * Checks if the given <code>oParent</code> can be a valid drop target for the given <code>oDraggedElement</code> control
			 *
			 * @param {sap.ui.core.Control} oDraggedElement
			 * @param {sap.ui.dt.AggregationOverlay} oAggregationOverlay
			 * @param {sap.ui.core.Control} oParent
			 * @returns {boolean} Returns true if the <code>oParent</code> is a valid drop target for the given <code>oDraggedElement</code> control
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gUtils#validateDropTarget
			 * @function
			 * @public
			 */
			validateDropTarget: function (oDraggedElement, oAggregationOverlay, oParent) {
				var mValidateDropTarget = ControlMetadata.getDesignTimeBehaviorPart(oDraggedElement, "validateDropTarget");
				if (mValidateDropTarget) {
					if (jQuery.isArray(mValidateDropTarget.list)) {
						if (mValidateDropTarget.list.indexOf(oParent.getMetadata().getName()) !== -1) {
							return true;
						}
					}
					if (jQuery.isFunction(mValidateDropTarget.test)) {
						return mValidateDropTarget.test.call(oDraggedElement, oAggregationOverlay, oParent);
					}
					return false; //not in the list
				}
				return true;
			},

			/**
			 * Gets validate drop target list from design time metadata of the given <code>oOverlay</code> overlay
			 *
			 * @param {sap.ui.dt.Overlay} oOverlay
			 * @returns {Array<string>} Returns validate drop target list from design time metadata of the given <code>oOverlay</code> overlay
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gUtils#getValidateDropTargetList
			 * @function
			 * @public
			 */
			getValidateDropTargetList: function (oOverlay) {
				var mValidateDropTarget = _.get(oOverlay.getDesignTimeMetadata().getData(), "behavior.validateDropTarget");
				return mValidateDropTarget && mValidateDropTarget.list || [];
			},

			/**
			 * Calls the validateAsDropTarget design time adapter function of the given oParent
			 *
			 * @param {sap.ui.core.Control} oParent
			 * @param {sap.ui.dt.AggregationOverlay} oAggregationOverlay
			 * @param {sap.ui.core.Control} oDraggedElement
			 * @returns {boolean} - True if the oParent is a valid drop target for oDraggedElement and False otherwise
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gUtils#validateAsDropTarget
			 * @function
			 * @public
			 */
			validateAsDropTarget: function (oParent, oAggregationOverlay, oDraggedElement) {
				jQuery.sap.require("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.Utils");
				var sAggregationName = oAggregationOverlay.getAggregationName();
				if (oParent.isBound(sAggregationName)) {
					return false;
				}
				if (!oParent.getMetadata().getAggregation(sAggregationName).multiple && sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.Utils.getAggregation(oAggregationOverlay)) {
					return false;
				}
				var fnValidateAsDropTarget = ControlMetadata.getAggregationsAdapterFunction(oParent, sAggregationName, "validateAsDropTarget");
				if (fnValidateAsDropTarget) {
					return fnValidateAsDropTarget.call(oParent, oAggregationOverlay, oDraggedElement);
				}
				return true;
			},

			/**
			 * Returns true if the given element valid under the given parent aggregation
			 *
			 * @param {sap.ui.core.Element} oParent
			 * @param {sap.ui.dt.AggregationOverlay} oAggregationOverlay
			 * @param {sap.ui.core.Element} oElement
			 * @return {boolean}
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gUtils#isValidForAggregation
			 * @function
			 * @public
			 */
			isValidForAggregation: function (oParent, oAggregationOverlay, oElement) {
				var sAggregationName = oAggregationOverlay.getAggregationName();
				var oAggregationMetadata = oParent.getMetadata().getAggregation(sAggregationName);
				var oWindow = W5gUtils.getWindowFor(oParent);
				oWindow.jQuery.sap.require('sap.ui.dt.ElementUtil');
				if(!_.includes(ControlMetadata.getUnsupportedAggregations(), oAggregationOverlay.getAggregationName()) &&
					W5gUtils.validateAsDropTarget(oParent, oAggregationOverlay, oElement) &&
					W5gUtils.validateDropTarget(oElement, oAggregationOverlay, oParent)) {
					return oAggregationMetadata ?
						oWindow.sap.ui.dt.ElementUtil.isValidForAggregation(oParent, sAggregationName, oElement) :
						false;
				}
				return false;
			},

			/**
			 * Computes control to navigate to
			 *
			 * @param {"up"|"down"|"previous"|"next"} sTarget
			 * @param {object} oDesignTime
			 *
			 * @return {sap.ui.core.Control}
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gUtils#navigateUI5Control
			 * @function
			 * @public
			 */
			navigateUI5Control: function (sTarget, oDesignTime) {
				// Determine control to be selected
				var /** sap.ui.dt.Overlay */ oSelectedOverlay = oDesignTime.getSelection()[0];
				var /** sap.ui.dt.ElementOverlay */ oOverlayToBeSelected;

				if (!oSelectedOverlay) {
					return null;
				}
				if (sTarget === "down") {
					if (!oSelectedOverlay.__oChildOverlaySelectedBefore) {

						var aAggregations = _.keys(ControlMetadata.getDesignTimeAggregations(oSelectedOverlay.getElementInstance()));

						var oAggregationOverlay = _.find(oSelectedOverlay.getAggregationOverlays(), function (oOverlay) {
							var bInAggregation = _.includes(aAggregations, oOverlay.getAggregationName());
							if (bInAggregation && oOverlay.getChildren().length !== 0) {
								return true;
							}
						});

						if (oAggregationOverlay) {
							oOverlayToBeSelected = oAggregationOverlay.getChildren()[0];
						}
						if (!oOverlayToBeSelected) {
							return null;
						}
					} else {
						oOverlayToBeSelected = oSelectedOverlay.__oChildOverlaySelectedBefore;
					}
				}
				else {
					var /** sap.ui.dt.AggregationOverlay */ oParentAggregationOverlay = oSelectedOverlay.getParentAggregationOverlay();
					if (!oParentAggregationOverlay) { // root view
						return null;
					}
					var aOverlays = oParentAggregationOverlay.getChildren();
					var indexSelectedControl = aOverlays.indexOf(oSelectedOverlay);
					if (sTarget === "next") {
						if (aOverlays.length === 1) {
							return null;
						}
						oOverlayToBeSelected = aOverlays[(indexSelectedControl + 1) % aOverlays.length];
					}
					else if (sTarget === "previous") {
						if (aOverlays.length === 1) {
							return null;
						}
						oOverlayToBeSelected = (indexSelectedControl === 0) ?
							aOverlays[aOverlays.length - 1] :
							aOverlays[(indexSelectedControl - 1) % aOverlays.length];
					}
					else if (sTarget === "up") {
						if (oParentAggregationOverlay) {
							oOverlayToBeSelected = oParentAggregationOverlay.getParent();
							// TODO new design time - need to think of cleaner solution
							oOverlayToBeSelected.__oChildOverlaySelectedBefore = oSelectedOverlay;
						}
					}
				}
				return oOverlayToBeSelected && oOverlayToBeSelected.getElementInstance();
			},

			/**
			 * Gets selected control on canvas
			 *
			 * @param {sap.ui.dt.DesignTime} oDesignTime
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gUtils#getSelectedControl
			 * @function
			 * @public
			 */
			getSelectedControl: function (oDesignTime) {
				if (oDesignTime) {
					var oSelected = oDesignTime.getSelection();
					if (oSelected && oSelected.length > 0) {
						return oDesignTime.getSelection()[0].getElementInstance();
					}
				}
				return null;
			},

			/**
			 * Gets badge info. This info contains the following properties:
			 *
			 * <ul>
			 * <li>'fragment' of type <code>boolean</code>
			 *            Whether the given control is a fragment
			 * </li>
			 * <li>'nestedView' of type <code>boolean</code>
			 *            Whether the given control is a nested view
			 * </li>
			 * <li>'unsupported' of type <code>boolean</code>
			 *            Whether the given control is an unsupported control
			 * </li>
			 * <li>'toBeSupported' of type <code>boolean</code>
			 *            Whether the given control is an incompatible control
			 * </li>
			 * <li>'deprecated' of type <code>boolean</code>
			 *            Whether the given control is a deprecated control
			 * </li>
			 * <li>'template' of type <code>boolean</code>
			 *            Whether the given control is a template
			 * </li>
			 * <li>'text' of type <code>string</code>
			 *            Badge text
			 * </li>
			 * </ul>
			 *
			 * @param {sap.ui.core.Control} oControl
			 * @param {Window} oWindow
			 * @param {boolean} bShowDeprecated Whether to check deprecated flag
			 * @return {object} Returns badge info
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gUtils#getBadgeInfo
			 * @function
			 * @public
			 */
			getBadgeInfo: function(oControl, oWindow, bShowDeprecated) {
				var oRes = {
						fragment: W5gUtils.isControlFragment(oControl),
						nestedView: W5gUtils.isNestedView(oControl),
						unsupported: ControlMetadata.isControlUnsupported(oControl),
						toBeSupported: ControlMetadata.isControlToBeSupported(oControl),
						deprecated: ControlMetadata.isControlDeprecated(oControl),
						template: W5gUtils.isControlTemplate(oControl, oWindow)
					},
					aBadgeData = [];

				if (oRes.fragment) {
					aBadgeData.push(W5gUtils.getText("w5g_badge_fragment", [_getPartName(oControl.__FragmentName)]));
				}
				else if (oRes.nestedView) {
					aBadgeData.push(W5gUtils.getText("w5g_badge_subview", [_getPartName(oControl.getControllerName())]));
				}
				else if (oRes.unsupported) {
					aBadgeData.push(W5gUtils.getText("w5g_badge_unsupported"));
				}
				else if (oRes.toBeSupported) {
					aBadgeData.push(W5gUtils.getText("w5g_badge_tobe_supported"));
				}
				else if (bShowDeprecated && oRes.deprecated) {
					aBadgeData.push(W5gUtils.getText("w5g_badge_deprecated"));
				}
				if (oRes.template) {
					aBadgeData.push(W5gUtils.getText("w5g_badge_template"));
				}
				oRes.text = aBadgeData.join(", ");

				return oRes;
			},

			/**
			 * Creates control using the given <code>oDesignTimeMetadata</code>
			 *
			 * @param {string} sName Control name
			 * @param {Window} oWindow
			 * @param {sap.ui.dt.DesignTime} oDesignTime
			 * @return {sap.ui.core.Element}
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gUtils#createControl
			 * @function
			 * @public
			 */
			createControl: function (sName, oWindow, oDesignTime) {
				var ControlClass = oWindow.jQuery.sap.getObject(sName);
				var oDesignTimeMetadata = oDesignTime.getDesignTimeMetadata();
				var oControl = new ControlClass(oDesignTimeMetadata[sName].defaultSettings);
				var fnConstructor = _.get(oDesignTimeMetadata, [sName, "behavior", "constructor"]);
				if (fnConstructor) {
					fnConstructor.call(oControl);
				}
				return oControl;
			},

			/**
			 *
			 * @param {string} sClassName
			 * @param {string} sBaseClass
			 * @param {Window} oWindow
			 * @return {boolean}
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gUtils#isBaseOf
			 * @function
			 * @public
			 */
			isBaseOf: function (sClassName, sBaseClass, oWindow) {
				function checkBaseMetadata (oBaseMetadata, oSecondMetadata) {
					if (!oSecondMetadata) {
						return false;
					}
					return oBaseMetadata.getName() === oSecondMetadata.getName() || checkBaseMetadata(oBaseMetadata, oSecondMetadata.getParent());
				}
				var oBaseClass = oWindow.jQuery.sap.getObject(sBaseClass);
				var oInstance = oWindow.jQuery.sap.getObject(sClassName);
				return typeof oBaseClass === "function" && checkBaseMetadata(oBaseClass.getMetadata(), oInstance.getMetadata())
					|| oInstance.getMetadata()._aInterfaces.indexOf(sBaseClass) !== -1;
			},

			/**
			 * Returns a promise to true iff p and q are both resolved to true
			 *
			 * @param {Q} q
			 * @param {Q} p
			 * @return {Function|*}
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gUtils#andBetweenTwoPromises
			 * @function
			 * @public
			 */
			andBetweenTwoPromises: function (q, p) {
				return Q.all([p, q])
					.spread(function (a, b) {
						return a && b;
					});
			},

			/**
			 * Returns default aggregation if exists, otherwise returns first public aggregation or null
			 *
			 * @param {sap.ui.core.Control} oControl
			 * @returns {object|null}
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gUtils#andBetweenTwoPromises
			 * @function
			 * @public
			 */
			getContainerTargetAggregation: function (oControl) {
				var mAllPublicAggregations = ControlMetadata.getAllPublicAggregations(oControl, ControlMetadata.getHiddenAggregations());
				if (mAllPublicAggregations.length) {
					var oMetadata = oControl.getMetadata();
					var sDefaultAggregationName = oMetadata.getDefaultAggregationName();
					var bDefaultAggregationInPublicAggregations = _.find(mAllPublicAggregations, function (mAggregation) {
						return mAggregation.name === sDefaultAggregationName;
					});
					if (bDefaultAggregationInPublicAggregations) {
						return sDefaultAggregationName;
					} else {
						return mAllPublicAggregations[0].name;
					}
				}
				return null;
			},

			/**
			 * Closes all opened wysiwyg tooltips.
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gUtils#closeW5gTooltips
			 * @function
			 * @public
			 */
			closeW5gTooltips: function () {
				jQuery.each(jQuery(".sapWysiwygTooltip:visible").control(), function() {
					/**
					 * @this {sap.ui.core.TooltipBase}
					 */
					if (this._closeOrPreventOpen) {
						this._closeOrPreventOpen();
					}
				});
			},

			/**
			 * Navigate to the code editor and select the code range, if provided
			 *
			 * @param {object} oContext service context
			 * @param {object} oDocument code document
			 * @param {object=} oRange range to select, optional
			 *
			 * @return {Q} promise
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gUtils#goToCode
			 * @function
			 * @public
			 */
			goToCode: function(oContext, oDocument , oRange) {
				return oContext.service.document.open(oDocument).then(function () {
					return oContext.service.content.getCurrentEditor().then(function (oCodeEditor) {
						return oCodeEditor.getUI5Editor().then(function (oEditor) {
							if (oRange) {
								//if range is in the form of [startIndex , endIndex] convert it to rows/columns form
								if(_.isArray(oRange) && oRange.length == 2) {
									oRange = {start : oEditor.indexToPosition(oRange[0]),end : oEditor.indexToPosition(oRange[1])};
								}
								//delay is needed here to allow the navigation to complete otherwise
								//the document not scrolls to the selection
								return Q.delay().then(function(){
									oCodeEditor.setHighlight([_.assign(oRange, {isBackwards: false})], "selection");
									return oEditor.moveCursorTo(oRange.start.row, 1);
								});
							}
						});
					});
				});
			},

			/**
			 * fetch the controller content based on the view object
			 *
			 * @param {object} oContext service context
			 * @param {sap.ui.core.mvc.View} oView view object
			 * @param {Window} oWindow
			 *
			 * @return (Q} Promise
			 *
			 * @function
			 * @public
			 */
			getControllerDocument: function(oContext , oView , oWindow) {
				return oContext.service.filesystem.documentProvider.getDocument(this.getControllerPathByView(oView , oWindow));
			}
		};

		return W5gUtils;
	}
);

