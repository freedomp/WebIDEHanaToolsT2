define({
	execute: function(sParam) {
		var appName = sParam.parentProjectName;
		var createEvenIfExists = sParam.createEvenIfExists === true;
		var dontOpenExtPane = sParam.openExtPane === false;
		var that = this;
		var taskId = null;
		
		if(!appName) {
			//If there is no application name we don't want to start the flow... This error is only logged to the browser's console and therefore not externalized.
			throw new Error("No application name supplied.");
		}

		var importParent = function(appInfo) {
			return that.context.service.extensionproject.createFolderName(appName).then(function(projectName) {
				return that.context.service.filesystem.documentProvider.getRoot().then(function(oRoot) {
					return oRoot.createFolder(projectName).then(function(destinationDocument) {
						return that.context.service.heliumparentproject.import(appName, appInfo, destinationDocument);
					});
				});
			});
		};

		var createExtProjectAndStop = function(extProjectName, appInfo) {
			return that.context.service.heliumextensionproject.create(extProjectName, appInfo).then(function() {
				that.context.service.log.info(that.context.i18n.getText("i18n", "ExtHeliumCommand_title"),
					that.context.i18n.getText("i18n", "ExtHeliumCommand_project_generated", [extProjectName]), ["user"]).done();
				that.context.service.usernotification.liteInfo(
					that.context.i18n.getText("i18n", "ExtHeliumCommand_project_generated", [extProjectName])).done();
				// report when extend succeed	
				that.context.service.usagemonitoring.report("externalcommands", "invoke", "extend").done();

				that.context.service.progress.stopTask(taskId).done();
			});
		};

		var extendproject = function(username, password, account, extProjectName, isImport) {
			// MK: provide the username so we would use it in this call to get the subscriptions.
			// this is in order to support cases where the username comes from a different IDP (i.e. SuccessFactors)
			return that.context.service.hcpconnectivity.getSubscriptions(account, username, password, true).then(function(subs) {
				var appInfo = {};
				for (var i = 0; i < subs.length; i++) {
					if (subs[i].name === sParam.parentProjectName) {
						appInfo = subs[i];
						break;
					}
				}
				appInfo.account = account;
				appInfo.application = appInfo.name;

				if (!appInfo.application) {
					//The application is not subscribed - look for it's info 
					return that.context.service.progress.startTask().then(function(sGeneratedTaskId) {
						taskId = sGeneratedTaskId;
						return that.context.service.hcpconnectivity.getAppInfo(account, username, password, appName).then(function(appInfo) {
							appInfo.account = account;
							appInfo.application = appInfo.name;
							appInfo.type = "application";

							if (isImport === true) {
								return importParent(appInfo).then(function() {
									return createExtProjectAndStop(extProjectName, appInfo);
								});
							}
							return createExtProjectAndStop(extProjectName, appInfo);
						});
					}).fail(function(error) {
						var message = error.message;
						if (error.info) {
							message = error.info;
						}
						that.context.service.log.error(that.context.i18n.getText("i18n", "ExtHeliumCommand_title"), message, ["user"]).done();
						that.context.service.usernotification.alert(message).done();
						that.context.service.progress.stopTask(taskId).done();
					});
				}
				return that.context.service.progress.startTask().then(function(sGeneratedTaskId) {
					taskId = sGeneratedTaskId;
					appInfo.type = "subscription";

					if (isImport === true) {
						return importParent(appInfo).then(function() {
							return createExtProjectAndStop(extProjectName, appInfo);
						});
					}
					return createExtProjectAndStop(extProjectName, appInfo);
				});
			}).fail(function(error) {
				if (error) {
					var message = error.message;
					if (error.info) {
						message = error.info;
					}
				} else {
					message = that.context.i18n.getText("i18n", "ExtHeliumCommand_error");
				}
				that.context.service.log.error(that.context.i18n.getText("i18n", "ExtHeliumCommand_title"), message, ["user"]).done();
				that.context.service.usernotification.alert(message).done();
				that.context.service.progress.stopTask(taskId).done();
			});
		};

		return Q.sap.require("sap.watt.saptoolsets.fiori.common.fioriexternalcommands/extendproject/ui/AuthenticationDialog").then(function(
			authenticationDialog) {
			authenticationDialog.setContext(that.context);

			var defaultExtensionProjectName = appName + "Extension";

			if (createEvenIfExists) {
				return that.context.service.extensionproject.createFolderName(defaultExtensionProjectName).then(function(projectName) {
					var preFilledInfo = {};
					preFilledInfo.projectname = projectName;
					return authenticationDialog.open(extendproject, preFilledInfo);
				});
			}

			return that.context.service.filesystem.documentProvider.getRoot().then(function(rootDocument) {
				return rootDocument.objectExists(defaultExtensionProjectName).then(function(exists) {
					//If the a project with the same name exists and the parameter of creating an extension anyway is false 
					//then we do not create a new extension project, we just focus on the existing one
					if (exists) {
						//Let's just focus on the existing project
						return rootDocument.getChild(defaultExtensionProjectName).then(function(existingExtensionProjectFolder) {
							return that.context.service.repositorybrowser.setSelection(existingExtensionProjectFolder, true);
						});
					} else {
						//Then we have to create an extension project with the default name in order to be able to find it in
						//the next time the user opens WATT with the same external command. Therefore the project name is not editable in the dialog
						var preFilledInfo = {};
						preFilledInfo.projectname = defaultExtensionProjectName;
						return authenticationDialog.open(extendproject, preFilledInfo, false);
					}
				});
			});
		}).then(function() {
			// Finally, open the extensibility pane, unless the params specify otherwise
			// This has to come at this stage, because this is the only point where all flows converge
			return that.context.service.uicontent.isExtensibilityOpen().then(function(bIsOpen) {
				if (bIsOpen) {
					return that.context.service.uicontent.closeVisualExt();
				}
			}).then(function() {
				if (!dontOpenExtPane) {
					return that.context.service.command.getCommand("preview.extension").then(function(oCommand) {
						return oCommand.getState().then(function(oState) {
							if (oState.available) {
								return oCommand.execute();
							}
						});
					});
				}
			});
		});
	}
});