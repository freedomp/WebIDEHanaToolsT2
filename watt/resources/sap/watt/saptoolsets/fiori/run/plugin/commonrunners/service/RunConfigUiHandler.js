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
		return this.context.service.ui5versionsdropdown.initDropdown(oDocument).then(function() {
			// If the UI is not defined, or the runner type has change - build it
			if (!that._oRunConfigurationUiFragment || that._sRunConfigurationId !== sRunnerId) {
				that._sRunnerId = sRunnerId;
				that._oConfigurationUiElements = oConfigurationUiElements;
				that._oRunConfigurationUiFragment = sap.ui.jsfragment("sap.watt.saptoolsets.fiori.run.plugin.commonrunners.view.RunConfigUi", that);
			}
			that.context.i18n.applyTo(that._oRunConfigurationUiFragment);
			return that.context.service.errorhandler.subscribe(that._oRunConfigurationUiFragment).then(function() {
				return that._oRunConfigurationUiFragment;
			});
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

/*	createNewParameterLine: function() {
		var oModel = this.getModel();
		var aUrlParameters = oModel.getProperty("/urlParameters");
		aUrlParameters.push({
			"paramName": "",
			"paramValue": "",
			"paramActive": false
		});
		oModel.setProperty("/urlParameters", aUrlParameters);
	},

	deleteParameterLine: function(oSource) {
		var that = this;
		var oBlock = oSource.getParent().getParent().getContent();
		var pUpdates = [];
		var oErrorHandler = that.context.service.errorhandler;
		for (var i = 0; i < oBlock.length; i++) {
			var oSection = oBlock[i].getContent();
			var oParamName = oSection[1];
			var oParamNameObj = that._createControlData(oParamName, oBlock[i].getId(), true, "", "");
			pUpdates.push(oErrorHandler.update(oParamNameObj));
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
			oModel.setProperty("/urlParameters", aUrlParameters);
		});
	},*/

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
	onAfterBackendDropDownRendering: function(oEvent) {
		var that = this;
		var oDropDown = oEvent.srcControl;
		var oModel = oDropDown.getModel();
	
		var aDest = [];
			return that.context.service.destination.getDestinations().then(function(aUi5Destinations) {
				aDest = that._createOneDestinationList(aUi5Destinations, aDest);
				
				var aUniqueNames = [];
				jQuery.each(aDest, function(i, el){
				    if(jQuery.inArray(el, aUniqueNames) === -1) {aUniqueNames.push(el);}
				});
				
				var oChoseDestination = oModel.getProperty("/backendSystem");
				var sDropDownNumber = oEvent.srcControl.getBindingContext().getPath();
				sDropDownNumber = sDropDownNumber.slice(15);
				var oItem = new sap.ui.core.ListItem();
				oDropDown.addItem(oItem);
				for (var i = 0; i < aUniqueNames.length; i++) {
					oItem = new sap.ui.core.ListItem({
						key: aUniqueNames[i],
						text: aUniqueNames[i]
					});
					oDropDown.addItem(oItem);
				}
				oDropDown.setValue(oChoseDestination[sDropDownNumber].destinations);
		});
	},

	onBackendChange: function(oEvent) {

		var oDropDown = oEvent.getSource();
		var oModel = oDropDown.getModel();
		var choseDestination = oModel.getProperty("/backendSystem");
		var sDropDownNumber = oEvent.getSource().getBindingContext().sPath;
		sDropDownNumber = sDropDownNumber.slice(15);
		choseDestination[sDropDownNumber].destinations = oEvent.mParameters.newValue;
		oModel.setProperty("/backendSystem", choseDestination);
	},

	onUI5VersionChange: function(oEvent) {
		var oDropDown = oEvent.getSource();
		var oModel = oDropDown.getModel();
		this.context.service.ui5versionsdropdown.updateModel(oModel, oDropDown.getValue()).done();
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

	onAfterDropDownRendering: function(oEvent) {
		var oDropDown = oEvent.srcControl;
		var oModel = oDropDown.getModel();
		var activeRadioButton = oModel.getProperty("/isDefaultVersion");
		if (activeRadioButton === 1) {
			this.context.service.ui5versionsdropdown.handleDropDownVersions(this._oDocument, oDropDown).done();
		} else {
			oDropDown.setBusy(false);
		}
	},

	onRadioButtonSelection: function(oRBG, oDropDown) {
		var oModel = oRBG.getModel();
		var activeRadioButton = oRBG.getSelectedIndex();
		if (activeRadioButton === 1) {
			this.context.service.ui5versionsdropdown.handleDropDownVersions(this._oDocument, oDropDown).done();
		} else {
			var that = this;
			// Disable and clear dropdown
			this.context.service.ui5versionsdropdown.clearDropdown().then(function() {
				oDropDown.removeAllItems();
				oDropDown.setEnabled(false);
				// Set the binding to null since we chose application version
				that.context.service.ui5versionsdropdown.updateModel(oModel, null).done();
			});
		}
		oModel.setProperty("/isDefaultVersion", activeRadioButton);
	},

	onLibVersionChange: function(oEvent) {
		var oDropDown = oEvent.getSource();
		var oModel = oDropDown.getModel();
		oModel.setProperty(oDropDown.getBindingContext().getPath() + "/libraryVersion", oDropDown.getSelectedKey());
	},

	getLibVersions: function() {
		var that = this;
		var result = [];
		return that.context.service.neoapp.getAppllications(that._oDocument).then(function(oNeoappApps) {
			if (oNeoappApps.length > 0) {
				var aPromises = [that.context.service.libraryDiscovery.getLibrariesFromHCP()];
				var oModel;
				if (that._oRunConfigurationUiFragment !== null) {
					oModel = that._oRunConfigurationUiFragment.getModel();
				}
				if (oModel !== undefined) {
					var oWorkspace = oModel.getProperty("/workspace/");
					if (oWorkspace === "withWorkspace") {
						aPromises.push(that.context.service.libraryDiscovery.getLibrariesFromWorkspace());
					}
				}
				return Q.all(aPromises).spread(function(oLibHcpResult, oLibWsResult) {
					for (var index in oNeoappApps) {
						var findWsResult = _.find(oLibWsResult, {
							externalName: oNeoappApps[index].name
						});
						var findHcpResult = _.find(oLibHcpResult, {
							externalName: oNeoappApps[index].name
						});
						if (findHcpResult !== undefined && findWsResult === undefined) {
							var oLibVersions = [{
								version: "Active",
								details: "Active"
							}];
							var activeVersion;
							var neoappVersion;
							for (var versionIndex in findHcpResult.versions) {
								if (findHcpResult.versions[versionIndex].version !== undefined) {
									var details = findHcpResult.versions[versionIndex].version;
									if (findHcpResult.versions[versionIndex].isActive) {
										activeVersion = findHcpResult.versions[versionIndex].version;
									}
									if (oNeoappApps[index].version === findHcpResult.versions[versionIndex].version) {
										neoappVersion = findHcpResult.versions[versionIndex].version;
									}
									oLibVersions.push({
										version: findHcpResult.versions[versionIndex].version,
										details: details
									});
								}
							}
							var currentLibVersion = oNeoappApps[index].version === undefined ? "Active" : oNeoappApps[index].version;
							result.push({
								libraryName: oNeoappApps[index].name,
								versions: oLibVersions,
								activeVersion: activeVersion,
								neoappVersion: neoappVersion,
								libraryVersion: currentLibVersion,
								detailVersion: currentLibVersion
							});
						} else {
							result.push({
								libraryName: oNeoappApps[index].name,
								versions: [{
									version: "Workspace",
									details: "Version from Workspace"
								}]
							});
						}
					}
					if (that._oRunConfigurationUiFragment !== null) {
						var oModel = that._oRunConfigurationUiFragment.getModel();
						if (oModel !== undefined) {
							var oAppsVersion = oModel.getProperty("/appsVersion/");
							if (oAppsVersion !== undefined) {
								for (var indexAppVersion = 0; indexAppVersion < oAppsVersion.length; indexAppVersion++) {
									if (oAppsVersion[indexAppVersion].libraryVersion !== undefined) {
										var oCurrentResult = _.find(result, {
											libraryName: oAppsVersion[indexAppVersion].libraryName
										});
										if (oCurrentResult !== undefined && oCurrentResult.libraryVersion !== undefined) {
											oAppsVersion[indexAppVersion].libraryVersion = oCurrentResult.libraryVersion;
										}
									}
								}
							}
						}
					}
					return result;
				});
			}
			return result;
		});
	},

	validatePathInput: function(sPathValue) {
		var that = this;
		switch (that._sRunnerId) {
			case "webapprunner":
				return that.context.service.inputvalidatorutil.validatePath(sPathValue, that._oDocument, [{
					"isRegex": false,
					"rule": ".html"
				}]);

			case "fiorirunner":
				return that.context.service.inputvalidatorutil.validatePath(sPathValue, that._oDocument, [{
					"isRegex": false,
					"rule": "Component.js"
				}, {
					"isRegex": true,
					"rule": ".*fiorisandboxconfig.*[.]json"
				}]);

			case "qunitrunner":
				return that.context.service.inputvalidatorutil.validatePath(sPathValue, that._oDocument, [{
					"isRegex": false,
					"rule": ".html"
				}]);

			case "chewebapprunner":
				return that.context.service.inputvalidatorutil.validatePath(sPathValue, that._oDocument, [{
					"isRegex": false,
					"rule": ".html"
				}]);

			default:
				return true;
		}
	},
/*
	validateParameterNameInput: function(sValue) {
		return this.context.service.inputvalidatorutil.validateUrlParameter(sValue);
	},*/

	onPathFieldChange: function(oEvent) {
		var that = this;
		that._validatePathFieldChange(oEvent).then(function(oControlData) {
			return that.context.service.errorhandler.update(oControlData);
		}).done();
	},

	onAfterPathFieldRendering: function(oEvent) {
		var that = this;
		that._validateAfterPathFieldRendering(oEvent).then(function(oControlData) {
			return that.context.service.errorhandler.update(oControlData);
		}).done();
	},

	onAfterParamNameRendering: function(oEvent) {
		var that = this;
		that._validateAfterParamNameRendering(oEvent).then(function(oControlData) {
			return that.context.service.errorhandler.update(oControlData);
		}).done();
	},

/*	onParamNameChange: function(oEvent) {
		var that = this;
		that._validateParamNameChange(oEvent).then(function(oControlData) {
			return that.context.service.errorhandler.update(oControlData);
		}).done();
	},

	onCheckBoxChange: function(oEvent) {
		var that = this;
		that._validateCheckBoxChange(oEvent).then(function(oControlData) {
			return that.context.service.errorhandler.update(oControlData);
		}).done();
	},
*/
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

/*	_validateAfterParamNameRendering: function(oEvent) {
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
	},*/

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
	
	_createOneDestinationList: function(aCurrentListObject, aDest) {
		if ((aCurrentListObject !== null) && (aCurrentListObject.length !== 0) ){
			for (var i = 0; i < aCurrentListObject.length; i++) {
		 		aDest.push(aCurrentListObject[i].name);
			}
		}
		return aDest;
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
		var aFileParts = sNewValue.split("/");
		return that._oDocument.getProject().then(function(oProject) {
			var sProjName = oProject.getEntity().getName();
			var iProjPosition = _.indexOf(aFileParts, sProjName);
			if (iProjPosition === -1 && aFileParts[0] === "") {
				sNewValue = "/" + sProjName + sNewValue;
			}
			return that.validatePathInput(sNewValue).then(function(oValid) {
				var oModel = oControl.getModel();
				var oConfiguration = oModel.getData();
				oConfiguration.filePath = sNewValue;
				oControl.setValue(sNewValue);
				oModel.setData(oConfiguration);
				return that._createControlData(oControl, oControl.getId(), oValid.isValid, oValid.message, sNewValue);
			});
		});
	}

});