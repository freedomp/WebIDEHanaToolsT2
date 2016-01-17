define([ "sap/watt/common/plugin/platform/service/ui/AbstractConfig" ], function(AbstractConfig) {
	"use strict";

	return AbstractConfig.extend("sap.watt.ideplatform.plugindevelopment.service.Config", {
		_oContent : null,
		_oEmptyContent : null,
		_mSettings : null,
		_aDependenciesPlugins : null,
		_oDependencies : null,

		SEVERITY : {
			none : "None", 
			lite : "Lite",
			medium : "Medium",
			full : "Full"
		},

		getProjectSettingContent : function(id, group, sProjectPath) {

			var that = this;
			this._aDependenciesPlugins = [];

            if (!sProjectPath) {
                return null;
            }

            return that._checkIfRootProjectHasPlugins(sProjectPath).then(function(oResult) {
				if (oResult) {
					return that._readPluginDevelopmentSectionInProjectJson(sProjectPath).then(function(mProjectSettings) {
						return that.context.service.filesystem.documentProvider.getDocument(sProjectPath).then(function(oDocumnet) {
							that.oProjectDocument = oDocumnet;
							that._mSettings = mProjectSettings;
							if (!that._mSettings) {

								that._mSettings = {};

								that._mSettings.dependencies = {
									"all" : []
								};
								that._mSettings.devUrlParameters = {
									"sap-ide-debug" : "",
									"debugAsync" : ""
								};
							}

							that._oDependencies = that._mSettings.dependencies;
							// if project json file as Dependencies entry
							if (that._oDependencies && that._oDependencies.all) {
								that._aDependenciesPlugins = that._mSettings.dependencies.all;
							}

							if (!that._oContent) {
								that._oContent = that._createUI();
							}
							that._updateUIControls();

							that.oDependenciesTable.addDelegate({
								onAfterRendering : function() {
									jQuery("#" + that.oDependenciesTable.getId() + "-vsb-sb").scrollTop(0);
								}
							});

							return that._updatePluginsTable().then(function() {
								that._updateArrayOfDependenciesPlugins();

								return that._oContent;
							});
						});
					});
				} else {
					// if the selected project is not a plug
					if (!that._oEmptyContent) {
						that._oEmptyContent = that._createEmptyForm();
					}
					return that._oEmptyContent;
				}
			});

		},

		_updateArrayOfDependenciesPlugins : function() {
			var bFound = false;
			var aWorkspacePlugins = this.oDependenciesTable.getModel().getData().modelData;
			var j, index = 0;

			while (index < this._aDependenciesPlugins.length) {
				var sPlugin = this._aDependenciesPlugins[index];
				for (j = 0; j < aWorkspacePlugins.length; j++) {
					if (aWorkspacePlugins[j].PluginPath === sPlugin) {
						bFound = true;
						break;
					}
				}
				if (!bFound) {
					this._aDependenciesPlugins.splice(index, 1);
				} else {
					index++;
				}

				bFound = false;
			}
		},

		_checkIfRootProjectHasPlugins : function(sFullPath) {

			var i;
			var sRootPath = sFullPath;

			var index = sFullPath.indexOf("/", 1);
			//if the full path is not the root folder then extract then root folder from it.
			if (index > -1) {
				sRootPath = sFullPath.substring(0, index);
			}

			return this.context.service.filesystem.documentProvider.getDocument(sRootPath).then(function(oDocumnet) {
                if (!oDocumnet) {
                    return false;
                }
				return oDocumnet.getCurrentMetadata(true).then(function(aMetadataContent) {
					for (i = 0; i < aMetadataContent.length; i++) {
						var oMetadataContent = aMetadataContent[i];
						if (!oMetadataContent.folder && oMetadataContent.name === "plugin.json") {
							return true;
						}
					}
					return false;
				});
			});
		},

		_createEmptyForm : function() {

			return new sap.ui.layout.form.Form("emptyForm", {
				layout : new sap.ui.layout.form.GridLayout(),
				formContainers : [ new sap.ui.layout.form.FormContainer({
					formElements : [ new sap.ui.layout.form.FormElement({
						fields : [ new sap.ui.commons.Label({
							text : "The current project is not an SAP Web IDE plugin project."
						}) ]
					}) ]
				}) ]
			}).addStyleClass("beautifierSetting_form");
		},

		_readPluginDevelopmentSectionInProjectJson : function(sPluginProjectPath) {
			var that = this;
			return this.context.service.filesystem.documentProvider.getDocument(sPluginProjectPath).then(function(oTargetDocument) {
				return that.context.service.setting.project.get(that.context.service.plugindevelopment, oTargetDocument);
			});
		},

		saveProjectSetting : function(id, group) {
			var oSettings = {};
			if( this.oDebugAsyncDropDown){
				var sDebugAsync = this.oDebugAsyncDropDown.getValue();
			}

			oSettings.devUrlParameters = {
				"sap-ide-debug" : ""
			};

			oSettings.dependencies = {};
			
			if(this.oSapIdeDebugCheckBox){
				oSettings.devUrlParameters["sap-ide-debug"] = this.oSapIdeDebugCheckBox.getChecked();
			}

			if (sDebugAsync !== this.SEVERITY.none) {
				oSettings.devUrlParameters.debugAsync = sDebugAsync;
			}

			if (this._oDependencies) {
				// save the other dependencies (except for - all) and update the value of all key 
				oSettings.dependencies = this._oDependencies;
			}
			oSettings.dependencies.all = this._aDependenciesPlugins;

			this.context.service.setting.project.set(this.context.service.plugindevelopment, oSettings, this.oProjectDocument).done();
		},
		
		_getWorkspaceMetadataContent : function() {
			return this.context.service.filesystem.documentProvider.getRoot().then(function(oRootDocument) {
				var aWorkspaceMatadata = [];
				var aProjectMetadataPromises = [];
				if (oRootDocument) {
					// return the root project documents
					return oRootDocument.getFolderContent().then(function(oRootProjectDocuments) {
						if (oRootProjectDocuments) {
							for (var i = 0; i < oRootProjectDocuments.length; i++) {
								var oRootProjectDocument = oRootProjectDocuments[i];
								aProjectMetadataPromises.push(oRootProjectDocument.getCurrentMetadata(true));
							}
						}
					
						return Q.all(aProjectMetadataPromises).then(function(aProjectsMetadata) {
							for (var j = 0; j < aProjectsMetadata.length; j++) {
								aWorkspaceMatadata.concat(aProjectsMetadata[j]);
							}
							
							return aWorkspaceMatadata;
						});
					});
				}
				
				throw new Error("The root object has not been retrieved.");
			});
		},

		_updatePluginsTable : function() {

			var aResult = [];
			var aPlugins = [];
			var that = this;
			var i, j;

			return this._getWorkspaceMetadataContent().then(function(aWorkspaceMetadata) {
				for (i = 0; i < aWorkspaceMetadata.length; i++) {
					var oMetadataElement = aWorkspaceMetadata[i];
					if (!oMetadataElement.folder && oMetadataElement.name === "plugin.json") {
						aResult.push(oMetadataElement.path);
					}
				}
				
				for (i = 0; i < aResult.length; i++) {
					for (j = 0; j < aResult[i].length; j++) {
						var sPath = aResult[i][j];
						// get the plugin path with out the first '/'.
						var sPluginPath = sPath.substring(1, sPath.length);
						// get the last folder in the plugin path.
						var sPluginName = that._getPluginName(sPluginPath);
						var bChecked = that._isDependentPlugin(sPluginPath);

						var pluginData = {
							"PluginName" : sPluginName,
							"PluginPath" : sPluginPath,
							"checked" : bChecked
						};
						aPlugins.push(pluginData);
					}
				}

				var oModel = new sap.ui.model.json.JSONModel();

				oModel.setData({
					modelData : aPlugins
				});
				that.oDependenciesTable.setModel(oModel);
				that.oDependenciesTable.bindRows("/modelData");
			});
		},

		_getPluginName : function(sPluginPath) {
			var index = sPluginPath.lastIndexOf("/");
			var sPluginName = sPluginPath;

			if (index > -1) {
				sPluginName = sPluginPath.substring(index + 1, sPluginPath.length);
			}

			return sPluginName;
		},

		_isDependentPlugin : function(sPluginPath) {

			if (this._aDependenciesPlugins !== undefined && this._aDependenciesPlugins.length > 0) {
				var index = this._aDependenciesPlugins.indexOf(sPluginPath);
				if (index > -1) {
					return true;
				}
			}

			return false;
		},

		_getPluginProjectsInFolder : function(sPath) {

			return this.context.service.filesystem.documentProvider.getDocument(sPath).then(function(oDocumnet) {
                var aResult = [];
                if (oDocumnet.getEntity().isFolder()) {
                    return oDocumnet.getCurrentMetadata(true).then(function(aMetadataContent) {
                        for ( var i = 0; i < aMetadataContent.length; i++) {
                        	var oMetadataElement = aMetadataContent[i];
                            if (!oMetadataElement.folder && oMetadataElement.name === "plugin.json") {
                                aResult.push(oMetadataElement.parentPath);
                            }
                        }
                        return aResult;
                    });
                }
                return aResult;
			});
		},

		_updateUIControls : function() {

			var oDevUrlParameters = this._mSettings.devUrlParameters;

			var bSapIdeDebug = false; // default value of sap-ide-debug is false
			var sDebugAsync = this.SEVERITY.none; // default value of DebugAsync is None

			if (oDevUrlParameters) {
				var bSapIdeDebugInSettings = oDevUrlParameters["sap-ide-debug"];
				if (bSapIdeDebugInSettings) {
					if (bSapIdeDebugInSettings === true || bSapIdeDebugInSettings === "true") {
						bSapIdeDebug = true;
					}
				}

				var sDebugAsyncInSettigns = oDevUrlParameters["debugAsync"];
				if (sDebugAsyncInSettigns) {
					if (sDebugAsyncInSettigns === this.SEVERITY.lite || sDebugAsyncInSettigns === this.SEVERITY.medium
							|| sDebugAsyncInSettigns === this.SEVERITY.full) {
						sDebugAsync = sDebugAsyncInSettigns;
					}
					// if user defined not DebugAsync correct level
					else {
						sDebugAsync = this.SEVERITY.lite;
					}
				}
			}

			this.oSapIdeDebugCheckBox.setChecked(bSapIdeDebug);
			this.oDebugAsyncDropDown.setValue(sDebugAsync);
		},

		_onCheckBoxChange : function(oEvent) {

			var oCheckBoxControl = oEvent.getSource();
			var oPlugin = oCheckBoxControl.getBindingContext().getObject();
			var sPluginPath = oPlugin.PluginPath;

			if (oCheckBoxControl.getChecked()) {
				this._aDependenciesPlugins.push(sPluginPath);
			} else {
				var index = this._aDependenciesPlugins.indexOf(sPluginPath);
				if (index > -1) {
					this._aDependenciesPlugins.splice(index, 1);
				}
			}

		},

		_createUI : function() {

			var oForm = new sap.ui.layout.form.Form("pluginDevelopmentSettings", {
				layout : new sap.ui.layout.form.GridLayout()
			});
			oForm.addStyleClass("beautifierSetting_form");

			var oConfigureUrlFormContainer = new sap.ui.layout.form.FormContainer("configureUrlParameters", {
				title : new sap.ui.core.Title({
					text : this.context.i18n.getText("i18n", "projectSettings_ConfigureURLParametersTableTitle"),
					tooltip : this.context.i18n.getText("i18n", "projectSettings_ConfigureURLParametersTableToolTip")
				}),
				layoutData : new sap.ui.core.VariantLayoutData({
					multipleLayoutData : [ new sap.ui.layout.GridData({
						span : "L12 M12 S12"
					}) ]
				})
			});

			var oFormElement = new sap.ui.layout.form.FormElement();

			this.oSapIdeDebugCheckBox = new sap.ui.commons.CheckBox({
				layoutData : new sap.ui.layout.form.GridElementData({
					hCells : "8"
				})
			});
			this.oSapIdeDebugCheckBox.setText(this.context.i18n.getText("i18n", "projectSettings_SapIdeDebugTitle"));
			oFormElement.addField(this.oSapIdeDebugCheckBox);

			oConfigureUrlFormContainer.addFormElement(oFormElement);

			var oSapIdeDebugDescription = new sap.ui.commons.Label({
				text : this.context.i18n.getText("i18n", "projectSettings_SapIdeDebugDes"),
				tooltip : this.context.i18n.getText("i18n", "projectSettings_SapIdeDebugDes")
			}).addStyleClass("descriptionLabels");

			oFormElement = new sap.ui.layout.form.FormElement();
			oFormElement.addField(oSapIdeDebugDescription);

			oConfigureUrlFormContainer.addFormElement(oFormElement);

			this.oDebugAsyncDropDown = new sap.ui.commons.DropdownBox({
				items : [ new sap.ui.core.ListItem({
					text : this.SEVERITY.none
				}), new sap.ui.core.ListItem({
					text : this.SEVERITY.lite
				}), new sap.ui.core.ListItem({
					text : this.SEVERITY.medium
				}), new sap.ui.core.ListItem({
					text : this.SEVERITY.full
				}) ],
				layoutData : new sap.ui.layout.form.GridElementData({
					hCells : "4"
				})
			});

			var oDebugAsyncDropDownLabel = new sap.ui.commons.Label({
				labelFor : this.oDebugAsyncDropDown,
				layoutData : new sap.ui.layout.form.GridElementData({
					hCells : "6"
				})
			});
			oDebugAsyncDropDownLabel.setText(this.context.i18n.getText("i18n", "projectSettings_DebugAsyncTitle"));

			oFormElement = new sap.ui.layout.form.FormElement();
			oFormElement.addField(oDebugAsyncDropDownLabel);
			oFormElement.addField(this.oDebugAsyncDropDown);
			oConfigureUrlFormContainer.addFormElement(oFormElement);

			var oDebugAsyncDescription = new sap.ui.commons.Label({
				text : this.context.i18n.getText("i18n", "projectSettings_DebugAsyncDes"),
				tooltip : this.context.i18n.getText("i18n", "projectSettings_DebugAsyncDes")
			}).addStyleClass("descriptionLabels");

			oFormElement = new sap.ui.layout.form.FormElement();
			oFormElement.addField(oDebugAsyncDescription);
			oConfigureUrlFormContainer.addFormElement(oFormElement);

			var oSelectPluginsFormContainer = new sap.ui.layout.form.FormContainer("selectPlugins", {
				title : new sap.ui.core.Title({
					text : this.context.i18n.getText("i18n", "projectSettings_SelectPluginsTableTitle"),
					tooltip : this.context.i18n.getText("i18n", "projectSettings_SelectPluginsTableToolTip")
				}),
				layoutData : new sap.ui.core.VariantLayoutData({
					multipleLayoutData : [ new sap.ui.layout.GridData({
						span : "L12 M12 S12"
					}) ]
				})
			});

			this.oDependenciesTable = new sap.ui.table.Table({
				selectionMode : sap.ui.table.SelectionMode.None,
				visibleRowCount : 6
			});

			this.oDependenciesTable.addColumn(new sap.ui.table.Column({
				label : new sap.ui.commons.Label({
					text : this.context.i18n.getText("i18n", "projectSettings_SelectPluginsTable_SelectColumn")
				}),
				template : new sap.ui.commons.CheckBox({
					change : [ this._onCheckBoxChange, this ]
				}).bindProperty("checked", "checked"),
				width : "80px",
				hAlign : "Left"
			}));

			this.oDependenciesTable.addColumn(new sap.ui.table.Column({
				width : "220px",
				label : new sap.ui.commons.Label({
					text : this.context.i18n.getText("i18n", "projectSettings_SelectPluginsTable_PluginNameColumn")
				}),
				template : new sap.ui.commons.TextView().bindProperty("text", "PluginName")
			}));

			this.oDependenciesTable.addColumn(new sap.ui.table.Column({
				label : new sap.ui.commons.Label({
					text : this.context.i18n.getText("i18n", "projectSettings_SelectPluginsTable_PluginPathColumn")
				}),
				template : new sap.ui.commons.TextView().bindProperty("text", "PluginPath")
			}));

			oFormElement = new sap.ui.layout.form.FormElement();
			oFormElement.addField(this.oDependenciesTable);
			oSelectPluginsFormContainer.addFormElement(oFormElement);

			var oDependenciesTableDescription = new sap.ui.commons.Label({
				text : this.context.i18n.getText("i18n", "projectSettings_SelectPluginsTableDes"),
				tooltip : this.context.i18n.getText("i18n", "projectSettings_SelectPluginsTableDes")
			}).addStyleClass("descriptionLabels");

			oFormElement = new sap.ui.layout.form.FormElement();
			oFormElement.addField(oDependenciesTableDescription);

			oSelectPluginsFormContainer.addFormElement(oFormElement);

			oForm.addFormContainer(oConfigureUrlFormContainer);
			oForm.addFormContainer(oSelectPluginsFormContainer);

			return oForm;
		}
	});
});