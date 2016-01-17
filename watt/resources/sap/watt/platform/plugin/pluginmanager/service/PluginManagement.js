define(["sap/watt/ideplatform/plugin/template/ui/wizard/ProgressIndicator"], function() {
	return {

		_aRepositoryList: undefined,
		_sLocation: undefined,
		_workspaceLocation: undefined,
		_oRoot: undefined,
		_oRepositoryDropdownBox: undefined,
		_oPluginManagerTable: undefined,
		_oRemoveAllButton: undefined,
		_oDetailsTextView: undefined,
		_oNoteTextView: undefined,
		_bFoundRegisteredPlugin: undefined,
		_oProgressIndicator: undefined,
		_bIsSavedButNotLoaded: undefined,
		_oContext: undefined,
		_pluginList: undefined,
		_checkedComboBoxsCount: undefined,
		_invalidPlugins : undefined,

		init: function() {
			this._bIsSavedButNotLoaded = false;
			this._checkedComboBoxsCount = 0;
			this._invalidPlugins = [];
		},

		configure: function(mConfig) {
			if (mConfig.preferenceService) {
				this._oPreferencePersistencyService = mConfig.preferenceService.service;
			}
		},

		/**
		 * Checks if a given plugin is loaded
		 *
		 * @param {String} [sPluginName]  		Name of plugin
		 * @returns {boolean}					Indication whether the plugin is loaded
		 */
		 isPluginLoaded: function(sPluginName) {
		 	if (!sPluginName){
		 		return false;
		 	}
		 	return Q.sap.require("sap/watt/core/PluginRegistry").then(function(oPluginRegistry) {
				var aPluginList = oPluginRegistry._mRegistry;
				for (var sPluginId in aPluginList) {
					var oPlugin = aPluginList[sPluginId];
					if (oPlugin.getMetadata().name === sPluginName) {
						return true;
					}
				}
				return false;
			});
		},
		
		_createOptionalGrid: function() {
			sap.watt.includeCSS(require.toUrl("sap.watt.ideplatform.template/css/wizard.css"));

			var oPluginManagerGrid = new sap.ui.layout.Grid("PluginManagerGrid", {
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12",
					linebreak: true
				})
			});

			this._oRepositoryDropdownBox = new sap.ui.commons.DropdownBox({
				width: "100%",
				layoutData: new sap.ui.layout.GridData({
					span: "L8 M6 S7"
				}),
				change: [this._onChangeReposirory, this]
			});

			var oRepositoryListItem = new sap.ui.core.ListItem();
			oRepositoryListItem.bindProperty("text", "repositoryDescription");

			this._oRepositoryDropdownBox.bindItems("/repositories", oRepositoryListItem);

			var oRepositoryLabel = new sap.ui.commons.Label({
				text: "{i18n>pluginManagement_gitRepositoriesLabel}",
				labelFor: this._oRepositoryDropdownBox,
				layoutData: new sap.ui.layout.GridData({
					span: "L2 M3 S5"
				})
			}).addStyleClass("repositoryLabel");

			this._oProgressIndicator = new sap.watt.ideplatform.plugin.template.ui.wizard.ProgressIndicator({
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				})
			});

			var oRepositoryGrid = new sap.ui.layout.Grid({
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12",
					linebreak: true
				}),
				content: [oRepositoryLabel, this._oRepositoryDropdownBox]
			}).addStyleClass("repositoryGrid");

			//Create an instance of the table control
			this._oPluginManagerTable = new sap.ui.table.Table({
				rowSelectionChange: [this._onRowSelectionchange, this],
				selectionMode: sap.ui.table.SelectionMode.Single,
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12",
					linebreak: true
				})
			});

			this._oPluginManagerTable.addDelegate({
				onAfterRendering : function(oControl) {
				    var rows = oControl.srcControl.mAggregations.rows;
				    for (var i=0; i<rows.length; i++) {
				        if(rows[i].getBindingContext()){
    				    	var plugin = rows[i].getBindingContext().getObject();
    				    	if(plugin.status === false) {
    							jQuery("#" + rows[i].getId()).css({
    								"text-decoration": "line-through",
    								"color": "#e22525"
    							});
    				    	}
    			        }
				    }
				}			    
			});

			this._oPluginManagerTable.addColumn(new sap.ui.table.Column({
				label: new sap.ui.commons.Label({
					text: "{i18n>pluginManagement_enabledColumn}"
				}),
				template: new sap.ui.commons.CheckBox({
					change: [this._onCheckBoxChange, this]
				}).bindProperty("checked", "checked"),
				sortProperty: "checked",
				width: "50px",
				hAlign: "Left"
			}));

			this._oPluginManagerTable.addColumn(new sap.ui.table.Column({
				label: new sap.ui.commons.Label({
					text: "{i18n>pluginManagement_pluginNameColumn}"
				}),
				template: new sap.ui.commons.TextView({
					text: {
						path: "pluginName",
						formatter: function(sValue) {
							return sValue;
						}
					},
					visible: {
						path: "status",
						formatter: function(sValue) {
							if (sValue == true) {
								jQuery("#" + this.getParent().getId()).css({
									"text-decoration": "inherit",
									"color": "#333333"
								});
								return true;
							} else {
								if (sValue == false) {
									jQuery("#" + this.getParent().getId()).css({
										"text-decoration": "line-through",
										"color": "#e22525"
									});
								}
								return true;
							}
						}
					}
				}),
				sortProperty: "pluginName",
				filterProperty: "pluginName",
				width: "150px"
			}));

			this._oPluginManagerTable.addColumn(new sap.ui.table.Column({
				label: new sap.ui.commons.Label({
					text: "{i18n>pluginManagement_pluginDescriptionColumn}"
				}),
				template: new sap.ui.commons.TextView().bindProperty("text", "pluginDescription"),
				sortProperty: "pluginDescription",
				filterProperty: "pluginDescription",
				width: "480px"
			}));

			this._oPluginManagerTable.addColumn(new sap.ui.table.Column({
				label: new sap.ui.commons.Label({
					text: "{i18n>pluginManagement_pluginVersionColumn}"
				}),
				template: new sap.ui.commons.TextView().bindProperty("text", "pluginVersion"),
				sortProperty: "pluginVersion",
				filterProperty: "pluginVersion",
				width: "100px"
			}));

			this._oPluginManagerTable.setSelectionBehavior(sap.ui.table.SelectionBehavior.RowOnly);

			this._oDetailsTextView = new sap.ui.commons.TextView({
				text: "",
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12",
					linebreak: true
				})
			}).addStyleClass("detailsView");

			this._oRemoveAllButton = new sap.ui.commons.Button("removeBtn", {
				enabled: false,
				text: "{i18n>pluginManagement_removeAllButton}",
				tooltip: "{i18n>pluginManagement_removeAllButtonToolTip}",
				press: [this._removeAllPlugins, this],
				layoutData: new sap.ui.layout.GridData({
					span: "L2 M2 S4"
				})
			});

			this._oNoteTextView = new sap.ui.commons.TextView({
				wrapping: false,
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12",
					linebreak: true
				})
			}).addStyleClass("alignControlToTheLeft noteView");

			oPluginManagerGrid.addContent(oRepositoryGrid);

			this._emptyGrid = new sap.ui.layout.Grid({
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12",
					linebreak: true
				}),
				content: [new sap.ui.commons.TextView({
					text: "",
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12",
						linebreak: true
					})
				}), new sap.ui.commons.TextView({
					text: "",
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12",
						linebreak: true
					})
				}), new sap.ui.commons.TextView({
					text: "",
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12",
						linebreak: true
					})
				}), new sap.ui.commons.TextView({
					text: "",
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12",
						linebreak: true
					})
				}), new sap.ui.commons.TextView({
					text: "",
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12",
						linebreak: true
					})
				})]
			});

			var oMainPluginManagerGrid = new sap.ui.layout.Grid("MainPluginManagerGrid", {
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12",
					linebreak: true
				}),
				content: [oPluginManagerGrid, this._emptyGrid]
			});

			this.addi18nBundleToGrid(oMainPluginManagerGrid);

			return oMainPluginManagerGrid;

		},

		_removeAllPlugins: function() {
			var that = this;

			var oConfig = {
				"plugins": []
			};

			this.context.service.usernotification.confirm(that.context.i18n.getText("i18n", "pluginManagement_removeAllMsg")).then(
				function(oResult) {
					if (oResult.bResult) {
						return that.context.service.preferences.set(oConfig, "config.json").then(function() {
							var aRepositories = that._oRepositoryDropdownBox.getItems();
							for (var i = 0; i < aRepositories.length; i++) {
								var aRepPlugins = aRepositories[i].getBindingContext().getObject().plugins;
								if (aRepPlugins) {
									for (var j = 0; j < aRepPlugins.length; j++) {
										aRepPlugins[j].checked = false;
									}
								}
							}
							that._oPluginManagerTable.rerender();
							that._updateButtonEnabledStatus("removeBtn", false);
							that._checkedComboBoxsCount = 0;
							return that._updateRepositoryModel().done();
						});
					}
				});
		},

		_onCheckBoxChange: function(oEvent) {
			var oCheckBoxControl = oEvent.getSource();
			if (oCheckBoxControl.getChecked()) {
				this._checkedComboBoxsCount++;
				var oPlugin = oCheckBoxControl.getBindingContext().getObject();

				var sPluginName = oPlugin.pluginName;

				if (sPluginName === undefined) {
					this.context.service.usernotification.alert(this.context.i18n.getText("i18n", "pluginManagement_NotValidPluginMsg"))
						.done();
					oCheckBoxControl.setChecked(false);
					this._checkedComboBoxsCount--;
					return;
				}

				var oUsageMonitoringService = this.context.service.usagemonitoring;
				oUsageMonitoringService.report("pluginManager", "OptionalPluginChecked", sPluginName).done();

				var oSelectedControl = sap.ui.getCore().byId(this._oRepositoryDropdownBox.getSelectedItemId());
				var oRepository = oSelectedControl.getBindingContext().getObject();
				var sPluginPath = oRepository.repositoryUrl + oPlugin.pluginPath;
				var bWasFoundInOrion = false;
				if (this.aRegisteredPlugins) {
					for (var orionPluginPath = 0, len = this.aRegisteredPlugins.plugins.length; orionPluginPath < len; orionPluginPath++) {
						var sPlugin = this.aRegisteredPlugins.plugins[orionPluginPath];
						if (sPlugin.indexOf(sPluginPath, sPlugin.length - sPluginPath.length) !== -1) {
							// found in Orion
							bWasFoundInOrion = true;
							break;
						}
					}
					if (!bWasFoundInOrion) {
						this._handleCheckPluginRegistry(sPluginName, oCheckBoxControl);
					}
				} else {
					this._handleCheckPluginRegistry(sPluginName, oCheckBoxControl);
				}

			} else {
				this._checkedComboBoxsCount--;
			}
		},

		_handleCheckPluginRegistry: function(sPluginName, oCheckBoxControl) {
			var that = this;
			require(["sap/watt/core/PluginRegistry"], function(PluginRegistry) {
				var aPluginList = PluginRegistry._mRegistry;

				for (var sPluginId in aPluginList) {
					var oPlugin = aPluginList[sPluginId];
					if (oPlugin.getMetadata().name === sPluginName) {
						that.context.service.usernotification
							.alert(that.context.i18n.getText("i18n", "pluginManagement_alreadyEnabledMsg")).done();
						oCheckBoxControl.setChecked(false);
						that._checkedComboBoxsCount--;
						break;
					}
				}
			});
		},

		_onRowSelectionchange: function(oEvent) {

			//when select the header row init the textview
			if (oEvent.getSource().getSelectedIndex() > -1) {
				var oRowContext = oEvent.getParameter("rowContext");
				if (oRowContext) {
					if (!oRowContext.getObject().status) {
						this._oDetailsTextView.setText(this.context.i18n.getText("i18n", "pluginManagement_PluginNotLoaded", oRowContext
							.getObject().pluginName));
					} else {
						this._oDetailsTextView.setText("");
					}
				}
			} else {
				this._oDetailsTextView.setText("");
			}
		},

		/**
		 * Saves the updated preferences
		 */
		updatePreferences: function() {
			var aPlugins = [];
			var oModel = this.oMainGrid.getModel();
			var that = this;

			for (var rep = 0, len = oModel.oData.repositories.length; rep < len; rep++) {
				var oRepository = oModel.oData.repositories[rep];
				if (oRepository.plugins) {
					for (var plugin = 0, leng = oRepository.plugins.length; plugin < leng; plugin++) {
						var oPlugin = oRepository.plugins[plugin];
						if (oPlugin.checked) {
							aPlugins.push(oRepository.repositoryUrl + oPlugin.pluginPath);
						}
					}
				}
			}

			var oConfig = {
				"plugins": aPlugins
			};
			return that._oPreferencePersistencyService.set(oConfig, "config.json").then(
				function(oResult) {
					that.context.service.log.info("Plugin Management",
						that.context.i18n.getText("i18n", "pluginManagement_UpdatePlugins"), ["user"]).done();
					that._bIsSavedButNotLoaded = true;
					if (that._checkedComboBoxsCount > 0) {
						that._updateButtonEnabledStatus("removeBtn", true);
					} else {
						that._updateButtonEnabledStatus("removeBtn", false);
					}
				});

		},

		_onChangeReposirory: function(oEvent) {
			// when select different repository init the textview 
			this._oPluginManagerTable.clearSelection();
			if (!oEvent.getParameter("isFirstTime")) {
				this._oDetailsTextView.setText("");
			}
			
			var aPlugins = oEvent.getParameter("selectedItem").getBindingContext().getObject().plugins;

			var oPluginsModel = new sap.ui.model.json.JSONModel();
			oPluginsModel.setData({
				"plugins": aPlugins
			});
			this._oPluginManagerTable.setModel(oPluginsModel);
			this._oPluginManagerTable.bindRows("/plugins");

		},

		_getPluginsByRepository: function(sRepositoryUrl) {
			var that = this;

			if (sRepositoryUrl === "") {
				// At the first time
				sRepositoryUrl = this.oRepositoryModel.getData().modelData[0].sRepositoryUrl;
			}
			var sCatalog = "/catalog.json";
			if (sRepositoryUrl && sRepositoryUrl.indexOf("plugins/pluginrepository") > -1) {
				if (sap.watt.getEnv("internal")) {
					sCatalog = "/cataloginternal.json";
				} else if (sap.watt.getEnv("beta_features")) {
					sCatalog = "/catalogbeta.json";
				}
			}
			var oPromise = this._serviceCall("get_catalog", sRepositoryUrl + sCatalog, "GET", null);
			return oPromise.then(function(oCatalog) {
				//for local dev - some implementations of repository might return string
				if (typeof oCatalog === "string") {
					try {
						oCatalog = JSON.parse(oCatalog);
					}
					catch(oSyntaxError) {
						return that._handleFailedLoadRepository(oSyntaxError, sRepositoryUrl);
					}
				}

				if (oCatalog.plugins) {
					return that._getPluginsData(oCatalog, sRepositoryUrl);
				} else {
					return Q([]);
				}
			}, function(oError) {
				return that._handleFailedLoadRepository(oError, sRepositoryUrl);
			});

		},
		
		_handleFailedLoadRepository : function(oError, sRepositoryUrl){
			console.log(oError);
			var sMsg = this.context.i18n.getText("i18n", "pluginManagement_FailedLoadRepository", sRepositoryUrl);
			this.context.service.log.error("Plugin Management", sMsg, ["user"]).done();
			var sPrevMsg = this._oDetailsTextView.getText();
			if (sPrevMsg) {
				sMsg = sPrevMsg + "\n" + sMsg;
			}
			this._oDetailsTextView.setText(sMsg);
			return Q([]);
		},

		
		_serviceCall: function(action, sUrl, sType, sData) {
			var oDeferred = Q.defer();
			$.ajax({
				type: sType,
				url: sUrl,
				data: JSON.stringify(sData),
				headers: {
					'Accept': '*/*',
					'Content-Type': 'application/json'
				}
			}).then(function(response) {
				oDeferred.resolve(response);
			}).fail(function(jqXHR, textStatus, errorThrown) {
				console.log("error:" + jqXHR.responseText);
				oDeferred.reject({
					"action": action,
					"status": jqXHR.status,
					"info": jqXHR.responseText
				});
			});
			return oDeferred.promise;
		},

		_isPluginAllreadyRegistered: function(sPluginPath, sRepositoryName) {
			if (this.aRegisteredPlugins) {
				var sPluginName = sRepositoryName + sPluginPath;
				for (var i = 0; i < this.aRegisteredPlugins.plugins.length; i++) {
					if (this.aRegisteredPlugins.plugins[i].indexOf(sPluginName) !== -1) {
						this._bFoundRegisteredPlugin = true;
						return true;
					}
				}
			}

			return false;
		},

		_getPluginsData: function(oCatalog, sRepositoryUrl) {
			var that = this;
			return Q.sap.require("sap/watt/core/PluginRegistry").then(function(PluginRegistry) {
				var aPluginList = PluginRegistry._mRegistry;

				var aResults = {
					"plugins": [],
					"catalogName": oCatalog.name
				};
				var aPlugins = oCatalog.plugins;
				for (var i = 0; i < aPlugins.length; i++) {
					var bCheck = that._isPluginAllreadyRegistered(aPlugins[i].path, sRepositoryUrl);
					var bStatus = true;
					var sUrl = sRepositoryUrl + aPlugins[i].path;
					if (bCheck && !that._bIsSavedButNotLoaded) {
					    that._checkedComboBoxsCount++;
						bStatus = false;
						
						for (var sPluginId in aPluginList) {
							if (sPluginId.indexOf(sUrl, sPluginId.length - sUrl.length) !== -1) {
								bStatus = true;
								break;
							}
						}
						if (!bStatus) {
							that._invalidPlugins.push(sUrl);
						}
					}
					else if (that._invalidPlugins.indexOf(sUrl) > -1 ) {
					    bStatus = false;
					}
						var pluginData = {
							"pluginName": aPlugins[i].name,
							"pluginDescription": aPlugins[i].description,
							"pluginPath": aPlugins[i].path,
							"pluginVersion": aPlugins[i].version,
							"checked": bCheck,
							"status": bStatus
						};
					aResults.plugins.push(pluginData);
				}

				return aResults;
			});

		},

		_updateRepositoryModel: function() {

			var that = this;

			return this._oPreferencePersistencyService.get("config.json").then(function(oResult) {
				that.aRegisteredPlugins = oResult;
				return that._createModel().then(function() {
					// Make sure user preferences are corresponding with the updated repository model (not including plugins that were removed from catalogs)
					return that.updatePreferences();
				});
			}, function(oError) {
				// will failed at the first time when the config.json is not exists
				return that._createModel();
			});
		},

		_createModel: function() {

			var aRepositories = [];
			var aPromises = [];

			for (var i = 0; i < this._aRepositoryList.length; i++) {
				var sRepUrl = this._aRepositoryList[i].url;

				var reposiroyData = {
					"repositoryName": this._aRepositoryList[i].name,
					"catalogName": "",
					"repositoryDescription": this._aRepositoryList[i].description,
					"repositoryUrl": sRepUrl,
					"plugins": []
				};

				var oPromise = this._getPluginsByRepository(reposiroyData.repositoryUrl);

				aPromises.push(oPromise);
				aRepositories.push(reposiroyData);
			}

			var that = this;

			return Q.all(aPromises).spread(function() {
				for (var i = 0; i < arguments.length; i++) {
					aRepositories[i].plugins = arguments[i].plugins;
					aRepositories[i].catalogName = arguments[i].catalogName;
				}
				var oModel = new sap.ui.model.json.JSONModel();
				oModel.setData({
					"repositories": aRepositories
				});
				that.oMainGrid.setModel(oModel);
			});
		},

		_sortByPluginName: function(a, b) {
			var aName = a.Name.toLowerCase();
			var bName = b.Name.toLowerCase();
			return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
		},

		_getPluginsForRep: function(sRepositoryUrl) {
			var that = this;
			// return the repository folder.
			return this.context.service.filesystem.documentProvider.getDocument(sRepositoryUrl).then(function(oRepositoryDoc) {
				if (oRepositoryDoc) {
					// return the repository content. pass true for recursive flat
					return oRepositoryDoc.getCurrentMetadata(true).then(function(oRepositoryMetadataContent) {
						if (oRepositoryMetadataContent) {
							var aPlugins = [];
							for (var i = 0; i < oRepositoryMetadataContent.length; i++) {
								var oRepositoryMetadataElement = oRepositoryMetadataContent[i];
								if (!oRepositoryMetadataElement.folder && oRepositoryMetadataElement.name === "plugin.json") {
									aPlugins.push(that.context.service.filesystem.documentProvider.getDocument(oRepositoryMetadataElement.path));
								}
							}
							
							return Q.all(aPlugins);
						} 
						
						throw new Error("The content of the selected repository url - " + sRepositoryUrl + " has not been retrieved.");
					});
				} 
				
				throw new Error("The selected repository url " + sRepositoryUrl + " wasn't found.");
			});
		},

		_updateButtonEnabledStatus: function(sBtnId, bEnabled) {

			var oButton = sap.ui.getCore().byId(sBtnId);
			oButton.setEnabled(bEnabled);
		},

		/**
		 * Gets the UI of optional plugins management
		 * @returns {sap.ui.layout.Grid}
		 */
		getOptionalPluginsUI: function() {
			this.oMainGrid = sap.ui.getCore().byId("MainPluginManagerGrid");

			if (this.oMainGrid === undefined) {
				this.oMainGrid = this._createOptionalGrid();
			}
			var that = this;
			return this._handleDestinations().then(function (){
				return that.oMainGrid;
			});

		},

		_handleDestinations: function() {
			var that = this;
			var selectedRepositoryId = this._oRepositoryDropdownBox.getSelectedItemId();

			var sPluginRepositoryPath = "";
			if ( sap.watt.getEnv("server_type") === "local_hcproxy"){
				sPluginRepositoryPath = "/webide/plugins/pluginrepository";
			}else{
				sPluginRepositoryPath = sap.watt.getEnv("context_root") + "plugins/pluginrepository";
			}
			var oSAPRepo = {
				"name": "SAPPlugins",
				"description": "SAP Plugins",
				"url": sPluginRepositoryPath
			};

			var oPluginManagerGrid = sap.ui.getCore().byId("PluginManagerGrid");
			oPluginManagerGrid.addContent(that._oProgressIndicator);
			that._oProgressIndicator.startAnimation();

			return this.context.service.destination.getDestinations("plugin_repository").then(function(aDestinations) {
				that._aRepositoryList = [oSAPRepo];
				if (aDestinations && aDestinations.length > 0) {
					that._aRepositoryList = that._aRepositoryList.concat(aDestinations);
				}

				if (that._aRepositoryList.length > 0) {

					that._bFoundRegisteredPlugin = false;

					that.oMainGrid.removeContent(that._emptyGrid);
					that._oNoteTextView.setText(that.context.i18n.getText("i18n", "pluginManagement_noteMsg"));
					oPluginManagerGrid.addContent(that._oPluginManagerTable);
					oPluginManagerGrid.addContent(that._oRemoveAllButton);
					oPluginManagerGrid.addContent(that._oDetailsTextView);
					oPluginManagerGrid.addContent(that._oNoteTextView);

					return that._updateRepositoryModel().then(function() {
						that._updateButtonEnabledStatus("removeBtn", that._bFoundRegisteredPlugin);
						// for the first time update the plugin table according to the first repository in the model.
						var oFirstItem = that._oRepositoryDropdownBox.getItems()[0];
						that._oRepositoryDropdownBox.setSelectedItemId(oFirstItem.sId);
						that._oRepositoryDropdownBox.fireEvent("change", {
							selectedItem: oFirstItem,
							isFirstTime : true
						});

					});
				} else {
					// remove the table and details if delete repository with no refreshing the browser
					oPluginManagerGrid.removeContent(that._oPluginManagerTable);
					oPluginManagerGrid.removeContent(that._oDetailsTextView);
					that.oMainGrid.addContent(that._emptyGrid);
					that._oRepositoryDropdownBox.destroyItems();

					//update the note text to No Reposiroties Note
					that._oNoteTextView.setText(that.context.i18n.getText("i18n", "pluginManagement_NoReposirotiesNote"));
					oPluginManagerGrid.addContent(that._oNoteTextView);

					// set Buttons status
					that._updateButtonEnabledStatus("removeBtn", false);
				}
			}).fail(function(oError) {
				that.context.service.usernotification.alert(oError.message).done();
			}).fin(function() {
				that._oProgressIndicator.stopAnimation();
				if (selectedRepositoryId) {
					var oSelectedRepository = sap.ui.getCore().byId(selectedRepositoryId);
					that._oRepositoryDropdownBox.setSelectedItemId(selectedRepositoryId);
					that._oRepositoryDropdownBox.fireChange({
						"selectedItem": oSelectedRepository
					});
				}
			});

		},
		
		/**
		 * Removes plugins from the user prefreneces
		 * 
		 * @param {[String]} [aPluginsToRemove]	Array of plugin names
		 */
		removePluginsFromUserPreferences : function(aPluginsToRemove) {
			if (this._oPreferencePersistencyService) {
				var that = this;
				return this._oPreferencePersistencyService.get("config.json").then(function(oResult) {
					var oNewConfig = that._removePluginsFromConfig(aPluginsToRemove, oResult);
					return that._oPreferencePersistencyService.set(oNewConfig, "config.json");
				});
			}
		},
		
		_removePluginsFromConfig : function(aPluginsToRemove, oConfig) {
			if (aPluginsToRemove && aPluginsToRemove.length > 0 && oConfig && oConfig.plugins) {
				var oNewConfig = {
					plugins : []
				};
				for (var i = 0; i < oConfig.plugins.length; i++){
					var bToBeRemoved = false;
					for (var j = 0; j < aPluginsToRemove.length; j++){
						if (aPluginsToRemove[j].indexOf(oConfig.plugins[i]) > -1) {
							bToBeRemoved = true;
							break;
						}
					}
					if (!bToBeRemoved) {
						oNewConfig.plugins.push(oConfig.plugins[i]);
					}
				}
				return oNewConfig;
			}
			return oConfig;
		},

		/**
		 * Gets a file from a plugin
		 *
		 * @param {String}	[sPlugin]	The plugin name
		 * @param {String}	[sFilePath]	The relative file path in the plugin
		 * @param {Boolean}	[bGetBlob]	Indicator whether the content of the plugin file should be returned as blob
		 * @returns {Object}			The content of the file
		 */
		getPluginFile: function(sPlugin, sFilePath, bGetBlob) {
			var oDeferred = Q.defer();
			var that = this;
			var sUrl = null;
			//check where is the plugin located
			var sPluginName = sPlugin;
			var iSplit = sPlugin.indexOf("/");
			if (iSplit > -1) {
				sPluginName = sPluginName.substring(0, iSplit);
			}

			var sRelativePath = sFilePath.substring(sFilePath.indexOf("/")); //remove the plugin folder name from path
			sUrl = require.toUrl(sPluginName + sRelativePath);

			if (!sUrl) {

				oDeferred.reject(new Error(that.context.i18n.getText("i18n", "pluginManagement_PluginNotFound", [sPluginName])));
			}

			if (!bGetBlob) {
				that._ajax(sUrl).then(
					function(oResult) {
						oDeferred.resolve(oResult);
					},
					function(oError) {
						if (oError.status === 404) {
							// TODO: Reject with domain specific Error, e.g. PluginFileError(errorId);
							// Reject the service with a defined Error
							oDeferred.reject(new Error(that.context.i18n.getText("i18n", "pluginManagement_ResourceNotFound", [
										sFilePath, sPluginName])));
						} else {
							throw new Error(that.context.i18n.getText("i18n", "pluginManagement_unexpectedErrorMsg"));
						}
					});
			} else {
				//for Blobs, we have to use XMLHttpRequest
				var oXHR = new XMLHttpRequest();
				oXHR.open('GET', sUrl);
				oXHR.responseType = 'blob';
				oXHR.onload = function(e) {
					if (this.readyState === 4 && this.status < 300) {
						oDeferred.resolve(this.response);
					} else {
						if (this.status === 404) {
							// TODO: Reject with domain specific Error, e.g. PluginFileError(errorId);
							// Reject the service with a defined Error
							oDeferred.reject(new Error(that.context.i18n.getText("i18n", "pluginManagement_ResourceNotFound", [sFilePath,
									sPluginName])));
						} else {
							throw new Error(that.context.i18n.getText("i18n", "pluginManagement_unexpectedErrorMsg"));
						}
					}
				};
				oXHR.send();
			}
			return oDeferred.promise;
		},

		/**
		 * Gets the plugin path
		 *
		 * @param {String}	[sPluginName]		The plugin name
		 * @returns {String}					The path of the plugin
		 */
		getPluginPath: function(sPluginName) {
			return Q.sap.require("sap/watt/core/PluginRegistry").then(function(oPluginRegistry) {
				for (var sPluginId in oPluginRegistry._mRegistry) {
					var oPlugin = oPluginRegistry._mRegistry[sPluginId];
					if (oPlugin.getMetadata().name === sPluginName) {
						var sPath = URI(oPlugin.getMetadata().baseURI).path();
						return sPath;
					}
				}
			});
		},

		/**
		 * @deprecated	Recommendation: Use require.toUrl(<sPlugin>/<sFilePath>) instead
		 */
		getPluginFileUrl: function(sPlugin, sFilePath) {
			var oDeferred = Q.defer();
			var that = this;

			require(["sap/watt/core/PluginRegistry"], function(oPluginRegistry) {
				var sUrl = null;
				//check where is the plugin located
				var sPluginName = sPlugin;
				var iSplit = sPlugin.indexOf("/");
				if (iSplit > -1) {
					sPluginName = sPluginName.substring(0, iSplit);
				}

				for (var sPluginId in oPluginRegistry._mRegistry) {
					var oPlugin = oPluginRegistry._mRegistry[sPluginId];
					if (oPlugin.getMetadata().name === sPluginName) {
						sUrl = oPlugin.getMetadata().baseURI;
						if (sFilePath) {
							sUrl = sUrl.substring(0, sUrl.lastIndexOf("/")) + "/" + sFilePath;
						} else {
							sUrl = sUrl.substring(0, sUrl.lastIndexOf("/")) + "/";
						}
						break;
					}
				}

				if (!sUrl) {
					oDeferred.reject(new Error(that.context.i18n.getText("i18n", "pluginManagement_PluginNotFound", [sPluginName])));
				} else {
					oDeferred.resolve(sUrl);
				}
			});
			return oDeferred.promise;
		},

		_ajax: function(sUrl) {
			return jQuery.ajax({
				url: sUrl,
				dataType: "text"
			});
		},

		addi18nBundleToGrid: function(oGrid) {
			if (this.context.i18n) {
				this.context.i18n.applyTo(oGrid);
			}
		},

		_createAvailableGrid: function() {

			var that = this;

			var oSearchGrid = new sap.ui.layout.Grid({
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12",
					linebreak: true
				})
			});

			var oSearch = new sap.ui.commons.SearchField("searchField", {
				enableListSuggest: false,
				enableClear: true,
				startSuggestion: 0,
				width: "100%",
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12",
					linebreak: true
				}),
				suggest: function(oEvent) {
					that._updateTable(oEvent.getParameter("value"));
				}
			}).addStyleClass("searchField");

			//Create an instance of the table control
			var oPluginTable = new sap.ui.table.Table("pluginTable", {
				selectionMode: sap.ui.table.SelectionMode.None,
				visibleRowCount: 20,
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12",
					linebreak: true
				})
			}).addStyleClass("pluginTable");

			oPluginTable.addColumn(new sap.ui.table.Column({
				label: new sap.ui.commons.Label({
					text: "{i18n>pluginManagement_pluginNameColumn}"
				}),
				template: new sap.ui.commons.TextView().bindProperty("text", "PluginName"),
				sortProperty: "PluginName",
				filterProperty: "PluginName",
				width: "200px"
			}));

			oPluginTable.addColumn(new sap.ui.table.Column({
				label: new sap.ui.commons.Label({
					text: "{i18n>pluginManagement_pluginLocationColumn}"
				}),
				template: new sap.ui.commons.TextView().bindProperty("text", "PluginLocation"),
				sortProperty: "PluginLocation",
				filterProperty: "PluginLocation",
				width: "500px"
			}));

			oSearchGrid.addContent(oSearch);
			oSearchGrid.addContent(oPluginTable);

			var oAvailablePluginsGrid = new sap.ui.layout.Grid("AvailablePluginsGrid", {
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12",
					linebreak: true
				}),
				content: [oSearchGrid]
			});

			this.addi18nBundleToGrid(oAvailablePluginsGrid);
			return oAvailablePluginsGrid;

		},

		_updateTable: function(sPrefix) {

			var updatedPluginList = this._filterPluginList(sPrefix); //Find the filerable plugins
			var aPluginsData = this._getAvailablePluginsData(updatedPluginList);
			var oPluginTable = sap.ui.getCore().byId("pluginTable");
			var oModel = oPluginTable.getModel();
			oModel.setData({
				modelData: aPluginsData
			});
			oModel.refresh();
		},

		_filterPluginList: function(sPlugin) {
			var aResult = [];

			for (var plugin in this._pluginList) {
				var pluginName = this._pluginList[plugin]._oMetadata.name;
				if (pluginName.indexOf(sPlugin) > -1) {
					aResult.push(this._pluginList[plugin]);
				}
			}

			return aResult;
		},

		_getAvailablePluginsData: function(plugins) {

			var aData = new Array();
			for (var plugin in plugins) {
				var pluginData = {
					PluginName: plugins[plugin]._oMetadata.name,
					PluginLocation: plugins[plugin]._oMetadata.baseURI
				};
				aData.push(pluginData);
			}
			return aData;
		},

		_updatePluginsModel: function(plugins) {

			var oModel = new sap.ui.model.json.JSONModel();
			var aPluginsData = this._getAvailablePluginsData(plugins);

			oModel.setData({
				modelData: aPluginsData
			});
			var oPluginTable = sap.ui.getCore().byId("pluginTable");
			oPluginTable.setModel(oModel);
			oPluginTable.bindRows("/modelData");
		},

		/**
		 * Gets the UI of available plugins
		 *
		 * @returns {sap.ui.layout.Grid}
		 */
		getAvailablePluginsUI: function() {
			var that = this;
			return Q.sap.require("sap/watt/core/PluginRegistry").then(function(oPluginRegistry) {
				var oUsageMonitoringService = that.context.service.usagemonitoring;
				oUsageMonitoringService.report("pluginManager", "AvailablePluginsOpened").done();
				var pluginList = oPluginRegistry._mRegistry;

				that._pluginList = pluginList;
				sap.watt.includeCSS(require.toUrl("sap.watt.platform.pluginmanager/css/pluginManager.css"));

				var oDialog = sap.ui.getCore().byId("AvailablePluginsGrid");
				if (oDialog === undefined) {
					oDialog = that._createAvailableGrid();
				}

				that._updatePluginsModel(that._pluginList);

				jQuery('#AvailablePluginsGrid').focusout(function() {
					jQuery("#searchField-tf-input").focus();
				});
				return oDialog;
			});
		}
	};
});