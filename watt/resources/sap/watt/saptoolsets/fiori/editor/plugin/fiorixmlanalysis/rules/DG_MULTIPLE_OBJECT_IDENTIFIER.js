/*global define*/
define([], function() {
	"use strict";
	function buildPath(){
		//return "//ns:Table/ns:items[count(descendant::ns:ObjectIdentifier)>1]//ancestor::ns:Table//ns:ObjectIdentifier"
		//	+ "|//ns:List/ns:items[count(descendant::ns:ObjectIdentifier)>1]//ancestor::ns:List//ns:ObjectIdentifier";
		return "//ns:cells[count(descendant::ns:ObjectIdentifier)>1]//ancestor::ns:cells//ns:ObjectIdentifier";
	}


	return {
		id: "DG_MULTIPLE_OBJECT_IDENTIFIER",
		category: "Desgin Guidelines Error",
		path: buildPath(),
		errorMsg: "A table or list should only have one object identifier.",
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