define({
	_oDocument: null,

	setServiceData: function(oDocument, aValidation) {
		this._oDocument = oDocument;
		this._aValidation = aValidation;
	},

	getDocument: function() {
		return this._oDocument;
	},

	validatePathInput: function(sPathValue) {
		return this._validatePath(sPathValue);
	},

	onPathFieldChange: function(oEvent) {
		var that = this;
		that._validatePathFieldChange(oEvent).then(function(oControlData) {
			that._update(oControlData);
		}).done();
	},

	onAfterPathFieldRendering: function(oEvent) {
		var that = this;
		that._validateAfterPathFieldRendering(oEvent).then(function(oControlData) {
			that._update(oControlData);
		}).done();
	},

	_update: function(oControlData) {
		if (!oControlData.isControlValid) {
			this._switchToInvalidUi(oControlData.oControl, oControlData.sInvalidMessage);
		} else {
			this._switchToValidUi(oControlData.oControl, oControlData.sValidMessage);
		}
		this._fireEvent(oControlData);
	},

	_fireEvent: function(oControlData) {
		// fire event on the tab
		oControlData.oControl.fireEvent("ConfigurationValidationEvent", {
			isValid: oControlData.isControlValid
		}, false, true);
	},

	_switchToInvalidUi: function(oControl, sInvalidMessage) {
		oControl = oControl.getAggregation("_dropdownList");
		if (!oControl.hasStyleClass("inputError")) {
			oControl.removeStyleClass("inputConfirmed");
			oControl.addStyleClass("inputError");
			// oControl.setValueState(sap.ui.core.ValueState.Error);
			this._addRichToolTip(oControl, sInvalidMessage);
		}
	},

	_switchToValidUi: function(oControl, sValidMessage) {
		oControl = oControl.getAggregation("_dropdownList");
		if (oControl.hasStyleClass("inputError")) {
			oControl.removeStyleClass("inputError");
			oControl.addStyleClass("inputConfirmed");
			oControl.setValueState(sap.ui.core.ValueState.Success);
			setTimeout(function() {
				oControl.removeStyleClass("inputConfirmed");
				oControl.setValueState(sap.ui.core.ValueState.None);
			}, 3000);
			oControl.setTooltip(sValidMessage);
		}
	},

	_addRichToolTip: function(oControl, sMessage) {
		var oRichTooltip = new sap.ui.commons.RichTooltip({
			text: sMessage,
			imageSrc: "",
			myPosition: "begin bottom",
			atPosition: "begin top",
			title: "{i18n>lbl_error}"
		}).addStyleClass("runConfigRtt");
		oControl.setTooltip(oRichTooltip);
	},

	_createControlData: function(oControl, sControlId, bValid, sInvalidMessage, sValidMessage) {
		var oControlData = {
			oControl: oControl,
			sControlId: sControlId,
			isControlValid: bValid,
			sInvalidMessage: sInvalidMessage,
			sValidMessage: sValidMessage
		};
		return oControlData;
	},

	_validateAfterPathFieldRendering: function(oEvent) {
		var that = this;
		var oControl = oEvent.srcControl;
		var oModel = oControl.getModel();
		var oConfiguration = oModel.getData();
		var sId = oControl.getAggregation("_dropdownList").getSelectedItemId();
		var sPath = oConfiguration.filePath;
		if (!sPath) {
			sPath = oControl.getAggregation("_dropdownList").getItems()[0].getProperty("additionalText");
		}
		return that.validatePathInput(sPath).then(function(oValid) {
			if (!oValid.isValid) {
				oControl.getAggregation("_dropdownList").setSelectedItemId(sId);
			} else {
				oControl.getAggregation("_dropdownList").setSelectedKey(sPath);
			}
			return that._createControlData(oControl, oControl.getId(), oValid.isValid, oValid.message, sPath);
		});
	},

	_validatePathFieldChange: function(oEvent) {
		var that = this;
		var sNewValue = "";
		var oControl = oEvent.getSource();
		var oParam = oEvent.getParameter("selectedItem");
		if (oParam != null) {
			sNewValue = oParam.getKey();
			var sId = oParam.getId();
		}
		return that.validatePathInput(sNewValue).then(function(oValid) {
			var oModel = oControl.getModel();
			var oConfiguration = oModel.getData();
			oConfiguration.filePath = sNewValue;
			oControl.getAggregation("_dropdownList").setSelectedItemId(sId);
			oModel.setData(oConfiguration);
			return that._createControlData(oControl, oControl.getId(), oValid.isValid, oValid.message, sNewValue);
		});
	},

	_validatePath: function(sPath) {
		var that = this;
		var oValid = {
			"isValid": true,
			"message": ""
		};
		// check if the path is empty   
		if (!sPath || /^\s*$/.test(sPath)) {
			oValid.isValid = false;
			oValid.message = that.context.i18n.getText("msg_file_path_empty");
		}
		return Q(oValid);
	}

});