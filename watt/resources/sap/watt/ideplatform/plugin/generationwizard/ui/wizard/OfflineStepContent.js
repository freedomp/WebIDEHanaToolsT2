jQuery.sap.declare("sap.watt.ideplatform.plugin.generationwizard.ui.wizard.OfflineStepContent");
jQuery.sap.require("sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent");

sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent.extend("sap.watt.ideplatform.plugin.generationwizard.ui.wizard.OfflineStepContent",
		{

			emptyServerErrorMsg : "Enter the SMP server URL",
			emptyPortErrorMsg : "Enter the port number",
			emptyAppIdErrorMsg : "Enter the application ID",
			invalidPortErrorMsg : "The port number must be composed only of digits 0-9",

			init : function() {

				var that = this;
				this.bDataAllreadyInsert = false;

				var oDataBindingGrid = new sap.ui.layout.Grid({
					layoutData : new sap.ui.layout.GridData({
						span : "L8 M12 S12"
					})
				}).addStyleClass("dataBindingGrid");

				var oGroupContentGrid = new sap.ui.layout.Grid({
					layoutData : new sap.ui.layout.GridData({
						span : "L12 M12 S12",
						linebreak : true
					})
				});

				var oTitleLabel = new sap.ui.commons.TextView({
					text : "{i18n>offlineStepContent_SMPServerInfo}",
					textAlign : "Left",
					width : "100%",
					wrapping : false,
					layoutData : new sap.ui.layout.GridData({
						span : "L3 M12 S12",
						linebreak : true
					})

				}).addStyleClass("fontSpecial wizardH3 parameterGroupTitleMargin");

				oGroupContentGrid.addContent(oTitleLabel);

				this.offlineCheckBox = new sap.ui.commons.CheckBox("SupportOfflineCheckBox", {
					text : "{i18n>offlineStepContent_OfflineSupport}",
					width : "100%",
					tooltip : "{i18n>offlineStepContent_OfflineSupport}",
					checked : false,
					change : function() {
						that.getModel().oData.smpOffline = this.getChecked();
						that.serverTextField.setEnabled(this.getChecked());
						that.portTextField.setEnabled(this.getChecked());
						that.appIdTextField.setEnabled(this.getChecked());

						that.fireValueChange({
							id : "offlineChange",
							value : that.getModel().oData.smpOffline
						});

						if (!this.getChecked()) {
							// clearValidationMarks for all controls
							that.clearValidationMarks(that.serverTextField);
							that.clearValidationMarks(that.portTextField);
							that.clearValidationMarks(that.appIdTextField);

							that.fireValidation({
								isValid : true
							});
						} else {
							that._validateAllParameters();
						}
					},
					layoutData : new sap.ui.layout.GridData({
						span : "L9 M12 S12",
						linebreakM : true,
						linebreakS : true
					}),
					accessibleRole : sap.ui.core.AccessibleRole.Checkbox
				}).addStyleClass("wizardCheckBox");

				oGroupContentGrid.addContent(this.offlineCheckBox);

				var serverLabel = new sap.ui.commons.Label({
					text : "{i18n>offlineStepContent_Server}",
					width : "100%",
					layoutData : new sap.ui.layout.GridData({
						span : "L3 M4 S12",
						indent : "L3 M0 S0",
						linebreak : true
					})
				}).addStyleClass("wizardBody");

				this.serverTextField = new sap.ui.commons.TextField({
					width : "100%",
					value : "{/smpServer}",
					liveChange : function(oEvent) {
						that._validateOfflineDetails(oEvent).fail(/*No failure handling is needed here*/);
					},
					enabled : false,
					layoutData : new sap.ui.layout.GridData({
						span : "L6 M8 S12"
					}),
					accessibleRole : sap.ui.core.AccessibleRole.Textbox
				});

				oGroupContentGrid.addContent(serverLabel);
				oGroupContentGrid.addContent(this.serverTextField);

				var portLabel = new sap.ui.commons.Label({
					text : "{i18n>offlineStepContent_Port}",
					width : "100%",
					layoutData : new sap.ui.layout.GridData({
						span : "L3 M4 S12",
						indent : "L3 M0 S0",
						linebreak : true
					})
				}).addStyleClass("wizardBody");

				this.portTextField = new sap.ui.commons.TextField({
					value : "{/smpPort}",
					width : "100%",
					liveChange : function(oEvent) {
						that._validateOfflineDetails(oEvent).fail(/*No failure handling is needed here*/);
					},
					enabled : false,
					layoutData : new sap.ui.layout.GridData({
						span : "L6 M8 S12"
					}),
					accessibleRole : sap.ui.core.AccessibleRole.Textbox
				});

				oGroupContentGrid.addContent(portLabel);
				oGroupContentGrid.addContent(this.portTextField);

				var appIdLabel = new sap.ui.commons.Label({
					text : "{i18n>offlineStepContent_ApplicationId}",
					width : "100%",
					layoutData : new sap.ui.layout.GridData({
						span : "L3 M4 S12",
						indent : "L3 M0 S0",
						linebreak : true
					})
				}).addStyleClass("wizardBody");

				this.appIdTextField = new sap.ui.commons.TextField({
					value : "{/smpApplicationId}",
					width : "100%",
					liveChange : function(oEvent) {
						that._validateOfflineDetails(oEvent).fail(/*No failure handling is needed here*/);
					},
					enabled : false,
					layoutData : new sap.ui.layout.GridData({
						span : "L6 M8 S12"
					}),
					accessibleRole : sap.ui.core.AccessibleRole.Textbox
				});

				oGroupContentGrid.addContent(appIdLabel);
				oGroupContentGrid.addContent(this.appIdTextField);

				this.serverTextField.addDelegate({
					onBeforeRendering : function() {
						that.serverTextField.setValue(that.serverTextField.getLiveValue());
					}
				});

				this.portTextField.addDelegate({
					onBeforeRendering : function() {
						that.portTextField.setValue(that.portTextField.getLiveValue());
					}
				});

				this.appIdTextField.addDelegate({
					onBeforeRendering : function() {
						that.appIdTextField.setValue(that.appIdTextField.getLiveValue());
					}
				});

				oDataBindingGrid.addContent(oGroupContentGrid);
				var content = new sap.ui.layout.Grid({
					layoutData : new sap.ui.layout.GridData({
						span : "L12 M12 S12",
						linebreak : true
					}),
					content : [ oDataBindingGrid ]
				});

				this.addContent(content);
			},

			validatePortRegex : function(sValue) {
				var regex = new RegExp("^[0-9]*$");
				return regex.test(sValue);
			},

			validateStepContent : function() {
				return this._validateOfflineDetails();
			},

			_validateAllParameters : function() {
				if (this.bDataAllreadyInsert) {
					var sServer = this.serverTextField.getValue().trim();
					var sPort = this.portTextField.getValue().trim();
					var sAppId = this.appIdTextField.getValue().trim();
					var bValidStep = true;
					var sErrMsg = null;

					if (sServer.length === 0) {
						bValidStep = false;
						this.markAsInvalid(this.serverTextField);
						sErrMsg = this.emptyServerErrorMsg;
					}

					if (sPort.length === 0 || !this.validatePortRegex(sPort)) {
						bValidStep = false;
						this.markAsInvalid(this.portTextField);
						if (!sErrMsg) {
							sErrMsg = this.emptyAppIdErrorMsg;
							if (sPort.length === 0) {
								sErrMsg = this.emptyPortErrorMsg;
							} else {
								sErrMsg = this.invalidPortErrorMsg;
							}
						}
					}

					if (sAppId.length === 0) {
						bValidStep = false;
						this.markAsInvalid(this.appIdTextField);
						if (!sErrMsg) {
							sErrMsg = this.emptyAppIdErrorMsg;
						}
					}

					if (bValidStep) {
						this.fireValidation({
							isValid : true
						});
					} else {
						this.fireValidation({
							isValid : false,
							message : sErrMsg
						});
					}

				} else {
					this.fireValidation({
						isValid : false
					});
				}

			},

			_validateOfflineDetails : function(oEvent) {

				this.bDataAllreadyInsert = true;
				var that = this;
				var oDeferred = Q.defer();

				var bOfflineMode = this.offlineCheckBox.getChecked();
				var sServer = this.serverTextField.getValue().trim();
				var sPort = this.portTextField.getValue().trim();
				var sAppId = this.appIdTextField.getValue().trim();

				if (!bOfflineMode) {
					oDeferred.resolve(true);
					that.markAsValid(that.serverTextField);
					that.markAsValid(that.portTextField);
					that.markAsValid(that.appIdTextField);
					that.fireValidation({
						isValid : true
					});
					return oDeferred.promise;
				}

				if (oEvent !== undefined) {
					var sValue = oEvent.getParameter("liveValue").trim();
					if (oEvent.getSource() === this.serverTextField) {
						sServer = sValue;
						oEvent.getSource().setValue(sValue);
						sServer = sValue;
						if (sServer.length === 0) {
							oDeferred.reject(this.getContext().i18n.getText("i18n", "offlineStepContent_EmptyServerErrorMsg"));
							this.markAsInvalid(this.serverTextField);
							this.fireValidation({
								isValid : false,
								message : this.emptyServerErrorMsg
							});
							return oDeferred.promise;
						} else {
							this.markAsValid(this.serverTextField);
						}

					} else if (oEvent.getSource() === this.portTextField) {
						oEvent.getSource().setValue(sValue);
						sPort = sValue;
						if (sPort.length === 0 || !this.validatePortRegex(sPort)) {
							this.markAsInvalid(this.portTextField);
							if (sPort.length === 0) {
								oDeferred.reject(this.getContext().i18n.getText("i18n", "offlineStepContent_EmptyPortErrorMsg"));
								this.fireValidation({
									isValid : false,
									message : this.emptyPortErrorMsg
								});
								return oDeferred.promise;
							} else if (!this.validatePortRegex(sPort)) {
								oDeferred.reject(this.getContext().i18n.getText("i18n", "offlineStepContent_PortIsNotValidErrorMsg"));
								this.fireValidation({
									isValid : false,
									message : this.invalidPortErrorMsg
								});
								return oDeferred.promise;
							}
						} else {
							this.markAsValid(this.portTextField);
						}

					} else if (oEvent.getSource() === this.appIdTextField) {
						oEvent.getSource().setValue(sValue);
						sAppId = sValue;
						if (sAppId.length === 0) {
							this.markAsInvalid(this.appIdTextField);
							oDeferred.reject(this.getContext().i18n.getText("i18n", "offlineStepContent_EmptyAppIdErrorMsg"));
							this.fireValidation({
								isValid : false,
								message : this.emptyAppIdErrorMsg
							});
							return oDeferred.promise;
						} else {
							this.markAsValid(this.appIdTextField);
						}
					}

				}

				if (sServer.length > 0 && sPort.length > 0 && sAppId.length > 0 && this.validatePortRegex(sPort)) {
					oDeferred.resolve(true);
					this.fireValidation({
						isValid : true
					});
				} else {
					oDeferred.reject("");
					this.fireValidation({
						isValid : false,
						message : ""
					});

				}
				return oDeferred.promise;
			},

			cleanStep : function() {
				//Clean all fileds
				this.offlineCheckBox.setChecked(false);
				this.serverTextField.setValue("");
				this.portTextField.setValue("");
				this.appIdTextField.setValue("");
			},

			renderer : {},

			onAfterRendering : function() {
				this.emptyServerErrorMsg = this.getContext().i18n.getText("i18n", "offlineStepContent_EmptyServerErrorMsg");
				this.emptyPortErrorMsg = this.getContext().i18n.getText("i18n", "offlineStepContent_EmptyPortErrorMsg");
				this.emptyAppIdErrorMsg = this.getContext().i18n.getText("i18n", "offlineStepContent_EmptyAppIdErrorMsg");
				this.invalidPortErrorMsg = this.getContext().i18n.getText("i18n", "offlineStepContent_PortIsNotValidErrorMsg");
			}
		});
