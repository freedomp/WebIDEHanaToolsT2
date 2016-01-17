define(["sap/watt/common/plugin/platform/service/ui/AbstractConfig"], function(AbstractConfig) {
	"use strict";
	return AbstractConfig.extend("sap.watt.uitools.plugin.sapui5clientbuild.service.builder.sapui5ClientBuildConfiguration", {
		_oProjectView: null,
		_oUserPreferenceView: null,

		// ====================================================================================
		// Interface methods: sap.watt.common.service.ui.Config
		// ====================================================================================
		getProjectSettingContent: function(id, group, sProjectPath) {
			var that = this;
			return this.context.service.document.getDocumentByPath(sProjectPath).then(function(oProjectDocument) {
				return that.setGetDefaultConfiguration(oProjectDocument).then(function(oBuildSettings) {
					that._oProjectView = sap.ui.view({
						viewName: "sap.watt.uitools.plugin.sapui5clientbuild.ui.builderConfig",
						type: sap.ui.core.mvc.ViewType.XML,
						viewData: {
							"context": that.context,
							"projectDocument": oProjectDocument,
							"buildSettings": oBuildSettings
						}
					});
					return that._oProjectView;
				});
			});
		},

		saveProjectSetting: function() {
			var oBuildSettings = this._oProjectView.getModel().getData();
			delete oBuildSettings.isDeepStructure;
			//Remove empty lines
			for (var i=0; i<oBuildSettings.excludedFolders.length; i++) {
				if (oBuildSettings.excludedFolders[i] === ""){
					oBuildSettings.excludedFolders.splice(i);
				}
			}
			for (var f=0; i<oBuildSettings.excludedFiles.length; f++) {
				if (oBuildSettings.excludedFiles[f] === ""){
					oBuildSettings.excludedFiles.splice(f);
				}
			}
			return this.setBuildSettings(this._oProjectView.getViewData().projectDocument,oBuildSettings);
		},

		getUserPreferenceContent: function() {
			//return a view for the user preference UI
		},

		saveUserPreference: function() {
			//save your user preference
		},

		_getBuildService: function() {
			return {
				getProxyMetadata: function() {
					return {
						getName: function() {
							return "build"; // the block name
						}
					};
				}
			};
		},

		getBuildSettings: function(oProjectDocument) {
			return this.context.service.setting.project.get(this._getBuildService(), oProjectDocument);
		},

		setBuildSettings: function(oProjectDocument, oBuildSettings) {
			return this.context.service.setting.project.set(this._getBuildService(), oBuildSettings, oProjectDocument);
		},

		setGetDefaultConfiguration: function(oProjectDocument) {
			var that = this;
			return Q.spread([oProjectDocument.getCurrentMetadata(true),
					this.context.service.ui5projecthandler.getHandlerFilePath(oProjectDocument),
					this.getBuildSettings(oProjectDocument)
				],
				function(aProjectMetadata, sHandlerFilePath, oBuildSettings) {
					if (!oBuildSettings) {
						if (sHandlerFilePath !== oProjectDocument.getEntity().getName()) { //Deep project
							//Check if there is a "webapp" folder as a default
							oBuildSettings = {
								"buildRequired": true,
								"lastBuildDateTime": undefined,
								"sourceFolder": that._webappExists(oProjectDocument, aProjectMetadata) === true ? "webapp" : undefined,
								"targetFolder": "dist",
								"excludedFolders": [],
								"excludedFiles": []
							};
						} else { //Flat project
							oBuildSettings = {
								"buildRequired": true,
								"lastBuildDateTime": undefined
							};
						}
						that.setBuildSettings(oProjectDocument, oBuildSettings).done();
					}
					return Q(oBuildSettings);
				});
		},

		_webappExists: function(oProjectDocument, aProjectMetadata) {
			for (var i = 0; i < aProjectMetadata.length; i++) {
				var sPath = aProjectMetadata[i].path.substring(oProjectDocument.getEntity().getName().length + 2);
				if (sPath.indexOf("webapp") === 0) {
					return true;
				}
			}
			return false;
		}
	});
});