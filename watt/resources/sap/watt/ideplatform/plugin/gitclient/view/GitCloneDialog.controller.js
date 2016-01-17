jQuery.sap.require({
	modName: "sap.watt.ideplatform.plugin.gitclient.view.GitBase",
	type: "controller"
});
sap.watt.ideplatform.plugin.gitclient.view.GitBase
	.extend(
		"sap.watt.ideplatform.plugin.gitclient.view.GitCloneDialog", {

			/**
			 * @memberOf sap.watt.ideplatform.plugin.gitclient.view.GitCloneDialog
			 */
			_rURL: "(https|ssh)://[\\w-]+(\.[\\w-]+)+([\\w.,@?^=%&:/~+#-]*[\\w@?^=%&/~+#-])?",
			_rURLDest: "(https)://[\\w-]+(\.[\\w-]+)+([\\w.,@?^=%&:/~+#-]*[\\w@?^=%&/~+#-])?",
			_rPORT: "^[0-9]*$",
			_sPROTOCOL_SSH: "ssh",
			_sPROTOCOL_HTTPS: "HTTPS",
			_sGitUrl: null,
			_sGitHostName: null,
			_sHost: null,
			_sGitPort: null,
			_sGitRepositoryPath: null,
			_sGitDestinationName: null,
			_sGitUsername: {
				"username": undefined, 
				"isUrl": true
			},
			_sGitPassword: null,
			_sGitSSHKey: null,
			_oProtocolId: null,
			_sProtocolKey: null,
			_oDeferred: null,
			_i18n: undefined,
            _isGerritSupported : true,
			_isGitOnPremiseSupported: false,
			_isDestinationSelected: false,

			onInit: function() {
				this._oContext = this.getView().getViewData().context;
				this._i18n = this._oContext.i18n;
				this._i18n.applyTo(this.getView()._oCloneDialog);

				var oAuthenticationUIData = {
					"isSSH": false,
					"isCachedInService": false,
					"isGerritConfiguration": false,
					"isSaveCash": false,
					"isGitOnPremiseSupported": false,
					"isDestinationSelected" : false
				};

				var authFormContainerModel = new sap.ui.model.json.JSONModel();
				authFormContainerModel.setData({
					Parameters: oAuthenticationUIData
				});
				this.getView()._oCloneDialog.setModel(authFormContainerModel);
				this.getView()._oCloneDialog.bindElement("/Parameters");
				var oModel = new sap.ui.model.json.JSONModel();
				oModel.setData({
					cloneStarted: false
				});
				this.getView().setModel(oModel, "cloneStateModel");

				var that = this;
				this._oContext.service.git.isFeatureSupported("gitOnPremise").then(function(bIsGitOnPremiseSupported) {
                    if (bIsGitOnPremiseSupported) {
                        that._loadDestinations();
                    }
                }).done();
			},

			_loadDestinations: function() {
				var that = this;
				var oServices = this.getView().getViewData().service;
				oServices.destination.getDestinations("git_on_premise").then(function(foundDestinations) {
					if (foundDestinations && foundDestinations.length > 0) {
						foundDestinations.unshift({
							name: ""
						});
						var oModel = new sap.ui.model.json.JSONModel();
						oModel.setData({
							bShowNoData: false,
							aDestinations: foundDestinations
						});
						var oView = that.getView();
						oView._oCloneDestinationNameDropDownBox.setModel(oModel);
						that._isGitOnPremiseSupported = true;
						oView._oCloneDialog.getModel().setProperty("/Parameters/isGitOnPremiseSupported", true);
					}
				}).done();
			},

			open: function(sUrl, bGerritConfiguration) {
                var self = this;
				var oView = this.getView();
				this._cleanDialogFields(true,true);
				if (sUrl) {
					oView._oUriTextField.setValue(sUrl);
					oView._oUriTextField.fireChange({
						newValue: sUrl
					});
				}

                this._oContext.service.git.isFeatureSupported("Gerrit").then(function(isGerritSupported) {
                        oView._oCloneDialog.getModel().setProperty("/Parameters/isGerritSupported", isGerritSupported);
                          self._isGerritSupported = isGerritSupported;
                }).done();

                this._oContext.service.git.isFeatureSupported("Ssh").then(function(isSshSupported) {
                    if ( isSshSupported){
                        oView._oCloneProtocolDropDown.addItem(
                            new sap.ui.core.ListItem({
                                text: "ssh"
                            }));
                    }
                }).done();


				oView._oCloneDialog.getModel().setProperty("/Parameters/isGerritConfiguration", (bGerritConfiguration === "true"));
				//Fix Bug in positioning of clone dialog make it center top is possible
				oView._oCloneDialog.oPopup.setPosition(sap.ui.core.Popup.Dock.CenterTop, sap.ui.core.Popup.Dock.CenterTop, null, "0 48");
				oView._oCloneDialog.open();
				oView.getModel("cloneStateModel").setProperty("/cloneStarted", false);
				this._oDeferred = Q.defer();
				return this._oDeferred.promise;
			},

			//On dialog OK press - execute GIT clone command
			executeClone: function(oEvent) {
				if (!this._validateAllFields(oEvent)) {
					return;
				}
				var that = this;
				var oView = this.getView();
				var oServices = oView.getViewData().service;
				var oDialogModel = this.getView()._oCloneDialog.getModel();

				oView.getModel("cloneStateModel").setProperty("/cloneStarted", true);
				var bIsGerritConfiguration = oDialogModel.getProperty("/Parameters/isGerritConfiguration");
				oView._oCloneDialog.close();
				oServices.filesystem.documentProvider.getRoot().then(
					function(oRoot) {
						if (!(oRoot && oRoot.getEntity() && oRoot.getEntity()._mBackenData)) {
							throw {
								source: "git",
								name: that._i18n.getText("i18n", "gITCloneDialog_unexpected_error")
							};
						}
						var sLocation = oRoot.getEntity().getBackendData().location;
						oServices.usernotification.liteInfo(
							that._oContext.i18n.getText("i18n", "gitCloneDialog_CloneStarted")).done();
						return oServices.progress.startTask(that._oContext.i18n.getText("i18n", "gitCloneDialog_CloneStarted"), that._oContext.i18n.getText(
								"i18n", "gitCloneDialog_Cloning"))
							.then(function(iProgressId) {
								return oServices.git.clone(that._sGitUrl, that._sGitUsername.username, that._sGitPassword,
									that._sGitSSHKey, "", sLocation, that._sGitDestinationName).then(
									function(oResponse) {
										//Save session cache if user asked to save it
										if (!oDialogModel.getProperty("/Parameters/isCachedInService") && oDialogModel.getProperty("/Parameters/isSaveCash")) {
											if (oDialogModel.getProperty("/Parameters/isSSH")) {
												that._oContext.service.keystorage.setSsh(that._sHost, that._sGitUsername.username,
													that._sGitSSHKey).done();
											} else {
												that._oContext.service.keystorage.setHttps(that._sHost,
													that._sGitUsername.username, that._sGitPassword).done();
											}
										}

										return oServices.repositorybrowser.refresh().then(
											function() {
												that._oDeferred.resolve(oResponse);
												oServices.usernotification.liteInfo(
													that._oContext.i18n.getText("i18n", "gitCloneDialog_CloneCompletedSuccessfully"),
													true).done();
												return Q().then(function(){
													if (bIsGerritConfiguration && oResponse) {
														//call "GET" with and get the returned repository name from object returned and set it to selected
														return oServices.git.getRepositoryDetailsByLocation(oResponse).then(
															function(oRepositoryDetails) {
																return oServices.filesystem.documentProvider.getDocument(
																	URI('/' + oRepositoryDetails.Name).toString()).then(
																	function(oDocument) {
																		return oServices.git.setRepositoryConfiguration(
																			oDocument.getEntity().getBackendData().git, {
																				Key: 'gerrit.createchangeid',
																				Value: true
																			});
																	});
															});
													}
												}).then(function(){
													var sProjectName = oResponse.Location.split("/").splice(-1)[0];
													return oRoot.getChild(sProjectName).then(function(oProjectDoc){
														return that._oContext.service.gitdispatcher.ignoreSystemFiles(oProjectDoc);
													});
												});
											});
									}).fin(function() {
										return oServices.progress.stopTask(iProgressId).done();
								});
							});
					}).fail(function(oError) {
						if (oError.detailedMessage && oError.detailedMessage.indexOf("invalid advertisement of <html>") > -1) {
							oError.detailedMessage = that._oContext.i18n.getText("i18n", "gitCloneDialog_CloneFailedDueToInvalidURL");
						}
						that.callMessageDialog(oError);
						that._oDeferred.reject();
				}).done();
			},

			cancelClone: function(oEvent) {
				this.getView()._oCloneDialog.close();
			},

			onPasswordSapenter: function(oEvent) {
				this._onPasswordChange({
					getParameter: function(sParameter) {
						return oEvent.target.value;
					}
				});
				this.executeClone();
			},

			_onClose: function(oEvent) {
				if (!this.getView().getModel("cloneStateModel").getProperty("/cloneStarted")) {
					this._oDeferred.resolve(false);
				}
			},

			//clean all input fields and globals
			_cleanDialogFields: function(bCleanUrl, bCleanDest) {
				var oView = this.getView();
				this._sGitUrl = null;
				this._sGitHostName = null;
				this._sGitPort = null;
				this._sGitRepositoryPath = null;
				this._sGitUsername = {
					"username": undefined,
					"isUrl": false
				};
				this._sGitPassword = null;
				this._oProtocolId = null;
				this._sProtocolKey = null;
				this._sGitDestinationName = null;

				if (bCleanUrl) {
					oView._oUriTextField.setValue("");
					this.clearValidationMarks(oView._oUriTextField);
				}

				if (bCleanDest) {
                    this._isDestinationSelected = false;
                    oView._oCloneDestinationNameDropDownBox.setValue("");
					this.clearValidationMarks(oView._oCloneDestinationNameDropDownBox);
				}

				oView._oCloneHostTextField.setValue("");
				this.clearValidationMarks(oView._oCloneHostTextField);

				oView._oCloneRepositoryTextField.setValue("");
				this.clearValidationMarks(oView._oCloneRepositoryTextField);

                oView._oCloneProtocolDropDown.setValue(this._sPROTOCOL_HTTPS.toLowerCase());
                this.clearValidationMarks(oView._oCloneProtocolDropDown);

				oView._oClonePortTextField.setValue("");
				this.clearValidationMarks(oView._oClonePortTextField);

				oView._oCloneUserTextField.setValue("");
				this.clearValidationMarks(oView._oCloneUserTextField);

				if (oView._oCloneFileUploaderTextField) {
					oView._oCloneFileUploaderTextField.setValue("");
					this.clearValidationMarks(oView._oCloneFileUploaderTextField);
				}
				if (oView._oClonePasswordField) {
					oView._oClonePasswordField.setValue("");
					this.clearValidationMarks(oView._oClonePasswordField);
				}

				var oAuthenticationUIData = {
					"isSSH": false,
					"isCachedInService": false,
					"isGerritConfiguration": false,
					"isSaveCash": false,
					"isGitOnPremiseSupported": this._isGitOnPremiseSupported,
					"isDestinationSelected" : this._isDestinationSelected,
                    "isGerritSupported"  : this._isGerritSupported
				};

				var authFormContainerModel = oView._oCloneDialog.getModel();
				authFormContainerModel.setData({
					Parameters: oAuthenticationUIData
				});
			},

			//URL Change
			_onReositoryURLInput: function(oEvent) {
				var that = this;
				var sNewUrl = oEvent.getParameter('newValue').trim();
				if (sNewUrl === "") {
					this._cleanDialogFields(true,false);
					return;
				}
				this._cleanDialogFields(false,false);
				//Validate input and fire event for protocol change to change the dialog fields
				var rValue = (this._sGitDestinationName === "" || this._sGitDestinationName === null) ? this._rURL : this._rURLDest;
				if (this._checkInput(sNewUrl, rValue)) {
					this.clearValidationMarks(this.getView()._oUriTextField);
					this._sGitUrl = sNewUrl;
					var sProtocol = URI(sNewUrl).protocol();

					//Set host
					this._sGitHostName = URI(sNewUrl).hostname();
					this._sHost = URI(sNewUrl).host();
					this.getView()._oCloneHostTextField.setValue(this._sGitHostName);

					//Repository Path
					this._sGitRepositoryPath = URI(sNewUrl).path();
					this.getView()._oCloneRepositoryTextField.setValue(this._sGitRepositoryPath);

					//Protocol
					var oProtocolDropDown = this.getView()._oCloneProtocolDropDown;
					oProtocolDropDown.getItems().forEach(function(item) {
						if (item.getText() === sProtocol) {
							that._sProtocolKey = item.getText();
							that._oProtocolId = item.getId();
							oProtocolDropDown.setSelectedItemId(item.getId());
							oProtocolDropDown.fireEvent("change", {
								selectedItem: item.getId()
							});
							return false;
						}
					});

					//Set port
					this._sGitPort = URI(sNewUrl).port();
					this.getView()._oClonePortTextField.setValue(this._sGitPort);

					//user name
					if (URI(sNewUrl).username()) {
						this._sGitUsername.username = URI(sNewUrl).username();
						this._sGitUsername.isUrl = true;
						this.getView()._oCloneUserTextField.setValue(this._sGitUsername.username);
					} else {
						this._sGitUsername.isUrl = false;
						this._oContext.service.keystorage.get(this._sHost, sProtocol ? this._sPROTOCOL_SSH : this._sPROTOCOL_HTTPS)
							.then(function(oKeyStorage) {
								if (oKeyStorage) {
									that._sGitUsername.username = oKeyStorage.username;
									that.getView()._oCloneUserTextField.setValue(oKeyStorage.username);
								}
								//validate the all fields exist an are ok
								that._validateAllFields(oEvent);
							}).done();

					}
				} else {
					this.markAsInvalid(this.getView()._oUriTextField);
				}
			},

			//Handle host change from field
			_onHostChange: function(oEvent) {
				this._sGitHostName = oEvent.getParameter('newValue');
				this._updateURLFieldOnInputFieldsChange();
			},

			//Repository Path
			_onRepositoryChange: function(oEvent) {
				this._sGitRepositoryPath = oEvent.getParameter('newValue');
				this._updateURLFieldOnInputFieldsChange();
			},

			//Destination Name
			_onDestinationNameChange: function(oEvent) {
				this._sGitDestinationName = oEvent.getParameter("newValue");
				this._isDestinationSelected = this._sGitDestinationName === "" ? false : true;
				
				var oView = this.getView();
				oView._oCloneDialog.getModel().setProperty("/Parameters/isDestinationSelected", this._isDestinationSelected);
                oView._oCloneProtocolDropDown.setValue(this._sPROTOCOL_HTTPS.toLowerCase());
                this.clearValidationMarks(oView._oCloneProtocolDropDown);
                
				this._validateAllFields(oEvent);
			},

			//Handle dropdown protocol change
			_onProtocolChange: function(oEvent) {
				var that = this;
				var oView = this.getView();
				var oDialogModel = oView._oCloneDialog.getModel();
				this._sProtocolKey = oView._oCloneProtocolDropDown.getValue();
				//Update value of user name field that was created dynamically
				var bSsh = oView._oCloneProtocolDropDown.getValue() === this._sPROTOCOL_SSH;
				oDialogModel.setProperty("/Parameters/isSSH", bSsh);

				this._oContext.service.keystorage.get(this._sHost, bSsh ? this._sPROTOCOL_SSH : this._sPROTOCOL_HTTPS).then(
					function(oKeyStorage) {
						//Update the ssh key with any result (Key/undefined)
						oDialogModel.setProperty("/Parameters/isCachedInService", !!oKeyStorage);

						if (oKeyStorage) {
							that._sGitUsername.username = oKeyStorage.username;
							that._sGitSSHKey = bSsh ? oKeyStorage.key : undefined;
							that._sGitPassword = bSsh ? undefined : oKeyStorage.password;
						}
						that._updateURLFieldOnInputFieldsChange();
						//									oView._oAuthFormContainer.rerender();
					}).done();
			},

			//Handle port change from field
			_onPortChange: function(oEvent) {
				this._sGitPort = oEvent.getParameter('newValue');
				if (this._checkInput(this._sGitPort, this._rPORT)) {
					this._updateURLFieldOnInputFieldsChange();
					this.markAsValid(this.getView()._oClonePortTextField);
				} else {
					this.markAsInvalid(this.getView()._oClonePortTextField);
				}
			},

			//Handle user name change from field
			_onUserNameChange: function(oEvent) {
				this._sGitUsername.username = oEvent.getParameter('newValue');
			},

			//Handle password name from field
			_onPasswordChange: function(oEvent) {
				this._sGitPassword = oEvent.getParameter('newValue');
			},

			//SSH Private key from file
			_onFileUploaderChange: function(oEvent) {
				var that = this;
				var oView = this.getView();

				//In case of cancel
				if (oEvent.getParameter('newValue') === "") {
					this._sGitSSHKey = null;
					this.markAsInvalid(oEvent.getSource());
					return;
				}

				var oFile = undefined;
				//Check browser support
				if (!(!!oView._oCloneFileUploaderTextField.oFileUpload && !!oView._oCloneFileUploaderTextField.oFileUpload.files && !!(oFile = oView._oCloneFileUploaderTextField
					.oFileUpload.files[0]))) {
					this.callMessageDialog(new Error(this._i18n.getText("i18n", "gITAuthenticationDialog_browser_not_supported")));
					return;
				}

				//Get data from file uploader
				this.getPrivateKeyFromFileInput(oFile).then(function(sFileContent) {
					that._sGitSSHKey = sFileContent;
				}).fail(function(oError) {
					that.markAsInvalid(oEvent.getSource());
				}).done();
				this.markAsValid(oEvent.getSource());

			},

			_checkInput: function(sInput, rValue) {
				var oRegexTest = new RegExp(rValue);
				return oRegexTest.test(sInput);
			},

			//TODO Find a better way to handle this 
			//Validate all required fields and change color according to validation result
			_validateAllFields: function(oEvent) {
				var oView = this.getView();
				var nValidatedFields = 0;

				//URL
				var rValue = (this._sGitDestinationName === "" || this._sGitDestinationName === null) ? this._rURL : this._rURLDest;
				if (this._handleInput(this._sGitUrl, oView._oUriTextField, true, rValue)) {
					nValidatedFields += 1;
				}
				//Host
				if (this._handleInput(this._sGitHostName, oView._oCloneHostTextField)) {
					nValidatedFields += 1;
				}
				//Repository path
				if (this._handleInput(this._sGitRepositoryPath, oView._oCloneRepositoryTextField)) {
					nValidatedFields += 1;
				}

				//Validate private key for SSH
				if (oView._oCloneProtocolDropDown.getValue() === this._sPROTOCOL_SSH && (!oView._oCloneDialog.getModel().getProperty(
					"/Parameters/isCachedInService"))) {
					if (this._handleInput(this._sGitSSHKey, oView._oCloneFileUploaderTextField)) {
						nValidatedFields += 1;
					}
					return nValidatedFields === 4;
				}
				return nValidatedFields === 3;

			},

			//TODO Find a better way to handle this 
			_handleInput: function(sLocalValue, oControl, bRegexCheck, rValue) {
				if (!sLocalValue) {
					this.markAsInvalid(oControl);
					return false;
				} else {
					if (bRegexCheck) {
						if (this._checkInput(sLocalValue, rValue)) {
							this.markAsValid(oControl);
							return true;
						} else {
							this.markAsInvalid(oControl);
							return false;
						}
					} else {
						this.markAsValid(oControl);
						return true;
					}
				}
			},

			//Update the url field when one of the url components changed
			_updateURLFieldOnInputFieldsChange: function() {
				if (this._sGitHostName == null || this._sGitPort == null || this._sGitRepositoryPath == null || this._sGitUsername.username) {
					return;
				}

				var sNewUrl = undefined;

				if (this._sGitUsername.isUrl) {
					sNewUrl = new URI({
						protocol: this._sProtocolKey,
						username: this._sGitUsername.username,
						hostname: this._sGitHostName,
						port: this._sGitPort,
						path: this._sGitRepositoryPath
					}).toString();
				} else {
					sNewUrl = new URI({
						protocol: this._sProtocolKey,
						hostname: this._sGitHostName,
						port: this._sGitPort,
						path: this._sGitRepositoryPath
					}).toString();
				}

				var rValue = (this._sGitDestinationName === "" || this._sGitDestinationName === null) ? this._rURL : this._rURLDest;
				if (this._checkInput(sNewUrl, rValue)) {
					this._sGitUrl = sNewUrl;
					this.getView()._oUriTextField.setValue(sNewUrl);
				} else {
					this.markAsInvalid(this.getView()._oUriTextField);
				}
			}
		});