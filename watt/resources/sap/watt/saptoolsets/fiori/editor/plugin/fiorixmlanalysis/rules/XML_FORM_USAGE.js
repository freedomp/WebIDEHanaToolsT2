/*global define*/
define([], function() {
	"use strict";







	return {
		id: "XML_FORM_USAGE",
		category: "Fiori Architectural Guidelines Error",
		path: "//form:*",
		errorMsg: "Usage of sap.ui.commons.form is deprecated, please use sap.ui.layout.form.",
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
