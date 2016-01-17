define([ "./GenericRemoteDialog" ], function(GenericRemoteDialog) {
    
    /* eslint-disable no-use-before-define */
    
    var oErrorTextArea; 
    
	var _openRemoteDialog = function(context, parentProjectStepContent) {

        // TextView for an error text
		oErrorTextArea = new sap.ui.commons.TextView({
			width : "100%",
			text : "",
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12"
			})
		}).addStyleClass("errorText");
		
		var reportError = function(error) {
    		oErrorTextArea.removeStyleClass("label");
    		oErrorTextArea.addStyleClass("errorText");
    		oErrorTextArea.setText(error);
    	};

		GenericRemoteDialog.createRemoteDialog(context, this, false);
		GenericRemoteDialog.getDialog().insertContent(oErrorTextArea, 1);
		
		GenericRemoteDialog.onOKPressed(function() {
			var selectedTitle = GenericRemoteDialog.getSelectedTitle();
			if (selectedTitle === null) {
				GenericRemoteDialog.getDialog().close();
			} else {
				//don't remove first "/" from path if it is part of namespace
				if ((selectedTitle.substr(0, 1) === "/") && (selectedTitle.lastIndexOf("/") === 0)) {
					selectedTitle = GenericRemoteDialog.getSelectedTitle().substring(1, GenericRemoteDialog.getSelectedTitle().length);
				}

				var destination = GenericRemoteDialog.getSelectedDestination();
				var system = {};
				system.name = destination.name;
				system.proxyUrlPrefix = destination.proxyUrlPrefix;
				system.sapClient = destination.sapClient;

				parentProjectStepContent.setProjectValidation(GenericRemoteDialog.projectValidation());
				parentProjectStepContent.setSelectedParentProjectPath(selectedTitle, false, "abaprep", system);
				GenericRemoteDialog.getDialog().close();
				//	start the progress bar
				if (parentProjectStepContent.fireProcessingStarted) {
					parentProjectStepContent.fireProcessingStarted();
				}
			}
		});

		GenericRemoteDialog.getDialog().open();
		GenericRemoteDialog.onProcessingStarted();
		
		GenericRemoteDialog.getDialog().attachEvent("reportError", function(oEvent) {
	        var errorMsg = oEvent.mParameters.result;
	        reportError(errorMsg);
	    });
	    
	    GenericRemoteDialog.getDialog().attachEvent("reportInfo", function(oEvent) {
	        var infoMsg = oEvent.mParameters.result;
	        reportInfo(infoMsg);
	    });
	};
	
	var reportInfo = function(msg) {
		oErrorTextArea.removeStyleClass("errorText");
		oErrorTextArea.addStyleClass("label");
		oErrorTextArea.setText(msg);
	};

	var _updateStatus = function() {
		reportInfo("");
	};

	return {
		updateStatus : _updateStatus,
		openRemoteDialog : _openRemoteDialog
	};
	
	/* eslint-enable no-use-before-define */
});