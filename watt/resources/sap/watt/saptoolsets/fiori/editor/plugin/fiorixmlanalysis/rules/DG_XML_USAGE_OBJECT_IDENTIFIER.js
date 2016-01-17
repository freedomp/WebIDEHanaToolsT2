/*global define*/
define([], function() {
	"use strict";
	function buildPath(){
		//return "//ns:Table/ns:items[count(descendant::ns:ObjectIdentifier)=0]//ancestor::ns:Table"
		//	+ "|//ns:List/ns:items[count(descendant::ns:ObjectIdentifier)=0]//ancestor::ns:List";
		return "//ns:cells[count(descendant::ns:ObjectIdentifier)=0]//ancestor::ns:cells";
	}


	return {
		id: "DG_XML_USAGE_OBJECT_IDENTIFIER",
		category: "Desgin Guidelines Error",
		path: buildPath(),
		errorMsg: "A table or list should have an object identifier.",
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
