/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define([
	"jquery.sap.global", "sap/ui/base/ManagedObject", "sap/m/MessageBox", "sap/ui/layout/form/SimpleForm", "sap/ui/comp/smartform/Group", "sap/ui/comp/smartform/GroupElement", "sap/ui/comp/smartfield/SmartField", "sap/ui/comp/smartfield/SmartLabel", "sap/m/Dialog", "sap/ui/generic/app/util/ModelUtil", "sap/m/VBox", "sap/m/Text"
], function(jQuery, ManagedObject, MessageBox, SimpleForm, Group, GroupElement, SmartField, SmartLabel, Dialog, ModelUtil, VBox, Text) {
	"use strict";

	var ActionUtil = ManagedObject.extend("sap.ui.generic.template.ActionUtil", {
		metadata: {
			properties: {
				/**
				 * The used controller.
				 */
				controller: {
					type: "object",
					group: "Misc",
					defaultValue: null
				},
				/**
				 * The context in which the action is called.
				 */
				context: {
					type: "object",
					group: "Misc",
					defaultValue: null
				},
				/**
				 * The callback that is called after the action has been successfully executed.
				 */
				successCallback: {
					type: "function",
					group: "Misc",
					defaultValue: null
				}
			}
		}
	});

	/**
	 * Returns a parental table of the given element or null.
	 *
	 * @param {string} sFunctionImportPath The function import that is called
	 * @param {string} sFunctionImportLabel Optional parameter for the confirmation popup text
	 * @public
	 */
	ActionUtil.prototype.call = function(sFunctionImportPath, sFunctionImportLabel) {
		this._sFunctionImportPath = sFunctionImportPath;
		var oController = this.getController();
		if (!oController) {
			throw new Error("Controller not provided");
		}
		
		this._oMetaModel = oController.getView().getModel().getMetaModel();
			
		var sFunctionName = sFunctionImportPath.split('/')[1];
		this._oFunctionImport = this._oMetaModel.getODataFunctionImport(sFunctionName);
		this._sFunctionImportLabel = sFunctionImportLabel || sFunctionName;

		if (!this._oFunctionImport) {
			throw new Error("Unknown Function Import " + sFunctionName);
		}

		if (this._isActionCritical()) {
			var that = this;
			var sMsgBoxText = sap.ui.getCore().getLibraryResourceBundle("sap.ui.generic.template").getText("ACTION_CONFIRM");
			sMsgBoxText = jQuery.sap.formatMessage(sMsgBoxText, this._sFunctionImportLabel);
			MessageBox.confirm(sMsgBoxText, {
				title: this._sFunctionImportLabel,
				onClose: function(oAction) {
					if (oAction === "OK") {
						that._prepareParameters();
						that._initiateCall();
					}
				},
				sClass: that._getCompactModeStyleClass()
			});
		} else {
			this._prepareParameters();
			this._initiateCall();
		}
	};

	ActionUtil.prototype._getCompactModeStyleClass = function() {
		if (this.getController().getView().$().closest(".sapUiSizeCompact").length) {
			return "sapUiSizeCompact";
		}
		return "";
	};
	
	/**
	 * checks if the action is critical
	 *
	 * @private
	 * @returns {boolean} true if the action is critical otherwise false
	 */
	ActionUtil.prototype._isActionCritical = function() {
		var oCritical = this._oFunctionImport["com.sap.vocabularies.Common.v1.IsActionCritical"];
		
		if (!oCritical){ return false; }		
		if (oCritical.Bool === undefined){ return true; }	
		
		return this._toBoolean(oCritical.Bool);
	};

	/**
	 * converts a parameter value to a boolean
	 *
	 * @param {object} oParameterValue The value to be converted 
	 * @private
	 * @returns {boolean}
	 */
	ActionUtil.prototype._toBoolean = function(oParameterValue) {	
		if (typeof oParameterValue === "string"){
			var oValue = oParameterValue.toLowerCase(); 
			return !(oValue == "false" || oValue == "" || oValue == " ");
			}
			
		return !!oParameterValue;			
	};
	
	/**
	 * Retrieves the parameters
	 *
	 * @private
	 */
	ActionUtil.prototype._prepareParameters = function() {			
		// oContext is only provided for action calls in list
		this._oCurrentContext = this.getContext() || this._oView.getBindingContext();
		this._oContextObject = this._oCurrentContext.getObject();
		var oEntityType = this._getEntityType();
		var oKeyProperties = this._getPropertyKeys(oEntityType);
		var oParameterValue;
		
		this._oParameters = {
			parameterData: {},
			additionalParameters: []
		};
		
		if (this._oFunctionImport.parameter) {
			for (var i = 0; i < this._oFunctionImport.parameter.length; i++) {
				var oParameter = this._oFunctionImport.parameter[i];
				
				this._addParameterLabel(oParameter, oEntityType);
				
				var sParameterName = oParameter.name;
				var bIsKey = !!oKeyProperties[sParameterName];
				
				oParameterValue = undefined; 
				if (this._oContextObject.hasOwnProperty(sParameterName)) {
					oParameterValue = this._oContextObject[sParameterName];
				} else if (bIsKey){
					//parameter is key but not part of the current projection - raise error
					jQuery.sap.log.error("Key parameter of action not found in current context: " + sParameterName);
					throw new Error("Key parameter of action not found in current context: " + sParameterName);								
				}				
				
				this._oParameters.parameterData[sParameterName] = oParameterValue;
				
				if (!bIsKey){
					// offer as optional parameter with default value from context
					this._oParameters.additionalParameters.push(oParameter);
				}
			}
		}
	};
	
	/**
	 * returns a map containing all keys retrieved for the given entityType
	 *
	 * @param {object} oEntityType - the entity type for which the keys should be retrieved
	 * @private
	 * @returns {object} map containing the properties keys
	 */
	ActionUtil.prototype._getPropertyKeys = function(oEntityType){
		var oKeyMap = {};
			
		if (oEntityType && oEntityType.key && oEntityType.key.propertyRef){
			for (var i = 0; i < oEntityType.key.propertyRef.length; i++) {
				var sKeyName = oEntityType.key.propertyRef[i].name; 
				oKeyMap[sKeyName] = true;
			}
		}		
		
		return oKeyMap;
	};

	/**
	 * returns the entity type for the current context
	 * 
	 * @private
	 * @returns {object} the entity type
	 */
	ActionUtil.prototype._getEntityType = function(){
		var oEntityType = null;
		if (this._oCurrentContext && this._oCurrentContext.getPath()) {
			var sEntitySet = ModelUtil.getEntitySetFromContext(this._oCurrentContext);							
			var oEntitySet = this._oMetaModel.getODataEntitySet(sEntitySet, false);
			oEntityType = this._oMetaModel.getODataEntityType(oEntitySet.entityType, false);		
		}
		
		return oEntityType;
	};	
	
	ActionUtil.prototype._initiateCall = function() {
		if (this._oParameters.additionalParameters.length > 0) {
			// depending on projection of smart table - parameters are probably not in projection scope - therefore analyze entity type
			var oParameterModel = new sap.ui.model.json.JSONModel();
			oParameterModel.setData(this._oParameters.parameterData);		
			var that = this;

			var mParameterForm = this._buildParametersForm();
			
			var oParameterDialog = new Dialog({
				title: this._sFunctionImportLabel,				
				content : [mParameterForm.form],
				beginButton: new sap.m.Button({
					text: this._sFunctionImportLabel,
					press: function(oEvent) {						
						// call action if there are no client errors, stay on parameter dialog in case of errors						
						if (!mParameterForm.checkClientErrors()) {
							var mParameters = that._getActionParameterData(oEvent.getSource().getModel());
							if (mParameters.missingMandatoryParameters.length == 0){
								oParameterDialog.close();
								that._call(mParameters.preparedParameterData);
							} else {
								var oContent = new VBox();
								
								var sRootMessage = sap.ui.getCore().getLibraryResourceBundle("sap.ui.generic.template").getText("ACTION_MISSING_MANDATORY");
								 
								for (var i = 0; i < mParameters.missingMandatoryParameters.length; i++){
									var sText = jQuery.sap.formatMessage(sRootMessage, that._getParameterName(mParameters.missingMandatoryParameters[i]));
									oContent.addItem(new Text({text: sText}));									
								}
								
								MessageBox.error(oContent, {
									sClass: that._getCompactModeStyleClass()
								});
							}
						}
					}
				}),
				endButton: new sap.m.Button({
					text: sap.ui.getCore().getLibraryResourceBundle("sap.ui.generic.template").getText("ACTION_CANCEL"),
					press: function() {
						oParameterDialog.close();
					}
				}),
				afterClose: function() {
					oParameterDialog.destroy();
				}
			}).addStyleClass("sapUiNoContentPadding");
			
			oParameterDialog.addStyleClass(this._getCompactModeStyleClass());
			
			oParameterDialog.setModel(oParameterModel);
			oParameterDialog.open();
		} else {
			this._call();
		}
	};

	ActionUtil.prototype._call = function(mUrlParameters) {
		// context is refreshed in action call - therefore get current path before method call
		// var sCurrentPath = this._oCurrentContext.getPath();
		var mParameters = {
			urlParameters : mUrlParameters
		};

		var oController = this.getController();
		var oCurrentContext = this._oCurrentContext;
		var that = this;
		
		try {
			oController.getTransactionController().invokeAction(this._sFunctionImportPath, this._oCurrentContext, mParameters).then(function(oResponse) {
				var fCallback = that.getSuccessCallback();
				if (fCallback){
					fCallback(oResponse.context);
				}				
				oController.handleSuccess(oResponse);
			}, function(oError) {
				oController.handleError(oError, {context : oCurrentContext});			
			});
		} catch (ex) {
			oController.handleError(ex, {context : oCurrentContext});
		}
	};	
	
	ActionUtil.prototype._getActionParameterData = function(oParameterModel) {	
		var aMissingMandatoryParameters = [];
		
		// raw parameter list contains all action parameters as key/value - no check required
		var oRawParameterData = oParameterModel.getObject('/');
		var oPreparedParameterData = {};
		for (var i = 0; i < this._oFunctionImport.parameter.length; i++) {
			var oParameter = this._oFunctionImport.parameter[i];
			var sParameterName = oParameter.name;			
			if (oRawParameterData.hasOwnProperty(sParameterName)) {				
				var oValue = oRawParameterData[sParameterName];
				if (oValue === undefined) {
					// if parameter is nullable=true don't pass it at all to function import call
					// TODO check boolean handling - should undefined boolean value be sent as false to backend or not at all
					if (!this._toBoolean(oParameter.nullable)) {
						// defaulting for boolean - set to false - UI state undefined for checkbox
						// all other not null checks should have already been done by smart field - if not throw error - should not happen at all
						if (oParameter.type === 'Edm.Boolean'){
							oPreparedParameterData[sParameterName] = false;
						} else {
							aMissingMandatoryParameters.push(oParameter);						
						}
					}
				} else {
					oPreparedParameterData[sParameterName] = oValue;
				}
			} else {
				throw new Error("Unknown parameter: " + sParameterName);
			}
		}
		
		return {
			preparedParameterData: oPreparedParameterData,
			missingMandatoryParameters: aMissingMandatoryParameters
		};
	};
	
	ActionUtil.prototype._buildParametersForm = function() {
		var oForm = new SimpleForm({
			editable: true
		});

		// list of all smart fields for input check
		var aFields = []; 
		
		for (var i = 0; i < this._oParameters.additionalParameters.length; i++) {
			var oParameter = this._oParameters.additionalParameters[i];					

			var sParameterLabel = this._getParameterName(oParameter);
			var sBinding = '{/' + oParameter.name + '}';
			var sJSONType = null;
			var sEdmType = oParameter.type;

			// default for nullable is false - due to Gateway parameter handling -> set all fields to mandatory which are not explicitely nullable=true
			//var bMandatory = !this._isParameterNullable(oParameter);			
			
			// max length - default undefined if not set in OData metadata
			var iMaxLength = oParameter.maxLength ? parseInt(oParameter.maxLength, 10) : undefined;
			
			// covers Edm.Byte, Edm.SByte, Edm.Boolean, Edm.Int16, Edm.Int32, Edm.Time
			if (sEdmType === 'Edm.String') {
				sJSONType = sap.ui.comp.smartfield.JSONType.String;
			} else if (sEdmType === 'Edm.Boolean') {
				sJSONType = sap.ui.comp.smartfield.JSONType.Boolean;
			} else if (sEdmType === 'Edm.Byte' || sEdmType === 'Edm.SByte' || sEdmType === 'Edm.Int16' || sEdmType === 'Edm.Int32') {
				sJSONType = sap.ui.comp.smartfield.JSONType.Integer;
			} else {
				throw new Error("Unsupported parameter type: " + sEdmType);
			}

			var oField = new SmartField({
				value: sBinding,
				mandatory: false, //bMandatory,
				jsontype: sJSONType,
				maxLength: iMaxLength
			});
			aFields.push(oField);
			var sLabel = new SmartLabel();

			sLabel.setText(sParameterLabel);
			sLabel.setLabelFor(oField);
			
			oForm.addContent(sLabel);
			oForm.addContent(oField);			
		}
		
		var fnCheckClientErrors = function(){
			var bHasErrors = false;
			
			//for now: alwas return false, as SmartField currently does not handle JSON models correctly
			
//			if (aFields && aFields.length) {
//				for (var i = 0; i < aFields.length; i++) {
//					var bClientError = aFields[i].checkClientError();
//					if (bClientError) {
//						bHasErrors = true;
//					}
//				}				
//			}
			return bHasErrors;
		};
		
		return {
			form : oForm,			
			checkClientErrors :  fnCheckClientErrors
		};
	};
	
	ActionUtil.prototype._getParameterName = function(oParameter){
		// if no label is set for parameter use parameter name as fallback
		return oParameter["com.sap.vocabularies.Common.v1.Label"] ? oParameter["com.sap.vocabularies.Common.v1.Label"].String : oParameter.name;
	};
	
	ActionUtil.prototype._addParameterLabel = function(oParameter, oEntityType){		
		if (oEntityType && oParameter && !oParameter["com.sap.vocabularies.Common.v1.Label"]) {			
			
			var oProperty = this._oMetaModel.getODataProperty(oEntityType, oParameter.name, false);
			if (oProperty && oProperty["com.sap.vocabularies.Common.v1.Label"]) {
				// copy label from property to parameter with same name as default if no label is set for function import parameter
				oParameter["com.sap.vocabularies.Common.v1.Label"] = oProperty["com.sap.vocabularies.Common.v1.Label"];
			}
		}
	};

	return ActionUtil;

}, /* bExport= */true);