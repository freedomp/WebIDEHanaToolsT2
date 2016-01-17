define({
	_oRunConfigurationUiFragment: null,
	_sRunnerId: null,
	_oConfigurationUiElements: null,
	_projctRunnableFiles: null,
	_oDocument: null,
	_aSubscriptions: null,
	_aDestinations: null,
	_sHcpAccount: null,
	_sHcpUsername: null,
	_sHcpPassword: null,

	getContent: function(oConfigurationUiElements, projctRunnableFiles, oDocument) {
		var that = this;
		var sRunnerId = oConfigurationUiElements.sRunnerId;
		this._projctRunnableFiles = projctRunnableFiles;
		this._oDocument = oDocument;
		// If the UI is not defined, or the runner type has change - build it
		if (!that._oRunConfigurationUiFragment || this._sRunConfigurationId !== sRunnerId) {
			that._sRunnerId = sRunnerId;
			that._oConfigurationUiElements = oConfigurationUiElements;
			that._oRunConfigurationUiFragment = sap.ui.jsfragment("sap.watt.saptoolsets.fiori.run.plugin.embeddedrunner.view.EmbeddedRunnerUi",
				that);
		}
		this.context.i18n.applyTo(this._oRunConfigurationUiFragment);
		return that.context.service.runconfigerrorhandler.subscribe(this._oRunConfigurationUiFragment).then(function() {
			return that._oRunConfigurationUiFragment;
		});
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

	createAdditionalWsAppLine: function(oEvent) {
		var oModel = oEvent.getModel();
		var aWorkspaceApplications = oModel.getProperty("/workspaceApplications");
		aWorkspaceApplications.push({
			"localPath": "",
			"bspName": ""
		});
		oModel.setProperty("/workspaceApplications", aWorkspaceApplications);
	},

	deleteAdditionalWsAppLine: function(oEvent) {
		var that = this;
		var oBlock = oEvent.getParent().getParent().getContent();
		var pUpdates = [];
		var oErrorHandler = that.context.service.runconfigerrorhandler;
		for (var i = 0; i < oBlock.length; i++) {
			var oSection = oBlock[i].getContent();
			var oProject = oSection[0];
			var oApp = oSection[1];
			var oProjectObj = that._createControlData(oProject, true, "", "", oProject.getId());
			var oAppObj = that._createControlData(oApp, true, "", "", oApp.getId());
			pUpdates.push(oErrorHandler.update(oAppObj), oErrorHandler.update(oProjectObj));
		}
		Q.all(pUpdates).then(function() {
			// Get index of the deleted line
			var path = oEvent.getBindingContext().sPath;
			var aPathSplit = path.split("/");
			var index = aPathSplit[aPathSplit.length - 1];
			// Get the parameter list from the model
			var oModel = oEvent.getBindingContext().getModel();
			var aWorkspaceApplications = oModel.getProperty("/workspaceApplications");
			// Delete the entry from the list
			aWorkspaceApplications.splice(index, 1);
			// Set back the parameter list to the model
			oModel.setProperty("/workspaceApplications", aWorkspaceApplications);
		});
	},

	deleteParameterLine: function(oSource) {
		var that = this;
		var oBlock = oSource.getParent().getParent().getContent();
		var pUpdates = [];
		var oErrorHandler = that.context.service.runconfigerrorhandler;
		for (var i = 0; i < oBlock.length; i++) {
			var oSection = oBlock[i].getContent();
			var oParamName = oSection[1];
			var oParamNameObj = that._createControlData(oParamName, true, "", "", oBlock[i].getId());
			pUpdates.push(oErrorHandler.update(oParamNameObj));
		}
		Q.all(pUpdates).then(function() {
			// Get index of the deleted line
			var path = oSource.getBindingContext().sPath;
			var aPathSplit = path.split("/");
			var index = aPathSplit[aPathSplit.length - 1];
			// Get the parameter list from the model
			var oModel = oSource.getBindingContext().getModel();
			var aUrlParameters = oModel.getProperty("/oUrlParameters");
			// Delete the entry from the list
			aUrlParameters.splice(index, 1);
			// Set back the parameter list to the model
			oModel.setProperty("/oUrlParameters", aUrlParameters);
		});
	},

	onParamNameChange: function(oEvent) {
		var that = this;
		that._validateParamNameChange(oEvent).then(function(oControlData) {
			return that.context.service.runconfigerrorhandler.update(oControlData);
		}).done();
	},

	onCheckBoxChange: function(oEvent) {
		var that = this;
		that._validateCheckBoxChange(oEvent).then(function(oControlData) {
			return that.context.service.runconfigerrorhandler.update(oControlData);
		}).done();
	},

	createNewParameterLine: function() {
		var oModel = this.getModel();
		var aUrlParameters = oModel.getProperty("/oUrlParameters");
		aUrlParameters.push({
			"paramName": "",
			"paramValue": "",
			"paramActive": false
		});
		oModel.setProperty("/oUrlParameters", aUrlParameters);
	},

	onAfterWorkspaceAppsDropDownRendering: function(oEvent) {
		var that = this;
		var oProjectsDropDown = oEvent.srcControl;
		that._onAfterWorkspaceAppsDropDownRendering(oProjectsDropDown).then(function(oControlData) {
			return that.context.service.runconfigerrorhandler.update(oControlData);
		}).done();
	},

	_onAfterWorkspaceAppsDropDownRendering: function(oProjectsDropDown) {
		var that = this;
		return that._fillWorkspaceAppsDropDown(oProjectsDropDown).then(function() {
			var sProjectPath = oProjectsDropDown.getSelectedKey();
			return that._createControlData(oProjectsDropDown, sProjectPath !== "", "plh_run_config_ui_embmode_wsapps_projname",
				"tlt_run_config_ui_embmode_wsapps_projname", oProjectsDropDown.getId(), false);
		});
	},

	onWorkspaceAppsDropDownChange: function(oEvent) {
		var that = this;
		var oProjectsDropDown = oEvent.getSource();
		that._onWorkspaceAppsDropDownChange(oProjectsDropDown).then(function(oProjectControlData) {
			return that.context.service.runconfigerrorhandler.update(oProjectControlData).then(function() {
				return that._getDefaultAppName(oProjectsDropDown).then(function(oAppControlData) {
					return that.context.service.runconfigerrorhandler.update(oAppControlData);
				});
			});
		}).done();
	},

	_onWorkspaceAppsDropDownChange: function(oProjectsDropDown) {
		var sProjectPath = oProjectsDropDown.getSelectedKey();
		return Q(this._createControlData(oProjectsDropDown, sProjectPath !== "", "plh_run_config_ui_embmode_wsapps_projname",
			"tlt_run_config_ui_embmode_wsapps_projname", oProjectsDropDown.getId(), false));
	},

	validateParameterNameInput: function(sValue) {
		return this.context.service.inputvalidatorutil.validateUrlParameter(sValue);
	},

	onAfterWorkspaceAppTextFieldRendering: function(oEvent) {
		var that = this;
		var oAppTextField = oEvent.srcControl;
		that._onAfterWorkspaceAppTextFieldRendering(oAppTextField).then(function(oControlData) {
			return that.context.service.runconfigerrorhandler.update(oControlData);
		}).done();
	},

	_onAfterWorkspaceAppTextFieldRendering: function(oAppTextField) {
		var sAppName = oAppTextField.getValue();
		return Q(this._createControlData(oAppTextField, sAppName !== "", "plh_run_config_ui_embmode_app_name",
			"tlt_run_config_ui_embmode_app_name", oAppTextField.getId()));
	},

	onWorkspaceAppTextFieldChange: function(oEvent) {
		var that = this;
		var oAppTextField = oEvent.getSource();
		that._onWorkspaceAppTextFieldChange(oAppTextField).then(function(oControlData) {
			return that.context.service.runconfigerrorhandler.update(oControlData);
		}).done();
	},

	onRadioSelect: function(oEvent) {
		var sEmdType;
		if (oEvent.getParameters().selectedIndex === 0) {
			sEmdType = "ABAP";
		} else {
			sEmdType = "HCP";
		}
		var oModel = oEvent.getSource().getModel();
		oModel.setProperty("/emdType", sEmdType);
	},

	//formatter for visible property of ABAP field
	isAbapFieldVisible: function(emdType) {
		// backward compatibility - check that emdType exists, if not, the default is ABAP
		if (!emdType || emdType === "ABAP") {
			return true;
		}
		return false;
	},

	//formatter for visible property of HCP fields
	isHcpFieldVisible: function(emdType) {
		if (emdType === "HCP") {
			return true;
		}
		return false;
	},
	//formatter for visible property of HCP fields
	selectedRgbIndex: function(emdType) {
		// backward compatibility - check that emdType exists, if not, the default is ABAP
		if (!emdType || emdType === "ABAP") {
			return 0;
		}
		return 1;
	},

	_onWorkspaceAppTextFieldChange: function(oAppTextField) {
		var sAppName = oAppTextField.getValue();
		return Q(this._createControlData(oAppTextField, sAppName !== "", "plh_run_config_ui_embmode_app_name",
			"tlt_run_config_ui_embmode_app_name", oAppTextField.getId()));
	},

	_getDefaultAppName: function(oProjectsDropDown) {
		var that = this;
		var sProjectPath = oProjectsDropDown.getSelectedKey();
		var oSection = oProjectsDropDown.getParent();
		var oAppTextField = oSection.getContent()[1];
		var sAppName = oAppTextField.getValue();
		if (sProjectPath !== "") {
			var oEmbeddedUtil = that.context.service.embeddedrunnerutil;
			var oDocumentService = that.context.service.filesystem.documentProvider;
			return oDocumentService.getDocument(sProjectPath).then(function(oDocument) {
				return oEmbeddedUtil.getDefaultAppName(oDocument).then(function(sDefAppName) {
					oAppTextField.setValue(sDefAppName);
					return that._createControlData(oAppTextField, sDefAppName !== "", "plh_run_config_ui_embmode_app_name",
						"tlt_run_config_ui_embmode_app_name", oAppTextField.getId());
					/* If we want in the future to change the implemention to auto complete logic
					    oAppTextField.removeAllItems();
						oAppTextField.addItem(new sap.ui.core.ListItem({
							key: sDefAppName,
							text: sDefAppName
						}));
						return Q(that._createControlData(oAppTextField, sAppName !== "", "plh_run_config_ui_embmode_app_name",
							"tlt_run_config_ui_embmode_app_name", oAppTextField.getId())); */
				});
			});
		} else {
			return Q(that._createControlData(oAppTextField, sAppName !== "", "plh_run_config_ui_embmode_app_name",
				"tlt_run_config_ui_embmode_app_name", oAppTextField.getId()));
		}
	},

	_fillWorkspaceAppsDropDown: function(oProjectsDropDown) {
		var that = this;
		oProjectsDropDown.setBusy(true);
		return that.context.service.embeddedrunnerutil.getWorkspaceApps().then(function(aWorkspaceApps) {
			var oItem = new sap.ui.core.ListItem({
				key: null,
				text: null
			});
			oProjectsDropDown.addItem(oItem);
			for (var i = 0; i < aWorkspaceApps.length; i++) {
				var oWorkspaceApp = aWorkspaceApps[i];
				var sCurrProject = that._oDocument.getTitle();
				if (sCurrProject !== oWorkspaceApp.wsName) {
					oItem = new sap.ui.core.ListItem({
						key: oWorkspaceApp.wsPath,
						text: oWorkspaceApp.wsName
					});
					oProjectsDropDown.addItem(oItem);
				}
			}
			oProjectsDropDown.setBusy(false);
		});
	},

	onAfterSystemsDropDownRendering: function(oSystemsDropDown) {
		var that = this;
		that._onAfterSystemsDropDownRendering(oSystemsDropDown).then(function(oControlData) {
			return that.context.service.runconfigerrorhandler.update(oControlData);
		}).fail(function(oError) {
			var errMessage = oError.message;
			that.context.service.log.info("embedded-mode-configuration", errMessage, ["system"]).done();
		}).done();
	},

	_onAfterSystemsDropDownRendering: function(oSystemsDropDown) {
		var that = this;
		var oModel = oSystemsDropDown.getModel();
		var sSystemValue = oModel.getProperty("/flpDestName");
		if (!this._aDestinations) {
			return that.context.service.embeddedrunnerutil.getDestinations().then(function(aDestinations) {
				// check that destination exists in the destination list
				var aFoundDestination = aDestinations.filter(function(oDest) {
					if (oDest.name === sSystemValue) {
						return true;
					} else {
						return false;
					}
				});
				that._aDestinations = aDestinations;
				that._fillSystemsDropDown(oSystemsDropDown, aDestinations);
				oSystemsDropDown.setBusy(false);
				if (sSystemValue) {
					oSystemsDropDown.setSelectedKey(sSystemValue);
				}
				return (that._createControlData(oSystemsDropDown, sSystemValue && sSystemValue !== "" && aFoundDestination.length > 0,
					"tlt_run_config_ui_embmode_err_dest_name",
					"tlt_run_config_ui_embmode_dest_name", oSystemsDropDown.getId()));
			});
		} else {
			oSystemsDropDown.destroyItems();
			that._fillSystemsDropDown(oSystemsDropDown, that._aDestinations);
			oSystemsDropDown.setBusy(false);
			if (sSystemValue) {
				oSystemsDropDown.setSelectedKey(sSystemValue);
			}
			return Q(that._createControlData(oSystemsDropDown, sSystemValue !== "",
				"tlt_run_config_ui_embmode_err_dest_name",
				"tlt_run_config_ui_embmode_dest_name", oSystemsDropDown.getId()));

		}
	},

	onSystemsDropDownChange: function(oEvent) {
		var that = this;
		var oSystemsDropDown = oEvent.getSource();
		that._onSystemsDropDownChange(oSystemsDropDown).then(function(oControlData) {
			return that.context.service.runconfigerrorhandler.update(oControlData);
		}).done();
	},

	_onSystemsDropDownChange: function(oSystemsDropDown) {
		var oModel = oSystemsDropDown.getModel();
		var sSystemName = oSystemsDropDown.getSelectedKey();
		oModel.setProperty("/flpDestName", sSystemName);
		return Q(this._createControlData(oSystemsDropDown, sSystemName !== "", "tlt_run_config_ui_embmode_err_dest_name",
			"tlt_run_config_ui_embmode_dest_name", oSystemsDropDown.getId()));
	},

	onAfterAppsTextFieldRendering: function(oAppsTextField) {
		var that = this;
		that._onAfterAppsTextFieldRendering(oAppsTextField).then(function(oControlData) {
			return that.context.service.runconfigerrorhandler.update(oControlData);
		}).done();
	},

	_onAfterAppsTextFieldRendering: function(oAppsTextField) {
		var oModel = oAppsTextField.getModel();
		var sAppName = oModel.getProperty("/flpAppName");
		oAppsTextField.setValue(sAppName);
		return Q(this._createControlData(oAppsTextField, sAppName !== "", "tlt_run_config_ui_embmode_err_app_name_bsp",
			"tlt_run_config_ui_embmode_app_name_bsp", oAppsTextField.getId()));
	},

	onAppsTextFieldChange: function(oEvent) {
		var that = this;
		var oAppsTextField = oEvent.getSource();
		that._onAppsTextFieldChange(oAppsTextField).then(function(oControlData) {
			return that.context.service.runconfigerrorhandler.update(oControlData);
		}).done();
	},

	onAfterAccountTextFieldRendering: function(oAccountTextField) {
		var oModel = oAccountTextField.getModel();
		var sHcpAccount = oModel.getProperty("/hcpAccount");
		oAccountTextField.setValue(sHcpAccount);
	},

	//////////////////// start provider section
	removeDropDownMsg: function(oDropDownControl) {
		var oControlData = this._createControlData(oDropDownControl, true, "", "", oDropDownControl.getId());
		return this.context.service.runconfigerrorhandler.update(oControlData);
	},

	onAfterProviderDropDownRendering: function(oProviderDropDown) {
		var that = this;
		that._onAfterProviderDropDownRendering(oProviderDropDown).then(function(oControlData) {
			return that.context.service.runconfigerrorhandler.update(oControlData);
		}).fail(function(oError) {
			var errMessage = oError.message;
			that.context.service.log.info("embedded-mode-configuration", errMessage, ["system"]).done();
		}).done();
	},

	_onAfterProviderDropDownRendering: function(oProviderDropDown) {

		var that = this;
		var oModel = oProviderDropDown.getModel();
		var sProviderValue = oModel.getProperty("/flpName");
		var sEmdType = oModel.getProperty("/emdType");
		if (!this._aSubscriptions) {
			return that.context.service.hcpauthentication.authenticate().then(function(oUserCrad) {
				that._sHcpAccount = oUserCrad.account;
				that._sHcpUsername = oUserCrad.username;
				that._sHcpPassword = oUserCrad.password;
				return that.context.service.fiorilaunchpad.getAllFlpSubscriptions(oUserCrad.account, oUserCrad.username, oUserCrad.password).then(
					function(aSubscriptions) {
						// check that destination exists in the destination list
						var aFoundProvider = aSubscriptions.filter(function(oSub) {
							if (oSub.name === sProviderValue) {
								return true;
							} else {
								return false;
							}
						});
						that._aSubscriptions = aSubscriptions;
						that._fillProviderDropDown(oProviderDropDown, aSubscriptions);
						oProviderDropDown.setBusy(false);
						if (sProviderValue) {
							oProviderDropDown.setSelectedKey(sProviderValue);
						}
                        that._updateHcpAppName(oModel);
						return (that._createControlData(oProviderDropDown, sProviderValue !== "" && aFoundProvider.length > 0 && sEmdType === "HCP",
							"tlt_run_config_ui_embmode_err_provider_name",
							"tlt_run_config_ui_embmode_provider_name", oProviderDropDown.getId()));
					});
			}).fail(function() {
				return (that._createControlData(oProviderDropDown, sProviderValue !== "" && sEmdType === "HCP",
					"tlt_run_config_ui_embmode_err_provider_name",
					"tlt_run_config_ui_embmode_provider_name", oProviderDropDown.getId()));
			});
		} else {
			oProviderDropDown.destroyItems();
			that._fillProviderDropDown(oProviderDropDown, this._aSubscriptions);
			oProviderDropDown.setBusy(false);
			if (sProviderValue) {
				oProviderDropDown.setSelectedKey(sProviderValue);
			}
			that._updateHcpAppName(oModel);
			return Q(that._createControlData(oProviderDropDown, sProviderValue !== "" && sEmdType === "HCP",
				"tlt_run_config_ui_embmode_err_provider_name",
				"tlt_run_config_ui_embmode_provider_name", oProviderDropDown.getId()));
		}

	},

	_updateHcpAppName: function(oModel) {
		var sHcpAppName = oModel.getProperty("/hcpAppName");
		if (!sHcpAppName) {
			this.context.service.hcpconnectivity.getHCPAppName(this._oDocument, this._sHcpUsername , this._sHcpPassword , this._sHcpAccount).then(
				function(hcpAppName) {
					oModel.setProperty("/hcpAppName", hcpAppName);
				}).done();
		}

	},

	onProviderDropDownChange: function(oEvent) {
		var that = this;
		var oProviderDropDown = oEvent.getSource();
		that._onProviderDropDownChange(oProviderDropDown).then(function(oControlData) {
			return that.context.service.runconfigerrorhandler.update(oControlData);
		}).done();
	},

	_onProviderDropDownChange: function(oProviderDropDown) {
		var oModel = oProviderDropDown.getModel();
		var sProviderName = oProviderDropDown.getSelectedKey();
		oModel.setProperty("/flpName", sProviderName);
		return Q(this._createControlData(oProviderDropDown, sProviderName !== "", "tlt_run_config_ui_embmode_err_provider_name",
			"tlt_run_config_ui_embmode_provider_name", oProviderDropDown.getId()));
	},

	_fillProviderDropDown: function(oProviderDropDown, aSubscriptions) {
		var oItem = new sap.ui.core.ListItem({
			key: null,
			text: null
		});
		oProviderDropDown.addItem(oItem);
		for (var i = 0; i < aSubscriptions.length; i++) {
			var oSub = aSubscriptions[i];
			oItem = new sap.ui.core.ListItem({
				key: oSub.name,
				text: oSub.providerAccount + " (" + oSub.name + ")"
			});
			oProviderDropDown.addItem(oItem);
		}
	},
	/////////////////end provider section 

	onAfterParamNameRendering: function(oEvent) {
		var that = this;
		that._validateAfterParamNameRendering(oEvent).then(function(oControlData) {
			return that.context.service.runconfigerrorhandler.update(oControlData);
		}).done();
	},

	_onAppsTextFieldChange: function(oAppsTextField) {
		var oModel = oAppsTextField.getModel();
		var sAppName = oAppsTextField.getValue();
		oModel.setProperty("/flpAppName", sAppName);
		return Q(this._createControlData(oAppsTextField, sAppName !== "", "tlt_run_config_ui_embmode_err_app_name_bsp",
			"tlt_run_config_ui_embmode_app_name_bsp", oAppsTextField.getId()));
	},

	_fillSystemsDropDown: function(oSystemsDropDown, aDestinations) {
		var oItem = new sap.ui.core.ListItem({
			key: null,
			text: null
		});
		oSystemsDropDown.addItem(oItem);
		for (var i = 0; i < aDestinations.length; i++) {
			var sDest = aDestinations[i];
			oItem = new sap.ui.core.ListItem({
				key: sDest.name,
				text: sDest.description
			});
			oSystemsDropDown.addItem(oItem);
		}
	},

	_validateAfterParamNameRendering: function(oEvent) {
		var that = this;
		var oControl = oEvent.srcControl;
		var isChecked = oControl.getParent().getContent()[0].getChecked();
		var sParamNameValue = oControl.getValue();
		if (isChecked) {
			return that.validateParameterNameInput(sParamNameValue).then(function(oValid) {
				return that._createControlData(oControl, oValid.isValid, oValid.message, sParamNameValue, oControl.getParent().getId());
			});
		}
		return Q(that._createControlData(oControl, true, "", sParamNameValue, oControl.getParent().getId()));
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
			return that._createControlData(oControl, oValid.isValid, oValid.message, sParamNameValue, oControl.getParent().getId());
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
			return Q(that._createControlData(oParamName, true, "", sParamNameValue, oControl.getParent().getId()));
		}
		return that.validateParameterNameInput(sParamNameValue).then(function(oValid) {
			oControl.setChecked(true);
			return that._createControlData(oParamName, oValid.isValid, oValid.message, sParamNameValue, oParamName.getParent().getId());
		});
	},

	_createControlData: function(oControl, bValid, sInvalidKey, sValidKey, sControlId, bDisplayRtt) {
		var sInvalidMessage = this.context.i18n.getText("i18n", sInvalidKey);
		var sValidMessage = this.context.i18n.getText("i18n", sValidKey);
		var oControlData = {
			oControl: oControl,
			sControlId: sControlId,
			isControlValid: bValid,
			sInvalidMessage: sInvalidMessage,
			sValidMessage: sValidMessage
		};
		//Display rich tooltip is optional
		if (typeof bDisplayRtt !== "undefined") {
			oControlData.bDisplayRtt = false;
		}
		return oControlData;
	}

});