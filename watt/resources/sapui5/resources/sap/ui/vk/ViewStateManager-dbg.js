/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the ViewStateManager class.
sap.ui.define([
	"jquery.sap.global", "./library", "sap/ui/base/ManagedObject"
], function(jQuery, library, ManagedObject) {
	"use strict";

	var NodeSet;
	var log = jQuery.sap.log;

	// NB: Implementation details:
	// ViewStateManager should have its own set of visible and selected nodes.
	// At the moment only one viewport per scene is supported and hence we can delegate
	// visibility and selection handling to the scene.

	/**
	 * Creates a new ViewStateManager object.
	 *
	 * @class
	 * The ViewStateManager class manages visibility and selection states of nodes in the scene.
	 *
	 * The objects of this class should not be created directly.
	 * They should be created with the {@link sap.ui.vk.GraphicsCore#createViewStateManager sap.ui.vk.GraphicsCore.createViewStateManager} method,
	 * and destroyed with the {@link sap.ui.vk.GraphicsCore#destroyViewStateManager sap.ui.vk.GraphicsCore.destroyViewStateManager} method.
	 *
	 * @param {sap.ui.vk.NodeHierarchy} nodeHierarchy The NodeHierarchy object.
	 * @public
	 * @author SAP SE
	 * @version 1.32.3
	 * @extends sap.ui.base.ManagedObject
	 * @alias sap.ui.vk.ViewStateManager
	 * @experimental Since 1.32.0 This class is experimental and might be modified or removed in future versions.
	 */
	var ViewStateManager = ManagedObject.extend("sap.ui.vk.ViewStateManager", /** @lends sap.ui.vk.ViewStateManager.prototype */ {
		metadata: {
			publicMethods: [
				"enumerateSelection",
				"getNodeHierarchy",
				"getSelectionState",
				"getVisibilityState",
				"setSelectionState",
				"setVisibilityState"
			],

			events: {
				/**
				 * This event is fired when the visibility of the node changes.
				 */
				visibilityChanged: {
					parameters: {
						/**
						 * IDs of newly shown nodes.
						 */
						visible: { type: "string[]" },
						/**
						 * IDs of newly hidden nodes.
						 */
						hidden: { type: "string[]" }
					},
					enableEventBubbling: true
				},

				/**
				 * This event is fired when the nodes are selected/unselected.
				 */
				selectionChanged: {
					parameters: {
						/**
						 * IDs of newly selected nodes.
						 */
						selected: { type: "string[]" },
						/**
						 * IDs of newly unselected nodes.
						 */
						unselected: { type: "string[]" }
					},
					enableEventBubbling: true
				}
			}
		},

		constructor: function(nodeHierarchy) {
			log.debug("sap.ui.vk.ViewStateManager.constructor() called.");

			ManagedObject.apply(this);

			var scene = nodeHierarchy.getScene();
			this._nodeHierarchy = nodeHierarchy;
			this._dvlSceneId = scene._getDvlSceneId();
			this._dvl = scene.getGraphicsCore()._getDvl();
			this._dvlClientId = scene.getGraphicsCore()._getDvlClientId();
			this._dvl.Client.attachNodeVisibilityChanged(this._handleNodeVisibilityChanged, this);
			this._dvl.Client.attachNodeSelectionChanged(this._handleNodeSelectionChanged, this);
			this._selectedNodes = new NodeSet();
			this._newlyVisibleNodes = [];
			this._newlyHiddenNodes = [];
			this._visibilityTimerId = null;
			this._selectionTimerId = null;
		},

		destroy: function() {
			log.debug("sap.ui.vk.ViewStateManager.destroy() called.");

			if (this._selectionTimerId) {
				jQuery.sap.clearDelayedCall(this._selectionTimerId);
				this._selectionTimerId = null;
			}
			if (this._visibilityTimerId) {
				jQuery.sap.clearDelayedCall(this._visibilityTimerId);
				this._visibilityTimerId = null;
			}
			this._newlyHiddenNodes = null;
			this._newlyVisibleNodes = null;
			this._selectedNodes = null;
			if (this._dvl) {
				this._dvl.Client.detachNodeSelectionChanged(this._handleNodeSelectionChanged, this);
				this._dvl.Client.detachNodeVisibilityChanged(this._handleNodeVisibilityChanged, this);
			}
			this._dvlClientId = null;
			this._dvlSceneId = null;
			this._dvl = null;
			this._scene = null;

			ManagedObject.prototype.destroy.apply(this);
		},

		/**
		 * Gets the NodeHierarchy object associated with this ViewStateManager object.
		 * @returns {sap.ui.vk.NodeHierarchy} The node hierarchy associated with this ViewStateManager object.
		 * @public
		 */
		getNodeHierarchy: function() {
			return this._nodeHierarchy;
		},

		/**
		 * Gets the visibility state of nodes.
		 *
		 * If a single node ID is passed to the method then a single visibility state is returned.<br/>
		 * If an array of node IDs is passed to the method then an array of visibility states is returned.
		 *
		 * @param {string|string[]} nodeIds The node ID or the array of node IDs.
		 * @return {boolean|boolean[]} A single value or an array of values where the value is <code>true</code> if the node is visible, <code>false</code> otherwise.
		 * @public
		 */
		getVisibilityState: function(nodeIds) {
			if (Array.isArray(nodeIds)) {
				return nodeIds.map(function(nodeId) {
					return (this._dvl.Scene.RetrieveNodeInfo(this._dvlSceneId, nodeId, sap.ve.dvl.DVLNODEINFO.DVLNODEINFO_FLAGS).Flags & sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_VISIBLE) !== 0;
				}.bind(this));
			} else {
				var nodeId = nodeIds; // The nodeIds argument is a single nodeId.
				return (this._dvl.Scene.RetrieveNodeInfo(this._dvlSceneId, nodeId, sap.ve.dvl.DVLNODEINFO.DVLNODEINFO_FLAGS).Flags & sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_VISIBLE) !== 0;
			}
		},

		/**
		 * Sets the visibility state of the nodes.
		 * @param {string|string[]} nodeIds The node ID or the array of node IDs.
		 * @param {boolean} visible The new visibility state of the nodes.
		 * @param {boolean} recursive The flags indicates if the change needs to propagate recursively to child nodes.
		 * @return {sap.ui.vk.ViewStateManager} <code>this</code> to allow method chaining.
		 * @public
		 */
		setVisibilityState: function(nodeIds, visible, recursive) {
			if (!Array.isArray(nodeIds)) {
				nodeIds = [nodeIds];
			}

			var changed = jQuery.sap.unique((recursive ? this._collectNodesRecursively(nodeIds) : nodeIds)).filter(function(nodeId) {
				var isCurrentlyVisible = (sap.ui.vk.dvl.getJSONObject(this._dvl.Scene.RetrieveNodeInfo(this._dvlSceneId, nodeId, sap.ve.dvl.DVLNODEINFO.DVLNODEINFO_FLAGS)).Flags & sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_VISIBLE) !== 0;
				return isCurrentlyVisible !== visible;
			}.bind(this));

			if (changed.length > 0) {
				changed.forEach(function(nodeId){
					this._dvl.Scene.ChangeNodeFlags(this._dvlSceneId, nodeId, sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_VISIBLE,
						visible ? sap.ve.dvl.DVLFLAGOPERATION.DVLFLAGOP_SET : sap.ve.dvl.DVLFLAGOPERATION.DVLFLAGOP_CLEAR);
				}.bind(this));

				this.fireVisibilityChanged({ visible: visible ? changed : [], hidden: visible ? [] : changed });
			}

			return this;
		},

		_handleNodeVisibilityChanged: function(parameters) {
			if (parameters.clientId === this._dvlClientId && parameters.sceneId === this._dvlSceneId) {
				this[parameters.visible ? "_newlyVisibleNodes" : "_newlyHiddenNodes"].push(parameters.nodeId);
				if (!this._visibilityTimerId) {
					this._visibilityTimerId = jQuery.sap.delayedCall(0, this, function() {
						this._visibilityTimerId = null;
						this.fireVisibilityChanged({
							visible: this._newlyVisibleNodes.splice(0, this._newlyVisibleNodes.length),
							hidden: this._newlyHiddenNodes.splice(0, this._newlyHiddenNodes.length)
						});
					}.bind(this));
				}
			}
		},

		/**
		 * Enumerates IDs of the selected nodes.
		 *
		 * @param {function} callback A function to call when the selected nodes are enumerated. The function takes one parameter of type <code>string</code>.
		 * @returns {sap.ui.vk.ViewStateManager} <code>this</code> to allow method chaining.
		 * @public
		 */
		enumerateSelection: function(callback) {
			this._selectedNodes.forEach(callback);
			return this;
		},

		/**
		 * Gets the selection state of the node.
		 *
		 * If a single node ID is passed to the method then a single selection state is returned.<br/>
		 * If an array of node IDs is passed to the method then an array of selection states is returned.
		 *
		 * @param {string|string[]} nodeIds The node ID or the array of node IDs.
		 * @return {boolean|boolean[]} A single value or an array of values where the value is <code>true</code> if the node is selected, <code>false</code> otherwise.
		 * @public
		 */
		getSelectionState: function(nodeIds) {
			if (Array.isArray(nodeIds)) {
				return nodeIds.map(function(nodeId) {
					return (this._dvl.Scene.RetrieveNodeInfo(this._dvlSceneId, nodeId, sap.ve.dvl.DVLNODEINFO.DVLNODEINFO_FLAGS).Flags & sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_SELECTED) !== 0;
				}.bind(this));
			} else {
				var nodeId = nodeIds;  // The nodeIds argument is a single nodeId.
				return (this._dvl.Scene.RetrieveNodeInfo(this._dvlSceneId, nodeId, sap.ve.dvl.DVLNODEINFO.DVLNODEINFO_FLAGS).Flags & sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_SELECTED) !== 0;
			}
		},

		/**
		 * Sets the selection state of the nodes.
		 * @param {string|string[]} nodeIds The node ID or the array of node IDs.
		 * @param {boolean} selected The new selection state of the nodes.
		 * @param {boolean} recursive The flags indicates if the change needs to propagate recursively to child nodes.
		 * @return {sap.ui.vk.ViewStateManager} <code>this</code> to allow method chaining.
		 * @public
		 */
		setSelectionState: function(nodeIds, selected, recursive) {
			if (!Array.isArray(nodeIds)) {
				nodeIds = [nodeIds];
			}

			var changed = jQuery.sap.unique((recursive ? this._collectNodesRecursively(nodeIds) : nodeIds)).filter(function(nodeId) {
				var isCurrentlySelected = (sap.ui.vk.dvl.getJSONObject(this._dvl.Scene.RetrieveNodeInfo(this._dvlSceneId, nodeId, sap.ve.dvl.DVLNODEINFO.DVLNODEINFO_FLAGS)).Flags & sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_SELECTED) !== 0;
				return isCurrentlySelected !== selected;
			}.bind(this));

			if (changed.length > 0) {
				var change = this._selectedNodes[selected ? "add" : "delete"].bind(this._selectedNodes);
				changed.forEach(function(nodeId){
					this._dvl.Scene.ChangeNodeFlags(this._dvlSceneId, nodeId, sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_SELECTED,
						selected ? sap.ve.dvl.DVLFLAGOPERATION.DVLFLAGOP_SET : sap.ve.dvl.DVLFLAGOPERATION.DVLFLAGOP_CLEAR);
					change(nodeId);
				}.bind(this));

				this.fireSelectionChanged({ selected: selected ? changed : [], unselected: selected ? [] : changed });
			}

			return this;
		},

		_handleNodeSelectionChanged: function(parameters) {
			if (parameters.clientId === this._dvlClientId && parameters.sceneId === this._dvlSceneId) {
				if (!this._selectionTimerId) {
					this._selectionTimerId = jQuery.sap.delayedCall(0, this, function() {
						this._selectionTimerId = null;
						var currentlySelectedNodes = new NodeSet(this._dvl.Scene.RetrieveSceneInfo(this._dvlSceneId, sap.ve.dvl.DVLSCENEINFO.DVLSCENEINFO_SELECTED).SelectedNodes);
						var newlyUnselectedNodes = [];
						this._selectedNodes.forEach(function(nodeId) {
							if (!currentlySelectedNodes.has(nodeId)) {
								newlyUnselectedNodes.push(nodeId);
							}
						});
						var newlySelectedNodes = [];
						currentlySelectedNodes.forEach(function(nodeId) {
							if (!this._selectedNodes.has(nodeId)) {
								newlySelectedNodes.push(nodeId);
							}
						}.bind(this));

						this._selectedNodes = currentlySelectedNodes;

						this.fireSelectionChanged({ selected: newlySelectedNodes, unselected: newlyUnselectedNodes });
					});
				}
			}
		},

		_collectNodesRecursively: function(nodeIds) {
			var result = [];
			var collectChildNodes = function(node) {
				var nodeId = typeof node === "string" ? node : node.getNodeId();
				result.push(nodeId);
				if ((sap.ui.vk.dvl.getJSONObject(this._dvl.Scene.RetrieveNodeInfo(this._dvlSceneId, nodeId, sap.ve.dvl.DVLNODEINFO.DVLNODEINFO_FLAGS)).Flags & sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_CLOSED) === 0) {
					this._nodeHierarchy.enumerateChildren(nodeId, collectChildNodes);
				}
			}.bind(this);
			nodeIds.forEach(collectChildNodes);
			return result;
		}
	});

	NodeSet = function(array) {
		array = array || [];
		if (this._builtin) {
			if (sap.ui.Device.browser.msie) {
				this._set = new Set();
				array.forEach(this._set.add.bind(this._set));
			} else {
				this._set = new Set(array);
			}
		} else {
			this._set = array.slice();
		}
	};

	NodeSet.prototype = {
		constructor: NodeSet,

		_builtin: !!Set,

		add: function(value) {
			if (this._builtin) {
				this._set.add(value);
			} else {
				if (this._set.indexOf() < 0) {
					this._set.push(value);
				}
			}
			return this;
		},

		delete: function(value) {
			if (this._builtin) {
				return this._set.delete(value);
			} else {
				var index = this._set.indexOf(value);
				if (index >= 0) {
					this.splice(index, 1);
					return true;
				} else {
					return false;
				}
			}
		},

		clear: function() {
			if (this._builtin) {
				this._set.clear();
			} else {
				this._set.splice(0, this._set.length);
			}
		},

		has: function(value) {
			if (this._builtin) {
				return this._set.has(value);
			} else {
				return this._set.indexOf(value) >= 0;
			}
		},

		forEach: function(callback, thisArg) {
			this._set.forEach(callback, thisArg);
		}
	};

	return ViewStateManager;
});
