define(["sap/watt/common/plugin/platform/service/ui/AbstractPart"], function(AbstractPart) {
	"use strict";

	var RunConsole = AbstractPart.extend("sap.watt.ideplatform.plugin.runconsole.service.RunConsole", {
		// The current project selected in the repository browser
		_oCurrentDocument: null,
		// The view of the console
		_oView: null,
		// The targets our console supporting to log messages
		_aTargets: null,
		// Project types supported in Hana IDE (ui5, node.js, hana db)
		_aProjectTypes: null,
		// Constant url prefix
		_cWebUrl: "web url",

		/**
		 * Loads the configured properties from the json file.
		 * @param mConfig {configured properties}
		 */
		configure: function(mConfig) {
			var oController = this._oView.getController();
			if (mConfig) {
				var i;
				for (i = 0; i < mConfig.targets.length; i++) {
					var sTarget = mConfig.targets[i];
					this._aTargets[sTarget] = sTarget;
				}
				for (i = 0; i < mConfig.projectTypes.length; i++) {
					var sType = mConfig.projectTypes[i];
					this._aProjectTypes[sType] = sType;
				}
				this.context.service.resource.includeStyles(mConfig.styles).done();
				oController._sFormat = mConfig.format ? mConfig.format : "$MESSAGE";
				oController._iMaxLineCount = mConfig.maxLineCount ? mConfig.maxLineCount : 1000;
			}
		},

		/**
		 * Init the service and creating the view.
		 * */
		init: function() {
			this._aTargets = {};
			this._aProjectTypes = {};
			this._oView = sap.ui.view("RunConsole", {
				viewName: "sap.watt.ideplatform.plugin.runconsole.view.RunConsole",
				type: sap.ui.core.mvc.ViewType.JS,
				viewData: {
					context: this.context
				}
			});
			this.context.i18n.applyTo(this._oView);
		},

		/**
		 *
		 * @returns {the view of the console}
		 */
		getContent: function() {
			return this._oView;
		},

		/**
		 *
		 * @returns {*}
		 */
		getFocusElement: function() {
			//TODO Return input field if it is there
			return this.getContent();
		},

		/**
		 * Clears the console
		 * */
		clear: function() {
			this._oView.getController().clearConsole();
		},

		/**
		 * Listener to the log event.
		 * Checks if the log is written to supported target system (in our case - target "run").
		 * If the target is run, then it's add the message to the console by activate the method
		 * "addMessage" implemented inside the controller.
		 * @param {the event object}
		 */
		onLoggerEvent: function(oEvent) {
			var that = this;
			var sServerType = sap.watt.getEnv("server_type");
			if (sServerType === "xs2") {
				var sTarget = oEvent.params.target;
				var oLogService = oEvent.params.service;
				var oController = that._oView.getController();
				if (this._aTargets[sTarget]) {
					oLogService.getLastLogMessage(sTarget).then(function(oMessage) {
						if (oMessage && oMessage.tag) {
							return oController.addMessage(oMessage);
						}
					}).done();
				}
			}
		},

		/**
		 * Listener to the selection event.
		 * If the selection event happens in the repository browser and a new project is selected,
		 * it's activate the method "contextSwitch" implemented inside the controller.
		 * @param {the event object}
		 */
		onSelectionEvent: function(oEvent) {
			var that = this;
			var sServerType = sap.watt.getEnv("server_type");
			if (sServerType === "xs2") {
				var oController = that._oView.getController();
				that._getSelectedDocument().then(function(oSelectedDocument) {
					if (oSelectedDocument) {
						return that._getDocumentType(oSelectedDocument).then(function(sType) {
							if (sType && that._aProjectTypes[sType]) {
								var sSelectedProjectPath = oSelectedDocument.getEntity().getFullPath();
								var sCurrentDocumentPath = that._oCurrentDocument ? that._oCurrentDocument.getEntity().getFullPath() : null;
								if (!sCurrentDocumentPath || sCurrentDocumentPath !== sSelectedProjectPath) {
									that._oCurrentDocument = oSelectedDocument;
									return oController.contextSwitch(sSelectedProjectPath);
								}
							} else {
								that._oCurrentDocument = oSelectedDocument;
								return oController.contextSwitch(oController.NOT_RUNNABLE);
							}
						});
					}
				}).done();
			}
		},

		/**
		 * Listener to the deletion event.
		 * If the deleted document is the root folder of the selected project,
		 * it's activate the method "deleteModelEntity" implemented inside the controller.
		 * @param oEvent {the event object}
		 */
		onDeletedDocument: function(oEvent) {
			var that = this;
			var sServerType = sap.watt.getEnv("server_type");
			if (sServerType === "xs2") {
				var oDocument = oEvent.params.document;
				var oController = that._oView.getController();
				if (oDocument.getType() === "folder" && oDocument.isProject()) {
					that._getDocumentType(oDocument).then(function(sType) {
						if (sType && that._aProjectTypes[sType]) {
							var sDeletedProjectPath = oDocument.getEntity().getFullPath();
							return oController.deleteModelEntity(sDeletedProjectPath);
						}

					}).done();
				}
			}
		},

		/**
		 * Listener for the status change event of an application.
		 * Updating in accordance the relevant fields in the model.
		 * @param oEvent
		 */
		onRunStatusChange: function(oEvent) {
			var that = this;
			var oController = this._oView.getController();
			var sProcessId = null;			
			var sStatus = oEvent.params.sStatus;
			var sProjectPath = oEvent.params.sProject;
			if (sStatus === "RUNNING" || sStatus === "FAILED" || sStatus === "NEW") {
				sProcessId = oEvent.params.sProcessId;
			}
			if (sStatus === "RUNNING") {
				// Get the url of the app
				that._getApplicationUrl(sProcessId, sProjectPath).then(function(sUrl) {
					if (sUrl) {
						// Display the url on the UI
						return oController.updateApplicationMode(sProjectPath, sUrl, "url");
					}
				}).done();
			}
			else{
				//Don't display url in UI
				oController.updateApplicationMode(sProjectPath, "", "url");
			}			
			// Update processId field
			oController.updateApplicationMode(sProjectPath, sProcessId, "processId");
			// Update status field
			oController.updateApplicationMode(sProjectPath, sStatus, "status");
		},

		/**
		 * Stops the run of a running application by activating a proper method from the backend.
		 * @param sProcessId
		 * @param sProjectId
		 * @returns {void|*}
		 */
		stopRun: function(sProcessId, sProjectId) {
			var that = this;
			return this.context.service.runRegistry.stop(sProcessId, sProjectId).then(function(oResponse) {
				if (oResponse && oResponse.status === "STOPPED") {
					return true;
				}
				that._logAndThrowError(that.context.i18n.getText("i18n", "stoprun_error_msg"), sProjectId);				
			}).fail(function() {
				that.context.service.log.error(sProjectId, that.context.i18n.getText("i18n", "stoprun_error_msg"),[ "run" ]).done();	
				return false;
			});
		},
		
		getInitialStatus: function(sProjectPath){
			var oStatus = {};
			var oProcess;
			//get status and app url and update status object
			var that = this;
			return this.context.service.filesystem.documentProvider.getDocument(sProjectPath).then(function(oProjectDocument) {
				return that.context.service.runRegistry.getProcesses(oProjectDocument).then(function(aProcesses) {
					//get process with highest processID
					if(aProcesses && aProcesses.length > 0){
						oProcess = aProcesses[0];
						oStatus.status = oProcess.status;
						if(oStatus.status === "RUNNING"){
							oStatus.url = that._getUrl(oProcess);
							oStatus.sProcessId = oProcess.processId;
						}
					}
					return oStatus;
				});
			});
		},
		
		
		_logAndThrowError: function(sError, sProjectId){
			this.context.service.log.error(sProjectId, sError,[ "run" ]).done();
			throw new Error(sError);
		},
		
		/**
		 * @returns {the selected document in the repository browser}
		 * @private
		 */
		_getSelectedDocument: function() {
			var oSelectionService = this.context.service.selection;
			var oRepoBrowserService = this.context.service.repositorybrowser;
			return oSelectionService.isOwner(oRepoBrowserService).then(function(isOwner) {
				if (isOwner) {
					return oSelectionService.isEmpty().then(function(isEmpty) {
						if (!isEmpty) {
							return oSelectionService.getSelection().then(function(aSelection) {
								var oDocument = aSelection[0].document;
								return oDocument.getProject().then(function(oProject) {
									return oProject;
								});
							});
						}
					});
				}
			});
		},

		/**
		 * Get application url based on application process id
		 * @param sProcessId
		 * @param sProjectPath
		 * @returns {void|*}
		 * @private
		 */
		_getApplicationUrl: function(sProcessId, sProjectPath) {
			var that = this;
			return this.context.service.filesystem.documentProvider.getDocument(sProjectPath).then(function(oProjectDocument) {
				return that.context.service.runRegistry.getProcesses(oProjectDocument).then(function(aProcesses) {
					var aRunProcesses = aProcesses.filter(function(item) {
						return item.processId === sProcessId;
					});
					if (aRunProcesses && aRunProcesses.length > 0) {
						var oRunningProcess = aRunProcesses[0];						
						return that._getUrl(oRunningProcess);
					}
					return undefined;
				});
			}).fail(function() {
				return undefined;
			});
		},
		
		_getUrl: function(oProcess){
			var that = this;
			var aUrlLink = oProcess.links.filter(function(item) {
				return item.rel === that._cWebUrl;
			});
			if (aUrlLink && aUrlLink.length > 0) {				
				return aUrlLink[0].href;
			}			
		},

		/**
		 * Returns the type of a project in case that such one exists.
		 * @param oDocument
		 * @private
		 */
		_getDocumentType: function(oDocument) {
			if (typeof oDocument === "object" && oDocument.isProject()) {
				var oProjectMetadata = oDocument.getProjectMetadata();
				if (oProjectMetadata) {
					return Q(oProjectMetadata.type);
				}
			}
			return Q(undefined);
		}
	});

	return RunConsole;
});