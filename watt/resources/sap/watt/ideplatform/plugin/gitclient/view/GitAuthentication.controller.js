jQuery.sap.require({
	modName: "sap.watt.ideplatform.plugin.gitclient.view.GitBase",
	type: "controller"
});

sap.watt.ideplatform.plugin.gitclient.view.GitBase.extend("sap.watt.ideplatform.plugin.gitclient.view.GitAuthentication", {
	_sProtocol: null,
	_oDeferred: null,
	_i18n: null,
	_rGerritChangeID: "^(refs/changes/\\d+/\\d+/\\d+)$",
	_sHost: null,

	onInit: function() {
		var oData = {
			"isGerrit": false,
			"sDialogTitle": "",
			"isUser": false,
			"user": "",
			"isSSH": false,
			"isCachedInService": false,
			"isSaveCash": false,
			"oStorageKeyData": null
		};

		//I18n 
		this._oContext = this.getView().getViewData().context;
		this._i18n = this._oContext.i18n;
		this._i18n.applyTo(this.getView()._oAuthenticationDialog);

		var oModel = new sap.ui.model.json.JSONModel();
		oModel.setData({
			modelData: oData
		});
		this.getView()._oAuthenticationDialog.setModel(oModel);
		this.getView()._oAuthenticationDialog.bindElement("/modelData");
	},

	cancel: function(oEvent) {
		this.getView()._oAuthenticationDialog.close();
		this._oDeferred.resolve(false);
	},

	open: function(sUri, bGerrit) {
		var that = this;
		var sProtocol = URI(sUri).protocol();
		var sUsername = URI(sUri).username();
		this._sHost = URI(sUri).host();

		var oView = this.getView();
		var oModel = oView._oAuthenticationDialog.getModel();
		this._sProtocol = sProtocol;
		this._oDeferred = Q.defer();
		var bSsh = sProtocol === "ssh";
		oModel.setProperty('/modelData/isSaveCash', false);

		if (!sUri) {
			that.callMessageDialog({
				source: "git",
				type: "Warning",
				name: that._i18n.getText("i18n", "gitDispatcher_cannot_perform")
			});
			return Q(false);
		}

		//Extract Key from service
		this._oContext.service.keystorage.get(this._sHost, bSsh ? "SSH" : "HTTPS").then(function(oKeyStorage) {
			oModel.setProperty('/modelData/isCachedInService', !!oKeyStorage);
			oModel.setProperty('/modelData/oStorageKeyData', oKeyStorage);
			oModel.setProperty('/modelData/isSSH', bSsh);
			if (oKeyStorage && !bGerrit) {
				that._oDeferred.resolve({
					sshPrivateKey: bSsh ? oKeyStorage.key : undefined,
					httpsPassword: bSsh ? undefined : oKeyStorage.password,
					change: undefined,
					userName: oKeyStorage.username || sUsername,
					saveToCache: !oModel.getProperty('/modelData/isCachedInService') && oModel.getProperty('/modelData/isSaveCash')
				});
			} else {
				if (bGerrit) {
					if (oKeyStorage) {
						oModel.setProperty("/modelData/sDialogTitle", that._i18n.getText("i18n", "gitAuthentication_fetch_from_gerrit"));
					} else {
						oModel.setProperty("/modelData/sDialogTitle", that._i18n.getText("i18n", "gitAuthentication_fetch_from_gerrit_auth"));
					}
				} else {
					oModel.setProperty("/modelData/sDialogTitle", that._i18n.getText("i18n", "fetchAuthentication_authentication_title"));
				}
				oModel.setProperty('/modelData/isGerrit', !!bGerrit);
				oModel.setProperty('/modelData/isUser', !((oKeyStorage && oKeyStorage.username) || sUsername));
				that._initializeDialogFields(bGerrit, bSsh, !((oKeyStorage && oKeyStorage.username) || sUsername));
				if (!sUsername && oKeyStorage && oKeyStorage.username) {
					sUsername = oKeyStorage.username;
				}
				oModel.setProperty('/modelData/user', sUsername);
				oView._oAuthenticationDialog.open();
			}
		}).done();
		return this._oDeferred.promise;
	},

	handleAuthentication: function(oEvent) {
		var oView = this.getView();
		var oModel = oView._oAuthenticationDialog.getModel();
		var that = this;
		var sGerritChangeID = oView._oBranchTextField.getValue();
		var oKeyStorage = null;

		if (oModel.getProperty('/modelData/isGerrit')) {
			if (!this._handleChangeName({
				getParameter: function(sParameter) {
					return sGerritChangeID;
				}
			})) {
				return;
			}
		}

		if (!oModel.getProperty('/modelData/user')) {
			this._handleUserError(that._i18n.getText("i18n", "gITAuthenticationDialog_incorrect_user_name"), oView._oUserNameTextField);
			return;
		}

		switch (this._sProtocol) {
			case "ssh":
				oKeyStorage = oModel.getProperty('/modelData/oStorageKeyData');
				if (oKeyStorage) {
					that._oDeferred.resolve({
						sshPrivateKey: oKeyStorage.key,
						httpsPassword: null,
						change: sGerritChangeID,
						userName: that.getView()._oUserNameTextField.getValue(),
						saveToCache: !oModel.getProperty('/modelData/isCachedInService') && oModel.getProperty('/modelData/isSaveCash')
					});
					oView._oAuthenticationDialog.close();
				} else {
					//Regular case user do not want to save key
					var oFile = that._handleFileUploader(oEvent);
					//Check Fileuploader and browser support
					if (!oFile) {
						return;
					}

					return that.getPrivateKeyFromFileInput(oFile).then(function(sFileContent) {
						that._oDeferred.resolve({
							sshPrivateKey: sFileContent,
							httpsPassword: null,
							change: sGerritChangeID,
							userName: that.getView()._oUserNameTextField.getValue(),
							saveToCache: !oModel.getProperty('/modelData/isCachedInService') && oModel.getProperty('/modelData/isSaveCash')
						});
						oView._oAuthenticationDialog.close();
					}).fail(function(oError) {
						//No File data was found init the storage for this host so that next time user will fill it
						that._handleUserError(that._i18n.getText("i18n", "gITAuthenticationDialog_ssh_file_error"), oView._oFileUploader);
						that._oContext.service.keystorage.setSsh(that._sHost).done();
					});
				}
				break;
			case "https":
				oKeyStorage = oModel.getProperty('/modelData/oStorageKeyData');
				if (oKeyStorage) {
					that._oDeferred.resolve({
						sshPrivateKey: null,
						httpsPassword: oKeyStorage.password,
						change: sGerritChangeID,
						userName: oKeyStorage.username,
						saveToCache: !oModel.getProperty('/modelData/isCachedInService') && oModel.getProperty('/modelData/isSaveCash')
					});
					oView._oAuthenticationDialog.close();
				} else if (oView._oPasswordField.getValue()) {
					that._oDeferred.resolve({
						sshPrivateKey: null,
						httpsPassword: oView._oPasswordField.getValue(),
						change: sGerritChangeID,
						userName: oView._oUserNameTextField.getValue(),
						saveToCache: !oModel.getProperty('/modelData/isCachedInService') && oModel.getProperty('/modelData/isSaveCash')
					});
					oView._oAuthenticationDialog.close();
				} else {
					that._handleUserError(this._i18n.getText("i18n", "gITAuthenticationDialog_password_error"), oView._oPasswordField);
					that._oContext.service.keystorage.setHttps(that._sHost).done();
				}
		}
	},

	onPasswordSapenter: function(oEvent) {
		this.getView()._oPasswordField.setValue(oEvent.target.value);
		this.handleAuthentication();
	},

	_initializeDialogFields: function(bGerrit, bProtocol, bUsername) {
		var oView = this.getView();

		oView._oBranchTextField.setValue("");
		this.clearValidationMarks(oView._oBranchTextField);
		oView._oFileUploader.setValue("");
		this.clearValidationMarks(oView._oFileUploader);
		oView._oPasswordField.setValue("");
		this.clearValidationMarks(oView._oPasswordField);
		oView._oErrorTextArea.setText("");
		this.clearValidationMarks(oView._oUserNameTextField);
		oView._oUserNameTextField.setValue("");

		//Set initial focus on the first field in the dialog
		if (bGerrit) {
			oView._oAuthenticationDialog.setInitialFocus(oView._oBranchTextField);
			return;
		}

		if (bUsername) {
			oView._oAuthenticationDialog.setInitialFocus(oView._oUserNameTextField);
			return;
		}

		if (bProtocol) {
			oView._oAuthenticationDialog.setInitialFocus(oView._oFileUploader);
			return;
		}
		oView._oAuthenticationDialog.setInitialFocus(oView._oPasswordField);
	},

	_handleUserError: function(sText, oController) {
		this.getView()._oErrorTextArea.setText(sText);
		this.markAsInvalid(oController);
	},

	_handleChangeName: function(oEvent) {
		var oView = this.getView();
		var sGerritChangeID = oEvent.getParameter("newValue");

		var oRegexTest = new RegExp(this._rGerritChangeID);
		if (!oRegexTest.test(sGerritChangeID)) {
			this._handleUserError(this._i18n.getText("i18n", "gITAuthenticationDialog_incorrect_change"), oView._oBranchTextField);
			return false;

		}
		oView._oErrorTextArea.setText("");
		this.clearValidationMarks(oView._oBranchTextField);
		return true;
	},

	_handleFileUploader: function(oEvent) {
		var oView = this.getView();
		var oFile = null;

		if (!oView._oFileUploader && !oView._oFileUploader.oFileUpload && !oView._oFileUploader.oFileUpload.files) {
			this._handleUserError(this._i18n.getText("i18n", "gITAuthenticationDialog_browser_not_supported"), oView._oFileUploader);
			return null;
		}
        
        oFile = oView._oFileUploader.oFileUpload.files[0];
		if (!oFile) {
			this._handleUserError(this._i18n.getText("i18n", "gITAuthenticationDialog_Select_file"), oView._oFileUploader);
			return null;
		}

		this.clearValidationMarks(oView._oFileUploader);
		oView._oErrorTextArea.setText("");
		return oFile;

	}
});