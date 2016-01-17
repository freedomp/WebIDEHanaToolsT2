define([], function() {

	var oContext = null;
	var passwordTextField;
	var validationResult;
	var bRememberMe = true;
	var oErrorTextArea;

	var _authenticate = function() {
		
		/* eslint-disable no-use-before-define */

		oContext = this.context;
		sap.watt.includeCSS(require.toUrl("sap.watt.ideplatform.hcpconnectivity/css/Dialog.css"));
		sap.watt.includeCSS(require.toUrl("sap.watt.ideplatform.template/css/wizard.css"));
		sap.watt.includeCSS(require.toUrl("sap.watt.ideplatform.template/css/templateWizard.css"));

		return oContext.service.system.getSystemInfo().then(function(systemInfo) {
			return oContext.service.keystorage.get(systemInfo.sAccount, "HTTPS").then(function(oUserInfo) {
				if (oUserInfo) {
                    oUserInfo.account = systemInfo.sAccount;
                    oUserInfo.member = {};
                    oUserInfo.member = systemInfo.sUsername;
                    //workaround assuming only hcpconnectivity uses ajaxrequest service...
                    return oContext.service.ajaxrequest.isCSRFTokenValidForLastService().then(function(isCSRFValid) {
                        if(isCSRFValid) {
                            return oUserInfo;
                        } else {
                            //in this case we need to make a call for HCP API in order to initialize
                            //the CSRF token
                            return oContext.service.hcpconnectivity.getSubscriptions(systemInfo.sAccount).then(function() {
                                return oUserInfo;
                            });
                        }
                    });
				} else {
					var oDeferred = Q.defer();
					var dialog = new sap.ui.commons.Dialog({
						title: oContext.i18n.getText("i18n", "Authentication_LoginHeader"),
						resizable: false,
						width: "500px",
						modal: true,
						keepInWindow: true
					});

					var userInputUI = createUI(systemInfo);
					dialog.addContent(userInputUI);

					var okButton = new sap.ui.commons.Button({
						text: oContext.i18n.getText("i18n", "Authentication_Login"),
						enabled: false,
						press: function() {
						    dialog.setBusy(true);
							var password = validationResult.password;
							var username = validationResult.username;
							var bResetBackendSession = true; // add this header when performing "login" to HCP
							var resetHeaders = false;
							return oContext.service.hcpconnectivity.getSubscriptions(systemInfo.sAccount, username, password, bResetBackendSession, resetHeaders).then(function(/*list*/) {

                                var userDetails = {
									username: username,
									password: password,
									account: systemInfo.sAccount,
									member: systemInfo.sUsername
								};
								
								if (bRememberMe) {
									//Set to local storage close dialog
									oContext.service.keystorage.setHttps(systemInfo.sAccount, username, password).done();
								}
								
								dialog.setBusy(false);
								dialog.close();
								oDeferred.resolve(userDetails);

							}).fail(function(oError) {
							    dialog.setBusy(false);
							    if (oError.status === 401) {
							    	reportError(oContext.i18n.getText("i18n", "Authentication_Unauthorized"));
							    } else if (oError.status === 403) {
							    	reportError(oContext.i18n.getText("i18n", "Authentication_Forbidden"));
							    } else {
							    	reportError(oError.info);
							    }
							});
						}
					});

					dialog.addButton(okButton);
					dialog.setDefaultButton(okButton);
					dialog.setInitialFocus(passwordTextField);
					
					dialog.addButton(new sap.ui.commons.Button({
						text: oContext.i18n.getText("i18n", "Authentication_Cancel"),
						press: function() {
							dialog.close();
							oDeferred.reject("Authentication_Cancel");
						}
					}));

					userInputUI.attachEvent("validationResult", function(oEvent) {
						oErrorTextArea.setText("");
						validationResult = oEvent.mParameters.result;
						okButton.setEnabled(validationResult.isValid);
					});

					dialog.open();
					return oDeferred.promise;
				}
			});
		}).fail(function(e) {
			throw new Error(e);
		});

	};

	var reportError = function(error) {
		oErrorTextArea.removeStyleClass("label");
		oErrorTextArea.addStyleClass("errorText");
		oErrorTextArea.setText(error);
	};
	
	var createUI = function(systemInfo) {

		var landscapeDomain = null;
		bRememberMe = true;
		if (sap.watt.getEnv("server_type") === "hcproxy") {
			var orionLandscape = sap.watt.getEnv("orion_preview");
			var orionDomain = orionLandscape.split("/")[2];
			var parts = orionDomain.split(".");
			var offset = parts.length - 3;
			var domain = [];
			for (var i = 0; i < 3; i++) {
				domain.push(parts[offset + i]);
			}
			landscapeDomain = domain.join(".");
		} else {
			landscapeDomain = "neo.ondemand.com";
		}

		var accountValue = "";
		if (systemInfo) {
			accountValue = systemInfo.sAccount.toLowerCase();
		}

		var usernameValue = "";
		if (systemInfo && systemInfo.sEMail) {
		    // prefill the username field with the email if exists
			usernameValue = systemInfo.sEMail.toLowerCase();
		}

		// Account label
		var accountLabel = new sap.ui.commons.Label({
			text: oContext.i18n.getText("i18n", "Authentication_Account"),
			textAlign: "Left",
			required: true,
			layoutData: new sap.ui.layout.GridData({
				span: "L3 M3 S12"
			})
		}).addStyleClass("wizardBody");

		// Account text field
		var accountTextField = new sap.ui.commons.TextField({
			value: accountValue,
			width: "100%",
			enabled: false,
			tooltip: oContext.i18n.getText("i18n", "Authentication_AccountTooltip"),
			layoutData: new sap.ui.layout.GridData({
				span: "L6 M6 S12"
			}),
			liveChange: function(oEvent) {
				accountTextFieldChanged(oEvent);
			},
			accessibleRole: sap.ui.core.AccessibleRole.Textbox
		});

		var accountTextFieldChanged = function(oEvent) {
			var liveValue = oEvent.getParameter("liveValue");
			accountTextField.setValue(liveValue);

			handleFieldsValidation();
		};

		// Account Grid
		var accountContent = new sap.ui.layout.Grid({
			width: "100%",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			content: [accountLabel, accountTextField]
		});

		// Username label
		var usernameLabel = new sap.ui.commons.Label({
			required: true,
			text: oContext.i18n.getText("i18n", "Authentication_Username"),
			textAlign: "Left",
			layoutData: new sap.ui.layout.GridData({
				span: "L3 M3 S12"
			})
		}).addStyleClass("wizardBody");

		// Username text field
		var usernameTextField = new sap.ui.commons.TextField({
			value: usernameValue,
			width: "100%",
			enabled: true, // always enable this field so the user could change it if necessary (different IdPs)
			tooltip: oContext.i18n.getText("i18n", "Authentication_UsernameTooltip"),
			layoutData: new sap.ui.layout.GridData({
				span: "L6 M6 S12"
			}),
			liveChange: function(oEvent) {
				usernameTextFieldChanged(oEvent);
			},
			accessibleRole: sap.ui.core.AccessibleRole.Textbox
		});

		var usernameTextFieldChanged = function(oEvent) {
			var liveValue = oEvent.getParameter("liveValue");
			usernameTextField.setValue(liveValue);

			handleFieldsValidation();
		};

		// Username Grid
		var usernameContent = new sap.ui.layout.Grid({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			content: [usernameLabel, usernameTextField]
		});

		// Password label
		var passwordLabel = new sap.ui.commons.Label({
			required: true,
			text: oContext.i18n.getText("i18n", "Authentication_Password"),
			textAlign: "Left",
			layoutData: new sap.ui.layout.GridData({
				span: "L3 M3 S12"
			})
		}).addStyleClass("wizardBody");

		// Password text field
		passwordTextField = new sap.ui.commons.PasswordField({
			value: "",
			width: "100%",
			tooltip: oContext.i18n.getText("i18n", "Authentication_PasswordTooltip"),
			layoutData: new sap.ui.layout.GridData({
				span: "L6 M6 S12"
			}),
			liveChange: function(oEvent) {
				passwordTextFieldChanged(oEvent);
			},
			accessibleRole: sap.ui.core.AccessibleRole.Textbox
		});

		passwordTextField.focus();

		var passwordTextFieldChanged = function(oEvent) {
			var liveValue = oEvent.getParameter("liveValue");
			if (liveValue !== passwordTextField.getValue()) {
				passwordTextField.setValue(liveValue);
				handleFieldsValidation();
			}
		};

		// Password Grid
		var passwordContent = new sap.ui.layout.Grid({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			content: [passwordLabel, passwordTextField]
		});
		
		oErrorTextArea = new sap.ui.commons.TextView({
			width: "100%",
			text: "",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		}).addStyleClass("errorText");
		
		var oRememberCheckBox = new sap.ui.commons.CheckBox({
			text : oContext.i18n.getText("i18n", "Authentication_RememberMe"),
			tooltip : oContext.i18n.getText("i18n", "Authentication_RememberMeTooltip"),
			checked : true,
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			change : function() {
					bRememberMe = this.getChecked();
				}
			});

		var mainGrid = new sap.ui.layout.Grid({
			width: "100%",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			vSpacing: 0,
			content: [accountContent, usernameContent, passwordContent, oRememberCheckBox, oErrorTextArea]
		});

		var validateAccount = function(account) {
			var result = {};

			if (account.length === 0) {
				result.isValid = false;
				result.message = oContext.i18n.getText("i18n", "Authentication_EmptyAccountInfoMsg");
				result.severity = "info";
				return result;
			}

			result.isValid = true;

			return result;
		};

		var validateUsername = function(username) {
			var result = {};

			if (username.length === 0) {
				result.isValid = false;
				result.message = oContext.i18n.getText("i18n", "Authentication_EmptyUsernameInfoMsg");
				result.severity = "info";
				return result;
			}

			result.isValid = true;

			return result;
		};

		var validatePassword = function(password) {
			var result = {};

			if (password.length === 0) {
				result.isValid = false;
				result.message = oContext.i18n.getText("i18n", "Authentication_EmptyPasswordInfoMsg");
				result.severity = "info";
				return result;
			}

			result.isValid = true;

			return result;
		};

		var fireValidationResult = function(oValidationResult) {
			mainGrid.fireEvent("validationResult", {
				result: oValidationResult
			});
		};

		/*
		 * Handled the validation of the text fields
		 */
		var handleFieldsValidation = function() {

			var account = accountTextField.getValue().trim();
			var accountResult = validateAccount(account);

			if (accountResult.isValid === false) {
				// fire event with result and message
				fireValidationResult(accountResult);
				return;
			}

			var username = usernameTextField.getValue().trim();
			var usernameResult = validateUsername(username);

			if (usernameResult.isValid === false) {
				// fire event with result and message
				fireValidationResult(usernameResult);
				return;
			}

			var password = passwordTextField.getValue().trim();
			var passwordResult = validatePassword(password);

			if (passwordResult.isValid === false) {
				// fire event with result and message
				fireValidationResult(passwordResult);
				return;
			}

			// fire event with valid result
			var validResult = {};
			validResult.isValid = true;
			validResult.account = account;
			validResult.username = username;
			validResult.password = password;

			fireValidationResult(validResult);
		};

		return mainGrid;
	};

	/* eslint-enable no-use-before-define */

	return {
		authenticate: _authenticate
	};
});