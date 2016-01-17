define({

	_oContextDocBuilder: undefined,
	_oCachedSmartDoc : undefined,

	init: function() {
		var that = this;
		return Q.sap.require("sap.watt.ideplatform.generationwizard/core/ContextDocBuilder").then(function(ContextDocBuilder) {
			that._oContextDocBuilder = ContextDocBuilder.initContextDocBuilder();
		});
	},

	/**
	 * Provides a smartDoc object from a given plugin and model paths
	 *
	 * @param 	{string}		sPluginPath			Plugin path
	 * @param 	{string}		sModeFilePath		Model json file path
	 * @param 	{string}		sTemplateId			Template ID for caching purposes
	 * @returns {object}
	 */
	createSmartDoc: function(sPluginPath, sModeFilePath, sTemplateId)  {
		if ( this._oContextDocBuilder) {
			var that = this;
			return this.context.service.pluginmanagement.getPluginFile(sPluginPath, sModeFilePath, false).then(
				function(model) {
					var aLoadImports = [];
					var oSmartDoc = that._oContextDocBuilder.Document(JSON.parse(model));
					if (oSmartDoc.Import) {
						for (var i = 0; i < oSmartDoc.Import.length; i++) {
							var oPromise = that.context.service.template.getTemplate(oSmartDoc.Import[i]).then(
								function(oTemplate) {
									var sImportTemplateClass = oTemplate.getTemplateClass().getProxyMetadata()
										.getName();
									return that.context.service.pluginmanagement.getPluginFile(
										sImportTemplateClass,
										oTemplate.getPath() + "/" + oTemplate.getModelFileName(), false).then(
										function(file) {
											if (file) {
												var jsFile = JSON.parse(file);
												for (var key in jsFile) {
													if (!oSmartDoc.hasOwnProperty(key)) {
														oSmartDoc.append(key, jsFile[key]);
													}
												}
											}
										});
								});
							aLoadImports.push(oPromise);
						}
					}

					return Q.all(aLoadImports).then(function() {
					    if (sTemplateId) {
					        that._oCachedSmartDoc = {
					            "id" : sTemplateId,
					            "smartDoc" : oSmartDoc
					        };
					    }
						return oSmartDoc;
					});
				});
		}

	},

	/**
	 * Returns a smartDoc object from a template.
	 * The returned smartDoc object is cached, the cache is invalidated when a different template object is passed.
	 * @param {object}		oTemplate		Template object
	 * @returns {object}
	 */
	getSmartDocByTemplate : function(oTemplate) {
	    if (oTemplate) {
	        if (this._oCachedSmartDoc && this._oCachedSmartDoc.id === oTemplate.getId()) {
	            return this._oCachedSmartDoc.smartDoc;
	        }
	        else {
	            var sModelFile = oTemplate.getModelFileName();
        		if (sModelFile) {
        			var sTemplatePath = oTemplate.getTemplateClass().getProxyMetadata().getName();
        			var sModelPath = oTemplate.getPath() + "/" + sModelFile;
        			return this.createSmartDoc(sTemplatePath, sModelPath, oTemplate.getId());
        		}
	        }
	    }
	},

	/**
	 * Clears the cached smartDoc object
	 */
	invalidateCachedSmartDoc : function() {
	    this._oCachedSmartDoc = undefined;
	}
});