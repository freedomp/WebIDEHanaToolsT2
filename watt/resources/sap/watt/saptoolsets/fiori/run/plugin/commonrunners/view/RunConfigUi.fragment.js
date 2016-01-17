sap.ui.jsfragment("sap.watt.saptoolsets.fiori.run.plugin.commonrunners.view.RunConfigUi", {
	_oController: null,

	createContent: function(oController) {
		this._oController = oController;

		var oRunConfigControl = new sap.ui.layout.form.SimpleForm({
			layout: sap.ui.layout.form.SimpleFormLayout.ResponsiveGridLayout,
			labelSpanL: 1,
			labelSpanM: 1,
			maxContainerCols: 1,
			columnsL: 1
		});

		// TODO: sort UI elements based on the value in the Configuration Ui Elements indexes 

		// -------- Application File Path Section --------
		if (this._oController._oConfigurationUiElements.iFilePathSection) {
			this._addAppFilePathSection(oController, oRunConfigControl);
		}

		// -------- Application UI5 Vesions Section --------
		if (this._oController._oConfigurationUiElements.iUI5VersionSection) {
			this._addUI5VersionSection(oController, oRunConfigControl);
		}

		// -------- Preview Frame Section --------
		if (this._oController._oConfigurationUiElements.iPreviewFrame) {
			this._addPreviewFrameSection(oController, oRunConfigControl);
		}

		// -------- Mock Data Section --------
		if (this._oController._oConfigurationUiElements.iMockData) {
			this._addMockDataSection(oController, oRunConfigControl);
		}

		// -------- Application Resource Mapping Section --------
		if (this._oController._oConfigurationUiElements.iResourceMapping) {
			this._addResourceMappingSection(oController, oRunConfigControl);
		}

		// -------- Application URL Parameters Section --------
		if (this._oController._oConfigurationUiElements.iUrlParameters) {
			// Application URL Parameters Grid
			this._addApplUrlParamsSection(oController, oRunConfigControl);
		}
		
		// -------- Application Change BE System Section --------
		if (this._oController._oConfigurationUiElements.iBackendSystem) {
			this._addBackendSystemSection(oController, oRunConfigControl);
		}

		return oRunConfigControl;
	},

	_addAppFilePathSection: function(oController, oRunConfigControl) {

		// Title
		var oTtlLounch = new sap.ui.core.Title({
			text: "{i18n>run_config_ui_obj_to_lounch_title}",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		});
		oRunConfigControl.addContent(oTtlLounch);

		// Label
		var oLblPath = new sap.ui.commons.Label({
			text: "{i18n>lbl_run_config_ui_path}" + "*",
			required: true
		});
		oRunConfigControl.addContent(oLblPath);

		//Auto Complete
		var aData = oController.getSuggestItemes();
		var oAcFilePath = new sap.ui.commons.AutoComplete({
			maxPopupItems: 10,
			placeholder: "{i18n>lbl_run_config_enter_file_path}",
			displaySecondaryValues: true,
			value: {
				path: "/filePath",
				mode: sap.ui.model.BindingMode.OneWay,
				formatter: function(fullPath) {
					if (fullPath != null) {
						var event = this;
						oController._oDocument.getProject().then(function(oProject) {
							var aFileParts = fullPath.split("/");
							var projectName = aFileParts[1];
							var sNewPath;
							if (oProject.getEntity().getName() === projectName) {
								sNewPath = '/' + fullPath.split('/').slice(2).join('/');
							} else {
								sNewPath = fullPath;
							}
							event.setValue(sNewPath);
						}).done();
					}
				}
			},
			suggest: function(oEvent) {
				this.destroyItems();
				var sValue = oEvent.getParameter("suggestValue");
				for (var i = 0; i < aData.length; i++) {
					var sNoProjName = '/' + aData[i].fullPath.split('/').slice(2).join('/');
					if ((aData[i].name.toLowerCase(), sValue) || (aData[i].fullPath.toLowerCase(), sValue)) {
						this.addItem(new sap.ui.core.ListItem({
							text: aData[i].name,
							key: aData[i].fullPath,
							additionalText: sNoProjName
						}));
					}
				}
			},
			change: $.proxy(oController.onPathFieldChange, oController),
			layoutData: new sap.ui.layout.GridData({
				span: "L9 M9 S12"
			})
		});

		oAcFilePath.setFilterFunction(function(sValue, oItem) {
			var ignoreCaseVal = sValue.toLowerCase();
			return (oItem.getText().toLowerCase().indexOf(ignoreCaseVal) !== -1) ||
				(oItem.getAdditionalText().toLowerCase().indexOf(ignoreCaseVal) !== -1);
		});

		// Add delegate to put selected values in bold
		oAcFilePath._getListBox().addDelegate({
			onAfterRendering: function() {
				$("#" + oAcFilePath._getListBox().getId() + " .sapUiLbxITxt").each(function(index, element) {
					var typedVal = oAcFilePath._sTypedChars.toLowerCase();
					var rep = new RegExp("(" + typedVal + ")", "ig");
					//var rep =  new RegExp("("+typedVal.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')+")", "ig");  
					element.innerHTML = element.innerHTML.replace(rep, "<b>$1</b>");
				});

				$("#" + oAcFilePath._getListBox().getId() + " .sapUiLbxISec").each(function(index, element) {
					var typeValsec = oAcFilePath._sTypedChars.toLowerCase();
					//var rep =  new RegExp("("+typeValsec.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')+")", "ig");
					var rep = new RegExp("(" + typeValsec + ")", "ig");
					element.innerHTML = element.innerHTML.replace(rep, "<b>$1</b>");
				});
			}
		});

		oAcFilePath.addEventDelegate({
				onAfterRendering: $.proxy(oController.onAfterPathFieldRendering, oController)
			},
			oAcFilePath);

		//Fix UI5 issue when the file name is long the listBox exceed the parent size
		oAcFilePath._getListBox().addDelegate({
			onAfterRendering: jQuery.proxy(function(oEvent) {
				this.$().css({
					"width": "5px",
					"border-collapse": "separate"
				});
			}, oAcFilePath._getListBox())
		});

		oRunConfigControl.addContent(oAcFilePath);

		// Comment in case of Fiori file - This application will run on SAP Fiori launchpad sandbox 
		var oTvFioriLp = new sap.ui.commons.TextView({
			text: "{i18n>lbl_run_config_ui_run_fiori_lp}",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			}),
			visible: {
				path: "/filePath",
				formatter: function(filePath) {
					return oController.checkFileVisible(filePath);
				}
			}
		});
		oRunConfigControl.addContent(oTvFioriLp);
	},

	_addPreviewFrameSection: function(oController, oRunConfigControl) {
		// Title
		var oTtlPreview = new sap.ui.core.Title({
			text: "{i18n>run_config_ui_preview_frame_title}",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		});
		oRunConfigControl.addContent(oTtlPreview);

		// CheckBox - Open with frame 
		var oCbPreview = new sap.ui.commons.CheckBox({
			path: "/previewMode",
			text: "{i18n>lbl_run_config_ui_preview_frame_cb}",
			change: function(e) {
				oController.updateCB(e, "/previewMode", e.getParameter("checked"), [0, 1]);
			},
			checked: {
				path: "/previewMode",
				formatter: function(x) {
					return (x === 0);
				}
			},
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		});
		oRunConfigControl.addContent(oCbPreview);
	},

	_addMockDataSection: function(oController, oRunConfigControl) {
		// Title
		var oTtlMock = new sap.ui.core.Title({
			text: "{i18n>title_run_config_ui_mock_data}",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		});
		oRunConfigControl.addContent(oTtlMock);

		// CheckBox - Open with mock data 
		var oCbMock = new sap.ui.commons.CheckBox({
			tooltip: {
				path: "/filePath",
				formatter: function(filePath) {
					if (!this.getModel("i18n")) {
						return "";
					}
					if (filePath != null && (jQuery.sap.endsWith(filePath, "Component.js") ||
						(new RegExp(".*fiorisandboxconfig.*[.]json", "i").test(filePath)))) {
						return this.getModel("i18n").getResourceBundle().getText("mock_info_msg");
					}
					return this.getModel("i18n").getResourceBundle().getText("lbl_run_config_ui_mock_data_cb");
				}
			},
			text: "{i18n>lbl_run_config_ui_mock_data_cb}",
			change: function(e) {
				oController.updateCB(e, "/dataMode", e.getParameter("checked"), [0, 1]);
			},
			checked: {
				path: "/dataMode",
				formatter: function(x) {
					return (x === 0);
				}
			},
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		});
		oRunConfigControl.addContent(oCbMock);
	},

	_addResourceMappingSection: function(oController, oRunConfigControl) {
		// Title
		var oTtlA2a = new sap.ui.core.Title({
			text: "{i18n>title_run_config_ui_a2a_forwarding}",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		});
		oRunConfigControl.addContent(oTtlA2a);

		// CheckBox
		var oCBA2a = new sap.ui.commons.CheckBox({
			text: "{i18n>lbl_run_config_ui_a2a_workspace_rb}",
			tooltip: "{i18n>lbl_run_config_ui_a2a_workspace_rb}",
			checked: {
				path: "/workspace",
				formatter: function(e) {
					return e === "withoutWorkspace" ? false : true;
				}
			},
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			}),
			change: $.proxy(oController.onResourceMappingChange, oController)
		});
		oRunConfigControl.addContent(oCBA2a);

		// Main Grid
		var oMainGrid = new sap.ui.layout.Grid({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			})
		});
		oRunConfigControl.addContent(oMainGrid);

		// Get Button
		var oGetVersionsFromHcpButton = new sap.ui.commons.Button({
			text: "{i18n>lbl_run_config_ui_a2a_get_libs_versions}",
			tooltip: "{i18n>lbl_run_config_ui_a2a_get_libs_versions}",
			layoutData: new sap.ui.layout.GridData({
				span: "L3 M3 S3"
			}),
			press: [
				function() {
					oMainGrid.setBusy(true);
					oController.getLibVersions().then(function(result) {
						var oModel = oController._oRunConfigurationUiFragment.getModel();
						oModel.setProperty("/appsVersion", result);
						oMainGrid.setBusy(false);
					});
            },
				oController]
		}).addStyleClass("riverControlSmall ");

		// Grid
		var oGetVersionsGrid = new sap.ui.layout.Grid({
			vSpacing: 0,
			hSpacing: 0,
			width: "100%",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			}),
			content: [oGetVersionsFromHcpButton]
		});
		oMainGrid.addContent(oGetVersionsGrid);

		var oLibName = new sap.ui.commons.Label({
			text: "{i18n>lbl_run_config_ui_a2a_lib_name}",
			design: "Bold",
			textAlign: "Begin",
			width: "100%",
			layoutData: new sap.ui.layout.GridData({
				span: "L5 M5 S5"
			})
		});

		var oLibVersion = new sap.ui.commons.Label({
			text: "{i18n>lbl_run_config_ui_a2a_lib_version}",
			design: "Bold",
			width: "100%",
			layoutData: new sap.ui.layout.GridData({
				span: "L5 M5 S5"
			})
		});

		// header Grid
		var oHeaderGrid = new sap.ui.layout.Grid({
			content: [oLibName, oLibVersion],
			width: "100%",
			vSpacing: 0,
			hSpacing: 1,
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		}).addStyleClass("SAPIdePreviewAppParams");

		// body Grid
		var oGrid = new sap.ui.layout.Grid({
			width: "100%",
			vSpacing: 0,
			hSpacing: 0,
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		});

		//create the template control that will be repeated and will display the data
		var oRowTemplate = this._getLibraryVersionLineTemplate(oController);

		oGrid.bindAggregation("content", {
			path: "/appsVersion",
			template: oRowTemplate
		});

		// appsVersion Grid
		var oappsVersionGrid = new sap.ui.layout.Grid({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			visible: {
				path: "/appsVersion",
				formatter: function(appsVersion) {
					if (appsVersion && appsVersion.length) {
						return true;
					}
					return false;
				}
			},
			content: [oHeaderGrid, oGrid]
		});
		oMainGrid.addContent(oappsVersionGrid);

	},

	_getLibraryVersionLineTemplate: function(oController) {
		var oLibName = new sap.ui.commons.TextField({
			width: "100%",
			value: "{libraryName}",
			enabled: false,
			layoutData: new sap.ui.layout.GridData({
				span: "L5 M5 S5"
			})
		});

		var oListItemTemplate = new sap.ui.core.ListItem({
			key: "{version}",
			text: "{details}"
		});

		var oLibValue = new sap.ui.commons.DropdownBox({
			width: "100%",
			layoutData: new sap.ui.layout.GridData({
				span: "L5 M5 S5"
			}),
			displaySecondaryValues: true,
			value: "{detailVersion}",
			change: [oController.onLibVersionChange, oController],
			enabled: {
				path: "libraryVersion",
				formatter: function(libraryVersion) {
					return libraryVersion === undefined ? false : true;
				}
			}
		}).bindItems("versions", oListItemTemplate);

		var oLineLayout = new sap.ui.layout.Grid({
			width: "100%",
			hSpacing: 1,
			content: [oLibName, oLibValue],
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		}).addStyleClass("SAPIdePreviewAppParams");

		return oLineLayout;
	},

	_addUI5VersionSection: function(oController, oRunConfigControl) {
		// Title
		var oUI5VersionTitle = new sap.ui.core.Title({
			text: "{i18n>title_run_config_ui_a2a_ui5version}",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		});
		oRunConfigControl.addContent(oUI5VersionTitle);

		// DropDown Box
		var oVersionDropDown = new sap.ui.commons.DropdownBox({
			enabled: false,
			busy: true,
			layoutData: new sap.ui.layout.GridData({
				span: "L7 M6 S12"
			}),
			change: [oController.onUI5VersionChange, oController]
		});

		var oEmptyLabel = new sap.ui.commons.Label({
			layoutData: new sap.ui.layout.GridData({
				span: "L9 M8 S1"
			})
		});

		//Radio Button Group
		var oRBG = new sap.ui.commons.RadioButtonGroup({
			layoutData: new sap.ui.layout.GridData({
				span: "L3 M4 S12"
			}),
			select: function() {
				oController.onRadioButtonSelection(this, oVersionDropDown);
			}
		});

		//Radio Button - Use application version
		var oRB1 = new sap.ui.core.Item({
			text: "{i18n>lbl_radio_button_ui5version_default}",
			tooltip: "{i18n>tlt_radio_button_ui5version_default}",
			layoutData: new sap.ui.layout.GridData({
				span: "L8 M8 S12"
			})
		});
		oRBG.addItem(oRB1);

		//Radio Button - Use customize version
		var oRB2 = new sap.ui.core.Item({
			text: "{i18n>lbl_radio_button_ui5version_customize}",
			tooltip: "{i18n>tlt_radio_button_ui5version_customize}",
			layoutData: new sap.ui.layout.GridData({
				span: "L8 M8 S12"
			})
		});
		oRBG.addItem(oRB2);

		oRunConfigControl.addContent(oRBG);

		oRunConfigControl.addContent(oEmptyLabel);

		oRunConfigControl.addContent(oVersionDropDown);

		oRBG.addEventDelegate({
			onAfterRendering: $.proxy(oController.onAfterRBGRendering, oController)
		}, oRBG);

		oVersionDropDown.addEventDelegate({
			onAfterRendering: $.proxy(oController.onAfterDropDownRendering, oController)
		}, oVersionDropDown);
	},

	_addApplUrlParamsSection: function(oController, oRunConfigControl) {

		// Title
		var oAddParameterTitle = new sap.ui.core.Title({
			text: "{i18n>app_params_settings_title}",
			tooltip: "{i18n>tlt_app_params_settings_title}",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		});

		oRunConfigControl.addContent(oAddParameterTitle);

		// Grid
		var oEnabled = new sap.ui.commons.Label({
			text: "{i18n>lbl_params_proj_settings_enabled}",
			textAlign: "Begin",
			design: "Bold",
			width: "100%",
			layoutData: new sap.ui.layout.GridData({
				span: "L1 M1 S1"
			})
		});

		var oParamName = new sap.ui.commons.Label({
			text: "{i18n>lbl_params_proj_settings_param_name}",
			design: "Bold",
			textAlign: "Begin",
			width: "100%",
			layoutData: new sap.ui.layout.GridData({
				span: "L5 M5 S5"
			})
		});

		var oParamValue = new sap.ui.commons.Label({
			text: "{i18n>lbl_params_proj_settings_param_value}",
			design: "Bold",
			width: "100%",
			layoutData: new sap.ui.layout.GridData({
				span: "L5 M5 S5"
			})
		});

		// header grid
		var oHeaderGrid = new sap.ui.layout.Grid({
			content: [oEnabled, oParamName, oParamValue],
			width: "100%",
			vSpacing: 0,
			hSpacing: 1,
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		}).addStyleClass("SAPIdePreviewAppParams");

		// body grid
		var oGrid = new sap.ui.layout.Grid({
			width: "100%",
			vSpacing: 0,
			hSpacing: 0,
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		});

		//create the template control that will be repeated and will display the data
		var oRowTemplate = this._addParamLineTemplate(oController);

		oGrid.bindAggregation("content", {
			path: "/urlParameters",
			template: oRowTemplate
		});

		// add button
		var oAddNewParamButton = new sap.ui.commons.Button({
			text: "{i18n>lbl_params_proj_settings_add_param}",
			tooltip: "{i18n>tlt_params_proj_settings_add_param}",
			layoutData: new sap.ui.layout.GridData({
				span: "L3 M3 S3"
			}),
			press: this._oController.createNewParameterLine
		}).addStyleClass("riverControlSmall ");

		// grid
		var oAddLineGrid = new sap.ui.layout.Grid({
			vSpacing: 0,
			hSpacing: 0,
			width: "100%",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			}),
			content: [oAddNewParamButton]
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
			value: "{/hashParameter}",
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
		var oMainGrid = new sap.ui.layout.Grid({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			content: [oAddLineGrid, oHeaderGrid, oGrid, oHashGrid]
		});

		oRunConfigControl.addContent(oMainGrid);
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
	},
	
	_addBackendSystemSection: function(oController, oRunConfigControl) {
		
		//oController._setBackendState(false);
		
		// Title
		var oChooseBackendSystemTitle = new sap.ui.core.Title({
			text: "{i18n>backend_system_change_title}",
			tooltip: "{i18n>tlt_backend_system_change_title}",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		});

		oRunConfigControl.addContent(oChooseBackendSystemTitle);
		
		// info grid
		var oEmptyBEGrid = new sap.ui.layout.Grid({
			width: "100%",
			vSpacing: 0,
			hSpacing: 1,
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			}),
			visible : {
					path: "/backendSystem",
					formatter: function(aBackendSystems) {
						if (aBackendSystems){
							if (aBackendSystems.length === 0){
								return true;
							}
							return false;
						}
					}
				}
		}).addStyleClass("SAPIdePreviewAppParams");
		
		
			// header grid
		var oHeaderGrid = new sap.ui.layout.Grid({
				width: "100%",
				vSpacing: 0,
				hSpacing: 1,
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				}),
				visible : {
					path: "/backendSystem",
					formatter: function(aBackendSystems) {
						if (aBackendSystems){
							if (aBackendSystems.length === 0){
								return false;
							}
							return true;
						}
					}
				}
		}).addStyleClass("SAPIdePreviewAppParams");
		
	
		var oBackendsForApp = new sap.ui.commons.Label({
				text: "{i18n>lbl_backend_system_change_source}",
				textAlign: "Begin",
				design: "Bold",
				width: "100%",
				layoutData: new sap.ui.layout.GridData({
					span: "L3 M3 S3"
				})
		});
			
		var oBackendsToChoose = new sap.ui.commons.Label({
				text: "{i18n>lbl_backend_system_change_target}",
				design: "Bold",
				textAlign: "Begin",
				width: "100%",
				layoutData: new sap.ui.layout.GridData({
					span: "L6 M6 S6"
				})
		});
			
		oHeaderGrid.addContent(oBackendsForApp);
		oHeaderGrid.addContent(oBackendsToChoose);

		var oErrorMessage = new sap.ui.commons.Label({
				text: "{i18n>switchbackends_noBackends_msg}",
				textAlign: "Begin",
				design: "Standard",
				width: "100%",
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				})
		});
			
		oEmptyBEGrid.addContent(oErrorMessage);

		// body grid
		var oBodyGrid = new sap.ui.layout.Grid({
			width: "100%",
			vSpacing: 0,
			hSpacing: 0,
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		});

	//create the list of exesiting BE susytems in the Neo-app.json file
	var oRowTemplate = this._addAvailableBackends(oController);
	
	oBodyGrid.bindAggregation("content", {
			path: "/backendSystem",
			template: oRowTemplate
		});
       
		// main grid
		var oMainGrid = new sap.ui.layout.Grid({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			content: [oHeaderGrid, oEmptyBEGrid, oBodyGrid]
		});

		oRunConfigControl.addContent(oMainGrid);
	},
	
	
	_addAvailableBackends: function(oController) {
		
		var oSourceBackend = new sap.ui.commons.Label({
			text: "{source}",
			textAlign: "Begin",
			width: "100%",
			layoutData: new sap.ui.layout.GridData({
				span: "L3 M3 S3"
			})
		});
		
		var oTargetBackend = new sap.ui.commons.DropdownBox({
			width: "100%",
			layoutData: new sap.ui.layout.GridData({
				span: "L6 M6 S6"
			}),
			displaySecondaryValues: true,
			change: [oController.onBackendChange, oController]
		});
			
		oTargetBackend.addEventDelegate({
			onAfterRendering: $.proxy(oController.onAfterBackendDropDownRendering, oController)
		}, oTargetBackend);
		
		oTargetBackend.setValue(oSourceBackend.text);
		
		var oLineLayout = new sap.ui.layout.Grid({
			width: "100%",
			hSpacing: 1,
			content: [oSourceBackend, oTargetBackend],
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		}).addStyleClass("SAPIdePreviewAppParams");

		return oLineLayout;
	}
});