define(["sap/watt/lib/jszip/jszip-shim"],
	function(JSZip) {

		var LibraryMetaAccess = {

			configure: function(mConfig) {},

			/*===============================================================================================================
        // HCP "private" functions
        ================================================================================================================*/

			_getResponseFromHCP: function(path, responseType) {
				var oDeferred = Q.defer();
				//for Blobs, we have to use XMLHttpRequest
				var oXHR = new XMLHttpRequest();
				oXHR.open("GET", path);
				oXHR.setRequestHeader("Accept", "*/*");
				oXHR.responseType = responseType;
				oXHR.onload = function(e) {
					if (this.readyState === 4 && this.status < 300) {
						oDeferred.resolve(this.response);
					} else {
						oDeferred.reject(e);
					}
				};
				oXHR.send();
				return oDeferred.promise;
			},

			_getJSZipFromHCP: function(path) {
				return this._getResponseFromHCP(path, "arraybuffer").then(function(response) {
					var jsZip = new JSZip(response);
					return jsZip;
				});
			},

			_getJsonFromHCP: function(path) {
				//IE10 Support 
				if (!window.location.origin) {
					window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port :
						'');
				}
				return jQuery.get(window.location.origin + path).fail(function() {
					console.log("Missed " + window.location.origin + path);
				});
			},

			_getMetaFromHCP: function(path) {
				//IE10 Support 
				if (!window.location.origin) {
					window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port :
						'');
				}
				return this._getResponseFromHCP(window.location.origin + path, "text").fail(function() {
					console.log("Missed " + window.location.origin + path);
				});
			},

			/*===============================================================================================================
        // Service functions
        ================================================================================================================*/
			_deferredHCPAvailableLibraries: null,
		
			getLibraryVersionsFromHCP: function( ) {
				return this._getLibraryVersionsFromHCP();
			},

			getLibraryMetaFromHCP: function(sLibPath, aPackages, aFiles) {

				var aGets = [];
				var aHCPLibs = [];
				var asLibPath = [];
				for (var lib = 0; lib < aPackages.length; lib++) {
					var packPath = aPackages[lib].replace(/\./g, '\/');
					var sLibUrl = sLibPath + "/test-resources/" + packPath + "/designtime/codeassistance/";
					for (var f = 0; f < aFiles.length; f++) {
						var fileUri = sLibUrl + aFiles[f];
						aGets.push(this._getMetaFromHCP(fileUri));
						asLibPath.push(packPath + "/" + aFiles[f]);
					}
				}

				return Q.allSettled(aGets).spread(function() {
					var aMetaSources = [];
					var aResLibPath = [];
					for (var p = 0; p < arguments.length; p++) {
						var pState = arguments[p];
						if (pState.state === "fulfilled" && pState.value) {
							aMetaSources.push(pState.value);
							aResLibPath.push(asLibPath[p]);
						} else if (pState.state === "rejected") {
							console.log("Load rejected " + pState.reason);
						}
					}
					for (var fi = 0; fi < aMetaSources.length; fi++) {
						var jszip = new JSZip();
						var zipObj = jszip.file(aResLibPath[fi], aMetaSources[fi]);
						aHCPLibs.push(zipObj);
					}
					return aHCPLibs;
				}).fail(function() {
					return [];
				});
			},

			onAllPluginsStarted: function() {
				this._getLibraryVersionsFromHCP().done();
			},
			
			_getLibraryVersionsFromHCP: function() {
				if (this._deferredHCPAvailableLibraries) {
					return this._deferredHCPAvailableLibraries.promise;
				}
				this._deferredHCPAvailableLibraries = Q.defer();
				var that = this;
				var ui5path = "";
				var ui5 = "";
				if (sap.watt.getEnv("internal")) {
					ui5path = "/sapui5preview/neo-app.json";
					ui5 = "/sapui5preview";
				} else {
					ui5path = "/sapui5versions/neo-app.json";
					ui5 = "/sapui5versions";
				}
				this._getJsonFromHCP(ui5path).then(function(libInfo) {
					var aAvailVersions = [];
					if (libInfo.routes) {
						for (var ver = 0; ver < libInfo.routes.length; ver++) {
							var verInfo = libInfo.routes[ver];
							var oVerInfo = {};
							var oVerInfoXML = {};
							oVerInfoXML.name = oVerInfo.name = "sapui5";
							oVerInfo.id = "js";
							oVerInfoXML.id = "xml";
							oVerInfoXML.version = oVerInfo.version = verInfo.target.version;
							oVerInfoXML.remPath = oVerInfo.remPath = ui5 + verInfo.path;
							if (verInfo.path !== "/") {
								aAvailVersions.push(oVerInfo);
								aAvailVersions.push(oVerInfoXML);
							}
						}
					}
					that._deferredHCPAvailableLibraries.resolve(aAvailVersions);
				}).fail(function() {
					that._deferredHCPAvailableLibraries.resolve([]);
				}).done();
				
				return this._deferredHCPAvailableLibraries.promise;
			}
			
			
		};
		return LibraryMetaAccess;
	});