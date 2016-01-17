define([], function() {

	var oContext = null;
	var dialog = null;
	var oErrorTextArea = null;
	var oExtProjectNameTextField = null;
	var oDeferred = null;

	var _open = function(onOKfnunction, preFilledInfo, enableEditingProjectName) {
		enableEditingProjectName = typeof enableEditingProjectName === "undefined" ? true : enableEditingProjectName;
        oDeferred = Q.defer();
		sap.watt.includeCSS(require.toUrl("sap.watt.saptoolsets.fiori.common.fioriexternalcommands/ui/css/Dialog.css"));
		sap.watt.includeCSS(require.toUrl("sap.watt.saptoolsets.fiori.common.fioriexternalcommands/ui/css/wizard.css"));
		sap.watt.includeCSS(require.toUrl("sap.watt.saptoolsets.fiori.common.fioriexternalcommands/ui/css/templateWizard.css"));

		oContext.service.hcpauthentication.authenticate().then(function(oUserCrad) {

			dialog = new sap.ui.commons.Dialog({
				title: oContext.i18n.getText("i18n", "ExternalCommand_dialog_title"),
				resizable: false,
				width: "40%",
				modal: true,
				keepInWindow: true
			});

			var oExtProjectNameLabel = new sap.ui.commons.Label({
				text: oContext.i18n.getText("i18n", "ExternalCommand_ext_project_name"),
				textAlign: "Left",
				required: true,
				layoutData: new sap.ui.layout.GridData({
					span: "L4 M4 S12"
				})
			}).addStyleClass("wizardBody");

			oExtProjectNameTextField = new sap.ui.commons.TextField({
				value: preFilledInfo.projectname,
				editable: enableEditingProjectName,
				width: "100%",
				layoutData: new sap.ui.layout.GridData({
					span: "L8 M8 S12"
				}),
				liveChange: function(oEvent) {
					extProjectNameTextFieldChanged(oEvent);
				},
				accessibleRole: sap.ui.core.AccessibleRole.Textbox
			});

			var extProjectNameTextFieldChanged = function(oEvent) {
				var value = oEvent.getParameter("liveValue");
				if (value.length === 0) {
					// disable the OK 
					dialog.getButtons()[0].setEnabled(false);
					reportError(oContext.i18n.getText("i18n", "ExternalCommand_provide_projectName"));
				} else {
					validateProjectName(value).then(function(projectNameValidation){
						if (projectNameValidation.isValid) {
							dialog.getButtons()[0].setEnabled(true);
							reportInfo("");
						} else {
						    dialog.getButtons()[0].setEnabled(false);
							var message = oContext.i18n.getText("i18n", projectNameValidation.error);
							reportError(message ? message : "");
						}
					}).fail(function(oError){
						reportError(oError);
					}).done();

				}
			};

			var oExtProjectNameContent = new sap.ui.layout.Grid({
				width: "100%",
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12",
					linebreak: true
				}),
				content: [oExtProjectNameLabel, oExtProjectNameTextField]
			});
			
			var importParentProjectCheckBox = new sap.ui.commons.CheckBox({
			    text: oContext.i18n.getText("i18n", "ExternalCommand_ImportParentCheckbox")
		    });

			//authenticationContainer.addContent(oExtProjectNameContent);

			oErrorTextArea = new sap.ui.commons.TextView({
				width: "100%",
				text: "",
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				})
			}).addStyleClass("errorText");

			dialog.addContent(oExtProjectNameContent);
			dialog.addContent(importParentProjectCheckBox);
			dialog.addContent(oErrorTextArea);

			dialog.addButton(new sap.ui.commons.Button({
				text: oContext.i18n.getText("i18n", "OK"),
				enabled: true,
				press: function() {
					dialog.close();
					var account = oUserCrad.account;
					var username = oUserCrad.username;
					var password = oUserCrad.password;
					var extProjectName = oExtProjectNameTextField.getValue().trim();
					var isImport = importParentProjectCheckBox.getChecked();
					onOKfnunction(username, password, account, extProjectName, isImport).then(function() {
					    // Only after the creation of the project, resolve the promise
					    return oDeferred.resolve(true);
					}).done();
				}
			}));

			dialog.addButton(new sap.ui.commons.Button({
				text: oContext.i18n.getText("i18n", "Cancel"),
				press: function() {
					dialog.close();
					// If the user cancels we abort the flow
					oDeferred.reject();
				}
			}));

			dialog.open();
        
		}).fail(function(oError) {
			if (oError.message !== "Authentication_Cancel") {
			    oDeferred.reject(oError);
				throw new Error(oError.message);
			}
		}).done();
        return oDeferred.promise;
	};

	//TODO: This function is copied from ProjectNameStep.js it should be removed once the name validation is exposed as a service
	var validateProjectName = function(sName) {
		//Corresponds to allowed characters for UI5 Repositories (which are also valid UI5 namespaces):
		//Last character must not be a "."
		//First character must be a letter or _
		//After . must come a letter or _
		
		return oContext.service.filesystem.documentProvider.getRoot().then(function(rootDocument) {
			return rootDocument.getCurrentMetadata().then(function(oRootContent) {
				var validation = {};
		
				var sLastChar = sName.charAt(sName.length - 1);
				if (sLastChar === ".") {
					validation.error = "ExternalCommand_invalidProjectNameContent";
					validation.isValid = false;
					return validation;
				} else {
					var aParts = sName.split(".");
					var rAllowedPartNames = /^[a-zA-Z_]+[a-zA-Z0-9_]*$/;
					for (var i = 0; i < aParts.length; i++) {
						if (!rAllowedPartNames.test(aParts[i])) {
							//regex returns null in case of no match
							validation.error = "ExternalCommand_invalidProjectNameContent";
							validation.isValid = false;
							return validation;
						}
					}
					//now - check that the project does not exist
					var contentLength = oRootContent.length;
					while (contentLength--) {
						if (oRootContent[contentLength].name.toLowerCase() === sName.toLowerCase()) {
							// project exist
							validation.error = "ExternalCommand_projectexistsmsg";
							validation.isValid = false;
							return validation;
						}
					}
					validation.isValid = true;
					return validation;
						
				}
			});
		});
	};

	var reportInfo = function(msg) {
		oErrorTextArea.removeStyleClass("errorText");
		oErrorTextArea.addStyleClass("label");
		oErrorTextArea.setText(msg);
	};

	var reportError = function(error) {
		oErrorTextArea.removeStyleClass("label");
		oErrorTextArea.addStyleClass("errorText");
		oErrorTextArea.setText(error);
	};

	var _setContext = function(context) {
		oContext = context;
	};

	return {
		open: _open,
		setContext: _setContext,
		validateProjectName: validateProjectName
	};
});