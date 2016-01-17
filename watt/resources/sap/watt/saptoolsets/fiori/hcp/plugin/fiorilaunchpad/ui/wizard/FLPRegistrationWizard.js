define(function() {

	var that = null;
	var wizard = null;
	var oContext = null;
	var oProjectDocument = null;
	var sEntryPoint = null;
	var oAssignToStepContent = null;

	var _openWizardUI = function(context, projectDocument, entryPoint) {

		oProjectDocument = projectDocument;
		sEntryPoint = entryPoint;
		that = this;
		oContext = context;

		var oModel = new sap.ui.model.json.JSONModel();
		oModel.setData({});
		var oGit = oProjectDocument.getEntity().getBackendData().git;
		var oGeneralInfoStepService = context.service.generalinfostepservice;
		var oConfigureTileStepService = context.service.configuretilestepservice;
		var oAssignToStepService = context.service.assigntostepservice;
		var oHcpauthentication = oContext.service.hcpauthentication;
		var oHcpconnectivity = oContext.service.hcpconnectivity;
		
		Q.all([oHcpauthentication.authenticate(), oGeneralInfoStepService.getContent(), oConfigureTileStepService.getContent(),
			oAssignToStepService.getContent(),oHcpconnectivity.getHCPAccountByGitURL(oGit)]).spread(
			function(oUserCrad, oGeneralInfoStep, oConfigureTileStep, oAssignToStep, sAccount) {
				var oGeneralInfoStepContent = oGeneralInfoStep.getStepContent();
				var oConfigureTileStepContent = oConfigureTileStep.getStepContent();
				oAssignToStepContent = oAssignToStep.getStepContent();

				wizard = sap.ui.getCore().byId("RegisterInFLPWizard");

				if (wizard !== undefined) {
					wizard.destroy();
				}

				/*
				 * OnFinish
				 */
				var _fnFinishClicked = function() {

					// lite notification
					oContext.service.usernotification.liteInfo(oContext.i18n.getText("i18n", "FLPRegistrationWizard_RegistrationHasStarted"), false).done();

					var oWizardModel = that.flpWizard.getModel();
					return oContext.service.fiorilaunchpad.register(oWizardModel.getData(), oProjectDocument, oWizardModel.getData().provider.name).then(function(res) {
						//handle success or fail 
						if (res.status === true) {
							
							//get flp url
							var flpURL = oWizardModel.getData().flpUrl + "?siteId=" + oWizardModel.getData().selectedSite;
							//get registered app url
							var appUrl = flpURL + res.appUrl;
							
							//display success dialog
							oContext.service.fiorilaunchpad.notificationdialog.info(appUrl, flpURL).done();
							// lite notification
							oContext.service.usernotification.liteInfo(oContext.i18n.getText("i18n", "FLPRegistrationWizard_SuccessfulRegistration"), true).done();
							 // report when register succeed	
                            oContext.service.usagemonitoring.report("deployment", "register_to_flp", "registered").done();
						} else {
							// handle error dialog
							oContext.service.usernotification.alert(res.message).done();

							// lite notification
							oContext.service.usernotification.liteInfo(oContext.i18n.getText("i18n", "FLPRegistrationWizard_FailedRegistration"), true).done();
						}
					});
				};

				// Create wizard control
				var sTitle = oContext.i18n.getText("FLPRegistrationWizard_Title");
				var sDescription = "";
				var sSummary = oContext.i18n.getText("FLPRegistrationWizard_Summary", ["Title"]);

				var aSteps = [oGeneralInfoStep, oConfigureTileStep, oAssignToStep];

				oContext.service.wizard.createWizard("RegisterInFLPWizard", sTitle, sDescription, aSteps, sSummary, _fnFinishClicked).then(
					function(oWizard) {
						that.flpWizard = oWizard;
						//If user authentication exist, update the model  
						if (oUserCrad) {
							that.flpWizard.getModel().getData().email = oUserCrad.username;
							that.flpWizard.getModel().getData().password = oUserCrad.password;
						}
					 	
					 	that.flpWizard.getModel().getData().account = sAccount;
						that.flpWizard.getModel().getData().selectedProjectName = oProjectDocument.getEntity().getName();
						that.flpWizard.getModel().getData().oProjectDocument = oProjectDocument;
						that.flpWizard.getModel().getData().sEntryPoint = sEntryPoint;
						
						oGeneralInfoStepContent.setWizardControl(that.flpWizard);
						oConfigureTileStepContent.setWizardControl(that.flpWizard);
						oAssignToStepContent.setWizardControl(that.flpWizard);

						var onSummaryChange = function(oEvent) {
							var sId = oEvent.getParameter("id");
							if (sId === "Title") {
								var title = oEvent.getParameter("value");
								that.flpWizard.setSummary(oContext.i18n.getText("i18n", "FLPRegistrationWizard_Summary", [title]));
							}
						};

						oConfigureTileStepContent.attachValueChange(onSummaryChange, wizard);

						return that.flpWizard.open();
					}).done();
			}).fail(function(oError) {
				if (oError.message !== "Authentication_Cancel") {
					throw oError;
				}
		}).done();
	};

	return {
		openWizardUI: _openWizardUI
	};
});