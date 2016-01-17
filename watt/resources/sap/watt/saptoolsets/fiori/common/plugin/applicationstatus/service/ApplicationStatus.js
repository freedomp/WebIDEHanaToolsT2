define([], function() {
	
	/* eslint-disable no-use-before-define */
	
	var ApplicationStatus = function() {
		
		this.openDialog = function(oSelection) {
			var that = this;
			var bIsLocal = false;

			// check for local environment
			var sServerType = sap.watt.getEnv("server_type");
			if (sServerType === "java" || sServerType === "local_hcproxy") {
				bIsLocal = true;
			}
			
			// init some parameters in deployment service
			return that.context.service.deployment.initializeParams(oSelection).then(function(oAction) {
				// create the ApplicationStatus JS view
				that.createApplicationStatusView();

				if (bIsLocal) { // if local environment, no need to check for Git settings
					// open the dialog
					return that._oStatusView.getController().open(oAction, oSelection, bIsLocal);
				}

				// check Git settings:
				// the "fail" block is before the "then" so that if the dialog opening fails we won't present the error of missing Git settings
				return that.context.service.gitdispatcher.verifyUserInfo(oAction.entity).fail(function(oError) {
					if (oError.status === 503) { // git service is unavailable
						that.context.service.usernotification.warning(oError.name + ". " + oError.detailedMessage).done();	
					} else {
						// Git settings are missing - present a warning to the user
						that.context.service.usernotification.warning(that.context.i18n.getText("i18n", "MissingGitSettings")).done();
					}
				}).then(function() {
					// open the dialog
					return that._oStatusView.getController().open(oAction, oSelection, bIsLocal);
				});
			});
		};
		
		this.createApplicationStatusView = function() {
			var oContext = this.context;
			if (!this._oStatusView) {
				this._oStatusView = sap.ui.view({
					viewName: "sap.watt.saptoolsets.fiori.common.plugin.applicationstatus.view.ApplicationStatusDialog",
					type: sap.ui.core.mvc.ViewType.JS,
					viewData: {
						context: oContext
					}
				});
			}
		};
		
		/* 
		 * Get the project document from workspace and use it to verify against the backend if the app
		 * is indeed deployed or not.
		 * If deployed - returns an object with the deployed application's details - name and package.
		 * If not deployed - returns undefined.
		 */
		this.getABAPDeploymentInfo = function(oProjectDocument) {
			return this.context.service.abaprepository.getDeploymentInfo(oProjectDocument);
		};
	};
	
	/* eslint-enable no-use-before-define */
	
	return ApplicationStatus;
});
