/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides class sap.ui.vk.ContentResource.
sap.ui.define([
	"jquery.sap.global", "./library", "sap/ui/base/ManagedObject"
], function(jQuery, library, ManagedObject) {
	"use strict";

	/**
	 * Creates a new ContentResource object.
	 *
	 * @class
	 * Specifies a resource to load.

	 * @param {string} [sId] ID of the new content resource. <code>sId</code>is generated automatically if no non-empty ID is given.
	 *                       Note: this can be omitted, regardless of whether <code>mSettings</code> will be provided or not.
	 * @param {object} [mSettings] An optional map/JSON object with initial property values, aggregated objects etc. for the new content resource.
	 * @param {object} [oScope] scope An object for resolving string-based type and formatter references in bindings.
	 * @public
	 * @author SAP SE
	 * @version 1.32.3
	 * @extends sap.ui.base.ManagedObject
	 * @alias sap.ui.vk.ContentResource
	 * @experimental Since 1.32.0 This class is experimental and might be modified or removed in future versions.
	 */
	var ContentResource = ManagedObject.extend("sap.ui.vk.ContentResource", /** @lends sap.ui.vk.ContentResource.prototype */ {
		metadata: {
			properties: {
				/**
				 * The source URL of the content resource/file to load from.
				 * The source URL may be omitted if a grouping node is needed.
				 */
				source: "sap.ui.core.URI",

				/**
				 * The source type of the content resource. Valid types:
				 * <ul>
				 *   <li>.vds</li>
				 *   <li>.png</li>
				 *   <li>.jpg</li>
				 *   <li>.gif</li>
				 * </ul>
				 * The source type may be omitted if this is a grouping content node.
				 */
				sourceType: "string",

				/**
				 * The unique ID of the content resource.
				 */
				sourceId: "string",

				/**
				 * The local transformation matrix of the node created for this content resource.
				 */
				localMatrix: "sap.ui.vk.TransformationMatrix",

				/**
				 * The name of the node created for this content resource.
				 */
				name: "string"
			},

			aggregations: {
				/**
				 * Child content resources.
				 */
				contentResources: "sap.ui.vk.ContentResource"
			}
		},

		isTreeBinding: function(name) {
			return name === "contentResources";
		},

		constructor: function(sId, mSettings, oScope) {
			ManagedObject.apply(this, arguments);
			this._loaded = false;
			this._file = null;
			this._nodeProxy = null;
		},

		destroy: function() {
			this._nodeProxy = null;
			this._file = null;
			ManagedObject.prototype.destroy.call(this);
		},

		/**
		 * Sets a {@link https://developer.mozilla.org/en-US/docs/Web/API/File File} object as the source content.
		 * @param {File} file The file to use as the source content.
		 * @returns {sap.ui.vk.ContentResource} <code>this</code> to allow method chaining.
		 * @public
		 */
		setFile: function(file) {
			this._file = file;
			this.setSource(file.name);
			var index = file.name.lastIndexOf(".");
			if (index >= 0 && index < file.name.length - 1) {
				this.setSourceType(file.name.substr(index + 1));
			} else {
				this.setSourceType(undefined);
			}
			return this;
		},

		/**
		 * Gets a {@link https://developer.mozilla.org/en-US/docs/Web/API/File File} object and sets it as the source content.
		 * @returns {File} The file to use as the source content.
		 * @public
		 */
		getFile: function() {
			return this._file;
		},

		/**
		 * Marks the content resource as loaded. After marking the content resource as loaded, its properties cannot be changed.
		 * @returns {sap.ui.vk.ContentResource} <code>this</code> to allow method chaining.
		 * @public
		 */
		setLoaded: function() {
			if (this._loaded) {
				jQuery.sap.log.warning("Content resource can be marked as loaded only once.");
			}
			this._loaded = true;
			return this;
		},

		/**
		 * Indicates that the content resource has been loaded.
		 * @returns {boolean} A value of <code>true</code> is returned if the resource has been loaded; a value of <code>false</code> is returned otherwise.
		 * @public
		 */
		getLoaded: function() {
			return this._loaded;
		},

		/**
		 * Sets the {@link sap.ui.vk.NodeProxy NodeProxy} object created for this content resource.
		 *
		 * If this is the only top level content resource, the {@link sap.ui.vk.NodeProxy NodeProxy} object is not set since
		 * the grouping node is not created, which means that there may be multiple top level nodes.
		 *
		 * @param {sap.ui.vk.NodeProxy} node The {@link sap.ui.vk.NodeProxy NodeProxy} object created for this content resource.
		 * @returns {sap.ui.vk.ContentResource} <code>this</code> to allow method chaining.
		 * @private
		 */
		_setNodeProxy: function(node) {
			this._nodeProxy = node;
			return this;
		},

		/**
		 * Gets the {@link sap.ui.vk.NodeProxy NodeProxy} object created for this content resource.
		 *
		 * If this is the only top level content resource, the {@link sap.ui.vk.NodeProxy NodeProxy} object is not set since
		 * the grouping node is not created, which means that there may be multiple top level nodes.
		 *
		 * @returns {sap.ui.vk.NodeProxy} The {@link sap.ui.vk.NodeProxy NodeProxy} object created for this content resource.
		 * @public
		 */
		getNodeProxy: function() {
			return this._nodeProxy;
		},

		setProperty: function(name, value, suppressInvalidate) {
			if (this._loaded) {
				jQuery.sap.log.warning("Content resource's property " + name + " cannot be changed after the content resource has been loaded.");
			} else {
				ManagedObject.prototype.setProperty.apply(this, arguments);
			}
			return this;
		}
	});

	return ContentResource;
});
