define(["./RepositoryConstants"], function(repConst) {

	var _isLibInNeoApp = function(newRoutes, fileContent) {
		var oContent = JSON.parse(fileContent);
		var routes = oContent.routes;
		for (var index in routes) {
			if (routes[index].target) {
				if (routes[index].path === newRoutes.path &&
					routes[index].target.type === newRoutes.target.type &&
					routes[index].target.name === newRoutes.target.name) {
					return true;
				}
			}
		}
		return false;
	};

	var _isLibSameVersion = function(libraryObject, fileContent) {
		var key = libraryObject.repositoryType === repConst.ABAP ? libraryObject.destination : libraryObject.libraryExternalName;
		var oContent = JSON.parse(fileContent);
		var routes = oContent.routes;
		for (var index in routes) {
			if (routes[index].target && routes[index].target.name === key) {
				if ( libraryObject.repositoryType === repConst.ABAP || libraryObject.repositoryType === repConst.WORKSPACE ){
					return true;
				}else{
					if ((routes[index].target.version && routes[index].target.version === libraryObject.libraryVersion) || (!routes[index].target
						.version && libraryObject.libraryVersion === "Active")) {
						return true;
					}
					return false;
				}
			}
		}
		return false;
	};

	var _getUpdatedNeoAppString = function(oNeoContent, oRuntimeRoute, context, bUpdateVersion, oDesignTimeRoute) {
		var oContent = JSON.parse(oNeoContent);
		var routes = oContent.routes;

		// 		function neoAppSort(oRoute1, oRoute2) {
		// 			if (oRoute1 && oRoute1.path && oRoute2 && oRoute2.path) {
		// 				var pathLength1 = ((oRoute1.path === "/") ? 1 : oRoute1.path.split("/").length);
		// 				var pathLength2 = ((oRoute2.path === "/") ? 1 : oRoute2.path.split("/").length);
		// 				return (pathLength2 - pathLength1);
		// 			} else {
		// 				return 0;
		// 			}
		// 		}

		if (!bUpdateVersion) {
			routes.unshift(oRuntimeRoute);
			if (oDesignTimeRoute && !_isLibInNeoApp(oDesignTimeRoute, oNeoContent)) {
				routes.unshift(oDesignTimeRoute);
			}
			//routes.sort(neoAppSort);
		} else {
			var key = oRuntimeRoute.target.name;
			for (var index in routes) {
				if (routes[index].target && routes[index].target.name === key) {
					if (!oRuntimeRoute.target.version || oRuntimeRoute.target.version === "Active") {
						delete routes[index].target.version;
					} else {
						routes[index].target.version = oRuntimeRoute.target.version;
					}
				}
			}
		}
		var strContent = JSON.stringify(oContent);
		return context.service.beautifier.beautify(strContent)
			.then(function(beutifyString) {
				return beutifyString;
			});
	};

	// Function will return library object for neo-app.json if details are correct
	var _buildLibraryObjectForNeoApp = function(libraryDetails) {
		var libObj;
		var isABAP = libraryDetails.repositoryType === repConst.ABAP ? true : false;
		var path = "/resources";
		if (libraryDetails.libraryExternalName && libraryDetails.libraryExternalName !== "") {
			var libTargetNode = {
				type: isABAP ? "destination" : "application",
				name: isABAP ? libraryDetails.destination : libraryDetails.libraryExternalName
				//entryPath: libraryDetails.entryPath
			};

			if (libraryDetails.entryPath !== "") {
				libTargetNode.entryPath = libraryDetails.entryPath;
			}
			if (libraryDetails.repositoryType === repConst.HCP && libraryDetails.libraryVersion !== "Active") {
				libTargetNode.version = libraryDetails.libraryVersion;
			}
			if ( libraryDetails.isManifest){
				path += "/" + libraryDetails.libraryName.split(".").join("/") ;
			}
			libObj = {
				path: isABAP ? libraryDetails.path : path,
				target: libTargetNode,
				description: libraryDetails.libraryDescription ? libraryDetails.libraryDescription : ""
			};

		} else {
			throw new Error(this.context.service.i18n.getText("i18n", "referenceLibrary_no_Name"));
		}

		return libObj;
	};

	var _getNeoAppDocument = function(sProjectPath, oContext) {
		return oContext.service.filesystem.documentProvider.getDocument(sProjectPath + "/neo-app.json")
			.then(function(oTargetDocument) {
				if (!oTargetDocument){
					throw new Error(oContext.i18n.getText("i18n", "referenceLibrary_NeoAppNotExist"));
				}
				return oTargetDocument.getContent().then(function(oContent) {
					return oContent;
				});
			});
	};

	var _updateNeoAppFile = function(libObject, sProjectPath, context) {
		var sDesignTimePath = null;
		return context.service.filesystem.documentProvider.getDocument(sProjectPath + "/neo-app.json")
			.then(function(oTargetDocument) {
				//Get design time path
				return context.service.ui5projecthandler.getHandlerFilePath(oTargetDocument).then(function(sHandlerFilePath) {
					if (sHandlerFilePath) {
						var aElem = sHandlerFilePath.split("/");
						sDesignTimePath = sHandlerFilePath.replace("/" + aElem[1], "");
					}
				}).fail(function() {
					//Not a Fiori project
				}).then(function() {
					return oTargetDocument.getContent()
						.then(function(oContent) {
							var oRuntimeRoute = _buildLibraryObjectForNeoApp(libObject);
							var oDesignTimeRoute = null;
							if (sDesignTimePath) {
								oDesignTimeRoute = {
									path: sDesignTimePath + oRuntimeRoute.path,
									target: oRuntimeRoute.target,
									description: oRuntimeRoute.description
								};
							}
							//check if library runtime path exists in neo-app.json
							var bUpdateVersion = false;
							var isRuntimeLibExist = _isLibInNeoApp(oRuntimeRoute, oContent);
							if (isRuntimeLibExist) {
								if (libObject.repositoryType === repConst.HCP && !_isLibSameVersion(libObject, oContent)) {
									bUpdateVersion = true;
								} else {
									return Q();
								}
							}
							//var newRoutes = _buildLibraryObjectForNeoApp(libObject);
							return _getUpdatedNeoAppString(oContent, oRuntimeRoute, context, bUpdateVersion, oDesignTimeRoute).then(function(strContent) {
								return oTargetDocument.setContent(strContent)
									.then(function() {
										return oTargetDocument.save().done;
									});
							});
						});
				});
			});
	};

	return {
		isLibInNeoApp: _isLibInNeoApp,
		isLibSameVersion: _isLibSameVersion,
		buildLibraryObjectForNeoApp: _buildLibraryObjectForNeoApp,
		getUpdatedNeoAppString: _getUpdatedNeoAppString,
		updateNeoAppFile: _updateNeoAppFile,
		getNeoAppDocument: _getNeoAppDocument
	};
});