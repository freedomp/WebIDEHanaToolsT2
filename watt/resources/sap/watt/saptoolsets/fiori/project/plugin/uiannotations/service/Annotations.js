define({
	_sModelFolderName: "model",
	_CATALOG_ODATA_ABAP: "odata_abap",
	_sMockServiceURL : "MockServer/Service",
	_sMockAnnotaionURL : "MockServer/annotations/",

	_callAjax: function(sUrl, sType, oData, sDataType) {
		return Q(jQuery.ajax({
			type: sType,
			url: sUrl,
			data: oData,
			dataType: sDataType
		})).then(null, function(oXHR) {
			//Turn the XHR into an exception with a message
			var oError = new Error("Request failed: " + oXHR.statusText + " URI: " + sUrl);
			oError.status = oXHR.status;
			oError.statusText = oXHR.statusText;
			oError.responseText = oXHR.responseText;
			oError.responseJSON = oXHR.responseJSON;
			throw oError;
		});
	},

	/**
	 * Gets the annotation file content as xml
	 * @param 	{object}	oDestination 				an object which consists of : description, name, path, url and wattUsage
	 * @param 	{string}	sAnnotationsRelativeUrl		annotation relative URL
	 * @returns {string}	the xml content as string
	 */
	getAnnotationXML: function(oDestination, sAnnotationsRelativeUrl) {
		var sAnnotationURI = sAnnotationsRelativeUrl;
		var aResult = [];
		if (sAnnotationsRelativeUrl && oDestination && oDestination.path && oDestination.url) {
			if (sAnnotationsRelativeUrl.indexOf("/destinations") == -1) {
				sAnnotationURI = sAnnotationsRelativeUrl.replace(oDestination.path, oDestination.url);
			}
			return this._callAjax(sAnnotationURI, "GET", null).then(function(oResponse) {
				var oSerializer = new XMLSerializer();
				jQuery(oResponse).contents().each(function(iIndex, oNode) {
					aResult.push(oSerializer.serializeToString(oNode));

				});
				return aResult.join("\n");
			});
		}
		return "";
	},

	/**
	 * Checks if metadata contains annotations
	 *
	 * @param 		{object}		oMetaDataContent		metadata file content
	 * @returns 	{boolean}		true if the given metadata contains annotation
	 */
	isMetaDataContainsAnnotions: function(oMetaDataContent) {
		return Q.sap.require("sap/watt/platform/plugin/utils/xml/XmlUtil").then(function(xmlUtil) {
			var responseXml = xmlUtil.stringToXml(oMetaDataContent);
			var children = xmlUtil.firstElementChild(responseXml).childNodes;
			var size = children.length;
			for (var i = 0; i < size; i++) {
				var entry = children[i];
				//to check if this the default structure !!!
				var categoryElement = xmlUtil.getChildByTagName(entry, "Schema");
				if (categoryElement) {
					var annotationsElement = xmlUtil.getChildByTagName(categoryElement, "Annotations");
					if (annotationsElement) {
						return true;
					}
				}
			}
			return false;
		});
	},

	/**
	 * Mocks files for creating meta model
	 * @param {string}		sServiceURL				The Service url. null if it needs to be mocked
	 * @param {string}		sMetadataContent		The Metadata content to return by the mock
	 * @param {Array}		aAnnotations			Array of annotations files to be mocked
	 */
	mockFiles : function(sServiceURL, sMetadataContent, aAnnotations){
			var aPromises = [];	
			var that = this;
			if (!sServiceURL) {
				//var sMetadataContent = that.getModel().getProperty("/connectionData/metadataContent");
				aPromises.push(that.context.service.mockFileLoader.mockFile(that._sMockServiceURL+ "/$metadata", sMetadataContent));
				
			}
			if (aAnnotations){
				for(var i=0; i< aAnnotations.length ; i++) {
					var sAnnotationUrl = aAnnotations[i].url;
					if (!sAnnotationUrl){
						var sAnnotationName = aAnnotations[i].name;
						sAnnotationUrl =  that._sMockAnnotaionURL+ sAnnotationName;
						var sAnnotationContent = aAnnotations[i].content;
						aPromises.push(that.context.service.mockFileLoader.mockFile(sAnnotationUrl, sAnnotationContent));
	
						
					}
				}
			}
			return Q.all(aPromises);
	},

	/**
	 * Creates and return metaModel based on the service and list of annotation files
	 * @param 	{string}		sServiceUri		Service URI
	 * @param 	{Array}			aAnnotations	Array of annotations
	 * @returns {object}		metaModel based on the service and list of annotation files
	 */
	getMetaModel: function(sServiceUri, aAnnotations) {
	
		var fnModel = sap.ui.model.odata.v2.ODataModel;
		var aAnnotationsUrls = [];
		sServiceUri = sServiceUri || this._sMockServiceURL; //for mock
		aAnnotationsUrls.push(sServiceUri + "/$metadata");
		if (aAnnotations) {
			for (var i = 0; i < aAnnotations.length; i++) {
				var sAnnotationName = aAnnotations[i].name;
				var sAnnotationUrl = aAnnotations[i].url ||  (this._sMockAnnotaionURL + sAnnotationName);
				aAnnotationsUrls.push(sAnnotationUrl);
			}
		}

		var oModel = new fnModel(sServiceUri,{
			annotationURI: aAnnotationsUrls,
			json: true,
			loadMetadataAsync: true
		});

		if (oModel.getMetaModel) {
			return Q(oModel.getMetaModel().loaded()).then(function() {
				//that.getModel().setProperty("/metaModel", oModel.getMetaModel()); //ask rotem for fail case
				return oModel.getMetaModel();
			});
		} else {
			return Q();
		}
	},

	/**
	 * Returns an array of Annotations files urls for a specific service and destination
	 * @param 	{object}		oDestination	Destination object
	 * @param 	{string}		sServiceUri		Service URI
	 * @returns {Array}			Array of annotations urls
	 */
	getAnnotationsUrls: function(oDestination, sServiceUri) {
		var oDeferred = Q.defer();
		var sUrl = oDestination.url;
		if (oDestination.wattUsage === this._CATALOG_ODATA_ABAP && !oDestination.isFullUrl) {
			sUrl = oDestination.url + "/IWFND/CATALOGSERVICE;v=2";
		}
		var annoUrl = sUrl + sServiceUri + "/Annotations";
		var annotaionsUrls = [];
		return this._callAjax(annoUrl, "GET", null, "json").then(function(oData) {
			if (oData.d.results && oData.d.results.length > 0) {
				annotaionsUrls = oData.d.results;
			}
			oDeferred.resolve(annotaionsUrls);
			return annotaionsUrls;
		}).fail(function(oError) {
			oDeferred.reject(oError);
		});
	}
});