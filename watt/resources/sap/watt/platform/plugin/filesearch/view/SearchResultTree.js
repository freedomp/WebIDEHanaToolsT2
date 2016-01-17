jQuery.sap.declare("sap.watt.platform.plugin.filesearch.view.SearchResultTree");

jQuery.sap.require("sap.ui.commons.TreeNode");

sap.ui.commons.Tree.extend("sap.watt.platform.plugin.filesearch.view.SearchResultTree", {
	metadata : {
		properties : {
			"term" : {
				type : "string",
				group : "Misc",
				defaultValue : null
			}
		},
		events : {
			"itemButtonClicked" : {}
		}
	}
});