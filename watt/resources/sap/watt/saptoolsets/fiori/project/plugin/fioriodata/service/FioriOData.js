define(["sap/watt/lib/lodash/lodash"], function(_) {

	var FioriOData = function() {

		var _getFileFromFolder = function(sFile, aFolderFilesMetadata) {
			for (var index = 0; index < aFolderFilesMetadata.length; index++) {
				if (aFolderFilesMetadata[index].name === sFile && aFolderFilesMetadata[index].folder === false) {
					return aFolderFilesMetadata[index];
				}
			}

			return undefined;
		};

		this.addService = function(sProjecturl, sServiceName, sServiceUri, sServiceType, oServiceSettings, bOverwrite) {
			var that = this;
			return that.context.service.filesystem.documentProvider.getDocument(sProjecturl).then(function(oParentDocumet) {
				return that.context.service.metadataHandler.getMetadataPath(oParentDocumet, sServiceName).then(function(sPath) {
					var sMetadata = "metadata.xml";
					sPath = sPath[sPath.length - 1] === '/' ? sPath + sMetadata : sPath + "/" + sMetadata;

					if (oServiceSettings) {
						oServiceSettings.localUri = sPath;
					}

					var oServiceData = {
						"uri": sServiceUri,
						"type": sServiceType,
						"settings": oServiceSettings
					};
					return that.context.service.ui5projecthandler.addDataSource(oParentDocumet, sServiceName, oServiceData, bOverwrite).then(function(bSuccess) {
						return bSuccess;
					}).fail(function(oError) {
						throw oError;
					});
				});
			});
		};

		var getServiceUrlFromConfigurationFiles = function(oProjectDocument, oContext) {
			return oProjectDocument.getCurrentMetadata(true).then(function(aFolderContent) {
				var file = _getFileFromFolder("Configuration.js", aFolderContent);
				var regex = /"?serviceUrl"?\s*:\s*(?:(?:[\w\.]+\([\w\"\s,\.]*\))+\s*\+\s*)*"(.*?)",?/;
				var regexWithNoQuotes = /serviceUrl?\s*:\s*(?:(?:[\w\.]+\([\w\'\s,\.]*\))+\s*\+\s*)*'(.*?)',?/;

				if (file === undefined) {
					// there is no Configuration.js file
					file = _getFileFromFolder("Component.js", aFolderContent);
				}
				if (!file) {
					// no configuration files exist in the project
					return undefined;
				}
				return oContext.service.filesystem.documentProvider.getDocument(file.path).then(function(oDocument) {
					return oDocument.getContent().then(function(fileContent) {
						var matches;
						if (regex.test(fileContent)) {
							matches = regex.exec(fileContent);
							return matches[1];
						} else if (regexWithNoQuotes.test(fileContent)) {
							matches = regexWithNoQuotes.exec(fileContent);
							return matches[1];
						} else {
							return undefined;
						}
					});
				});
			});

		};

		/*
		 * Returns the service URL used in the given project.
		 * Searches in the project's App Descriptor file - currently searches for the first service according to the given type,
		 * and if it doesn't exist it searches in Configuration.js/Component.js file.
		 *
		 * In case of no service defined properly, returns undefined.
		 */
		this.getServiceUrl = function(sProjecturl, sServiceType) {
			var that = this;

			// read the AppDescriptor from the project
			return this.context.service.filesystem.jsonProvider.readJson(sProjecturl, "manifest.json", true).then(function(oManifestJson) {

				var oDataSources = oManifestJson["sap.app"].dataSources;
				if (oDataSources) { // dataSources block exists

					var aKeys = _.keys(oDataSources);
					var aValues = _.values(oDataSources);
					for (var i = 0; i < aKeys.length; i++) {
						// return the first service url of the given type
						if (aValues[i].type === sServiceType) {
							return aValues[i].uri;
						}
					}
				}

				return that.context.service.filesystem.documentProvider.getDocument(sProjecturl).then(function(oProjectDocument) {
					return getServiceUrlFromConfigurationFiles(oProjectDocument, that.context);
				});
			}).fail(function(oError) {
				// failed to read the AppDescriptor file or it doesn't exist.
				// get the service from one of the configuration files as a fallback
				return that.context.service.filesystem.documentProvider.getDocument(sProjecturl).then(function(oProjectDocument) {
					return getServiceUrlFromConfigurationFiles(oProjectDocument, that.context);
				});
			});
		};
	};

	return FioriOData;
});