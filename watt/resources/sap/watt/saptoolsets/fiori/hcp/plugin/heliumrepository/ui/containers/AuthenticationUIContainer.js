define(function() {

	var oContext = null;
	var passwordTextField;

	var _create = function() {
        oContext = this.context;
		sap.watt.includeCSS(require.toUrl("sap.watt.saptoolsets.fiori.hcp.heliumrepository/ui/css/Dialog.css"));
		sap.watt.includeCSS(require.toUrl("sap.watt.ideplatform.template/css/wizard.css"));
		sap.watt.includeCSS(require.toUrl("sap.watt.ideplatform.template/css/templateWizard.css"));

        return oContext.service.system.getSystemInfo().then(function(systemInfo) {
			return createUI(systemInfo);
	    }).fail(function() {
	        return createUI();
	    });
	};
	
	var createUI = function(systemInfo) {
	    
	    var landscapeDomain = null;
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

		var usernameValue = systemInfo ? systemInfo.sEMail.toLowerCase() : "";
	    
	    // Account label
		var accountLabel = new sap.ui.commons.Label({
			text : oContext.i18n.getText("i18n", "AuthenticationUIContainer_Account"),
			textAlign : "Left",
			required : true,
			layoutData : new sap.ui.layout.GridData({
				span : "L3 M3 S12"
			})
		}).addStyleClass("wizardBody");

		// Account text field
		var accountTextField = new sap.ui.commons.TextField({
			value : accountValue,
			width : "100%",
			enabled: false,
			tooltip : oContext.i18n.getText("i18n", "AuthenticationUIContainer_AccountTooltip"),
			layoutData : new sap.ui.layout.GridData({
				span : "L8 M8 S12"
			}),
			liveChange : function(oEvent) {
			    accountTextFieldChanged(oEvent);
			},
			accessibleRole : sap.ui.core.AccessibleRole.Textbox
		});
		
		var accountTextFieldChanged = function(oEvent) {
		    var liveValue = oEvent.getParameter("liveValue");
			accountTextField.setValue(liveValue);
			
			handleFieldsValidation();
		};

		// Account Grid
		var accountContent = new sap.ui.layout.Grid({
			width : "100%",
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12",
				linebreak : true
			}),
			content : [ accountLabel, accountTextField ]
		});

		// Username label
		var usernameLabel = new sap.ui.commons.Label({
			required : true,
			text : oContext.i18n.getText("i18n", "AuthenticationUIContainer_Username"),
			textAlign : "Left",
			layoutData : new sap.ui.layout.GridData({
				span : "L3 M3 S12"
			})
		}).addStyleClass("wizardBody");

		// Username text field
		var usernameTextField = new sap.ui.commons.TextField({
			value : usernameValue,
			width : "100%",
			enabled: false,
			tooltip : oContext.i18n.getText("i18n", "AuthenticationUIContainer_UsernameTooltip"),
			layoutData : new sap.ui.layout.GridData({
				span : "L8 M8 S12"
			}),
			liveChange : function(oEvent) {
				usernameTextFieldChanged(oEvent);
			},
			accessibleRole : sap.ui.core.AccessibleRole.Textbox
		});
		
		var usernameTextFieldChanged = function(oEvent) {
		    var liveValue = oEvent.getParameter("liveValue");
			usernameTextField.setValue(liveValue);
			
			handleFieldsValidation();
		};

		// Username Grid
		var usernameContent = new sap.ui.layout.Grid({
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12",
				linebreak : true
			}),
			content : [ usernameLabel, usernameTextField ]
		});

		// Password label
		var passwordLabel = new sap.ui.commons.Label({
			required : true,
			text : oContext.i18n.getText("i18n", "AuthenticationUIContainer_Password"),
			textAlign : "Left",
			layoutData : new sap.ui.layout.GridData({
				span : "L3 M3 S12"
			})
		}).addStyleClass("wizardBody");

		// Password text field
		passwordTextField = new sap.ui.commons.PasswordField({
			value : "",
			width : "100%",
			tooltip : oContext.i18n.getText("i18n", "AuthenticationUIContainer_PasswordTooltip"),
			layoutData : new sap.ui.layout.GridData({
				span : "L8 M8 S12"
			}),
			liveChange : function(oEvent) {
				passwordTextFieldChanged(oEvent);
			},
			accessibleRole : sap.ui.core.AccessibleRole.Textbox
		});
		
		var passwordTextFieldChanged = function(oEvent) {
		    var liveValue = oEvent.getParameter("liveValue");
			if(liveValue !== passwordTextField.getValue()) {
			    passwordTextField.setValue(liveValue);
			    handleFieldsValidation();
			}
		};

		// Password Grid
		var passwordContent = new sap.ui.layout.Grid({
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12",
				linebreak : true
			}),
			content : [ passwordLabel, passwordTextField ]
		});

		var mainGrid = new sap.ui.layout.Grid({
			width : "100%",
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12",
				linebreak : true
			}),
			vSpacing : 0,
			content : [ accountContent, usernameContent, passwordContent ]
		});
		
		var validateAccount = function(account) {
    		var result = {};
    
    		if (account.length === 0) {
    			result.isValid = false;
    			result.message = oContext.i18n.getText("i18n", "AuthenticationUIContainer_EmptyAccountInfoMsg");
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
    			result.message = oContext.i18n.getText("i18n", "AuthenticationUIContainer_EmptyUsernameInfoMsg");
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
    			result.message = oContext.i18n.getText("i18n", "AuthenticationUIContainer_EmptyPasswordInfoMsg");
    			result.severity = "info";
    			return result;
    		}
    
    		result.isValid = true;
    
    		return result;
    	};
		
		var fireValidationResult = function(validationResult) {
		    mainGrid.fireEvent("validationResult", {
				result : validationResult
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
	
	var _clearPassword = function() {
	    passwordTextField.setValue("");
	};

	return {
		create : _create,
		clearPassword : _clearPassword
	};
});