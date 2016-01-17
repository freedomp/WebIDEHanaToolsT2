/*global define*/
define([], function() {
	"use strict";
	function buildPath(){
			// find pages with customHeader and title but title text empty or not set
		return "//ns:Page/ns:customHeader//ns:Title[not(@text) or normalize-space(@text)='']//ancestor::ns:Page"
			// find pages with customHeader and no title element within
			+ " | //ns:Page/ns:customHeader[count(descendant::ns:Title)=0]//ancestor::ns:Page"
			// find Pages without customHeader and empty title attribute or title attribute not set
			+ " | //ns:Page[count(ns:customHeader)=0 and (not(@title) or normalize-space(@title)='')]";
	}

	return {
		id: "XML_PAGE_ACCESSIBILITY",
		category: "Accessibility Error",
		path: buildPath(),
		errorMsg: "A page must define a title attribute or a custom header with a title element within.",
		validate: function(report, path, nodes){
			var result = [];
//			console.log("validating (" + this.id + ")");
			for(var i = 0; i < nodes.length; i++){
				var node = nodes[i];
				if(node){
					result.push(node);
				}
			}
			return result;
		}
	};
});
