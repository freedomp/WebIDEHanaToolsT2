/*global define*/
define([], function() {
	"use strict";
	function buildPath(){
		return "//ns:List[@showNoData and translate(@showNoData,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz')!='true']"
			+ "|//ns:Table[@showNoData and translate(@showNoData,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz')!='true']";
	}



	return {
		id: "DG_XML_LIST_BASE_SHOW_NO_DATA",
		category: "Desgin Guidelines Error",
		path: buildPath(),
		errorMsg: "List/Table: Attribute showNoData must be set to true",
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
