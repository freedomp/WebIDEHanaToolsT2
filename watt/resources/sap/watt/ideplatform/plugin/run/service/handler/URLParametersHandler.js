define({
	_sRunnerId: null,
	_oDocument: null,
	_aErrorFields: [],

	deleteParameterLine: function(oSource) {
		//this is the method for deleting a line of parameter
		var that = this;
		var oBlock = oSource.getParent().getParent().getContent();
		var oValidations = that.context.service.urlparametersvalidations;
		var pUpdates = [];
		for (var i = 0; i < oBlock.length; i++) {
			var oSection = oBlock[i].getContent();
			var oParamName = oSection[0];
			var oParamNameObj = that._createControlData(oParamName, oBlock[i].getId(), true, "", "");
			pUpdates.push(oValidations.update(oParamNameObj));
		}
		Q.all(pUpdates).then(function() {
			// Get index of the deleted line
			var path = oSource.getBindingContext().sPath;
			var aPathSplit = path.split("/");
			var index = aPathSplit[aPathSplit.length - 1];
			// Get the parameter list from the model
			var oModel = oSource.getBindingContext().getModel();
			var aUrlParameters = oModel.getProperty("/urlParameters");
			// Delete the entry from the list
			aUrlParameters.splice(index, 1);
			// Set back the parameter list to the model
			if (aUrlParameters.length === 0) {
				oModel.setProperty("/urlParametersNotNeeded", true);
			}
			oModel.setProperty("/urlParameters", aUrlParameters);
		});
	},

	onParamNameChange: function(oEvent) {
		var that = this;
		that._validateParamNameChange(oEvent).then(function(oControlData) {
			return that.context.service.urlparametersvalidations.update(oControlData);
		}).done();
	},

	onParamValueChange: function(oEvent) {
		var that = this;
		that._validateParamValueChange(oEvent).then(function(oControlData) {
			return that.context.service.urlparametersvalidations.update(oControlData);
		}).done();
	},

	checkUrlModelisValid: function(oEvent) {
		var that = this;
		var oModel = oEvent.getModel();
		var aUrlParameters = oModel.getProperty("/urlParameters");
		for (var i = 0; i < aUrlParameters.length; i++) {
			var sUrlParametersRow = aUrlParameters[i];
			if (sUrlParametersRow.paramValue !== "" && sUrlParametersRow.paramName === "") {
				// isValid = false	
				var oControlData = that._createControlData(oEvent.getParent(), "", false, "");
				return that.context.service.urlparametersvalidations.update(oControlData);
			}
		}
	},

	_validateParamValueChange: function(oEvent) {
		var that = this;
		var oControl = oEvent.getSource();
		var oChilds = oControl.getParent().getContent();
		var oParamName = oChilds[0];
		var sParamNameValue = oChilds[1].getValue();
		var isChecked = true;
		if (!isChecked) {
			return Q(that._createControlData(oParamName, oControl.getParent().getId(), true, "", sParamNameValue));
		}
		return that.validateParameterNameInput(oParamName.getValue(), sParamNameValue).then(function(oValid) {
			return that._createControlData(oParamName, oParamName.getParent().getId(), oValid.isValid, oValid.message, sParamNameValue);
		});
	},

	onBeforeURLParametersRendering: function(oEvent) {

		var oSourceObj = oEvent.srcControl;
		var oModel = oSourceObj.getModel();

		var oConfig = oModel.getProperty("/urlParameters");
		var bUrlParametersNotNeeded = oModel.getProperty("/urlParametersNotNeeded");
		var oEmptyParam = [{
			"paramName": "",
			"paramValue": ""
		}];
		if (!bUrlParametersNotNeeded) {
			if (!oConfig || oConfig.length === 0) {
				oModel.setProperty("/urlParameters", oEmptyParam);
			}
		}
	},

	createNewParameterLine: function(oEvent) {

		var oSourceObj = oEvent.getSource();
		var oModel = oSourceObj.getModel();

		var aUrlParameters = oModel.getProperty("/urlParameters");
		var bUrlParametersNotNeeded = oModel.getProperty("/urlParametersNotNeeded");
		if (bUrlParametersNotNeeded) {
			oModel.setProperty("/urlParametersNotNeeded", false);
		}
		if (aUrlParameters) {
			aUrlParameters.push({
				"paramName": "",
				"paramValue": ""
			});
		} else {
			aUrlParameters = ({
				"paramName": "",
				"paramValue": ""
			});
		}
		oModel.setProperty("/urlParameters", aUrlParameters);
		//move scroller down
		this._scrollToBottom();
	},

	_scrollToBottom: function() {
		setTimeout(function() {
			var myDiv = $(".sapUiHSplitterSecondPane");
			var myheight = myDiv.height();
			if (myDiv) {
				myDiv.scrollTop(myheight);
			}
		}, 100);
	},

	validateParameterNameInput: function(sParamName, sParamValue) {
		return this.context.service.urlparametersvalidations.validateUrlParameter(sParamName, sParamValue);
	},

	onAfterParamNameRendering: function(oEvent) {
		var that = this;
		that._validateAfterParamNameRendering(oEvent).then(function(oControlData) {
			return that.context.service.urlparametersvalidations.updateWithOutFireEvent(oControlData);
		}).done();
	},

	_validateParamNameChange: function(oEvent) {
		var that = this;
		var oControl = oEvent.getSource();
		//var oChilds = oControl.getParent().getContent();
		var sParamNameValue = oControl.getValue();
		var rowContent = oControl.getParent().getContent();
		var sParamValueValue = rowContent[1].getValue();
		if (sParamValueValue && sParamValueValue !== "") {
			return that.validateParameterNameInput(sParamNameValue, sParamValueValue).then(function(oValid) {

				oControl.setValue(sParamNameValue);

				return that._createControlData(oControl, oControl.getParent().getId(), oValid.isValid, oValid.message, sParamNameValue);
			});
		} else {
			return true;
		}
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

	_validateAfterParamNameRendering: function(oEvent) {

		var that = this;
		var oControl = oEvent.srcControl;
		var oChilds = oControl.getParent().getContent();
		var oParamName = oChilds[0];
		var sParamNameValue = oControl.getValue();
		if ((oChilds[1].getValue() !== "") && (oParamName.getValue() === "")) {
			return that.validateParameterNameInput(oParamName.getValue(), oChilds[1].getValue()).then(function(oValid) {
				return that._createControlData(oControl, oControl.getParent().getId(), oValid.isValid, oValid.message, sParamNameValue);
			});
		}
		return Q(that._createControlData(oControl, oControl.getParent().getId(), true, "", sParamNameValue));
	}

});