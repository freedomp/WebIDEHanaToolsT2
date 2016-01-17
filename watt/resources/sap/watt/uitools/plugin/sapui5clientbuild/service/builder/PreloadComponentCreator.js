define([], function() {
	"use strict";

	function create() {
		var that = this;
		return this.oResourceLocator.listResources().then(function(resources) {

			function isFileExcluded(resourcePath) {
				if (that.aExcludedFiles) {
					for (var i = 0; i < that.aExcludedFiles.length; i++) {
						if (resourcePath.indexOf("/" + that.aExcludedFiles[i]) > -1) {
							return true;
						}
					}
				}
				if (that.aExcludedFolders) {
					for (var d = 0; d < that.aExcludedFolders.length; d++) {
						if (resourcePath.indexOf("/" + that.aExcludedFolders[d]) > -1) {
							return true;
						}
					}
				}
				return false;
			}
			for (var i = 0; i < resources.length; i++) {
				//var componentResource = resources[i];
				var componentResourcePath = resources[i].path;
				if (/Component\.js$/.test(componentResourcePath)) {

					var preloadInfo = {
						moduleName: "Component-preload",
						ext: ".js",
						indicatorFile: "Component.js",
						processContent: function(content) {
							return "jQuery.sap.registerPreloadedModules(" + content + ");";
						}
					};

					var namespace = componentResourcePath.substring(1, componentResourcePath.length - "Component.js".length);

					var preloadObject = {
						version: "2.0",
						name: that.sNamespace + "/" + preloadInfo.moduleName,
						modules: {}
					};

					var aContentPromises = [];
					resources.forEach(function(resource) {
						var resourcePath = that.oResourceLocator.getResourcePath(resource.path);
						if (resourcePath.match(/\.(js|(view|fragment)\.(xml|html|json))$/) && !isFileExcluded(resourcePath)) {
							var promise = that.oResourceLocator.getDocumentContentByPath(resource.path)
							.then(function(oContent) {
									preloadObject.modules[that.sNamespace + resourcePath] = oContent;
							});
							aContentPromises.push(promise);
						}
					});

					return Q.allSettled(aContentPromises).then(function() {
						var content = JSON.stringify(preloadObject, null, '\t');
						if (typeof preloadInfo.processContent === 'function') {
							content = preloadInfo.processContent(content);
						}

						var sFileName = namespace + preloadInfo.moduleName + preloadInfo.ext;
						return that.oResourceLocator.writeResource(sFileName, content);
					});
				}
			}
		});
	}

	function PreloadComponentCreator(oResourceLocator, sNamespace, aExcludedFolders, aExcludedFiles) {
		this.oResourceLocator = oResourceLocator;
		this.sNamespace = sNamespace.replace(/\./g, "/");
		this.aExcludedFolders = aExcludedFolders;
		this.aExcludedFiles = aExcludedFiles;
	}

	PreloadComponentCreator.prototype = {
		create: create
	};

	return {
		PreloadComponentCreator: PreloadComponentCreator
	};
});