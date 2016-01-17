/*global define*/
define([], function() {
	"use strict";
	function buildPath(){
		return "//ns:Button[(not(@tooltip) or normalize-space(@tooltip)='') "
			+ "and (not(@text) or normalize-space(@text)='')]";
	}



	return {
		id: "XML_ICON_BUTTON_ACCESSIBILITY",
		category: "Accessibility Error",
		path: buildPath(),
		errorMsg: "An icon-only button must define the following attribute: tooltip",
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
