/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the Scene class.
sap.ui.define([
	"jquery.sap.global", "./library", "sap/ui/base/EventProvider", "./NodeHierarchy"
], function(jQuery, library, EventProvider, NodeHierarchy) {
	"use strict";

	var log = jQuery.sap.log;

	/**
	 * Creates a new Scene object.
	 *
	 * @class Scene class.
	 * Provides the interface for the 3D model.
	 *
	 * The objects of this class should not be created directly. They should be created via call to {@link sap.ui.vk.GraphicsCore#buildSceneTree sap.ui.vk.GraphicsCore.buildSceneTree}.
	 *
	 * @param {sap.ui.vk.GraphicsCore} graphicsCore The GraphicsCore object the scene belongs to.
	 * @param {string} dvlSceneId The identifier of the DVL scene object.
	 * @public
	 * @author SAP SE
	 * @version 1.32.3
	 * @extends sap.ui.base.EventProvider
	 * @alias sap.ui.vk.Scene
	 * @experimental Since 1.32.0 This class is experimental and might be modified or removed in future versions.
	 */
	var Scene = EventProvider.extend("sap.ui.vk.Scene", /** @lends sap.ui.vk.Scene.prototype */ {
		metadata: {
			publicMethods: [
				"getId",
				"getGraphicsCore",
				"getDefaultNodeHierarchy"
			]
		},

		constructor: function(graphicsCore, dvlSceneId) {
			log.debug("sap.ui.vk.Scene.constructor() called.");

			EventProvider.apply(this);

			this._id = jQuery.sap.uid();
			this._graphicsCore = graphicsCore;
			this._dvlSceneId = dvlSceneId;
			this._defaultNodeHierarchy = null;
		},

		destroy: function() {
			log.debug("sap.ui.vk.Scene.destroy() called.");

			if (this._defaultNodeHierarchy) {
				this._defaultNodeHierarchy.destroy();
				this._defaultNodeHierarchy = null;
			}
			this._dvlSceneId = null;
			this._graphicsCore = null;

			EventProvider.prototype.destroy.apply(this);
		},

		/**
		 * Gets the unique ID of the Scene object.
		 * @returns {string} The unique ID of the Scene object.
		 * @public
		 */
		getId: function() {
			return this._id;
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
		 * Gets the default node hierarchy in the Scene object.
		 * @returns {sap.ui.vk.NodeHierarchy} The default node hierarchy in the Scene object.
		 * @public
		 */
		getDefaultNodeHierarchy: function() {
			if (!this._defaultNodeHierarchy) {
				this._defaultNodeHierarchy = new NodeHierarchy(this);
			}
			return this._defaultNodeHierarchy;
		},

		/**
		 * Gets the DVL scene ID.
		 * @returns {string} The DVL scene ID.
		 * @private
		 */
		_getDvlSceneId: function() {
			return this._dvlSceneId;
		}
	});

	return Scene;
});
