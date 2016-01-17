define(function() {

	var WorkspaceParentProject = function() {

		var that = this;
		var pathSeparator = "/";

		var addOrionDestination = function(parentDestinations) {
			var destinations = parentDestinations;
			
			var notFound = true;
			var orionPath = sap.watt.getEnv("orion_server");
			
			for (var i = 0; i < destinations.length; i++) {
				if (destinations[i].path === orionPath) {
					notFound = false;
					break;
				}
			}

			if (notFound) {
				var orionDestination = {
					"path" : orionPath,
					"target" : {
						"type" : "service",
						"name" : "orion",
						"preferLocal" : true
					},
					"description" : "Orion Server"
				};

				destinations.push(orionDestination);
			}
			
			return destinations;
		};

		this.getRuntimeDestinations = function(system, parentDestinations) {
			return addOrionDestination(parentDestinations);
		};
        
        this.getFileResourcesInfo = function(parentProjectPath) {
			return that.context.service.filesystem.documentProvider.getDocument(parentProjectPath).then(function(oDocument) {
				return oDocument.getCurrentMetadata(true).then(function(aRawData) {
					var resourcesInfo = [];

					for (var i = 0; i < aRawData.length; i++) {
						var oRawData = aRawData[i];

						if (!oRawData.folder) {

							var resourceInfo = {
								"name" : oRawData.name,
								"path" : oRawData.path,
								"parentFolderPath" : oRawData.path.substring(0, oRawData.path.lastIndexOf("/"))
							};

							resourcesInfo.push(resourceInfo);
						}
					}
					
					return resourcesInfo;
				});
			});
		};

		/*
		 * Get the i18n folder and all its .properties files, from the parent application located in workspace
		 */
		this.geti18nFolderFiles = function(i18nFolderPath) {
			return that.context.service.filesystem.documentProvider.getDocument(i18nFolderPath).then(function(i18nFolder) {
				// get all files in the i18n folder
				return i18nFolder.getFolderContent();
			});
		};
		
		/*
		 * Get the model folder and all its files, from the parent application located in workspace
		 */
		this.getModelFolderFiles = function(sMetadataFilePath) {
			var aDocumentPromises = [];
			// get the parent project
			var sModelFolderPath = sMetadataFilePath.substring(0, sMetadataFilePath.lastIndexOf(pathSeparator));
			return that.context.service.filesystem.documentProvider.getDocument(sModelFolderPath).then(function(oModelFolderDoc) {
				// get all files in the model folder - as metadata objects
				return oModelFolderDoc.getCurrentMetadata(true).then(function(aModelFolderFiles) {
					// create a document for each metadata object
					for (var i = 0 ; i < aModelFolderFiles.length ; i++) {
						aDocumentPromises.push(that.context.service.filesystem.documentProvider.getDocument(aModelFolderFiles[i].path));						
					}
					
					// return an array of documents
					return Q.all(aDocumentPromises);
				});
			});
		};

		this.getDocument = function(resourcePath) {
			return that.context.service.filesystem.documentProvider.getDocument(resourcePath);
		};

		this.import = function(/*sParentPath*/) {
			
		};
	};

	return WorkspaceParentProject;
});