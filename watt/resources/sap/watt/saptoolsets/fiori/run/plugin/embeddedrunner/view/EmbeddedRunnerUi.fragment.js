sap.ui.jsfragment("sap.watt.saptoolsets.fiori.run.plugin.embeddedrunner.view.EmbeddedRunnerUi", {
	_oController: null,

	createContent: function(oController) {
		this._oController = oController;

		var oRunConfigControl = new sap.ui.layout.form.SimpleForm({
			layout: sap.ui.layout.form.SimpleFormLayout.ResponsiveGridLayout,
			labelSpanL: 1,
			labelSpanM: 1,
			maxContainerCols: 1,
			columnsL: 1
		}).addStyleClass("labelPaddingLeft emdModeSimpleForm");

		if (this._oController._oConfigurationUiElements.iSAPFioriLaunchpadSection) {
			this._addSAPFioriLaunchpadSection(oController, oRunConfigControl);
		}
		if (this._oController._oConfigurationUiElements.iAdditionalApplicationsFromWsSection) {
			this._addAdditionalApplicationsFromWsSection(oController, oRunConfigControl);
		}
		// -------- Application URL Parameters Section --------
		if (this._oController._oConfigurationUiElements.iUrlParameters) {
			// Application URL Parameters Grid
			this._addApplUrlParamsSection(oController, oRunConfigControl);
		}

		return oRunConfigControl;
	},

	_addSAPFioriLaunchpadSection: function(oController, oRunConfigControl) {

		// Title App Name
		jQuery.sap.require("sap.watt.ideplatform.plugin.run.ui.TitleExtendedControl");

		var oTtlAppName = new sap.ui.commons.Title({
			text: "{i18n>title_run_config_ui_a2a_embmode}",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		});

		var oTtlArguments = new sap.watt.ideplatform.plugin.run.ui.TitleExtendedControl({});
		oTtlArguments.setAggregation("title", oTtlAppName);

		oRunConfigControl.addContent(oTtlArguments);
		
	   //add header text
		var oGeneralHeaderTxt = new sap.ui.commons.Label({
			text: "{i18n>lbl_run_config_ui_embmode_general_txt}",
			//text: "Define the application that will be used in SAP Fiori launchpad.",
			visible: true,
			textAlign: "Begin",
			width: "100%",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		}).addStyleClass("compositeControlTextColour labelPaddingLeft");

		// text Grid
		var oTxtGrid = new sap.ui.layout.Grid({
			vSpacing: 0,
			hSpacing: 0,
			width: "100%",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			}),
			content: [oGeneralHeaderTxt]
		}).addStyleClass("labelPaddingLeft");
		oRunConfigControl.addContent(oTxtGrid);

		// Label for RadioButtonGroup
		var oLblRBG = new sap.ui.commons.Label({
			text: "{i18n>lbl_run_config_ui_embmode_embed_mode_for}",
			required: true,
			layoutData: new sap.ui.layout.GridData({
				span: "L4 M4 S12"
			})
		}).addStyleClass("labelPaddingLeft");

		oRunConfigControl.addContent(oLblRBG);

		// Create a RadioButtonGroup for ABAP Repository/Hana Cloud Platform
		var oRBG = new sap.ui.commons.RadioButtonGroup({
			tooltip: "{i18n>tlt_run_config_ui_embmode_choose_emd_mode}",
			columns: 2,
			selectedIndex: {
				path: "/emdType",
				formatter: oController.selectedRgbIndex
			},
			select: function(oEvent) {
				oController.onRadioSelect(oEvent);
			}
		});

		// Create an Item for ABAP Repository
		var oItem = new sap.ui.core.Item({
			text: "{i18n>lbl_run_config_ui_embmode_abap_repository}",
			tooltip: "{i18n>tlt_run_config_ui_embmode_abap_repository}"
		});
		oRBG.addItem(oItem);

		// Create an Item for HCP
		oItem = new sap.ui.core.Item({
			text: "{i18n>lbl_run_config_ui_embmode_hcp_platform}",
			tooltip: "{i18n>tlt_run_config_ui_embmode_hcp_platform}"
		});
		oRBG.addItem(oItem);
		oRunConfigControl.addContent(oRBG);

		// Label Dest Name
		var oLblDestName = new sap.ui.commons.Label({
			text: "{i18n>lbl_run_config_ui_embmode_dest_name}",
			required: true,
			layoutData: new sap.ui.layout.GridData({
				span: "L2 M2 S12"
			}),
			visible: {
				path: "/emdType",
				formatter: oController.isAbapFieldVisible
			}
		}).addStyleClass("labelPaddingLeft");
		oRunConfigControl.addContent(oLblDestName);

		// DropDown Box Systems
		var oSystemsDropDown = new sap.ui.commons.DropdownBox({
			busy: true,
			required: true,
			placeholder: "{i18n>plh_run_config_ui_embmode_dest_name}",
			tooltip: "{i18n>tlt_run_config_ui_embmode_dest_name}",
			layoutData: new sap.ui.layout.GridData({
				span: "L10 M10 S12"
			}),
			change: function(oEvent) {
				oController.onSystemsDropDownChange(oEvent);
			},
			visible: {
				path: "/emdType",
				formatter: oController.isAbapFieldVisible
			}
		});
		oRunConfigControl.addContent(oSystemsDropDown);
		oLblDestName.setLabelFor(oSystemsDropDown);
		oLblDestName.setRequired(true);

		// Label Account name
		var oLblAccountName = new sap.ui.commons.Label({
			text: "{i18n>lbl_run_config_ui_embmode_account_name}",
			tooltip: "{i18n>tlt_run_config_ui_embmode_account_name}",
			required: true,
			layoutData: new sap.ui.layout.GridData({
				span: "L3 M3 S12"
			}),
			visible: {
				path: "/emdType",
				formatter: oController.isHcpFieldVisible
			}
		}).addStyleClass("labelPaddingLeft");
		oRunConfigControl.addContent(oLblAccountName);

		// TextField Account
		var oAccountTextField = new sap.ui.commons.TextField({
			placeholder: "{i18n>plh_run_config_ui_embmode_account_name}",
			tooltip: "{i18n>tlt_run_config_ui_embmode_account_name}",
			editable: false,
			required: true,
			layoutData: new sap.ui.layout.GridData({
				span: "L9 M9 S12"
			}),
			visible: {
				path: "/emdType",
				formatter: oController.isHcpFieldVisible
			}
		});
		oRunConfigControl.addContent(oAccountTextField);
		oLblAccountName.setLabelFor(oAccountTextField);
		oLblAccountName.setRequired(true);

		// Label Provider name
		var oLblProviderName = new sap.ui.commons.Label({
			text: "{i18n>lbl_run_config_ui_embmode_provider_name}",
			tooltip: "{i18n>tlt_run_config_ui_embmode_provider_name}",
			required: true,
			layoutData: new sap.ui.layout.GridData({
				span: "L3 M3 S12"
			}),
			visible: {
				path: "/emdType",
				formatter: oController.isHcpFieldVisible
			}
		}).addStyleClass("labelPaddingLeft");
		oRunConfigControl.addContent(oLblProviderName);

		// DropDown Provider
		var oProviderDropDown = new sap.ui.commons.DropdownBox({
			busy: true,
			required: true,
			placeholder: "{i18n>plh_run_config_ui_embmode_provider_name}",
			tooltip: "{i18n>tlt_run_config_ui_embmode_provider_name}",
			layoutData: new sap.ui.layout.GridData({
				span: "L9 M9 S12"
			}),
			change: function(oEvent) {
				oController.onProviderDropDownChange(oEvent);
			},
			visible: {
				path: "/emdType",
				formatter: oController.isHcpFieldVisible
			}
		});
		oRunConfigControl.addContent(oProviderDropDown);
		oLblProviderName.setLabelFor(oProviderDropDown);
		oLblProviderName.setRequired(true);

		// Label App Name
		var oLblAppName = new sap.ui.commons.Label({
			text: "{i18n>lbl_run_config_ui_embmode_app_name_bsp}",
			tooltip: "{i18n>tlt_run_config_ui_embmode_app_name_bsp}",
			required: true,
			layoutData: new sap.ui.layout.GridData({
				span: "L2 M2 S12"
			}),
			visible: {
				path: "/emdType",
				formatter: oController.isAbapFieldVisible
			}
		}).addStyleClass("labelPaddingLeft");
		oRunConfigControl.addContent(oLblAppName);

		// TextField Apps
		var oAppsTextField = new sap.ui.commons.TextField({
			placeholder: "{i18n>plh_run_config_ui_embmode_app_name_bsp}",
			tooltip: "{tlt_run_config_ui_embmode_app_name_bsp}",
			required: true,
			layoutData: new sap.ui.layout.GridData({
				span: "L10 M10 S12"
			}),
			change: function(oEvent) {
				oController.onAppsTextFieldChange(oEvent);
			},
			visible: {
				path: "/emdType",
				formatter: oController.isAbapFieldVisible
			}
		});
		oRunConfigControl.addContent(oAppsTextField);
		oLblAppName.setLabelFor(oAppsTextField);
		oLblAppName.setRequired(true);

		// Labeltxt
		var oLblWarningTxt = new sap.ui.commons.Label({
			//text: "Before running your application on SAP HANA Cloud Platform you must clear your SAP Fiori launchpad cache.",
			text: "{i18n>lbl_run_config_ui_embmode_hcp_warning_txt}",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			}),
			visible: {
				path: "/emdType",
				formatter: oController.isHcpFieldVisible
			}
		}).addStyleClass("redWarningLabel labelPaddingLeft");
		
		// text Grid
		var oWarningTxtGrid = new sap.ui.layout.Grid({
			vSpacing: 0,
			hSpacing: 0,
			width: "100%",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			}),
			content: [oLblWarningTxt]
		}).addStyleClass("labelPaddingLeft");
		oRunConfigControl.addContent(oWarningTxtGrid);
		
		oSystemsDropDown.addEventDelegate({
			onAfterRendering: function() {
				oController.onAfterSystemsDropDownRendering(oSystemsDropDown);
				oController.removeDropDownMsg(oProviderDropDown);
			}
		}, oSystemsDropDown);

		oAccountTextField.addEventDelegate({
			onAfterRendering: function() {
				oController.onAfterAccountTextFieldRendering(oAccountTextField);
			}
		}, oAccountTextField);

		oAppsTextField.addEventDelegate({
			onAfterRendering: function() {
				oController.onAfterAppsTextFieldRendering(oAppsTextField);
			}
		}, oAppsTextField);

		oProviderDropDown.addEventDelegate({
			onAfterRendering: function() {
				oController.onAfterProviderDropDownRendering(oProviderDropDown);
				oController.removeDropDownMsg(oSystemsDropDown);
			}
		}, oProviderDropDown);

		return oRunConfigControl;
	},

	_addAdditionalApplicationsFromWsSection: function(oController, oRunConfigControl) {
		// Title
		jQuery.sap.require("sap.watt.ideplatform.plugin.run.ui.TitleExtendedControl");

		var oAdditionalApplicationsFromWS = new sap.ui.commons.Title({
			text: "{i18n>title_run_config_ui_wsapps_embmode}",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		});

		var oTtlArguments = new sap.watt.ideplatform.plugin.run.ui.TitleExtendedControl({});
		oTtlArguments.setAggregation("title", oAdditionalApplicationsFromWS);

		oRunConfigControl.addContent(oTtlArguments);

		var oAdditionalApplicationsHeaderTxt = new sap.ui.commons.Label({
			text: "{i18n>lbl_run_config_ui_embmode_wsapps_txt}",
			visible: true,
			textAlign: "Begin",
			width: "100%",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		}).addStyleClass("compositeControlTextColour labelPaddingLeft");

		oRunConfigControl.addContent(oAdditionalApplicationsHeaderTxt);

		// WS Name Label
		var oAppWSName = new sap.ui.commons.Label({
			text: "{i18n>lbl_run_config_ui_embmode_wsapps_projname}",
			visible: true,
			design: "Bold",
			textAlign: "Begin",
			width: "100%",
			layoutData: new sap.ui.layout.GridData({
				span: "L5 M5 S5"
			})
		});

		// BSP Name Label
		var oAppBSPName = new sap.ui.commons.Label({
			text: "{i18n>lbl_run_config_ui_embmode_wsapps_appname}",
			visible: true,
			design: "Bold",
			width: "100%",
			layoutData: new sap.ui.layout.GridData({
				span: "L5 M5 S5"
			})
		});

		// Header grid
		var oHeaderGrid = new sap.ui.layout.Grid({
			content: [oAppWSName, oAppBSPName],
			width: "100%",
			vSpacing: 0,
			hSpacing: 1,
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		}).addStyleClass("SAPIdePreviewAppParams");

		// Body grid
		var oGrid = new sap.ui.layout.Grid({
			width: "100%",
			vSpacing: 0,
			hSpacing: 0,
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		});

		// Create the template control that will be repeated and will display the data
		var oRowTemplate = this._addApplicationFromWSLineTemplate(oController, oAppWSName, oAppBSPName);

		oGrid.bindAggregation("content", {
			path: "/workspaceApplications",
			template: oRowTemplate
		});

		// Add Button
		var oAddNewAppButton = new sap.ui.commons.Button({
			text: "{i18n>btn_run_config_ui_embmode_wsapps_add}",
			icon: "sap-icon://add",
			tooltip: "{i18n>btn_run_config_ui_embmode_wsapps_add}",
			layoutData: new sap.ui.layout.GridData({
				span: "L3 M3 S3"
			}),
			press: function() {
				oAppWSName.setVisible(true);
				oAppBSPName.setVisible(true);
				oController.createAdditionalWsAppLine(this);
			}
		}).addStyleClass("riverControlSmall");

		oAddNewAppButton.addEventDelegate({
			onAfterRendering: function() {
				var oModel = this.getModel();
				var aWorkspaceApplications = oModel.getProperty("/workspaceApplications");
				if (!aWorkspaceApplications || aWorkspaceApplications.length === 0) {
					oAppWSName.setVisible(false);
					oAppBSPName.setVisible(false);
				}
			}
		}, oAddNewAppButton);

		// Grid
		var oAddLineGrid = new sap.ui.layout.Grid({
			vSpacing: 0,
			hSpacing: 0,
			width: "100%",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			}),
			content: [oAddNewAppButton]
		}).addStyleClass("labelPaddingLeft");

		// Main grid
		var oMainGrid = new sap.ui.layout.Grid({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			content: [oAddLineGrid, oHeaderGrid, oGrid]
		}).addStyleClass("labelPaddingLeft");

		oRunConfigControl.addContent(oMainGrid);
	},

	_addApplicationFromWSLineTemplate: function(oController, oAppWSName, oAppBSPName) {
		// DropDown Box
		var oProjectsDropDown = new sap.ui.commons.DropdownBox({
			placeholder: "{i18n>plh_run_config_ui_embmode_wsapps_projname}",
			width: "100%",
			value: "{localPath}",
			// No need in rich tooltip for now
			tooltip: "{i18n>tlt_run_config_ui_embmode_wsapps_projname}",
			layoutData: new sap.ui.layout.GridData({
				span: "L5 M5 S5"
			}),
			change: [oController.onWorkspaceAppsDropDownChange, oController]
		});

		// TextBox
		var oAppTextField = new sap.ui.commons.TextField({
			placeholder: "{i18n>plh_run_config_ui_embmode_app_name}",
			width: "100%",
			value: "{bspName}",
			tooltip: "{i18n>tlt_run_config_ui_embmode_app_name}",
			layoutData: new sap.ui.layout.GridData({
				span: "L5 M5 S5"
			}),
			change: [oController.onWorkspaceAppTextFieldChange, oController]
		});

		// Delete Button
		var oDeleteLine = new sap.ui.commons.Button({
			icon: "sap-icon://watt/delete",
			lite: true,
			press: function() {
				var oModel = this.getModel();
				var aWorkspaceApplications = oModel.getProperty("/workspaceApplications");
				if (aWorkspaceApplications.length === 1) {
					oAppWSName.setVisible(false);
					oAppBSPName.setVisible(false);
				}
				oController.deleteAdditionalWsAppLine(this);
			},
			layoutData: new sap.ui.layout.GridData({
				span: "L1 M1 S1"
			})
		});

		// Container
		var oLineLayout = new sap.ui.layout.Grid({
			width: "100%",
			hSpacing: 1,
			content: [oProjectsDropDown, oAppTextField, oDeleteLine],
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		}).addStyleClass("SAPIdePreviewAppParams");

		oProjectsDropDown.addEventDelegate({
			onAfterRendering: $.proxy(oController.onAfterWorkspaceAppsDropDownRendering, oController)
		}, oProjectsDropDown);

		oAppTextField.addEventDelegate({
			onAfterRendering: $.proxy(oController.onAfterWorkspaceAppTextFieldRendering, oController)
		}, oAppTextField);

		return oLineLayout;
	},

	_addApplUrlParamsSection: function(oController, oRunConfigControl) {

		// Title
		var oAddParameterTitleURL = new sap.ui.core.Title({
			text: "{i18n>app_params_settings_title}",
			tooltip: "{i18n>tlt_app_params_settings_title}",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		});

		oRunConfigControl.addContent(oAddParameterTitleURL);

		// Grid
		var oEnabledURL = new sap.ui.commons.Label({
			text: "{i18n>lbl_params_proj_settings_enabled}",
			textAlign: "Begin",
			design: "Bold",
			width: "100%",
			layoutData: new sap.ui.layout.GridData({
				span: "L1 M1 S1"
			})
		});

		var oParamNameURL = new sap.ui.commons.Label({
			text: "{i18n>lbl_params_proj_settings_param_name}",
			design: "Bold",
			textAlign: "Begin",
			width: "100%",
			layoutData: new sap.ui.layout.GridData({
				span: "L5 M5 S5"
			})
		});

		var oParamValueURL = new sap.ui.commons.Label({
			text: "{i18n>lbl_params_proj_settings_param_value}",
			design: "Bold",
			width: "100%",
			layoutData: new sap.ui.layout.GridData({
				span: "L5 M5 S5"
			})
		});

		// header grid
		var oHeaderGridURL = new sap.ui.layout.Grid({
			content: [oEnabledURL, oParamNameURL, oParamValueURL],
			width: "100%",
			vSpacing: 0,
			hSpacing: 1,
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		}).addStyleClass("SAPIdePreviewAppParams");

		// body grid
		var oGridURL = new sap.ui.layout.Grid({
			width: "100%",
			vSpacing: 0,
			hSpacing: 0,
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		});

		//create the template control that will be repeated and will display the data
		var oRowTemplateURL = this._addParamLineTemplate(oController);

		oGridURL.bindAggregation("content", {
			path: "/oUrlParameters",
			template: oRowTemplateURL
		});

		// add button
		var oAddNewParamButtonURL = new sap.ui.commons.Button({
			text: "{i18n>lbl_params_proj_settings_add_param}",
			tooltip: "{i18n>tlt_params_proj_settings_add_param}",
			layoutData: new sap.ui.layout.GridData({
				span: "L3 M3 S3"
			}),
			press: this._oController.createNewParameterLine
		}).addStyleClass("riverControlSmall ");

		// grid
		var oAddLineGridURL = new sap.ui.layout.Grid({
			vSpacing: 0,
			hSpacing: 0,
			width: "100%",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			}),
			content: [oAddNewParamButtonURL]
		});

		//Hash parameter label
		var oHashLabel = new sap.ui.commons.Label({
			text: "{i18n>lbl_params_proj_settings_hash_url_param}",
			textAlign: "Begin",
			width: "100%",
			layoutData: new sap.ui.layout.GridData({
				span: "L3 M3 S3"
			})
		});

		//Hash parameter text field
		var oHashField = new sap.ui.commons.TextField({
			placeholder: "{i18n>lbl_params_proj_settings_hash_param_place_holder}",
			width: "100%",
			value: "{/oHashParameter}",
			tooltip: "{i18n>tlt_params_proj_settings_hash_param}",
			layoutData: new sap.ui.layout.GridData({
				span: "L8 M8 S8"
			})
		});

		//hash parameter grid
		var oHashGrid = new sap.ui.layout.Grid({
			width: "100%",
			vSpacing: 4,
			hSpacing: 4,
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			}),
			content: [oHashLabel, oHashField]
		});

		// main grid
		var oMainGridURL = new sap.ui.layout.Grid({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			content: [oAddLineGridURL, oHeaderGridURL, oGridURL, oHashGrid]
		});

		oRunConfigControl.addContent(oMainGridURL);
	},

	_addParamLineTemplate: function(oController) {
		// create the Enable/Disable CheckBox
		var oCBParamActive = new sap.ui.commons.CheckBox({
			tooltip: "{i18n>tlt_params_proj_settings_enable}",
			checked: "{paramActive}",
			layoutData: new sap.ui.layout.GridData({
				span: "L1 M1 S1"
			}),
			change: $.proxy(oController.onCheckBoxChange, oController)
		});

		var oParamName = new sap.ui.commons.TextField({
			placeholder: "{i18n>lbl_params_proj_settings_param_name_place_holder}",
			width: "100%",
			value: "{paramName}",
			tooltip: "{i18n>tlt_params_proj_settings_param_name}",
			layoutData: new sap.ui.layout.GridData({
				span: "L5 M5 S5"
			}),
			change: $.proxy(oController.onParamNameChange, oController)
		});

		oParamName.addEventDelegate({
			onAfterRendering: $.proxy(oController.onAfterParamNameRendering, oController)
		}, oParamName);

		var oParamValue = new sap.ui.commons.TextField({
			placeholder: "{i18n>lbl_params_proj_settings_param_value_place_holder}",
			width: "100%",
			value: "{paramValue}",
			tooltip: "{i18n>tlt_params_proj_settings_param_value}",
			layoutData: new sap.ui.layout.GridData({
				span: "L5 M5 S5"
			})
		});

		var oDeleteParam = new sap.ui.commons.Button({
			icon: "sap-icon://watt/delete",
			lite: true,
			tooltip: "{i18n>tlt_params_proj_settings_delete_param}",
			press: function() {
				oController.deleteParameterLine(this);
			},
			layoutData: new sap.ui.layout.GridData({
				span: "L1 M1 S1"
			})
		});

		var oLineLayout = new sap.ui.layout.Grid({
			width: "100%",
			hSpacing: 1,
			content: [oCBParamActive, oParamName, oParamValue, oDeleteParam],
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		}).addStyleClass("SAPIdePreviewAppParams");

		return oLineLayout;
	}
});