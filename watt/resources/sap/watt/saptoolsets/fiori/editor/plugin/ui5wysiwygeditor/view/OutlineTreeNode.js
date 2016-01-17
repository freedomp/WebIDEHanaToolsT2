sap.ui.define(
	[
		"sap/ui/commons/TreeNode"
	],
	function (TreeNode) {
		"use strict";

		return TreeNode.extend("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.view.OutlineTreeNode",
			/** @lends {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.view.OutlineTreeNode}
			 * @extends {sap.ui.commons.TreeNode} */ {
			metadata: {
				properties: {
					"tag": {type: "string", group: "Behavior", defaultValue: null},
					"controlId": {type: "string", group: "Behavior", defaultValue: null},
					"aggregationName": {type: "string", group: "Behavior", defaultValue: null}
				}
			}
		});
	},
	/* bExport= */ true
);