define(["sap/watt/common/plugin/platform/service/ui/AbstractConfig", "sap/watt/lib/lodash/lodash"], function(AbstractConfig, _) {
	"use strict";
	return AbstractConfig.extend("sap.watt.common.plugin.preview.service.MockPreviewProjectConfig", {
		_oContent: null,
		_i18n: null,
		_oProjectSettings: null,

		getProjectSettingContent: function(id, group) {
			jQuery.sap.includeStyleSheet("resources/sap/watt/saptoolsets/fiori/run/plugin/mockpreview/css/mockDataSettings.css");
			var that = this;
			var oService = this.context.service;
			this._i18n = this.context.i18n;
			if (!this._oContent) {
				this._oContent = this._createUI();
				this._i18n.applyTo(this._oContent);
				this._oContent.setModel(new sap.ui.model.json.JSONModel());
			}

			return oService.selection.getSelection().then(function(aSelection) {
				var oSelection = aSelection[0];
				return oSelection.document.getProject().then(function(oProjectDocument) {
					var sProjectPath = oProjectDocument.getEntity().getFullPath();
					return oService.fioriodata.getServiceUrl(sProjectPath, "OData").then(function(sServiceUrl) {
						//get metadata local uri from manifest.json 
						return oService.appdescriptorutil.getMetadataPath(oProjectDocument).then(function(sMetadataPath) {

							return oService.setting.project.get(oService.mockpreview).then(function(oSettings) {

								var oProjectSettings = oSettings || {
									mockUri: "",
									metadataFilePath: "",
									mockRequestsFilePath: "",
									loadJSONFiles: false,
									loadCustomRequests: false
								};

								that._oContent.getModel().setProperty("/mockUriEnabled", true);
								that._oContent.getModel().setProperty("/metadataPathEnabled", true);
								//save new service uri in .project.json
								if (typeof(sServiceUrl) !== "undefined") {
									if (oProjectSettings.mockUri !== sServiceUrl) {
										oProjectSettings.mockUri = sServiceUrl;
										oService.setting.project.set(oService.mockpreview, oProjectSettings).done();
									}
									//disable mockuri textfield
									that._oContent.getModel().setProperty("/mockUriEnabled", false);
								}

								//save new metadaPath in .project.json 
								if (sMetadataPath) {
									if (oProjectSettings.metadataFilePath !== sMetadataPath) {
										oProjectSettings.metadataFilePath = sMetadataPath;
										oService.setting.project.set(oService.mockpreview, oProjectSettings).done();
									}
									//disable metadaPath textfield
									that._oContent.getModel().setProperty("/metadataPathEnabled", false);
								}

								if (!oProjectSettings.mockUri) {
									oProjectSettings.mockUri = "";
								}

								that._oContent.getModel().setProperty("/ProjectSettings", oProjectSettings);
								that.oMockDataSourceRBGroup.setSelectedIndex(oProjectSettings.loadJSONFiles ? 1 : 0);
								that.oExtendMockCB.setChecked(oProjectSettings.loadCustomRequests);

								return that._oContent;
							});
						});
					});
				});
			}).fail(function() {
				that.context.service.log.error("project settings", "Failed to load Mock Data settings", ["user"]).done();
			});
		},

		saveProjectSetting: function(id, group) {
			var oService = this.context.service;
			var oProjectSettings = this._oContent.getModel().getProperty("/ProjectSettings");
			var oMockUri = oProjectSettings.mockUri.trim();
			if (oMockUri.lastIndexOf("/") === oMockUri.length - 1) {
				oProjectSettings.mockUri = oMockUri.substring(0, oMockUri.length - 1);
			}
			oProjectSettings.loadJSONFiles = (this.oMockDataSourceRBGroup.getSelectedIndex() === 1);
			oProjectSettings.loadCustomRequests = (this.oExtendMockCB.getChecked());
			oService.setting.project.set(oService.mockpreview, oProjectSettings).done();
		},

		_createUI: function() {
			var that = this;
			var oInputUriTextField = new sap.ui.commons.TextField({
				value: "{mockUri}",
				placeholder: {
					path: "/mockUriEnabled",
					formatter: function(sVal) {
						if (sVal) {
							return that._i18n.getText("i18n", "runWithMock_config_serviceURL_description");
						} else {
							return "";
						}
					}
				},
				width: "100%",
				editable: "{/mockUriEnabled}",
				tooltip: {
					path: "/mockUriEnabled",
					formatter: function(sVal) {
						if (!sVal) {
							return that._i18n.getText("i18n", "tlt_runWithMock_config_serviceURL_notEditable");
						} else {
							return "";
						}
					}
				},
				layoutData: new sap.ui.layout.GridData({
					span: "L10 M10 S10"
				})
			});

			var oInputMetadataPathTextField = new sap.ui.commons.TextField({
				value: "{metadataFilePath}",
				placeholder: {
					path: "/metadataPathEnabled",
					formatter: function(sVal) {
						if (sVal) {
							return that._i18n.getText("i18n", "runWithMock_config_metadata_path_placeholder");
						} else {
							return "";
						}
					}
				},
				width: "100%",
				editable: "{/metadataPathEnabled}",
				tooltip: {
					path: "/metadataPathEnabled",
					formatter: function(sVal) {
						if (!sVal) {
							return that._i18n.getText("i18n", "tlt_runWithMock_config_metadataPath_notEditable");
						} else {
							return "";
						}
					}
				},
				layoutData: new sap.ui.layout.GridData({
					span: "L10 M10 S10"
				})
			});

			this.oMockDataSourceRBGroup = new sap.ui.commons.RadioButtonGroup({
				columns: 1,
				items: [
					new sap.ui.core.Item({
						text: "{i18n>runWithMock_config_mockdata_source_gendata}"
					}),
					new sap.ui.core.Item({
						text: "{i18n>runWithMock_config_mockdata_source_jsondata}"
					})]
			});

			this.oExtendMockCB = new sap.ui.commons.CheckBox({
				text: "{i18n>runWithMock_config_loadCustomRequests_checkbox}",
				checked: "{loadCustomRequests}",
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12",
					linebreak: true
				})
			});

			var oInputMockRequestsPathTextField = new sap.ui.commons.TextField({
				value: "{mockRequestsFilePath}",
				placeholder: "{i18n>runWithMock_config_extensionfile_placeholder}",
				enabled: "{loadCustomRequests}",
				width: "100%",
				layoutData: new sap.ui.layout.GridData({
					span: "L10 M10 S10"
				})
			});

			//SimpleForm
			var oSimpleForm = new sap.ui.layout.form.SimpleForm({
				layout: sap.ui.layout.form.SimpleFormLayout.ResponsiveGridLayout,
				content: [
								new sap.ui.commons.Label({
						text: "{i18n>runWithMock_config_service_root_uri}",
						tooltip: "{i18n>runWithMock_config_serviceURL_tooltip}"
					}),
								oInputUriTextField,
								new sap.ui.commons.Label({
						text: "{i18n>runWithMock_config_service_metadata_path}",
						tooltip: "{i18n>runWithMock_config_metadata_path_tooltip}"
					}),
								oInputMetadataPathTextField,
								new sap.ui.commons.Label({
						text: "{i18n>runWithMock_config_mockdata_source}"
					}),
								this.oMockDataSourceRBGroup,
								this.oExtendMockCB,
								new sap.ui.commons.Label({
						text: "{i18n>runWithMock_config_extensionfile}",
						tooltip: "{i18n>runWithMock_config_extensionfile_tooltip}"
					}),
								oInputMockRequestsPathTextField
								]
			}).addStyleClass("mockDataSettingsSpacing");

			oSimpleForm.bindElement("/ProjectSettings");
			return oSimpleForm;

		}
	});
});