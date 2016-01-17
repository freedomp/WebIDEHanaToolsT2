sap.ui.jsview("sap.watt.saptoolsets.fiori.common.plugin.applicationstatus.view.ApplicationStatusDialog", {

	// Specifies the Controller belonging to this View. 
	getControllerName: function() {
		return "sap.watt.saptoolsets.fiori.common.plugin.applicationstatus.view.ApplicationStatusDialog";
	},

	// Called once after the Controller has been instantiated. It is the place where the UI is constructed.
	createContent: function(oController) {
	    
	    sap.watt.includeCSS(require.toUrl("sap.watt.saptoolsets.fiori.common.applicationstatus/css/applicationstatus.css"));
	    
	    /******************** Start - ABAP Section ********************/
	    
	    // "The selected application is deployed on SAPUI5 ABAP Repository"
		var oABAPDeployDescriptionLabel = new sap.ui.commons.Label({
			text: "{i18n>openStatusDialog_abapdeploydescription}",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		});

		var oABAPDeployDescriptionGrid = new sap.ui.layout.Grid({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			vSpacing: 0,
			content: [oABAPDeployDescriptionLabel]
		});

		// "System"
		var oABAPDestinationLabel = new sap.ui.commons.Label({
			text: "{i18n>openStatusDialog_system}",
			layoutData: new sap.ui.layout.GridData({
				span: "L4 M4 S4"
			})
		});

		var oABAPDestinationText = new sap.ui.commons.TextField({
			value: "{abapdestination}",
			width: "100%",
			editable: false,
			enabled: false,
			layoutData: new sap.ui.layout.GridData({
				span: "L8 M8 S8"
			})
		});

		var oABAPDestinationGrid = new sap.ui.layout.Grid({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			vSpacing: 0,
			content: [oABAPDestinationLabel, oABAPDestinationText]
		});

		// "Application Name"
		var oABAPAppNameLabel = new sap.ui.commons.Label({
			text: "{i18n>openStatusDialog_appname}",
			layoutData: new sap.ui.layout.GridData({
				span: "L4 M4 S4"
			})
		});

		var oABAPAppNameText = new sap.ui.commons.TextField({
			value: "{abapdeployedappname}",
			width: "100%",
			editable: false,
			enabled: false,
			layoutData: new sap.ui.layout.GridData({
				span: "L8 M8 S8"
			})
		});

		var oABAPAppNameGrid = new sap.ui.layout.Grid({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			vSpacing: 0,
			content: [oABAPAppNameLabel, oABAPAppNameText]
		});
		
		// "Package"
		var oABAPPackageLabel = new sap.ui.commons.Label({
			text: "{i18n>openStatusDialog_package}",
			layoutData: new sap.ui.layout.GridData({
				span: "L4 M4 S4"
			})
		});

		var oABAPPackageText = new sap.ui.commons.TextField({
			value: "{abappackage}",
			width: "100%",
			editable: false,
			enabled: false,
			layoutData: new sap.ui.layout.GridData({
				span: "L8 M8 S8"
			})
		});

		var oABAPPackageGrid = new sap.ui.layout.Grid({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			vSpacing: 0,
			content: [oABAPPackageLabel, oABAPPackageText]
		});
		
		// "The selected application is not deployed to SAPUI5 ABAP Repository"
		var oNotABAPDeployDescriptionLabel = new sap.ui.commons.TextView({
			text: "{i18n>openStatusDialog_notabapdeploydescription}",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		});

		var oNotABAPDeployDescriptionGrid = new sap.ui.layout.Grid({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			vSpacing: 0,
			content: [oNotABAPDeployDescriptionLabel]
		});
		
		var oABAPDeployButton = new sap.ui.commons.Button({
			text: "{i18n>ApplicationStatusDialog_deploy}",
			visible: "{isabapdeploybtnvisible}",
			press: [oController._openABAPDeployWizard, oController]
		}).addStyleClass("applicationStatusButton");
		
		var oABAPDeployButtonGrid = new sap.ui.layout.Grid({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			vSpacing: 0,
			content: [oABAPDeployButton]
		});
	    
	    /******************** End - ABAP Section ********************/
	    
	    
	    /******************** Start - HCP Section ********************/

		// "The selected application is deployed on SAP HANA Cloud Platform"
		var oDeployDescriptionLabel = new sap.ui.commons.Label({
			text: "{i18n>openStatusDialog_deploydescription}",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		});

		var oDeployDescriptionGrid = new sap.ui.layout.Grid({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			vSpacing: 0,
			content: [oDeployDescriptionLabel]
		});
		
		// "Application Name"
		var oAppNameLabel = new sap.ui.commons.Label({
			text: "{i18n>openStatusDialog_appname}",
			layoutData: new sap.ui.layout.GridData({
				span: "L4 M4 S4"
			})
		});

		var oAppNameText = new sap.ui.commons.TextField({
			value: "{deployedappname}",
			width: "100%",
			editable: false,
			enabled: false,
			layoutData: new sap.ui.layout.GridData({
				span: "L8 M8 S8"
			})
		});

		var oAppNameGrid = new sap.ui.layout.Grid({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			vSpacing: 0,
			content: [oAppNameLabel, oAppNameText]
		});

		// "Account Name"
		var oAccountNameLabel = new sap.ui.commons.Label({
			text: "{i18n>openStatusDialog_accountname}",
			layoutData: new sap.ui.layout.GridData({
				span: "L4 M4 S4"
			})
		});

		var oAccountNameText = new sap.ui.commons.TextField({
			value: "{account}",
			width: "100%",
			editable: false,
			enabled: false,
			layoutData: new sap.ui.layout.GridData({
				span: "L8 M8 S8"
			})
		});

		var oAccountNameGrid = new sap.ui.layout.Grid({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			vSpacing: 0,
			content: [oAccountNameLabel, oAccountNameText]
		});

		// "State"
		var oStateLabel = new sap.ui.commons.Label({
			text: "{i18n>openStatusDialog_state}",
			layoutData: new sap.ui.layout.GridData({
				span: "L4 M4 S4"
			})
		});

		var oStateText = new sap.ui.commons.TextField({
			value: "{appstate}",
			width: "100%",
			editable: false,
			enabled: false,
			layoutData: new sap.ui.layout.GridData({
				span: "L8 M8 S8"
			})
		});

		var oStateGrid = new sap.ui.layout.Grid({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			vSpacing: 0,
			content: [oStateLabel, oStateText]
		});

		// "URL"
		var oURLLabel = new sap.ui.commons.Label({
			text: "{i18n>openStatusDialog_url}",
			layoutData: new sap.ui.layout.GridData({
				span: "L4 M4 S4"
			})
		});

		var commitAppLink = new sap.ui.commons.Link({
			text: "{commiturl}",
			tooltip: "{commiturl}",
			target: "_blank",
			href: "{commiturl}"
		}).addStyleClass("applicationUrlLink");
		
		this.oCommitHtmlTextArea = new sap.ui.commons.FormattedTextView({
			layoutData: new sap.ui.layout.GridData({
				span: "L8 M8 S8"
			})
		});
		
		// set the text with placeholders inside
		this.oCommitHtmlTextArea.setHtmlText(" <embed data-index=\"0\"> ");
		// add the desired control to the oHtmlTextArea 
		this.oCommitHtmlTextArea.addControl(commitAppLink);

		var activeAppLink = new sap.ui.commons.Link({
			text: "{activeurl}",
			tooltip: "{activeurl}",
			target: "_blank",
			href: "{activeurl}"
		}).addStyleClass("applicationUrlLink");

		this.oActiveHtmlTextArea = new sap.ui.commons.FormattedTextView({
			layoutData: new sap.ui.layout.GridData({
				span: "L8 M8 S8"
			})
		});
		
		// set the text with placeholders inside
		this.oActiveHtmlTextArea.setHtmlText(" <embed data-index=\"0\"> ");
		// add the desired control to the oHtmlTextArea 
		this.oActiveHtmlTextArea.addControl(activeAppLink);

		this.oURLGrid = new sap.ui.layout.Grid({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			vSpacing: 0,
			content: [oURLLabel]
		});

		// "Versions"
		var oVersionsLabel = new sap.ui.commons.Label({
			text: "{i18n>openStatusDialog_versions}",
			layoutData: new sap.ui.layout.GridData({
				span: "L4 M4 S4"
			})
		});

		var oVersionsTable = new sap.ui.table.Table({
			visibleRowCount: 2,
			showNoData: false,
			layoutData: new sap.ui.layout.GridData({
				span: "L8 M8 S8"
			})
		});

		// "Version"
		oVersionsTable.addColumn(new sap.ui.table.Column({
			label: new sap.ui.commons.Label({
				text: "{i18n>openStatusDialog_versioncolumn}",
				design: "Bold"
			}),
			template: new sap.ui.commons.TextView().bindProperty("text", "version")
		}));

		// "Active"
		oVersionsTable.addColumn(new sap.ui.table.Column({
			label: new sap.ui.commons.Label({
				text: "{i18n>openStatusDialog_activecolumn}",
				design: "Bold"
			}),
			template: new sap.ui.commons.Label({
				icon: "sap-icon://accept",
				visible: "{isActiveVersion}"
			})
		}));

		var oTableGrid = new sap.ui.layout.Grid({
			content: [oVersionsLabel, oVersionsTable],
			vSpacing: 0
		});

		oVersionsTable.bindRows("/modelData/versions");
		
		// "The selected application is not deployed on SAP HANA Cloud Platform"
		var oNotDeployDescriptionLabel = new sap.ui.commons.TextView({
			text: "{i18n>openStatusDialog_notdeploydescription}",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		});

		var oNotDeployDescriptionGrid = new sap.ui.layout.Grid({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			vSpacing: 0,
			content: [oNotDeployDescriptionLabel]
		});

		// "Note: The selected application was already deployed but has been deleted from SAP HANA Cloud Platform cockpit"
		var oNotDeployNoteLabel = new sap.ui.commons.TextView({
			width: "100%",
			text: "{i18n>openStatusDialog_notdeploydnote}",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			}),
			wrapped: true
		}).addStyleClass("infoTextView");

		var oNotDeployNoteGrid = new sap.ui.layout.Grid({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			vSpacing: 0,
			content: [oNotDeployNoteLabel]
		});
		
		var oHCPDeployButton = new sap.ui.commons.Button({
			text: "{i18n>ApplicationStatusDialog_deploy}",
			visible: "{ishcpdeploybtnvisible}",
			press: [oController._openHCPDeployDialog, oController]
		}).addStyleClass("applicationStatusButton");
		
		var oHCPDeployButtonGrid = new sap.ui.layout.Grid({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			vSpacing: 0,
			content: [oHCPDeployButton]
		});
		
		/******************** End - HCP Section ********************/
		
		
		/******************** Start - FLP Section ********************/

		// "The selected application is registered on SAP Fiori launchpad"
		var oRegisterDescriptionLabel = new sap.ui.commons.Label({
			text: "{i18n>openStatusDialog_registerdescription}",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		});

		var oRegisterDescriptionGrid = new sap.ui.layout.Grid({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			vSpacing: 0,
			content: [oRegisterDescriptionLabel]
		});

		// "Provider Account"
		var oProviderAccountLabel = new sap.ui.commons.Label({
			text: "{i18n>openStatusDialog_provideraccount}",
			layoutData: new sap.ui.layout.GridData({
				span: "L4 M4 S4"
			})
		});

		// providers DropdownBox
		this.providerAccountComboBox = new sap.ui.commons.DropdownBox({
			width: "100%",
			change: [oController._onDropBoxChange, oController],
			accessibleRole: sap.ui.core.AccessibleRole.Combobox,
			layoutData: new sap.ui.layout.GridData({
				span: "L8 M8 S8"
			})
		});

		var oProviderContent = new sap.ui.layout.Grid({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			vSpacing: 0,
			content: [oProviderAccountLabel, this.providerAccountComboBox]
		});

		// "Title"
		var oTileLabel = new sap.ui.commons.Label({
			text: "{i18n>openStatusDialog_title}",
			layoutData: new sap.ui.layout.GridData({
				span: "L4 M4 S4"
			})
		});

		var oTileText = new sap.ui.commons.TextField({
			width: "100%",
			value: "{tile}",
			editable: false,
			enabled: false,
			layoutData: new sap.ui.layout.GridData({
				span: "L8 M8 S8"
			})
		});

		var oTileGrid = new sap.ui.layout.Grid({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			vSpacing: 0,
			content: [oTileLabel, oTileText]
		});

		// "Application Name"
		var oAppLabel = new sap.ui.commons.Label({
			text: "{i18n>openStatusDialog_appname}",
			layoutData: new sap.ui.layout.GridData({
				span: "L4 M4 S4"
			})
		});

		var oAppText = new sap.ui.commons.TextField({
			width: "100%",
			value: "{flpappname}",
			editable: false,
			enabled: false,
			layoutData: new sap.ui.layout.GridData({
				span: "L8 M8 S8"
			})
		});

		var oAppGrid = new sap.ui.layout.Grid({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			vSpacing: 0,
			content: [oAppLabel, oAppText]
		});

		// "Application URL"
		var oAppURLLabel = new sap.ui.commons.Label({
			text: "{i18n>openStatusDialog_appurl}",
			layoutData: new sap.ui.layout.GridData({
				span: "L4 M4 S4"
			})
		});

		var oAppURLLink = new sap.ui.commons.Link({
			text: "{appurl}",
			tooltip: "{appurl}",
			target: "_blank",
			href: "{appurl}"
		}).addStyleClass("applicationUrlLink");

		this.oAppURLHtmlTextArea = new sap.ui.commons.FormattedTextView({
			layoutData: new sap.ui.layout.GridData({
				span: "L8 M8 S8"
			})
		});
		this.oAppURLHtmlTextArea.setHtmlText(" <embed data-index=\"0\"> ");
		this.oAppURLHtmlTextArea.addControl(oAppURLLink);

		var oAppURLGrid = new sap.ui.layout.Grid({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			vSpacing: 0,
			content: [oAppURLLabel, this.oAppURLHtmlTextArea]
		});

		// "SAP Fiori launchpad URL"
		var oFLPURLLabel = new sap.ui.commons.Label({
			text: "{i18n>openStatusDialog_flpurl}",
			layoutData: new sap.ui.layout.GridData({
				span: "L4 M4 S4"
			})
		});

		var oFLPURLLink = new sap.ui.commons.Link({
			text: "{flpurl}",
			tooltip: "{flpurl}",
			target: "_blank",
			href: "{flpurl}"
		}).addStyleClass("applicationUrlLink");

		this.oFLPURLHtmlTextArea = new sap.ui.commons.FormattedTextView({
			layoutData: new sap.ui.layout.GridData({
				span: "L8 M8 S8"
			})
		});
		this.oFLPURLHtmlTextArea.setHtmlText(" <embed data-index=\"0\"> ");
		this.oFLPURLHtmlTextArea.addControl(oFLPURLLink);

		var oFLPURLGrid = new sap.ui.layout.Grid({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			vSpacing: 0,
			content: [oFLPURLLabel, this.oFLPURLHtmlTextArea]
		});

		// "The selected application is not registered on SAP Fiori launchpad"
		var oNotRegisterDescriptionLabel = new sap.ui.commons.TextView({
			text: "{i18n>openStatusDialog_notregisterdescription}",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		});

		var oNotRegisterDescriptionGrid = new sap.ui.layout.Grid({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			vSpacing: 0,
			content: [oNotRegisterDescriptionLabel]
		});
		
		var oFLPDeployButton = new sap.ui.commons.Button({
			text: "{i18n>ApplicationStatusDialog_register}",
			visible: "{isflpbtnvisible}",
			enabled: "{isbtnenabled}",
			press: [oController._openFLPWizard, oController]
		}).addStyleClass("applicationStatusButton");
		
		var oFLPDeployButtonGrid = new sap.ui.layout.Grid({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			vSpacing: 0,
			content: [oFLPDeployButton]
		});
		
		/******************** End - FLP Section ********************/
		
		var oDialogForm = new sap.ui.layout.form.Form({
			layout: new sap.ui.layout.form.ResponsiveGridLayout(),
			formContainers: [new sap.ui.layout.form.FormContainer({ // container for not deployed app in ABAP
				title: "{i18n>openStatusDialog_abaptitle}", // "SAPUI5 ABAP Repository"
				expandable: false,
				visible: "{isnotabapdeployed}",
				formElements: [new sap.ui.layout.form.FormElement({
					fields: [oNotABAPDeployDescriptionGrid],
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12"
					})
				})]
			}), new sap.ui.layout.form.FormContainer({ // "Deploy" Button (to ABAP)
				expandable: false,
				visible: "{isabapdeploybtnvisible}",
				formElements: [new sap.ui.layout.form.FormElement({
					fields: [oABAPDeployButtonGrid],
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12"
					})
				})]
			}), new sap.ui.layout.form.FormContainer({ // container for deployed app in ABAP
				title: "{i18n>openStatusDialog_abaptitle}", // "SAPUI5 ABAP Repository"
				expandable: false,
				visible: "{isabapdeployed}",
				formElements: [new sap.ui.layout.form.FormElement({
					fields: [oABAPDeployDescriptionGrid],
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12"
					})
				}), new sap.ui.layout.form.FormElement({
					fields: [oABAPDestinationGrid],
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12"
					})
				}), new sap.ui.layout.form.FormElement({
					fields: [oABAPAppNameGrid],
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12"
					})
				}), new sap.ui.layout.form.FormElement({
					fields: [oABAPPackageGrid],
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12"
					})
				})]
			}), new sap.ui.layout.form.FormContainer({ // container for deployed app in HCP
				title: "{i18n>openStatusDialog_hcptitle}", // "SAP HANA Cloud Platform"
				expandable: false,
				visible: "{isdeployed}",
				formElements: [new sap.ui.layout.form.FormElement({
					fields: [oDeployDescriptionGrid],
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12"
					})
				}), new sap.ui.layout.form.FormElement({
					fields: [oAccountNameGrid],
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12"
					})
				}), new sap.ui.layout.form.FormElement({
					fields: [oAppNameGrid],
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12"
					})
				}), new sap.ui.layout.form.FormElement({
					fields: [oStateGrid],
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12"
					})
				}), new sap.ui.layout.form.FormElement({
					fields: [this.oURLGrid],
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12"
					})
				}), new sap.ui.layout.form.FormElement({
					fields: [oTableGrid],
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12"
					})
				})]
			}), new sap.ui.layout.form.FormContainer({ // container for registered app in FLP
				title: "{i18n>openStatusDialog_flptitle}", // "SAP Fiori Launchpad"
				expandable: false,
				visible: "{isregister}" , 
				formElements: [new sap.ui.layout.form.FormElement({
					fields: [oRegisterDescriptionGrid],
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12"
					})
				}), new sap.ui.layout.form.FormElement({
					fields: [oProviderContent],
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12"
					})
				}), new sap.ui.layout.form.FormElement({
					fields: [oAppGrid],
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12"
					})
				}), new sap.ui.layout.form.FormElement({
					fields: [oTileGrid],
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12"
					})
				}), new sap.ui.layout.form.FormElement({
					fields: [oAppURLGrid],
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12"
					})
				}), new sap.ui.layout.form.FormElement({
					fields: [oFLPURLGrid],
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12"
					})
				})]
			}), new sap.ui.layout.form.FormContainer({
				title: "{i18n>openStatusDialog_flptitle}", // "SAP Fiori Launchpad"
				expandable: false,
				visible: false , //TODO: change it back to: "{isnotregister}", after flp team will fix getHTML5app API in scenario 2 (common model)
				formElements: [new sap.ui.layout.form.FormElement({
					fields: [oNotRegisterDescriptionGrid],
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12"
					})
				})]
			}), new sap.ui.layout.form.FormContainer({ // "Register" Button
				expandable: false,
				visible: false , //TODO: change it back to: "{isflpbtnvisible}", after flp team will fix getHTML5app API in scenario 2 (common model)
				formElements: [new sap.ui.layout.form.FormElement({
					fields: [oFLPDeployButtonGrid],
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12"
					})
				})]
			}), new sap.ui.layout.form.FormContainer({
				title: "{i18n>openStatusDialog_hcptitle}", // "SAP HANA Cloud Platform"
				expandable: false,
				visible: "{isnotdeployed}",
				formElements: [new sap.ui.layout.form.FormElement({
					fields: [oNotDeployDescriptionGrid],
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12"
					})
				})]
			}), new sap.ui.layout.form.FormContainer({
				expandable: false,
				visible: "{isnotdeployednote}",
				formElements: [new sap.ui.layout.form.FormElement({
					fields: [oNotDeployNoteGrid],
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12"
					})
				})]
			}), new sap.ui.layout.form.FormContainer({ // "Deploy" Button (to HCP)
				expandable: false,
				visible: "{ishcpdeploybtnvisible}",
				formElements: [new sap.ui.layout.form.FormElement({
					fields: [oHCPDeployButtonGrid],
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12"
					})
				})]
			})]
		}).addStyleClass("dialogContent");

		this._oDlg = new sap.ui.commons.Dialog({
			title: "{i18n>openStatusDialog_header}", // "Application Status"
			width: "750px",
			modal: true,
			resizable: false, // MK: do not change to "true", it makes the dialog messy
			keepInWindow: true,
			content: [oDialogForm],
			buttons: [new sap.ui.commons.Button({
				text: "{i18n>ApplicationStatusDialog_close}", // "Close"
				press: [oController._close, oController]
			})]
		}).addStyleClass("applicationStatusDialog");

		return undefined;
	}
});