/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the NodeHierarchy class.
sap.ui.define([
	"jquery.sap.global", "./library", "sap/ui/base/EventProvider", "sap/ui/base/ObjectPool", "./BaseNodeProxy", "./NodeProxy"
], function(jQuery, library, EventProvider, ObjectPool, BaseNodeProxy, NodeProxy) {
	"use strict";

	var getJSONObject = sap.ui.vk.dvl.getJSONObject;

	/**
	 * Creates a new NodeHierarchy object.
	 *
	 * @class
	 * Provides the ability to explore a Scene object's node structure.
	 *
	 * The objects of this class should not be created directly, and should only be created via a call to {@link sap.ui.vk.Scene#getDefaultNodeHierarchy sap.ui.vk.Scene#getDefaultNodeHierarchy}.
	 *
	 * @param {sap.ui.vk.Scene} scene The Scene object the node hierarchy belongs to.
	 * @public
	 * @author SAP SE
	 * @version 1.32.3
	 * @extends sap.ui.base.EventProvider
	 * @alias sap.ui.vk.NodeHierarchy
	 * @experimental Since 1.32.0 This class is experimental and might be modified or removed in future versions.
	 */
	var NodeHierarchy = EventProvider.extend("sap.ui.vk.NodeHierarchy", /** @lends sap.ui.vk.NodeHierarchy.prototype */ {
		metadata: {
			publicMethods: [
				"createNodeProxy",
				"destroyNodeProxy",
				"enumerateAncestors",
				"enumerateChildren",
				"getGraphicsCore",
				"getScene"
			]
		},

		_baseNodeProxyPool: new ObjectPool(BaseNodeProxy),

		constructor: function(scene) {
			EventProvider.apply(this);

			this._graphicsCore = scene.getGraphicsCore();
			this._scene = scene;
			this._dvlSceneId = this._scene._getDvlSceneId();
			this._dvl = this._graphicsCore._getDvl();
			this._nodeProxies = [];
		},

		destroy: function() {
			this._nodeProxies.slice().forEach(this.destroyNodeProxy.bind(this));
			this._dvl = null;
			this._dvlSceneId = null;
			this._scene = null;
			this._graphicsCore = null;

			EventProvider.prototype.destroy.apply(this);
		},

		/**
		 * Gets the GraphicsCore object this Scene object belongs to.
		 * @returns {sap.ui.vk.GraphicsCore} The GraphicsCore object this Scene object belongs to.
		 * @public
		 */
		getGraphicsCore: function() {
			return this._graphicsCore;
		},

		/**
		 * Gets the Scene object the node hierarchy belongs to.
		 * @returns {sap.ui.vk.Scene} The Scene object the node hierarchy belongs to.
		 * @public
		 */
		getScene: function() {
			return this._scene;
		},

		/**
		 * Gets the DVL scene ID.
		 * @returns {string} The DVL scene ID.
		 * @private
		 */
		_getDvlSceneId: function() {
			return this._dvlSceneId;
		},

		/**
		 * Enumerates the child nodes in the node hierarchy of the Scene object.
		 *
		 * The method enumerates the child nodes and calls <code>callback</code> passing the child nodes one by one.<br/>
		 * The BaseNodeProxy objects passed to <code>callback</code> are temporary objects, which are reset after each call to <code>callback</code>.<br/>
		 *
		 * @param {string} [nodeId] The ID of a node.<br/>
		 * When <code>nodeId</code> is specified, the child nodes of this node are enumerated.<br/>
		 * When no <code>nodeId</code> is specified, only the top level nodes are enumerated.<br/>
		 * @param {function} callback A function to call when the child nodes are enumerated. The function takes one parameter of type {@link sap.ui.vk.BaseNodeProxy}.
		 * @param {boolean} [stepIntoClosedNode=false] Indicates whether to enumerate child nodes of a <i>closed</i> node.
		 * @returns {sap.ui.vk.NodeHierarchy} <code>this</code> to allow method chaining.
		 * @public
		 */
		enumerateChildren: function(nodeId, callback, stepIntoClosedNode) {
			if (typeof nodeId === "function") {
				// The 'nodeId' parameter is omitted, let's shift the parameters to right.
				stepIntoClosedNode = callback;
				callback = nodeId;
				nodeId = undefined;
			}

			// NB: At the moment DVL scenes support only one hierarchy, so we just enumerate top level nodes of the scene if nodeId is omitted.
			var nodeIds;
			if (nodeId) {
				// Child nodes of the node.
				if (stepIntoClosedNode || (getJSONObject(this._dvl.Scene.RetrieveNodeInfo(this._dvlSceneId, nodeId, sap.ve.dvl.DVLNODEINFO.DVLNODEINFO_FLAGS)).Flags & sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_CLOSED) === 0) {
					nodeIds = getJSONObject(this._dvl.Scene.RetrieveNodeInfo(this._dvlSceneId, nodeId, sap.ve.dvl.DVLNODEINFO.DVLNODEINFO_CHILDREN)).ChildNodes;
				} else {
					// Do not step into closed nodes.
					nodeIds = [];
				}
			} else {
				// Top level nodes.
				nodeIds = getJSONObject(this._dvl.Scene.RetrieveSceneInfo(this._dvlSceneId, sap.ve.dvl.DVLSCENEINFO.DVLSCENEINFO_CHILDREN)).ChildNodes;
			}

			var nodeProxy = this._baseNodeProxyPool.borrowObject();
			try {
				nodeIds.forEach(function(nodeId) {
					nodeProxy.init(this, nodeId);
					callback(nodeProxy);
					nodeProxy.reset();
				}.bind(this));
			} finally {
				this._baseNodeProxyPool.returnObject(nodeProxy);
			}

			return this;
		},

		/**
		 * Enumerates ancestors of the node.
		 *
		 * The method enumerates the ancestor nodes and calls <code>callback</code> passing the ancestor nodes one by one.<br/>
		 * The BaseNodeProxy objects passed to <code>callback</code> are temporary objects, they are reset after each call to <code>callback</code>.<br/>
		 * The ancestor nodes are enumerated from the top level node down the node hierarchy.
		 *
		 * @param {string} nodeId The ID of the node.
		 * @param {function} callback A function to call when the ancestor nodes are enumerated. The function takes one parameter of type {@link sap.ui.vk.BaseNodeProxy}.
		 * @returns {sap.ui.vk.NodeHierarchy} <code>this</code> to allow method chaining.
		 * @public
		 */
		enumerateAncestors: function(nodeId, callback) {
			var nodeIds = getJSONObject(this._dvl.Scene.RetrieveNodeInfo(this._dvlSceneId, nodeId, sap.ve.dvl.DVLNODEINFO.DVLNODEINFO_PARENTS)).ParentNodes;

			var nodeProxy = this._baseNodeProxyPool.borrowObject();
			try {
				nodeIds.forEach(function(nodeId) {
					nodeProxy.init(this, nodeId);
					callback(nodeProxy);
					nodeProxy.reset();
				}.bind(this));
			} finally {
				this._baseNodeProxyPool.returnObject(nodeProxy);
			}

			return this;
		},

		/**
		 * Creates a node proxy object.
		 *
		 * The node proxy object must be destroyed with the {@link #destroyNodeProxy destroyNodeProxy} method.
		 *
		 * @param {string} nodeId The node ID for which to create a proxy object.
		 * @returns {sap.ui.vk.NodeProxy} The proxy object.
		 * @public
		 */
		createNodeProxy: function(nodeId) {
			var nodeProxy = new NodeProxy(this, nodeId);
			this._nodeProxies.push(nodeProxy);
			return nodeProxy;
		},

		/**
		 * Destroys the node proxy object.
		 *
		 * @param {sap.ui.vk.NodeProxy} nodeProxy The node proxy object.
		 * @returns {sap.ui.vk.NodeHierarchy} <code>this</code> to allow method chaining.
		 * @public
		 */
		destroyNodeProxy: function(nodeProxy) {
			var index = this._nodeProxies.indexOf(nodeProxy);
			if (index >= 0) {
				this._nodeProxies.splice(index, 1)[0].destroy();
			}
			return this;
		}
	});

	return NodeHierarchy;
});
