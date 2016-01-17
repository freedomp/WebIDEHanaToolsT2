define({
	_sRunnerId: null,
	_oDocument: null,
	_aErrorFields: [],
	
	updateWithOutFireEvent: function(oControlData) { 
		var that = this;
		that._updateStack(oControlData.sControlId, oControlData.isControlValid);
		if (!oControlData.isControlValid) {
			that._switchToInvalidUi(oControlData.oControl, oControlData.sInvalidMessage, oControlData.bDisplayRtt);
		} else {
			that._switchToValidUi(oControlData.oControl, oControlData.sValidMessage);
		}
	},
	
	update: function(oControlData) {
		var that = this;
		if (oControlData.sControlId !== "") {
			that._updateStack(oControlData.sControlId, oControlData.isControlValid);
			if (!oControlData.isControlValid) {
				that._switchToInvalidUi(oControlData.oControl, oControlData.sInvalidMessage, oControlData.bDisplayRtt);
			} else {
				that._switchToValidUi(oControlData.oControl, oControlData.sValidMessage);
			}		
		}
		that._fireEvent(oControlData);
	},
	_updateStack: function(sId, bValid) {
		// Checking if the current id is already appears in the stack
		var isInStack = this._hasError(sId);
		if (isInStack && bValid) {
			// Pop from stack
			this._removeError(sId);
		}
		if (!isInStack && !bValid) {
			// Push to stack
			this._aErrorFields.push(sId);
		}
	},
	
	_hasError: function(sId) {
		for (var i = 0; i < this._aErrorFields.length; i++) {
			if (this._aErrorFields[i] === sId) {
				return true;
			}
		}
		return false;
	},
	
		_removeError: function(sId) {
		this._aErrorFields = jQuery.grep(this._aErrorFields, function(value) {
			return ("" + value) !== ("" + sId);
		});
	},
	
	_switchToValidUi: function(oControl, sValidMessage) {
		if (oControl.hasStyleClass("inputError")) {
			oControl.removeStyleClass("inputError");
			oControl.addStyleClass("inputConfirmed");
			setTimeout(function() {
				oControl.removeStyleClass("inputConfirmed");
			}, 3000);
			oControl.setTooltip(sValidMessage);
		}
	},
	
		_switchToInvalidUi: function(oControl, sInvalidMessage, bDisplayRtt) {
		if (!oControl.hasStyleClass("inputError")) {
			oControl.removeStyleClass("inputConfirmed");
			oControl.addStyleClass("inputError");
			if (typeof bDisplayRtt === "undefined" || bDisplayRtt === true) {
				this._addRichToolTip(oControl, sInvalidMessage);
			}
		}
	},
	
		_fireEvent: function(oControlData) {
			oControlData.oControl.fireEvent("ConfigurationValidationEvent", {
			isValid: oControlData.isControlValid
		}, false, true);
	},
	
	_addRichToolTip: function(oControl, sMessage) {
		//for error - to show error message
		var oRichTooltip = new sap.ui.commons.RichTooltip({
			text: sMessage,
			myPosition: "begin bottom",
			atPosition: "begin top",
			title: "{i18n>lbl_error}"
		}).addStyleClass("runConfigRtt");
		oControl.setTooltip(oRichTooltip);
	},
	
	validateUrlParameter: function(sParamName, sParamValue) {
		var oValid = {
			"isValid": true,
			"message": ""
		};
		// check that the parameter name is not empty
		if ((!sParamName || /^\s*$/.test(sParamName)) && (sParamValue && sParamValue !== "")) {
			// the parameter name field is empty 
			oValid.isValid = false;
			oValid.message = this.context.i18n.getText("msg_appl_param_empty");
			return Q(oValid);
		} else {
			oValid.isValid = true;
			return Q(oValid);
		}
	}
});