define(["sap/watt/platform/plugin/utils/xml/XmlUtil"], function(xmlUtil) {

	var Search = function() {
		
		this.getPackages = function(discoveryStatus, phrase) {
			
			if (discoveryStatus.search) {
				return sendRequestForPackages(discoveryStatus, phrase).then(function(response) {
					var packages = [];
					var children = xmlUtil.firstElementChild(response[0]).childNodes;
					var entry;
					for ( var i = 0; i < children.length; i++) {
						entry = children[i];
						var packageName = {};
						packageName.name = xmlUtil.getAttribute(entry, "adtcore:name");
						packages.push(packageName);
					}

					return packages;
				});
			}
			
			throw new Error("search service was not found on " + discoveryStatus.description);
		};

		var sendRequestForPackages = function(discoveryStatus, phrase) {
			phrase = encodeURIComponent(phrase.toUpperCase());
			
			var path = discoveryStatus.search;
			path = path + "?operation=quickSearch&query=" + phrase + "%2A&useSearchProvider=X&maxResults=50&objectType=DEVC%2FK";
			
			return Q.sap.ajax({
				type : "GET",
				url : path,
				headers : {
					'Accept' : 'application/xml'
				}
			});
		};
	};
	
	return Search;
});