/*global define*/
define([], function() {
	"use strict";
	function buildPath(){
		return "//ns:Image[(not(@tooltip) or normalize-space(@tooltip)='') "
			+ "and (not(@ariaLabelledBy) or normalize-space(@ariaLabelledBy)='') "
			+ "and (not(@ariaDescribedBy) or normalize-space(@ariaDescribedBy)='') "
			+ "and (not(@alt) or normalize-space(@alt)='')]";
	}

	return {
		id: "XML_IMAGE_ACCESSIBILITY",
		category: "Accessibility Error",
		path: buildPath(),
		errorMsg: "An image must define one of the following attributes: tooltip, ariaLabeledBy, ariaDescribedBy, alt",
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
