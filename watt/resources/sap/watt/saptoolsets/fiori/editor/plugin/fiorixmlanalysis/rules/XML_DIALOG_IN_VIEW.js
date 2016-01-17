/*global define*/
define([], function() {
	"use strict";
	function buildPath(){
		return "/core:View/ns:Page/following-sibling::ns:Dialog"
			+ "|/core:View/ns:Page/following-sibling::ns:Popover"
			+ "|/core:View/ns:Page/following-sibling::ns:ResponsivePopover"
			+ "|/core:View/ns:Page/following-sibling::ns:ActionSheet";
	}

	return {
		id: "XML_DIALOG_IN_VIEW",
		category: "Security Error",
		path: buildPath(),
		errorMsg: "Dialogs should not be declared in the view but rather in a separate fragment as they can result in UI artifacts.",
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
