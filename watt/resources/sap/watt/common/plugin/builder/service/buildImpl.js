define(["sap/watt/lib/lodash/lodash"], function(_) {
	"use strict";

	return {

		build: function(oProjectDocument) {
			var that = this;
			var oI18n = this.context.i18n;
			var sProjectName = oProjectDocument.getEntity().getFullPath();
			var bErrorOccured = false;
			return that.context.service.progress.startTask()
				.then(function(iProgressId) {
					that._printToConsoleLog("info", oI18n.getText("i18n", "builder_buildStarted", sProjectName));
					that.context.service.usernotification.liteInfo(oI18n.getText("i18n", "builder_buildStarted", sProjectName)).done();
					return that._getBuildConfiguration(oProjectDocument).then(function(oBuildConfiguration) {
						return oBuildConfiguration.buildService.build(oProjectDocument).then(function() {
							return oBuildConfiguration.buildService.setLastBuildDateTime(oProjectDocument).then(function() {
								that.context.service.usagemonitoring.report("builder", "build", oBuildConfiguration.projectTypeId).done();
								that.context.service.usernotification.liteInfo(oI18n.getText("i18n", "builder_BuildCompletedSuccessfully", sProjectName)).done();
							});
						}).fail(function(_oError) {
							_oError.action = "hcp_build";
							bErrorOccured = true;
							that._printToConsoleLog("error", _oError.message);
							var sMessage = oI18n.getText("i18n", "builder_buildCompletedWithErrors", sProjectName) +
								" " + _oError.message;
							var sTitle = oI18n.getText("i18n", "builder_buildFailed");
							sap.ui.commons.MessageBox.alert(sMessage, null, sTitle);
						});
					}).fin(function() {
						var sSeverity = bErrorOccured ? "error" : "info";
						var sMessage = bErrorOccured ? "builder_buildCompletedWithErrors" : "builder_BuildCompletedSuccessfully";
						that._printToConsoleLog(sSeverity, oI18n.getText("i18n", sMessage, sProjectName));
						return that.context.service.progress.stopTask(iProgressId).done();
					});
				});
		},

		isBuildSupported: function(oProjectDocument) {
			if (oProjectDocument.isProject()) {
				return this._getBuildConfiguration(oProjectDocument).then(function(oBuildConfiguration) {
					if (oBuildConfiguration) {
						return true;
					} else {
						return false;
					}
				});
			} else {
				return false;
			}
		},

		isBuildConfigurationSupported: function(oProjectDocument) {
			if (oProjectDocument.isProject()) {
				return this._getBuildConfiguration(oProjectDocument).then(function(oBuildConfiguration) {
					if (oBuildConfiguration && oBuildConfiguration.buildConfigurationService) {
						return true;
					} else {
						return false;
					}
				});
			} else {
				return false;
			}
		},

		isBuildRequired: function(oProjectDocument) {
			return this._getBuildConfiguration(oProjectDocument).then(function(oBuildConfiguration) {
				if (oBuildConfiguration) {
					return oBuildConfiguration.buildService.isBuildRequired(oProjectDocument);
				} else {
					return false;
				}
			});
		},

		getTargetFolder: function(oProjectDocument) {
			var that = this;
			return this._getBuildConfiguration(oProjectDocument).then(function(oBuildConfiguration) {
				if (oBuildConfiguration) {
					return oBuildConfiguration.buildService.getTargetFolder(oProjectDocument);
				} else {
					var sProjectName = oProjectDocument.getEntity().getName();
					throw new Error(that.context.i18n.getText("i18n", "builder_notBuildable", sProjectName));
				}
			});
		},

		getTargetFolderByProjectSettings: function(oProjectSettings) {
			var that = this;
			return that._mConfig.projectTypes[0].buildService.getTargetFolderByProjectSettings(oProjectSettings);
		},

		getBuildConfigurationTitle: function(oProjectDocument) {
			var that = this;
			return this._getBuildConfiguration(oProjectDocument).then(function(oBuildConfiguration) {
				if (oBuildConfiguration) {
					return oBuildConfiguration.buildConfigurationService.getTitle(oProjectDocument);
				} else {
					var sProjectName = oProjectDocument.getEntity().getName();
					throw new Error(that.context.i18n.getText("i18n", "builder_notBuildable", sProjectName));
				}
			});
		},

		getBuildConfigurationUI: function(oProjectDocument) {
			var that = this;
			return this._getBuildConfiguration(oProjectDocument).then(function(oBuildConfiguration) {
				if (oBuildConfiguration) {
					return oBuildConfiguration.buildConfigurationService.getUI(oProjectDocument);
				} else {
					var sProjectName = oProjectDocument.getEntity().getName();
					throw new Error(that.context.i18n.getText("i18n", "builder_notBuildable", sProjectName));
				}
			});
		},

		configure: function(mConfig) {
			this._mConfig = mConfig;
			this._aStyles = mConfig.styles;
			if (this._aStyles) {
				this.context.service.resource.includeStyles(this._aStyles).done();
			}
		},

		onDocumentChanged: function(oEvent) {
			var that = this;
			
			oEvent.params.document.getProject().then(function(oProjectDocument) {
				return that._getBuildConfiguration(oProjectDocument).then(function(oBuildConfiguration) {
					if (oBuildConfiguration) {
						return oBuildConfiguration.buildService.setIsBuildRequired(oEvent, oProjectDocument);
					}
				});
			}).done();
		},

		_getBuildConfiguration: function(oProjectDocument) {
			var that = this;
			return this.context.service.projectType.getProjectTypes(oProjectDocument).then(function(aProjectTypes) {
				var oBuildConfiguration;
				_.forEach(aProjectTypes, function(oProjectType) {
					var oThisConfiguredProjectType = _.findWhere(that._mConfig.projectTypes, {
						projectTypeId: oProjectType.id
					});
					oBuildConfiguration = oThisConfiguredProjectType ? oThisConfiguredProjectType : oBuildConfiguration;
				});
				return oBuildConfiguration;
			});
		},

		_printToConsoleLog: function(sSeverity, sMessage) {
			if (sSeverity === "error") {
				this.context.service.log.error("Builder", sMessage, ["user"]).done();
			} else if (sSeverity === "info") {
				this.context.service.log.info("Builder", sMessage, ["user"]).done();
			}
		}

	};

});