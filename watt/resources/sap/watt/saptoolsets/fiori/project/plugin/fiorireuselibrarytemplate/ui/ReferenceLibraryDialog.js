define(["../util/NeoAppUtil", "../util/RepositoryConstants"], function(neoAppUtil, repoConst) {
	"use strict";
	return {

		_oLibraryDiscoveryUI: null,

		openDialogUI: function(oPluginContext) { //openns the dialog
			var that = this;
			var oDialog = sap.ui.getCore().byId("ReferenceLibraryDialogUI");
			this._getProjectRootPathLocal(oPluginContext).then(function(projectPath) { // must be written here before openning the dialog because of focus lost
				if (projectPath && projectPath !== "") {
					that.projectRootPath = projectPath;
					if (oDialog === undefined) {
						return that._createConsumingDialog(oPluginContext).then(function(inDialog) {
							oDialog = inDialog;
							oPluginContext.i18n.applyTo(oDialog);
							that._oModel = new sap.ui.model.json.JSONModel();
							that._oModel.setData({
								modelData: {
									isValid: false,
									ErrorMessage: "",
									sValidText: ""
								}
							});
							oDialog.setModel(that._oModel);
							oDialog.open();
						});
					} else {
						that._oLibraryDiscoveryUI.initDataBeforeOpen(that.oDiscoveryUIServiceConfig);
						oDialog.open();
					}
				} else {
					throw new Error(oPluginContext.i18n.getText("i18n", "referenceLibrary_validation_error_msg"));
				}
			}).fail(function() {
				throw new Error(oPluginContext.i18n.getText("i18n", "referenceLibrary_validation_error_msg"));
			});
		},

		_createConsumingDialog: function(oPluginContext) {
			var that = this;
			that.oPluginContext = oPluginContext;
			this.oDiscoveryUIServiceConfig = {
				"library": true,
				"control": false,
				"reuseComponent": false
			};

			return oPluginContext.service.libraryDiscovery.getLibraryDiscoveryUI(this.oDiscoveryUIServiceConfig)
				.then(function(oLibraryDiscoveryUI) {
					that._oLibraryDiscoveryUI = oLibraryDiscoveryUI;
					that._oLibraryDiscoveryUI.setChangeHandler(function() {
						that._oModel.setProperty("/modelData/isValid", that._oLibraryDiscoveryUI.getSelectedContent().length > 0);
						var sValidMessage = that._oLibraryDiscoveryUI.getSelectedContent().length > 0 ? that.oPluginContext.i18n.getText("i18n",
							"referenceLibrary_ValidMessage") : "";
						that._oModel.setProperty("/modelData/sValidText", sValidMessage);
					});
					that._oLibraryDiscoveryUI.setValidationHandler(function(oStatus) {
						that._doValidation(oStatus);
					});

					var oSectionErrorMsg = new sap.ui.commons.TextView({
						text: "{ErrorMessage}",
						width: "100%",
						layoutData: new sap.ui.layout.GridData({
							span: "L12 M12 S12"
						}),
						vSpacing: 0
					}).addStyleClass("errorText");

					var oValidLabel = new sap.ui.commons.TextView({
						text: "{sValidText}",
						width: "100%",
						layoutData: new sap.ui.layout.GridData({
							span: "L12 M12 S12"
						})
					});

					var oDialog = new sap.ui.commons.Dialog("ReferenceLibraryDialogUI", {
						title: "{i18n>referenceLibrary_dialogTitle}",
						buttons: [new sap.ui.commons.Button("ReferenceLibraryDialog_OKButton", {
								text: "{i18n>referenceLibrary_dialog_OK_Button}",
								style: sap.ui.commons.ButtonStyle.Emph,
								press: [that._ok, that], //that is passed to the function as the 'this' 
								enabled: "{isValid}"
							}),
				            new sap.ui.commons.Button("ReferenceLibraryDialog_CancleButton", {
								text: "{i18n>referenceLibrary_dialog_CANCEL_Button}",
								press: [that._cancel, that]
							})],
						content: [oSectionErrorMsg, oLibraryDiscoveryUI.content, oValidLabel],
						resizable: false,
						width: "70%"
					});
					oDialog.bindElement("/modelData");
					return oDialog;
				});
		},

		_updateNewVersion: function() {
			var that = this;
			var selectedLibrary = that._getSelectedLibrary();
			var repositoryType = that._getRepositoryType();
			that._selectLibraryReference(selectedLibrary, repositoryType);
		},

		_createNeoAppCheckVersionDailog: function() {
			var that = this;
			var oDialog = sap.ui.getCore().byId("NeoAppCheckVersionDailogUI");
			if (oDialog === undefined) {
				var dialogTitle = that.oPluginContext.i18n.getText("i18n", "neoAppCheckVersion_dialogTitle");
				var confirmTitle = that.oPluginContext.i18n.getText("i18n", "neoAppCheckVersion_confirmTitle");
				oDialog = new sap.ui.commons.MessageBox.confirm(
					confirmTitle,
					function(bResult) {
						if (bResult) {
							that._updateNewVersion();
						}
					},
					dialogTitle,
					"NeoAppCheckVersionDailogUI");
			}
			return oDialog;
		},

		_doValidation: function(oStatus) {
			this._oModel.setProperty("/modelData/isValid", oStatus.isValid);
			var sErrorMessage = "";
			if (!oStatus.isValid && oStatus.message) {
				sErrorMessage = oStatus.message;
			}
			this._oModel.setProperty("/modelData/ErrorMessage", sErrorMessage);
			this._oModel.setProperty("/modelData/sValidText", oStatus.isValid ? this.oPluginContext.i18n.getText("i18n",
				"referenceLibrary_ValidMessage") : "");
		},

		_cancel: function() {
			this._closeAndDestroyDialog(); // close the dialog
		},

		_closeAndDestroyDialog: function() {
			sap.ui.getCore().byId("ReferenceLibraryDialogUI").close();
			sap.ui.getCore().byId("ReferenceLibraryDialogUI").destroy();
		},

		_selectLibraryReference: function(selectedLibrary, repositoryType) {
			var that = this;
			that.oPluginContext.service.libraryReference.setLibraryReference(selectedLibrary, repositoryType, that.projectRootPath).then(function() {
				that.oPluginContext.service.usagemonitoring.report("reuse_library", "used", "open").done();
				//succsefully entered the library reference
				var sRepository = "";
				switch (repositoryType) {
					case repoConst.ABAP:
						sRepository = "ABAP";
						break;
					case repoConst.HCP:
						sRepository = "HCP";
						break;
					case repoConst.WORKSPACE:
						sRepository = "WORKSPACE";
						break;
					default:
						sRepository = "SAPUI5";
				}
				that.oPluginContext.service.usagemonitoring.report("add_reference_data", "repository", sRepository).done();
				that._closeAndDestroyDialog();
			}).fail(function() {
				//failed to enter library reference to neo-app.json
				that._doValidation({
					isValid: false,
					message: that.oPluginContext.i18n.getText("i18n", "referenceLibrary_validation_error_msg")
				});
			});
		},

		_ok: function() {
			var that = this;
			var selectedLibrary = that._getSelectedLibrary();
			var repositoryType = that._getRepositoryType();
			
			this._oModel.setProperty("/modelData/isValid", false);

			neoAppUtil.getNeoAppDocument(that.projectRootPath, that.oPluginContext).then(function(neoAppDoc) {
				that.oPluginContext.service.librarydevelopment.getSelectedLibraryModelObject(selectedLibrary, repositoryType).then(function(
					libraryObject) {
					//Check if library exist in neo app
					var oLibraryDetails = neoAppUtil.buildLibraryObjectForNeoApp(libraryObject);
					var isLibNeoExist = neoAppUtil.isLibInNeoApp(oLibraryDetails, neoAppDoc);
					if (isLibNeoExist) {
						var isLibSameVersion = neoAppUtil.isLibSameVersion(libraryObject, neoAppDoc);
						//Check if the library version is the same as in neo app
						if (!isLibSameVersion) {
							var nepAppVersionDaliog = that._createNeoAppCheckVersionDailog();
							nepAppVersionDaliog.open();
						} else {
							that._selectLibraryReference(selectedLibrary, repositoryType);
						}
					} else {
						that._selectLibraryReference(selectedLibrary, repositoryType);
					}
				});
			}).fail(function(Error) {
				that._doValidation({
					isValid: false,
					message: Error
				});
			}).fin(function(){
				this._oModel.setProperty("/modelData/isValid", true);
			});
		},

		_getSelectedLibrary: function() {
			var selectedObjects = this._oLibraryDiscoveryUI.getSelectedContent();
			return selectedObjects[0];
		},

		_getRepositoryType: function() {
			return this._oLibraryDiscoveryUI.getRepositoryType();
		},

		_getProjectRootPathLocal: function(oPluginContext) {
			return oPluginContext.service.selection.getSelection().then(function(aSelection) {
				if (aSelection && aSelection[0]) {
					if (aSelection[0].document.getEntity().getFullPath() !== "") {
						return aSelection[0].document.getProject().then(function(project) {
							var projectName = project.getEntity().getName();
							var projectRootPath = "/" + projectName;
							return projectRootPath;
						}).fail(function() {
							return undefined;
						});
					}
				}
				return undefined;
			}).fail(function() {
				return undefined; // failed to get root path
			});
		}

	};
});