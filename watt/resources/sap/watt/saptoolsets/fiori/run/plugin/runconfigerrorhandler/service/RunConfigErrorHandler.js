define({
	_aErrorFields: null,
	_oRunConfigurationUiFragment: null,

	subscribe: function(oRunConfigurationUiFragment) {
		this._oRunConfigurationUiFragment = oRunConfigurationUiFragment;
		this._aErrorFields = [];
	},

	update: function(oControlData) {
		this._updateStack(oControlData.sControlId, oControlData.isControlValid);
		if (!oControlData.isControlValid) {
			this._switchToInvalidUi(oControlData.oControl, oControlData.sInvalidMessage, oControlData.bDisplayRtt);
		} else {
			this._switchToValidUi(oControlData.oControl, oControlData.sValidMessage);
		}
		this._fireEvent(oControlData);
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

	_fireEvent: function(oControlData) {
		this._oRunConfigurationUiFragment.fireEvent("ConfigurationValidationEvent", {
			isValid: (this._aErrorFields.length === 0)//,
			// target: oControlData.oControl
		}, false, true);
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

	_removeError: function(sId) {
		this._aErrorFields = jQuery.grep(this._aErrorFields, function(value) {
			return ("" + value) !== ("" + sId);
		});
	},

	_hasError: function(sId) {
		for (var i = 0; i < this._aErrorFields.length; i++) {
			if (this._aErrorFields[i] === sId) {
				return true;
			}
		}
		return false;
	},

	_addRichToolTip: function(oControl, sMessage) {
		var oRichTooltip = new sap.ui.commons.RichTooltip({
			text: sMessage,
			myPosition: "begin bottom",
			atPosition: "begin top",
			title: "{i18n>lbl_error}"
		}).addStyleClass("runConfigRtt");
		oControl.setTooltip(oRichTooltip);
	}
});