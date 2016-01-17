sap.ui.jsview("sap.watt.toolsets.plugin.javascript.view.JSOutlineTree", {

	getControllerName: function() {
		return "sap.watt.toolsets.plugin.javascript.view.JSOutlineTree";
	},

	createContent: function(oController) {

		var oUI5Tree = new sap.ui.commons.Tree({
			selectionChange: [oController.selectNode, oController],
			showHorizontalScrollbar: true
 
		});
		var oTreeNodeTemplate = new sap.ui.commons.TreeNode();
		oUI5Tree.setWidth("100%");
		oUI5Tree.setShowHeader(false);
		oUI5Tree.setHeight("auto");
		oTreeNodeTemplate.bindProperty("text", "name");

		oTreeNodeTemplate.bindProperty("expanded", "level",
			function(fValue) {
				if (fValue <= 1) {
					return true;
				}
				return false;
			}
		);

		oTreeNodeTemplate.bindProperty("icon", "type",
			function(fValue) {
				var isSelected = this.getProperty("isSelected");
				if (fValue === "function") {
					if (isSelected === true){
						return "resources/sap/watt/toolsets/plugin/javascript/images/funcSelected.png";
					}
					return "resources/sap/watt/toolsets/plugin/javascript/images/func.png";
				}

				return null; 
			}
		);

		oUI5Tree.bindAggregation("nodes", "/", oTreeNodeTemplate);

		return oUI5Tree;
	}

});