define(["sap/watt/lib/lodash/lodash"], function(_) {
	"use strict";

	return {
		BSP_EXECUTE_ABAP : "bsp_execute_abap",

		getAdditionalData: function(aAdditionalData) {
			var oAdditionalData = {};

			if (aAdditionalData) {
				for (var i = 0; i < aAdditionalData.length; i++) {
					if (aAdditionalData[i] === "api_mgmt") {
						oAdditionalData.isApimgmt = true;
					}
					if (aAdditionalData[i] === "full_url") {
						oAdditionalData.isFullUrl = true;
					}
				}
			}

			return oAdditionalData;
		},
		
		 /** 
	     * Compare destination alphabetic by its description
	     * @param destinationA
	     * @param destinationB
	     * @returns
	     */
	    compareDestinationsByDescription: function(destinationA, destinationB) {
			if (destinationA.description.toLowerCase() < destinationB.description.toLowerCase()) {
				return -1;
			}
			if (destinationA.description.toLowerCase() > destinationB.description.toLowerCase()) {
				return 1;
			}
			return 0;
		},
		/** 
		  * Returns array of connection based on the provided filter 
		  * @param oDestinationSrv - destination service to fetch all destination
		  * @param aFilter - array of usages
		  * @param bAddBSPConnections - BSPs connections will be added. but not duplicated.
		  * @returns
		  */
		 getConnections : function (aDestinations,aFilter,bAddBSPConnections){
		    var that = this; 
		   
		    	var aConnections = that.getFormatterConnections(aDestinations,aFilter);
		    	if (!bAddBSPConnections){
		        	return aConnections;
		    	}else{
		    		that.addBSPConnections(aDestinations,aConnections);
		    		return aConnections;
		    	}		    		 
		},
		
		/** 
		  *  Adds connections with usage = bsp_execute_abap. It adds only the one that doesn't already 
		  *  exists in the list
		  * @param aDestinations - all destinations
		  * @param aConnections - the list of filtered connections
		  * @returns array of connections
		  */
		 addBSPConnections : function (aDestinations,aConnections){
			var that = this;
			var aBSPDestinations = [];
			aBSPDestinations = aDestinations.filter(function(oValue) {
				return (oValue.wattUsage === that.BSP_EXECUTE_ABAP);
			});
			aBSPDestinations.sort(that.compareDestinationsByDescription);
			aBSPDestinations.forEach(function(oConnection) {
				var bAlreadyAdded = false;
				for ( var i = 0; i < aConnections.length; i++) {
					if (aConnections[i].name === oConnection.description) {
						aConnections[i].destinationBSP = oConnection;
						bAlreadyAdded = true;
						break;
					}
				}
				if (!bAlreadyAdded) {
					aConnections.push(that.createDestination(oConnection));
				}
			});
			return aConnections;
		},
		
		//Update the internal object used to save required data on each connection
		/** 
		  * Returns connections with one of usage listed in aDataConnectionTypes
		  * @param aDestinations - All destinations
		  * @param aDataConnectionTypes - array of usages
		  * @returns
		  */
		 getFormatterConnections: function(aDestinations,aDataConnectionTypes) {
			var that = this;
			var aFormattedDestinations = [];
			var aFilteredDestination = [];
			if (aDestinations) {
				aFilteredDestination = aDestinations.filter(function(oValue) {
					var res = false;
					aDataConnectionTypes.forEach(function(dataConnectionType) {
						if (oValue.wattUsage === dataConnectionType){
							res =  true;
						}
					});
					return res;
				});
			}

			// Sorts the destinations in the drop-down list, according to the destination's description 
			aFilteredDestination.sort(that.compareDestinationsByDescription);

			aFilteredDestination.forEach(function(oConnection) {
				aFormattedDestinations.push(that.createDestination(oConnection));
			});
			
			return aFormattedDestinations;
		},

		/** 
		  * creates a destination object
		  * @param oConnection 
		  * @returns
		  */
		 createDestination: function(oConnection) {
			var sUrl = oConnection.url;

			var oDestination = {
				url: sUrl,
				name: oConnection.description,
				type: oConnection.wattUsage,
				destination: oConnection
			};

			jQuery.extend(oDestination, this.getAdditionalData(oConnection.additionalData));
			return oDestination;
		},
		
		/**
		* Returns Url path with "/" in the beggining and end and without $metadata
		* @param {String} sUrl Url srting
		* @return {String} Url path
		*/
		getUrlPath : function(sUrl) {
			if (sUrl) {
				var sBaseUrl = URI(sUrl).path().toString().replace(/\$metadata/g, "");
				sBaseUrl = sBaseUrl[0] === "/" ? sBaseUrl : "/" + sBaseUrl;
				sBaseUrl = sBaseUrl[sBaseUrl.length - 1] === "/" ? sBaseUrl : sBaseUrl + "/";
				return sBaseUrl;
			}
		},

		/**
		* Gets a Url path to a design time Url path
		* @param {Object} oDestination a destination object with a path and url
		* @param {String} sBaseUrl Url path
		* @return {String} Url path
		*/
		getDesigntimeUrl : function(oDestination, sBaseUrl) {
			if (oDestination && sBaseUrl) {
				var sNewUrl = sBaseUrl;

				if (!_.startsWith(sNewUrl, "/")) {
					var oError = new Error("URL is not supported.");
					oError.name = "UrlNotSupported";
					throw oError;
				}

				// add proxy prefix for odata services
				if (sNewUrl.indexOf(oDestination.url) === -1) {
					if (sNewUrl.indexOf(oDestination.path) !== -1) {
						sNewUrl = sNewUrl.replace(oDestination.path, oDestination.url);
					} else if (!_.startsWith(sNewUrl, "/destinations/")) {
						sNewUrl = _.trimRight(oDestination.url, "/") + "/" + _.trimLeft(sNewUrl, "/");
					}
				}

				return sNewUrl;
			}
		},
		
		/**
		* Gets a Url path to a runtime time Url path
		* @param {String} sUrl Url path
		* @param {Object} oDestination a destination object with a path and url
		* @return {String} Url path
		*/
		getRuntimeUrl: function(sUrl, oDestination) {
			if (sUrl && oDestination) {
				if (!_.startsWith(sUrl, "/")) {
				    var oError = new Error("URL is not supported.");
					oError.name = "UrlNotSupported";
					throw oError;
				}
	
				var runtimeUrl = sUrl.replace(oDestination.url, oDestination.path);
				//Runtime Url must contain path inorder to work with destinations
				if (runtimeUrl.indexOf(oDestination.path) === -1) {
					if (!_.startsWith(runtimeUrl, "/destinations")){
						runtimeUrl = oDestination.path + runtimeUrl;
					}
				}
				// remove occurrences of "//" in new url
				runtimeUrl = runtimeUrl.replace(/\/\//g, '/');

				// add "/" to the end of the url - otherwise will cause problems in runtime
				if (runtimeUrl.indexOf("/", runtimeUrl.length - 1) === -1) {
					runtimeUrl += "/";
				}

				return runtimeUrl;
			}
		},
		//for security matters, remove the domain from the URL
		removeAbsoluteURL : function(sMetaData,sDestinationUrl){
			if(!sMetaData || !sDestinationUrl ) {return sMetaData;}
			var pos  = sMetaData.indexOf(sDestinationUrl);
			if (pos === -1) {
				return sMetaData;
			}
			var end = pos + sDestinationUrl.length; //including the destination name
			var start = sMetaData.lastIndexOf("=", end); //the begining of the url 
			if(start === -1) {return sMetaData;} //not posible but to avoid bug
			var pathToRemove = sMetaData.substring(start+2,end); //place start after equal sign
 			sMetaData = sMetaData.replace(new RegExp(pathToRemove, 'g'),"."); //replace all occurrences
			return sMetaData;
			
		}
	};
});