/*global define*/
define([], function() {
	"use strict";
	function buildPath(){
		var dialog = "//ns:Dialog[(not(@title) or normalize-space(@title)='')]",
			form = "//layoutform:SimpleForm[(not(@title) or normalize-space(@title)='')]";
			return dialog + "|" + form;
	}


	return {
		id: "XML_TITLE_ACCESSIBILITY",
		category: "Accessibility Error",
		path: buildPath(),
		errorMsg: "A dialog or simple form must define the following attribute: title",
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
