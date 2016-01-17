/*global define*/
define([], function() {
	"use strict";







	return {
		id: "XML_LAYOUT_USAGE",
		category: "Fiori Architectural Guidelines Error",
		path: "//layout:*",
		errorMsg: "Usage of sap.ui.commons.layout is deprecated, please use sap.ui.layout.",
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
