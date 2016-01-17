/*
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

/**
 * Factory class to create controls that are hosted by <code>sap.ui.comp.SmartField</code>.
 * 
 * @private
 * @name sap.ui.comp.smartfield.ODataControlFactory
 * @author SAP SE
 * @version 1.32.7
 * @since 1.28.0
 * @param {jquery.sap.global} jQuery a reference to the jQuery implementation
 * @param {sap.m.TextArea} TextArea a reference to the MultiLiteText implementation
 * @param {sap.m.Link} Link a reference to the link implementation
 * @param {sap.m.CheckBox} CheckBox a reference to the check box implementation
 * @param {sap.m.ComboBox} ComboBox a reference to the combo box implementation
 * @param {sap.m.DatePicker} DatePicker a reference to the DatePicker implementation
 * @param {sap.m.FlexItemData} FlexItemData a reference to the FlexItemData implementation
 * @param {FlexJustifyContent} FlexJustifyContent a reference to the FlexJustifyContent implementation
 * @param {sap.m.HBox} HBox a reference to the HBox implementation
 * @param {sap.m.Input} Input a reference to the Input implementation
 * @param {sap.m.InputType} InputType a reference to the InputType implementation
 * @param {sap.m.Select} Select a reference to the select implementation
 * @param {sap.m.Text} Text a reference to the Text implementation
 * @param {sap.ui.core.Renderer} Renderer a reference to the ui.core.Renderer implementation
 * @param {sap.ui.core.TextAlign} TextAlign a reference to the ui.core.TextAlign implementation
 * @param {sap.ui.comp.navpopover.SmartLink} SmartLink a reference to the smart link implementation
 * @param {sap.ui.comp.smartfield.ControlFactoryBase} ControlFactoryBase a reference to the control factory base class implementation
 * @param {sap.ui.comp.smartfield.FieldControl} FieldControl a reference to the field control implementation
 * @param {sap.ui.comp.smartfield.ODataControlSelector} ODataControlSelector a reference to the OData control selector implementation
 * @param {sap.ui.comp.smartfield.ODataHelper} ODataHelper a reference to the OData helper implementation
 * @param {sap.ui.comp.smartfield.ODataTypes} ODataTypes a reference to the OData types implementation
 * @param {sap.m.ObjectNumber} ObjectNumber a reference to the object number implementation
 * @param {sap.m.ObjectIdentifier} ObjectIdentifier a reference to the object identifier implementation
 * @return {sap.ui.comp.smartfield.ODataControlFactory} new control factory instance.
 */
