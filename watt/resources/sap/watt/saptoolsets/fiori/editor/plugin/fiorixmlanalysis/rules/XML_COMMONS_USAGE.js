/*global define*/
define([], function() {
	"use strict";







	return {
		id: "XML_COMMONS_USAGE",
		category: "Fiori Architectural Guidelines Error",
		path: "//commons:*",
		errorMsg: "Usage of sap.ui.commons controls is forbidden, please use controls from sap.m / sap.me or sap.ca.",
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
