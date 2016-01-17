define({
	_oRunConfigurationUiFragment: null,
	_sRunnerId: null,
	_oConfigurationUiElements: null,
	_projctRunnableFiles: null,
	_oDocument: null,

	getContent: function(oConfigurationUiElements, projctRunnableFiles, oDocument) {
		var that = this;
		require(["sap/watt/lib/lodash/lodash"], function(lodash) {
			_ = lodash;
		});
		var sRunnerId = oConfigurationUiElements.sRunnerId;
		this._projctRunnableFiles = projctRunnableFiles;
		this._oDocument = oDocument;
			// If the UI is not defined, or the runner type has change - build it
			if (!that._oRunConfigurationUiFragment || that._sRunConfigurationId !== sRunnerId) {
				that._sRunnerId = sRunnerId;
				that._oConfigurationUiElements = oConfigurationUiElements;
				that._oRunConfigurationUiFragment = sap.ui.jsfragment("sap.watt.ideplatform.plugin.commonrunners.view.RunConfigUi", that);
			}
			that.context.i18n.applyTo(that._oRunConfigurationUiFragment);
			return that.context.service.baseerrorhandler.subscribe(that._oRunConfigurationUiFragment).then(function() {
				return that._oRunConfigurationUiFragment;
			});
	},

	updateCB: function(oEvent, name, state, values) {
		var model = oEvent.getSource().getModel();
		model.setProperty(name, (state) ? values[0] : values[1]);
	},

	// Get custom style for "Add Application Parameter" section 
	configure: function(mConfig) {
		if (mConfig.styles) {
			this.context.service.resource.includeStyles(mConfig.styles).done();
		}
	},

	setOption: function(e, state) {
		var mode = ["withoutWorkspace", "withWorkspace"];
		var src = e.getSource();
		var model = src.getModel();
		model.setProperty("/workspace", mode[state]);
	},

	checkFileVisible: function(filePath) {
		var visible = false;
		if (filePath !== undefined && filePath !== null && (jQuery.sap.endsWith(filePath, "Component.js") ||
			(new RegExp(".*fiorisandboxconfig.*[.]json", "i").test(filePath)))) {
			visible = true;
		}
		return visible;
	},

	createNewParameterLine: function() {
		var oModel = this.getModel();
		var aUrlParameters = oModel.getProperty("/urlParameters");
		aUrlParameters.push({
			"paramName": "",
			"paramValue": "",
			"paramActive": false
		});
		oModel.setProperty("/urlParameters", aUrlParameters);
	},

	deleteParameterLine: function() {
		var that = this;
		// get index of the deleted line
		var path = that.getBindingContext().sPath;
		var aPathSplit = path.split("/");
		var index = aPathSplit[aPathSplit.length - 1];
		// get the parameter list from the model 
		var oModel = that.getBindingContext().getModel();
		var aUrlParameters = oModel.getProperty("/urlParameters");
		// delete the entry from the list
		aUrlParameters.splice(index, 1);
		// set back the parameter list to the model
		oModel.setProperty("/urlParameters", aUrlParameters);
	},

	getSuggestItemes: function() {
		return this._projctRunnableFiles;
	},

	getFocusElement: function() {

	},

	getTitle: function() {

	},

	getTooltip: function() {

	},

	setVisible: function() {

	},

	isVisible: function() {

	},

	onAfterRBGRendering: function(oEvent) {
		var oRBG = oEvent.srcControl;
		var oModel = oRBG.getModel();
		var activeRadioButton = oModel.getProperty("/isDefaultVersion");
		// Activate the chosen radio button
		if (activeRadioButton === 0) {
			oRBG.setSelectedIndex(0);
		} else {
			oRBG.setSelectedIndex(1);
		}
	},

	validatePathInput: function(sPathValue) {
		var that = this;

		switch (that._sRunnerId) {
			case "chewebapprunner":
				return that.context.service.baseinputvalidatorutil.validatePath(sPathValue, that._oDocument, [{
					"isRegex": false,
					"rule": ".html"
				}]);

			case "sap.xs.nodejs.project.nodejsRunnerApplication":
			case "sap.xs.nodejs.project.nodejsTestRunner":
				return that.context.service.baseinputvalidatorutil.validatePath(sPathValue, that._oDocument, [
				    { "isRegex": false, "rule": ".js" },
					{ "isRegex": false, "rule": ".xsjs" }
				]);

			default:
				return Q({ isValid: true });
		}
	},

	validateParameterNameInput: function(sValue) {
		return this.context.service.baseinputvalidatorutil.validateUrlParameter(sValue);
	},

	onPathFieldChange: function(oEvent) {
		var that = this;
		that._validatePathFieldChange(oEvent).then(function(oControlData) {
			return that.context.service.baseerrorhandler.update(oControlData);
		}).done();
	},

	onAfterPathFieldRendering: function(oEvent) {
		var that = this;
		that._validateAfterPathFieldRendering(oEvent).then(function(oControlData) {
			return that.context.service.baseerrorhandler.update(oControlData);
		}).done();
	},

	onAfterParamNameRendering: function(oEvent) {
		var that = this;
		that._validateAfterParamNameRendering(oEvent).then(function(oControlData) {
			return that.context.service.baseerrorhandler.update(oControlData);
		}).done();
	},

	onParamNameChange: function(oEvent) {
		var that = this;
		that._validateParamNameChange(oEvent).then(function(oControlData) {
			return that.context.service.baseerrorhandler.update(oControlData);
		}).done();
	},

	onCheckBoxChange: function(oEvent) {
		var that = this;
		that._validateCheckBoxChange(oEvent).then(function(oControlData) {
			return that.context.service.baseerrorhandler.update(oControlData);
		}).done();
	},
	
	onResourceMappingChange: function(oEvent) {
		var that = this;
		var oControl = oEvent.getSource();
		var isChecked = oControl.getChecked();
		that.setOption(oEvent, isChecked === false ? 0 : 1);
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
		var isChecked = oControl.getParent().getContent()[0].getChecked();
		var sParamNameValue = oControl.getValue();
		if (isChecked) {
			return that.validateParameterNameInput(sParamNameValue).then(function(oValid) {
				return that._createControlData(oControl, oControl.getParent().getId(), oValid.isValid, oValid.message, sParamNameValue);
			});
		}
		return Q(that._createControlData(oControl, oControl.getParent().getId(), true, "", sParamNameValue));
	},

	_validateParamNameChange: function(oEvent) {
		var that = this;
		var oControl = oEvent.getSource();
		var oChilds = oControl.getParent().getContent();
		var oCheckBox = oChilds[0];
		var isChecked = oCheckBox.getChecked();
		var sParamNameValue = oControl.getValue();
		return that.validateParameterNameInput(sParamNameValue).then(function(oValid) {
			oControl.setValue(sParamNameValue);
			if (isChecked === false) {
				oCheckBox.setChecked(true);
			}
			return that._createControlData(oControl, oControl.getParent().getId(), oValid.isValid, oValid.message, sParamNameValue);
		});
	},

	_validateCheckBoxChange: function(oEvent) {
		var that = this;
		var oControl = oEvent.getSource();
		var oChilds = oControl.getParent().getContent();
		var oParamName = oChilds[1];
		var isChecked = oControl.getChecked();
		var sParamNameValue = oParamName.getValue();
		if (!isChecked) {
			oControl.setChecked(false);
			return Q(that._createControlData(oParamName, oControl.getParent().getId(), true, "", sParamNameValue));
		}
		return that.validateParameterNameInput(sParamNameValue).then(function(oValid) {
			oControl.setChecked(true);
			return that._createControlData(oParamName, oParamName.getParent().getId(), oValid.isValid, oValid.message, sParamNameValue);
		});
	},

	_validateAfterPathFieldRendering: function(oEvent) {
		var that = this;
		var oControl = oEvent.srcControl;
		var oModel = oControl.getModel();
		var oConfiguration = oModel.getData();
		var sPath = oConfiguration.filePath;
		return that.validatePathInput(sPath).then(function(oValid) {
			return that._createControlData(oControl, oControl.getId(), oValid.isValid, oValid.message, sPath);
		});
	},

	_validatePathFieldChange: function(oEvent) {
		var that = this;
		var sNewValue = "";
		var oControl = oEvent.getSource();
		var oParam = oEvent.getParameter("selectedItem");
		if (oParam != null) {
			// if the user chose value from the dropdown list of the autocomplete
			sNewValue = oParam.getKey();
		} else {
			// if the user types input by himself
			sNewValue = oControl.getValue();
		}
		return that.validatePathInput(sNewValue).then(function(oValid) {
			var oModel = oControl.getModel();
			var oConfiguration = oModel.getData();
			oConfiguration.filePath = sNewValue;
			oControl.setValue(sNewValue);
			oModel.setData(oConfiguration);
			return that._createControlData(oControl, oControl.getId(), oValid.isValid, oValid.message, sNewValue);
		});
	}
});