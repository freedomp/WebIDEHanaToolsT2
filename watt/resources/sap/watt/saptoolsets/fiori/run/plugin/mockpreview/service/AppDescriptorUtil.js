define(["sap/watt/lib/lodash/lodash"], function( _) {
	"use strict";
	
	var appDescriptorHandler = {
	
		getMetadataPath: function(oDocument) {
			var that = this;
			//get first datasource node of type OData (from app descriptor) and try to find the metadata path from there
			return that.context.service.ui5projecthandler.isManifestProjectGuidelinesType(oDocument).then(function(isManifestProjectGuidelinesType) {
				var result;
				if (isManifestProjectGuidelinesType) {
					return that.context.service.ui5projecthandler.getDataSourcesByType(oDocument, "OData").then(function(oDataSources) {
						if (oDataSources) {
							var aValues = _.values(oDataSources);
							if (aValues[0] && aValues[0].settings) {
								result = aValues[0].settings.localUri;
							}
						}
						return result;
					});
				}
				return result;
			}).fail(function() {
				// failed to read the AppDescriptor file or it doesn't exist.
				return undefined;
			});
		},

		// get array of annotations which exist in appdescriptor
		getAnnotations: function(oDocument) {
			var that = this;
			return that.context.service.ui5projecthandler.getDataSourcesByType(oDocument, "ODataAnnotation").then(function(oAnnotationNodes) {
				if (oAnnotationNodes) {
					var aValues = _.values(oAnnotationNodes);
					var aAnnotations = [];
					for (var i = 0; i < aValues.length; i++) {
						aAnnotations.push({
							annotationUri: aValues[i].uri,
							annotationLocalUri: aValues[i].settings ? aValues[i].settings.localUri : undefined
						});
					}
					return aAnnotations;
				} else {
					return [];
				}
			}).fail(function() {
				// failed to read the AppDescriptor file or it doesn't exist.
				return [];
			});
		},
		
		getAppNamespace : function(oDocument) {
			return this.context.service.ui5projecthandler.getAppNamespace(oDocument).then(function(sAppNamespace) {
				return sAppNamespace;
			}).fail(function() {
				return "";
			});
		}
	
	};

	return appDescriptorHandler;
});