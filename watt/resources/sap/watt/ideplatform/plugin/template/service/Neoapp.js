define([ "sap/watt/lib/lodash/lodash"], function(_) {
	return {
		NEO_APP_FILE_NAME: "neo-app.json",
	
		_oFile: null,
		_oNeoappDocument: null,
		_mSettings: null,
		_createFilePromise: Q(),
		_saveContentPromise: Q(),
	
		init: function() {
			this._oFile = this.context.service.filesystem.documentProvider;
		},
	
		/**
		 * Returns an array of (name, version) of all applications from the Neo App
		 *
		 * @param 	{object}	oDocument			a document file in a project
		 * @returns {array}							an array of objects of all applications
		 */
			getAppllications: function(oDocument) {
			var that = this;
			var oNeoApp = [];
			return that._getProject(oDocument).then(function(oProject) {
				return that._oFile.getDocument(that._getPath(oProject, "neo-app.json")).then(function(oNeoAppDoc) {
					return that._getNeoappContent(oNeoAppDoc).then(function(oNeoAppContent) {
						var routes = oNeoAppContent.routes;
						for (var index in routes) {
							if (routes[index].target !== undefined) {
								if (routes[index].path.match("/resources") && routes[index].target.type === "application") {
									var oApp = {
										name: routes[index].target.name
									};
									if (routes[index].target.version !== undefined) {
										oApp.version = routes[index].target.version;
									}
										oNeoApp.push(oApp);
								}
							}
						}
						return _.uniq(oNeoApp, 'name');
					});
				});
			});
		},
	
		/**
		 * Adds new destination object by a given properties to the neo-app.json file
		 *
		 * @param 	{string}	sPath			a destination's path
		 * @param 	{object}	oTarget			a destination's target
		 * @param 	{string}	sDescription	a destination's description
		 * @param 	{object}	oDocument		a document file in a project
		 * @param 	{boolean}	bOverride		true to override current content
		 * @returns {object}	save content promise
		 */
		addDestination: function(sPath, oTarget, sDescription, oDocument, bOverride) {
			var that = this;
			return this.getNeoappDocumentAndContent(oDocument).spread(function(oNeoappDocument, oNeoappContent) {
				var oDestination = {
					"path": sPath,
					"target": oTarget,
					"description": sDescription
				};
				if (bOverride) {
					that._addOrOverrideDestination(oNeoappContent, oDestination);
				} else {
					oNeoappContent.routes.push(oDestination);
				}
	
				that._saveContentPromise = that._saveContentPromise.then(function() {
					return that._saveSettings(oNeoappDocument, oNeoappContent);
				});
				return that._saveContentPromise;
			});
		},
	
		_addCacheControl: function(oNeoappDocument, oNeoappContent, sDirective, nMaxAge, sPath) {
			var that = this;
			var aCurrentCacheControls = oNeoappContent.cacheControl;
	
			var oCacheControl = {
				"directive": sDirective,
				"maxAge": nMaxAge
			};
	
			if (sPath) {
				oCacheControl.path = sPath;
			}
	
			if (!aCurrentCacheControls) {
				aCurrentCacheControls = [];
			}
	
			aCurrentCacheControls.push(oCacheControl);
	
			oNeoappContent.cacheControl = aCurrentCacheControls;
	
			return that._saveSettings(oNeoappDocument, oNeoappContent);
		},
	
		/**
		 * Adds cacheControl blocks to the neo-app.json file
		 *
		 * @param 	{array}		aCacheControls		array of cache controls to be added
		 * @param 	{object}	oDocument			a document file in a project
		 * @param 	{boolean} 	bOverride			true to override current content
		 * @returns {object}	save content promise
		 */
		addCacheControls: function(aCacheControls, oDocument, bOverride) {
			var that = this;
			if (aCacheControls) {
			    return this.getNeoappDocumentAndContent(oDocument).spread(function(oNeoappDocument, oNeoappContent) {
	    		    if (!bOverride && oNeoappContent.cacheControl) { //if the neo-app has already cacheControl and the user doesn't want to override - return
	    		      //  return;
	    		    } else if (bOverride === true) {
	    		        // override all cacheControl blocks
	    		        oNeoappContent.cacheControl = aCacheControls;
	    		        return that._saveSettings(oNeoappDocument, oNeoappContent);
	    		    } else {
	    		        return that._addCacheControls(aCacheControls, oNeoappDocument, oNeoappContent).then(function() {
	    		            return that._saveSettings(oNeoappDocument, oNeoappContent);
	    		        });
	    		    }
	    		});
			}
		},
	
		/**
		 * Adds new destinations to the neo-app.json file by a given destinations array and document file in a project
		 *
		 * @param {array}		aDestinations		array of destinations to be added
		 * @param {object}		oDocument			a document file in a project
		 * @returns {object}	save content promise
		 */
		addDestinations: function(aDestinations, oDocument) {
			var that = this;
			return this.getNeoappDocumentAndContent(oDocument).spread(function(oNeoappDocument, oNeoappContent) {
				that._addDestinations(aDestinations, oNeoappContent);
				that._saveContentPromise = that._saveContentPromise.then(function() {
					return that._saveSettings(oNeoappDocument, oNeoappContent);
				});
				return that._saveContentPromise;
			});
		},
	
		_addHeaderWhiteList: function(oHeaderWhiteList, oNeoappContent) {
			if (oHeaderWhiteList && oHeaderWhiteList.length > 0) {
				oNeoappContent.headerWhiteList = [];
	
				for (var i = 0; i < oHeaderWhiteList.length; i++) {
					oNeoappContent.headerWhiteList.push(oHeaderWhiteList[i]);
				}
			}
		},
	
		/**
		 * Adds entire Neo App json content to the neo-app.json file
		 * @param {object}		oNeoapp			neo app complete object
		 * @param {object}		oDocument		a document file in a project
		 * @returns {object}	save content promise
		 */
		addNeoapp: function(oNeoapp, oDocument) {
			var that = this;
			return this.getNeoappDocumentAndContent(oDocument).spread(function(oNeoappDocument, oNeoappContent) {
				that._addDestinations(oNeoapp.destinations, oNeoappContent);
				that._addHeaderWhiteList(oNeoapp.headerWhiteList, oNeoappContent);
	
				if (oNeoapp.welcomeFile && oNeoappContent) {
					oNeoappContent.welcomeFile = oNeoapp.welcomeFile;
				}
				
				if (oNeoapp.sendWelcomeFileRedirect && oNeoappContent) {
					oNeoappContent.sendWelcomeFileRedirect = oNeoapp.sendWelcomeFileRedirect;
				}
	
				if (oNeoapp.authenticationMethod) {
					oNeoappContent.authenticationMethod = oNeoapp.authenticationMethod;
				}
	
				that._saveContentPromise = that._saveContentPromise.then(function() {
					return that._saveSettings(oNeoappDocument, oNeoappContent);
				});
				return that._saveContentPromise;
			});
		},
	
		_addDestinations: function(aDestinations, oNeoappContent) {
			var bHasResources = false;
			var bHasTestResources = false;
			if (aDestinations) {
				for (var i = 0; i < aDestinations.length; i++) {
					var sPath = aDestinations[i].path;
					//check for resource paths
					if (sPath === "/resources") {
						bHasResources = true;
					} else if (sPath === "/test-resources") {
						bHasTestResources = true;
					}
	
					this._addOrOverrideDestination(oNeoappContent, aDestinations[i]);
				}
			}
			if (!bHasResources && !this._isPathExist(oNeoappContent, "/resources")) {
				oNeoappContent.routes.push(this._getResourceMapping());
			}
			if (!bHasTestResources && !this._isPathExist(oNeoappContent, "/test-resources")) {
				oNeoappContent.routes.push(this._getTestResourceMapping());
			}
		},
	
		_addCacheControls: function(aCacheControls, oNeoappDocument, oNeoappContent) {
		    var aPromises = [];
			for (var i = 0; i < aCacheControls.length; i++) {
				aPromises.push(this._addCacheControl(oNeoappDocument, oNeoappContent, aCacheControls[i].directive, aCacheControls[i].maxAge, aCacheControls[i].path));
			}
			
			return Q.allSettled(aPromises);
		},
	
		_writeNeoappContent: function() {
			var that = this;
			return this._getNeoappDocument().then(function(oNeoappDocument) {
				return that._saveSettings(oNeoappDocument, that._mSettings);
			});
		},
	
		_getResourceMapping: function() {
			if (sap.watt.getEnv("ui5dist")) {
				return {
					"path": "/resources",
					"target": {
						"type": "destination",
						"name": "ui5dist"
					},
					"description": "SAPUI5 Resources"
				};
			} else {
				return {
					"path": "/resources",
					"target": {
						"type": "service",
						"name": "sapui5",
						"entryPath": "/resources"
					},
					"description": "SAPUI5 Resources"
				};
			}
		},
	
		_getTestResourceMapping: function() {
			if (sap.watt.getEnv("ui5dist")) {
				return {
					"path": "/test-resources",
					"target": {
						"type": "destination",
						"name": "ui5dist-test-resources"
					},
					"description": "SAPUI5 Test Resources"
				};
			} else {
				return {
					"path": "/test-resources",
					"target": {
						"type": "service",
						"name": "sapui5",
						"entryPath": "/test-resources"
					},
					"description": "SAPUI5 Test Resources"
				};
			}
		},
	
		_getNeoappContent: function(oDocument) {
			return oDocument.getContent().then(function(sContent) {
				if ("" === sContent) {
					return {
						"welcomeFile": "index.html",
						"routes": []
					};
				} else {
					var oContent =  JSON.parse(sContent);
					if(!oContent.routes){
						oContent.routes = [];
					}
					return oContent;
				}
			});
		},
	
		_isProject: function(oDocument) {
			return oDocument.getEntity().getParentPath() === "";
		},
	
		_getPath: function(oDocument, sFileName) {
			return oDocument.getEntity().getFullPath() + "/" + sFileName;
		},
	
		_getParent: function(oDocument) {
			return this._oFile.getDocument(oDocument.getEntity().getParentPath()).then(function(oParent) {
				return oParent;
			});
		},
	
		_getProject: function(oDocument) {
			var that = this;
			if (!this._isProject(oDocument)) {
				return that._getParent(oDocument).then(function(oParent) {
					return that._getProject(oParent);
				});
			} else {
				return Q(oDocument);
			}
		},
	
		/**
		 * @deprecated since 1.13 - Use getNeoappDocumentAndContent method instead!
		 * @param oDocument
		 * @returns {*}
		 */
		getDestinations: function(oDocument) {
			var that = this;
	
			return this._getNeoappDocument(oDocument).then(function(oNeoappDocument) {
				return [oNeoappDocument, that._getNeoappContent(oNeoappDocument)];
			});
		},
	
		/**
		 * Returns the neo-app document and content by a given document in the project
		 * @param oDocument
		 * @returns {array}		neoapp document object and its content
		 */
		getNeoappDocumentAndContent: function(oDocument) {
			var that = this;
	
			return this._getNeoappDocument(oDocument).then(function(oNeoappDocument) {
				return [oNeoappDocument, that._getNeoappContent(oNeoappDocument)];
			});
		},
	
		_getNeoappDocument: function(oDocument) {
			var that = this;
			if (!oDocument) {
				throw new Error(this.context.i18n.getText("i18n", "Neoapp_neoappGenerationFailedError"));
			}
			return this._getProject(oDocument).then(function(oProjectDocument) {
				return that._findDocumentOrCreate(oProjectDocument, that.NEO_APP_FILE_NAME).then(function(oNeoappDocument) {
					return oNeoappDocument;
				});
			});
		},
	
		_findDocumentOrCreate: function(oDocument, sFileName) {
			var that = this;
			this._createFilePromise = this._createFilePromise.then(function() {
				return oDocument.objectExists(sFileName).then(function(bExists) {
					if (bExists) {
						return that._oFile.getDocument(that._getPath(oDocument, sFileName));
					} else {
						return oDocument.createFile(sFileName);
					}
				});
			});
			return this._createFilePromise;
	
		},
	
		_saveSettings: function(oNeoappDocument, mSettings) {
			return oNeoappDocument.setContent(JSON.stringify(mSettings, undefined, 2)).then(function() {
				return oNeoappDocument.save();
			});
		},
	
		onAfterGeneration: function(oEvent) {
			// check if project
			if (oEvent.params.selectedTemplate.getRequiresNeoApp()) {
				if (oEvent.params.model.neoapp) {
					this.addNeoapp(oEvent.params.model.neoapp, oEvent.params.targetDocument).done();
				} else {
					this.addDestinations(oEvent.params.model.destinations, oEvent.params.targetDocument).done();
				}
	
			}
	
		},
	
		_isPathExist: function(oContent, sPath) {
			if (oContent) {
				var aRoutes = oContent.routes;
				for (var i = 0; i < aRoutes.length; i++) {
					if (aRoutes[i].path === sPath) {
						return true;
					}
				}
			}
	
			return false;
		},
	
		_addOrOverrideDestination: function(oContent, oDestination) {
			if (oContent) {
				var aRoutes = oContent.routes;
				for (var i = 0; i < aRoutes.length; i++) {
					if (aRoutes[i].path === oDestination.path) {
						aRoutes[i] = oDestination;
						return;
					}
				}
				aRoutes.push(oDestination);
			}
		}
	};
});