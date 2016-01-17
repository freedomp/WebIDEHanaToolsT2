sap.ui.define([
	"./AppDescriptorEditorBase.controller"
], function(BaseController) {
	"use strict";

	return BaseController.extend("sap.watt.saptoolsets.fiori.editor.plugin.appdescriptoreditor.ui.AppDescriptorSettingsTab", {

		onInit: function() {
			this._oContext = this.getView().getViewData().oContext;
			this._aExtensionFilters = this.getView().getViewData().aExtentionFilters;
		},

		/**
		 * =============================
		 * Settings tab methods
		 * =============================
		 */
		onGeneralIdChange: function(oEvent) {
			//Create the skeleton if it does not exist and update the new value of the field
			this._createManifstSpecificSkeleton(["sap.app", "id"], "", oEvent.getParameter("newValue"));
			//raise event to update the document
			this.fireEvent("manifestChanged");

		},

		onGeneralTypeChange: function(oEvent) {
			//Create the skeleton if it does not exist and update the new value of the field
			this._createManifstSpecificSkeleton(["sap.app", "type"], "", oEvent.getParameter("newValue"));
			//raise event to update the document
			this.fireEvent("manifestChanged");			
		},

		onGeneralTitleChange: function(oEvent) {
			this._checkValidation(oEvent.getSource());
			//Create the skeleton if it does not exist and update the new value of the field
			this._createManifstSpecificSkeleton(["sap.app", "title"], "", oEvent.getParameter("newValue"));
			//raise event to update the document
			this.fireEvent("manifestChanged");				
		},

		onGeneralDescriptionChange: function(oEvent) {
			this._checkValidation(oEvent.getSource());
			//Create the skeleton if it does not exist and update the new value of the field
			this._createManifstSpecificSkeleton(["sap.app", "description"], "", oEvent.getParameter("newValue"));
			//raise event to update the document
			this.fireEvent("manifestChanged");			
		},

		onGenerali18nChange: function(oEvent) {
			//Create the skeleton if it does not exist and update the new value of the field
			this._createManifstSpecificSkeleton(["sap.app", "i18n"], "", oEvent.getParameter("newValue"));
			//raise event to update the document
			this.fireEvent("manifestChanged");					
		},

		onGeneralVersionChange: function(oEvent) {
			//Create the skeleton if it does not exist and update the new value of the field
			this._createManifstSpecificSkeleton(["sap.app", "applicationVersion", "version"], "", oEvent.getParameter("newValue"));
			//raise event to update the document
			this.fireEvent("manifestChanged");				
		},

		onGeneralTagsChange: function(oEvent) {
			//Create the skeleton if it does not exist and update the new value of the field
			this._createManifstSpecificSkeleton(["sap.app", "tags", "keywords"], "array");
			this._updateManifestSchemaFromAddRemoveListBox(["sap.app", "tags", "keywords"], oEvent, "textObject");			
			//raise event to update the document
			this.fireEvent("manifestChanged");					
		},

		onGeneralAchChange: function(oEvent) {
			this._checkValidation(oEvent.getSource());
			//Create the skeleton if it does not exist and update the new value of the field
			this._createManifstSpecificSkeleton(["sap.app", "ach"], "", oEvent.getParameter("newValue"));
			//raise event to update the document
			this.fireEvent("manifestChanged");		
		},

		onUITechnologyChange: function(oEvent) {
			//Create the skeleton if it does not exist and update the new value of the field
			this._createManifstSpecificSkeleton(["sap.ui", "technology"], "", oEvent.getParameter("newValue"));
			//raise event to update the document
			this.fireEvent("manifestChanged");				
		},

		onUIIconChange: function(oEvent) {
			//Create the skeleton if it does not exist and update the new value of the field
			this._createManifstSpecificSkeleton(["sap.ui", "icons", "icon"], "", oEvent.getParameter("newValue"));
			//raise event to update the document
			this.fireEvent("manifestChanged");					
		},

		onIconValueHelpRequest: function(oEvent) {
			var that = this;
			var oLocalEvent = jQuery.extend(true, {}, oEvent); //Save the ui5 event in a local parameter to be passed to the service
			this._oContext.service.ui5icons.openIconDialog().then(function(oResult) {
				if (oResult.icon && oResult.accepted) {
					oLocalEvent.getSource().setValue("sap-icon://" + oResult.icon);
					that._createManifstSpecificSkeleton(["sap.ui", "icons", "icon"], "", "sap-icon://" + oResult.icon);
					//raise event to update the document
					that.fireEvent("manifestChanged");
				}
			}).done();
		},

		onUIFevIconChange: function(oEvent) {
			this._createManifstSpecificSkeleton(["sap.ui", "icons", "favIcon"], "", oEvent.getParameter("newValue"));
			//raise event to update the document
			this.fireEvent("manifestChanged");
		},

		_getRepositoryBrowserControl: function() {
			if (this._oRepositoryBrowserControl) {
				return Q(this._oRepositoryBrowserControl);
			}

			var that = this;
			return that._oContext.service.repositoryBrowserFactory.create(null, {
				filters: that._aExtensionFilters
			}).then(function(oRepositoryBrowserInstance) {
				return oRepositoryBrowserInstance.getContent().then(function(oRepositoryBrowserControl) {
					oRepositoryBrowserControl.setHeight("200px");
					oRepositoryBrowserControl.setWidth("100%");
					oRepositoryBrowserControl.setLayoutData(new sap.ui.layout.GridData({
						span: "L12 M12 S12"
					}));
					//Handle select
					if (oRepositoryBrowserControl && oRepositoryBrowserControl.getContent().length > 0) {
						oRepositoryBrowserControl.getContent()[0].attachSelect(that.onRepositorySelectFile, that);
					}
					that._oRepositoryBrowserControl = oRepositoryBrowserControl;
					return that._oRepositoryBrowserControl;
				});
			});
		},

		onRepositorySelectFile: function(oEvent) {
			var that = this;
			if (!oEvent || !oEvent.getParameter) {
				return;
			}
			//that._sFileName = oEvent.getParameter("node").oDocument.getEntity().getFullPath();
			var sFileName = oEvent.getParameter("node").oDocument.getEntity().getFullPath();
			that._sFileName = sFileName.substr(1, sFileName.length); //without the leading /
			var aFile = that._sFileName.split('/');
			var oModel = this.getView().getModel("AppDescriptorUI");
			this._oDocument = oModel.getProperty("/oDocument");
			//if the project folder itself was selected or the file doesn't belongs to our project 
			//(picture from different folder we'll disable the ok)
			that._oDocument.getProject().then(function(oProjectDocument) {
				var oProjectName = oProjectDocument.getEntity().getName();
				if (aFile[0] === oProjectName) {
					that._oIconBrowserDialog.getButtons()[0].setEnabled(that._sFileName !== oProjectName);
				} else {
					that._oIconBrowserDialog.getButtons()[0].setEnabled(false);
				}
			});
		},

		onUIPhoneValueHelpRequest: function(oEvent) {
			if (!this._oIconBrowserDialog) {
				this._oIconBrowserDialog = new sap.ui.commons.Dialog("appDescriptorIconBrowser", {
					width: "400px",
					modal: true,
					title: "select a file",
					buttons: [new sap.ui.commons.Button({
						text: "OK",
						id: "okButton",
						enabled: false
					}), new sap.ui.commons.Button({
						text: "Cancel",
						press: [this.onUIPhoneDialogCancelPress, this]
					})]
				});
				this._getRepositoryBrowserControl().then(function(oRepositoryBrowserControl) {
					this._oIconBrowserDialog.addContent(oRepositoryBrowserControl);
				}.bind(this)).done();
			}
			var oOkButton = this._oIconBrowserDialog.getButtons()[0];
			oOkButton.detachPress(this.onUIPhoneDialogOkPress, this);
			oOkButton.attachPress(oEvent.getSource(), this.onUIPhoneDialogOkPress, this);
			this._oIconBrowserDialog.open();
		},

		onUIPhoneDialogOkPress: function(oEvent, oControlToUpdate) {
			oControlToUpdate.setValue(this._sFileName);
			var sManifestKey = oControlToUpdate.data("manifestKey");
			this._createManifstSpecificSkeleton(["sap.ui", "icons", sManifestKey], "", this._sFileName);
			//raise event to update the document
			this.fireEvent("manifestChanged");
			this._oIconBrowserDialog.close();
		},

		onUIPhoneDialogCancelPress: function() {
			this._oIconBrowserDialog.close();
		},

		onUIPhoneChange: function(oEvent) {
			this._createManifstSpecificSkeleton(["sap.ui", "icons", "phone"], "", oEvent.getParameter("newValue"));
			//raise event to update the document
			this.fireEvent("manifestChanged");
		},

		onUIPhone2Change: function(oEvent) {
			this._createManifstSpecificSkeleton(["sap.ui", "icons", "phone@2"], "", oEvent.getParameter("newValue"));
			//raise event to update the document
			this.fireEvent("manifestChanged");
		},

		onUITabletChange: function(oEvent) {
			this._createManifstSpecificSkeleton(["sap.ui", "icons", "tablet"], "" ,oEvent.getParameter("newValue"));
			//raise event to update the document
			this.fireEvent("manifestChanged");
		},

		onUITablet2Change: function(oEvent) {
			this._createManifstSpecificSkeleton(["sap.ui", "icons", "tablet@2"], "", oEvent.getParameter("newValue"));
			//raise event to update the document
			this.fireEvent("manifestChanged");
		},

		onSapUISupportedThemesChange: function(oEvent) {
			this._createManifstSpecificSkeleton(["sap.ui", "supportedThemes"], "array");
			this._updateManifestSchemaFromAddRemoveListBox(["sap.ui", "supportedThemes"], oEvent, "textObject");
			//raise event to update the document
			this.fireEvent("manifestChanged");
		},

		onMinUI5VersionChange: function(oEvent) {
			this._createManifstSpecificSkeleton(["sap.ui5", "dependencies", "minUI5Version"], "", oEvent.getParameter("newValue"));
			//raise event to update the document
			this.fireEvent("manifestChanged");
		},

		onMinUI5DependenciesChanged: function(oEvent) {
			var oItem = oEvent.getParameter("item");

			if (oItem.type === "libs") {
				this._createManifstSpecificSkeleton(["sap.ui5", "dependencies", "libs"]);
				this._updateManifestSchemaFromAddRemoveListBox(["sap.ui5", "dependencies", "libs"], oEvent, undefined, ["sap.ui5"], ["dependencies", "libs"]);
			}

			if (oItem.type === "components") {
				this._createManifstSpecificSkeleton(["sap.ui5", "dependencies", "components"]);
				this._updateManifestSchemaFromAddRemoveListBox(["sap.ui5", "dependencies", "components"], oEvent, undefined, ["sap.ui5"], ["dependencies", "components"]);
			}
			//raise event to update the document
			this.fireEvent("manifestChanged");

		},

		onMinUI5ResourceChange: function(oEvent) {
			var oItem = oEvent.getParameter("item");
			if (oItem.type === "js") {
				this._createManifstSpecificSkeleton(["sap.ui5", "resources", "js"], "array");
				this._updateManifestSchemaFromAddRemoveListBox(["sap.ui5", "resources", "js"], oEvent);
			}
			if (oItem.type === "css") {
				this._createManifstSpecificSkeleton(["sap.ui5", "resources", "css"], "array");
				this._updateManifestSchemaFromAddRemoveListBox(["sap.ui5", "resources", "css"], oEvent);
			}
			//raise event to update the document
			this.fireEvent("manifestChanged");
		},

		onContentDensitiesCompact: function(oEvent) {
			this._createManifstSpecificSkeleton(["sap.ui5", "contentDensities", "compact"], "", oEvent.getParameter("checked"));
			//raise event to update the document
			this.fireEvent("manifestChanged");
		},

		onContentDensitiesCozy: function(oEvent) {
			this._createManifstSpecificSkeleton(["sap.ui5", "contentDensities", "cozy"], "", oEvent.getParameter("checked"));
			//raise event to update the document
			this.fireEvent("manifestChanged");
		},

		onDevicesIphonePress: function(oEvent) {
			var bPressed = oEvent.getParameter("pressed");
			this._createManifstSpecificSkeleton(["sap.ui", "deviceTypes", "phone"], "",  bPressed);
			if (bPressed) {
				oEvent.getSource().setIcon("sap-icon://accept");
			} else {
				oEvent.getSource().setIcon("sap-icon://iphone");
			}
			//raise event to update the document
			this.fireEvent("manifestChanged");
		},

		onDevicesTabletPress: function(oEvent) {
			var bPressed = oEvent.getParameter("pressed");
			this._createManifstSpecificSkeleton(["sap.ui", "deviceTypes", "tablet"], "",  bPressed);
			if (bPressed) {
				oEvent.getSource().setIcon("sap-icon://accept");
			} else {
				oEvent.getSource().setIcon("sap-icon://ipad");
			}
			//raise event to update the document
			this.fireEvent("manifestChanged");
		},

		onDevicesDesktopPress: function(oEvent) {
			var bPressed = oEvent.getParameter("pressed");
			this._createManifstSpecificSkeleton(["sap.ui", "deviceTypes", "desktop"], "", bPressed);
			if (bPressed) {
				oEvent.getSource().setIcon("sap-icon://accept");
			} else {
				oEvent.getSource().setIcon("sap-icon://laptop");
			}
			//raise event to update the document
			this.fireEvent("manifestChanged");
		},

		//=====================FORMATTERS==================================

		formatCSSResourceToText: function(sUri, sId) {
			if (sUri && sId) {
				return sUri + " (" + sId + ")";
			}
			return sUri;
		},

		formatDependenciesToText: function(sType, oItem) {
			if (sType && oItem) {
				if (sType === "minUI5Version") {
					return sType + ": " + oItem.minUI5Version;
				}
				if (sType === "libs" || sType === "components") {
					var sProperty = Object.keys(oItem)[0];
					if (sProperty) {
						if (oItem[sProperty].minVersion) {
							return sType + ": " + sProperty + "(" + oItem[sProperty].minVersion + ")";
						}
						return sType + ": " + sProperty + "( )";
					}
				}
			}
		}
	});
});