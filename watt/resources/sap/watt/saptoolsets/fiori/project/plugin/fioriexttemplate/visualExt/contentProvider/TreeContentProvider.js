define([], function() {

	var TreeContentProvider = function(context) {
		var allResources = null;

		//TODO remove extensionProjectPAth since you have the extension project document
		this.getTreeNodes = function(extensionProjectPath, extensibilityModel, oExtensionProjectDocument) {
			if (allResources === null) {
				var extensibilityType = extensibilityModel.extensibility.type;
				return context.service.extensionproject.getResourceLocation(extensionProjectPath).then(function(sResourceLocationPath) {
					var resourcesPromises = [];
					extensibilityModel.extensionResourceLocationPath = sResourceLocationPath;
					return context.service.ui5projecthandler.getAllExtensions(oExtensionProjectDocument).then(function (mAllExtensions) {
						return context.service.ui5projecthandler.getAppNamespace(oExtensionProjectDocument).then(function (sNamespace) {
							var viewsPromise = getResourceNodes(extensibilityModel, extensibilityType, "views", extensionProjectPath, sResourceLocationPath, mAllExtensions, sNamespace);
							resourcesPromises.push(viewsPromise);

							var controllersPromise = getResourceNodes(extensibilityModel, extensibilityType, "controllers", extensionProjectPath, sResourceLocationPath, mAllExtensions, sNamespace);
							resourcesPromises.push(controllersPromise);

							var fragmentsPromise = getResourceNodes(extensibilityModel, extensibilityType, "fragments", extensionProjectPath, sResourceLocationPath, mAllExtensions, sNamespace);
							resourcesPromises.push(fragmentsPromise);

							return Q.all(resourcesPromises).spread(function() {
								var resources = [];

								var viewNodes = arguments[0];
								resources = resources.concat(viewNodes);
								var controllerNodes = arguments[1];
								resources = resources.concat(controllerNodes);
								var fragmentNodes = arguments[2];
								resources = resources.concat(fragmentNodes);
								return resources;
							});
						});
					});
				});
			}
			return allResources;
		};

		//get resource nodes
		var getResourceNodes = function(extensibilityModel, extensibilityType, resourceTypes, extensionProjectPath, sResourceLocationPath, mAllExtensions, sNamespace) {
			return context.service.parentproject.getResources(extensibilityModel, resourceTypes).then(
					function(resources) {
						var resourceNodes = [];
						var resourceType = "view";

						if (resourceTypes === "controllers") {
							resourceType = "controller";
						}

						if (resourceTypes === "fragments") {
							resourceType = "fragment";
						}

						var resourceInfoPromises = [];

						for ( var v = 0; v < resources.length; v++) {
							var resource = resources[v];
							var resourceInfoPromise = getResourceInfoPromise(extensionProjectPath, sResourceLocationPath,
									resource, extensibilityType, extensibilityModel, resourceType, mAllExtensions, sNamespace);
							resourceInfoPromises.push(resourceInfoPromise);
						}

						return Q.all(resourceInfoPromises).spread(function() {
							for ( var j = 0; j < arguments.length; j++) {
								var resourceInfo = arguments[j];

								resourceNodes = resourceNodes.concat(resourceInfo); // Use the view XML itself to build the tree
							}

							return resourceNodes;
						}).fail(function(error) {
							return [];
						});
					}).fail(function(error) {
				return [];
			});
		};

		var getResourceInfoPromise = function(extensionProjectPath, sResourceLocationPath, resource, extensibilityType, extensibilityModel, resourceType, mAllExtensions, sNamespace) {

			var originalResourcePromise = null;

			switch (resourceType) {
			case "controller":
				originalResourcePromise = context.service.parentproject.getControllerInfo(resource, extensibilityType,
						extensibilityModel.extensibility.system);
				break;
			case "view":
				originalResourcePromise = context.service.parentproject.getViewInfo(resource, extensibilityType,
						extensibilityModel.extensibility.system);
				break;
			case "fragment":
				originalResourcePromise = context.service.parentproject.getFragmentInfo(resource, extensibilityType,
						extensibilityModel.extensibility.system);
				break;
			}
			return originalResourcePromise.then(function(originalResourceInfo) {
				return context.service.extensionproject.getExtendedResourceInfo(extensionProjectPath, sResourceLocationPath, originalResourceInfo, resourceType, mAllExtensions, sNamespace).then(function(replacedResourceInfo) {
					if (replacedResourceInfo.name) {
						// Update properties required for hooks functionality
						replacedResourceInfo.hooks = originalResourceInfo.hooks;
						replacedResourceInfo.resourceLocationPath = sResourceLocationPath + originalResourceInfo.resourceLocationPath;
						return replacedResourceInfo;
					}

					return originalResourceInfo;
				});

			});
		};

	};

	return TreeContentProvider;
});