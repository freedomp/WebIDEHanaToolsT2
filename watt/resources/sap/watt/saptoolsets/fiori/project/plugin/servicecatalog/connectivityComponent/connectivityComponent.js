define(["sap/watt/lib/lodash/lodash"], function (_) {
    
    return {

    	configWizardSteps : function(oCatalogStep) {
    
    		return [ oCatalogStep ];
    	},
    
    	onBeforeTemplateGenerate : function(templateZip, model) {
    		return [ templateZip, model ];
    	},
    
    	// Update the service information in manifest.json file, if does not exist, in configuration.js file, 
    	// if does not exist, in the component.js file, if does not exist, in the index.html file.   
    	
    	onAfterGenerate : function(projectZip, model) {
    		var that = this;
			var aParts = model.componentPath.split("/");
			var sProjectFolderPath = "/" + aParts[1];
			var serviceType = "OData";
			var serviceSettings = {"odataVersion": "2.0"};
		    return that.context.service.fioriodata.addService(sProjectFolderPath, model.connectionData.serviceName,
                                                              model.connectionData.runtimeUrl,serviceType, serviceSettings, model.overwrite)
				.then(function(){
					return [projectZip, model];
				}).fail(function(oError){
					switch(oError.name) {
						case "UnknownProjectGuidelines" :
							return that.handleIndexHtml(model, sProjectFolderPath).then(function(){
								return [projectZip, model];
							});
						case "ParseError":
							throw new Error(that.context.i18n.getText("i18n", "invalid_json"));
						case "DataSourceNameExistInManifest" :
							throw new Error(that.context.i18n.getText("i18n", "service_name_existing_err"));
						case "ServiceExist" :
							throw new Error(that.context.i18n.getText("i18n", "service_existing_err"));
					}

				});
    	},

		handleIndexHtml : function(model, sProjectFolderPath){
			var that = this;
			return this.context.service.filesystem.documentProvider.getDocument(sProjectFolderPath).then(function(oProjectDocument) {
				return oProjectDocument.getCurrentMetadata(true).then(function(aRawData){
					var oRawNode = _.find(aRawData, function(oRawData) {return oRawData.name === "index.html"; });
					if (oRawNode !== undefined) {
						// there is index.html file
						model.needBindingFile = true;
						model.bindingFileName = "serviceBinding.js";
						return that.context.service.filesystem.documentProvider.getDocument(oRawNode.path).then(function(oFile) {
							return that._bindingFileExist(model, oFile).then(function() {
								return that._InitScriptExist(oFile, model.bindingFileName).then(function(bExistScript) {
									if (!bExistScript) {
										var newContent = that._updateIndexHtmlContent(oFile, model);
										return oFile.setContent(newContent).then(function() {
											return oFile.save().then(function(){
												return true;
											});
										});
									}
								});
							});
						});
					}
					
					throw new Error(that.context.i18n.getText("i18n", "connectivity_component_err"));
				});
			});
		},
    
    	_updateIndexHtmlContent : function(htmlFile, model) {
    		// return the index.html file content with new script for init model
    
    		var newContent = htmlFile;
    		return htmlFile.getContent().then(
    				function(htmlContent) {
    					var scriptPlace = htmlContent.lastIndexOf("</script>") + 10;
    					if(scriptPlace < 10){ // any script doesn't exists in the html file
    						scriptPlace = htmlContent.lastIndexOf("</head>")-1;
    					}
    					var headOfHtml = htmlContent.substring(0, scriptPlace);
    					var tailOfHtml = htmlContent.substr(scriptPlace, htmlContent.length);						
    					var newScript = '\n\
    		<!-- Section for service binding -->\n\
    		<script src="' + model.bindingFileName
    							+ '"></script>\n\
    		<script>\n\
    			initModel();\n\
    		</script>\n';
    					newContent = headOfHtml + newScript + tailOfHtml;
    					return newContent;
    				});
    	},
    
    	_bindingFileExist : function(model, htmlFile) {
    		var that = this;
    		return htmlFile.getParent().then(function(parent) {
    			return parent.getCurrentMetadata().then(function(aMetadataContent) {
                    var serviceFile = _.find(aMetadataContent, function(oMetadataElement){return oMetadataElement.name === model.bindingFileName;});
    				if (serviceFile === undefined || model.overwrite) {
    					return;
    				}
    				throw new Error(that.context.i18n.getText("i18n", "service_existing_err"));
    			});
    		});
    	},
    
    	_InitScriptExist : function(htmlFile, bindingFileName) {
    		// Checks if the init script already exists in the index.html file.
    		return htmlFile.getContent().then(function(htmlContent) {
    			var theScript = '<script src="' + bindingFileName + '"></script>';
    			var indexOfScript = htmlContent.search(theScript);
    			if (indexOfScript !== -1) {
    				return true;
    			} else {
    				return false;
    			}
    		});
    	}
    };
});