/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.SceneTree.
sap.ui.define([
	"jquery.sap.global", "./library", "sap/ui/core/Control", "sap/ui/table/TreeTable", "sap/ui/table/Column", "sap/ui/model/json/JSONModel", "sap/m/Title", "./CheckEye"
], function(jQuery, library, Control, TreeTable, Column, JSONModel, Title, CheckEye) {
	"use strict";

	/**
	 * Constructor for a new SceneTree control.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Some class description goes here.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version 1.32.3
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.vk.SceneTree
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 * @experimental Since 1.32.0 This class is experimental and might be modified or removed in future versions.
	 */
	var SceneTree = Control.extend("sap.ui.vk.SceneTree", /** @lends sap.ui.vk.SceneTree.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			properties: {
			},
			events: {
			},
			associations: {
				/*viewState: { type: "sap.ui.vk.ViewState", multiple: false }*/
			},
			aggregations: {
				_tree: {
					type: "sap.ui.table.TreeTable",
					multiple: false,
					visibility: "visible"
				}
			}
		},

		setScene: function (scene, viewStateManager) {
			this._scene = scene;
			this._viewStateManager = viewStateManager;

			if (this._viewStateManager) {
				this._viewStateManager.attachSelectionChanged(null, this._nodeSelectionChanged.bind(this));
				this._viewStateManager.attachVisibilityChanged(null, this._nodeVisibilityChanged.bind(this));				
			}
			
			this.refresh();
		},

		init: function() {
			if (Control.prototype.init) {
				Control.prototype.init.apply(this);
			}
			
			this.oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.vk.i18n");
			
			var _title = new Title({
				text: this.oResourceBundle.getText("SCENETREE_TITLE"),
				tooltip: this.oResourceBundle.getText("SCENETREE_TITLE")
			});
			
			_title.onAfterRendering = function() {
				var $this = this.$();
				$this.addClass('sapUiVkTitle');
			};
			
			this._tree = new TreeTable({
				title: _title,
				columns: [
				new Column({
					label: this.oResourceBundle.getText("SCENETREE_NAME"),
					tooltip: this.oResourceBundle.getText("SCENETREE_NAME"),
					template: "name"
				}),
				new Column({
					label: this.oResourceBundle.getText("SCENETREE_VISIBLE"),
					tooltip: this.oResourceBundle.getText("SCENETREE_VISIBLE"),
					template: new CheckEye().bindProperty("checked", "visible"), //new to bind the tooltip to SCENETREE_VISIBILITYSTATEVISIBLE SCENETREE_VISIBILITYSTATEHIDDEN depending on state
					width: "2.8em",
					resizable: false,
					hAlign: "Center"
				})
				],
				selectionMode: "Multi",
				selectionBehavior: "Row",
				visibleRowCountMode: "Auto",
				expandFirstLevel: false,
				collapseRecursive: true,
				enableSelectAll: false,
				rowHeight: 32
			});

			this.setAggregation("_tree", this._tree, true);

			this._model = new JSONModel();
			this._tree.setModel(this._model);
			this._tree.bindRows({
				path: '/root'
			});
			this._tree.attachToggleOpenState(this._nodeOpenToggle.bind(this));
			this._tree.attachRowSelectionChange(this._nodeSelection.bind(this));
			this._tree.getBinding("rows").attachChange(this._dataChange.bind(this));

			this._viewStateManager = null;
			this._scene = null;
			
			this._syncing = false;
			this._selected = {};
			this._toggled = {};
			this._vsmSelected = {};
			
			this._forwardTimer = 0;
			this._reverseTimer = 0;
			this._toExpand = null;
			
			this._vSyncing = false;
			this._lastChangeIsExpand = false;
			this._forwardVTimer = 0;
			this._reverseVTimer = 0;
			this._scrollTimer = 0;
		},

		exit: function() {

		},

		onBeforeRendering: function() {
			this._tree.setVisible(true);
		},

		_pathToNode: function(path, data, toReplace) {
			path = path.substr(1);
			if (data == undefined) {
				data = this._model.getData();
			}

			var node = data;
			var prev = node;
			var level = "";

			while (path.length > 0) {
				var pos = path.indexOf('/');

				if (pos >= 0) {
					level = path.substr(0, pos);
					path = path.substr(pos + 1);
				} else {
					level = path;
					path = "";
				}

				prev = node;
				node = prev[level];
			}

			if (toReplace != undefined) {
				prev[level] = toReplace;
			}

			return node;
		},

		_indexToNodeId: function(index) {
			var context = this._tree.getContextByIndex(index);
			if (context) {
				var node = this._pathToNode(context.sPath, context.oModel.oData);
				return node.id;
			} else {
				return null;
			}
		},
		
		_deselectHidden: function() {
			var vsm = this._vsmSelected;
			var vs = this._viewStateManager;
			var desel = [];
			var undodesel = {};

			for (var i = 0; ; i++) {
				var id = this._indexToNodeId(i);
				if (id == null) {
					break;
				}
				
				if (vsm.hasOwnProperty(id)) {
					undodesel[id] = true;
				}
			}
			
			for (var key in vsm) {
				if (vsm.hasOwnProperty(key) && vsm[key] == true && !undodesel.hasOwnProperty(key) && key != "") {
					desel.push(key);
					vsm[key] = false;
				}
			}

			if (desel.length > 0) {
				this._syncing = true;
				vs.setSelectionState(desel, false);
				this._syncing = false;
			}
		},

		_nodeSelection: function(event) {
			if (this._tree.getBinding("rows")._aSelectedContexts != undefined) {
				// If we hit this, it means TreeTable is trying to restore selection, ignore it.
				return;
			}
			if (!this._syncing) {
				if (this._forwardTimer > 0) {
					clearTimeout(this._forwardTimer);
				}

				var param = event.mParameters;
				var indices = param.rowIndices;
				var curr = this._tree.getSelectedIndices();

				if (indices.length >= 1 && curr.length == 1) {
					if (indices.indexOf(curr[0]) != -1) {
						this._deselectHidden();
					}
				}

				for (var i = 0; i < indices.length; i++) {
					var id = indices[i];

					if (this._toggled.hasOwnProperty(id)) {
						this._toggled[id] = !this._toggled[id];
					} else {
						this._toggled[id] = true;
					}
					
					if (!this._selected.hasOwnProperty(id)) {
						this._selected[id] = false;
					}
				}

				this._forwardTimer = setTimeout(this._resyncSelectionForward.bind(this), 100);
			}
		},

		_nodeSelectionChanged: function(event) {
			if (!this._syncing) {
				if (this._reverseTimer > 0) {
					clearTimeout(this._reverseTimer);
				}

				var sel = event.mParameters.selected;
				var desel = event.mParameters.unselected;

				for (var i = 0; i < desel.length; i++) {
					if (this._vsmSelected[desel[i]] != undefined) {
						delete this._vsmSelected[desel[i]];
					}
				}
				for (var i = 0; i < sel.length; i++) {
					this._vsmSelected[sel[i]] = true;
				}
				
				if (sel.length == 1) {
					this._toExpand = sel[0];
				}
				
				this._reverseTimer = setTimeout(this._resyncSelectionReverse.bind(this), 100, true);
			}
		},

		_resyncSelectionForward: function () {
			this._forwardTimer = 0;
			if (this._syncing) {
				return false;
			}

			this._syncing = true;
			var vs = this._viewStateManager;
			var vsm = this._vsmSelected;
			var sel = this._selected;

			for (var i in sel) {
				if (sel.hasOwnProperty(i)) {
					var id = this._indexToNodeId(i);
					if (id == null || id == "") {
						continue;
					}

					var issel = sel[i];// tree.isIndexSelected(i);

					if (this._toggled[i]) {
						issel = !issel;
					}

					vs.setSelectionState(id, issel);
					sel[i] = issel;
					vsm[id] = issel;
				}
			}
			
			this._toggled = {};

			this._syncing = false;
		},

		_resyncSelectionReverse: function(bScrollToSelection) {
			this._reverseTimer = 0;
			if (this._syncing) {
				return;
			}
			
			if (this._toExpand) {
				this._expandToNode(this._toExpand);
				this._toExpand = null;
			}

			this._syncing = true;
			// Slow: Tree table de-selects everything after node expand or collapse, so have to resync the selection state.
			var vs = this._viewStateManager;
			var tree = this._tree;
			var selCount = 0;
			var lastSel = -1;
			
			this._selected = {};

			for (var i = 0; ; i++) {
				var id = this._indexToNodeId(i);
				if (id == null || id == "") {
					break;
				}

				var sel = vs.getSelectionState(id);

				if (sel) {
					this._selected[i] = true;
					selCount++;
					lastSel = i;
				}

				if (sel != tree.isIndexSelected(i)) {
					if (sel) {
						tree.addSelectionInterval(i, i);
					} else {
						tree.removeSelectionInterval(i, i);
					}
				}
			}
			
			// Scroll to single selection
			if (bScrollToSelection && selCount == 1) {
				if (this._scrollTimer > 0) {
					clearTimeout(this._scrollTimer);
				}
				this._scrollTimer = setTimeout(this._scrollToSelection.bind(this), 300, lastSel);
			}
			this._syncing = false;
		},
		
		_scrollToSelection: function(sel) {
			this._scrollTimer = 0;
			var tree = this._tree;
			var top = tree._getScrollTop();
			
			var rc = tree.getRowHeight();
			var rh = tree._getScrollHeight();
			var numRows = rh / rc;
			
			while (top + numRows <= sel || top > sel) {
				
				if (top + numRows <= sel) {
					tree._scrollPageDown();
				} else {
					tree._scrollPageUp();
				}
				
				var ntop = tree._getScrollTop();
				if (ntop == top) {
					break;
				}
				
				top = ntop;
			}
		},

		_expandToNode: function(nodeId) {
			if (nodeId.constructor === Array) {
				if (nodeId.length > 0) {
					nodeId = nodeId[0];
				} else {
					return;
				}
			}
			
			var nodeInfo = this._scene.getDefaultNodeHierarchy();
			var parents = [];
			
			nodeInfo.enumerateAncestors(nodeId, function(pnode) {
				parents.push(pnode.getNodeId());
			});
			
			if (parents.length < 1) {
				return;
			}
			
			var pindex = 0;			
			for (var i = 0; pindex < parents.length; i++) {
				var id = this._indexToNodeId(i);
				if (id == null) {
					break;
				}
				
				if (id == parents[pindex]) {
					if (!this._tree.isExpanded(i)) {
						var context = this._tree.getContextByIndex(i);
						if (context) {
							var node = this._pathToNode(context.sPath, context.oModel.oData);
							this._restoreChildren(node, context.sPath);
						}
						this._tree.expand(i);
					}
					pindex++;
				}
			}
		},

		_restoreChildren: function(node, path) {
			var nodeInfo = this._scene.getDefaultNodeHierarchy();
			var binding = this._tree.getBinding("rows");
			var vsm = this._viewStateManager;
			var i = 0;
			nodeInfo.enumerateChildren(node.id, function(pnode) {
				var nodeId = pnode.getNodeId();
				var tnode = { name: pnode.getName(), id: nodeId, visible: vsm.getVisibilityState(nodeId) };

				if (pnode.getHasChildren()) {
					var cpath = path + '/' + i;
					if (binding.mContextInfo && binding.mContextInfo[cpath] != undefined && binding.mContextInfo[cpath].bExpanded) {
						this._restoreChildren(tnode, cpath);
					} else {
						tnode[0] = {};
					}
				}

				node[i] = tnode;
				i += 1;
			}.bind(this));
		},

		_restoreChildrenCollapsed: function(node, path) {
			var nodeInfo = this._scene.getDefaultNodeHierarchy();
			var binding = this._tree.getBinding("rows");
			var vsm = this._viewStateManager;
			var i = 0;
			nodeInfo.enumerateChildren(node.id, function(pnode) {
				var nodeId = pnode.getNodeId();
				var tnode = { name: pnode.getName(), id: nodeId, visible: vsm.getVisibilityState(nodeId) };

				if (pnode.getHasChildren()) {
					tnode[0] = {};
					// Prevent children from expanded in default because no data has been filled for them
					var cpath = path + '/' + i;
					if (binding.mContextInfo[cpath] != undefined) {
						binding.mContextInfo[cpath].bExpanded = false;
					}
				}

				node[i] = tnode;
				i += 1;
			});
		},

		_nodeOpenToggle: function(event) {
			if (this._reverseTimer > 0) {
				clearTimeout(this._reverseTimer);
			}
			
			var param = event.mParameters;
			var data = param.rowContext.oModel.oData;
			var path = param.rowContext.sPath;
			var node = this._pathToNode(path, data);

			if (param.expanded) {
				this._restoreChildren(node, path);
			} else if (node[0] != undefined) {
				var dummy = { name: node.name, id: node.id, visible: this._viewStateManager.getVisibilityState(node.id), 0: {} };
				this._pathToNode(path, data, dummy);
			}
			
			this._lastChangeIsExpand = true;
			
			this._reverseTimer = setTimeout(this._resyncSelectionReverse.bind(this), 100, false);
		},
		
		_dataChange: function(event) {
			if (this._viewStateManager == null || this._scene == null || this._vSyncing) {
				return;
			}
			
			if (this._lastChangeIsExpand) {
				this._lastChangeIsExpand = false;
				return;
			}
			
			if (this._forwardVTimer > 0) {
				clearTimeout(this._forwardVTimer);
			}
			
			this._forwardVTimer = setTimeout(this._resyncVisibilityForward.bind(this), 100);
		},
		
		_resyncVisibilityForward: function() {
			if (!this._vSyncing) {
				this._vSyncing = true;
				this._forwardVTimer = 0;
				this._setNodeVisibility_r(this._model.getData().root, this._viewStateManager);
				this._vSyncing = false;
			}
		},
		
		_setNodeVisibility_r: function(node, vsm) {
			if (node.id != null && vsm.getVisibilityState(node.id) != node.visible) {
				vsm.setVisibilityState(node.id, node.visible);
			}
			
			for (var i = 0; node[i] != null; i++) {
				this._setNodeVisibility_r(node[i], vsm);
			}
		},
		
		_nodeVisibilityChanged: function(event) {
			if (!this._vSyncing) {
				if (this._reverseVTimer > 0) {
					clearTimeout(this._reverseVTimer);
				}
				
				this._reverseVTimer = setTimeout(this._resyncVisibilityReverse.bind(this), 100);
			}
		},
		
		_resyncVisibilityReverse: function() {
			if (!this._vSyncing) {
				this._vSyncing = true;
				this._forwardVTimer = 0;
				this._getNodeVisibility_r(this._model.getData().root, this._viewStateManager);
				this._tree.getBinding("rows").refresh();
				this._vSyncing = false;
			}
		},
		
		_getNodeVisibility_r: function(node, vsm) {
			if (node.id != null) {	
				node.visible = vsm.getVisibilityState(node.id);
			}
			
			for (var i = 0; node[i] != null; i++) {
				this._getNodeVisibility_r(node[i], vsm);
			}
		},

		refresh: function () {
			if (this._scene == null) {
				this._model.setData([]);
				return;
			}

			var nodeInfo = this._scene.getDefaultNodeHierarchy();
			var vsm = this._viewStateManager;
			var oData = { root: { name: "root", visible: true, 0: {} } };
			var i = 0;
			nodeInfo.enumerateChildren(null, function(pnode) {
				var nodeId = pnode.getNodeId();
				var tnode = { name: pnode.getName(), id: nodeId, visible: vsm.getVisibilityState(nodeId) };

				if (pnode.getHasChildren()) {
					tnode[0] = {};
				}

				oData.root[i] = tnode;
				i += 1;
			});

			this._model.setData(oData);
		},

		onAfterRendering: function() {
		}
	});

	return SceneTree;

}, /* bExport= */ true);