sap.ui.define([	"jquery.sap.global", "sap/m/TextArea", "sap/m/Link", "sap/m/CheckBox", "sap/m/ComboBox", "sap/m/DatePicker", "sap/m/FlexItemData", "sap/m/FlexJustifyContent", "sap/m/HBox", "sap/m/Input", "sap/m/InputType", "sap/m/Select", "sap/m/Text", "sap/ui/core/Renderer", "sap/ui/core/TextAlign", "sap/ui/comp/navpopover/SmartLink", "sap/ui/comp/smartfield/ControlFactoryBase", "sap/ui/comp/smartfield/FieldControl", "sap/ui/comp/smartfield/ODataControlSelector", "sap/ui/comp/smartfield/ODataHelper", "sap/ui/comp/smartfield/ODataTypes", "sap/m/ObjectNumber", "sap/m/ObjectIdentifier" ], function(jQuery, TextArea, Link, CheckBox, ComboBox, DatePicker, FlexItemData, FlexJustifyContent, HBox, Input, InputType, Select, Text, Renderer, TextAlign, SmartLink, ControlFactoryBase, FieldControl, ODataControlSelector, ODataHelper, ODataTypes, ObjectNumber, ObjectIdentifier) { // EXC_JSHINT_002 // EXC_JSHINT_037 // EXC_JSHINT_034																																																																					// EXC_JSHINT_034
	"use strict";

	/**
	 * @private
	 * @constructor
	 * @param {sap.ui.model.odata.ODataModel} oModel the OData model currently used
	 * @param {sap.ui.core.Control} oParent the parent control
	 * @param {object} oMetaData the meta data used to initialize the factory
	 * @param {string} oMetaData.entitySet the name of the OData entity set
	 * @param {string} oMetaData.model the name of the model
	 * @param {string} oMetaData.path the path identifying the OData property
	 */
	var ODataControlFactory = ControlFactoryBase.extend("sap.ui.comp.smartfield.ODataControlFactory", {
		constructor: function(oModel, oParent, oMetaData) {
			ControlFactoryBase.apply(this, [
				oModel, oParent
			]);
			this.sName = "ODataControlFactory";
			this._oMetaData = {
				annotations: {}
			};

			this._oMeta = oMetaData;
			this._oHelper = new ODataHelper(oModel, this._oBinding);
			this._oFieldControl = new FieldControl(oParent, this._oHelper);
			this._oTypes = new ODataTypes(oParent);
			this._oSelector = new ODataControlSelector(this._oMetaData, oParent, this._oTypes);
			this._bInitialized = false;
			this.bPending = false;
		}
	});

	/**
	 * Initializes the meta data.
	 * 
	 * @param {object} oMetaData the meta data used to initialize the factory
	 * @param {string} oMetaData.entitySet the name of the OData entity set
	 * @param {string} oMetaData.entityType the name of the OData entity type
	 * @param {string} oMetaData.property the name of the OData property
	 * @param {string} oMetaData.model the name of the model
	 * @param {string} oMetaData.path the path identifying the OData property
	 * @private
	 */
	ODataControlFactory.prototype._init = function(oMetaData) {
		// set the name of the model used, binding path of the property (complex or simple), entity set and entity type.
		this._oMetaData.model = oMetaData.model;
		this._oMetaData.path = oMetaData.path;
		this._oMetaData.entitySet = oMetaData.entitySetObject || this._oHelper.oMeta.getODataEntitySet(oMetaData.entitySet);
		this._oMetaData.entityType = oMetaData.entityType || this._oHelper.oMeta.getODataEntityType(this._oMetaData.entitySet.entityType);
		this._oMetaData.navigationPath = oMetaData.navigationPath || null; 
		
		if (this._oModel) {
			// get the property, considering navigation properties and complex types.
			this._oHelper.checkNavigationProperty(this._oMetaData, this._oParent);
			this._oHelper.getProperty(this._oMetaData);

			// make sure that no exceptions occur, if the property is not valid
			// => necessary for extensibility use cases, if an extension field has been deleted and the UI has not yet been adapted.
			if (this._oMetaData.property && this._oMetaData.property.property) {
				// now get the remaining annotations, text, unit of measure and value list.
				this._oMetaData.annotations.text = this._oHelper.getTextProperty2(this._oMetaData);
				
				this._oMetaData.annotations.uom = this._oHelper.getUnitOfMeasure2(this._oMetaData);
				this._oHelper.getValueListData(this._oMetaData);

				this._oMetaData.annotations.lineitem = this._oHelper.getAnalyzer().getLineItemAnnotation(this._oMetaData.entitySet.entityType);
				this._oHelper.getUOMValueListAnnotationPath(this._oMetaData);
				this._oMetaData.annotations.semantic = this._oHelper.getAnalyzer().getSemanticObjectAnnotationFromProperty(this._oMetaData.property.property);				
			} else {
				// log the error situation.
				jQuery.sap.log.warning("SmartField: Property " + oMetaData.path + " does not exist", "SmartField: Property " + oMetaData.path + " does not exist", "sap.ui.comp.smartfield.ODataControlFactory"); // EXC_JSHINT_037
			}
		} else {
			this._oMetaData.modelObject = oMetaData.modelObject;
			this._oMetaData.property = oMetaData.property;
			this._oMetaData.annotations.text = oMetaData.annotations.text;
			this._oMetaData.annotations.uom = oMetaData.annotations.uom;
			this._oMetaData.annotations.valuelist = oMetaData.annotations.valuelist;
			this._oMetaData.annotations.valuelistType = oMetaData.annotations.valuelistType;
			this._oMetaData.annotations.lineitem = oMetaData.annotations.lineitem;
			this._oMetaData.annotations.semantic = oMetaData.annotations.semantic;
			this._oMetaData.annotations.valuelistuom = oMetaData.annotations.valuelistuom;
		}
	};

	/**
	 * Creates a control instance based on OData meta data for display-only use cases.
	 * 
	 * @return {sap.ui.core.Control} the new control instance.
	 * @private
	 */
	ODataControlFactory.prototype._createEdmDisplay = function() {
		var oConfig, oInnerControl, mAttributes, mOptions, bMasked, bDatePicker, bObjectIdentifier, oTextAnnotation, that = this, mNames = {
			width: true,
			textAlign: true
		};

		// check for combo box.
		var oCheck = this._oSelector.checkComboBox(true);

		if (oCheck && oCheck.combobox) {
			return this._createComboBox({
				annotation: oCheck.annotation,
				noDialog: true,
				noTypeAhead: true
			}, true);
		}

		// check for link
		if (this._checkLink()) {
			return this._createLink();
		}

		// prepare the attributes.
		mAttributes = this.createAttributes(null, this._oMetaData.property, mNames);

		// check for date and format correctly.
		bDatePicker = this._oSelector.checkDatePicker();
		
		if (bDatePicker) {
			mOptions = this.getFormatSettings("dateFormatSettings");
			mAttributes.text = {
				model: this._oMetaData.model,
				path: this._oMetaData.path,
				type: this._oTypes.getType(this._oMetaData.property, mOptions, {
					displayFormat: "Date"
				})
			};
		} else {
			mAttributes.text = {
				model: this._oMetaData.model,
				path: this._oHelper.getEdmDisplayPath(this._oMetaData),
				type: this._oTypes.getType(this._oMetaData.property)
			};
		}

		if (this._oMetaData.property && this._oMetaData.property.property) {
			// password handling
			bMasked = this._oHelper.oAnnotation.isMasked(this._oMetaData.property.property);
			
			if (bMasked) {
				mAttributes.text.formatter = function(oText) {
					if (oText) {
						return oText.replace(new RegExp(".", "igm"), "*");
					}
					return oText;
				};
			}

			// check for a text annotation.
			oTextAnnotation = this._oHelper.oAnnotation.getText(this._oMetaData.property.property);
			
			if (oTextAnnotation) {
				bObjectIdentifier = this._oSelector.useObjectIdentifier(bDatePicker, bMasked);

				if (bObjectIdentifier) {
					delete mAttributes.width;
					delete mAttributes.textAlign;
					mAttributes.text = {
						path: this._oMetaData.path
					};
					mAttributes.title = {
						path: this._oHelper.getEdmDisplayPath(this._oMetaData)
					};
				} else {
					mAttributes.text = {};
					mAttributes.text.parts = [];
					mAttributes.text.parts.push(this._oMetaData.path);
					mAttributes.text.parts.push(this._oHelper.getEdmDisplayPath(this._oMetaData));
	
					mAttributes.text.formatter = function(sId, sDescription) {
						if (sId && sDescription) {
							return that._formatDisplayBehaviour("defaultInputFieldDisplayBehaviour", sId, sDescription);
						}
	
						return sId ? sId : "";
					};
				}
			} else if (this._oSelector.checkCheckBox()) {
				mAttributes.text.formatter = function(sValue) {			
					return that._formatDisplayBehaviour("defaultCheckBoxDisplayBehaviour", sValue);
				};				
			}
		}

		if (bObjectIdentifier) {
			oInnerControl = new ObjectIdentifier(mAttributes);
		} else {
			oInnerControl = new Text(mAttributes);
		}

		// optional call-back to layout the text as unit for unit of measure.
		oConfig = this._oParent.data("configdata");

		if (!bObjectIdentifier && oConfig && oConfig.configdata && oConfig.configdata.onText) {
			oConfig.configdata.onText(oInnerControl);
		}

		// create a text box.
		return {
			control: oInnerControl,
			onCreate: "_onCreate",
			params: {
				noValidations: true
			}
		};
	};

	/**
	 * Creates a control instance based on OData meta data to edit a model property of type <code>Edm.String</code>. Either
	 * <code>sap.m.Input</code> is returned or <code>sap.m.Combobox</code> depending on configuration.
	 * 
	 * @return {sap.ui.core.Control} the new control instance.
	 * @private
	 */
	ODataControlFactory.prototype._createEdmString = function() {
		var bMasked, bMultiLine, oConfig, mAttributes, oCheck, oControl, mNames = {
			width: true,
			textAlign: true,
			placeholder: true,
			name: true,
			valueState: true,
			valueStateText: true
		};

		// check for check box.
		if (this._oSelector.checkCheckBox()) {
			return this._createCheckBox();
		}

		// check for selection.
		oCheck = this._oSelector.checkSelection();

		if (oCheck.selection) {
			return this._createSelect({
				annotation: oCheck.annotation,
				noDialog: true,
				noTypeAhead: true
			});
		}

		// check for combo box.
		oCheck = this._oSelector.checkComboBox();

		if (oCheck.combobox) {
			return this._createComboBox({
				annotation: oCheck.annotation,
				noDialog: true,
				noTypeAhead: true
			});
		}

		if (this._oMetaData.property && this._oMetaData.property.property) {
			// multi-line-text
			bMultiLine = this._oHelper.oAnnotation.isMultiLineText(this._oMetaData.property.property);
			if (bMultiLine) {
				return this._createMultiLineText(mNames);
			}
		}

		// create the default control.
		mAttributes = this.createAttributes("value", this._oMetaData.property, mNames);
		this._addMaxLength(mAttributes, oCheck.annotation);
		oControl = new Input(mAttributes);

		if (this._oMetaData.property && this._oMetaData.property.property) {
			// password entry
			bMasked = this._oHelper.oAnnotation.isMasked(this._oMetaData.property.property);
			if (bMasked) {
				oControl.setType(InputType.Password);
			}

			// add optional upper case conversion.
			this._handleEventingForEdmString(oControl, this._oMetaData.property);
		}

		// optional call-back to layout the text as unit for unit of measure.
		oConfig = this._oParent.data("configdata");

		if (oConfig && oConfig.configdata && oConfig.configdata.onInput) {
			oConfig.configdata.onInput(oControl);
		}

		return {
			control: oControl,
			onCreate: "_onCreate",
			params: {
				valuehelp: {
					annotation: oCheck.annotation,
					noDialog: !this._oParent.getShowValueHelp(),
					noTypeAhead: !this._oParent.getShowSuggestion(),
					aggregation: "suggestionRows"
				},
				getValue: "getValue",
				type: {
					type: mAttributes.value.type,
					property: this._oMetaData.property
				}
			}
		};
	};

	/**
	 * Adds the maximum length to the attributes for construction call to create a new hosted control instance.
	 * 
	 * @param {map} mAttributes attributes for construction call to create a new hosted control instance
	 * @param {object} oAnnotation the value list annotation
	 * @private
	 */
	ODataControlFactory.prototype._addMaxLength = function(mAttributes, oAnnotation) {
		var oBind, iMaxLength;

		// determine a possible max length.
		oBind = this._oParent.getBindingInfo("value");
		iMaxLength = this._oTypes.getMaxLength(this._oMetaData.property, oBind);

		if (iMaxLength > 0) {
			// suppress the max length, if a value list annotation and type ahead are configured.
			if (!oAnnotation || !this._oParent.getShowSuggestion()) {
				mAttributes.maxLength = iMaxLength;
			}
		}
	};

	/**
	 * Event handler for live changes/changes on the input control. The live-change event handler ensures the value is always in upper case
	 * 
	 * @param {object} oControl attached either to liveChange or change event
	 * @param {object} oProperty the property for which to attach the events
	 * @private
	 */
	ODataControlFactory.prototype._handleEventingForEdmString = function(oControl, oProperty) {
		var bUpperCase, that = this;

		if (oControl) {
			bUpperCase = this._oHelper.oAnnotation.isUpperCase(oProperty.property);

			// handle change event
			oControl.attachChange(function(oEvent) {
				var oNewEvent = {};

				if (oEvent && oEvent.mParameters) {

					var sValue = oEvent.mParameters.value;
					if (bUpperCase && sValue) {
						sValue = sValue.toUpperCase();
						oControl.setValue(sValue);
					}

					oNewEvent.value = sValue;
					oNewEvent.newValue = sValue;

					if (oEvent.mParameters.validated) {
						oNewEvent.validated = oEvent.mParameters.validated;
					}

					if (oControl._oSuggestionPopup && oControl._oSuggestionPopup.isOpen()) {
						if (!oEvent.mParameters.validated) {
							if (oControl._iPopupListSelectedIndex >= 0) {
								return; // ignore that one; change via valuelistprovider will follow as next
							}
						}
					}

					try {
						that._oParent.fireChange(oNewEvent);
					} catch (ex) {
						jQuery.sap.log.warning(ex);
					}
				}
			});
		}
	};

	/**
	 * Creates an instance of <code>sap.m.Combobox</code> based on OData meta data.
	 * 
	 * @param {object} oValueHelp the value help configuration
	 * @param {object} oValueHelp.annotation the value help annotation
	 * @param {boolean} oValueHelp.noDialog if set to <code>true</code> the creation of a value help dialog is omitted
	 * @param {boolean} oValueHelp.noTypeAhead if set to <code>true</code> the type ahead functionality is omitted
	 * @param {boolean} bDisplay if set, the combo box will be rendered as static text
	 * @return {sap.m.Combobox} the new control instance.
	 * @private
	 */
	ODataControlFactory.prototype._createComboBox = function(oValueHelp, bDisplay) {
		var oControl = null;

		var mAttributes, mNames = {
			width: true,
			textAlign: true,
			placeholder: true,
			name: true
		};

		mAttributes = this.createAttributes("selectedKey", this._oMetaData.property, mNames);
		mAttributes.selectionChange = this._oHelper.getSelectionChangeHandler(this._oParent);

		// ensure that combo box always takes maximum width.
		if (mAttributes.width === "") {
			mAttributes.width = "100%";
		}

		if (bDisplay) {
			oControl = this._createDisplayedComboBox(mAttributes);
		} else {
			oControl = new ComboBox(mAttributes);
		}

		return {
			control: oControl,
			onCreate: "_onCreate",
			params: {
				valuehelp: {
					annotation: oValueHelp.annotation,
					aggregation: "items",
					noDialog: oValueHelp.noDialog,
					noTypeAhead: oValueHelp.noTypeAhead
				},
				getValue: "getSelectedKey",
				type: {
					type: mAttributes.selectedKey.type,
					property: this._oMetaData.property
				}
			}
		};
	};

	/**
	 * Creates an instance of <code>sap.m.Combobox</code> but with a adapted sap.m.Text renderer The Rendered is basically taken over and adapted
	 * from sam.m.TextRenderer
	 * 
	 * @param {map} mAttributes control specific attributes
	 * @return {sap.m.Combobox} the new control instance.
	 * @private
	 */
	ODataControlFactory.prototype._createDisplayedComboBox = function(mAttributes) {

		var DisplayComboBox = ComboBox.extend("sap.ui.comp.smartfield.DisplayComboBox", {
			metadata: {
				library: "sap.ui.comp"
			},
			renderer: function(oRm, oControl) {

				// coding adapted from sap.m.Text renderer
				var sWidth = oControl.getWidth(), sText = oControl.getValue(), sTextDir = oControl.getTextDirection(), sTextAlign = oControl.getTextAlign();

				sText.replace(/\r\n/g, "\n"); // normalize text

				// start writing html
				oRm.write("<span");
				oRm.writeControlData(oControl);
				oRm.addClass("sapMText");
				oRm.addClass("sapUiSelectable");

				// write style and attributes
				if (sWidth) {
					oRm.addStyle("width", sWidth);
				} else {
					oRm.addClass("sapMTextMaxWidth");
				}

				if (sTextDir !== sap.ui.core.TextDirection.Inherit) {
					oRm.writeAttribute("dir", sTextDir.toLowerCase());
				}

				if (sTextAlign) {
					sTextAlign = Renderer.getTextAlign(sTextAlign, sTextDir);
					if (sTextAlign) {
						oRm.addStyle("text-align", sTextAlign);
					}
				}

				// finish writing html
				oRm.writeClasses();
				oRm.writeStyles();
				oRm.write(">");

				oRm.writeEscaped(sText);

				// finalize
				oRm.write("</span>");
			}
		});

		return new DisplayComboBox(mAttributes);

	};

	/**
	 * Creates an instance of <code>sap.m.Select</code> based on OData meta data.
	 * 
	 * @param {object} oValueHelp the value help configuration
	 * @param {object} oValueHelp.annotation the value help annotation
	 * @param {boolean} oValueHelp.noDialog if set to <code>true</code> the creation of a value help dialog is omitted
	 * @param {boolean} oValueHelp.noTypeAhead if set to <code>true</code> the type ahead functionality is omitted
	 * @return {sap.m.Select} the new control instance
	 * @private
	 */
	ODataControlFactory.prototype._createSelect = function(oValueHelp) {
		var mAttributes, mNames = {
			width: true,
			name: true
		};

		mAttributes = this.createAttributes("selectedKey", this._oMetaData.property, mNames);
		mAttributes.change = this._oHelper.getSelectionChangeHandler(this._oParent);

		if (mAttributes.width === "") {
			mAttributes.width = "100%";
		}

		return {
			control: new Select(mAttributes),
			onCreate: "_onCreate",
			params: {
				valuehelp: {
					annotation: oValueHelp.annotation,
					aggregation: "items",
					noDialog: oValueHelp.noDialog,
					noTypeAhead: oValueHelp.noTypeAhead
				},
				getValue: "getSelectedKey",
				type: {
					type: mAttributes.selectedKey.type,
					property: this._oMetaData.property
				}
			}
		};
	};

	/**
	 * Creates an instance of <code>sap.m.CheckBox</code> based on OData meta data. The Edm.Type of the property is <code>Edm.String</code> with
	 * <code>maxLength</code> <code>1</code>.
	 * 
	 * @return {sap.m.CheckBox} the new control instance.
	 * @private
	 */
	ODataControlFactory.prototype._createCheckBox = function() {
		var mAttributes = this.createAttributes("selected", null, {}, {
			event: "select",
			parameter: "selected"
		});
		mAttributes.editable = (this._oParent.getEditable() && this._oParent.getEnabled() && this._oParent.getContextEditable());
		mAttributes.selected.type = this._oTypes.getAbapBoolean();

		return {
			control: new CheckBox(mAttributes),
			onCreate: "_onCreate",
			params: {
				getValue: "getSelected"
			}
		};
	};

	/**
	 * Creates a control instance based on OData meta data to edit a model property of type <code>Edm.DateTime</code>. Either an instance of
	 * <code>sap.m.Input</code> is returned or <code>sap.m.DatePicker</code>, if the attribute <code>display-format</code> of the OData
	 * property the control is bound to has the value <code>Date</code> or the control configuration is accordingly.
	 * 
	 * @return {sap.ui.core.Control} the new control instance.
	 * @private
	 */
	ODataControlFactory.prototype._createEdmDateTime = function() {
		var mAttributes, mOptions, mNames = {
			width: true,
			textAlign: true,
			placeholder: true,
			name: true
		};

		mAttributes = this.createAttributes(null, this._oMetaData.property, mNames, {
			event: "change",
			parameter: "value"
		});
		mOptions = this.getFormatSettings("dateFormatSettings");

		// check whether a date picker has been configured.
		if (this._oSelector.checkDatePicker()) {
			mAttributes.value = {
				path: this._oMetaData.path,
				type: this._oTypes.getType(this._oMetaData.property, mOptions, {
					displayFormat: "Date"
				}),
				model: this._oMetaData.model
			};

			// set display format to keep data type and date picker control "in sync".
			if (mOptions && mOptions.style) {
				mAttributes.displayFormat = mOptions.style;
			}

			return {
				control: new DatePicker(mAttributes),
				onCreate: "_onCreate",
				params: {
					getValue: "getValue",
					type: {
						type: mAttributes.value.type,
						property: this._oMetaData.property
					}
				}
			};
		}

		// create the default control.
		mAttributes.value = {
			path: this._oMetaData.path,
			model: this._oMetaData.model,
			type: this._oTypes.getType(this._oMetaData.property, mOptions)
		};

		return {
			control: new Input(mAttributes),
			onCreate: "_onCreate",
			params: {
				getValue: "getValue",
				type: {
					type: mAttributes.value.type,
					property: this._oMetaData.property
				}
			}
		};
	};

	/**
	 * Creates a control instance based on OData meta data to edit a model property of type <code>Edm.DateTimeOffset</code>.
	 * 
	 * @return {sap.m.DatePicker} the new control instance.
	 * @private
	 */
	ODataControlFactory.prototype._createEdmDateTimeOffset = function() {
		var mOptions, mAttributes, mNames = {
			width: true,
			textAlign: true,
			placeholder: true,
			name: true
		};

		mOptions = this.getFormatSettings("dateFormatSettings");
		mAttributes = this.createAttributes(null, this._oMetaData.property, mNames, {
			event: "change",
			parameter: "value"
		});
		mAttributes.value = {
			model: this._oMetaData.model,
			path: this._oMetaData.path,
			type: this._oTypes.getType(this._oMetaData.property, mOptions)
		};

		return {
			control: new Input(mAttributes),
			onCreate: "_onCreate",
			params: {
				getValue: "getValue",
				type: {
					type: mAttributes.value.type,
					property: this._oMetaData.property
				}
			}
		};
	};

	/**
	 * Creates a control instance based on OData meta data to edit a model property that is of a numeric <code>Edm type</code>.
	 * 
	 * @return {sap.m.Input} the new control instance.
	 * @private
	 */
	ODataControlFactory.prototype._createEdmNumeric = function() {
		var mAttributes, mNames = {
			width: true,
			textAlign: true,
			placeholder: true,
			name: true
		};

		mAttributes = this.createAttributes("value", this._oMetaData.property, mNames, {
			event: "change",
			parameter: "value"
		});

		return {
			control: new Input(mAttributes),
			onCreate: "_onCreate",
			params: {
				getValue: "getValue",
				type: {
					type: mAttributes.value.type,
					property: this._oMetaData.property
				}
			}
		};
	};

	/**
	 * Creates a control instance based on OData meta data to edit a model property that represents a unit of measure.
	 * 
	 * @return {sap.m.Input} the new control instance.
	 * @private
	 */
	ODataControlFactory.prototype._createEdmUOM = function() {
		var sPath, oInput, oText, mAttributes, oObject, mParams, oBox, oType = null;

		// create the input for the amount.
		mAttributes = this._createEdmUOMAttributes();
		oObject = this._oParent.getObjectBinding(this._oMetaData.model);
		this.addObjectBinding(mAttributes, oObject);
		oInput = new Input(mAttributes);

		// if the unit is not to be displayed, just return the input for the amount.
		if (this._oParent.data("suppressUnit") === "true") {
			mParams = {
				getValue: "getValue"
			};

			// if not currency-code, the type has to be completed.
			if (!this._oHelper.oAnnotation.isCurrency(this._oMetaData.annotations.uom.property.property)) {
				mParams.type = {
					type: mAttributes.value.type,
					property: this._oMetaData.property
				};
			}

			return {
				control: oInput,
				onCreate: "_onCreate",
				params: mParams
			};
		}

		// if not currency-code, the type has to be completed.
		if (!this._oHelper.oAnnotation.isCurrency(this._oMetaData.annotations.uom.property.property)) {
			oType = {
				type: mAttributes.value.type,
				property: this._oMetaData.property
			};
		}

		// create the unit control as smart field.
		sPath = this._oHelper.getUOMPath(this._oMetaData);
		mAttributes = {
			value: {
				model: this._oMetaData.model,
				path: sPath
			},
			change: this._oHelper.getUOMChangeHandler(this._oParent, true),
			textAlign: this._getEdmUOMTextAlignment()
			//useSideEffects: this._oParent.getUseSideEffects()
		};
		this.addObjectBinding(mAttributes, oObject);
		this.mapBindings(mAttributes, {
			"uomEditable": "editable",
			"uomEnabled": "enabled",
			"uomVisible": "visible",
			"mandatory": "mandatory"
		});

		oText = new sap.ui.comp.smartfield.SmartField(mAttributes);
		oText.data("configdata", {
			"configdata": {
				isUOM: !this._oParent.data("configdata"),
				model: this._oMetaData.model,
				navigationPath: this._oMetaData.annotations.uom.navigationPath || null,
				path: sPath,
				entitySetObject: this._oMetaData.annotations.uom.entitySet,
				entityType: this._oMetaData.annotations.uom.entityType,
				property: this._oMetaData.annotations.uom.property,
				annotations: {
					valuelist: this._oMetaData.annotations.valuelistuom
				},
				modelObject: this._oMetaData.modelObject || this._oModel,
				onText: function(oInnerControl) {
					oInput.setLayoutData(new FlexItemData({
						growFactor: 1
					}));
					oText.setLayoutData(new FlexItemData({
						shrinkFactor: 0
					}));

					// mark the unit.
					if (oInnerControl) {						
						oInnerControl.addStyleClass("sapUiCompSmartFieldUnit");
					}
				},
				onInput: function(oInnerControl) {
					oInput.setLayoutData(new FlexItemData({
						growFactor: 1
						//shrinkFactor: 0
					}));
					oText.setLayoutData(new FlexItemData({
						growFactor: 0
						//shrinkFactor: 5
					}));
					
					// mark the unit.
					if (oInnerControl) {
						oInnerControl.addStyleClass("sapUiCompSmartFieldUnit");
					}
				}
			}
		});
		oText.data("errorCheck", "setComplexClientErrorSecondOperandNested");

		// return amount and unit in a horizontal box.
		oInput.addStyleClass("smartFieldPaddingRight");
		oInput.addStyleClass("sapUiCompSmartFieldValue");

		oBox = new HBox({
			justifyContent: FlexJustifyContent.End,
			items: [
				oInput, oText
			],
			fitContainer: true,
			width: this._oParent.getWidth()
		});
		
		// add style for nested smart field, especially display case (text box).
		oBox.addStyleClass("sapUiCompUOM");
		
		if (this._oParent.isContextTable()) {
			oBox.addStyleClass("sapUiCompUOMInTable");					
		}			

		return {
			control: oBox,
			onCreate: "_onCreateUOM",
			params: {
				getValue: true,
				valuehelp: true,
				type: oType
			}
		};
	};

	/**
	 * Creates the arguments for construction call for the unit of measure.
	 * 
	 * @return {map} the arguments for construction call for the unit of measure.
	 * @private
	 */
	ODataControlFactory.prototype._createEdmUOMAttributes = function() {
		var mAttributes = {
			textAlign: this._getEdmUOMTextAlignment(),
			placeholder: this.getAttribute("placeholder"),
			name: this.getAttribute("name"),
			change: this._oHelper.getUOMChangeHandler(this._oParent)
		};

		if (this._oMetaData.annotations.uom && this._oHelper.oAnnotation.isCurrency(this._oMetaData.annotations.uom.property.property)) {
			mAttributes.value = {
				parts: [
					{
						path: this._oMetaData.path
					}, {
						path: this._oHelper.getUOMPath(this._oMetaData)
					}
				],
				model: this._oMetaData.model,
				type: this._oTypes.getCurrencyType(this._oMetaData.property)
			};
		} else {
			mAttributes.value = {
				model: this._oMetaData.model,
				path: this._oMetaData.path,
				type: this._oTypes.getType(this._oMetaData.property)
			};
		}

		return mAttributes;
	};

	/**
	 * Creates the <code>textAlignment</code> attribute value for unit of measure use cases.
	 * 
	 * @returns {string} <code>textAlignment</code> attribute value for unit of measure use cases.
	 * @private
	 */
	ODataControlFactory.prototype._getEdmUOMTextAlignment = function() {
		var sAlignment = this.getAttribute("textAlign");

		if (!sAlignment) {
			sAlignment = TextAlign.Initial;
		}
		
		if (sAlignment === TextAlign.Initial) {
			if (this._oParent.isContextTable()) {
				return TextAlign.End;
			} else {
				if (this._oParent.getEditable() && this._oParent.getContextEditable()) {
					return TextAlign.End;
				}
					
				return TextAlign.Begin;
			}
		}

		return sAlignment;
	};

	/**
	 * Creates a control instance based on OData meta data to display a model property that represents a unit of measure.
	 * 
	 * @return {sap.m.Input} the new control instance.
	 * @private
	 */
	ODataControlFactory.prototype._createEdmUOMDisplay = function() {
		var oValue, oCurrency, sPath, oObject, mAttributes, sAlign, sJustifyContent = FlexJustifyContent.Start, oBox;

		// if the unit is not to be displayed, just return the text field for the amount.
		if (this._oParent.data("suppressUnit") === "true") {
			return this._createEdmDisplay();
		}

		// check text alignment
		sAlign = this._getEdmUOMTextAlignment();

		// create the text field for the amount.
		sPath = this._oHelper.getUOMPath(this._oMetaData);
		mAttributes = {
			text: {
				parts: [
					{
						path: this._oMetaData.path,
						type: this._oTypes.getType(this._oMetaData.property)
					}, {
						path: sPath
					}
				],
				model: this._oMetaData.model,
				formatter: this._oTypes.getCurrencyDisplayFormatter(this._oHelper.oAnnotation.isCurrency(this._oMetaData.property.property)),
				useRawValues: true
			},
			textAlign: sAlign
		};
		oObject = this._oParent.getObjectBinding(this._oMetaData.model);
		this.addObjectBinding(mAttributes, oObject);
		oValue = new Text(mAttributes);

		// create the text field for the unit.
		mAttributes = {
			text: {
				path: sPath
			},
			textAlign: sAlign
		};
		this.addObjectBinding(mAttributes, oObject);
		oCurrency = new Text(mAttributes);

		// mark unit and value.
		oValue.addStyleClass("sapUiCompSmartFieldValue");
		oCurrency.addStyleClass("sapUiCompSmartFieldUnit");

		// return amount and unit in a horizontal box.
		if (sAlign === TextAlign.End) {
			sJustifyContent = FlexJustifyContent.End;
		}

		oBox = new HBox({
			items: [
				oValue, oCurrency
			],
			width: this._oParent.getWidth()
		});

		if (this._oParent.isContextTable()) {
			sJustifyContent = FlexJustifyContent.End;
			oBox.addStyleClass("sapUiCompUOMInTable");					
		}

		oBox.setJustifyContent(sJustifyContent);

		// add style for nested smart field, especially display case (text box).
		oBox.addStyleClass("sapUiCompUOM");
		
		return {
			control: oBox
		};
	};

	/**
	 * Creates a control instance based on OData meta data to display a model property that represents a unit of measure.
	 * 
	 * @return {sap.m.Input} the new control instance.
	 * @private
	 */
	ODataControlFactory.prototype._createEdmUOMObjectNumber = function() {
		var mAttributes, oObject, oObjectNumber, sAlign;

		// check text alignment
		sAlign = this._getEdmUOMTextAlignment();
		
		// create the attributes for the currency.
		if (this._oMetaData.annotations.uom && this._oHelper.oAnnotation.isCurrency(this._oMetaData.annotations.uom.property.property)) {
			mAttributes = {
				number: {
					parts: [
						{
							path: this._oMetaData.path
						}, {
							path: this._oHelper.getUOMPath(this._oMetaData)
						}
					],
					type: this._oTypes.getCurrencyType(this._oMetaData.property)
				},
				unit: {
					path: this._oHelper.getUOMPath(this._oMetaData)
				},
				model: this._oMetaData.model,
				textAlign: sAlign
			};
		} else {
			mAttributes = {
				model: this._oMetaData.model,
				number: {
					path: this._oMetaData.path,
					type: this._oTypes.getType(this._oMetaData.property)
				},
				unit: {
					path: this._oHelper.getUOMPath(this._oMetaData)
				},
				textAlign: sAlign
			};
		}

		oObject = this._oParent.getObjectBinding(this._oMetaData.model);
		this.addObjectBinding(mAttributes, oObject);

		// create the control.
		oObjectNumber = new ObjectNumber(mAttributes);

		// add style for nested smart field, especially display case (text box).
		oObjectNumber.addStyleClass("sapUiCompUOM");
		
		return {
			control: oObjectNumber
		};
	};

	/**
	 * Creates a control instance based on OData meta data.
	 * 
	 * @return {sap.ui.core.Control} the new control instance.
	 * @private
	 */
	ODataControlFactory.prototype._createEdmSemantic = function() {
		var sPath, oInfo = this._oParent.getBindingInfo("value");
		sPath = oInfo.parts[0].path;

		var sLabel = this._oMetaData.property.property["sap:label"];
		if (this._oMetaData.annotations.lineitem && this._oMetaData.annotations.lineitem.labels && this._oMetaData.annotations.lineitem.labels[sPath]) {
			sLabel = this._oMetaData.annotations.lineitem.labels[sPath];
		}

		return {
			control: new SmartLink({
				semanticObject: this._oMetaData.annotations.semantic.semanticObject,
				semanticObjectLabel: sLabel,
				fieldName: sPath,
				text: {
					path: sPath,
					model: this._oMetaData.model
				},
				width: this.getAttribute("width"),
				createControlCallback: jQuery.proxy(function() {
					var oControl = this.createControl(true);
					if (oControl) {
						return oControl.control;
					}
					return null;
				}, this)
			}),
			onCreate: "_onCreate",
			params: {
				getValue: "getInnerControlValue"
			}
		};
	};

	/**
	 * Creates a control instance based on OData meta data.
	 * 
	 * @param {map} mNames map of bind-able attributes
	 * @return {sap.ui.core.Control} the new control instance.
	 * @private
	 */
	ODataControlFactory.prototype._createMultiLineText = function(mNames) {

		// create the default control.
		var mAttributes = this.createAttributes("value", this._oMetaData.property, mNames);

		// var oControl = new TextArea(mAttributes);

		var mOptions = this.getFormatSettings("multiLineSettings");
		mAttributes = jQuery.extend(true, mOptions, mAttributes);

		var oControl = new TextArea(mAttributes);

		// add optional upper case conversion.
		this._handleEventingForEdmString(oControl, this._oMetaData.property);

		return {
			control: oControl,
			onCreate: "_onCreate",
			getValue: "getValue",
			params: {
				type: {
					type: mAttributes.value.type,
					property: this._oMetaData.property
				}
			}
		};

	};

	/**
	 * Checks whether a link needs to be created.
	 * 
	 * @returns {boolean} <code>true</code>, if a link needs to be created, <code>false</code> otherwise.
	 * @private
	 */
	ODataControlFactory.prototype._checkLink = function() {
		var oInfo = this._oParent.getBindingInfo("url");

		if (oInfo) {
			return true;
		}

		if (this._oParent.getUrl()) {
			return true;
		}

		return false;
	};

	/**
	 * Creates a control instance based on OData meta data.
	 * 
	 * @return {sap.ui.core.Control} the new control instance.
	 * @private
	 */
	ODataControlFactory.prototype._createLink = function() {
		var that = this;
		var mAttributes = {
			text: "",
			href: ""
		};
		var oInfo = this._oParent.getBindingInfo("url");
		
		if (oInfo) {
			mAttributes["href"] = this._oBinding.toBinding(oInfo);
		} else {
			mAttributes["href"] = this._oParent.getUrl();
		}

		oInfo = this._oParent.getBindingInfo("value");
		if (oInfo) {
			// text may be Edm.String and may have a text annotation.
			if (this._oMetaData.annotations.text && this._oMetaData.property.property.type === "Edm.String") {
				mAttributes.text = {
					parts: [
						this._oMetaData.path, this._oHelper.getEdmDisplayPath(this._oMetaData)
					],
					formatter: function(sId, sDescription) {
						if (sId && sDescription) {
							return that._formatDisplayBehaviour("defaultInputFieldDisplayBehaviour", sId, sDescription);
						}

						return sId ? sId : "";
					}					
				};		
			} else {			
				mAttributes["text"] = this._oBinding.toBinding(oInfo);
			}
		} else {
			mAttributes["text"] = this._oParent.getValue();
		}

		return {
			control: new Link(mAttributes),
			onCreate: "_onCreate",
			params: {
				noValidation: true
			}
		};
	};

	/**
	 * Creates a control instance based on OData meta data to edit a model property that is of type <code>Edm.Boolean</code>
	 * 
	 * @return {sap.m.CheckBox} the new control instance.
	 * @private
	 */
	ODataControlFactory.prototype._createEdmBoolean = function() {
		var mAttributes, oCheck, oControl, that = this, params = null, bEditable = false;

		bEditable = this._oParent.getEditable() && this._oParent.getEnabled() && this._oParent.getContextEditable();

		oCheck = this._oSelector.checkComboBox();
		if (oCheck.combobox) {
			return this._createComboBox({
				annotation: oCheck.annotation,
				noDialog: true,
				noTypeAhead: true
			}, !bEditable);
		}

		if (bEditable) {

			mAttributes = this.createAttributes("selected", this._oMetaData.property, {}, {
				event: "select",
				parameter: "selected"
			});

			oControl = new CheckBox(mAttributes);
			params = {
				getValue: "getSelected"
			};

		} else {
			mAttributes = this.createAttributes("text", this._oMetaData.property, {
				width: true,
				textAlign: true
			});

			mAttributes.text = {
				model: this._oMetaData.model,
				path: this._oMetaData.path
			};

			mAttributes.text.formatter = function(bValue) {
				return that._formatDisplayBehaviour("defaultCheckBoxDisplayBehaviour", bValue);
			};

			oControl = new Text(mAttributes);
		}

		return {
			control: oControl,
			onCreate: "_onCreate",
			params: params
		};
	};

	/**
	 * Returns the name of a method to create a control.
	 * 
	 * @param {boolean} bBlockSmartLinkCreation if true, SmartLink will not be created
	 * @return {string} the name of the factory method to create the control.
	 * @private
	 */
	ODataControlFactory.prototype._getCreator = function(bBlockSmartLinkCreation) {
		// make sure that no exceptions occur, if the property is not valid
		// => necessary for extensibility use cases, if an extension field has been deleted and the UI has not yet been adapted.
		return this._oSelector.getCreator(bBlockSmartLinkCreation);
	};

	/**
	 * Event handler, that is invoked after successful creation of a nested control.
	 * 
	 * @param {sap.ui.core.Control} oControl the new control
	 * @param {map} mParams parameters to further define the behavior of the event handler
	 * @param {function} mParams.getValue optional call-back to get the current value from the current control
	 * @param {boolean} mParams.valuehelp if set to <code>true</code> a possibly existing value help is attached to the new control
	 * @private
	 */
	ODataControlFactory.prototype._onCreate = function(oControl, mParams) {
		var sGetValue, fControl, bValidations = true, that = this;

		if (mParams) {
			// check for validation.
			if (mParams.noValidation) {
				bValidations = false;
			}

			// add optional value help.
			if (mParams.valuehelp) {
				this._getValueHelpDialogTitle(mParams.valuehelp);
				mParams.valuehelp["analyser"] = this._oHelper.getAnalyzer(this._oModel || this._oMetaData.modelObject);
				this.addValueHelp(oControl, this._oMetaData.property.property, mParams.valuehelp, this._oModel || this._oMetaData.modelObject, function(oEvent) {
					that._oParent.fireValueListChanged({
						"changes": oEvent.mParameters.changes	
					});
				});
			}

			// add optional getValue call-back.
			if (mParams.getValue) {
				sGetValue = mParams.getValue;
				mParams.getValue = function() {
					return oControl[sGetValue]();
				};
			}

			// complete the data: add field-control.
			if (mParams.type) {
				fControl = this._oFieldControl.getMandatoryCheck(mParams.type.property);

				if (fControl) {
					mParams.type.type.oFieldControl = fControl;
				}
			}
		}

		// add optional validations.
		if (bValidations) {
			// if the field is a unit in unit of measure, the error check configuration is set.
			// otherwise apply the default.
			this.addValidations(oControl, this._oParent.data("errorCheck") || "setSimpleClientError");
		}

		if (!this._checkUOM()) {
			oControl.addStyleClass("sapUiCompSmartFieldValue");
		}
	};

	/**
	 * Checks whether the control was created as unit in unit of measure.
	 * 
	 * @returns {boolean} <code>true</code>, if the control was created as unit in unit of measure, <code>false</code> otherwise.
	 * @private
	 */
	ODataControlFactory.prototype._checkUOM = function() {
		var oConfig = this._oParent.data("configdata");

		if (oConfig && oConfig.configdata) {
			if (oConfig.configdata.onInput) {
				return true;
			}

			if (oConfig.configdata.onText) {
				return true;
			}
		}

		return false;
	};

	/**
	 * Calculates the title for the value help dialog.
	 * 
	 * @param {object} oValueHelp the value help configuration
	 * @param {object} oValueHelp.annotation the value help annotation
	 * @param {string} oValueHelp.aggregation the aggregation to attach the value list to
	 * @param {boolean} oValueHelp.noDialog if set to <code>true</code> the creation of a value help dialog is omitted
	 * @param {boolean} oValueHelp.noTypeAhead if set to <code>true</code> the type ahead functionality is omitted
	 * @param {string} oValueHelp.dialogtitle title for the value help dialog
	 * @private
	 */
	ODataControlFactory.prototype._getValueHelpDialogTitle = function(oValueHelp) {
		oValueHelp.dialogtitle = this._oParent.getTextLabel();

		if (!oValueHelp.dialogtitle) {
			oValueHelp.dialogtitle = this._oHelper.oAnnotation.getLabel(this._oMetaData.property.property) || this._oMetaData.property.property.name;
		}
	};

	/**
	 * Event handler, that is invoked after successful creation of a nested control.
	 * 
	 * @param {sap.ui.core.Control} oControl the new control
	 * @param {map} mParams parameters to further define the behavior of the event handler
	 * @param {function} mParams.getValue optional call-back to get the current value from the current control
	 * @param {boolean} mParams.valuehelp if set to <code>true</code> a possibly existing value help is attached to the new control
	 * @private
	 */
	ODataControlFactory.prototype._onCreateUOM = function(oControl, mParams) {
		var aItems, fControl;

		// add validation to amount only.
		aItems = oControl.getItems();
		this.addValidations(aItems[0], "setComplexClientErrorFirstOperand");

		// add optional value call-back.
		if (mParams && mParams.getValue) {
			mParams.getValue = function() {
				return aItems[0].getValue();
			};
		}

		// add optional unit of measure call-back.
		mParams.uom = function() {
			var oContent = aItems[1].getAggregation("_content");
			return oContent.getValue();
		};

		mParams.uomset = function(sValue) {
			var oContent = aItems[1].getAggregation("_content");
			oContent.setValue(sValue);
		};

		// complete the data: add field-control.
		// mind that this is done explicitly only for non currency use-cases.
		if (mParams.type) {
			fControl = this._oFieldControl.getMandatoryCheck(mParams.type.property);

			if (fControl) {
				mParams.type.type.oFieldControl = fControl;
			}
		}
	};

	/**
	 * Binds the properties of the control to formatter functions.
	 * 
	 * @public
	 */
	ODataControlFactory.prototype.bind = function() {
		var that = this, aNames, oConfig, fInit = function(oMetaData, aProperties) {
			try {
				that._init(oMetaData);
				that._setUOMEditState();
				that._bind(aProperties);
			} catch (ex) {
				jQuery.sap.log.warning(ex, null, "sap.ui.comp.smartfield.ODataControlFactory.bind.fInit"); // EXC_JSHINT_037
			}
		};

		if (!this._bInitialized && !this.bPending) {
			this._bInitialized = true;
			aNames = this._oFieldControl.getBindableAttributes();
			oConfig = this._oParent.data("configdata");

			if (oConfig && oConfig.configdata) {
				fInit(this._oMeta, aNames);
			} else if (this._oModel) {
				this.bPending = true;
				this._oModel.getMetaModel().loaded().then(function() {
					that.bPending = false;
					fInit(that._oMeta, aNames);
				});
			}
		}
	};

	/**
	 * Replaces the given bindings by formatter functions.
	 * 
	 * @param {array} aBindings current bindings on <code>SmartField</code>
	 * @private
	 */
	ODataControlFactory.prototype._bind = function(aBindings) {
		var n, mBind, mFormatters;

		// make sure that no exceptions occur, if the property is not valid
		// => necessary for extensibility use cases, if an extension field has been deleted and the UI has not yet been adapted.
		// and if the smart field's value property is not bound, but a URL has to be displayed.
		mFormatters = this._oFieldControl.getControlProperties(this._oMetaData, aBindings);

		for (n in mFormatters) { // EXC_JSHINT_041
			mBind = this._oBinding.fromFormatter(this._oMetaData.model, mFormatters[n]);
			this._oParent.bindProperty(n, mBind);
		}

		// notify that the meta data is available.
		this._oParent.fireInitialise();
	};

	/**
	 * Optionally sets a formatter for the uomEditState property.
	 * 
	 * @private
	 */
	ODataControlFactory.prototype._setUOMEditState = function() {
		var oFormatter, mBind;

		if (this._oFieldControl.hasUomEditState(this._oMetaData)) {
			oFormatter = this._oFieldControl.getUOMEditState(this._oMetaData);

			if (oFormatter) {
				mBind = this._oBinding.fromFormatter(this._oMetaData.model, oFormatter);
				this._oParent.bindProperty("uomEditState", mBind);
			}
		}
	};

	/**
	 * Returns the property of the oData
	 * 
	 * @return {object} the oData property
	 * @public
	 */
	ODataControlFactory.prototype.getDataProperty = function() {
		return this._oMetaData.property;
	};

	/**
	 * Returns the currently available meta data.
	 * 
	 * @returns {map} the currently available meta data
	 * @public
	 */
	ODataControlFactory.prototype.getMetaData = function() {
		return this._oMetaData;
	};

	/**
	 * Frees all resources claimed during the life-time of this instance.
	 * 
	 * @public
	 */
	ODataControlFactory.prototype.destroy = function() {
		this._oFieldControl.destroy();
		this._oSelector.destroy();
		this._oTypes.destroy();
		this._oHelper.destroy();

		this._oHelper = null;
		this._oFieldControl = null;
		this._oTypes = null;
		this._oSelector = null;
		this._oMetaData = null;

		ControlFactoryBase.prototype.destroy.apply(this, []);
	};

	return ODataControlFactory;
}, true);
