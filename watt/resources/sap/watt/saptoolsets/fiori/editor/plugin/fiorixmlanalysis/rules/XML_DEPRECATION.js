/*global define*/
define([
], function() {
	"use strict";
	var provider;

	function buildPath(){
		return "//*";
	}

	function endsWith(str, suffix) {
		return str.indexOf(suffix, str.length - suffix.length) !== -1;
	}

	function isIntresting(file){
		return endsWith(file, ".view.xml") || endsWith(file, ".fragment.xml");
	}

	function isDeprecated(namespace, name, oDeprecatedObjects){
		var id = namespace + "." + name;
		var result = {"isDeprecated": false};
		if(oDeprecatedObjects.hasOwnProperty(id)){
			return oDeprecatedObjects[id].DeprecatedInfo || {"isDeprecated": true};
		}
		return result;
	}

	function getDeprecatedObjects(libraryMetadata){
		var oDeprecatedObjects = {};
		// iterate each library file
		for(var libraryKey in libraryMetadata){
			if(libraryMetadata.hasOwnProperty(libraryKey)){
				var lib = libraryMetadata[libraryKey];
				// iterate each object in the library
				for(var objectKey in lib){
					if(lib.hasOwnProperty(objectKey)){
						var object = lib[objectKey];
						// only care about it, if it's a class an is deprecated
						if(object && object.filetype === "class" && object.Deprecated){
							oDeprecatedObjects[objectKey] = object;
						}
					}
				}
			}
		}
		return oDeprecatedObjects;
	}

	function parseDeprecationInfo(oMeta) {
		var deprecationInfo = {};
		// parse all library data
		if(oMeta && oMeta.metadata && oMeta.metadata.files){
			for(var lib in oMeta.metadata.files){
				if(oMeta.metadata.files.hasOwnProperty(lib)){
					deprecationInfo[lib] = JSON.parse(oMeta.metadata.files[lib].asText()).metadatas;
				}
			}
		}
		return deprecationInfo;
	}

	function getLibraryMetadata(aDependencies) {
		var sLib = "sapui5";
		var sVersion;
		for(var i = 0; i < aDependencies.length ;i++){
			if(aDependencies[i].library === sLib){
				sVersion = aDependencies[i].version;
				break;
			}
		}
		// load library metadata for UI5 library
		return provider.librarymetadata.getMetadata(sLib, "xml", sVersion);
	}

	function getMessage(sNamespace, sName, oDeprecationInfo){
		return "The control " + sNamespace + "." + sName + " is deprecated" +
			(oDeprecationInfo.since ? " since version " + oDeprecationInfo.since : "") + "." +
			(oDeprecationInfo.description ? "\n\t" + oDeprecationInfo.description : "");
	}

	return {
		id: "XML_DEPRECATION",
		category: "Architectural Guidelines Error",
		path: buildPath(),
		errorMsg: "",
		// setDeprecationInfo: setInfo,
		setServiceProvider: function(serviceProvider){
			provider = serviceProvider;
		},
		validate: function(report, path, nodes){
			var that = this;
			// check if all needed services are loaded
			if(provider && provider.document && provider.projectmetadata && provider.librarymetadata){
				// check if file is Intresting, only validate *.view.xml and *.fragment.xml files
				if(isIntresting(path)){
					return provider.document.getDocumentByPath(path) //load current document
					.then(provider.projectmetadata.getDependencies) // load projects metadata from neo-app.json
					.then(getLibraryMetadata) // load ui5 library metadata
					.then(parseDeprecationInfo) // parse library metadata files
					.then(getDeprecatedObjects) // collect deprecated objects from libraries
					.then(function(oDeprecatedObjects){
						var result = [];
//						console.log("validating (" + this.id + ")");
						for(var i = 0; i < nodes.length; i++){
							var node = nodes[i];
							if(node){
								var deprecationInfo = isDeprecated(node.namespaceURI, node.localName, oDeprecatedObjects);
								if(deprecationInfo.isDeprecated){
									node.message = getMessage(node.namespaceURI, node.localName, deprecationInfo);
									result.push(node);
								}
							}
						}
						return {
							id: that.id,
							category: that.category,
							errorMsg: that.errorMsg,
							violations: result
						};
					});
				}else{
					// no validation needed
					return Q([]);
				}
			}else{
//				console.error("A service is missing!");
				// no validation possible
				return Q([]);
			}
		}
	};
});