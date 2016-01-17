jQuery.sap.declare("sap.watt.platform.plugin.filesearch.view.SearchResultTreeNode");

sap.ui.commons.TreeNode.extend("sap.watt.platform.plugin.filesearch.view.SearchResultTreeNode", {
	metadata : {
		properties : {
			"lineNo" : {
				type : "string",
				group : "Misc",
				defaultValue : null
			},
			"matches" : {
				type : "int",
				group : "Misc",
				defaultValue : -1
			},
			"buttonTooltip" : {
				type : "string",
				group : "Misc",
				defaultValue : null
			},
			"occurrenceRange" : {
				type : "object",
				group : "Misc",
				defaultValue : null
			}
		}
	}
});

/** The mouse click event, which will expand/collapse the node
 * @param {event} oEvent The click event object
 * @private
 */
sap.watt.platform.plugin.filesearch.view.SearchResultTreeNode.prototype.onclick = function(oEvent){
	var oDomClicked = oEvent.target,
		oTree = this.getTree();
	if(jQuery(oDomClicked).hasClass("itemButton")){
		oTree.fireItemButtonClicked({oNode: this});
	} else {
		sap.ui.commons.TreeNode.prototype.onclick.apply(this, arguments);
	}
};