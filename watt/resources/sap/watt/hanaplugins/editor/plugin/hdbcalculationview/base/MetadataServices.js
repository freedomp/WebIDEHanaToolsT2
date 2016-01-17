/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([], function() {
    "use strict";

    /*
     * Search service provider
     */
    var SearchService = {
        search: function(searchStr, types, hdiService, onComplete, onError) {
            var hdiServiceEncoded = hdiService.replace("/","%2F");
            var restAPIDestinationURL = "/metadataapi/hdiservices/" + hdiServiceEncoded + "/dbobjects";
            var httpRequest = null;
            if (types === null) {
                restAPIDestinationURL = restAPIDestinationURL + +"?name=" + searchStr;
            } else {
                restAPIDestinationURL = restAPIDestinationURL + '?name=' + searchStr + "&type=" + types.join();
            }
			newURL = restAPIDestinationURL;
			 if(restAPIDestinationURL.indexOf("CALCULATIONVIEW")>0){
				var totalLength = restAPIDestinationURL.length;
                var index = restAPIDestinationURL.indexOf("CALCULATIONVIEW");
                var firstHalf = restAPIDestinationURL.substring(0,index);
				var secondHalf = restAPIDestinationURL.substring(index+15,totalLength);
				var newURL = firstHalf + secondHalf;
				if(newURL.indexOf("VIEW") == -1){
					newURL = firstHalf + "VIEW" + secondHalf + "&isColumnView=true";
				}
				else{
					newURL = firstHalf + "VIEW" + secondHalf;
				}
            }
            if (httpRequest !== null) {
                httpRequest.abort();
            }

            httpRequest = new XMLHttpRequest();
            httpRequest.open("GET", newURL, true);
            httpRequest.send(null);

            httpRequest.onload = function() {
                if (httpRequest.status == "200") { //success
                    if (onComplete) {
                        onComplete(httpRequest.response);
                    }
                } else {
                    if (onError) {
                        onError(httpRequest.statusText);
                    }
                }
            }
        }
    };

    /*
     * Metadata details provider
     */
    var MetadataDetails = {
        getDetails: function(name, hdiService, onComplete, onError) {
            var hdiServiceEncoded = hdiService.replace("/","%2F");
            var restAPIDestinationURL = "/metadataapi/hdiservices/" + hdiServiceEncoded + "/dbobjects";
            var httpRequest = null;
            var URLSeparator = "/";
            restAPIDestinationURL = restAPIDestinationURL + URLSeparator + name;

            if (httpRequest !== null) {
                httpRequest.abort();
            }

            httpRequest = new XMLHttpRequest();
            httpRequest.open("GET", restAPIDestinationURL, true);
            httpRequest.send(null);

            httpRequest.onload = function() {
                if (httpRequest.status == "200") { //success
                    if (onComplete) {
                        onComplete(httpRequest.response);
                    }
                } else {
                    if (onError) {
                        onError(httpRequest.statusText);
                    }
                }
            }
        }
    };

    return {
        SearchService: SearchService,
        MetadataDetails: MetadataDetails
    };
});
