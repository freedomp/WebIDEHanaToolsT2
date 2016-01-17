/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
/* global File */
// Provides the GraphicsCore class.
sap.ui.define([
	"jquery.sap.global", "./library", "sap/ui/base/EventProvider", "sap/ve/dvl", "./Scene", "./NodeHierarchy",
	"./ContentResource", "./DownloadManager", "./ViewStateManager", "./DvlException"
], function(jQuery, library, EventProvider, Dvl, Scene, NodeHierarchy,
	ContentResource, DownloadManager, ViewStateManager, DvlException) {
	"use strict";

	var DvlSceneOrigin = {
		Empty:  "Empty", // dvl scene is create as an empty scene
		Local:  "Local", // dvl scene is loaded from a local file.
		Remote: "Remote" // dvl scene is loaded from a URL.
	};

	var SceneResource = function(dvlSceneId, source) {
		var origin;
		if (typeof source === "string") {
			origin = DvlSceneOrigin.Remote;
		} else if (source === undefined) {
			origin = DvlSceneOrigin.Empty;
		} else if (source instanceof File) {
			origin = DvlSceneOrigin.Local;
		} else {
			throw new Error("Unsupported type of parameter 'source'.");
		}
		Object.defineProperties(this, {
			"dvlSceneId": { value: dvlSceneId, writable: false, enumerable: true },
			"source":     { value: source,     writable: false, enumerable: true },
			"origin":     { value: origin,     writable: false, enumerable: true },
			"modified":   { value: false,      writable: true,  enumerable: true }
		});
	};

	/**
	 * Creates a new GraphicsCore object.
	 *
	 * @class
	 * This class loads the Dvl library, wraps it and makes the wrapper available for the Application.
	 *
	 * Example:<br/>
	 * <pre>   var oGraphicsCore = new GraphicsCore();</pre><br/>
	 *
	 * @param {object} runtimeSettings The Emscripten runtime settings.
	 * @param {int}    runtimeSettings.totalMemory The size of Emscripten module memory in bytes.
	 * @param {string} runtimeSettings.logElementId The ID of a textarea DOM element to write the log to.
	 * @param {string} runtimeSettings.statusElementId The ID of a DOM element to write the status messages to.
	 * @param {object} webGLContextAttributes The WebGL context attributes. See {@link https://www.khronos.org/registry/webgl/specs/latest/1.0/#5.2 WebGL context attributes}.
	 * @public
	 * @author SAP SE
	 * @version 1.32.3
	 * @extends sap.ui.base.EventProvider
	 * @alias sap.ui.vk.GraphicsCore
	 * @experimental Since 1.32.0 This class is experimental and might be modified or removed in future versions.
	 */
	var GraphicsCore = EventProvider.extend("sap.ui.vk.GraphicsCore", /** @lends sap.ui.vk.GraphicsCore.prototype */ {
		metadata: {
			publicMethods: [
				"buildSceneTree",
				"createViewStateManager",
				"destroyScene",
				"destroyViewStateManager",
				"getApi",
				"loadContentResourcesAsync",
				"showDebugInfo"
			]
		},

		// NB: Change these numbers when start using features from new versions of DVL.
		_DVLMajorVersion: 5,
		_DVLMinorVersion: 0,

		constructor: function(runtimeSettings, webGLContextAttributes) {
			EventProvider.apply(this);

			var settings = jQuery.extend({}, runtimeSettings, { filePackagePrefixURL: jQuery.sap.getResourcePath("sap/ve") + "/" });
			this._dvlClientId = jQuery.sap.uid();
			this._dvl = sap.ve.dvl.createRuntime(settings);
			this._dvl.CreateCoreInstance(this._dvlClientId);
			this._dvl.Core.Init(this._DVLMajorVersion, this._DVLMinorVersion);
			this._canvas = this._createRenderingCanvasAndContext(webGLContextAttributes);

			// The list of resources the scenes are created from.
			this._sceneResources = [];

			// The map vkScene -> SceneResource[]
			//   key - vkScene.getId()
			//   value - an array of SceneResources
			this._vkScenesToSceneResourcesMap = {};

			// The list of scenes (sap.ui.vk.Scene).
			this._vkScenes = [];

			// The list of viewports (sap.ui.vk.Viewport).
			this._viewports = [];

			// The list of view state managers.
			this._viewStateManagers = [];
		},

		destroy: function() {
			// GraphicsCore does not own Viewport objects, it should not destroy them, it can only reset their association with GraphicsCore.
			this._viewports.slice().forEach(function(viewport) {
				viewport.setGraphicsCore(null);
			});
			this._viewports = null;

			this._vkScenes.forEach(this.destroyScene.bind(this));
			this._vkScenes = null;

			this._viewStateManagers.slice().forEach(this.destroyViewStateManager.bind(this));
			this._viewStateManagers = null;

			jQuery.sap.assert(this._sceneResources.length === 0, "Not all scene resources are destroyed when sap.ui.vk.Scene objects are destroyed.");

			this._sceneResources.slice().forEach(this._destroySceneResource.bind(this));
			this._sceneResources = null;

			this._webGLContext = null;
			this._canvas = null;

			this._dvl.Core.Release();
			this._dvl = null;

			EventProvider.prototype.destroy.apply(this);
		},

		/**
		 * Creates a canvas element for the 3D viewport and initializes the WebGL context.
		 * @param {object} webGLContextAttributes WebGL context attributes. A JSON object with the following boolean properties:
		 * <ul>
		 *   <li>antialias {boolean} default value <code>true</code>.</li>
		 *   <li>alpha {boolean} default value <code>true</code>.</li>
		 *   <li>premultipliedAlpha {boolean} default value <code>false</code>.</li>
		 * </ul>
		 * Other {@link https://www.khronos.org/registry/webgl/specs/latest/1.0/#5.2 WebGL context attributes} are also supported.
		 * @returns {HTMLCanvasElement} The canvas element for the 3D viewport.
		 * @private
		 */
		_createRenderingCanvasAndContext: function(webGLContextAttributes) {
			// _canvas is a private DOMElement used for WebGL rendering.
			// At the moment there can be only one canvas element and one viewport,
			// and the viewport uses the canvas.
			var canvas = document.createElement("canvas");
			canvas.id = jQuery.sap.uid();
			this._webGLContext = this._dvl.Core.CreateWebGLContext(canvas, webGLContextAttributes);
			return canvas;
		},

		/**
		 * Gets the canvas element used for 3D rendering.
		 * @returns {HTMLCanvasElement} The canvas element used for 3D rendering.
		 * @private
		 */
		_getCanvas: function() {
			return this._canvas;
		},

		/**
		 * Gets the WebGL context used for 3D rendering.
		 * @returns {WebGLRenderingContext} The WebGL rendering context.
		 * @private
		 */
		_getWebGLContext: function() {
			return this._webGLContext;
		},

		/**
		 * Gets the DVL object.
		 * @returns {DVL} The DVL object.
		 * @private
		 */
		_getDvl: function() {
			return this._dvl;
		},

		/**
		 * Gets the DVL client ID used in processing notifications from DVL module.
		 * @returns {string} The DVL client ID.
		 * @private
		 */
		_getDvlClientId: function() {
			return this._dvlClientId;
		},

		////////////////////////////////////////////////////////////////////////
		// BEGIN: Scene Resource related methods.

		_destroySceneResource: function(resource) {
			this._dvl.Scene.Release(resource.dvlSceneId);
			switch (resource.origin) {
				case DvlSceneOrigin.Local:
					this._dvl.Core.DeleteFileByUrl(resource.source.name, "local");
					break;
				case DvlSceneOrigin.Remote:
					this._dvl.Core.DeleteFileByUrl(resource.source, "remote");
					break;
				default: // To satisfy ESLint.
					break;
			}
			this._sceneResources.splice(this._sceneResources.indexOf(resource), 1);
			return this;
		},

		/**
		 * Returns an array of items from this._sceneResources that match the search criteria.
		 * @param {object} properties A JSON like object with one or several properties { dvlScene, source, origin, modified }.
		 * @return {object[]} An array of items from this._dvlScenes that match the search criteria.
		 * @private
		 */
		_findSceneResources: function(properties) {
			var propNames = Object.getOwnPropertyNames(properties);
			return this._sceneResources.filter(function(item) {
				return propNames.every(function(propName) {
					return properties[propName] === item[propName];
				});
			});
		},

		// END: Scene Resource related methods.
		////////////////////////////////////////////////////////////////////////

		////////////////////////////////////////////////////////////////////////
		// BEGIN: Content Resource related methods.

		/**
		 * Loads content resources.
		 *
		 * Content resources can be downloaded from a URL or loaded from a local file.
		 *
		 * @param {sap.ui.vk.ContentResource[]} contentResources The content resources to build the scene from.
		 * @param {function} onComplete The callback function to call when all content resources are processed.
		 *                              The callback takes one parameter - an array of the 'source' attribute values that to be loaded failed.
		 * @returns {sap.ui.vk.GraphicsCore} <code>this</code> to allow method chaining.
		 * @public
		 */
		loadContentResourcesAsync: function(contentResources, onComplete) {
			// Convert the tree of ContentResources into a flat array of ContentResources.
			function flattenContentResourceTree(resources) {
				var result = [];
				function enumerate(resources) {
					result = result.concat(resources);
					resources.forEach(function(resource) {
						enumerate(resource.getContentResources());
					});
				}
				enumerate(resources);
				return result;
			}

			var allContentResources = flattenContentResourceTree(contentResources);

			// Multiple content resources can be downloaded from the same URL/file (e.g. in case of instancing).
			// In order not to download them multiple times find only distinct URLs/files.
			var sources = jQuery.sap.unique(
				allContentResources.map(function(contentResource) {
					return contentResource.getFile() || contentResource.getSource();
				}).filter(function(urlOrFile) {
					// Content resource with non empty getSource() or getFile().
					return urlOrFile;
				}).filter(function(urlOrFile) {
					// Content resource that is not loaded yet.
					return this._findSceneResources({ source: urlOrFile, modified: false }).length === 0;
				}.bind(this))
			);

			// Asynchronously download all content resources with URLs or local files.
			if (sources.length > 0) {
				var sourcesFailedToLoad;
				new DownloadManager(sources)
					.attachItemSucceeded(function(event) {
						var source = event.getParameter("source");
						var isFile = source instanceof File;
						var name = isFile ? source.name : source;
						var response = event.getParameter("response");
						try {
							var dvlSceneId = sap.ui.vk.dvl.getPointer(this._dvl.Core.LoadFileFromArrayBuffer(response, name, null, isFile ? "local" : "remote"));
							this._sceneResources.push(new SceneResource(dvlSceneId, source));
						} catch (ex) {
							if (ex instanceof DvlException) {
								sourcesFailedToLoad = sourcesFailedToLoad || [];
								sourcesFailedToLoad.push({
									source: event.getParameter("source"),
									status: ex.code,
									statusText: ex.message
								});
							} else {
								throw ex;
							}
						}
					}, this)
					.attachAllItemsCompleted(function(event) {
						allContentResources.forEach(function(resource) {
							resource.setLoaded();
						});
						if (onComplete) {
							onComplete(sourcesFailedToLoad);
						}
					}, this)
					.attachItemFailed(function(event) {
						sourcesFailedToLoad = sourcesFailedToLoad || [];
						sourcesFailedToLoad.push({
							source: event.getParameter("source"),
							status: event.getParameter("status"),
							statusText: event.getParameter("statusText")
						});
					}, this)
					.start();
			} else if (onComplete) {
				// Nothing to download or everything is already downloaded.
				onComplete();
			}

			return this;
		},

		/**
		 * Builds a scene tree from the hierarchy of content resources. The content resources must be already loaded.
		 * @param {sap.ui.vk.ContentResource[]} contentResources The array of content resources to build the scene from.
		 * @returns {sap.ui.vk.Scene} The scene built from the content resources.
		 * @public
		 */
		buildSceneTree: function(contentResources) {
			// At this point all content contentResources must be downloaded.

			var vkScene, dvlRootSceneId, resourcesToStartWith, rootSceneResource;

			// Process top level content contentResources in a special way. Then process next level content contentResources recursively.
			if (contentResources.length === 1 && (contentResources[0].getSource() || contentResources[0].getFile())) {
				// Load the resource without creating a grouping node and merging.
				rootSceneResource = this._findSceneResources({ source: contentResources[0].getFile() || contentResources[0].getSource(), modified: false })[0];
				if (rootSceneResource) {
					resourcesToStartWith = contentResources[0].getContentResources();
				} else {
					throw new Error("Content resource " + contentResources[0].getSource() + " is not downloaded");
				}
			} else {
				// Always create a new empty scene for the root node.
				rootSceneResource = new SceneResource(this._dvl.Core.CreateEmptyScene());
				this._sceneResources.push(rootSceneResource);
				resourcesToStartWith = contentResources;
			}
			rootSceneResource.modified = true;
			dvlRootSceneId = rootSceneResource.dvlSceneId;
			vkScene = new Scene(this, dvlRootSceneId);
			this._vkScenes.push(vkScene);
			var vkScenesToSceneResourcesMap = this._vkScenesToSceneResourcesMap[vkScene.getId()] = [rootSceneResource];
			var nodeHierarchy = vkScene.getDefaultNodeHierarchy();

			var getSceneTopNodes = function(sceneId) {
				return this._dvl.Scene.RetrieveSceneInfo(sceneId, sap.ve.dvl.DVLSCENEINFO.DVLSCENEINFO_CHILDREN).ChildNodes;
			}.bind(this);

			var mergeContentResource = function(dvlParentNodeId, contentResource) {
				var dvlGroupingNodeId = this._dvl.Scene.CreateNode(dvlRootSceneId, dvlParentNodeId, contentResource.getName());
				var nodeProxy = nodeHierarchy.createNodeProxy(dvlGroupingNodeId);
				contentResource._setNodeProxy(nodeProxy);
				var matrix = contentResource.getLocalMatrix();
				if (matrix) {
					nodeProxy.setLocalMatrix(matrix);
				}
				var source = contentResource.getFile() || contentResource.getSource();
				if (source) {
					var resourceInfo = this._findSceneResources({ source: source, modified: false })[0];
					getSceneTopNodes(resourceInfo.dvlSceneId).forEach(function(nodeId) {
						this._dvl.Scene.CreateNodeCopy(dvlRootSceneId, nodeId, dvlGroupingNodeId, sap.ve.dvl.DVLCREATENODECOPYFLAG.COPY_CHILDREN);
					}.bind(this));
					if (vkScenesToSceneResourcesMap.indexOf(resourceInfo) < 0) {
						vkScenesToSceneResourcesMap.push(resourceInfo);
					}
				}
				contentResource.getContentResources().forEach(mergeContentResource.bind(this, dvlGroupingNodeId));
			}.bind(this);

			resourcesToStartWith.forEach(mergeContentResource.bind(this, /* dvlParentNodeId = */ null));

			return vkScene;
		},

		// END: Content Resource related methods.
		////////////////////////////////////////////////////////////////////////

		////////////////////////////////////////////////////////////////////////
		// BEGIN: Scene related methods.

		/**
		 * Destroys the scene object.
		 * @param {sap.ui.vk.Scene} vkScene The scene to destroy.
		 * @returns {sap.ui.vk.GraphicsCore} <code>this</code> to allow method chaining.
		 * @public
		 */
		destroyScene: function(vkScene) {
			var vkSceneId = vkScene.getId();
			var vkSceneIndex = this._vkScenes.indexOf(vkScene);
			if (vkSceneIndex < 0) {
				jQuery.sap.log.warning("Scene with id '" + vkSceneId + "' is not create by this GraphicsCore.");
				return this;
			}

			var vkSceneResources = this._vkScenesToSceneResourcesMap[vkSceneId];

			this._vkScenes.splice(vkSceneIndex, 1);
			delete this._vkScenesToSceneResourcesMap[vkSceneId];

			var vkSceneIds = Object.getOwnPropertyNames(this._vkScenesToSceneResourcesMap);
			vkSceneResources
				.filter(function(sceneResource) {
					// Can unload a scene resource if no vkScenes reference it.
					return !vkSceneIds.some(function(vkSceneId) {
						return this._vkScenesToSceneResourcesMap[vkSceneId].indexOf(sceneResource);
					});
				})
				.forEach(this._destroySceneResource.bind(this));

			vkScene.destroy();

			return this;
		},

		// END: Scene related methods.
		////////////////////////////////////////////////////////////////////////

		////////////////////////////////////////////////////////////////////////
		// BEGIN: Viewport related methods.

		/**
		 * Registers the viewport in GraphicsCore.
		 * Viewports are registered when corresponding DVLRenderers are created.
		 * @param {sap.ui.vk.Viewport} viewport The viewport to register.
		 * @returns {boolean} <code>true</code> if <code>viewport</code> gets registered, <code>false</code> if <code>viewport</code> was already registered.
		 * @private
		 */
		_registerViewport: function(viewport) {
			if (this._viewports.indexOf(viewport) >= 0) {
				return false;
			}
			this._viewports.push(viewport);
			return true;
		},

		/**
		 * Unregisters the viewport in GraphicsCore.
		 * Viewports are unregistered when corresponding DVLRenderers are destroyed.
		 * @param {sap.ui.vk.Viewport} viewport The viewport to unregister.
		 * @returns {boolean} <code>true</code> if <code>viewport</code> gets unregistered, <code>false</code> if <code>viewport</code> was already unregistered.
		 * @private
		 */
		_unregisterViewport: function(viewport) {
			var index = this._viewports.indexOf(viewport);
			if (index < 0) {
				return false;
			}
			this._viewports.splice(index, 1);
			return true;
		},

		/**
		 * Gets the Viewport object count.
		 * @returns {int} The number of Viewport objects registered in GraphicsCore.
		 * @private
		 */
		_getViewportCount: function() {
			return this._viewports.length;
		},

		// END: Viewport related methods.
		////////////////////////////////////////////////////////////////////////

		////////////////////////////////////////////////////////////////////////
		// BEGIN: View State Manager related methods.

		/**
		 * Creates a new ViewStateManager object.
		 *
		 * GraphicsCore owns the new ViewStateManager object. The object must be destroyed with the {@link #destroyViewStateManager destroyViewStateManager} method;
		 *
		 * @param {sap.ui.vk.NodeHierarchy} nodeHierarchy The NodeHierarchy object the view state manager is created for.
		 * @returns {sap.ui.vk.ViewStateManager} The newly created ViewStateManager object.
		 * @public
		 */
		createViewStateManager: function(nodeHierarchy) {
			var viewStateManager = new ViewStateManager(nodeHierarchy);
			this._viewStateManagers.push(viewStateManager);
			return viewStateManager;
		},

		/**
		 * Destroys the ViewStateManager object created with the {@link #createViewStateManager createViewStateManager} method.
		 *
		 * @param {sap.ui.vk.ViewStateManager} viewStateManager The ViewStateManagerObject to destroy.
		 * @returns {sap.ui.vk.GraphicsCore} <code>this</code> to allow method chaining.
		 * @public
		 */
		destroyViewStateManager: function(viewStateManager) {
			var index = this._viewStateManagers.indexOf(viewStateManager);
			if (index >= 0) {
				this._viewStateManagers.splice(index, 1)[0].destroy();
			}
			return this;
		},

		// END: View State Manager related methods.
		////////////////////////////////////////////////////////////////////////

		////////////////////////////////////////////////////////////////////////
		// BEGIN: Utility methods.

		/**
		 * Shows or hides debug information in the viewports.
		 *
		 * @param {boolean} enable <code>true</code> to show debug information, <code>false</code> to hide debug information.
		 * @returns {sap.ui.vk.GraphicsCore} <code>this</code> to allow method chaining.
		 * @public
		 * @experimental since version 1.32.0. The behavior might change in the next version.
		 */
		showDebugInfo: function(enable) {
			this._viewports.forEach(function(viewport) {
				viewport.setOption(sap.ve.dvl.DVLRENDEROPTION.DVLRENDEROPTION_SHOW_DEBUG_INFO, enable);
			});
			return this;
		},

		/**
		 * Gets one of APIs supported by the DVL library.
		 *
		 * @param {sap.ui.vk.GraphicsCoreApi} apiId The API identifier.
		 * @returns {object} The object that implements the requested API or null if the API is not supported.
		 * @public
		 * @experimental since version 1.32.0. The behavior might change in the next version.
		 */
		getApi: function(apiId) {
			switch (apiId) {
				case sap.ui.vk.GraphicsCoreApi.LegacyDvl:
					return this._dvl;
				default:
					return null;
			}
		}

		// END: Utility methods.
		////////////////////////////////////////////////////////////////////////
	});

	return GraphicsCore;
});
