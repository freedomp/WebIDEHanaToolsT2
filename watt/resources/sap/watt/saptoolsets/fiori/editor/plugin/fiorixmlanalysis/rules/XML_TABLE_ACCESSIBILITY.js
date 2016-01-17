/*global define*/
define([], function() {
	"use strict";
	function buildPath(){
			// find tables with customHeader and no title element within
		return "//ns:Table/ns:headerToolbar[count(descendant::ns:Title)=0]//ancestor::ns:Table"
			// find tables without customHeader
			+ " | //ns:Table[count(ns:headerToolbar)=0]";
	}

	return {
		id: "XML_TABLE_ACCESSIBILITY",
		category: "Accessibility Error",
		path: buildPath(),
		errorMsg: "A table must define a custom header with a title element within.",
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
