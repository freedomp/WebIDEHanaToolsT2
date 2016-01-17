define(["sap/watt/lib/jszip/jszip-shim"], function(JSZip) {
	"use strict";

	return {

        configure: function(mConfig) {
            this._sdkProvider = mConfig.sdkProvider;
            if (mConfig.packageSet) {
                this._packageSet = mConfig.packageSet;
            }
        },
        
		getLibraryMetaFromHCP : function(sLibPath, sId, sType) {
			
			if ( this._sdkProvider ) {
			    console.log("Read SDK Meta from HCP SDKProvider with id "+ sId + " type " + sType);
			    var aPackSet = this._packageSet.filter(function(sets){
			        return  (sets.id === this.id && sets.type === this.type);
			    }, { id : sId, type : sType});
			    var aPackages = [];
			    if(aPackSet){
				    for (var h = 0; h < aPackSet.length; h++) {
						if (aPackSet[h].packages) {
							aPackages = aPackages.concat(aPackSet[h].packages);
						}
					}
			    }
			    switch (sType) {
			        case "js" :
			            var aFiles = ["Library.jsmeta.json", "Library.jstemplates.json"];
			            break;
			        case "xml" :
			            aFiles = ["Library.xmlmeta.json", "Library.xmltemplates.json"];
			            break;
			        default: 
			            aFiles = [];
			    }
			    return this._sdkProvider.service.getLibraryMetaFromHCP(sLibPath, aPackages, aFiles);
			} else {
			    return Q([]);
			}
/*			var sContentPath = window.location.origin + "/sapui5versions";
			// Use HCP service
			
			var d = new Q.defer();
			var aHCPLibs = [];
			var packageUrl = sContentPath + sVersionPath; // "<host>:<port>/common/plugin/javascript/service/indexFiles/ui5/1.24.5.zip";
			// TODO
			// this.context.service.ajaxrequest.serviceCall(action, heliumServiceUrl, "GET").then(function(response) { ...});
			var request = new XMLHttpRequest();
			request.open("GET", packageUrl, true);
			request.responseType = "arraybuffer";
			request.onload = function(event) {
				if (this.readyState === 4 && this.status < 300) {
					try {
						var jsZip = new JSZip();
						jsZip.load(this.response);
						for (var fileName in jsZip.files) {
							var zipObject = jsZip.files[fileName];
							if (zipObject) {
								aHCPLibs.push(zipObject);
							}
						}
						d.resolve(aHCPLibs);
					} catch (e) {
						d.reject(e);
					}
				} else {
					d.reject(new Error(packageUri));
				}
			};

			request.onerror = function(error) {
				d.reject(error);
			};
			request.send(null);

			return d.promise;
*/		}
		
	
        
	};
});