sap.ui.controller("sap.watt.saptoolsets.fiori.common.plugin.applicationstatus.view.ApplicationStatusDialog", {

	_oContext: null,
	_oView: null,
	_oModel: null,
	_oSelection: null,
	_oDocumentPath: null,
	_taskId: null, // for the progress bar

	onInit: function() {
		this._oView = this.getView();
		this._oContext = this._oView.getViewData().context;

		this._oModel = new sap.ui.model.json.JSONModel();
		this._oModel.setData({
			modelData: {
				// ABAP related:
				abapdestination: null,
				abapdeployedappname: null,
				abappackage: null,
				isabapdeployed: null,
				isnotabapdeployed: null,
				isabapdeploybtnvisible: null,
				// HCP related:
				deployedappname: null,
				activeversion: null,
				appstate: null,
				activeurl: null,
				commiturl: null,
				account: null,
				username: null,
				password: null,
				registerordeploybtn: null,
				versions: null,
				isdeployed: null,
				isnotdeployed: null,
				isnotdeployednote: null,
				ishcpdeploybtnvisible: false,
				// FLP related:
				provideraccount: null,
				tile: null,
				flpappname: null,
				appurl: null,
				flpurl: null,
				isregister: null,
				isnotregister: null,
				isbtnenabled: true,
				isflpbtnvisible: false
			}
		});
		this._oView._oDlg.setModel(this._oModel);
		this._oView._oDlg.bindElement("/modelData");

		this._oContext.i18n.applyTo(this._oView._oDlg);
	},

	_initModel: function(oAction) {
		// ABAP related properties
		this._oModel.setProperty('/modelData/abapdestination', oAction.abapdestination);
		this._oModel.setProperty('/modelData/abapdeployedappname', oAction.abapdeployedappname);
		this._oModel.setProperty('/modelData/abappackage', oAction.abappackage);
		this._oModel.setProperty('/modelData/isabapdeployed', oAction.isabapdeployed);
		this._oModel.setProperty('/modelData/isnotabapdeployed', oAction.isnotabapdeployed);
		this._oModel.setProperty('/modelData/isabapdeploybtnvisible', oAction.isabapdeploybtnvisible);

		this._oModel.setProperty('/modelData/appstate', oAction.helium.appstate);
		this._oModel.setProperty('/modelData/commiturl', oAction.helium.commiturl);
		this._oModel.setProperty('/modelData/activeurl', oAction.helium.activeurl);
		this._oModel.setProperty('/modelData/activeversion', oAction.helium.activeversion);
		this._oModel.setProperty('/modelData/deployedappname', oAction.helium.deployedappname);
		this._oModel.setProperty('/modelData/tile', oAction.tile);
		this._oModel.setProperty('/modelData/flpappname', oAction.flpappname);
		this._oModel.setProperty('/modelData/appurl', oAction.appurl);
		this._oModel.setProperty('/modelData/flpurl', oAction.flpurl);

		if (!this._oModel.getData().modelData.str_account) {
			this._oModel.setProperty('/modelData/account', oAction.helium.account);
		}

		this._oModel.setProperty('/modelData/username', oAction.helium.username);
		this._oModel.setProperty('/modelData/password', oAction.helium.password);
		this._oModel.setProperty('/modelData/versions', oAction.helium.versions);
		if (oAction.isdeployed !== undefined) {
			this._oModel.setProperty('/modelData/isdeployed', oAction.isdeployed);
		}
		if (oAction.isregister !== undefined) {
			this._oModel.setProperty('/modelData/isregister', oAction.isregister);
		}
		if (oAction.isnotregister !== undefined) {
			this._oModel.setProperty('/modelData/isnotregister', oAction.isnotregister);
		}
		if (oAction.isnotdeployed !== undefined) {
			this._oModel.setProperty('/modelData/isnotdeployed', oAction.isnotdeployed);
		}
		if (oAction.isnotdeployednote !== undefined) {
			this._oModel.setProperty('/modelData/isnotdeployednote', oAction.isnotdeployednote);
		}

		this._oModel.setProperty('/modelData/ishcpdeploybtnvisible', oAction.ishcpdeploybtnvisible);
		this._oModel.setProperty('/modelData/isflpbtnvisible', oAction.isflpbtnvisible);

		if (oAction.helium.activeversion) {
			this._oView.oURLGrid.addContent(this._oView.oActiveHtmlTextArea);
		} else {
			this._oView.oURLGrid.addContent(this._oView.oCommitHtmlTextArea);
		}
	},

	_open: function(oAction) {
		// initialize the model
		this._initModel(oAction);
		// open the dialog
		this._oView._oDlg.open();
		// stop the progress bar
		this._oContext.service.progress.stopTask(this._taskId).done();
		// report when the status dialog is opened
		this._oContext.service.usagemonitoring.report("deployment", "open_status_dialog", "open_dialog").done();
	},

	_handleVisibleDeployContainers: function(action, isdeployed, isnotdeployed, isnotdeployednote, isbtnvisible) {
		action.isdeployed = isdeployed;
		action.isnotdeployed = isnotdeployed;
		action.isnotdeployednote = isnotdeployednote;
		action.ishcpdeploybtnvisible = isbtnvisible;
	},

	_handleVisibleRegisterContainers: function(action, isregister, isnotregister, isbtnvisible) {
		action.isregister = isregister;
		action.isnotregister = isnotregister;
		action.isflpbtnvisible = isbtnvisible;
	},

	// This method checks the deployment case we have - deployed, not deployed or deployed in the past 
	_checkDeploymentCase: function(oDeploymentCase, action) {
		var that = this;

		//case of application is not deployed on HCP
		if (oDeploymentCase.firstDeployment === true && oDeploymentCase.HCPAppName === "") {

			this._handleVisibleRegisterContainers(action, false, false, false);
			this._handleVisibleDeployContainers(action, false, true, false, true);
			return Q();

			// case of deployment occurred in the past
		} else if (oDeploymentCase.firstDeployment === false && oDeploymentCase.HCPAppName === "") {

			this._handleVisibleRegisterContainers(action, false, false, false);
			this._handleVisibleDeployContainers(action, false, true, true, true);
			return Q();

			// case of deployed app
		} else {
			this._handleVisibleDeployContainers(action, true, false, false, false);
			var oHCPConnectivityService = this._oContext.service.hcpconnectivity;
			var oDeploymentService = this._oContext.service.deployment;
			// get app info + app URLs + app versions 
			return Q.all([oHCPConnectivityService.getAppInfo(action.helium.account, action.helium.username, action.helium.password, action.helium.deployedappname),
				oDeploymentService.getAppURI(action.helium.account, action.helium.username, action.helium.password, action.helium.deployedappname),
				oHCPConnectivityService.getAppVersions(action.helium.account, action.helium.username, action.helium.password, action.helium.deployedappname),
				that._checkRegisterCase(
					action)
			]).spread(
				function(applicationInfo, appURI, versions) {
					action.helium.appstate = applicationInfo.status;
					action.helium.activeurl = appURI.activeURI;
					action.helium.commiturl = appURI.commitURI;
					action.helium.activeversion = applicationInfo.activeVersion;
					action.helium.versions = versions;
				}).fail(function(error) {
				throw new Error(error.info);
			});
		}
	},

	// this method checks if the application is registered on FLP or not 
	_checkRegisterCase: function(action) {
		var that = this;
		var oRegisteredSubscriptions = [];
		var sTargetAppUrl = null;
		var flpUrl = null;
		var sAppDetails = null;
		var sTile = null;
		var sFLPAppName = null;
		// return all Fiori subscriptions
		return that._oContext.service.fiorilaunchpad.getAllFlpSubscriptions(action.helium.account, action.helium.username, action.helium.password)
			.then(function(subscriptions) {
				// if we have a subscription - we will check if the application is registered to it
				if (subscriptions && subscriptions.length > 0) {
					return that._oContext.service.fiorilaunchpad.getHtml5App(subscriptions, action.helium.deployedappname, action.helium.username,
						action.helium.password).then(function(oRegisteredAppDetails) {
						if (oRegisteredAppDetails && oRegisteredAppDetails.length > 0) {
							for (var i = 0; i < oRegisteredAppDetails.length > 0; i++) { //have value!!
								sAppDetails = jQuery.parseJSON(oRegisteredAppDetails[i].value);

								oRegisteredAppDetails[i].subscription.targetUrl = "#" + sAppDetails["sap.flp"].config.intentText;
								oRegisteredAppDetails[i].subscription.tileTitle = sAppDetails["sap.app"].title;
								oRegisteredAppDetails[i].subscription.flpAppName = sAppDetails["sap.platform.hcp"].appName;

								oRegisteredSubscriptions.push(oRegisteredAppDetails[i].subscription);
							}

							//set the first provider account and its details to be display
							flpUrl = oRegisteredAppDetails[0].subscription.url;
							action.flpurl = flpUrl;
							sTargetAppUrl = oRegisteredAppDetails[0].subscription.targetUrl;
							action.appurl = flpUrl + sTargetAppUrl;
							sTile = oRegisteredAppDetails[0].subscription.tileTitle;
							action.tile = sTile;
							sFLPAppName = oRegisteredAppDetails[0].subscription.flpAppName;
							action.flpappname = sFLPAppName;
							that._handleVisibleRegisterContainers(action, true, false, false);
							// set the registered provider accounts in the DropdownBox
							that._setProviderAccounts(oRegisteredSubscriptions);

						} else {
							// we have subscriptions but the application is not registered to any of them
							that._oModel.setProperty('/modelData/isbtnenabled', false);
							that._handleVisibleRegisterContainers(action, false, true, true);
							//verify there is component.js file in the project
							return action.projectDocument.getCurrentMetadata(true).then(function(aRawData) {
								for (var j = 0; j < aRawData.length; j++) {
									if (aRawData[j].name === "Component.js") { // Component.js file must exist in the project
										that._oModel.setProperty('/modelData/isbtnenabled', true);
										break;
									}
								}
							});
						}
					});
				} else {
					// there are no FLP subscriptions in the account (so app is not registered)
					that._handleVisibleRegisterContainers(action, false, false, false);
				}
			});
	},

	open: function(oAction, oSelection, bIsLocal) {

		var that = this;
		that._oSelection = oSelection;
		that._oDocumentPath = oAction.entity.getFullPath();

		return that._oContext.service.progress.startTask().then(function(sGeneratedTaskId) {
			that._taskId = sGeneratedTaskId; // save the task ID

			// check whether the application is deployed to ABAP or not
			// and update the model accordingly
			return that._oContext.service.applicationstatus.getABAPDeploymentInfo(oAction.projectDocument).then(function(oDeployedAppInfo) {

				if (oDeployedAppInfo) { // deployed
					oAction.isabapdeployed = true;
					oAction.isnotabapdeployed = false;
					oAction.isabapdeploybtnvisible = false;
					oAction.abapdestination = oDeployedAppInfo.destination;
					oAction.abapdeployedappname = oDeployedAppInfo.name;
					oAction.abappackage = oDeployedAppInfo.package;
				} else { // not deployed
					oAction.isabapdeployed = false;
					oAction.isnotabapdeployed = true;
					// show the Deploy button
					oAction.isabapdeploybtnvisible = true;
				}

				if (bIsLocal) {
					// if local environment, hide all HCP and FLP content
					that._handleVisibleDeployContainers(oAction, false, false, false, false); // isdeployed, isnotdeployed, isnotdeployednote, isbtnvisible
					that._handleVisibleRegisterContainers(oAction, false, false, false); // isregister, isnotregister, isbtnvisible

					// open the dialog
					that._open(oAction);
				} else {
					return that._oContext.service.hcpauthentication.authenticate().then(function(oUserDetails) {
						oAction.helium.username = oUserDetails.username;
						oAction.helium.password = oUserDetails.password;
						var oGit = oAction.entity.getBackendData().git;
						return that._oContext.service.hcpconnectivity.getHCPAccountByGitURL(oGit).then(function(sAccount) {
							if (sAccount) {
								// if sAccount exists and the application is deployed on some HCP account we will set this account
								// otherwise we will set the default webide account
								oAction.helium.account = sAccount;
							} else {
								oAction.helium.account = oUserDetails.account;
							}
							return that._oContext.service.deployment.getDeploymentCase(oAction.helium.username, oAction.helium.password, oAction.helium
								.account).then(function(
								oDeploymentCase) {
								oAction.helium.deployedappname = oDeploymentCase.HCPAppName; //set deployed app name in the model
								return that._checkDeploymentCase(oDeploymentCase, oAction).then(function() {
									// open the dialog
									that._open(oAction);
								});
							});
						});
					}).fail(function(oError) {
						// stop the progress bar
						that._oContext.service.progress.stopTask(that._taskId).done();
						if (oError.message !== "Authentication_Cancel") {
							throw oError;
						}
					});
				}
			});
		});
	},

	_openFLPWizard: function() {
		this._close(); // close the status dialog
		var that = this;
		return this._oSelection.document.getProject().then(function(oProjectDocument) {
			return that._oContext.service.fiorilaunchpad.openWizard(oProjectDocument, "status").done();
		}).done();
	},

	_openHCPDeployDialog: function() {
		this._close(); // close the status dialog
		this._oContext.service.deployment.deployToHelium(this._oSelection).done();
	},

	_openABAPDeployWizard: function() {
		this._close(); // close the status dialog
		// open the ABAP deploy wizard
		this._oContext.service.abaprepository.openDeployWizard(this._oSelection).done();
	},

	//On close
	close: function() {
		this._oView._oDlg.setBusy(false);
		this._oView._oDlg.close();
	},

	_close: function() {
		this._oView._oDlg.close();
		this._oView.oURLGrid.removeContent(this._oView.oActiveHtmlTextArea);
		this._oView.oURLGrid.removeContent(this._oView.oCommitHtmlTextArea);
		this._oView.providerAccountComboBox.removeAllItems();
	},

	//update the relevant fields according to the selected provider account
	_onDropBoxChange: function() {
		var selectedProvider = this._getSelectedProvider().getData();
		this._oModel.setProperty('/modelData/appurl', selectedProvider.url + selectedProvider.targetUrl);
		this._oModel.setProperty('/modelData/flpurl', selectedProvider.url);
		this._oModel.setProperty('/modelData/flpappname', selectedProvider.flpAppName);
		this._oModel.setProperty('/modelData/tile', selectedProvider.tileTitle);
		this._oView._oDlg.setModel(this._oModel);
		this._oView.oAppURLHtmlTextArea.rerender();
		this._oView.oFLPURLHtmlTextArea.rerender();
	},

	_getSelectedProvider: function() {

		var provider = null;

		var selectedItemId = this._oView.providerAccountComboBox.getSelectedItemId();
		var items = this._oView.providerAccountComboBox.getItems();
		for (var i = 0; i < items.length; i++) {
			var item = this._oView.providerAccountComboBox.getItems()[i];

			if (item.sId === selectedItemId) {
				provider = item.getModel();
			}
		}

		return provider;
	},

	_setProviderAccounts: function(oRegisteredSubscriptions) {
		var subscription = null;
		var oItem = null;

		for (var i = 0; i < oRegisteredSubscriptions.length; i++) {
			subscription = oRegisteredSubscriptions[i];
			oItem = new sap.ui.core.ListItem();
			oItem.setText(subscription.providerAccount + " (" + subscription.name + ")");
			var oSubscriptionJSON = new sap.ui.model.json.JSONModel(subscription);
			oItem.setModel(oSubscriptionJSON);
			oItem.setKey(i);
			this._oView.providerAccountComboBox.addItem(oItem);
		}

		// if only one provider exists - select it
		if ((oRegisteredSubscriptions.length === 1) && (oItem !== null)) {
			this._oView.providerAccountComboBox.setSelectedKey(oItem.getKey());
			this._oView.providerAccountComboBox.setEnabled(false);
		} else {
			this._oView.providerAccountComboBox.setEnabled(true);
		}
	},

	_getText: function(id) {
		if (this._oContext) {
			var i18n = this._oContext.i18n;
			return i18n.getText("i18n", id);
		}

		return id;
	}
});