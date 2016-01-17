sap.ui.core.mvc.Controller.extend("sap.watt.ideplatform.plugin.gitclient.view.GitBase", {
	_oContext: undefined,
	_oMenuGroup: undefined,

	markAsValid: function(oControl) {
		oControl.removeStyleClass("inputError");
		oControl.addStyleClass("inputConfirmed");

		var $This = jQuery("#" + oControl.getId());

		$This.animate({
			opacity: "1"
		}, 2000, function() {
			oControl.removeStyleClass("inputConfirmed");
		});
	},

	markAsInvalid: function(oControl) {
		oControl.removeStyleClass("inputConfirmed");
		oControl.addStyleClass("inputError");
		oControl.rerender();
	},

	//This method creates a string that look like /<repository name>/ ... /<file name>
	calculateShortFileFoldername: function(sFileFolderName) {
		var aUrlParts = sFileFolderName.split("/");
		if (aUrlParts && aUrlParts.length > 2) {
                sFileFolderName = aUrlParts[0] ? aUrlParts[0] + "/" + " ... " + "/" : aUrlParts[1] + "/" + " ... " + "/";
			switch (aUrlParts.length) {
				case 3:
					sFileFolderName += aUrlParts[aUrlParts.length - 1];
					break;
				case 4:
					sFileFolderName += aUrlParts[aUrlParts.length - 2] + "/" + aUrlParts[aUrlParts.length - 1];
					break;
				default:
					sFileFolderName += aUrlParts[aUrlParts.length - 3] + "/" + aUrlParts[aUrlParts.length - 2] +
						"/" + aUrlParts[aUrlParts.length - 1];
			}
		}
		return sFileFolderName;
	},

	clearValidationMarks: function(oControl) {
		oControl.removeStyleClass("inputConfirmed");
		oControl.removeStyleClass("inputError");
	},

	callMessageDialog: function(oError) {
		if (!oError.source || oError.source !== "git") {
			throw oError;
		}
		var sDetailedMessage = oError.detailedMessage ? "\n\n" + oError.detailedMessage : "";
		switch (oError.type) {
			case "Warning":
				this._oContext.service.usernotification.warning(oError.name + sDetailedMessage).done();
				break;
			case "Info":
				this._oContext.service.usernotification.info(oError.name + sDetailedMessage).done();
				break;
			default:
				//ERROR
				this._oContext.service.usernotification.alert(oError.name + sDetailedMessage).done();
		}
	},

	callConfirmationDialog: function(sText) {
		if (sText) {
			return this._oContext.service.usernotification.confirm(sText).then(function(oResult) {
				return oResult.bResult;
			});
		}
		return Q();
	},

	getPrivateKeyFromFileInput: function(oFile) {
		//Check for browser support
		var that = this;
		var deferred = Q.defer();
		if (!!(window.File) && !!(window.FileReader)) {
			var reader = new FileReader();
			reader.onload = function(oEvent) {
				deferred.resolve(reader.result);
			};
			//Handle error in reading private key from file
			reader.onerror = function(oEvent) {
				deferred.reject(new Error(that._i18n.getText("i18n", "gITAuthenticationDialog_file_read_error")));
			};
			reader.readAsText(oFile);
		}
		return deferred.promise;
	}

});