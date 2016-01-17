define([], function() {
	"use strict";

	function create() {
		var that = this;
		var sJsonContent = {
			resources: []
		};
		return this.oResourceLocator.listResources(true).then(function(resources) {
			function getFileExtension(sPath){
				var parts = sPath.split('.');
               return (parts.length > 1) ? parts.pop() : '';
			}
			for (var i = 0; i < resources.length; i++) {

				var sFileName = resources[i].name;
				var sFullPath = resources[i].path;
				var sSuffix   = getFileExtension(resources[i].path);

				if (resources[i].folder === false &&
					sFullPath.indexOf(".git") === -1 &&
					sFileName !== "sap-ui-cachebuster-info.json") {

					var resource = {};

					//Add name
					resource.name = sFullPath.substring(that.sTargetFolderPath.length + 1);

					//Add merged
					if (sFileName === "Component-preload.js" || sFileName === "resources.json") {
						resource.merged = true;
					}

					//raw
					if (sSuffix === "properties" && sFileName.indexOf("i18n") > -1) {
						resource.raw = "i18n/i18n.properties";
					} else if (sSuffix === "properties" && sFileName.indexOf("messageBundle") > -1) {
						resource.raw = "messageBundle.properties";
					}

					//Add locale
					if (resource.raw) {
						var start = sFileName.indexOf("_");
						var end = sFileName.indexOf(".properties");
						if (start > -1 && end > -1) {
							resources.locale = sFileName.substring(start, end);
						}
					}

					sJsonContent.resources.push(resource);
				}
			}

			return JSON.stringify(sJsonContent, null, 4);
		});
	}

	function ResourcesJsonCreator(oResourceLocator, sTargetFolderPath) {
		this.oResourceLocator = oResourceLocator;
		this.sTargetFolderPath = sTargetFolderPath;
	}

	ResourcesJsonCreator.prototype = {
		create: create
	};

	return {
		ResourcesJsonCreator: ResourcesJsonCreator
	};
});