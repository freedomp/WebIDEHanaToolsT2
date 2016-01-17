define({
	validatePath : function(sPath, oDocument, aValidationRules) {
		var that = this;
		var oValid = {
			"isValid" : true,
			"message" : ""
		};
		// check if the path is empty   
		if (!sPath || /^\s*$/.test(sPath)) {
			oValid.isValid = false;
			oValid.message = that.context.i18n.getText("msg_file_path_empty");
			return Q(oValid);
		} else {
			oValid.isValid = true;
		}

		if (oValid.isValid) {
			return oDocument.getProject().then(function(oProject) {
				// check that the typed file exists
				return that.context.service.filesystem.documentProvider.getDocument(sPath).then(function(oPathDocument) {
					var projName = oProject.getEntity().getName();
					var aFileParts = sPath.split("/");
					var aProjectParts = aFileParts.filter(function(item) {
						return item === projName;
					});
					if (oPathDocument) {
						// check that the file is from the same project as the selected document
						if (aProjectParts.length > 0) {
							// check if the path is resulting of some regex rule
							return that._checkPathWithRegexRule(aValidationRules, sPath);
						} else {
							// the typed file is not from the same project as the selected document 
							oValid.isValid = false;
							oValid.message = that.context.i18n.getText("msg_file_path_doc");
							return oValid;
						}
					} else {
						if (aProjectParts.length === 0) {
							// propably typed the path without project name  
							sPath = "/" + projName + sPath;
							return that.context.service.filesystem.documentProvider.getDocument(sPath).then(function(oNewPathDocument) {
								if (oNewPathDocument) {
									// check if the path is resulting of some regex rule
									return that._checkPathWithRegexRule(aValidationRules, sPath);
								} else {
									// the typed file does not exist
									oValid.isValid = false;
									oValid.message = that.context.i18n.getText("msg_file_path_not_exist");
									return oValid;
								}
							});
						} else {
							// the typed file does not exist
							oValid.isValid = false;
							oValid.message = that.context.i18n.getText("msg_file_path_not_exist");
							return oValid;
						}
					}
				}).fail(function() {
					oValid.isValid = false;
					oValid.message = that.context.i18n.getText("msg_file_path_not_exist");
					return oValid;
				});
			});
		} else {
			return Q(oValid);
		}
	},

	validateUrlParameter : function(sValue) {
		var oValid = {
			"isValid" : true,
			"message" : ""
		};
		// check that the parameter name is not empty
		if (!sValue || /^\s*$/.test(sValue)) {
			// the parameter name field is empty 
			oValid.isValid = false;
			oValid.message = this.context.i18n.getText("msg_appl_param_empty");
			return oValid;
		} else {
			oValid.isValid = true;
			return oValid;
		}
	},

	isConfigurationValid : function(oConfiguration, oDocument, aValidationRules) {
		if (oConfiguration && oConfiguration.filePath) {
			return this.validatePath(oConfiguration.filePath, oDocument, aValidationRules).then(
					function(sValid) {
						if (sValid.isValid) {
							// check URL parameter
							var bValid = true;
							if (oConfiguration.urlParameters) {
								for ( var i = 0; i < oConfiguration.urlParameters.length; i++) {
									var urlParameterEntry = oConfiguration.urlParameters[i];
									if (/^\s*$/.test(urlParameterEntry.paramName) && !(/^\s*$/.test(urlParameterEntry.paramValue))
											&& urlParameterEntry.paramActive) {
										bValid = false;
										break;
									}
								}
							}

							return bValid;
						}
						return false;
					});
		}
		// Path file is not valid
		return false;
	},

	_checkPathWithRegexRule : function(aValidationRules, sPath) {
		// check if the path is resulting of some regex rule
		var that = this;
		var oValid = {
			"isValid" : true,
			"message" : ""
		};

		for ( var i = 0; i < aValidationRules.length; i++) {
			var sRule = aValidationRules[i];
			if (sRule.isRegex) {
				if (new RegExp(sRule.rule, "i").test(sPath)) {
					oValid.isValid = true;
					break;
				} else {
					oValid.isValid = false;
					oValid.message = that.context.i18n.getText("msg_file_path_type");
				}
			} else {
				if (jQuery.sap.endsWith(sPath, sRule.rule)) {
					oValid.isValid = true;
					break;
				} else {
					oValid.isValid = false;
					oValid.message = that.context.i18n.getText("msg_file_path_type");
				}
			}
		}
		return oValid;
	}

});