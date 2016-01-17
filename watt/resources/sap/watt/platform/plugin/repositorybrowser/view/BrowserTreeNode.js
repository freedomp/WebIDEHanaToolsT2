(function() {
	"use strict";
	sap.ui.commons.TreeNode.extend("sap.watt.platform.plugin.repositorybrowser.view.BrowserTreeNode", {
		metadata : {
			events : {
				"dblClick" : {}
			},
			properties : {
				"tag" : {
					type : "string",
					group : "Behavior",
					defaultValue : null
				}
			}
		}
	});

//============================== Icon Decorations ======================================================================
	sap.watt.platform.plugin.repositorybrowser.view.BrowserTreeNode.prototype.setStyleClasses = function(aStyleClasses) {
		this._aStyleClasses = aStyleClasses;
		this.invalidate();
	};

	sap.watt.platform.plugin.repositorybrowser.view.BrowserTreeNode.prototype.setDecoratorIconBottomLeft = function(oIcon) {
		this._decoratorIconBottomLeft = oIcon;
		this.invalidate();
	};

	sap.watt.platform.plugin.repositorybrowser.view.BrowserTreeNode.prototype.setDecoratorIconBottomRight = function(oIcon) {
		this._decoratorIconBottomRight = oIcon;
		this.invalidate();
	};

	sap.watt.platform.plugin.repositorybrowser.view.BrowserTreeNode.prototype.setDecoratorIconTopLeft = function(oIcon) {
		this._decoratorIconTopLeft = oIcon;
		this.invalidate();
	};

	sap.watt.platform.plugin.repositorybrowser.view.BrowserTreeNode.prototype.setDecoratorIconTopRight = function(oIcon) {
		this._decoratorIconTopRight = oIcon;
		this.invalidate();
	};

	sap.watt.platform.plugin.repositorybrowser.view.BrowserTreeNode.prototype.setDecoratorIconStyleClass = function(oStyle) {
		this._decoratorIconStyleClass = oStyle;
		this.invalidate();
	};

//=======================================================================================================================

//================================= Prefix and Suffix ===================================================================
	sap.watt.platform.plugin.repositorybrowser.view.BrowserTreeNode.prototype.setPrefix = function(oPrefix) {
		this._oPrefix = oPrefix;
		this.invalidate();
	};

	sap.watt.platform.plugin.repositorybrowser.view.BrowserTreeNode.prototype.setSuffixes = function(aSuffixes) {
		this._aSuffixes = aSuffixes;
		this.invalidate();
	};

//=======================================================================================================================	

// this was previously done on sap.ui.commons.TreeNode.prototype. ...
	sap.watt.platform.plugin.repositorybrowser.view.BrowserTreeNode.prototype.getTooltip_AsString = function() {
		return this.getText();
	};

	sap.watt.platform.plugin.repositorybrowser.view.BrowserTreeNode.prototype.addNode = function(oNode) {
		sap.ui.commons.TreeNode.prototype.addNode.call(this, oNode);
		var oTree = this._getTree();
		oTree.onPostAddNode(oNode);
	};

	sap.watt.platform.plugin.repositorybrowser.view.BrowserTreeNode.prototype.insertNode = function(oNode, index) {
		sap.ui.commons.TreeNode.prototype.insertNode.call(this, oNode, index);
		var oTree = this._getTree();
		oTree.onPostAddNode(oNode);
	};

	sap.watt.platform.plugin.repositorybrowser.view.BrowserTreeNode.prototype.destroy = function() {
		// when deleting a node with children, the UI5 Control logic iterates and calls the destroy-method
		var oTree = this._getTree();
		oTree.onPreDestroyNode(this); //to remove entry from nodeMap
		sap.ui.commons.TreeNode.prototype.destroy.call(this, this);
	};

	sap.watt.platform.plugin.repositorybrowser.view.BrowserTreeNode.prototype.ondblclick = function(oEvent) {
		this.fireDblClick();
	};

	sap.watt.platform.plugin.repositorybrowser.view.BrowserTreeNode.prototype._getTree = function() {
		var oTree = this.getTree();
		if (!oTree) {
			throw new Error("The Tree for this node " + oNode.getText() + " not available");
		}
		return oTree;
	};
}());