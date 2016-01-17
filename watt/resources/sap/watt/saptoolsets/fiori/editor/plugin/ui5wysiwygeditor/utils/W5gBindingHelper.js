define(
	[
		"sap/watt/lib/lodash/lodash",
		"./PropertyBindingDialogHelper",
		"./EventsHelper",
		"./ResourcesHelper",
		"./BindingUtils",
		"./W5gUtils",
		"./ControlMetadata",
		"./UsageMonitoringUtils"
	],
	function (_, PropertyBindingDialogHelper, EventsHelper, ResourcesHelper, BindingUtils, W5gUtils, ControlMetadata,
			  UsageMonitoringUtils) {
		"use strict";

		jQuery.sap.require("sap.ui.commons.MessageBox");
		jQuery.sap.require("sap.ui.base.DataType");

// Private variables and methods
// Begin
		var
			/**
			 * The map of unsupported templates.
			 *
			 * <ul>
			 * <li>'aggregations' of type <code>Map(string, string)</code>
			 *            {class name : aggregation name} pairs
			 *          all controls from the given aggregation will be excluded
			 * </li>
			 * <li>'controls' of type <code>Array(string)</code>
			 *            Array of class names
			 *          all instances of the given class will be excluded
			 * </li>
			 * </ul>
			 *
			 * @const
			 * @type {object}
			 * @private
			 */
			UNSUPPORTED_TEMPLATES = {
				aggregations: {
					"sap.ui.core.mvc.XMLView": "content",
					"sap.ui.layout.form.SimpleForm": "content"
				},
				controls: []
			},

			/**
			 * Unbind item key
			 *
			 * @type {string}
			 * @private
			 */
			_sUnbindKey = BindingUtils.getUnbindKey(),

			/**
			 * Translated texts
			 *
			 * @type {Map<string, string>}
			 * @private
			 */
			_mTexts = {},

			/**
			 * Data model reference
			 *
			 * <ul>
			 * <li>'isMetadataExists' of type <code>boolean</code>
			 *            Whether the project has metadata
			 * </li>
			 * <li>'entitySets' of type <code>Array(object)</code>
			 *            Array of data entity sets
			 * </li>
			 * <li>'fields' of type <code>Array(object)</code>
			 *            Array of data fields
			 * </li>
			 * <li>'isDefaultModel' of type <code>boolean</code>
			 *            Whether the current entity set belong to default model
			 * </li>
			 * <li>'isTemplate' of type <code>boolean</code>
			 *            Whether the selected control is a template
			 * </li>
			 * <li>'isTemplateVisible' of type <code>boolean</code>
			 *            Whether the selected control can be a template
			 * </li>
			 * <li>'controlES' of type <code>string</code>
			 *            control data set's path if any
			 * </li>
			 * <li>'viewES' of type <code>string</code>
			 *            view data set's path
			 * </li>
			 * <li>'templateTooltip' of type <code>string</code>
			 *          tooltip for "set as template" checkbox
			 * </li>
			 * </ul>
			 *
			 * @type {sap.ui.model.json.JSONModel}
			 * @private
			 */
			_oDataModel = new sap.ui.model.json.JSONModel({}),

			/**
			 * W5g service context
			 *
			 * @type {object}
			 * @private
			 */
			_oContext = null,

			/**
			 * Reference to opened document
			 *
			 * @type {object}
			 * @private
			 */
			_oOpenedDocument = null,

			/**
			 * Reference to opened view
			 *
			 * @type {null}
			 * @private
			 */
			_oOpenedView = null,

			/**
			 * The last selected control if any
			 *
			 * @type {sap.ui.core.Control}
			 * @private
			 */
			_oControl = null,

			/**
			 * Reference to XmlManipulator
			 *
			 * @type {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.serialization.XmlManipulator}
			 * @private
			 */
			_oXmlManipulator = null;
		/**
		 * Adjusts entity sets collection according to current view data set's path
		 *
		 * @param {string} sViewSet view data set's path
		 *
		 * @name _resetDataModel
		 * @function
		 * @private
		 */
		function _adjustEntitySets(sViewSet) {
			var bRoot = _oDataModel.getProperty("/isRoot"),
				aEntitySets = _.filter(_oDataModel.getProperty("/_entitySets"), function(oEntitySet) {
					var aPath = oEntitySet.key.split("/");
					//sViewSet==="UNBOUND" || sViewSet==="/entitySet" || sViewSet==="/entitySet/navProperty"
					return aPath.length < 3 || (!bRoot && aPath[1] === sViewSet);
				});
			_oDataModel.setProperty("/entitySets", aEntitySets);
		}

		/**
		 * Resets data model properties
		 *
		 * @param {object} oData data
		 * @param {Array<object>=} aAllEntitySets array of all entity sets (with navigation properties)
		 *
		 * @name _resetDataModel
		 * @function
		 * @private
		 */
		function _resetDataModel(oData, aAllEntitySets) {
			if (arguments.length === 1) {
				aAllEntitySets = _oDataModel.getProperty("/_entitySets");
			}

			oData._entitySets = aAllEntitySets;
			oData.isMetadataExists = !!aAllEntitySets;
			oData.viewES = BindingUtils.normalizeDataSetPath(oData.viewES || _oDataModel.getProperty("/viewES"));
			delete oData.entitySets;

			_oDataModel.setData(jQuery.extend({
				_entitySets: null,
				controlES: null,
				entitySets: [],
				isMetadataExists: false,
				isTemplate: false,
				isTemplateVisible: false,
				templateTooltip: "",
				isDefaultModel: true,
				isRoot: false,
				viewES: _sUnbindKey
			}, oData));
			_setViewEntitySet(oData.viewES);
		}

		/**
		 * Gets entity set for the opened view stored in the custom data (old implementation)
		 *
		 * @return {string} entity set for the opened view if any
		 *
		 * @name _getViewSetFromCustomData
		 * @function
		 * @private
		 */
		function _getViewSetFromCustomData() {
			var oRoot = _oOpenedView && _oOpenedView.getContent()[0];
			var sResult;
			if (oRoot) {
				sResult = oRoot.data("sapDtResourcePath");
				if (!sResult) {
					jQuery("CustomData [key='sapDtResourcePath']", _oOpenedView.__XMLNode).each(function () {
						if (!sResult) {
							sResult = $(this).attr("value");
						} else if ($(this).attr("value") !== sResult) {
							//this view has more than one entity set.
							sResult = undefined;
							return false;
						}
					});
				}
			}
			return sResult || _sUnbindKey;
		}

		/**
		 * Unbind the aggregation from the model
		 *
		 * @param {sap.ui.core.Control} oControl control
		 *
		 * @name _unbindAggregation
		 * @function
		 * @private
		 */
		function _unbindAggregation(oControl) {
			var oParentAggregationInfo = W5gUtils.getWYSIWYGParentAggregationInfo(oControl),
				oParent = oParentAggregationInfo.parent,
				oBindingInfo = BindingUtils.getBindingInfo(oParentAggregationInfo);

			if (oParent) {
				//clean up the xml
				if (oBindingInfo) {
					if (oBindingInfo.template) {
						oBindingInfo.template.data("sapDtResourcePath", null);
					}
					oParent.data("sapDtResourcePath", null);
				}
				oControl.data("sapDtResourcePath", null);

				_oXmlManipulator.emitPropertyChangeEvent(oParent, oParentAggregationInfo.aggregationName);

				//This removes all bindings from child elements if exists
				oParent.unbindAggregation(oParentAggregationInfo.aggregationName, true);

				_oDataModel.setProperty("/controlES", _sUnbindKey);
				_oDataModel.setProperty("/isTemplate", false);
				_oDataModel.setProperty("/templateTooltip", _createSetAsTemplateTooltip(oControl, oParentAggregationInfo));

				_oContext.event.fireBindingChanged().then(function() {
					return EventsHelper.fireViewHasChanged();
				}).done();
			}
		}


		/**
		 * Bind the aggregation named <code>sEntitySetName</code>
		 *
		 * @param {sap.ui.core.Control} oControl template
		 * @param sEntitySetName
		 *
		 * @name _bindAggregation
		 * @function
		 * @private
		 */
		function _bindAggregation(oControl, sEntitySetName) {
			var oParentAggregationInfo = W5gUtils.getWYSIWYGParentAggregationInfo(oControl),
				oParent = oParentAggregationInfo.parent;

			if (oParent) {
				var sPath = sEntitySetName,
					aPath = sEntitySetName.split("/"),
					oBindingInfo = oParent.getBindingInfo(oParentAggregationInfo.aggregationName);
				if (!aPath[0]) {
					sPath = BindingUtils.normalizeDataSetPath(sEntitySetName);
					aPath.splice(0, 1);
				}
				if (aPath.length > 1) {
					sPath = aPath[1];
				}
				_oXmlManipulator.emitPropertyChangeEvent(oParent, oParentAggregationInfo.aggregationName, '{' + sPath + '}');
				oParent.bindAggregation(oParentAggregationInfo.aggregationName, {
					path: sPath,
					// We need to clone oControl to prevent removing its aggregations.
					// This control is still the aggregation item of its parent and this aggregation becomes bounded
					// (UI5 destroys aggregation content before binding)
					template: oBindingInfo && oBindingInfo.template || oControl.clone()
				});

				_oDataModel.setProperty("/controlES", sEntitySetName);
				_oDataModel.setProperty("/isTemplate", true);
				_oDataModel.setProperty("/templateTooltip", _createSetAsTemplateTooltip(oControl, oParentAggregationInfo));

				_oContext.event.fireBindingChanged().then(function() {
					return EventsHelper.fireViewHasChanged();
				}).then(function () {
					var aAggregation = sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.Utils.getAggregationByName(
						oParentAggregationInfo.parent,
						oParentAggregationInfo.aggregationName
					);
					if (aAggregation.length) {
						return _oContext.service.ui5wysiwygeditor.selectUI5Control(aAggregation[0].getId());
					}
				}).done();
			}
		}

		/**
		 * Unbind the property from the model
		 *
		 * @param {sap.ui.core.Control} oControl control
		 * @param {string} sPropertyName property name
		 *
		 * @return {Q} promise
		 *
		 * @name _unbindProperty
		 * @function
		 * @private
		 */
		function _unbindProperty(oControl, sPropertyName) {
			oControl.unbindProperty(sPropertyName, false);

			//clean up the xml
			oControl.data("sapDtResourcePath", null);

			return _oContext.event.fireBindingChanged();
		}

		/**
		 * Bind the property named <code>sPropertyName</code>
		 *
		 * @param {sap.ui.core.Control} oControl control
		 * @param {string} sPropertyName property name
		 * @param {string} sDataFieldName binding value
		 *
		 * @name _bindProperty
		 * @function
		 * @private
		 */
		function _bindProperty(oControl, sPropertyName, sDataFieldName) {
			oControl.bindProperty(sPropertyName, sDataFieldName);

			_oContext.event.fireBindingChanged().done();
		}

		/**
		 * Bind /unbind aggregation
		 * @param {sap.ui.core.Control} oControl aggregation template
		 * @param {boolean} bChecked if true, oControl be a template for an aggregation
		 * @param {Array<sap.ui.core.Control>=} aControlSiblings optional list of siblings to be disconnected in case of bind.
		 *                                      not relevant in case of unbind.
		 *
		 * @name _setAsTemplateChange
		 * @function
		 * @private
		 */
		function _setAsTemplateChange(oControl, bChecked, aControlSiblings) {
			if (bChecked) {
				(aControlSiblings || []).forEach(function (oCtrl) {
					W5gUtils.removeControl(oCtrl, _oXmlManipulator, true);
				});
				_bindAggregation(oControl, _oDataModel.getProperty("/viewES"));
			} else {
				_unbindAggregation(oControl);
			}
		}

		/**
		 * Bind /unbind aggregation
		 *
		 * @param {sap.ui.core.Control} oControl control
		 * @param {string} sEntitySetName new aggregation data set
		 *
		 * @name _entitySetChange
		 * @function
		 * @private
		 */
		function _entitySetChange(oControl, sEntitySetName) {
			if (oControl === _oOpenedView) {
				_setViewEntitySet(sEntitySetName, true);
			} else {
				if (sEntitySetName === _sUnbindKey) {
					_unbindAggregation(oControl);
				} else {
					_bindAggregation(oControl, sEntitySetName);
				}
			}
		}

		/**
		 * Bind /unbind property
		 *
		 * @param {sap.ui.core.Control} oControl control
		 * @param {object} oValue new property value
		 * @param {object} oProperty property object
		 * @param {function=} fnResetValueState reset value state callback if any
		 * @param {sap.ui.commons.TextField=} oInputField reference to associated input control
		 *
		 * @name _propertyChange
		 * @function
		 * @private
		 */
		function _propertyChange(oControl, oValue, oProperty, fnResetValueState, oInputField) {
			var bBound = !!BindingUtils.getBindingInfo(oControl, oProperty.name),
				oPromise;

			// on some flows like binding the emit in properties model set is not reached
			_oXmlManipulator.emitPropertyChangeEvent(oControl, oProperty.name, oValue);

			if (W5gUtils.isBindingValue(oValue)) {
				if (fnResetValueState) {
					fnResetValueState();
				}
				_bindProperty(oControl, oProperty.name, oValue.slice(1, -1));
			} else {
				if (bBound) {
					oPromise = _unbindProperty(oControl, oProperty.name);
				}
				Q(oPromise).then(function () {
					if (oInputField) {
						oInputField.setValue(oValue);
					}
				}).done();
			}
		}

		/**
		 * Checks if the given control can be a template
		 *
		 * @param {sap.ui.core.Control} oControl control
		 * @return {boolean} Returns true if the given control can be a template
		 *
		 * @name _canBeATemplate
		 * @function
		 * @private
		 */
		function _canBeATemplate(oControl) {
			if (oControl === _oOpenedView) {
				return false;
			}
			var mAggregations = UNSUPPORTED_TEMPLATES.aggregations,
				oParent = oControl.getParent(),
				sClassName = oControl.getMetadata()._sClassName;

			if (UNSUPPORTED_TEMPLATES.controls.indexOf(sClassName) !== -1) {
				return false;
			}

			while (oParent) {
				sClassName = oParent.getMetadata()._sClassName;
				if (sClassName in mAggregations) {
					if ((sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.Utils.getAggregationByName(oParent, mAggregations[sClassName])).indexOf(oControl) !== -1) {
						return false;
					}
					break;
				}
				oParent = oParent.getParent();
			}
			return true;
		}

		/**
		 * Create tooltip for "set as template" editor of the given <code>oControl</code> control
		 *
		 * @param {sap.ui.core.Control} oControl control
		 * @param {object} oParentAggregationInfo parent aggregation info
		 * @returns {string} Created tooltip
		 *
		 * @name _createSetAsTemplateTooltip
		 * @function
		 * @private
		 */
		function _createSetAsTemplateTooltip(oControl, oParentAggregationInfo) {
			var sTooltip = "",
				oParent = oParentAggregationInfo.parent;
			if (oControl && oParent) {
				if (_oDataModel.getProperty("/isTemplate")) {
					sTooltip = W5gUtils.getText("binding_unset_as_template_tooltip", [
						oParentAggregationInfo.aggregationName,
						W5gUtils.getControlName(oParent)
					]);
				} else {
					sTooltip = W5gUtils.getText("binding_set_as_template_tooltip", [
						W5gUtils.getControlName(oControl),
						oParentAggregationInfo.aggregationName,
						W5gUtils.getControlName(oParent)
					]);
				}
			}
			return sTooltip;
		}

		/**
		 * Sets entity set key for opened view and adjusts text of unbound item
		 *
		 * @param {string} sViewSet Entity set for the opened view
		 * @param {boolean=} bPersist Whether to store the given <code>sViewSet</code> entity set in the project.json file
		 *
		 * @name _setViewEntitySet
		 * @function
		 * @private
		 */
		function _setViewEntitySet(sViewSet, bPersist) {
			_adjustEntitySets(_.trimLeft(sViewSet, "/"));
			_oDataModel.setProperty("/viewES", BindingUtils.normalizeDataSetPath(sViewSet));
			if (_oDataModel.getProperty("/entitySets/length")) {
				//adjusts text of unbound item
				_oDataModel.setProperty("/entitySets/0/name", _mTexts[sViewSet === _sUnbindKey ? "NOT_DEFINED" : "UNBIND"]);
			}
			if (bPersist && _oOpenedDocument) {
				BindingUtils.getDataBindingSetting(_oOpenedDocument).then(function (oDataBinding) {
					var oDocumentBinding = oDataBinding[BindingUtils.getDataBindingSettingKey(_oOpenedDocument)];

					if (sViewSet === _sUnbindKey) {
						sViewSet = "";
					} else {
						sViewSet = _.trimLeft(sViewSet, "/");
					}
					if ((oDocumentBinding || {}).entitySet !== sViewSet) {
						return BindingUtils.setDataBindingSetting(_oOpenedDocument, oDataBinding, sViewSet);
					}
				}).done();
			}
		}

		/**
		 * Loads metadata
		 *
		 * @returns {Q} Returns promise
		 *
		 * @name _loadMetadata
		 * @function
		 * @private
		 */
		function _loadMetadata() {
			return BindingUtils.getDataBindingSetting(_oOpenedDocument).then(function(oDataBinding) {
				var sKey = BindingUtils.getDataBindingSettingKey(_oOpenedDocument),
					oDocumentBinding = oDataBinding[sKey],
					sViewResourcePath = (oDocumentBinding || {}).entitySet;

				return ResourcesHelper.loadMetadata(_oOpenedDocument).then(function(aEntitySets) {
					aEntitySets = aEntitySets && aEntitySets.slice(); //copy entitySets if exists

					//sViewResourcePath === "" means that user already decided to continue working
					//with the current document without default entity set
					if (sViewResourcePath) {
						if (!BindingUtils.getEntityByKeySet(aEntitySets, sViewResourcePath)) {
							sViewResourcePath = _sUnbindKey;
							// .project.json has wrong entitySet info
							delete oDataBinding[sKey];
							BindingUtils.setDataBindingSetting(_oOpenedDocument, oDataBinding, undefined).done();
						}
					}
					if (!oDocumentBinding) {
						//try to get information from custom data (old implementation)
						sViewResourcePath = _getViewSetFromCustomData();

						if (!BindingUtils.getEntityByKeySet(aEntitySets, sViewResourcePath)) {
							sViewResourcePath = _sUnbindKey;
						} else {
							//add this info into .project.json
							BindingUtils.setDataBindingSetting(_oOpenedDocument, oDataBinding, sViewResourcePath).done();
						}
					}

					if (aEntitySets) {
						aEntitySets.unshift({
							name: _mTexts["UNBIND"],
							properties: [],
							key: _sUnbindKey
						});
					}

					_resetDataModel(
						{
							viewES: sViewResourcePath || _sUnbindKey
						},
						aEntitySets
					);
				});
			});
		}
// End
// Private variables and methods

		/**
		 * WYSIWYG data binding helper
		 *
		 * @type {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gBindingHelper}
		 */
		var W5gBindingHelper = {
			/**
			 * Initializes the helper
			 *
			 * @param {object} oContext W5g service context
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gBindingHelper.init
			 * @function
			 * @public
			 */
			init: _.once(function (oContext) {
				jQuery.sap.assert(oContext, "oContext must be a valid service context");
				jQuery.sap.assert(_.get(oContext, "service.usernotification"), "usernotification service does not exists in the given context");
				jQuery.sap.assert(_.get(oContext, "service.ui5icons"), "ui5icons service does not exists in the given context");
				jQuery.sap.assert(_.get(oContext, "event"), "service event does not exists in the given context");

				ResourcesHelper.attachMetadataChanged(function () {
					W5gBindingHelper.setSelection(_oControl).done();
				});

				_oContext = oContext;

				_mTexts = {
					UNBIND: W5gUtils.getText("binding_unbind_item"),
					NOT_DEFINED: W5gUtils.getText("binding_not_defined_item"),
					UNBIND_ENTITY_SET: W5gUtils.getText("binding_unbind_data_set_warning_message"),
					BIND_ENTITY_SET: W5gUtils.getText("binding_bind_data_set_warning_message"),
					BIND_ENTITY_SET2: W5gUtils.getText("binding_bind_data_set_warning2_message")
				};
			}),

			/**
			 * Gets data model
			 *
			 * @return {sap.ui.model.json.JSONModel} data model
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gBindingHelper.getDatModel
			 * @function
			 * @public
			 */
			getDataModel: function () {
				return _oDataModel;
			},

			/**
			 * Sets document metadata
			 *
			 * @param {object} oDocument
			 * @param {sap.ui.core.mvc.View} oOpenedView Reference to the current opened view
			 * @param {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.serialization.XmlManipulator} oXmlManipulator
			 * @return {Q} promise
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gBindingHelper.setDocumentData
			 * @function
			 * @public
			 */
			setDocumentData: function (oDocument, oOpenedView, oXmlManipulator) {
				_oOpenedDocument = oDocument;
				_oOpenedView = oOpenedView;
				_oXmlManipulator = oXmlManipulator;

				return _loadMetadata();
			},

			/**
			 * Sets selected control
			 *
			 * @param {?sap.ui.core.Control} oControl selected control
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gBindingHelper.setSelection
			 * @function
			 * @public
			 */
			setSelection: function (oControl) {
				var oQ = Q();
				if (!_oOpenedView || oControl && _oOpenedView.__XMLRootNode !== oControl.__XMLRootNode) {
					return oQ;
				}

				if (ResourcesHelper.isMetadataReloadNeeded()) {
					oQ = _loadMetadata();
				}

				_oControl = oControl;

				return oQ.then(function() {
					if (!(_oDataModel && _oDataModel.getProperty("/isMetadataExists")) || !oControl) {
						return;
					}

					var oParentAggregationInfo = W5gUtils.getWYSIWYGParentAggregationInfo(oControl),
						oBindingInfo = BindingUtils.getClosestBindingInfo(oControl),
						sResourcePath = _sUnbindKey;

					_resetDataModel({
						isRoot: oControl === _oOpenedView,
						isTemplateVisible: _canBeATemplate(oControl),
						isTemplate: W5gUtils.isControlTemplate(oControl),
						templateTooltip: _createSetAsTemplateTooltip(oControl, oParentAggregationInfo)
					});

					if (oBindingInfo) {
						if (oBindingInfo.model) {
							//TODO: find the use case and decide what to do
							//_oContext.service.usernotification.info(W5gUtils.getText("binding_not_default_model_message")).done();
							_oDataModel.setProperty("/isDefaultModel", false);
							return;
						}
						sResourcePath = oBindingInfo.path;
						if (!jQuery.sap.startsWith(sResourcePath, "/")) { //navigation property
							sResourcePath = _oDataModel.getProperty("/viewES") + "/" + sResourcePath;
						}
					}

					if (sResourcePath === _sUnbindKey) {
						_oDataModel.setProperty("/isTemplate", false);
					}
					_oDataModel.setProperty("/controlES", BindingUtils.normalizeDataSetPath(sResourcePath));
				});
			},

			/**
			 * Create and opens the SAPUI5 icons dialog
			 *
			 * @param {object} oEvent an event object
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gBindingHelper.openIconDialog
			 * @function
			 * @public
			 */
			openIconDialog: function (oEvent) {
				var oInputField = oEvent.getSource(),
					oBindingContext = oInputField.getBindingContext(),
					oProperty = oBindingContext.getObject(),
					oModel = this.getModel(),
					oControl = oModel.getControl(),
					fnResetValueState = function () {
						oModel.setProperty("rejectedValue", undefined, oBindingContext);
					};

				_oContext.service.ui5icons.openIconDialog(oInputField.getValue()).then(function (oResult) {
					if (oResult.accepted) {
						_propertyChange(oControl, "sap-icon://" + oResult.icon, oProperty, fnResetValueState, oInputField);
					}
				});
			},

			/**
			 * Starts property binding process
			 *
			 * @this {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.properties.PropertyEditor}
			 *
			 * @param {object} oEvent an event object
			 * @param {sap.ui.commons.TextField} oInputField reference to associated input control
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gBindingHelper.startPropertyBinding
			 * @function
			 * @public
			 */
			startPropertyBinding: function (oEvent, oInputField) {
				var oBindingContext = oEvent.getSource().getBindingContext(),
					oProperty = oBindingContext.getObject(),
					oModel = this.getModel(),
					oControl = oModel.getControl(),
					oBindingInfo = oControl.getBindingInfo(oProperty.name),
					oBinding = oBindingInfo && oBindingInfo.parts && oBindingInfo.parts[0],
					sResourcePath = _sUnbindKey,
					sValue = "",
					aEntitySets = _oDataModel.getProperty("/entitySets"),
					sDataSet = _oDataModel.getProperty("/controlES"),
					fnResetValueState = function () {
						oModel.setProperty("rejectedValue", undefined, oBindingContext);
					};

				if (oBinding) {
					sResourcePath = oBinding.model ? "" : oBinding.path;
					sValue = oBindingInfo.bindingString || "{" + sResourcePath + "}";
				} else {
					sValue = oInputField.getValue();
					if (sValue) {
						sResourcePath = "";
					}
				}

				if (sDataSet === _sUnbindKey) {
					sDataSet = _oDataModel.getProperty("/viewES");
				}

				PropertyBindingDialogHelper.showPropertyEditor({
					controlName: oModel.getProperty("/controlName"),
					propertyName: oProperty.title,
					propertyType: oProperty.type,
					propertyTypeName: oProperty.typeName,
					propertyDefaultValue: ControlMetadata.getDefaultPropertyValue(oControl, oProperty.name),
					fields: (BindingUtils.getEntityByKeySet(aEntitySets, sDataSet) || {}).properties || [],
					selected: sResourcePath,
					value: sValue
				}).then(function (oResult) {
					var /**string*/ fullPropertyName = oControl.getMetadata().getName() + "." + oProperty.name;
					if (oResult.accepted) {
						UsageMonitoringUtils.report("data_binding_OK", fullPropertyName);
						_propertyChange(oControl, oResult.value, oProperty, fnResetValueState, oInputField);
					} else {
						UsageMonitoringUtils.report("data_binding_CANCEL", fullPropertyName);
					}
				}).done();
			},

			/**
			 * Starts property binding process
			 *
			 * @this {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.properties.PropertyEditor}
			 *
			 * @param {object} oEvent an event object
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gBindingHelper.onPropertyChange
			 * @function
			 * @public
			 */
			onPropertyChange: function (oEvent) {
				var oItem = oEvent.getParameter("selectedItem"),
					oContext = oItem && oItem.getBindingContext("dataModel"),
					oValue = oContext ? oContext.getProperty("value") : oEvent.getParameter("newValue"),
					oControl = this.getModel().getControl(),
					oProperty = oEvent.getSource().getBindingContext().getObject();

				//verify change property passed without error
				if(oEvent && oEvent.getSource().getProperty("valueState") !== sap.ui.core.ValueState.Error) {
					_propertyChange(oControl, oValue, oProperty);
				}
			},

			/**
			 * Starts aggregation binding process
			 *
			 * @this {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.properties.DataBindingEditor#CheckBox}
			 *
			 * @param {object} oEvent an event object
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gBindingHelper.onSetAsTemplateChange
			 * @function
			 * @public
			 */
			onSetAsTemplateChange: function (oEvent) {
				var bChecked = oEvent.getParameter("checked"),
					oControl = this.getModel().getControl(),
					oParentAggregationInfo,
					aAllChildren,
					aControlSiblings = null,
					sMessage = null;

				if (bChecked) {
					oParentAggregationInfo = W5gUtils.getWYSIWYGParentAggregationInfo(oControl);
					aAllChildren = sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.Utils.getAggregationByName(
						oParentAggregationInfo.parent, oParentAggregationInfo.aggregationName
					);
					if (aAllChildren.length > 1) {
						//selected control has sibling(s)
						aControlSiblings = aAllChildren.filter(function (oSibling) {
							return oSibling !== oControl;
						});
						sMessage = [_mTexts["BIND_ENTITY_SET"]]
							.concat(
							aControlSiblings.map(function (oSibling) {
								return " * " + W5gUtils.getControlName(oSibling) + ": " + oSibling.getId();
							}))
							.join("\n");
					} else {
						sMessage = _mTexts["BIND_ENTITY_SET2"];
					}
				} else {
					sMessage = _mTexts["UNBIND_ENTITY_SET"];
				}

				if (sMessage) {
					_oContext.service.usernotification.confirm(sMessage).then(function (oResult) {
						if (oResult.bResult) {
							_setAsTemplateChange(oControl, bChecked, aControlSiblings);
						} else { //revert changes
							_oDataModel.setProperty("/isTemplate", !bChecked);
						}
					}).done();
				} else {
					_setAsTemplateChange(oControl, bChecked);
				}
			},

			/**
			 * Starts aggregation binding process
			 *
			 * @this {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.properties.DataBindingEditor#DropdownBox}
			 *
			 * @param {object} oEvent an event object
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gBindingHelper.onEntitySetChange
			 * @function
			 * @public
			 */
			onEntitySetChange: function (oEvent) {
				var sEntitySetName = oEvent.getParameter("selectedItem").getBindingContext("dataModel").getProperty("key"),
					oEditor = this,
					oControl = this.getModel().getControl();

				_oContext.service.usernotification.confirm(_mTexts["UNBIND_ENTITY_SET"]).then(function (oResult) {
					if (oResult.bResult) {
						_entitySetChange(oControl, sEntitySetName);
					} else { //revert changes
						sEntitySetName = _oDataModel.getProperty("/controlES");
						if (sEntitySetName === _sUnbindKey) {
							sEntitySetName = _oDataModel.getProperty("/viewES");
						}
						oEditor.setSelectedKey(BindingUtils.normalizeDataSetPath(sEntitySetName));
					}
				}).done();
			},

			/**
			 * Unbind aggregation if a template was removed
			 *
			 * @param {sap.ui.core.Control} oControl control to be removed
			 * @return  {function | null} Returns callback function if needed
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gBindingHelper.beforeRemoveControl
			 * @function
			 * @public
			 */
			beforeRemoveControl: function (oControl) {
				if (_oDataModel.getProperty("/isTemplate")) {
					var oParentAggregationInfo = W5gUtils.getWYSIWYGParentAggregationInfo(oControl),
						oParent = oParentAggregationInfo.parent;

					if (oParent) {
						//unbind aggregation only after removing the control
						return function () {
							oParent.unbindAggregation(oParentAggregationInfo.aggregationName, true);
							oParent.data("sapDtResourcePath", null);
							_oXmlManipulator.emitPropertyChangeEvent(oParent, oParentAggregationInfo.aggregationName);
						};
					}
				}
				return null;
			}
		};
		return W5gBindingHelper;
	}
);
