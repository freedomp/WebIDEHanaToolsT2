define([], function() {

	var Discovery = function() {
		
		// predefined services list
		var services = {
			"transports": {
				"scheme": "http://www.sap.com/adt/categories/cts",
				"term": "transports"
			},
			
			"transportchecks": {
				"scheme": "http://www.sap.com/adt/categories/cts",
				"term": "transportchecks"
			},
			
			"filestore_ui5_bsp": {
				"scheme": "http://www.sap.com/adt/categories/filestore",
				"term": "filestore-ui5-bsp"
			},
			
			"search": {
				"scheme": "http://www.sap.com/adt/categories/respository", //DON'T change to "repository", this is how it is written in the discovery.xml
				"term": "search"
			},
			"ato_settings": {//s4Hana service
                "scheme": "http://www.sap.com/adt/categories/ato",                                                 
                "term": "settings"
            }

		};
		
		// returns uri of the given service
		var getUri = function(discoveryXml, service, destination) {
			if (discoveryXml) {
				var elements = jQuery(discoveryXml).find("[term='" + service.term + "']");
				for (var i = 0; i < elements.length; i++) {
					var element = elements[i];
					
					if (element.attributes && element.attributes.scheme && element.attributes.scheme.value === service.scheme) {
						if (element.parentNode) {
							var serviceUrl = element.parentNode.getAttribute("href");
							if (serviceUrl) {
								var index = serviceUrl.indexOf(destination.path);
								if (index !== -1) {
									var destPathEndIndex = index + destination.path.length;
									return destination.url + serviceUrl.substring(destPathEndIndex);
								}
							}
						}
					}
				}
			}

			return undefined;
		};
		
		
		var addUris = function(result, discoveryXml, destination) {
			var serviceKeys = Object.keys(services);
			for (var i = 0; i < serviceKeys.length; i++) {
				var serviceKey = serviceKeys[i];
				var service = services[serviceKey];
				
				result[serviceKey] = getUri(discoveryXml, service, destination);
			}
		};
		
		
		this.getStatusBySystem = function(system) {
			var that = this;
			
			return this.context.service.destination.getDestinations("dev_abap").then(function(destinations) {
				for ( var i = 0; i < destinations.length; i++) {
					var destination = destinations[i];
					if (destination.name === system.name || (destination.systemId === system.id && destination.sapClient === system.client)) {
						return that.getStatus(destination);
					}
				}
			});
		};
		
		
		// returns csrf and uris (href) of the services
		this.getStatus = function(destination) {
			if (destination) {
				var path = destination.url + "/discovery";
				
				return Q.sap.ajax({
					url : path,
					dataType : "text",
					headers : {
						'X-CSRF-Token' : 'Fetch',
						'Accept' : 'application/xml'
					}
				}).then(function(response) {
					var discoveryXml = jQuery.sap.parseXML(response[0]);
					// add csrf token
					var result = {};
					result.csrfToken = response[1].getResponseHeader("X-CSRF-Token");
					// add services uris
					addUris(result, discoveryXml, destination);
					// add destination
					result.description = destination.description;
					result.proxyUrlPrefix = destination.proxyUrlPrefix;
					
					return result;
				}).fail(function(oError) {
					if (oError.statusText !== undefined) {
						throw new Error(oError.statusText);
					} else {
						throw new Error(oError.responseText);
					}
				});
			}
		};
	};
	
	return Discovery;
});