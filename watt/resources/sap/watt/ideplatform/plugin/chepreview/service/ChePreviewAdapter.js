define([], function() {

	return {
		_cWebUrl: "web url",
		getPreviewUrl: function(oDocument) {
			var that = this;
			var sRunOption;
			var sProjectId;

			return oDocument.getProject().then(
				function(oProject) {

					//get project
					sProjectId = oProject.getEntity().getFullPath();
					// Call to DevX DI/Che server to GetProcesses API to get run processes for this project
					return that.context.service.runRegistry.getProcesses(oDocument).then(
						function(aProcesses) {
							return that._getRunOption(oDocument, aProcesses).then(
								function(oRunOption) {

									sRunOption = oRunOption.option;
									var oProcess = oRunOption.oProcess;

									if (sRunOption === "quit") {
										return that.context.service.log.error(sProjectId,
											that.context.i18n.getText("i18n", "rerun_new_case"), ["run"]);
									}

									var oReqBody;
									if (sRunOption === "stop&run") {
										// stop the current process and start a new one
										return that.context.service.runRegistry.stop(oProcess.processId, sProjectId).then(function(oResponse) {
											if (oResponse && oResponse.status === "STOPPED") {
												sRunOption = "run";
												//create request body json object for run or refresh request, based on run options
												oReqBody = that._getReqBody(oProcess, sRunOption);
												return that._runApplication(sRunOption, oDocument, oReqBody, sProjectId);
											}
										}).fail(function() {
											return that.context.service.log.error(sProjectId,
												that.context.i18n.getText("i18n", "stoprun_error_msg"), ["run"]);
										});
									} else {
										oReqBody = that._getReqBody(oProcess, sRunOption);
										return that._runApplication(sRunOption, oDocument, oReqBody, sProjectId);
									}

								});
						});
				});
		},

		_runApplication: function(sRunOption, oDocument, oReqBody, sProjectId) {
			var that = this;
			var oURI;
			var oStatusLink;

			//call to DevX DI/Che server to refresh API to get application URL
			//restart or softReset scenario
			if (sRunOption === "restart" || sRunOption === "softReset") {
				return that.context.service.runRegistry.refresh(oDocument, oReqBody).then(
					function(oStatusResponse) {
						if (oStatusResponse && oStatusResponse.links) {
							oStatusLink = oStatusResponse.links.filter(function(item) {
								return item.rel === that._cWebUrl;
							});
							oURI = URI(oStatusLink[0].href);
							return oURI;
						}
						return undefined;
					}).fail(function() {
						return that.context.service.log.error(sProjectId,
							that.context.i18n.getText("i18n", "application_url_error"), ["run"]);
				});
			}

			// Call to DevX DI/Che server to Run API to get application URL
			// New run scenario
			return that.context.service.runRegistry.run(oDocument, oReqBody).then(
				function(oStatusResponse) {
					if (oStatusResponse && oStatusResponse.links) {
						oStatusLink = oStatusResponse.links.filter(function(item) {
							return item.rel === that._cWebUrl;
						});
						oURI = URI(oStatusLink[0].href);
						return oURI;
					}
					return undefined;
				}).fail(function() {
					return that.context.service.log.error(sProjectId,
						that.context.i18n.getText("i18n", "application_url_error"), ["run"]);
			});
		},
		
		_getRunOption: function(oDocument, aProcesses) {
			var that = this;
			var sCurrentStatus;

			if (aProcesses && aProcesses.length > 0) {
				sCurrentStatus = aProcesses[0].status;
				switch (sCurrentStatus) {
					case "NEW":
						//process in status new exist, user should quit the process
						return Q({
							option: "quit",
							oProcess: undefined
						});

					case "RUNNING":
						//running process exist
						return that._isConfigurationFilesUpdated(oDocument, aProcesses[0]).then(function(bIsConfigurationFilesUpdated) {
							if (bIsConfigurationFilesUpdated) {
								return {
									option: "restart",
									oProcess: aProcesses[0]
								};
							} else {
								return {
									option: "softReset",
									oProcess: aProcesses[0]
								};
							}
						});

					case "FAILED":
						return Q({
							option: "stop&run",
							oProcess: aProcesses[0]
						});

					case "CANCELLED" || "STOPPED":
						return Q({
							option: "run",
							oProcess: undefined
						});

					default:
						return Q({
							option: "run",
							oProcess: undefined
						});
				}
			} else {
				//no process with ID exist
				return Q({
					option: "run",
					oProcess: undefined
				});
			}

		},

		//create run request body object
		_getReqBody: function(oProcess, runOption) {
			var oReqBody = {
				"environmentId": "system:/sapui5/default",
				"skipBuild": true
			};
			if (oProcess && runOption) {
				var oOptions = {};
				if (runOption === "restart" || runOption === "softReset") {
					oOptions = {
						"processId": oProcess.processId,
						"runOption": runOption
					};
				}
				oReqBody.options = oOptions;
			}
			return oReqBody;
		},
		
		/* checks if configuration files are updated - mta.yaml, package.json, xs-app.json */
		_isConfigurationFilesUpdated : function(oDocument, oProcess) {
			var that = this;

			//is mta.yaml exist and updated
			return that._isMTAupdated(oDocument, oProcess).then(function(bIsMTAUpdated) {
				if (bIsMTAUpdated) {
					return bIsMTAUpdated;
				} else {
					//is project.json or xs-app.json files exist and updated
					return that._isJsonConfigurationFileUpdated(oDocument, oProcess);

				}
			});
		},	
		
		/* checks if *.json configuration files are updated - package.json, xs-app.json */
		_isJsonConfigurationFileUpdated : function(oDocument, oProcess) {
			return oDocument.getProject().then(function(oProject) {
				// get project folder content - recursively  
				return oProject.getCurrentMetadata(true).then(function(aChildren) {
					if (aChildren && aChildren.length > 0) {
						for ( var int = 0; int < aChildren.length; int++) {
							var entry = aChildren[int];
							if (!entry.folder) {
								if ((entry.name === "package.json" || entry.name === "xs-app.json") && (entry.changedOn > oProcess.startTime)) {
									return true;
								}
							}
						}	
						return false;
					} else {
						return false;	
					}
				});
			});
		},		

		/* checks if mta.yaml file exist and updated */
		_isMTAupdated: function(oDocument, oProcess) {
			var isUpdated = false;
			var oDocProvider = this.context.service.filesystem.documentProvider;
			var sDocumentFullPath = oDocument.getEntity().getFullPath();
			var aProjectParts = sDocumentFullPath.split("/");
			var sProjectName = aProjectParts[1];
			var sMtaPath = "/" + sProjectName + "/mta.yaml";
			return oDocProvider.getDocument(sMtaPath).then(function(oMtaDoc) {
				if (oMtaDoc) {
					var oMtaChangedOn = oMtaDoc.getDocumentMetadata().changedOn;
					var oAppLastRun = oProcess.startTime;
					if (oMtaChangedOn > oAppLastRun) {
						return true;
					} else {
						return false;
					}
				} else {
					//mta.yaml document not found
					return isUpdated;
				}
			});

		}

	};
});