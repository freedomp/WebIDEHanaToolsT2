sap.ui.define(
	[
		"jquery.sap.global", "sap/ui/core/IconPool"
	],
	function(jQuery, IconPool) {
		"use strict";

// Private variables and methods
// Begin
		var
			/**
			 * The empty classes map
			 *
			 * @const
			 * @type {map<string, string>}
			 * @private
			 */
			_mEmptyClasses = {
				"narrow": "sapUiDtEmptyBackground sapUiDtEmptyNarrowContainer",
				"regular": "sapUiDtEmptyBackground sapUiDtEmptyContainer",
				"icon": "emptyIcon"
			},

			/**
			 * Test data action name regexp
			 *
			 * @const
			 * @private
			 * @type {RegExp}
			 */
			TEST_DATA_ACTION_REGEXP = /^(contains|is)$/,

			/**
			 * Empty containers test data
			 *
			 * @type {object}
			 * @private
			 */
			_mEmptyContainersTestData = {};

		/**
		 * Gets the value of given property, aggregation or function
		 *
		 * @param {sap.ui.core.Control} oControl control
		 * @param {string | function} vName control property/aggregation name, private function name or a function
		 * @return {*}
		 *
		 * @private
		 */
		function _getValue(oControl, vName) {
			var fnCallback = vName,
				sFirstChar;
			if (jQuery.type(vName) === "string") { //property, aggregation or private method
				sFirstChar = vName.charAt(0);
				if (sFirstChar !== "_") { //!private method
					vName = "get" + sFirstChar.toUpperCase() + vName.slice(1);
				}
				fnCallback = oControl[vName];
			}
			return fnCallback.apply(oControl);
		}

		/**
		 * Adds given <code>sClasses</code> css class(es) to the html element associated with the given control
		 * if all values gotten by the getters of the <code>aCheckList</code> list are empty.
		 * The value is empty if <code>fnIsEmpty</code> returns true.
		 *
		 * @param {object} oClassDef The control definition
		 * @param {Array<string|function>} aCheckList Array of property/aggregation names to be checked. Each item in
		 *                this array can be property/aggregation name, private control's function name or a function.
		 * @param {Array<string>} aFunctionNames Array of function names of the given control to be extended.
		 *                        "onAfterRendering" will be extended automatically
		 * @param {string} sClasses Css class(es) name(s) to be added to the given control
		 * @param {function} fnIsEmpty Empty value test function
		 * @param {Array<string|function>=} aExtraCheckList Array of property/aggregation names to be checked in tests
		 *
		 * @private
		 */
		function _addEmptyBackground(oClassDef, aCheckList, aFunctionNames, sClasses, fnIsEmpty, aExtraCheckList) {
			function applyEmptyBackground() {
				/** @this {sap.ui.core.Control} */
				var oControl = this,
					bEmpty = true,
					oValue;

				aCheckList.forEach(function (vName) {
					oValue = _getValue(oControl, vName);
					bEmpty &= fnIsEmpty(oValue);
				});
				oControl.$().toggleClass(sClasses, !!bEmpty);
			}

			aFunctionNames = aFunctionNames || [];
			if (aFunctionNames.indexOf("onAfterRendering") === -1) {
				aFunctionNames.push("onAfterRendering");
			}

			aFunctionNames.forEach(function (sFunctionName) {
				AdapterUtils.extendControlFunction(oClassDef, sFunctionName, applyEmptyBackground);
			});

			var oRegex = /^_/,
				aSelectors = [],
				oSelector = {};

			aCheckList.forEach(function (sName) {
				if (jQuery.type(sName) === "string" && !oRegex.test(sName)) {
					aSelectors.push(sName);
				}
			});
			if (aExtraCheckList) {
				aSelectors = aSelectors.concat(aExtraCheckList);
			}
			oSelector[aSelectors.join(", ")] = {
				is: ["." + sClasses.split(/\s/).join(".")]
			};
			_addEmptyContainersTestData(oClassDef.getMetadata().getName(), oSelector);
		}

		/**
		 * Check if the object exists and visible.
		 * In case object has _isEmpty() method then this method is called. If there is no such method then object is not empty.
		 *
		 * @param {sap.ui.core.Control} oObject to be checked
		 * @returns {boolean} true is the object is not empty and visible, false - otherwise.
		 *
		 * @private
		 */
		function _isActiveObject(oObject) {
			return oObject && (!oObject._isEmpty || !oObject._isEmpty()) && (!oObject.getVisible || oObject.getVisible());
		}

		/**
		 * Array is considered empty if it is null or undefined or has no controls or all the controls are empty or not visible.
		 *
		 * @param {Array<sap.ui.core.Control>} aArray array of controls to be checked
		 * @returns {boolean} true if array has an active object, false - otherwise.
		 *
		 * @private
		 */
		function _isActiveArray(aArray) {
			var bActive = false;

			jQuery.each(aArray || [], function () {
				/** @this {sap.ui.core.Control} */
				if (_isActiveObject(this)) {
					bActive = true;
					return false;
				}
			});
			return bActive;
		}

		/**
		 * Create divs if not exist according to the path dictated by given parameter
		 * @param {Array<string>} aClassNames list of class names for the divs to be checked and created
		 * @param {object} $elem selector of current element
		 * @return {object}
		 *
		 * @private
		 */
		function _createDivHierarchyIfNotExist(aClassNames, $elem) {
			if (aClassNames.length === 0) {
				return $elem;
			}
			var sClass = aClassNames[0],
				$child = $elem.find('>' + (sClass === "div" ? "" : ".") + sClass);
			if ($child.length === 0) {
				if (sClass.indexOf(":") !== -1) {
					sClass = sClass.substr(0, sClass.indexOf(":"));
				}
				$child = jQuery('<div ' + (sClass === "div" ? '' : 'class="' + sClass + '"') + '/>').appendTo($elem);
			}
			return _createDivHierarchyIfNotExist(aClassNames.splice(1), $child);
		}


		/**
		 * Adds new test data to the empty containers test data
		 *
		 * @param {string} sClassName Control class name to be tested with the given <code>oTestData</code>
		 * @param {object} oTestData Test data.
		 * 		This data are key-value pairs with the following format:
		 * 			key {string} comma-separated list of property or/and aggregation name(s).
		 * 		 		Each item in this list can be a single property/aggregation name or a set of names connected with "+" sign
		 * 		 		For example:
		 * 				"headerToolbar" means that test constraints will be applied to headerToolbar aggregation of the tested control
		 * 				"footer+showFooter" means that test constrains will be applied to footer aggregation and showFooter property together
		 * 				Only public properties and aggregations can be tested
		 * 			value {object} test constrains.
		 *		Test constrain are key-value pairs with the following format:
		 *			key {string} action name. Only two actions are supported:
		 *				"contains" means that the html dom reference of the tested control contains the node(s) with the given
		 *					css <code>selectors</code> if the tested part of control has no content
		 *				"is" means that  the html dom reference of the tested control has the given css <code>selectors</code>
		 *					if the tested part of control has no content
		 *			value {Array<string>} list of css selectors
		 *
		 *		Example:
		 *			{
		 *				"text": {
		 *					"is": [".classText.classTextEmpty"]
		 *				},
		 *				"footer+showFooter": {
		 *					"is": [".classWithEmptyFooter"]
		 *					"contains": [".classEmptyFooter", ".classHeader+.classEmptyFooter"]
		 *				}
		 *			}
		 *
		 * @private
		 */
		function _addEmptyContainersTestData(sClassName, oTestData) {
			var oCurrTestData = _mEmptyContainersTestData[sClassName],
				oCurrConstraints, aCurrConstraints;
			if (!oCurrTestData) {
				_mEmptyContainersTestData[sClassName] = {};
				oCurrTestData = _mEmptyContainersTestData[sClassName];
			}

			jQuery.each(oTestData, function(sPropertiesOrAggregationsList, oConstrains) {
				sPropertiesOrAggregationsList.replace(/\s/g, "").split(/,/).forEach(function(sPropertiesOrAggregations) {
					oCurrConstraints = oCurrTestData[sPropertiesOrAggregations];
					if (!oCurrConstraints) {
						oCurrTestData[sPropertiesOrAggregations] = {};
						oCurrConstraints = oCurrTestData[sPropertiesOrAggregations];
					}
					jQuery.each(oConstrains, function(sAction, aSelectors) {
						if (!TEST_DATA_ACTION_REGEXP.test(sAction)) {
							console.error("WRONG EmptyContainersTestData: " + sAction);
							return;
						}
						aCurrConstraints = oCurrConstraints[sAction];
						if (aCurrConstraints) {
							aSelectors.forEach(function(sSelectors) {
								if (aCurrConstraints.indexOf(sSelectors) === -1) {
									aCurrConstraints.push(sSelectors);
								}
							});
						} else {
							oCurrConstraints[sAction] = aSelectors.slice(); //clone
						}
					});
				});
			});
		}

		/**
		 * Empty value test function for regular controls
		 *
		 * @param {*} oValue to be tested
		 * @return {boolean} true, if the given value is false, null, 0, "", undefined, NaN or an empty array
		 *
		 * @private
		 */
		function _isEmptyControlValue(oValue) {
			if (jQuery.isArray(oValue)) {
				return !oValue.length;
			}
			return !oValue;
		}

		/**
		 * Empty value test function for sap.ui.core.Icon control
		 *
		 * @param {*} oValue to be tested
		 * @return {boolean} false, if the given value is not associated with any registered icon
		 *
		 * @private
		 */
		function _isEmptyIconValue(oValue) {
			return !IconPool.getIconInfo(oValue);
		}

		//TODO: use sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gUtils.isBindingValue instead
		function isBindingValue(oValue) {
			return (typeof oValue === "string") && jQuery.sap.startsWith(oValue, "{") && jQuery.sap.endsWith(oValue, "}");
		}
// End
// Private variables and methods

		var AdapterUtils = {
			/**
			 * Gets empty containers test data
			 *
			 * @return {object} return empty container test data
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.AdapterUtils#getEmptyContainersTestData
			 * @function
			 * @public
			 */
			getEmptyContainersTestData: function() {
				return _mEmptyContainersTestData;
			},

			/**
			 * Extends the specific function of the given control
			 *
			 * @param {object} oClassDef The control definition
			 * @param {string} sFunctionName The name of the function to extend. (should not be static function)
			 * @param {function} fnCallback The callback function to be called afterward
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.AdapterUtils#extendControlFunction
			 * @function
			 * @public
			 */
			extendControlFunction: function(oClassDef, sFunctionName, fnCallback) {
				if (oClassDef && fnCallback) {
					var orgMethod = oClassDef.prototype[sFunctionName];
					oClassDef.prototype[sFunctionName] = function () {
						/** @this {sap.ui.core.Control} */
						if (orgMethod) {
							orgMethod.apply(this, arguments);
						}
						fnCallback.apply(this, arguments);
					};
				}
			},

			/**
			 * Adds empty background style to the html element associated with the given control
			 * if all values gotten by the getters of the <code>aCheckList</code> list are falsey.
			 * The falsey values are: false, null, 0, "", undefined, NaN and an empty array.
			 * For sap.ui.core.Icon class falsey values also include incorrect value.
			 *
			 * @param {object} oClassDef The control definition
			 * @param {Array<string|function>} aCheckList Array of property/aggregation names to be checked. Each item in
			 *                this array can be property/aggregation name, private control's function name or a function.
			 * @param {boolean=} bNarrow Whether to add narrow style to empty container
			 * @param {Array<string>=} aFunctionNames Array of function names of the given control to be extended.
			 *                        "onAfterRendering" will be extended automatically
			 * @param {Array<string|function>=} aExtraCheckList Array of property/aggregation names to be checked in tests
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.AdapterUtils#addEmptyControlBackground
			 * @function
			 * @public
			 */
			addEmptyControlBackground: function(oClassDef, aCheckList, bNarrow, aFunctionNames, aExtraCheckList) {
				var isIcon = oClassDef === sap.ui.core.Icon;

				_addEmptyBackground(
					oClassDef,
					aCheckList,
					aFunctionNames,
					_mEmptyClasses[isIcon ? "icon" : (bNarrow ? "narrow" : "regular")],
					isIcon ? _isEmptyIconValue : _isEmptyControlValue,
					aExtraCheckList
				);
			},

			/**
			 * Extends "onAfterRendering" method of the given control.
			 * The extension is specific to controls which has 'headerToolbar' and 'infoToolbar' aggregations.
			 * The change allows 'headerToolbar' and 'infoToolbar' aggregations to be used as drop target.
			 *
			 * @param {object} oClassDef The control definition
			 * @param {string} sHeaderTextSelector A css selector for the header text dom element.
			 *                    Used when the headerToolbar aggregation is empty
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.AdapterUtils#addEmptyHeaderToolbars
			 * @function
			 * @public
			 */
			addEmptyHeaderToolbars: function(oClassDef, sHeaderTextSelector) {
				AdapterUtils.extendControlFunction(oClassDef, "onAfterRendering", function () {
					/** @this {sap.ui.core.Control} */
					var oHeaderToolbar = this.getHeaderToolbar(),
						$header;

					if (!oHeaderToolbar && !this.getHeaderText()) {
						this.$().prepend('<div class="sapUiDtEmptyBackground sapUiDtEmptyHeader"></div>');
					}
					if (!this.getInfoToolbar()) {
						// Ensure info toolbar is added below header!
						if (oHeaderToolbar) {
							$header = oHeaderToolbar.$();
						} else {
							$header = this.$().find(sHeaderTextSelector + ", .sapUiDtEmptyHeader");
						}

						$header.after('<div class="sapUiDtEmptyBackground sapUiDtEmptyInfoToolbar"></div>');
					}
				});

				_addEmptyContainersTestData(oClassDef.getMetadata().getName(), {
					"headerToolbar, headerText": {
						contains: [
							".sapUiDtEmptyBackground.sapUiDtEmptyHeader",
							".sapUiDtEmptyBackground.sapUiDtEmptyHeader+.sapUiDtEmptyBackground.sapUiDtEmptyInfoToolbar"
						]
					},
					"infoToolbar": {
						contains: [
							".sapUiDtEmptyBackground.sapUiDtEmptyInfoToolbar",
							".sapUiDtEmptyBackground.sapUiDtEmptyHeader+.sapUiDtEmptyBackground.sapUiDtEmptyInfoToolbar"
						]
					}
				});
			},

			/**
			 * Extends "onAfterRendering" method of the given control.
			 * The extension is specific to controls which has 'footer' aggregation.
			 * The change allows 'footer' aggregation to be used as drop target.
			 *
			 * @param {object} oClassDef The control definition
			 * @param {string} sRootClasses Css class(es) name(s) to be added to the given control
			 * @param {string} sFooterClasses Css class(es) name(s) to be added to footer element of the given control
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.AdapterUtils#addEmptyFooterToolbar
			 * @function
			 * @public
			 */
			addEmptyFooterToolbar: function(oClassDef, sRootClasses, sFooterClasses) {
				sRootClasses = (sRootClasses || "") + " sapUiDtContainerWithEmptyFooter";
				sFooterClasses = (sFooterClasses || "sapUiDtEmptyBackground") + " sapUiDtEmptyFooter";

				AdapterUtils.extendControlFunction(oClassDef, "onAfterRendering", function () {
					/** @this {sap.ui.core.Control} */
					if (this.getShowFooter() && !this.getFooter()) {
						this.$()
							.addClass(sRootClasses)
							.append('<footer class="' + sFooterClasses + '"></footer>');
					}
				});

				_addEmptyContainersTestData(oClassDef.getMetadata().getName(), {
					"footer, footer+showFooter": {
						is: [".sapUiDtContainerWithEmptyFooter"],
						contains: [".sapUiDtEmptyFooter"]
					}
				});
			},

			/**
			 * Extends "onAfterRendering" method of sap.m.ObjectHeader.
			 * The change allows 'attributes' and 'statuses' aggregations to be used as drop target.
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.AdapterUtils#addObjectHeaderEmptyParts
			 * @function
			 * @public
			 */
			addObjectHeaderEmptyParts: function() {
				AdapterUtils.extendControlFunction(sap.m.ObjectHeader, "onAfterRendering", function () {
					/** @this {sap.m.ObjectHeader} */
					if (this.getCondensed() || this.getResponsive()) {
						return;
					}
					if (!_isActiveArray(this.getAttributes())) {
						_createDivHierarchyIfNotExist(["sapMOHBottomRow", "sapMOHAttrRow", "sapMOHAttrEmpty"], this.$());
					}
					if (!_isActiveObject(this.getFirstStatus()) && !_isActiveObject(this.getSecondStatus()) && !_isActiveArray(this.getStatuses())) {
						_createDivHierarchyIfNotExist(["sapMOHBottomRow", "sapMOHAttrRow", "sapMOHStatusEmpty"], this.$());
					}
				});

				AdapterUtils.addEmptyControlBackground(sap.m.ObjectHeader, ["intro", "title", "number", "_hasAttributes", "_hasStatus", function () {
					/** @this {sap.m.ObjectHeader} */
					return this.getShowMarkers() && (this.getMarkFavorite() || this.getMarkFlagged());
				}], true, null, [
					//_hasStatus
					"statuses", "firstStatus", "secondStatus",
					//_hasAttributes
					"attributes",
					//markers
					"showMarkers+markFavorite", "showMarkers+markFlagged"
				]);

				_addEmptyContainersTestData("sap.m.ObjectHeader", {
					"attributes": {
						contains: [".sapMOHAttrEmpty"]
					},
					"statuses": {
						contains: [".sapMOHStatusEmpty"]
					}
				});
			},

			/**
			 * Extends "onAfterRendering" method of sap.m.ObjectListItem.
			 * The change allows 'firstStatus', 'secondStatus' and 'attributes' aggregations to be used as drop target.
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.AdapterUtils#addObjectListItemEmptyParts
			 * @function
			 * @public
			 */
			addObjectListItemEmptyParts: function() {
				AdapterUtils.extendControlFunction(sap.m.ObjectListItem, "onAfterRendering", function () {
					/** @this {sap.m.ObjectListItem} */
					var $ref = this.$(),
						bFirstStatusActive = _isActiveObject(this.getFirstStatus()),
						bActiveAttributes = _isActiveArray(this.getAttributes());

					if (!bFirstStatusActive) {
						_createDivHierarchyIfNotExist(["sapMLIBContent", "div", "sapMObjLBottomRow", "sapMObjLAttrRow:first-child", "sapMObjLStatus1DivEmpty"], $ref);
					}
					if (!_isActiveObject(this.getSecondStatus())) {
						if (bFirstStatusActive || bActiveAttributes) {
							_createDivHierarchyIfNotExist(["sapMLIBContent", "div", "sapMObjLBottomRow", "sapMObjLAttrRow:nth-child(2)", "sapMObjLStatus2DivEmpty"], $ref);
						} else {
							_createDivHierarchyIfNotExist(["sapMLIBContent", "div", "sapMObjLBottomRow", "sapMObjLAttrRow:first-child", "sapMObjLStatus2DivEmpty"], $ref);
						}
					}
					if (!bActiveAttributes) {
						_createDivHierarchyIfNotExist(["sapMLIBContent", "div", "sapMObjLBottomRow", "sapMObjLAttrRow:first-child", "sapMObjLAttrDivEmpty"], $ref);
					}
				});

				_addEmptyContainersTestData("sap.m.ObjectListItem", {
					"firstStatus": {
						contains: [".sapMObjLStatus1DivEmpty"]
					},
					"secondStatus": {
						contains: [".sapMObjLStatus2DivEmpty"]
					},
					"attributes": {
						contains: [".sapMObjLAttrDivEmpty"]
					}
				});
			},

			/**
			 * This function creates placeholder for not rendered controls
			 *
			 * @param {object} oClassDef The control definition
			 * @param {string} sRootClass The css class name to be added to created html element
			 * @param {function|string} fnTest Private method name of the rendered control or function which is used to decide
			 * to create control placeholder or to use original renderer
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.AdapterUtils#patchEmptyElementRenderer
			 * @function
			 * @public
			 */
			 patchEmptyElementRenderer: function(oClassDef, sRootClass, fnTest) {
				var sRendererName = oClassDef.getMetadata().getName() + "Renderer";
				jQuery.sap.require(sRendererName);
				var oRenderer = jQuery.sap.getObject(sRendererName);
				var oOriginalRender = oRenderer.render;

				oRenderer.render = function(oRm, oCtrl) {
					if (typeof fnTest === "string") {
						fnTest = oCtrl[fnTest];
					}
					if ((typeof fnTest === "function") && fnTest.apply(oCtrl)) {
						oRm.write("<div");
						oRm.writeControlData(oCtrl);
						oRm.addClass(sRootClass);
						oRm.writeClasses();
						oRm.write("></div>");
					} else {
						oOriginalRender.apply(this, arguments);
					}
				};
			},

			/**
			 * This function overrides getDomRef method of the given control.
			 *
			 * @param {object} oClassDef The control definition
			 * @param {object} oParentClassDef The control parent definition
			 * @param {string} sCssSelectorPrefix The css selector which helps to find dom ref from parent's perspective
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.AdapterUtils#patchDomRef
			 * @function
			 * @public
			 */
			patchDomRef: function(oClassDef, oParentClassDef, sCssSelectorPrefix) {
				var fnGetDomRef = oClassDef.prototype.getDomRef;

				oClassDef.prototype.getDomRef = function () {
					var oParent = this.getParent(),
						iIndex;
					if (oParent instanceof oParentClassDef) {
						var oDomRef = oParent.getDomRef();
						if (oDomRef) {
							iIndex = oParent.indexOfAggregation(this.sParentAggregationName, this);
							return $(oDomRef).find(sCssSelectorPrefix)[iIndex];
						}
					}
					return fnGetDomRef.apply(this, arguments);
				};
			},

			/**
			 * Updates the html dom element associated with the given <code>sSelector</code> if one of the properties has value
			 * interpreted as a binding info
			 *
			 * @param {object} oClassDef The control definition
			 * @param {Array<string>} aProperties Array of property names to be checked.
			 * The first property with a 'binding info' value is used!
			 * @param {string} sSelector The css selector which in control's perspective which will be changed
			 * @param {string=} sAttribute jQuery attribute name
			 * @param {Array<string>=} aFunctionNames Array of function names of the given control to be extended.
			 *                        "onAfterRendering" will be extended automatically
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.AdapterUtils#patchBindingText
			 * @function
			 * @public
			 */
			patchBindingText: function(oClassDef, aProperties, sSelector, sAttribute, aFunctionNames) {
				sAttribute = sAttribute || "text";
				switch(sAttribute) { //check attribute
					case "text":
					case "val":
						break;
					default:
						jQuery.sap.assert(sAttribute, "wrong attribute");
						return;
				}

				function applyPatchBindingText() {
					/** @this {sap.ui.core.Control} */
					var oControl = this,
						oValue;

					jQuery.each(aProperties, function (iIndex, vName) {
						oValue = _getValue(oControl, vName);
						if (isBindingValue(oValue)) {
							oControl.$().find(sSelector)[sAttribute](oValue);
							return false; //break
						}
					});
				}

				aFunctionNames = aFunctionNames || [];
				if (aFunctionNames.indexOf("onAfterRendering") === -1) {
					aFunctionNames.push("onAfterRendering");
				}

				aFunctionNames.forEach(function (sFunctionName) {
					AdapterUtils.extendControlFunction(oClassDef, sFunctionName, applyPatchBindingText);
				});
			},

			/**
			 * Change responsivity of sap.m.ObjectHeader on drag start
			 *
			 * @this {sap.m.ObjectHeader}
			 * @return {Array<function>} returns an array of functions to restore original state on drag end
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.AdapterUtils#showInvisibleParts_ObjectHeader
			 * @function
			 * @public
			 */
			showInvisibleParts_ObjectHeader: function() {
				/** @this {sap.m.ObjectHeader} */
				var that = this;
				var aOnDragEndHandlers = [];

				if (this.getCondensed()) {
					this.setCondensed(false);
					aOnDragEndHandlers.push(function () {
						that.setCondensed(true);
					});
				}
				if (this.getResponsive()) {
					this.setResponsive(false);
					aOnDragEndHandlers.push(function () {
						that.setResponsive(true);
					});
				}
				return aOnDragEndHandlers;
			}
		};

		return AdapterUtils;
	},
	/* bExport= */ true
);
