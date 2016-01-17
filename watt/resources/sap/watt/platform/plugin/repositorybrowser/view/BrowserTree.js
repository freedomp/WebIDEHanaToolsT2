(function() {
	"use strict";
	jQuery.sap.declare("sap.watt.platform.plugin.repositorybrowser.view.BrowserTree");

	jQuery.sap.require("sap.ui.commons.TreeNode");

	sap.ui.commons.Tree.extend("sap.watt.platform.plugin.repositorybrowser.view.BrowserTree", {
		metadata : {
			properties : {
				"keepState" : {
					type : "boolean",
					group : "Appearance",
					defaultValue : true
				}
			}
		}
	});

	(function() {

		sap.watt.platform.plugin.repositorybrowser.view.BrowserTree.prototype.init = function() {
			if (sap.ui.commons.Tree.prototype.init) {
				sap.ui.commons.Tree.prototype.init.call(this);
			}
			// lazy loading
			this.expandedNodeMap = null;
			this.oSelectedNode = null;
			this.nodeMap = {};

			var that = this;
			this.addEventDelegate({
				onBeforeRendering : function(evt) {
					var oDomRef = that.getDomRef();
					if (oDomRef) {
						var TreeContEl = oDomRef.querySelector(".sapUiTreeCont");
						if (TreeContEl) {
							that._scrollPos = {
								left : TreeContEl.scrollLeft,
								top : TreeContEl.scrollTop
							};
						}
					}
				}
			});
			this.addEventDelegate({
				onAfterRendering : function(evt) {
					var oDomRef = that.getDomRef();
					if (oDomRef) {
						var TreeContEl = oDomRef.querySelector(".sapUiTreeCont");
						if (TreeContEl && that._scrollPos) {
							TreeContEl.scrollLeft = that._scrollPos.left;
							TreeContEl.scrollTop = that._scrollPos.top;
						}
					}
				}
			});
		};

		sap.watt.platform.plugin.repositorybrowser.view.BrowserTree.prototype.addNode = function(oNode) {
			sap.ui.commons.TreeNode.prototype.addNode.call(this, oNode);
			this.onPostAddNode(oNode);
		};

		sap.watt.platform.plugin.repositorybrowser.view.BrowserTree.prototype.onPostAddNode = function(oNode) {
			if (this.getKeepState()) {
				if (!oNode.getTag || !oNode.getTag()) {
					return;
				}

				if (this.expandedNodeMap && this.expandedNodeMap[oNode.getTag()]) {
					oNode.setExpanded(true);
					oNode.fireToggleOpenState({
						'opened' : true,
						'postAdd' : true
					});
				}
			}

			this.nodeMap[oNode.getTag()] = oNode;
		};

		sap.watt.platform.plugin.repositorybrowser.view.BrowserTree.prototype.onPreDestroyNode = function(oNode) {
			//delete nodeMap entry for to be destroyed node
			delete this.nodeMap[oNode.getTag()];
		};

		sap.watt.platform.plugin.repositorybrowser.view.BrowserTree.prototype.setSelectedNode = function(oNode) {
			this.oSelectedNode = oNode;
		};

		sap.watt.platform.plugin.repositorybrowser.view.BrowserTree.prototype.getSelectedNode = function(oNode) {
			return this.oSelectedNode;
		};

		sap.watt.platform.plugin.repositorybrowser.view.BrowserTree.prototype.getNodeByTag = function(sTag) {
			return this.nodeMap[sTag];
		};

		sap.watt.platform.plugin.repositorybrowser.view.BrowserTree.prototype.onAfterRendering = function(fnRefresh) {
			//disable dragability for all icons
			$(".explorer .sapUiTreeIcon").each(function(index, domEle) {
				domEle.ondragstart = function(event, ui) {
					event.preventDefault();
					event.stopPropagation();
				};
			});
		};

	}());
}());