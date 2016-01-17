/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

// Provides control sap.ui.rta.FieldRepository
sap.ui.define(['jquery.sap.global',
			'./library',
			'sap/ui/core/Control',
			'sap/ui/commons/Label',
			'sap/ui/commons/LabelDesign',
			'sap/ui/commons/Dialog',
			'sap/ui/commons/TextView',
			'sap/ui/commons/CheckBox',
			'sap/ui/table/Table',
			'sap/ui/table/SelectionMode',
			'sap/ui/table/SelectionBehavior',
			'sap/ui/table/NavigationMode',
			'sap/ui/core/HorizontalAlign',
			'sap/ui/layout/VerticalLayout',
			'sap/ui/layout/HorizontalLayout',
			'sap/ui/model/json/JSONModel',
			'sap/m/SearchField',
			'sap/m/Button',
			'sap/m/Toolbar',
			'sap/ui/model/Filter',
			'sap/ui/model/FilterOperator',
			'sap/ui/table/SortOrder',
			'./Utils',
			'sap/ui/rta/FlexAdapter',
			'./ModelConverter'
			],
	function(jQuery,
			library,
			Control,
			Label,
			LabelDesign,
			Dialog,
			TextView,
			CheckBox,
			Table,
			SelectionMode,
			SelectionBehavior,
			NavigationMode,
			HorizontalAlign,
			VerticalLayout,
			HorizontalLayout,
			JSONModel,
			SearchField,
			Button,
			Toolbar,
			Filter,
			FilterOperator,
			SortOrder,
			Utils,
			FlexAdapter,
			ModelConverter
	) {
	"use strict";

	/**
	* Constructor for a new sap.ui.rta.FieldRepository control.
	*
	* @class
	* Context - Dialog for Field Repository in Runtime Authoring
	* @extends sap.ui.core.Control
	*
	* @author SAP SE
	* @version 1.32.7
	*
	* @constructor
	* @private
	* @since 1.30
	* @alias sap.ui.rta.FieldRepository
	* @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	*/
	var FieldRepository = Control.extend("sap.ui.rta.FieldRepository", {
		metadata : {
			library : "sap.ui.rta",
			properties : {
			},
			associations : {
				/** The root control which the runtime authoring should handle */
				"rootControl" : {
					type : "sap.ui.core.Control"
				}
			},
			events : {
				"opened" : {},
				"closed" : {},
				"openCustomField" : {}
			}
		}
	});

	/**
	 * Initialize the context menu
	 * 
	 * @private
	 */
	FieldRepository.prototype.init = function() {
		this._aData = [];
		this._aSupportedControls = [sap.ui.comp.smartform.SmartForm, sap.ui.comp.smartform.Group];
		this._oModel = new JSONModel();
		// Get messagebundle.properties for sap.ui.rta
		this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");

		this._bAscendingSortOrder = true;
		
		var oOKButton = new Button({
			text : this._oRb.getText("BTN_FREP_OK"),
			press : [this.closeDialog, this]
		});
		
		this._oCustomFieldButton = new Button({
			text : this._oRb.getText("BTN_FREP_CCF"),
			enabled : false,
			press : [this._redirectToCustomFieldCreation, this]
		});
		
		this._oInput =  new SearchField({
			width : "100%",
			liveChange : [this._updateModelFilter, this]
		}).addStyleClass("resourceListIF");
		
		var oResortButton = new Label({
			icon : "sap-icon://sort"
		}).attachBrowserEvent("mousedown", jQuery.proxy(this._resortTable, this));
		
		this.oInputFields = new Toolbar({
			content: [this._oInput, oResortButton]
		});
		
		var oFieldName = new Label({
			design: LabelDesign.Bold, 
			tooltip: {
				parts: [
				        {path: "quickInfo"},
				        {path: "fieldLabel"}
				],
				formatter: function(quickInfo, fieldLabel) {
					if (!quickInfo) {
						return fieldLabel;
					}
					return quickInfo;
				}
			},
			text: "{fieldLabel}"
		});
		var oNameAndEntityTypeCell = new HorizontalLayout({
			content: [oFieldName]
		});
		var oCombinedField = new VerticalLayout({
			content: [oNameAndEntityTypeCell]
		});

		var oCheckBox = new CheckBox({
			change : [this._fnSelected, this]
		}).bindProperty("checked", "checked");

		this._oTable = new Table({ 
			selectionMode: SelectionMode.None,
			selectionBehavior : SelectionBehavior.RowOnly,
			selectedIndex : -1,
			columnHeaderVisible : false,
			columns : [
				{
					template: oCheckBox,
					width : "15%",
					hAlign : HorizontalAlign.Center
				},{
					template: oCombinedField,
					width : "85%",
					sortProperty: "fieldLabel",
					hAlign : HorizontalAlign.Left
				}
			]
		});
		
		this._oModel.setData({modelData: this._aData});
		this._oTable.setModel(this._oModel);
		this._oTable.bindRows("/modelData");
		this._oTable.sort(this._oTable.getColumns()[1], (this._bAscendingSortOrder) ? SortOrder.Ascending : SortOrder.Descending);
		
		this._oDialog = new Dialog({
			title : this._oRb.getText("HEADER_FREP"),
			buttons : [ this._oCustomFieldButton, oOKButton ],
			content : [ this.oInputFields, this._oTable ],
			width : "400px",
			modal : true,
			closed : [this._revertChanges, this]
		}).addStyleClass("sapUIRtaFieldRepositoryDialog");
		
		this._oDialog.setInitialFocus(this._oInput);
		
		
	};
	
	/**
	 * Resort the table
	 * @param  {sap.ui.base.Event} oEvent event object
	 * @private
	 */
	FieldRepository.prototype._resortTable = function(oEvent) {
		this._bAscendingSortOrder = !this._bAscendingSortOrder;
		this._oTable.sort(this._oTable.getColumns()[1], (this._bAscendingSortOrder) ? SortOrder.Ascending : SortOrder.Descending);
	};
	
	/**
	 * Fire an event to redirect to custom field creation
	 * @param  {sap.ui.base.Event} oEvent event object
	 * @private
	 */
	FieldRepository.prototype._redirectToCustomFieldCreation = function(oEvent) {
		this.fireOpenCustomField();
		this._oDialog.close();
	};

	/**
	 * Enables the Custom Field Creation button
	 * @param {boolean} bShowCCF true shows the button, false not
	 */
	FieldRepository.prototype.setShowCreateCustomField = function(bShowCCF) {
		this._oCustomFieldButton.setEnabled(bShowCCF);
	};

	/**
	 * Updates the model on filter events
	 * @param  {sap.ui.base.Event} oEvent event object
	 * @private
	 */
	FieldRepository.prototype._updateModelFilter = function(oEvent) {
		var sValue = oEvent.getParameter("newValue");
		var oBinding = this._oTable.getBinding("rows");

		if (sValue !== "") {
			var oFilterLabel = new Filter("fieldLabel", FilterOperator.Contains, sValue);
			var oFilterQuickInfo = new Filter("quickInfo", FilterOperator.Contains, sValue);
			var oFilterLabelOrInfo = new Filter({ filters: [oFilterLabel, oFilterQuickInfo], and: false });
			oBinding.filter([oFilterLabelOrInfo]);
		} else {
			oBinding.filter([]);
		}
	};

	/**
	 * Revert all collected changes and close the dialog
	 * @private
	 */
	FieldRepository.prototype._revertChanges = function() {
		for (var i = 0; i < this._aChangeData.length; i++) {
			var oChangeData = this._aChangeData[i];
			if (oChangeData.controlId) {
				var oControl = sap.ui.getCore().byId(oChangeData.controlId);
				if (oChangeData.changeType === "hideControl") {
					this._oFlexAdapter.emitHideEvent(oControl);
				} else {
					this._oFlexAdapter.emitUnhideEvent(oControl);
				}
			}
		}
		this._oCurrentSelectedBlock.rerender();
		this._oDialog.close();
	};

	/**
	 * Initialize the change data list and close the dialog
	 */
	FieldRepository.prototype.closeDialog = function() {
		this._aChangeData = [];
		this._oDialog.close();
	};

	/**
	 * Function to be called when a field is selected in list
	 * @param  {sap.ui.base.Event} oEvent event object
	 * @private
	 */
	FieldRepository.prototype._fnSelected = function(oEvent) {
		var oChangeData = this._createChangeData(oEvent.getSource(), oEvent.mParameters.checked);
		if (oChangeData.exists){
			this._oFlexAdapter.emitUnhideEvent(sap.ui.getCore().byId(oChangeData.newControlId));
		} else if (oChangeData.selectorId && oChangeData.changeType === FlexAdapter.M_TYPES.addField ) {
			this._oFlexAdapter.emitAddEvent(oChangeData, FlexAdapter.M_TYPES.addField);
		} else if (!oEvent.mParameters.checked) {
			this._oFlexAdapter.emitHideEvent(sap.ui.getCore().byId(oChangeData.controlId));
		}
	};

	/*
	 * Creates an array of change data to be passed to FlexController
	 * @param  {Object} oControl The currently checked or unchecked object containing the binding information
	 * @return {Array} aChangeData
	 * @private
	 */
	FieldRepository.prototype._createChangeData = function(oControl, bShowControl) {
		var oChangeData = {};
		var oBindingContextObject = oControl.getBindingContext().getObject();
		var sControldId = oBindingContextObject.controlId ? oBindingContextObject.controlId : this._oCurrentSelectedBlock.getId() + "_" + oBindingContextObject.entityName + "_" + oBindingContextObject.name;
		var sBindingPath = oBindingContextObject.complexTypeName ? oBindingContextObject.complexTypeName + "/" + oBindingContextObject.name : oBindingContextObject.name;
		if (bShowControl) {
			var bControlExistsInDom = sap.ui.getCore().byId(sControldId);
			if (this._oCurrentSelectedBlock) {
				var oGroup;
				if (this._oCurrentSelectedBlock instanceof sap.ui.comp.smartform.Group) {
					oGroup = this._oCurrentSelectedBlock;
				} else {
					oGroup = this._oCurrentSelectedBlock.getGroups()[0];
				}
				oChangeData = {
					exists : bControlExistsInDom,
					newControlId : sControldId,
					jsType : "sap.ui.comp.smartfield.SmartField",
					selectorId : oGroup.getId(),
					index : oGroup.getGroupElements().length + 1,
					valueProperty : "value",
					changeType: FlexAdapter.M_TYPES.addField,
					fieldLabel : oBindingContextObject.fieldLabel,
					fieldValue : sBindingPath
				};
			}
			this._aChangeData.push({controlId: sControldId, changeType: "hideControl"});
		} else {
			oChangeData = {
				controlId :  sControldId,
				changeType : "unhideControl"
			};
			this._aChangeData.push(oChangeData);
		}
		return oChangeData;
	};

	/**
	 * Open the Field Repository Dialog
	 * @param  {sap.ui.core.Control} oControl Currently selected control
	 */
	FieldRepository.prototype.open = function(oControl) {
		var that = this;
		this._aChangeData = [];
		if (!this._oFlexAdapter) {
			this._oFlexAdapter = new FlexAdapter();
			this._oFlexAdapter.init(sap.ui.getCore().byId(this.getRootControl()));
		}
		this._oCurrentSelectedControl = oControl;
		this._oCurrentSelectedBlock = Utils.findSupportedBlock(oControl, this._aSupportedControls);
		if (that._oCurrentSelectedBlock) {
			that._createRepositoryFields(that._oCurrentSelectedBlock);
			that._oDialog.oPopup.attachOpened(function (){
				that.fireOpened();
			});
			that._oDialog.open();
		}
	};
	
	/**
	 * Get the ignored fields which should not be displayed in the
	 * field repository, currently only Smartforms are supported
	 * @param {sap.ui.comp.smartform.SmartForm} oSmartForm Currently selected Smartform
	 * @private
	 */
	FieldRepository.prototype._getIgnoredFields = function(oSmartForm) {

		if (oSmartForm) {
			var sCsvIgnoredFields = oSmartForm.getIgnoredFields();
			if (sCsvIgnoredFields) {
				var aIgnoredFields = sCsvIgnoredFields.split(",");
				return aIgnoredFields;
			}
		}
		
		return [];
	};

	/**
	 * Calculate repository fields based on model and displayed data
	 * @param  {sap.ui.core.Control} oControl Currently selected control
	 * @private
	 */
	FieldRepository.prototype._createRepositoryFields = function(oControl) {
		var vEntityType = [];
		var oControl = Utils.getClosestTypeForControl(oControl, "sap.ui.comp.smartform.SmartForm");
		var that = this;
		vEntityType = oControl.getEntityType();

		if (vEntityType) {
			vEntityType = vEntityType.replace(/\s+/g, '').match(/([^,]+)/g);
		}

		ModelConverter.getConvertedModelWithBoundAndRenamedLabels(oControl, vEntityType).then(function(oFieldModel) {
			that._oModel.setData({modelData: oFieldModel});
		});
	};

	/**
	 * Closes the dialog
	 */
	FieldRepository.prototype.close = function() {
		var that = this; 
		this._oDialog.close();
		this._oDialog.attachClosed(function (){
			that.fireClosed();
		});
	};

	return FieldRepository;

}, /* bExport= */ true);