sap.ui.jsview("sap.watt.ideplatform.plugin.gitclient.view.GitCloneDialog", {

	getControllerName: function() {
		return "sap.watt.ideplatform.plugin.gitclient.view.GitCloneDialog";
	},

	createContent: function(oController) {
		var oCloneURLLabel = new sap.ui.commons.Label({
			text: "{i18n>gITCloneDialog_url}",
			required: true,
			layoutData: new sap.ui.layout.GridData({
				span: "L4 M4 S4"
			})
		});

		this._oUriTextField = new sap.ui.commons.TextField({
			id: "clone_uri_text_fld",
			placeholder: "{i18n>gITCloneDialog_insert_repository_url}",
			tooltip: "{i18n>gITCloneDialog_insert_repository_url}",
			change: [oController._onReositoryURLInput, oController],
			layoutData: new sap.ui.layout.GridData({
				span: "L8 M8 S8"
			})
		});

		//Host name
		var oCloneHostlabel = new sap.ui.commons.Label({
			text: "{i18n>gITCloneDialog_host}",
			required: true,
			layoutData: new sap.ui.layout.GridData({
				span: "L4 M4 S4"
			})
		});

		this._oCloneHostTextField = new sap.ui.commons.TextField({
			placeholder: "{i18n>gITCloneDialog_insert_host_name}",
			tooltip: "{i18n>gITCloneDialog_insert_host_name}",
			change: [oController._onHostChange, oController],
			layoutData: new sap.ui.layout.GridData({
				span: "L8 M8 S8"
			})
		});

		//Repository
		var oCloneRepositoryPathLabel = new sap.ui.commons.Label({
			text: "{i18n>gITCloneDialog_repository_path}",
			required: true,
			layoutData: new sap.ui.layout.GridData({
				span: "L4 M4 S4"
			})
		});

		this._oCloneRepositoryTextField = new sap.ui.commons.TextField({
			placeholder: "{i18n>gITCloneDialog_insert_path}",
			tooltip: "{i18n>gITCloneDialog_insert_path}",
			change: [oController._onRepositoryChange, oController],
			layoutData: new sap.ui.layout.GridData({
				span: "L8 M8 S8"
			})
		});

		//Destination Name
		var oCloneDestinationNameLabel = new sap.ui.commons.Label({
			text: "{i18n>gITCloneDialog_destination_name}",
			required: false,
			layoutData: new sap.ui.layout.GridData({
				span: "L4 M4 S4"
			})
		});

		this._oCloneDestinationNameDropDownBox = new sap.ui.commons.DropdownBox({
			placeholder: "{i18n>gITCloneDialog_insert_destination_name}",
			tooltip: "{i18n>gITCloneDialog_insert_destination_name}",
			change: [oController._onDestinationNameChange, oController],
			layoutData: new sap.ui.layout.GridData({
				span: "L8 M8 S8"
			})
		});

		var oDestinationsTemplate = new sap.ui.core.ListItem({
			text: "{name}"
		});

		this._oCloneDestinationNameDropDownBox.bindItems("/aDestinations", oDestinationsTemplate);

		//Gerrit configuration
		var oGerritConfigurationCheckBox = new sap.ui.commons.CheckBox({
			id: "clone_add_gerrit_id_CheckBox",
			text: "{i18n>gITCloneDialog_gerrit_configuration}",
			tooltip: "{i18n>gITCloneDialog_gerrit_configuration}",
			checked: "{isGerritConfiguration}",
			visible: !!sap.watt.getEnv("internal"),
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			})
		});

		var oCloneProtocolLabel = new sap.ui.commons.Label({
			text: "{i18n>gITCloneDialog_protocol}",
			required: true,
			layoutData: new sap.ui.layout.GridData({
				span: "L4 M4 S4"
			})
		});

		//Protocol Dropdown
		this._oCloneProtocolDropDown = new sap.ui.commons.DropdownBox({
            enabled: {
                parts: ["isGerritSupported", "isDestinationSelected"],
                formatter: function (isGerritSupported, isDestinationSelected) {
                    return isGerritSupported && !isDestinationSelected;
                }
            },
			layoutData: new sap.ui.layout.GridData({
				span: "L4 M4 S4"
			}),
			items: [new sap.ui.core.ListItem({
				text: "https"
			})],
            //, new sap.ui.core.ListItem({
			//	text: "ssh"
			//})],
			tooltip: "{i18n>gITCloneDialog_select_the_desired_protocol}",
			change: [oController._onProtocolChange, oController],
			width: "100%"
		});

		var oClonePortLabel = new sap.ui.commons.Label({
			text: "{i18n>gITCloneDialog_port}",
			layoutData: new sap.ui.layout.GridData({
				span: "L4 M4 S4",
				linebreak: true
			})
		});

		//Port
		this._oClonePortTextField = new sap.ui.commons.TextField({
			width: "100%",
			placeholder: "{i18n>gITCloneDialog_insert_port_number}",
			tooltip: "{i18n>gITCloneDialog_insert_port_number}",
			change: [oController._onPortChange, oController],
			layoutData: new sap.ui.layout.GridData({
				span: "L4 M4 S4"
			})
		});

		//User name
		var oUserLabel = new sap.ui.commons.Label({
			text: "{i18n>gITCloneDialog_user}",
			width: "100%",
			layoutData: new sap.ui.layout.GridData({
				span: "L4 M4 S4",
				linebreak: true
			})
		});

		this._oCloneUserTextField = new sap.ui.commons.TextField({
			id: "clone_username_text_fld",
			value: "",
			width: "100%",
			placeholder: "{i18n>gITCloneDialog_insert_user_name}",
			tooltip: "{i18n>gITCloneDialog_insert_user_name}",
			layoutData: new sap.ui.layout.GridData({
				span: "L8 M8 S8"
			}),
			change: [oController._onUserNameChange, oController]
		});

		//SSH private key
		var oSSHPrivateKeyLabel = new sap.ui.commons.Label({
			text: "{i18n>gITCloneDialog_SSH_private_key}",
			width: "100%",
			layoutData: new sap.ui.layout.GridData({
				span: "L4 M4 S4",
				linebreak: true
			}),
			visible: {
				parts: ["isSSH", "isCachedInService"],
				formatter: function(isSSH, isCachedInService) {
					return isSSH && !isCachedInService;
				}
			}
		});

		this._oCloneFileUploaderTextField = new sap.ui.commons.FileUploader({
			width: "100%",
			uploadOnChange: true,
			sendXHR: true,
			layoutData: new sap.ui.layout.GridData({
				span: "L8 M8 S8"
			}),
			change: [oController._onFileUploaderChange, oController],
			visible: {
				parts: ["isSSH", "isCachedInService"],
				formatter: function(isSSH, isCachedInService) {
					return isSSH && !isCachedInService;
				}
			}
		});

		//HTTPS
		var oHTTPSPassLabel = new sap.ui.commons.Label({
			text: "{i18n>gITCloneDialog_password}",
			width: "100%",
			layoutData: new sap.ui.layout.GridData({
				span: "L4 M4 S4",
				linebreak: true
			}),
			visible: {
				parts: ["isSSH", "isCachedInService"],
				formatter: function(isSSH, isCachedInService) {
					return !isSSH && !isCachedInService;
				}
			}
		});

		this._oClonePasswordField = new sap.ui.commons.PasswordField({
			id: "clone_password_fld",
			value: "",
			width: "100%",
			placeholder: "{i18n>gITCloneDialog_insert_your_password_here}",
			tooltip: "{i18n>gITCloneDialog_insert_your_password_here}",
			layoutData: new sap.ui.layout.GridData({
				span: "L8 M8 S8"
			}),
			change: [oController._onPasswordChange, oController],
			visible: {
				parts: ["isSSH", "isCachedInService"],
				formatter: function(isSSH, isCachedInService) {
					return !isSSH && !isCachedInService;
				}
			}
		});

		//On Enter press for password field execute ok button.
		this._oClonePasswordField.onsapenter = jQuery.proxy(oController.onPasswordSapenter, oController);

		//Save Key
		this._oCheckBoxSaveData = new sap.ui.commons.CheckBox({
			text: "{i18n>gITAuthentication_save_ssh_cache}",
			tooltip: "{i18n>gITAuthentication_save_ssh_cache}",
			checked: "{isSaveCash}",
			visible: {
				path: "isCachedInService",
				formatter: function(isCachedInService) {
					return !isCachedInService;
				}
			},
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			})
		});

		this._oAuthFormContainer = new sap.ui.layout.form.FormContainer({
			title: "{i18n>gITCloneDialog_authentication}",
			expandable: false,
			formElements: [new sap.ui.layout.form.FormElement({
				fields: [oUserLabel, this._oCloneUserTextField, oSSHPrivateKeyLabel, this._oCloneFileUploaderTextField, oHTTPSPassLabel,
						this._oClonePasswordField, this._oCheckBoxSaveData],
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				})
			})]

		});

		this._oDestinationsFormElement = new sap.ui.layout.form.FormElement({
		    visible: "{isGitOnPremiseSupported}",
			fields: [oCloneDestinationNameLabel, this._oCloneDestinationNameDropDownBox],
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		});

		//Form
		var oCloneDialogForm = new sap.ui.layout.form.Form({
			layout: new sap.ui.layout.form.ResponsiveGridLayout(),
			formContainers: [new sap.ui.layout.form.FormContainer({
				title: "{i18n>gITCloneDialog_location}",
				expandable: false,
				formElements: [new sap.ui.layout.form.FormElement({
					fields: [oCloneURLLabel, this._oUriTextField],
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12"
					})
				}), new sap.ui.layout.form.FormElement({
					fields: [oCloneHostlabel, this._oCloneHostTextField],
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12"
					})
				}), new sap.ui.layout.form.FormElement({
					fields: [oCloneRepositoryPathLabel, this._oCloneRepositoryTextField],
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12"
					})
				}), this._oDestinationsFormElement]
			}), new sap.ui.layout.form.FormContainer({
				title: "{i18n>gITCloneDialog_connection}",
				expandable: false,
				formElements: [new sap.ui.layout.form.FormElement({
					fields: [oCloneProtocolLabel, this._oCloneProtocolDropDown],
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12"
					})
				}), new sap.ui.layout.form.FormElement({
					fields: [oClonePortLabel, this._oClonePortTextField],
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12"
					})
				})]
			}), this._oAuthFormContainer, new sap.ui.layout.form.FormContainer({
				title: "{i18n>gITCloneDialog_configuration}",
				expandable: false,
                visible: {
                    path: "isGerritSupported",
                    formatter: function(isGerritSupported) {
                        return isGerritSupported && !!sap.watt.getEnv("internal");
                    }
                },
				formElements: [new sap.ui.layout.form.FormElement({
					fields: [oGerritConfigurationCheckBox]
				})]
			})]
		}).addStyleClass("gitCloneDialogForm");

		this._oCloneDialog = new sap.ui.commons.Dialog({
			width: "500px",
			modal: true,
			title: "{i18n>gITCloneDialog_clone_repository}",
			content: [oCloneDialogForm],
			closed: [oController._onClose, oController],
			resizable: false,
			keepInWindow: true,
			initialFocus: this._oUriTextField
		});

		this._oOKButton = new sap.ui.commons.Button({
			id: "clone_ok_button",
			text: "{i18n>button_ok}",
			tooltip: "{i18n>button_ok}",
			enabled: true,
			press: [oController.executeClone, oController]
		});
		this._oCloneDialog.addButton(this._oOKButton);

		var oCanclButton = new sap.ui.commons.Button({
			text: "{i18n>button_cancel}",
			tooltip: "{i18n>button_cancel}",
			press: [oController.cancelClone, oController]
		});
		this._oCloneDialog.addButton(oCanclButton);

		return undefined;
	}

});