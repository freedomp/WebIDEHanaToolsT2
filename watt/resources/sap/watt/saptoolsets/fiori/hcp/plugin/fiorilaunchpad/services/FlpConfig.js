define(function() {

	var FlpConfig = function() {
        
        var FLP_CONFIG_FILE_NAME = "flp-config.json";
	    var that = this;

		this.loadConfig = function(oDocument) {
			//the oDocument is not used now, in the next phase the config will be loaded from flp-config.json file using the oDocument and returned as JSON object
			//if flp-config.json file will not be found the below will be returned.
			return {
				application: {
					id: "",
					title: "",
					description: "",
					type: "SAP_UI5_Component",
					componentUrl: "",
					appUrl: "",
					navigationComponentName: "",
					intentSemanticObject: "",
					intentAction: "",
					html5ApplicationName: ""
				},
				assignment: {
					groups: [],
					contentPackages: [],
					categories: []
				},
				tile: {
					type: "StaticTile",
					title: "",
					subtitle: "",
					searchKeywords: "",
					displayIconUrl: "",
					displayInfoText: "",
					size: "1x1",
					serviceURL: "",
					refreshInterval: ""
				}
			};
		};
		
		var getPath = function(oDocument, sFileName) {
		    return oDocument.getEntity().getFullPath() + "/" + sFileName;
	    };

		var findDocumentOrCreate = function(oDocument, sFileName) {
			return oDocument.objectExists(sFileName).then(function(bExists) {
				if (bExists) {
				    return that.context.service.filesystem.documentProvider.getDocument(getPath(oDocument, sFileName));
				} else {
					return oDocument.createFile(sFileName);
				}
			});
		};

		this.saveConfig = function(flpConfig, projectDocument) {
			return findDocumentOrCreate(projectDocument, FLP_CONFIG_FILE_NAME).then(function(flpConfigDocument) {
				return flpConfigDocument.setContent(JSON.stringify(flpConfig, undefined, 4)).then(function() {
					return flpConfigDocument.save();
				});
			});
		};
	};

	return FlpConfig;
});