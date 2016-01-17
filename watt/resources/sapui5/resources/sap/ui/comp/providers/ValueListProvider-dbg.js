/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */
// -----------------------------------------------------------------------------
// Retrieves the data for a value list from the OData metadata to bind to a given control/aggregation
// 
// -----------------------------------------------------------------------------
sap.ui.define([
	'jquery.sap.global', 'sap/m/Column', 'sap/m/ColumnListItem', 'sap/m/Text', 'sap/m/Token', './BaseValueListProvider', 'sap/ui/core/Item', 'sap/ui/model/Filter', 'sap/ui/model/Sorter', 'sap/ui/model/json/JSONModel', 'sap/ui/comp/util/FormatUtil'
], function(jQuery, Column, ColumnListItem, Text, Token, BaseValueListProvider, Item, Filter, Sorter, JSONModel, FormatUtil) {
	"use strict";

	/**
	 * Retrieves the data for a collection from the OData metadata to bind to a given control/aggregation
	 * 
	 * @constructor
	 * @experimental This module is only for internal/experimental use!
	 * @public
	 * @param {object} mParams - map containing the control,aggregation,annotation and the oODataModel
	 * @author Pavan Nayak, Thomas Biesemann
	 */
	var ValueListProvider = BaseValueListProvider.extend("sap.ui.comp.providers.ValueListProvider", {
		constructor: function(mParams) {
			if (mParams) {
				this.sAggregationName = mParams.aggregation;
				this.bTypeAheadEnabled = mParams.typeAheadEnabled;

			}
			BaseValueListProvider.apply(this, arguments);
			this._onInitialise();
		}
	});

	/**
	 * Metadata is available --> Initialise the relevant stuff
	 * 
	 * @private
	 */
	ValueListProvider.prototype._onInitialise = function() {
		var oEventDelegate;
		if (!this.bTypeAheadEnabled) {
			/**
			 * Delay the fetch of data for standard dropdowns until the rendering is done! This inherently causes only the relevant data to be fetched
			 * from the backend!
			 */
			oEventDelegate = {
				onAfterRendering: function() {
					if (this.bInitialised) {
						this.oControl.removeEventDelegate(oEventDelegate, this);
						this._createDropDownTemplate();
						this._fetchData();
					}
				}
			};
			this.oControl.addEventDelegate(oEventDelegate, this);
		} else if (this.oControl.attachSuggest) {
			// Check if Suggest is supported by the control
			this._fSuggest = jQuery.proxy(function(oEvent) {
				this.oControl = oEvent.getSource();
				if (!this.bInitialised) {
					return;
				}
				if (!this.oTemplate || !this.oControl.data("_hassuggestionTemplate")) {
					this._createSuggestionTemplate();
				}
				var sSearchText = oEvent.getParameter("suggestValue");
				this._fetchData(sSearchText);
			}, this);
			this.oControl.attachSuggest(this._fSuggest);
			this.oControl.setMaxSuggestionWidth("90%"); // Use 90% of available space

			this._handleSelect();
		}
	};

	/**
	 * Creates a template for drop down fields
	 * 
	 * @private
	 */
	ValueListProvider.prototype._createDropDownTemplate = function() {
		this._oTemplate = new Item({
			key: "{" + this.sKey + "}",
			text: this._getDDLBTextBindingPath()
		});
		// ComboBox/MultiComboBox:
		// Sort based on key if displayBehaviour is based on id
		if (this.sDDLBDisplayBehaviour === sap.ui.comp.smartfilterbar.ControlConfiguration.DISPLAYBEHAVIOUR.idOnly || this.sDDLBDisplayBehaviour === sap.ui.comp.smartfilterbar.ControlConfiguration.DISPLAYBEHAVIOUR.idAndDescription) {
			this._oSorter = new Sorter(this.sKey);
		} else {
			// Sort based on description by default
			this._oSorter = new Sorter(this.sDescription);
		}
	};

	/**
	 * Creates a template for multi-column suggest
	 * 
	 * @private
	 */
	ValueListProvider.prototype._createSuggestionTemplate = function() {
		var i = 0, iLen = 0, oTooltip;
		// Create a template
		this._oTemplate = new ColumnListItem();
		if (this._aCols) {
			// remove any exiting columns
			this.oControl.removeAllSuggestionColumns();
			iLen = this._aCols.length;
			for (i = 0; i < iLen; i++) {
				var bDemandPopin = false, sMinScreenWidth = "1px", sWidth = this._aCols[i].width;
				// In the phone mode don't set a fixed width for columns;
				// instead enable demand popin when there are over 2 columns, and not enough space
				if (sap.ui.Device.system.phone) {
					sWidth = undefined;
					if (i >= 2) {
						bDemandPopin = true;
						sMinScreenWidth = (i + 1) * 10 + "rem";
					}
				}
				// add Column headers
				this.oControl.addSuggestionColumn(new Column({
					header: new Text({
						wrapping: false,
						text: this._aCols[i].label,
						tooltip: this._aCols[i].label
					}),
					demandPopin: bDemandPopin,
					popinDisplay: sap.m.PopinDisplay.Inline,
					minScreenWidth: sMinScreenWidth,
					width: sWidth
				}));
				// Tooltip is only possible for certain (string) fields
				// ignore it for all types other than string!
				oTooltip = null;
				if (this._aCols[i].type === "string") {
					oTooltip = {
						path: this._aCols[i].template
					};
				}
				// Add cells to the template
				this._oTemplate.addCell(new Text({
					wrapping: false,
					text: {
						path: this._aCols[i].template,
						type: this._aCols[i].oType
					},
					tooltip: oTooltip
				}));
			}
		}
		this.oControl.data("_hassuggestionTemplate", true);
	};

	/**
	 * Get Text binding path for dropdowns according to the DisplayBehaviour
	 * 
	 * @private
	 * @returns {String} the DDLB text binding path
	 */
	ValueListProvider.prototype._getDDLBTextBindingPath = function() {
		return FormatUtil.getFormattedBindingExpressionFromDisplayBehaviour(this.sDDLBDisplayBehaviour, this.sKey, this.sDescription);
	};

	/**
	 * Handle validation/selection of Item
	 * 
	 * @private
	 */
	ValueListProvider.prototype._handleSelect = function() {
		var fHandleRowSelect = jQuery.proxy(function(oDataModelRow, fCallback) {
			var sKey, sText, oToken;
			if (oDataModelRow) {
				sKey = oDataModelRow[this.sKey];
				sText = oDataModelRow[this.sDescription];
			}
			// Key found
			if (sKey) {
				// MultiInput field --> Create a token with the selected key
				if (this.oControl.addToken) {
					// Format the text as per the displayBehaviour
					sText = FormatUtil.getFormattedExpressionFromDisplayBehaviour(this.sTokenDisplayBehaviour, sKey, sText);
					oToken = new Token({
						key: sKey,
						text: sText,
						tooltip: sText
					});
					oToken.data("row", oDataModelRow);
					if (fCallback) {
						fCallback(oToken);
					}
					// Clear the ValidationText
					delete this.oControl.__sValidationText;
				} else {
					// normal input field --> just set the value
					this.oControl.setValue(sKey);
					// Manually trigger the change event on sapUI5 control since it doesn't do this internally on setValue!
					this.oControl.fireChange({
						value: sKey,
						validated: true
					});
				}
			}
			// do this last --> since when used in an aggregation - some model updates (setting IN/OUT params to ODataModel) destroy this
			// instance/control!
			this._calculateAndSetFilterOutputData([
				oDataModelRow
			]);

		}, this);
		// Selection handling has to be done manually for Multi-Column suggest!
		// add Validators --> Only available for Multi-Input
		if (this.oControl.addValidator) {
			this._fValidator = jQuery.proxy(function(oData) {
				if (!this.bInitialised) {
					return;
				}
				var oRow = oData.suggestionObject, oDataModelRow, sInput = oData.text, aFilters = [], mParams;
				// Selection via suggestion row --> no round trip needed
				if (oRow) {
					// Get the actual datamodel row
					oDataModelRow = this.oODataModel.getData(oRow.getBindingContextPath());
					fHandleRowSelect(oDataModelRow, oData.asyncCallback);
				} else if (sInput) {
					// Validation required from backend
					sInput = jQuery.sap.encodeURL(sInput.toUpperCase());
					// Check if the input text is same as the ValidationText
					if (this.oControl.__sValidationText !== sInput) {
						// Store the input as Validation text
						this.oControl.__sValidationText = sInput;
						// Set flag to indicate token validation is in progress
						this.oControl.__bValidatingToken = true;
						this._calculateFilterInputData();
						if (this.mFilterInputData && this.aFilterField) {
							aFilters = sap.ui.comp.smartfilterbar.FilterProvider.generateFilters(this.aFilterField, this.mFilterInputData);
						}
						aFilters.push(new Filter(this.sKey, sap.ui.model.FilterOperator.EQ, sInput));
						if (this.bSupportBasicSearch) {
							mParams = {
								"search-focus": this.sKey
							};
						}
						this.oODataModel.read("/" + this.sValueListEntitySetName, {
							filters: aFilters,
							urlParameters: mParams,
							success: jQuery.proxy(function(oResponseData, response) {
								var oResultRow = oResponseData;
								if (oResponseData) {
									// Check if result has 1 single row
									if (oResponseData.results && oResponseData.results.length === 1) {
										oResultRow = oResponseData.results[0];
										if (this.oControl.data("__validationError")) {
											this.oControl.setValueState("None");
										}
									} else {
										this.oControl.setValueState("Error");
										this.oControl.data("__validationError", true);
									}
									// If returned row has the key do the selection!
									if (oResultRow && oResultRow[this.sKey]) {
										fHandleRowSelect(oResultRow, oData.asyncCallback);
									}
								}
								// Remove the token validation flag
								delete this.oControl.__bValidatingToken;
							}, this)
						});
					} else {
						// Clear validation error when no value is in the input
						if (this.oControl.data("__validationError")) {
							this.oControl.setValueState(sap.ui.core.ValueState.Error);
						}
					}
				}
			}, this);
			this.oControl.addValidator(this._fValidator);
		} else if (this.oControl.attachSuggestionItemSelected) {
			this._fSuggestionItemSelected = jQuery.proxy(function(oEvent) {
				var oRow = oEvent.getParameter("selectedRow"), oDataModelRow;
				// MultiColumn Suggest
				if (oRow) {
					// Get the actual datamodel row
					oDataModelRow = oRow.getModel().getData(oRow.getBindingContextPath());
					fHandleRowSelect(oDataModelRow);
				}
			}, this);
			// Single-Input --> just enable selection handling
			this.oControl.attachSuggestionItemSelected(this._fSuggestionItemSelected);
		}
		// custom result filter function for tabular suggestions - selection text;
		// the returned result will be shown on the input when the user uses the arrow key on suggest
		this.oControl.setRowResultFunction(function(oSelectedItem) {
			var oContext, sResult = "";
			if (oSelectedItem) {
				oContext = oSelectedItem.getBindingContext();
			}
			if (oContext && this.sKey) {
				sResult = oContext.getProperty(this.sKey);
			}
			return sResult;
		}.bind(this));
	};

	/**
	 * Bind the control to internally read the data (ODataModel takes care of this) from backend with optional search text to filter data
	 * 
	 * @param {object} sSearchText - the optional search text
	 * @private
	 */
	ValueListProvider.prototype._fetchData = function(sSearchText) {
		var mParams = {}, aFilters = [], length, oEvents;
		if (this.bTypeAheadEnabled) {
			// Convert search text to UpperCase if displayFormat = "UpperCase"
			if (sSearchText && this.sDisplayFormat === "UpperCase") {
				sSearchText = sSearchText.toUpperCase();
			}
			if (this.bSupportBasicSearch) {
				mParams["custom"] = {
					"search-focus": this.sKey,
					"search": sSearchText
				};
			}
			this._calculateFilterInputData();
			if (this.mFilterInputData && this.aFilterField) {
				aFilters = sap.ui.comp.smartfilterbar.FilterProvider.generateFilters(this.aFilterField, this.mFilterInputData);
			}
			// If SearchSupported = false; create a $filter for the keyfield with a StartsWith operator for the typed in/search text
			if (!this.bSupportBasicSearch) {
				aFilters.push(new Filter(this.sKey, sap.ui.model.FilterOperator.StartsWith, sSearchText));
			}
			// Restrict to 10 records for type Ahead
			length = 10;
			// Hide the Show All Items button if the number if items is less than the length (restriction)
			oEvents = {
				dataReceived: jQuery.proxy(function(oEvent) {
					var oBinding = oEvent.getSource(), iBindingLength;
					if (oBinding) {
						iBindingLength = oBinding.getLength();
						if (iBindingLength && iBindingLength <= length) {
							this.oControl.setShowTableSuggestionValueHelp(false);
						} else {
							this.oControl.setShowTableSuggestionValueHelp(true);
						}
					}
				}, this)
			};
		}

		if (this.aSelect && this.aSelect.length) {
			mParams["select"] = this.aSelect.toString();
		}

		// Bind the specified aggregation with valueList path in the model
		this.oControl.bindAggregation(this.sAggregationName, {
			path: "/" + this.sValueListEntitySetName,
			length: length,
			parameters: mParams,
			filters: aFilters,
			sorter: this._oSorter,
			events: oEvents,
			template: this._oTemplate
		});
	};

	/**
	 * Destroys the object
	 */
	ValueListProvider.prototype.destroy = function() {
		if (this.oControl) {
			if (this.oControl.detachSuggest) {
				this.oControl.detachSuggest(this._fSuggest);
				this._fSuggest = null;
			}
			if (this.oControl.removeValidator) {
				this.oControl.removeValidator(this._fValidator);
				this._fValidator = null;
			} else if (this.oControl.detachSuggestionItemSelected) {
				this.oControl.detachSuggestionItemSelected(this._fSuggestionItemSelected);
				this._fSuggestionItemSelected = null;
			}
			this.oControl.unbindAggregation(this.sAggregationName);
			if (this.oControl.removeAllSuggestionColumns) {
				this.oControl.removeAllSuggestionColumns();
			}
			this.oControl.data("_hassuggestionTemplate", false);
			delete this.oControl.__sValidationText;
			delete this.oControl.__bValidatingToken;
		}
		BaseValueListProvider.prototype.destroy.apply(this, arguments);
		// Destroy other local data
		if (this.oJsonModel) {
			this.oJsonModel.destroy();
			this.oJsonModel = null;
		}
		this._oTemplate = null;
		this.sAggregationName = null;
		this.bTypeAheadEnabled = null;
		this._oSorter = null;
	};

	return ValueListProvider;

}, /* bExport= */true);
