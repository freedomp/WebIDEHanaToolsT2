/*global define*/
define([], function() {
	"use strict";
	function buildPath(){
		//return "//ns:Table/ns:items[count(descendant::ns:ObjectNumber[not(@emphasized) or @emphasized='true'])>1]//ancestor::ns:Table//ns:ObjectNumber[not(@emphasized) or @emphasized='true']"
		//	+ "|//ns:List/ns:items[count(descendant::ns:ObjectNumber[not(@emphasized) or @emphasized='true'])>1]//ancestor::ns:List//ns:ObjectNumber[not(@emphasized) or @emphasized='true']";
			return "//ns:cells[count(descendant::ns:ObjectNumber[not(@emphasized) or @emphasized='true'])>1]//ancestor::ns:cells//ns:ObjectNumber[not(@emphasized) or @emphasized='true']";
	}


	return {
		id: "DG_MULTIPLE_OBJECT_NUMBER",
		category: "Desgin Guidelines Error",
		path: buildPath(),
		errorMsg: "A table or list should only have one object number with emphazized='true' (default).",
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