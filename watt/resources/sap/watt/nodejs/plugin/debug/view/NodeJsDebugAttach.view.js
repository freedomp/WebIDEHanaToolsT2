(function() {
	"use strict";

	sap.ui.jsview("sap.xs.nodejs.debug.view.NodeJsDebugAttach", {

		getControllerName: function() {
			return "sap.xs.nodejs.debug.view.NodeJsDebugAttach";
		},

		createContent: function(controller) {
			controller._configure(this.getViewData().context, this.getViewData().selectedProject);

			var matrix = new sap.ui.commons.layout.MatrixLayout({
				columns: 1
			}).addStyleClass("nodeJsDebugAttachView");

			matrix.createRow(this._createProjectSection(controller));
			matrix.createRow(new sap.ui.commons.Label({text: ""}));
			matrix.createRow(this._createAdvancedSection());
			return matrix;
		},

		_createProjectSection: function(controller) {
			var view = this;
			var itemTemplate = new sap.ui.core.ListItem({
				key: "{path}",
				text: "{path}"
			});
			var projectList = new sap.ui.commons.DropdownBox("projectList", {
				layoutData: this._newGridData("auto"),
				items: {
					path: "/projects",
					template: itemTemplate
				},
				change: function(event) {
					var selectedIndex = event.getSource().indexOfItem(event.getParameters().selectedItem);
					var model = view.getModel();
					var modelData = model.getData();

					// an additional empty entry has been added
					if (modelData.projects.length < selectedIndex) {
						modelData.connection.projectPath = modelData.projects[selectedIndex].path;
						modelData.connection.setDebugURL(modelData.projects[selectedIndex].debugURL);
						model.refresh(true);
					}
				}
			});
			projectList.onAfterRendering = function() {
				var model = this.getModel();
				if (model.getData().advanced) {
					projectList.addItem(new sap.ui.core.ListItem("emptyListItem"));
				}
				// by default select the project path
				this.setSelectedKey(model.getData().connection.projectPath);
			};
			var projectForm = new sap.ui.layout.form.Form({
				width: "100%",
				editable: true,
				layout: new sap.ui.layout.form.GridLayout({
					singleColumn: true
				}),
				formContainers: [
	     			new sap.ui.layout.form.FormContainer({
	    				formElements: [
							new sap.ui.layout.form.FormElement({ fields: [
	    							new sap.ui.commons.Label({
	    								text: "{i18n>attachView_project_xfld}",
	    								layoutData: this._newGridData("2")
	    							}),
	    							projectList]
    						})
	    				]
	    			})
				]
			});
			return projectForm;
		},

		_createAdvancedSection: function() {
			var hostField = new sap.ui.commons.TextField("host", {
				value: "{debugHost}",
				editable: "{/advanced}",
				required: true,
				change: function(event) {
					// if we have a complete, e.g. due to a paste operation, spread it to the other fields
					var url = new URI(event.getParameters().newValue);
					if (url.protocol() && url.hostname()) {
						this.getModel().getData().connection.setDebugURL(url.toString());
						this.getModel().refresh();
					}

					// clear project path if advanced settings are used otherwise path mapping does not work properly
					var projectList = sap.ui.getCore().byId("projectList");
					if (event.getParameters().newValue) {
						if (projectList.getSelectedItemId() !== "emptyListItem") {
							projectList.setSelectedItemId("emptyListItem");
							this.getModel().getData().connection.projectPath = null;
						}
					}
				},
				layoutData: this._newGridData("auto")
			});

			var portField = new sap.ui.commons.TextField({
				value: "{debugWebPort}",
				editable: "{/advanced}",
				required: true,
				layoutData: this._newGridData("auto")
			});

			var proxyField = new sap.ui.commons.TextField({
				value: "{proxyURI}",
				editable: "{/advanced}",
				layoutData: this._newGridData("auto")
			});

			var secureConnectionToggle = new sap.ui.commons.CheckBox({
				text: "{i18n>attachView_secureConnection_xckl}",
				checked: "{secureConnection}",
				editable: "{/advanced}",
				layoutData: this._newGridData("auto")
			});

			var userField = new sap.ui.commons.TextField({
				value: "{debugUser}",
				editable: "{/advanced}",
				required: true,
				layoutData: this._newGridData("auto")
			});

			var passwordField = new sap.ui.commons.PasswordField({
				value: "{debugPassword}",
				editable: "{/advanced}",
				required: true,
				layoutData: this._newGridData("auto")
			});

			var connectionLink = new sap.ui.commons.Link({
				text: "{i18n>attachView_openApplication_xlnk}",
				press: function() {
					if (hostField.getValue()) {
						var isSecure = secureConnectionToggle.getChecked();
						var url = new URI({
							protocol: isSecure ? "https" : "http",
							hostname: hostField.getValue(),
							port: portField.getValue()
						});
						window.open(url.toString(), "_blank");
					}
				},
				target: "_blank",
				layoutData: this._newGridData("auto")
			});

			var detailsForm = new sap.ui.layout.form.Form({
				width: "100%",
				editable: true,
				layout: new sap.ui.layout.form.GridLayout({
					singleColumn: true
				}),
				formContainers: [

				new sap.ui.layout.form.FormContainer("NodeJsConnectionDetails", {
						formElements: [
					new sap.ui.layout.form.FormElement({ label: "" }) // spacer
                    , new sap.ui.layout.form.FormElement({ fields:[
                        new sap.ui.commons.Label({
							text: "{i18n>attachView_host_xfld}",
							required: true,
							layoutData: this._newGridData("2")
						}),
						hostField]
					})
					, new sap.ui.layout.form.FormElement({ fields: [
						new sap.ui.commons.Label({
							text: "{i18n>attachView_port_xfld}",
							required: true,
							layoutData: this._newGridData("2")
						}),
						portField]
					})
					, new sap.ui.layout.form.FormElement({ fields: [
						new sap.ui.commons.Label({
							text: "{i18n>attachView_user_xfld}",
							required: true,
							layoutData: this._newGridData("2")
						}),
						userField]
					})
					, new sap.ui.layout.form.FormElement({ fields: [
						new sap.ui.commons.Label({
							text: "{i18n>attachView_password_xfld}",
							required: true,
							layoutData: this._newGridData("2")
						}),
						passwordField]
					})
					, new sap.ui.layout.form.FormElement({ fields: [
						new sap.ui.commons.Label({
							text: "{i18n>attachView_proxy_xfld}",
							layoutData: this._newGridData("2")
						}),
						proxyField]
					})
					, new sap.ui.layout.form.FormElement({ fields: [
						secureConnectionToggle]
					})
					, new sap.ui.layout.form.FormElement({ label: "" }) // spacer
					, new sap.ui.layout.form.FormElement({ fields: [
					    connectionLink]
					})
				]
				})
			]

			});
			// Initially bind first entry.  As we don't have access to the model here, pass in null.
			sap.ui.getCore().byId("NodeJsConnectionDetails").bindObject("/connection");

			var advancedPanel = new sap.ui.commons.Panel({
				title: new sap.ui.core.Title({ text: "{i18n>attachView_advanced_xgrp}"}),
				borderDesign: sap.ui.commons.enums.BorderDesign.None,
				content: detailsForm
			});
			advancedPanel.onAfterRendering = function() {
				var data = this.getModel().getData();
				// Set initial collapsed state from 'advanced' property. After that we let the user collapse/expand it.
				if (!data.advancedPanelRendered) {
					advancedPanel.setCollapsed(!data.advanced);
					data.advancedPanelRendered = true;
				}
			};
			return advancedPanel;
		},

		_newGridData: function(hCells) {
			return new sap.ui.layout.form.GridElementData({
				hCells: hCells
			});
		}

	});
}());
