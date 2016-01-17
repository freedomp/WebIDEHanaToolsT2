/*global define*/
define([], function() {
	"use strict";
	function buildPath(){
		// get all cells-elements with exact one ObjectIdentifier-child
		return "//ns:cells//ns:ObjectIdentifier[preceding-sibling::node() != 0]";
	}



	return {
		id: "DG_XML_FIRST_OBJECT_IDENTIFIER",
		category: "Desgin Guidelines Error",
		path: buildPath(),
		errorMsg: "A table or list entry should have an object identifier in the first column.",
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