jQuery.sap.require("sap.watt.saptoolsets.fiori.project.plugin.servicecatalog.ui.VisibilityContainer");

sap.ui.controller("sap.watt.saptoolsets.fiori.hcp.plugin.deployment.view.DeploymentDialog", {
	_oSelection: null,
	_oContext: null,
	_oAction: null,
	_actionResult: null,
	_uiCore: null,
	_crad: null,
	_bIsUncommitted: false,
	_bNoAccounts: false,
	_inputs: {
		appname: null,
		account: null,
		username: null,
		password: null,
		version: null
	},

	_getEmptyModelDataObject: function() {
		//The variable is defined on purpose since writing return then a literal object
		//in a new line will result in returning undefined in js
		var modelData = {
			modelData: {
				str_appname: "",
				str_deployedappname: "",
				str_account: "",
				str_username: "",
				str_password: "",
				label_okbtn: "",
				set_version: "",
				version: "",
				set_activate: null,
				applicationState: null,
				deletedText: null,
				applicationURL: null,
				versions: {}
			}
		};
		return modelData;
	},

	onInit: function() {
		var oView = this.getView();
		this._oContext = oView.getViewData().context;
		this._uiCore = sap.ui.getCore();

		this._bindEnterPress(this._uiCore.byId("appnameField"));
		this._bindEnterPress(this._uiCore.byId("deployedappnameField"));

		var oModel = new sap.ui.model.json.JSONModel();
		oModel.setData(this._getEmptyModelDataObject());

		oView._oDlg.setModel(oModel);
		oView._oDlg.bindElement("/modelData");

		this._oContext.i18n.applyTo(oView._oDlg);
	},

	//check if n is numeric
	_isNumeric: function(n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	},

	//increment the last part in activeVersion
	_incrementVersion: function(activeVersion) {
		//extract the last part in activeVersion, e.g. if activeVersion is 10.0.12 then lastPart will be 12
		var versionPartsArray = activeVersion.split(".");
		var lastPart = versionPartsArray[versionPartsArray.length - 1];
		var newvVersion;

		//if last char is numeric increment by 1
		if (this._isNumeric(lastPart)) {
			lastPart = Number(lastPart) + 1;
			newvVersion = versionPartsArray.slice(0, versionPartsArray.length - 1);
			newvVersion.push(lastPart);
			newvVersion = newvVersion.join(".");
		} else { //if last char is not numeric add 1 in the end
			newvVersion = activeVersion + "1";
		}

		return newvVersion;
	},

	//check if suggestedVersion exists in versions array (this array is set before in the model by getAppVersions)
	_versionExist: function(suggestedVersion) {
		var i = 0;
		var oDialog = this.getView()._oDlg;
		var oModel = oDialog.getModel();
		var oData = oModel.getData();
		var versions = oData.modelData.versions;
		for (i; versions && i < versions.length; i++) {
			if (suggestedVersion === versions[i].version) {
				return true;
			}
		}
		return false;
	},

	//this function returns a suggestion to the next version according to the existing versions
	//it increments the active version if exists, else set the version to 1,
	//verifying no version in this name exists in HCP, if exists, increment by 1 again and so on
	_getNewVersion: function(activeVersion, versions) {
		var i = 0;
		if (activeVersion) {
			var suggestedVersion = this._incrementVersion(activeVersion);
		} else { //case of no active version
			suggestedVersion = "1";
		}

		for (i; i < versions.length; i++) {
			if (suggestedVersion === versions[i].version) {
				suggestedVersion = this._incrementVersion(suggestedVersion);
				i = 0;
			}
		}

		return suggestedVersion;
	},

	_open: function(action, mode, that) {
		that._oAction = action;

		that._clearValidationMarks(that._uiCore.byId("appnameField"));
		that._clearValidationMarks(that._uiCore.byId("deployedappnameField"));
		that._clearValidationMarks(that._uiCore.byId("versionField"));

		var oDialog = that.getView()._oDlg;
		var oModel = oDialog.getModel();
		//Initialize the model each time the dialog is opened
		oModel.setData(this._getEmptyModelDataObject());
		var oData = oModel.getData();

		oModel.setProperty("/modelData/str_appname", action.helium.appname);
		oModel.setProperty("/modelData/str_deployedappname", action.helium.deployedappname);
		if (!oData.modelData.str_account) {
			oModel.setProperty("/modelData/str_account", action.helium.account);
		}

		oModel.setProperty("/modelData/str_username", that._crad.username);

		oModel.setProperty("/modelData/str_password", that._crad.password);
		oModel.setProperty("/modelData/label_okbtn", that._getText(action.buttonText));
		oModel.setProperty("/modelData/version", "");
		oModel.setProperty("/modelData/set_activate", true);
		oModel.setProperty("/modelData/mode", mode);
		oModel.setProperty("/modelData/isUncommitted", that._bIsUncommitted);

		that._inputs.appname = action.helium.appname;
		that._inputs.deployedappname = action.helium.deployedappname;
		that._inputs.account = action.helium.account;
		that._inputs.username = action.helium.username;
		that._inputs.password = that._crad.password;
		that._handleHeliumAppName();
		var connectivityService = that._oContext.service.hcpconnectivity;
		var inputs = that._inputs;
		return Q.all([connectivityService.getHCPAccounts(inputs.account, action.helium.member, inputs.password), connectivityService.getHCPDefaultAccount()])
			.spread(function(aAccounts, defaultAccount) {

				that._populateAccountsComboBox(aAccounts, defaultAccount);

				if (mode === "deploy" || mode === "deletedGitNotExists" || mode === "deletedGitExists") {
					that._inputs.version = "1.0.0"; //setting the version to 1.0.0 since this is the first deployment
					oModel.setProperty("/modelData/version", that._inputs.version);
					if (mode === "deletedGitNotExists") {
						oModel.setProperty("/modelData/deletedText", that._getText("deletedTextGitNotExists"));
					} else if (mode === "deletedGitExists") {
						that._selectAccountAccordingToDeployedApp();
						oModel.setProperty("/modelData/deletedText", that._getText("deletedTextGitExists"));
					}
					that._resetVersionAndActivateFields();
				} else if (mode === "redeploy") { //in case of redeploy we have more fields which we have to set
					that._selectAccountAccordingToDeployedApp();
					return Q.all([connectivityService.getAppInfo(inputs.account, inputs.username, inputs.password, inputs.deployedappname),
							connectivityService.getAppVersions(inputs.account, inputs.username, inputs.password,
								inputs.deployedappname)
						])
						.spread(function(applicationInfo, versions) {
							var suggestedVersion = that._getNewVersion(applicationInfo.activeVersion, versions);
							that._inputs.version = suggestedVersion;
							oModel.setProperty("/modelData/applicationState", applicationInfo.status); //stop\started
							oModel.setProperty("/modelData/applicationURL", applicationInfo.url);
							oModel.setProperty("/modelData/activeVersion", applicationInfo.activeVersion); //the current active version on HCP
							oModel.setProperty("/modelData/version", suggestedVersion); //this is the suggested version
							oModel.setProperty("/modelData/versions", versions); //all versions of the application which exists on HCP
							that._validateAllInputs();
							oDialog.open();
						}).fail(function(error) {
							throw new Error(error.message);
						}).done();
				}

				that._validateAllInputs();
				oDialog.open();
			});
	},

	open: function(action, mode, oGit, oSelection, oCredentials) {

		var that = this;
		that._oSelection = oSelection;
		var oGitPromise;
		if (oGit) {
			oGitPromise = this._oContext.service.git.getStatus(oGit);
		} else {
			// If there's no GIT repo, it's the same as an empty change list
			oGitPromise = Q([]);
		}
		oGitPromise.then(function(aStatus) {
			that._bIsUncommitted = aStatus.length > 0;
		}).then(function() {
			// Use provided credentials, or authenticate if needed
			if (oCredentials !== undefined) {
				that._crad = oCredentials;
				action.helium.username = oCredentials.username;
				action.helium.password = oCredentials.password;
				action.helium.member = oCredentials.member;

				that._open(action, mode, that);
			} else {
				that._oContext.service.hcpauthentication.authenticate().then(function(oUserCrad) {
					that._crad = oUserCrad;
					action.helium.username = oUserCrad.username;
					action.helium.password = oUserCrad.password;
					action.helium.member = oUserCrad.member;

					that._open(action, mode, that);
				}).fail(function(oError) {
					if (oError.message !== "Authentication_Cancel") {
						throw new Error(oError.message);
					}
				}).done();
			}
		}).done();
	},

	//On OK press
	_execute: function() {
		this._actionResult = null;
		var oData = this.getView()._oDlg.getModel().getData().modelData;
		this.getView()._oDlg.setBusy(true);
		this._oAction.execution(oData.str_appname, oData.str_deployedappname, oData.str_account, oData.str_username, oData.str_password,
			oData.version, oData.set_activate);
	},

	//On Cancel press
	_cancel: function() {
		this._actionResult = null;
		this.getView().heliumAccountCombobox.removeAllItems();
		this.getView()._oDlg.close();
	},

	//On close
	close: function(result) {
		this._actionResult = result;
		this.getView().heliumAccountCombobox.removeAllItems();
		this.getView()._oDlg.setBusy(false);
		this.getView()._oDlg.close();
	},

	//After Dialog closed
	_closed: function() {
		var that = this;

		// Clear inputs when done
		this._inputs = {
			appname: null,
			account: null,
			username: null,
			password: null,
			member: null,
			version: null
		};

		if (that._oSelection && that._oSelection.document) {
			//doUpdate updates the git pane an the decorations in the repository browser
			that._oContext.service.gitclient.doUpdate(that._oSelection.document, true).done();
		}

		if (this._actionResult) {
			if (this._actionResult.title === "dlg_error") {
				this._showDialogMessage("alert",
					this._getText(this._actionResult.message) + "\n\n" + this._getText(this._actionResult.info),
					this._getText(this._actionResult.title),
					function() {
						this._actionResult = null;
					});

			} else { //Open Notification dialog with links
				var oModelData = this.getView()._oDlg.getModel().getData().modelData;
				var sNotActive = "";
				var oUserAuth = {};
				oUserAuth.account = oModelData.str_account;
				oUserAuth.email = oModelData.str_username;
				oUserAuth.password = oModelData.str_password;

				that._oContext.service.deployment.getAppURI(oModelData.str_account, oModelData.str_username, oModelData.str_password, oModelData.str_deployedappname)
					.then(function(AppUrl) {
						return that._oContext.service.hcpconnectivity.getLinkToCockPit(oModelData.str_account).then(function(linkToCockpit) {
							var linkToCockpitArray = linkToCockpit.split("/");
							var indexOfDashborad = linkToCockpitArray.indexOf("accountdashboard");
							if (indexOfDashborad > -1) {
								linkToCockpitArray.splice(indexOfDashborad, 1);
							}
							linkToCockpitArray.push("html5app");
							linkToCockpitArray.push(oModelData.str_deployedappname);
							linkToCockpitArray.push("dashboard");
							var _linkToAppInCockpit = linkToCockpitArray.join("/");

							if (!oModelData.set_activate) {
								sNotActive = that._oContext.i18n.getText("i18n", "DeployNotificationDialog_notActive");
							}

							var sHtmlLinkText = " <embed data-index=\"0\"> ";
							var sVersionMsg = that._oContext.i18n.getText("i18n", "DeployNotificationDialog_version", [oModelData.version, sNotActive]);

							var oDialogModel = new sap.ui.model.json.JSONModel();
							oDialogModel.setData({
								sVersionMessage: sVersionMsg,
								link: AppUrl.commitURI,
								activeLink: AppUrl.activeURI,
								linkToAppInCockpit: _linkToAppInCockpit,
								version: oModelData.version,
								isActive: oModelData.set_activate,
								flp: true,
								fiorilaunchpad: that._oContext.service.fiorilaunchpad,
								project: that._oAction.projectDocument,
								userAuth: oUserAuth,
								htmlLinkText: sHtmlLinkText
							});

							that.confirmDialog = sap.ui.jsfragment("sap.watt.saptoolsets.fiori.hcp.plugin.deployment.view.DeployNotification", oDialogModel);
							that._oContext.i18n.applyTo(that.confirmDialog);
							that.confirmDialog.setModel(oDialogModel);
							that.confirmDialog.open();
						});
					}).done();
			}
		}
	},

	_validateHeliumAppName: function(name) {
		var RegEx = /^[a-z][0-9a-z]*$/;

		if (name && name.length <= 30 && RegEx.test(name)) {
			return true;
		} else {
			return false;
		}
	},

	_handleHeliumAppName: function(oEvent) {
		var deployedappnameField = this._uiCore.byId("deployedappnameField");
		var eTextField = this._uiCore.byId("errorTextField");
		var name;
		var bValueChanged;

		if (oEvent !== undefined) {
			name = oEvent.getParameter("liveValue").trim();
			bValueChanged = true;
		} else {
			name = deployedappnameField.getValue().trim();
			bValueChanged = false;
		}

		this._inputs.deployedappname = name;
		if (this._validateHeliumAppName(name)) {
			this._handleValidInput(deployedappnameField, bValueChanged);
			this._handleErrorTextView(eTextField, null);
			this._validateAllInputs();
			return true;
		} else {
			this._handleInvalidInput(deployedappnameField);
			this._handleErrorTextView(eTextField, this._getText("msg_appnameconvention"));
			this._validateAllInputs();
			return false;
		}
	},

	_populateAccountsComboBox: function(oAccounts, defaultAccount) {
		var heliumAccountCombobox = this.getView().heliumAccountCombobox;
		var eTextField = this._uiCore.byId("errorTextField");
		if (oAccounts.length > 0) {

			var account = null;
			var oItem = null;

			for (var i = 0; i < oAccounts.length; i++) {
				account = oAccounts[i];
				oItem = new sap.ui.core.ListItem();
				oItem.setText(account.name + " (" + account.displayName + ")");
				var oAccountJSON = new sap.ui.model.json.JSONModel(account);
				oItem.setModel(oAccountJSON);
				oItem.setKey(i);
				heliumAccountCombobox.addItem(oItem);
				//select the default HCP account
				if (account.name === defaultAccount) {
					heliumAccountCombobox.setSelectedKey(oItem.getKey());
				}
			}
			// if only one account exists - select it
			if ((oAccounts.length === 1) && (oItem !== null)) {
				heliumAccountCombobox.setSelectedKey(oItem.getKey());
				heliumAccountCombobox.setEnabled(false);
			} else {
				heliumAccountCombobox.setEnabled(true);
			}
			this._bNoAccounts = false;
			heliumAccountCombobox.focus();
		} else {
			// there are no accounts 
			heliumAccountCombobox.setEnabled(false);
			this._handleErrorTextView(eTextField, this._getText("msg_no_accounts"));
			this._bNoAccounts = true;
		}
	},

	_getSelectedAccount: function() {

		var sAccountName = null;
		var heliumAccountCombobox = this.getView().heliumAccountCombobox;

		var selectedItemId = heliumAccountCombobox.getSelectedItemId();
		var items = heliumAccountCombobox.getItems();
		for (var i = 0; i < items.length; i++) {
			var item = heliumAccountCombobox.getItems()[i];

			if (item.sId === selectedItemId) {
				sAccountName = item.getModel().oData.name;
			}
		}

		return sAccountName;
	},

	_onAccountChange: function() {
		var oModel = this.getView()._oDlg.getModel();
		var selectedAccount = this._getSelectedAccount();
		this._oAction.account = selectedAccount;
		oModel.setProperty("/modelData/str_account", this._oAction.account);
	},

	//on redploy and deletedGitExists modes the account which the app is deployed on will be selected
	_selectAccountAccordingToDeployedApp: function() {
		var sAccountToBeSelected = this._oAction.helium.account;
		var heliumAccountCombobox = this.getView().heliumAccountCombobox;
		var items = heliumAccountCombobox.getItems();
		for (var i = 0; i < items.length; i++) {
			var item = heliumAccountCombobox.getItems()[i];
			var itemName = item.getText().split(" ")[0];
			if (itemName === sAccountToBeSelected) {
				heliumAccountCombobox.setSelectedKey(item.getKey());
			}
		}
		heliumAccountCombobox.setEnabled(false);
	},

	reportError: function(msg, disableDeployButton) {
		if (disableDeployButton === true) {
			this.getView()._okButton.setEnabled(false);
			this.getView()._okButton.rerender();
		}
		var eTextField = this._uiCore.byId("errorTextField");
		this._handleErrorTextView(eTextField, msg);
	},

	_resetVersionAndActivateFields: function() {
		var activateCheckbox = this._uiCore.byId("activationCheckBox");
		activateCheckbox.setEnabled(true);
		activateCheckbox.setChecked(true);
	},

	_validateVersion: function(version) {
		var regex = /^[a-zA-Z0-9_]+([\.\/]?[^^\.\\//!$@%^&*()+|~=`{}\[\]:";'<>?,])*$/;
		var oDialog = this.getView()._oDlg;
		var oModel = oDialog.getModel();
		var oData = oModel.getData();
		var mode = oData.modelData.mode;

		if (mode === "run" || (version && version !== "" && regex.test(version) && !this._versionExist(version))) {
			return true;
		}
		return false;
	},

	_handleVersion: function(oEvent) {
		var versionField = this._uiCore.byId("versionField");
		var eTextField = this._uiCore.byId("errorTextField");
		var version;
		var bValueChanged;

		if (oEvent !== undefined) {
			version = oEvent.getParameter("liveValue").trim();
			bValueChanged = true;
		} else {
			version = versionField.getValue().trim();
			bValueChanged = false;
		}

		this._inputs.version = version;
		if (this._versionExist(version)) {
			this._handleInvalidInput(versionField);
			this._handleErrorTextView(eTextField, this._oContext.i18n.getText("msg_version_exists_validation"));
			this._validateAllInputs();
		} else if (this._validateVersion(version)) {
			this._handleValidInput(versionField, bValueChanged);
			this._handleErrorTextView(eTextField, null);
			this._validateAllInputs();
			return true;
		} else {
			this._handleInvalidInput(versionField);
			this._handleErrorTextView(eTextField, this._oContext.i18n.getText("msg_version_convention"));
			this._validateAllInputs();
			return false;
		}
	},

	_handleActivationCheckBox: function(oEvent) {
		var activationCheckBox = oEvent.getSource();
		activationCheckBox.rerender();
	},

	_validateAllInputs: function() {
		var button = this.getView()._okButton;
		if (this._validateHeliumAppName(this._inputs.deployedappname) &&
			this._validateVersion(this._inputs.version) && !this._bNoAccounts) {
			button.setEnabled(true);
			button.rerender();
		} else {
			button.setEnabled(false);
			button.rerender();
		}
	},

	_bindEnterPress: function(oControl) {
		var that = this;
		var button = this.getView()._okButton;
		oControl.attachBrowserEvent("keyup", function(e) {
			if (e.keyCode === 13) {
				// enter key is pressed
				if (button.getEnabled()) {
					that._execute();
				}
			}
		});
	},

	_handleErrorTextView: function(textView, oMessage) {
		if (oMessage) {
			textView.setText(oMessage);
			if (textView.hasStyleClass("sapUiHidden")) {
				textView.removeStyleClass("sapUiHidden");
			}
		} else {
			textView.setText("");
			if (!textView.hasStyleClass("sapUiHidden")) {
				textView.addStyleClass("sapUiHidden");
			}
		}
	},

	_handleValidInput: function(oControl, bValueChanged) {
		if (bValueChanged) {
			this._markAsValid(oControl);
		}
	},

	_handleInvalidInput: function(oControl) {
		this._markAsInvalid(oControl);
	},

	_markAsValid: function(oControl) {
		oControl.removeStyleClass("inputError");
		oControl.addStyleClass("inputConfirmed");

		var $This = jQuery("#" + oControl.getId());

		$This.animate({
			opacity: "1"
		}, 2000, function() {
			oControl.removeStyleClass("inputConfirmed");
		});
	},

	_markAsInvalid: function(oControl) {
		oControl.removeStyleClass("inputConfirmed");
		oControl.addStyleClass("inputError");
	},

	_clearValidationMarks: function(oControl) {
		oControl.removeStyleClass("inputConfirmed");
		oControl.removeStyleClass("inputError");
	},

	_showDialogMessage: function(type, message, title, callback) {
		if (type === "alert") {
			sap.ui.commons.MessageBox.alert(message, callback, title, null);
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