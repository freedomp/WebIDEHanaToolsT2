/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the BaseNodeProxy class.
sap.ui.define([
	"jquery.sap.global", "./library", "sap/ui/base/Object"
], function(jQuery, library, BaseObject) {
	"use strict";

	var getJSONObject = sap.ui.vk.dvl.getJSONObject;

	/**
	 * Creates a new BaseNodeProxy object.
	 *
	 * @class
	 * Provides a simple, lightweight proxy object to a node in a node hierarchy.
	 *
	 * The objects of this class should not be created directly, and should only be created through the use of the following methods:
	 * <ul>
	 *   <li>{@link sap.ui.vk.NodeHierarchy#enumerateChildren sap.ui.vk.NodeHierarchy.enumerateChildren}</li>
	 *   <li>{@link sap.ui.vk.NodeHierarchy#enumerateAncestors sap.ui.vk.NodeHierarchy.enumerateAncestors}</li>
	 *   <li>{@link sap.ui.vk.ViewStateManager#enumerateSelection sap.ui.vk.ViewStateManager.enumerateSelection}</li>
	 * </ul>
	 *
	 * @param {sap.ui.vk.NodeHierarchy} nodeHierarchy The node hierarchy to which the node belongs to.
	 * @param {string} nodeId The ID of the node which we want to provide a proxy object for.
	 * @public
	 * @author SAP SE
	 * @version 1.32.3
	 * @extends sap.ui.base.BaseObject
	 * @implements sap.ui.base.Poolable
	 * @alias sap.ui.vk.BaseNodeProxy
	 * @experimental Since 1.32.0 This class is experimental and might be modified or removed in future versions.
	 */
	var BaseNodeProxy = BaseObject.extend("sap.ui.vk.BaseNodeProxy", /** @lends sap.ui.vk.BaseNodeProxy.prototype */ {
		metadata: {
			publicMethods: [
				"getNodeId",
				"getName",
				"getNodeMetadata",
				"getHasChildren"
			]
		},

		constructor: function(nodeHierarchy, nodeId) {
			this.init(nodeHierarchy, nodeId);
		},

		/**
		 * Initialize this BaseNodeProxy with its data.
		 *
		 * The <code>init</code> method is called by an object pool when the
		 * object is (re-)activated for a new caller.
		 *
		 * @param {sap.ui.vk.NodeHierarchy} nodeHierarchy The NodeHierarchy object this BaseNodeProxy object belongs to.
		 * @param {string} nodeId The ID of the node for which to get BaseNodeProxy.
		 *
		 * @private
		 *
		 * @see sap.ui.base.Poolable.prototype#init
		 */
		init: function(nodeHierarchy, nodeId) {
			this._dvl = nodeHierarchy ? nodeHierarchy.getGraphicsCore()._getDvl() : null;
			this._dvlSceneId = nodeHierarchy ? nodeHierarchy._getDvlSceneId() : null;
			this._dvlNodeId = nodeId;
		},

		/**
		 * Reset BaseNodeProxy data, needed for pooling.
		 *
		 * @private
		 *
		 * @see sap.ui.base.Poolable.prototype#reset
		 */
		reset: function() {
			this._dvlNodeId = null;
			this._dvlSceneId = null;
			this._dvl = null;
		},

		/**
		 * Gets the ID of the node.
		 *
		 * @returns {string} The node's ID.
		 *
		 * @public
		 */
		getNodeId: function() {
			return this._dvlNodeId;
		},

		/**
		 * Gets the name of the node.
		 *
		 * @returns {string} The node's name.
		 *
		 * @public
		 */
		getName: function() {
			return getJSONObject(this._dvl.Scene.RetrieveNodeInfo(this._dvlSceneId, this._dvlNodeId, sap.ve.dvl.DVLNODEINFO.DVLNODEINFO_NAME)).NodeName;
		},

		/**
		 * Gets the metadata of the node.
		 *
		 * @return {object} A JSON object containing the node's metadata.
		 *
		 * @public
		 */
		// NB: We cannot name the method getMetadata as there already exists sap.ui.base.Object.getMetadata method.
		getNodeMetadata: function() {
			return getJSONObject(this._dvl.Scene.RetrieveMetadata(this._dvlSceneId, this._dvlNodeId)).metadata;
		},

		/**
		 * Indicates whether the node has child nodes.
		 *
		 * @returns {boolean} A value of <code>true</code> indicates that the node has child nodes, and a value of <code>false</code> indicates otherwise.
		 *
		 * @public
		 */
		getHasChildren: function() {
			return (getJSONObject(this._dvl.Scene.RetrieveNodeInfo(this._dvlSceneId, this._dvlNodeId, sap.ve.dvl.DVLNODEINFO.DVLNODEINFO_FLAGS)).Flags
					& (sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_MAPPED_HASCHILDREN | sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_CLOSED)) === sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_MAPPED_HASCHILDREN;
		}
	});

	return BaseNodeProxy;
});
