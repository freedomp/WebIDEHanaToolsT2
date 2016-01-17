sap.ui.jsview("sap.watt.saptoolsets.fiori.hcp.plugin.deployment.view.DeploymentDialog", {

	getControllerName: function() {
		return "sap.watt.saptoolsets.fiori.hcp.plugin.deployment.view.DeploymentDialog";
	},

	createContent: function(oController) {
	    
	    sap.watt.includeCSS(require.toUrl("sap.watt.saptoolsets.fiori.hcp.deployment/css/deployment.css"));
	    
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

		//account
		var heliumAccountLabel = new sap.ui.commons.Label("heliumaccountlabel", {
			text: "{i18n>heliumAccountLabel}",
			required:  {
 				parts: ["mode"],
 				formatter: function(sMode) {
 					return ((sMode === "deploy") || (sMode === "deletedGitNotExists"));
 				}
			},
			layoutData: new sap.ui.layout.GridData({
				span: "L3 M3 S3"
			})
		});
		
		this.heliumAccountCombobox = new sap.ui.commons.DropdownBox({
			layoutData: new sap.ui.layout.GridData({
					span: "L9 M9 S9"
			}),
			width: "100%",
			change: [oController._onAccountChange, oController],
			accessibleRole: sap.ui.core.AccessibleRole.Combobox
		
		});
		this.heliumAccountCombobox.setEditable(true);
		
		var heliumAccountContent = new sap.ui.layout.Grid({
    		width: "100%",
    		layoutData: new sap.ui.layout.GridData({
    			span: "L12 M12 S12",
    			linebreak: true
    		}),
    		vSpacing: 0,
    		content: [heliumAccountLabel, this.heliumAccountCombobox]
		});
		
		//Project name
		var projectNameLabel = new sap.ui.commons.Label("appnameLabel", {
			text: "{i18n>setting_appname}",
			layoutData: new sap.ui.layout.GridData({
				span: "L3 M3 S3"
			})
		});

		var projectNameTextField = new sap.ui.commons.TextField("appnameField", {
			value: "{str_appname}",
			width: "100%",
			accessibleRole: sap.ui.core.AccessibleRole.Textbox,
			layoutData: new sap.ui.layout.GridData({
				span: "L9 M9 S9"
			}),
			enabled: false
		});

		var projectNameContent = new sap.ui.layout.Grid("appnameContent", {
			width : "100%",
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12",
				linebreak : true
			}),
			vSpacing: 0,
			content : [ projectNameLabel, projectNameTextField ]
		});


		//Application name
		var deployedAppNameLabel = new sap.ui.commons.Label("deployedappnameLabel", {
			text: "{i18n>setting_deployedappname}",
			required:  {
 				parts: ["mode"],
 				formatter: function(sMode) {
 					return (sMode !== "redeploy");
 				}
			},
			layoutData: new sap.ui.layout.GridData({
				span: "L3 M3 S3"
			})
		});

		var deployedAppNameTextField = new sap.ui.commons.TextField("deployedappnameField", {
			value: "{str_deployedappname}",
			width: "100%",
			//application name will be enabled only in case of first deployment or in case the application was deleted from HCP
			enabled: {
 				parts: ["mode"],
 				formatter: function(sMode) {
 					return (sMode !== "redeploy");
 				}
 			},
			liveChange: function(oEvent) {
				oController._handleHeliumAppName(oEvent);
			},
			accessibleRole: sap.ui.core.AccessibleRole.Textbox,
			layoutData: new sap.ui.layout.GridData({
				span: "L9 M9 S9"
			})
		});

		var deployedAppNameContent = new sap.ui.layout.Grid("deployedappnameContent", {
			width : "100%",
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12",
				linebreak : true
			}),
			vSpacing: 0,
			content : [ deployedAppNameLabel, deployedAppNameTextField ]
		});


        //this message will be visible to the user in case the application was previously deployed but then deleted from HCP
		var deletedText = new sap.ui.commons.TextView("deletedText", {
		    width: "100%",
			text: "{deletedText}",
			visible: {
			    parts:["mode"],
			   	formatter: function(sMode) {
					return ((sMode === "deletedGitNotExists") || (sMode === "deletedGitExists"));
				}
			},
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			}),
			vSpacing: 0
		}).addStyleClass("deletedApplicationText");
		
		var notDeployedContent = new sap.ui.layout.Grid("deletedContent", {
			width : "100%",
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12",
				linebreak : true
			}),
			vSpacing: 0,
			content : [ deletedText ]
		});

		var errorTextField = new sap.ui.commons.TextView("errorTextField", {
			width: "100%",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			}),
			vSpacing: 0
		}).addStyleClass("fontSpecial errorTextDeploymentDialog");
		errorTextField.addStyleClass("sapUiHidden");
		
		//message which will be displayed to the user if this is not the first deployment
		var infoTextField = new sap.ui.commons.TextView("infoTextField", {
			width: "100%",
			text: "{i18n>infoTextField}",
			visible: {
			    parts: ["mode"],
			    formatter:function(mode){
			        return (mode === "redeploy");
			    }
			},
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak : true
			}),
			wrapped: true
		}).addStyleClass("infoTextRedeployment");

		var uncommittedTextField = new sap.ui.commons.TextView("uncommittedTextField", {
			width: "100%",
			text: "{i18n>uncommittedChanges}",
			visible: {
				parts: ["isUncommitted"],
				formatter: function(bIsUncommitted){
					return bIsUncommitted;
				}
			},
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			}),
			wrapped: true
		}).addStyleClass("infoUncommittedText");
		
		var infoContent = new sap.ui.layout.Grid("infoContent", {
			width : "100%",
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12",
				linebreak : true
			}),
			vSpacing: 0,
			content : [ infoTextField, uncommittedTextField ]
		});

		//application state (started \ stopped)
		var applicationStateLabel = new sap.ui.commons.Label("applicationstatelabel", {
			text: "{i18n>applicationState}",
			layoutData: new sap.ui.layout.GridData({
				span: "L3 M3 S3"
			})
		});

	    var applicationStateTextField = new sap.ui.commons.TextField("applicationstatetextfield", {
			value: "{applicationState}",
			width: "100%",
			enabled: false,
			accessibleRole: sap.ui.core.AccessibleRole.Textbox,
			layoutData: new sap.ui.layout.GridData({
				span: "L9 M9 S9"
			})
		});
		
		var applicationStateContent = new sap.ui.layout.Grid("applicationStateContent", {
			width : "100%",
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12",
				linebreak : true
			}),
			vSpacing: 0,
			content : [ applicationStateLabel, applicationStateTextField ]
		});

		//application URL 
		var applicationURLLabel = new sap.ui.commons.Label("applicationurllabel", {
			text: "{i18n>applicationURLLabel}",
			layoutData: new sap.ui.layout.GridData({
				span: "L3 M3 S3"
			})
		});
		
        //	activeVersion
		var applicationURLLabelTextField = new sap.ui.commons.Link({
			text: "{applicationURL}",
			href: "{applicationURL}",
			target: "_blank",
			tooltip: "{applicationURL}",
			layoutData: new sap.ui.layout.GridData({
				span: "L9 M9 S9"
			})
		}).addStyleClass("applicationUrlLink");
		
		var applicationURLLabelContent = new sap.ui.layout.Grid("applicationURLContent", {
			width : "100%",
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12",
				linebreak : true
			}),
			vSpacing: 0,
			content : [ applicationURLLabel, applicationURLLabelTextField ]
		});


		//application versions
		var AllApplicationVersionsLabel = new sap.ui.commons.Label("allapplicationversionslabel", {
			text: "{i18n>AllApplicationVersionsLabel}",
			layoutData: new sap.ui.layout.GridData({
				span: "L3 M3 S3"
			})
		});

		//Create an instance of the table control
		var applicationAllVersionsTable = new sap.ui.table.Table({
			visibleRowCount: 2,
			showNoData: false,
			layoutData: new sap.ui.layout.GridData({
				span: "L9 M9 S9"
			})
		});

		var VersionsTableContent = new sap.ui.layout.Grid({
			width: "100%",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			vSpacing: 0,
			content: [AllApplicationVersionsLabel, applicationAllVersionsTable]
		});
		

