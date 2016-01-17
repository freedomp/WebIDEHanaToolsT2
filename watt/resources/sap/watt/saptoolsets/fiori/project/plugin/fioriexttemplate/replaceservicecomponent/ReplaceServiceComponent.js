define([ "../manager/ComponentManager" ], function(ComponentManager) {
	var oContext;

	var	_getParentServiceName = function(oParentGuidelinesDocument, model) {
		// Get first datasource node of type OData (from app descriptor, Configuration.js or Component.js)
		return oContext.service.ui5projecthandler.getDataSourcesByType(oParentGuidelinesDocument, "OData").then(function(oDataSources) {
			if (oDataSources) {
				var keys = Object.keys(oDataSources);
				if (keys.length > 0) {
					if (model.fiori === undefined) {
						model.fiori = {};
					}
					model.fiori.replaceservice = {};				
					model.fiori.replaceservice.serviceName = keys[0];
					return;
				}
			}
			
			// No OData service to replace - report an error
			var errMsg = oContext.i18n.getText("i18n", "NoODataInParentProject");
			oContext.service.log.error(oContext.i18n.getText("i18n", "Extension_LogTitle"), errMsg, [ "system" ]).done();
			throw new Error(errMsg);
		});
	};

	var _addDataSource = function(model, oParentGuidelinesDoc, oProjectDoc) {
		var sServiceName = model.fiori.replaceservice.serviceName;
		var sUri = model.connectionData.runtimeUrl ? model.connectionData.runtimeUrl : "";
		var sLocalUri = "./" + model.fiori.replaceservice.metadataFolder + "/metadata.xml";
		return oContext.service.ui5projecthandler.isScaffoldingBased(oParentGuidelinesDoc).then(function(bIsScaffolding) {
			var addDataScourcePromise;
			if (bIsScaffolding) {
				addDataScourcePromise = oContext.service.ui5projecthandler.addExtensionForScaffoldingDataSource(oProjectDoc, sServiceName, sUri, sLocalUri, true, true);
			} else {
				var oContent = {
					"uri": sUri,
					"settings": {
						"localUri": sLocalUri
					}
				};
				addDataScourcePromise = oContext.service.ui5projecthandler.addDataSource(oProjectDoc, sServiceName, oContent, true);
			}
			return addDataScourcePromise;
		});		
	};

	var getMetadataFolder = function(model) {
		return oContext.service.filesystem.documentProvider.getDocument(model.extensionProjectPath).then(function(oParentDocumet) {
			// TODO: when supporting manifest - pass also the service name to getMetadataPath (for multi-service support)
			return oContext.service.metadataHandler.getMetadataPath(oParentDocumet).then(function(sMetadataPath) {
				var relativeMetadataFolderToComponent = sMetadataPath;
				if(relativeMetadataFolderToComponent.indexOf("/") === 0) {
					relativeMetadataFolderToComponent = relativeMetadataFolderToComponent.substring(1); // remove first '/' (for relative path)
				}
				var webappIndex = relativeMetadataFolderToComponent.indexOf("webapp/");
				if(webappIndex >= 0) {
					relativeMetadataFolderToComponent = relativeMetadataFolderToComponent.substring(webappIndex + 7); // take only the part after 'webapp' if exists
				}
				return relativeMetadataFolderToComponent;
			});
		});
	};

	var _updateMetadataAndMockSettings = function(model) {
		var extensionProjectPath = model.extensionProjectPath;

		return oContext.service.filesystem.documentProvider.getDocument(extensionProjectPath).then(function(oParentDocumet) {
			// TODO: when supporting manifest - pass also the service name to updateMetadataXml (for multi-service support)
			return Q.all([oContext.service.metadataHandler.updateMetadataXml(oParentDocumet, model.connectionData.metadataContent),
				oContext.service.mockpreview.updateSettings(oParentDocumet, {"mockUri": model.connectionData.runtimeUrl})]).then(function() {
					if (model.fiori === undefined) {
						model.fiori = {};
					}
			
					if (model.fiori.extensionCommon === undefined) {
						model.fiori.extensionCommon = {};
					}
			
					if (model.fiori.replaceservice === undefined) {
						model.fiori.replaceservice = {};
					}
			
					return getMetadataFolder(model).then(function(sMetadataFolder) {
						model.fiori.replaceservice.metadataFolder = sMetadataFolder;
					});					          	
				});
		});
	};
	
    var _updateNeoApp = function(model) {
        if(!model || !model.connectionData || !model.connectionData.destination) {
            return;
        }
        
		var extensionProjectPath = model.extensionProjectPath;
		var odataRoutesName = model.connectionData.destination.name;
		var odataRoutesDescription = model.connectionData.destination.description;

		var sPath = "/sap/opu/odata";
		var oTarget = {
			"type" : "destination",
			"name" : odataRoutesName,
			"entryPath": sPath
		};

		return oContext.service.filesystem.documentProvider.getDocument(extensionProjectPath + "/neo-app.json").then(
				function(neoAppDocument) {
					return oContext.service.neoapp.addDestination(sPath, oTarget, odataRoutesDescription, neoAppDocument, true);
				});

	};
	
	
	var _onAfterGenerate = function(projectZip, model) {
		oContext = this.context;
		return oContext.service.parentproject.getGuidelinesDocument(model.extensibility, model.extensibility.system, model.extensibility.type).then(function(oParentGuidelinesDoc) {
			return _getParentServiceName(oParentGuidelinesDoc, model).then(function() {
				return _updateMetadataAndMockSettings(model);
			}).then(function() {
				return _updateNeoApp(model);
			}).then(function() {
				return oContext.service.filesystem.documentProvider.getDocument(model.extensionProjectPath).then(function(oProjectDoc) {
					model.extensionShouldOpenFiles = true; // TODO-GS use the helper function from component manager
					return _addDataSource(model, oParentGuidelinesDoc, oProjectDoc).then(function() {
						return [projectZip, model];
					});
				});
			});
		});
		
	};

	var _configWizardSteps = function(oReplaceServiceStep) {
		return [ oReplaceServiceStep ];
	};

	return {
		onAfterGenerate : _onAfterGenerate,
		configWizardSteps : _configWizardSteps,
		
		// Internal functions - exposed for unit test
		_getParentServiceName :	_getParentServiceName,
		_addDataSource : _addDataSource,
		_updateMetadataAndMockSettings : _updateMetadataAndMockSettings
	};
});