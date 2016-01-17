/*global define*/
define([], function() {
	"use strict";







	return {
		id: "DG_XML_FOOTER_BUTTON_TEXT_ICON",
		category: "Desgin Guidelines Error",
		path: "//ns:Page/ns:footer/*/ns:Button[@text and @icon]",
		errorMsg: "A footer button must either have an icon or a text.",
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