// 		Define the columns and the control templates to be used
		var oColumn = new sap.ui.table.Column({
			label: new sap.ui.commons.Label({
				text: "{i18n>version_header}",
				design: "Bold"
			}),
			template: "version",
			resizable: false
		});
		applicationAllVersionsTable.addColumn(oColumn);
		
        //this column represent if the versoin is active or inactive 
        //the check will be visible only if isActiveVersion == true
        var oColumn2 = new sap.ui.table.Column({
            label: new sap.ui.commons.Label({
				text: "{i18n>active_header}",
				design: "Bold"
			}),
            resizable: false,
            template: new sap.ui.commons.Label({
                icon: "sap-icon://accept", 
                visible : "{isActiveVersion}"
            })
        });
        applicationAllVersionsTable.addColumn(oColumn2);
        
        //bind the table to rows to the array of all versions we got from in HCP
        applicationAllVersionsTable.bindRows("versions");
	
		var versionLabel = new sap.ui.commons.Label("versionLabel", {
			text: "{i18n>setting_add_version}",
			layoutData: new sap.ui.layout.GridData({
				span: "L3 M3 S3"
			}),
			required: true
		});


        //version - initialy holds the suggested value 
		var versionTextField = new sap.ui.commons.TextField("versionField", {
			value: "{version}",
			width: "100%",
			liveChange: function(oEvent) {
				oController._handleVersion(oEvent);
			},
			accessibleRole: sap.ui.core.AccessibleRole.Textbox,
			layoutData: new sap.ui.layout.GridData({
				span: "L3 M3 S3"
			}),
			enabled: true,
			required: true
		});
		
		var activationCheckBox = new sap.ui.commons.CheckBox("activationCheckBox", {
			text: "{i18n>setting_activate_application}",
			tooltip: "{i18n>activate_application_tooltip}",
			enabled: true,
			checked: "{set_activate}",
			layoutData: new sap.ui.layout.GridData({
				span: "L3 M3 S3"
			}),
			change: function(oEvent) {
				oController._handleActivationCheckBox(oEvent);
			}
		}).addStyleClass("checkboxAlign");

		var versionContent = new sap.ui.layout.Grid("versionContent",{
			width : "100%",
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12",
				linebreak : true
			}),
			vSpacing: 0,
			content : [versionLabel, versionTextField, activationCheckBox]
		});

		this._okButton = new sap.ui.commons.Button({
			text: "{label_okbtn}",
			press: [oController._execute, oController]
		});

        var newApplicationFormContainer = new sap.ui.layout.form.FormContainer({
			title : "{i18n>CreateNewApplication}",
			expandable: false,
			formElements: [new sap.ui.layout.form.FormElement({
				fields: [heliumAccountContent],
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				})
			}), new sap.ui.layout.form.FormElement({
				fields: [projectNameContent],
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				})
			}), new sap.ui.layout.form.FormElement({
				fields: [deployedAppNameContent],
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				})
			}), new sap.ui.layout.form.FormElement({
				fields: [notDeployedContent],
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				})
			})]
		});
		
		var applicationStatusFormContainer = new sap.ui.layout.form.FormContainer("DeployApplicationStatus", {
			title: "{i18n>DeployApplicationStatus}",
			visible: {
				parts: ["mode"],
				formatter: function(sMode) {
					return (sMode === "redeploy") || (sMode === "deploy");
				}
			},
			expandable: false,
			formElements: [
			    new sap.ui.layout.form.FormElement({
					fields: [applicationStateContent],
					visible:{
        			    parts:["mode"],
                        formatter:function(sMode){
                            return (sMode === "redeploy"); 
                        }
        			},
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12"
					})
				}), new sap.ui.layout.form.FormElement({
					fields: [applicationURLLabelContent],
        			visible:{
        			    parts:["activeVersion" , "mode"],
                        formatter:function(active, mode){
                            return (active !== undefined) && (mode === "redeploy"); 
                        }
        			},
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12"
					})
				}), new sap.ui.layout.form.FormElement({
					fields: [VersionsTableContent],
					visible:{
        			    parts:["mode"],
                        formatter:function(sMode){
                            return (sMode === "redeploy"); 
                        }
        			},
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12"
					})
				}), new sap.ui.layout.form.FormElement({
					fields: [oNotDeployDescriptionGrid],
					visible:{
        			    parts:["mode"],
                        formatter:function(sMode){
                            return (sMode === "deploy"); 
                        }
        			},
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12"
					})
				})]
		});
		
		var versionsFormContainer = new sap.ui.layout.form.FormContainer({
			title: "{i18n>DeployVersionManagment}",
			visible: {//DeployVersionManagment section will not be visible in case of mode = "run" (on HCP)
				parts: ["mode"],
				formatter: function(sMode) {
					return (sMode !== "run");
				}
			},
			expandable: false,
			formElements: [new sap.ui.layout.form.FormElement({
				fields: [versionContent],
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				})
			})]
		});

		var oDeployForm = new sap.ui.layout.form.Form({
			layout: new sap.ui.layout.form.ResponsiveGridLayout(),
			formContainers: [newApplicationFormContainer, applicationStatusFormContainer, versionsFormContainer],
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12",
				linebreak : true
			})
		});
		
		var dialogContent = new sap.ui.layout.Grid("dialogContent", {
			width : "100%",
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12",
				linebreak : true
			}),
			vSpacing: 0,
			content : [ errorTextField, infoContent, oDeployForm ]
		}).addStyleClass("deploymentDialogContent");

		this._oDlg = new sap.ui.commons.Dialog({
			title: {
				parts: ["mode", "i18n>setting_title", "i18n>setting_run_on_HCP"],
				formatter: function(sMode, create, run) {
					if (sMode === "run") {
						return run;
						
					} else {
					    //return "Deploy Application to SAP HANA Cloud Platform."
						return create;
					}
				}
			},

			width: "750px",
			content: [dialogContent],
			buttons: [this._okButton, new sap.ui.commons.Button({
				text: "{i18n>setting_cancel}",
				press: [oController._cancel, oController]
			})],
			closed: [oController._closed, oController],
			initialFocus: this.heliumAccountCombobox,
			keepInWindow: true,
			modal: true,
			resizable: false // MK: do not change to "true", it makes the dialog messy
		}).addStyleClass("deploymentDialog");

		return undefined; 
	}
});