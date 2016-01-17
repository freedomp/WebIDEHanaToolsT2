define({

	_pluginsToLoad : [],

	/**
	 * Checks if the given path points to a plugin project
	 * @param {string}		sProjectFolderPath		project folder path
	 * @returns {boolean}	true if the given project is a plugin
	 */
	isPluginProject : function(sProjectFolderPath) {
        var that = this;
		return this.context.service.filesystem.documentProvider.getDocument(sProjectFolderPath).then(function(oResult) {
		    return that.context.service.projectType.getProjectTypes(oResult).then(function(aProjectTypes){
		        for (var i=0; i<aProjectTypes.length; i++) {
		        	if(aProjectTypes[i].id === "sap.watt.uitools.ide.plugin"){
		        	    return true;
		        	}
		        }
		        return false;
		    }).fail(function() {
			return false;
		});
		}).fail(function() {
			return false;
		});
	},

	/**
	 * Writes plugins path to config-dev in Orion
	 * @param {object}		oPluginDocumentEntity		plugin document entity object
	 * @param {object}		oWindow						target window
	 * @returns {object}	target window
	 */
	writePluginToOrion : function(oPluginDocumentEntity, oWindow) {

		var pluginJsonFilePath = oPluginDocumentEntity.getBackendData().location;
		var sPluginProjectPath = oPluginDocumentEntity.getParentPath();

		var that = this;
		var aPlugins = [];
		that._rdeTargetWindow = oWindow;

		var sOrionDest = sap.watt.getEnv("orion_server");
		if (sOrionDest) {
			var iLength = sOrionDest.length - 1;
			if (sOrionDest.lastIndexOf('/') === iLength) {
				sOrionDest = sOrionDest.substring(0, iLength);
			}
		} else {
			sOrionDest = "/orion";
		}

		if (pluginJsonFilePath !== undefined && pluginJsonFilePath.trim() !== "") {
			aPlugins.push(sOrionDest + pluginJsonFilePath.substring(0, pluginJsonFilePath.indexOf("/plugin.json")));
		}

		that._pluginsToLoad = [];
		return this._readDependentPluginsRecursively(sPluginProjectPath).then(
				function() {
					var aDependentPlugins = [];
					for ( var index = 0, len = that._pluginsToLoad.length; index < len; index++) {
						var oPluginPromise = that.context.service.filesystem.documentProvider.getDocument("/" + that._pluginsToLoad[index])
								.then(function(oResult) {
									var sPluginPath = oResult.getEntity().getBackendData().location;
									var sPluginFullPath = sOrionDest + sPluginPath.substring(0, sPluginPath.lastIndexOf("/"));
									if (aPlugins.indexOf(sPluginFullPath) === -1) {
										aPlugins.push(sPluginFullPath);
									}
								}).fail(function(sError) {
									throw new Error(sError);
								});
						aDependentPlugins.push(oPluginPromise);
					}

					return Q.all(aDependentPlugins).then(function() {
						var oConfig = {
							"plugins" : aPlugins
						};
						return that.context.service.preferences.set(oConfig, "config-dev.json").then(function() {
							return that._openNewRDEWorkspaceInstance(sPluginProjectPath);
						});
					}, function(oError) {
						that._printToConsoleLog("error", oError.message);
						throw new Error(oError);
					});

				});

	},

	_openNewRDEWorkspaceInstance : function(sPluginProjectPath) {
		var that = this;
		return this._readPluginDevelopmentSectionInProjectJson(sPluginProjectPath).then(
				function(mProjectJsonSettings) {
					var sDevRDEUrl = window.location.href;
					var uri = new URI(sDevRDEUrl);

					if (mProjectJsonSettings === undefined || mProjectJsonSettings.devUrlParameters === undefined
							|| mProjectJsonSettings.devUrlParameters.length === 0) {
						that._addDefaultUrlParameters(uri);
					} else {
						var oUrlParameters;
						uri.addQuery("sap-ide-dev=true");
						sDevRDEUrl = decodeURIComponent(uri);
						oUrlParameters = mProjectJsonSettings.devUrlParameters;
						// Will not overwrite a url parameter if its key already exists in the current page.
						// For example if the current url contains looks like :
						// &aaa=true and in the devUrlParameters there is aaa=false --> it will stay :
						// &aaa=true
						for ( var param in oUrlParameters) {
							if (sDevRDEUrl.indexOf(param) === -1 && oUrlParameters[param] !== undefined && oUrlParameters[param] !== "") {
								uri.addQuery(param + "=" + oUrlParameters[param]);
								sDevRDEUrl = decodeURIComponent(uri);
							}
						}
					}

					if (that._rdeTargetWindow && !that._rdeTargetWindow.closed) {
						that._rdeTargetWindow.open(decodeURIComponent(uri), "pluginPreview");
						that._rdeTargetWindow.focus();
					}

					return that._rdeTargetWindow;
				});
	},

	/**
	 * Closes the Debug SAP Web IDE instance
	 */
	closeTargetWindow : function() {
		if (this._rdeTargetWindow && this._rdeTargetWindow.close) {
			this._rdeTargetWindow.close();
		}
	},

	_addDefaultUrlParameters : function(oURI) {
		oURI.addQuery("sap-ide-debug=false");
		oURI.addQuery("sap-ide-dev=true");
	},

	/**
	 * Reads the list of plugins that the current plugin is dependent on, from the "project.json" file.
	 * @param {string} current plugin project path.
	 * @return list of dependent plugins
	 * 
	 * The structure should be as follows:
	 * 
	 *   "plugindevelopment": {
	 *   		               "dependencies" : {  
	 *                                          "all" : [   "path to plugin 1",
	 *                                          			"path to plugin 2",...
	 *                                                  ],
	 *                                          "pluginA" :  [   "path to plugin B",
	 *                                          				  "path to plugin C",...
	 *                                                       ], 
	 *                                          "pluginA" :  [   "path to plugin D",
	 *                                          				  "path to plugin E",...
	 *                                                       ],
	 *                                                       .
	 *                                                       .
	 *                                                       .   
	 *                                          },
	 *                         "devModeUrlParameters": 
	 *                                          {                 
	 *                         					 "debugAsync" : "lite",
	 *                         					 "sap-ide-debug" : "false",
	 *                         					...
	 *                         					}
	 *                         }
	 */
	_readPluginDevelopmentSectionInProjectJson : function(sPluginProjectPath) {
		var that = this;
		return this.context.service.filesystem.documentProvider.getDocument(sPluginProjectPath).then(function(oTargetDocument) {
			return that.context.service.setting.project.get(that.context.service.plugindevelopment, oTargetDocument);
		});
	},

	_getPluginDevelopmentSection : function(sPluginProjectPath) {
		var oDocumentProvider = this.context.service.filesystem.documentProvider;
		var that = this;
		return oDocumentProvider.getDocument(sPluginProjectPath).then(function(oTargetDocument) {
			return that.context.service.setting.project.get(that.context.service.plugindevelopment, oTargetDocument);
		});
	},

	_getPluginName : function(sPluginProjectPath) {
		var oDocumentProvider = this.context.service.filesystem.documentProvider;
		var that = this;
		return oDocumentProvider.getDocument(sPluginProjectPath + "/plugin.json").then(function(oPluginDocument) {
			if (oPluginDocument && oPluginDocument.getType() === "file") {
				return oPluginDocument.getContent().then(function(oContent) {
					var opluginJsonContent = JSON.parse(oContent);
					var sPluginName = opluginJsonContent.name;
					return sPluginName;
				});
			} else {
				// failed to get the plugin.json document.
				throw new Error(that.context.i18n.getText("archive_template_resources_invalid_plugin", [sPluginProjectPath + "/plugin.json"]));
			}
		});
	},

	_readPluginDependencies : function(sPluginProjectPath) {
		var that = this;
		if (sPluginProjectPath.indexOf("/") !== 0) {
			sPluginProjectPath = "/" + sPluginProjectPath;
		}

		var aPromises = [];
		aPromises.push(that._getPluginName(sPluginProjectPath));
		aPromises.push(that._getPluginDevelopmentSection(sPluginProjectPath));

		return Q.all(aPromises).spread(function(sPluginName, oPluginDevelopmentSection) {
			var aDependentPlugins = [];
			if (oPluginDevelopmentSection !== undefined && oPluginDevelopmentSection.dependencies !== undefined) {

				if (oPluginDevelopmentSection.dependencies.hasOwnProperty(sPluginName)) {
					that._getRelevantPlugins(oPluginDevelopmentSection.dependencies[sPluginName], aDependentPlugins);
				} else if (oPluginDevelopmentSection.dependencies.hasOwnProperty("all")) {
					that._getRelevantPlugins(oPluginDevelopmentSection.dependencies.all, aDependentPlugins);
				}
			}
			return aDependentPlugins;
		});

	},

	_getRelevantPlugins : function(aPlugin, aDependentPlugins) {
		for ( var index = 0, len = aPlugin.length; index < len; index++) {
			if ((aPlugin[index] !== undefined) && (aPlugin[index].trim() !== "") && (aDependentPlugins.indexOf(aPlugin[index]) === -1)) {
				aDependentPlugins.push(aPlugin[index]);
			}
		}
	},

	_readDependentPluginsRecursively : function(sPluginProjectPath) {
		var that = this;
		return this._readPluginDependencies(sPluginProjectPath).then(
				function(aDependentPlugins) {
					if (aDependentPlugins.length > 0) {
						var aDependentPluginsPromises = [];
						for ( var index = 0, len = aDependentPlugins.length; index < len; index++) {
							if ((aDependentPlugins[index] !== undefined) && (aDependentPlugins[index].trim() !== "")
									&& (that._pluginsToLoad.indexOf(aDependentPlugins[index]) === -1)) {
								that._pluginsToLoad.push(aDependentPlugins[index]);
								aDependentPluginsPromises.push(that._readDependentPluginsRecursively(aDependentPlugins[index]));
							}
						}
						return Q.all(aDependentPluginsPromises);
					}
				});
	}

});