/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.Viewer.
sap.ui.define([
	"jquery.sap.global", "./library", "sap/ui/core/Control", "./Scene", "./Viewport", "./ContentResource", "./NativeViewport",
	"./Overlay", "./SceneTree", "sap/ui/layout/Splitter", "sap/ui/layout/SplitterLayoutData", "./FlexibleControl", "./FlexibleControlLayoutData", "./StepNavigation", "./Toolbar", "sap/ui/core/ResizeHandler"
], function(jQuery, library, Control, Scene, Viewport, ContentResource, NativeViewport, Overlay, SceneTree, Splitter, SplitterLayoutData, FlexibleControl, FlexibleControlLayoutData, StepNavigation, VkToolbar, ResizeHandler) {
	"use strict";

	var log = jQuery.sap.log;

	/**
	 * Creates a new instance of the Viewer control.
	 *
	 * Besides the settings documented below, Viewer itself supports the following special settings:
	 * <ul>
	 *   <li>
	 *     <code>runtimeSettings</code>: <i><code>object</code></i> Optional Emscripten runtime module settings. A JSON object with the following properties:
	 *     <ul>
	 *       <li><code>totalMemory</code>: <i><code>int</code></i> (default: 128 * 1024 * 1024) size of Emscripten module memory in bytes.</li>
	 *       <li><code>logElementId</code>: <i><code>string</code></i> ID of a textarea DOM element to write the log to.</li>
	 *       <li><code>statusElementId</code>: <i><code>string</code></i> ID of a DOM element to write the status messages to.</li>
	 *     </ul>
	 *   </li>
	 *   <li>
	 *     <code>webGLContextAttributes</code>: <i><code>object</code></i> Optional WebGL context attributes. A JSON object with the following boolean properties:
	 *     <ul>
	 *       <li><code>antialias</code>: <i><code>boolean</code></i> (default: <code>true</code>) If set to <code>true</code>, the context will attempt to perform antialiased rendering if possible.</li>
	 *       <li><code>alpha</code>: <i><code>boolean</code></i> (default: <code>true</code>) If set to <code>true</code>, the context will have an alpha (transparency) channel.</li>
	 *       <li><code>premultipliedAlpha</code>: <i><code>boolean</code></i> (default: <code>false</code>) If set to <code>true</code>, the color channels in the framebuffer will be stored premultiplied by the alpha channel to improve performance.</li>
	 *     </ul>
	 *     Other {@link https://www.khronos.org/registry/webgl/specs/latest/1.0/#5.2 WebGL context attributes} are also supported.
	 *   </li>
	 * </ul>
	 *
	 * @class
	 * This control is intended to help application developers include simple 3D visualization capability in their application by connecting,
	 * configuring and presenting the essential Visualization Toolkit controls a single composite control.
	 *
	 * @param {string} [sId] ID for the new Viewer control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new Viewer control
	 * @public
	 * @author SAP SE
	 * @version 1.32.3
	 * @extends sap.ui.core.Control
	 * @alias sap.ui.vk.Viewer
	 * @experimental Since 1.32.0 This class is experimental and might be modified or removed in future versions.
	 */
	var Viewer = Control.extend("sap.ui.vk.Viewer", /** @lends sap.ui.vk.Viewer.prototype */ {
		metadata: {
			library: "sap.ui.vk",

			properties: {
				/**
				 * Enables or disables the Overlay control
				 */
				enableOverlay : {
					type:  "boolean",
					defaultValue: false
				},
				/**
				 * Disables the scene tree control Button on the menu
				 */
				enableSceneTree : {
					type:  "boolean",
					defaultValue: false
				},
				/**
				 * Shows or hides the scene tree control
				 */				
				showSceneTree: {
					type: "boolean",
					defaultValue: false
				},
				/**
				 * Disables the Step Navigation Control Button on the menu
				 */
				enableStepNavigation : {
					type:  "boolean",
					defaultValue: false
				},
				/**
				 * Shows or hides the Step Navigation Control
				 */
				showStepNavigation : {
					type:  "boolean",
					defaultValue: false
				},
				/**
				 * Shows or hides Toolbar control
				 */
				enableToolbar : {
					type:  "boolean",
					defaultValue: true
				},
				/**
				 * Enable / disable full screen mode
				 */
				enableFullScreen : {
					type:  "boolean",
					defaultValue: false
				},
				/**
				 * Shows or hides Toolbar control
				 */
				width : {
					type:  "sap.ui.core.CSSSize",
					defaultValue: "auto"
				},
				/**
				 * Shows or hides Toolbar control
				 */
				height : {
					type:  "sap.ui.core.CSSSize",
					defaultValue: "auto"
				},
				/**
				 * Sets the title of the toolbar
				 */
				toolbarTitle : {
					type:  "string",
					defaultValue: ""
				}
			},

			publicMethods: [
				"getGraphicsCore",
				"getNativeViewport",
				"getScene",
				"getViewport",
				"getViewStateManager"
			],

			aggregations: {
				/**
				 * Content resources to load and display in the Viewer control.
				 */
				contentResources: {
					type: "sap.ui.vk.ContentResource"
				},

				toolbar: {
					type: "sap.ui.vk.Toolbar",
					multiple: false,
					visibility: "hidden"
				},

				viewport: {
					type: "sap.ui.vk.Viewport",
					multiple: false,
					visibility: "hidden"
				},

				nativeViewport: {
					type: "sap.ui.vk.NativeViewport",
					multiple: false,
					visibility: "hidden"
				},

				stepNavigation: {
					type: "sap.ui.vk.StepNavigation",
					multiple: false,
					visibility: "hidden"
				},

				hotspotOverlay: {
					type: "sap.ui.vk.Overlay",
					multiple: false,
					visibility: "hidden"
				},

				sceneTree: {
					type: "sap.ui.vk.SceneTree",
					multiple: false,
					visibility: "visible"
				},

				_layout: {
					type: "sap.ui.vk.FlexibleControl",
					multiple: false,
					visibility: "true"
				},

				viewStateManager: {
					type: "sap.ui.vk.ViewStateManager",
					multiple: false,
					visibility: "hidden"
				}
			},

			events: {
				/**
				 * This event will be fired when a Scene has been loaded into the Viewer.
				 */
				sceneLoadingSucceeded: {
					parameters: {
						/**
						 * Returns a reference to the loaded Scene.
						 */
						scene: { type: "sap.ui.vk.Scene" }
					}
				},

				/**
				 * This event will be fired when a critical error occurs during scene loading.
				 */
				sceneLoadingFailed: {},

				/**
				 * This event will be fired when Scene loaded in Viewer is about to be destroyed.
				 */
				sceneDestroying: {
					parameters: {
						/**
						 * Returns a reference to the scene to be destroyed.
						 */
						scene: { type: "sap.ui.vk.Scene" }
					}
				},

				/**
				 * This event will be fired when the Viewer successfully loads a image.
				 */
				imageLoadingSucceeded: {},

				/**
				 * This event will be fired when a critical error occurs while loading an image into the Viewer.
				 */
				imageLoadingFailed: {},

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
					}
				},
				
				/**
				 * This event is fired when viewer enters/exits full screen mode.
				 */
				fullScreen: {
					parameters: {
						/**
						 * true: entered full screen;
						 * false: exited full screen.
						 */
						isFullScreen: { type: "boolean" }
					}
				}
			},

			specialSettings: {
				/**
				 * Optional Emscripten runtime module settings. A JSON object with the following properties:
				 * <ul>
				 *   <li>totalMemory {int} size of Emscripten module memory in bytes, default value: 128 MB.</li>
				 *   <li>logElementId {string} ID of a textarea DOM element to write the log to.</li>
				 *   <li>statusElementId {string} ID of a DOM element to write the status messages to.</li>
				 * </ul>
				 * Emscripten runtime module settings cannot be changed after the control is fully initialized.
				 */
				runtimeSettings: {
					type: "object"
				},

				/**
				 * Optional WebGL context attributes. A JSON object with the following boolean properties:
				 * <ul>
				 *   <li>antialias {boolean} default value <code>true</code>. If set to <code>true</code>, the context will attempt to perform antialiased rendering if possible.</li>
				 *   <li>alpha {boolean} default value <code>true</code>. If set to <code>true</code>, the context will have an alpha (transparency) channel.</li>
				 *   <li>premultipliedAlpha {boolean} default value <code>false</code>. If set to <code>true</code>, the color channels in the framebuffer will be stored premultiplied by the alpha channel to improve performance.</li>
				 * </ul>
				 * Other {@link https://www.khronos.org/registry/webgl/specs/latest/1.0/#5.2 WebGL context attributes} are also supported.
				 * WebGL context attributes cannot be changed after the control is fully initialized.
				 */
				webGLContextAttributes: {
					type: "object"
				}
			}
		},

		applySettings: function(settings) {
			if (settings) {
				this._runtimeSettings = settings.runtimeSettings;
				this._webGLContextAttributes = settings.webGLContextAttributes;
				delete settings.runtimeSettings;
				delete settings.webGLContextAttributes;
			}
			return Control.prototype.applySettings.apply(this, arguments);
		},

		init: function() {
			log.debug("sap.ui.vk.Viewer.init() called.");

			if (Control.prototype.init) {
				Control.prototype.init.apply(this);
			}

			this.oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.vk.i18n");

			this.setTooltip(this.oResourceBundle.getText("VIEWER_TITLE"));
			this._resizeListenerId = null;
			this._shouldLoadContentResources = true;
			this._busyIndicatorCounter = 0;
			this._toolbar = null;
			this._viewport = null;
			this._nativeViewport = null;
			this._stepNavigation = null;
			this._hotspotOverlay = null;
			this._mainScene = null;
			this._sceneTree = null;

			this._updateSizeTimer = 0;
			this._fullScreenToggle = false;
			
			this._oldWidth = '100%';
			this._oldHeight = '100%';

			this._content = new Splitter(this.getId() + "-splitter", {
				orientation: "Horizontal"
			});

			this._stackedViewport = new FlexibleControl({
				width: "100%",
				height: "100%",
				layout: "Stacked"
			});

			this._layout = new FlexibleControl(this.getId() + "-flexibleControl", {
				width: "100%",
				height: "100%",
				layout: "Vertical"
			});
			
			this._stackedViewport.setLayoutData(new SplitterLayoutData({
				size: "100%",
				minSize: 160,
				resizable:true
			}));

			this._content.addContentArea(this._stackedViewport);
			this.setAggregation("_layout", this._layout);
		},

		/**
		 * Destroys the Viewer control. All scenes will be destroyed and all Viewports will be unregistered by the Graphics Core.
		 * @private
		 */
		exit: function() {
			log.debug("sap.ui.vk.Viewer.exit() called.");

			// All scenes will be destroyed and all viewports will be unregistered by GraphicsCore.destroy.
			if (this._sceneTree) {
				this._sceneTree.setScene(null);
			}

			if (this._stepNavigation) {
				this._stepNavigation.setScene(null);
			}

			this._toolbar = null;
			this._sceneTree = null;
			this._mainScene = null;
			this._nativeViewport = null;
			this._stepNavigation = null;
			this._viewport = null;

			this._setViewStateManager(null);

			if (this._graphicsCore) {
				this._graphicsCore.destroy();
				this._graphicsCore = null;
			}

			if (this._resizeListenerId) {
				ResizeHandler.deregister(this._resizeListenerId);
				this._resizeListenerId = null;
			}

			if (Control.prototype.exit) {
				Control.prototype.exit.apply(this);
			}
		},

		_destroyMainScene: function() {
			if (this._mainScene) {
				this.fireSceneDestroying({ scene: this._mainScene });

				if (this._sceneTree) {
					this._sceneTree.setScene(null, null);
				}

				if (this._stepNavigation) {
					this._stepNavigation.setScene(null);
				}

				this._toolbar = null;
				this._viewport.setViewStateManager(null);
				this._setViewStateManager(null);
				if (this._viewport) {
					this._viewport.setScene(null);
				}
				this._graphicsCore.destroyScene(this._mainScene);
				this._mainScene = null;
			}
		},

		/**
		 * Gets the GraphicsCore object.
		 * @returns {sap.ui.vk.GraphicsCore} The GraphicsCore object.
		 * @public
		 */
		getGraphicsCore: function() {
			return this._graphicsCore;
		},

		/**
		 * Gets the Scene currently loaded in the Viewer control.
		 * @returns {sap.ui.vk.Scene} The scene loaded in the control.
		 * @public
		 */
		getScene: function() {
			return this._mainScene;
		},

		/**
		 * Gets the view state manager object used for handling visibility and selection of nodes.
		 * @returns {sap.ui.vk.ViewStateManager} The view state manager object.
		 * @public
		 */
		getViewStateManager: function() {
			return this.getAggregation("viewStateManager");
		},

		/**
		 * Sets the view state manager object used for handling visibility and selection of nodes.
		 * @param {sap.ui.vk.ViewStateManager} viewStateManager The ViewStateManager object.
		 * @returns {sap.ui.vk.Viewer} <code>this</code> to allow method chaining.
		 * @private
		 */
		_setViewStateManager: function(viewStateManager) {
			if (!this._graphicsCore) {
				return this;
			}
			if (viewStateManager === this.getViewStateManager()) {
				return this;
			}
			if (this.getViewStateManager()) {
				this._graphicsCore.destroyViewStateManager(this.getViewStateManager());
			}
			this.setAggregation("viewStateManager", viewStateManager, true);
			return this;
		},

		/**
		 * Gets the 3D viewport.
		 * @returns {sap.ui.vk.Viewport} The 3D viewport.
		 * @public
		 */
		getViewport: function() {
			return this._viewport;
		},

		/**
		 * Gets the 2D viewport used for displaying format natively supported by the browser - 2D images etc.
		 * @returns {sap.ui.vk.NativeViewport} The 2D viewport.
		 * @public
		 */
		getNativeViewport: function() {
			return this._nativeViewport;
		},

		/**
		 * @return {object} The Emscripten runtime settings.
		 * @private
		 */
		_getRuntimeSettings: function() {
			return this._runtimeSettings;
		},

		/**
		 * @returns {object} The webGLContextAttributes property.
		 * @private
		 */
		_getWebGLContextAttributes: function() {
			return this._webGLContextAttributes;
		},

		setEnableOverlay: function(oProperty) {
			if (oProperty == this.getProperty("enableOverlay")) {
				return;
			}

			this._activateOverlay(oProperty);
			this.setProperty("enableOverlay", oProperty, true);
			return this;
		},

		setEnableSceneTree: function(oProperty) {
			this.setProperty("enableSceneTree", oProperty, true);
			if (!oProperty) {
				this.setProperty("showSceneTree", false);
			}
			this._updateLayout();
			return this;
		},

		setShowSceneTree: function(oProperty) {
			this.setProperty("showSceneTree", oProperty, true);
			this._updateLayout();
			return this;
		},

		setEnableStepNavigation: function(oProperty) {
			this.setProperty("enableStepNavigation", oProperty, true);
			if (!oProperty) {
				this.setProperty("showStepNavigation", false);
			}
			this._updateLayout();
			return this;
		},
		
		setShowStepNavigation: function(oProperty) {
			this.setProperty("showStepNavigation", oProperty, true);
			this._updateLayout();
			return this;
		},


		setEnableToolbar: function(oProperty) {
			this.setProperty("enableToolbar", oProperty, true);
			this._updateLayout();
			return this;
		},


		setEnableFullScreen: function(oProperty) {
			this.setProperty("enableFullScreen", oProperty, true);
			this._fullScreenToggle = true;
			
			// Fullscreen toggle
			var viewer = document.getElementById(this.getId());
			var bFull = this.getProperty("enableFullScreen");
			var bChanged = false;
			
			if (bFull) {
				if (!(document.fullScreen || document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement)) {
					this._oldWidth = this.getWidth();
					this._oldHeight = this.getHeight();
					
					var viewer = document.getElementById(this.getId());
					
					if (!this._fullScreenHandler) {
						this._fullScreenHandler = function (event) {
							if (!(document.fullscreen || document.mozFullScreen || document.webkitIsFullScreen || document.msFullscreenElement)) {
								document.removeEventListener("fullscreenchange", this._fullScreenHandler.bind(this));
								document.removeEventListener("mozfullscreenchange", this._fullScreenHandler.bind(this));
								document.removeEventListener("webkitfullscreenchange", this._fullScreenHandler.bind(this));
								document.removeEventListener("msfullscreenchange", this._fullScreenHandler.bind(this));
								
								viewer.style.width = this._oldWidth;
								viewer.style.height = this._oldHeight;	
								this._updateSize();	
								this.fireFullScreen({isFullScreen: false});
							}
						};
						
						document.addEventListener("fullscreenchange", this._fullScreenHandler.bind(this));
						document.addEventListener("mozfullscreenchange", this._fullScreenHandler.bind(this));
						document.addEventListener("webkitfullscreenchange", this._fullScreenHandler.bind(this));
						document.addEventListener("msfullscreenchange", this._fullScreenHandler.bind(this));
					}
					
					bChanged = true;

					if (viewer.requestFullScreen) {
						viewer.requestFullScreen();
					} else if (viewer.webkitRequestFullScreen) {
						viewer.webkitRequestFullScreen();
					} else if (viewer.mozRequestFullScreen) {
						viewer.mozRequestFullScreen();
					} else if (viewer.msRequestFullscreen) {
						viewer.msRequestFullscreen();
					} else {
						bChanged = false;
					}
					
					if (bChanged) {
						viewer.style.width = '100%';
						viewer.style.height = '100%';
					}
				}
			} else {
				if (document.fullScreen || document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement) {
					bChanged = true;
					
					if (document.cancelFullScreen) {
						document.cancelFullScreen();
					} else if (document.webkitCancelFullScreen) {
						document.webkitCancelFullScreen();
					} else if (document.mozCancelFullScreen) {
						document.mozCancelFullScreen();
					} else if (document.msExitFullscreen) {
						document.msExitFullscreen();
					} else {
						bChanged = false;
					}
					
					if (bChanged) {
						viewer.style.width = this._oldWidth;
						viewer.style.height = this._oldHeight;
					}
				}
			}
			
			if (bChanged) {
				this._updateSize();
				this.fireFullScreen({isFullScreen: bFull});
			}
			
			return this;
		},

		/**
		 * Destroys all the content resources in the aggregation named contentResources.
		 * @private
		 */
		destroyContentResources: function(suppressInvalidate) {
			this._shouldLoadContentResources = true;
			this._destroyMainScene();
			return this.destroyAggregation("contentResources", suppressInvalidate);
		},

		invalidate: function(origin) {
			jQuery.sap.log.debug("invalidate " + (origin instanceof sap.ui.base.ManagedObject ? origin.getId() : origin));
			if (origin instanceof ContentResource) {
				this._shouldLoadContentResources = true;
			}
			return Control.prototype.invalidate.apply(this, arguments);
		},

		onBeforeRendering: function() {
			if (this._fullScreenToggle) {
				this._fullScreenToggle = false;
			} else {
				this._showToolbar();
				this._showSceneTree();
				this._showStepNavigation();
				if (this._shouldLoadContentResources) {
					this._destroyMainScene();
					this._loadAllContentResources();
				}
			}

			if (this._resizeListenerId) {
				ResizeHandler.deregister(this._resizeListenerId);
				this._resizeListenerId = null;
			}
		},

		onAfterRendering: function() {
			var domRef = this.getDomRef();
			this._resizeListenerId = ResizeHandler.register(this, this._handleResize.bind(this));
			this._handleResize({ size: { width: domRef.clientWidth, height: domRef.clientHeight } } );
		},

		/**
		 * Handles the resize events from the {@link sap.ui.core.ResizeHandler ResizeHandler} object.
		 * @param {jQuery.Event} event The event object.
		 * @private
		 */
		_handleResize: function(event) {
			this._updateSize();
		},

		_updateSize: function() {
			if (this._updateSizeTimer) {
				clearTimeout(this._updateSizeTimer);
			}
			this._updateSizeTimer = setTimeout(this._doUpdateSize.bind(this), 100);
		},
		
		_doUpdateSize: function() {
			var flexId = this.getId() + "-flexibleControl";
			var layout = document.getElementById(flexId);
			layout.style.width = '100%';
			layout.style.height = '100%';
			
			var height = layout.clientHeight;
			
			var header = document.getElementById(flexId + "Content_0");
			var middle = document.getElementById(flexId + "Content_1");
			var footer = document.getElementById(flexId + "Content_2");
			
			height -= header.clientHeight;
			
			if (footer != null && footer.style.visibility != 'hidden') {
				height -= footer.clientHeight;
			}
			
			middle.style.height = height + "px";	
		},

		isTreeBinding: function(name) {
			return name === "contentResources";
		},

		setBusy: function(busy) {
			if (busy) {
				if (this._busyIndicatorCounter === 0) {
					this.setBusyIndicatorDelay(0);
					Control.prototype.setBusy.call(this, true);
				}
				this._busyIndicatorCounter += 1;
			} else {
				this._busyIndicatorCounter -= 1;
				if (this._busyIndicatorCounter == 0) {
					Control.prototype.setBusy.call(this, false);
				}
			}
		},

		_loadAllContentResources: function() {
			var log = jQuery.sap.log;
			var resources = this.getContentResources();
			if (resources.length === 0) {
				return this;
			}
			var categories = collectContentResourceCategories(resources);
			if (categories.length === 1) {
				var category = categories[0];
				if (category === sap.ui.vk.ContentResourceSourceCategory["3D"]) {
					this.setBusy(true);
					this._showSceneTree();
					this._showViewport();
					this._showStepNavigation();
					this._destroyMainScene();
					this._graphicsCore.loadContentResourcesAsync(resources, function(sourcesFailedToLoad) {
						if (sourcesFailedToLoad) {
							log.error("Some of content resources cannot be loaded.");
							this.fireSceneLoadingFailed();
						} else {
							var scene = this._graphicsCore.buildSceneTree(resources);
							if (scene) {
								this._mainScene = scene;
								this._viewport.setScene(this._mainScene);
								this._setViewStateManager(this._graphicsCore.createViewStateManager(this._mainScene.getDefaultNodeHierarchy()));
								this._viewport.setViewStateManager(this.getViewStateManager());
								this.fireSceneLoadingSucceeded({ scene: this._mainScene });
								this._sceneTree.setScene(this._mainScene, this.getViewStateManager());
								this.setEnableSceneTree(true);
								this.setShowSceneTree(true);

								this._stepNavigation.setScene(this._mainScene);
								this.setEnableStepNavigation(true);
								
								// Step Navigation must be properly initialized by those...
								// otherwise it will kick viewer out of full screen mode when shown for the first time.
								this.setShowStepNavigation(true);
								this.setShowStepNavigation(false);
							} else {
								this.fireSceneLoadingFailed();
							}
						}
						this.setBusy(false);
						this._shouldLoadContentResources = false;
					}.bind(this));
				} else if (category === sap.ui.vk.ContentResourceSourceCategory["2D"]) {
					this.setEnableSceneTree(false);
					this.setEnableStepNavigation(false);

					if (resources.length === 1) {
						var onImageLoadingSucceeded = function() {
							this._shouldLoadContentResources = false;
							this.setBusy(false);
							if (this.getEnableOverlay()) {
								this._activateOverlay(true);
							}
							this.fireImageLoadingSucceeded();
						}.bind(this);
						var onImageLoadingFailed = function() {
							this._shouldLoadContentResources = false;
							this.setBusy(false);
							this.fireImageLoadingFailed();
						}.bind(this);
						this._showNativeViewport();
						this.setBusy(true);
						var resource = resources[0];
						if (resource.getFile()) {
							var fileReader = new FileReader();
							fileReader.onload = function(event) {
								this._nativeViewport.loadUrl(fileReader.result, onImageLoadingSucceeded, onImageLoadingFailed, null, resource.getSourceType());
							}.bind(this);
							fileReader.readAsDataURL(resource.getFile());
						} else {
							this._nativeViewport.loadUrl(resource.getSource(), onImageLoadingSucceeded, onImageLoadingFailed, null, resource.getSourceType());
						}
					} else {
						log.error("Loading multiple 2D files is not supported yet");
					}
				}
			} else if (categories.length > 1) {
				throw new Error("All content resources must have same category - either 3D or 2D.");
			} /*else { // categories.length === 0
				// TODO: handle this case
			}*/
			return this;
		},

		_showToolbar: function () {
			if (!this._toolbar) {
				this._toolbar = new VkToolbar({title:this.getToolbarTitle()});
				this._toolbar.setViewer(this);
				this.setAggregation("toolbar", this._toolbar);
			}
			this._toolbar.setVisible(this.getEnableToolbar());
			this._updateLayout();
			return this;
		},

		_updateLayout: function(){
			this._layout.setWidth(this.getWidth());
			this._layout.removeAllContent();
			this._layout.setHeight(this.getHeight());

			var height = this.getHeight();
			var contentHeight = [0, 0, 0];

			if (height == "auto") {
				height = 400;
			} else if (height.substr(height.length - 1) == '%') {
				height = 400;
			} else {
				height = parseInt(height, 10);
			}

			if (this._toolbar != null && this.getEnableToolbar()) {
				contentHeight[0] = 48;
			}
			if (this._stepNavigation != null && this.getShowStepNavigation()) {
				contentHeight[2] = 0;
			}

			contentHeight[1] = height - contentHeight[0] - contentHeight[2];

			if (this._toolbar != null && this.getEnableToolbar()) {
				this._toolbar.setVisible(true);
				this._toolbar.setLayoutData(new FlexibleControlLayoutData({
					size: contentHeight[0] + "px"
				}));
				this._layout.insertContent(this._toolbar,0);
			} else if (this._toolbar != null) {
				this._toolbar.setVisible(false);
			}

			if (this._sceneTree != null && this.getShowSceneTree()){
				this._sceneTree.setVisible(true);
				this._sceneTree.setLayoutData(new SplitterLayoutData({
					size: "320px",
					minSize: 10,
					resizable:true
				}));
				this._content.insertContentArea(this._sceneTree, 0);
			} else if (this._sceneTree != null) {
				this._content.removeContentArea(this._sceneTree);
				this._sceneTree.setVisible(false);
			}
			this._content.setLayoutData(new FlexibleControlLayoutData({
				size: contentHeight[1] + "px"
			}));
			this._layout.addContent(this._content);

			if (this._stepNavigation != null && this.getShowStepNavigation()) {
				if (this._graphicsCore != null && !this._stepNavigation.hasGraphicsCore()) {
					this._stepNavigation.setGraphicsCore(this._graphicsCore);
				}
				this._stepNavigation.setVisible(true);
				this._layout.addContent(this._stepNavigation);
			} else if (this._stepNavigation != null){
				this._stepNavigation.setVisible(false);
			}

			this._toolbar.refresh();
			this._updateSize();
		},

		_showSceneTree: function () {
			if (!this._sceneTree) {
				this._sceneTree = new SceneTree();
				this.setAggregation("sceneTree", this._sceneTree);
			}
			this._sceneTree.setVisible(this.getShowSceneTree());
			this._updateLayout();
			return this;
		},

		_showStepNavigation: function () {
			if (!this._stepNavigation) {
				this._stepNavigation = new StepNavigation(this.getId() + "-stepNavigation",{visible: this.getShowStepNavigation()});
				this.setAggregation("stepNavigation", this._stepNavigation);
			}
			this._stepNavigation.setVisible(this.getShowStepNavigation());
			this._updateLayout();
			return this;
		},

		_showViewport: function() {
			if (!this._viewport) {
				this._viewport = new Viewport(this.getId() + "-viewport");
				this.setAggregation("viewport", this._viewport);
			}
			if (!this._graphicsCore) {
				jQuery.sap.require("sap.ui.vk.GraphicsCore");
				this._graphicsCore = new sap.ui.vk.GraphicsCore(
					this._getRuntimeSettings(),
					jQuery.extend(
						{
							antialias: true,
							alpha: true,
							premultipliedAlpha: false
						},
						this._getWebGLContextAttributes()
					)
				);
				this._viewport.setGraphicsCore(this._graphicsCore);
			}

			if (this._nativeViewport) {
				this._nativeViewport.setVisible(false);
			}
			this._stackedViewport.removeAllContent();
			this._stackedViewport.addContent(this._viewport);
			this._viewport.setVisible(true);

			return this;
		},

		_showNativeViewport: function() {
			if (!this._nativeViewport) {
				this._nativeViewport = new NativeViewport(this.getId() + "-nativeViewport");
				this.setAggregation("nativeViewport", this._nativeViewport);
			}

			if (this._viewport) {
				this._viewport.setVisible(false);
			}
			this._stackedViewport.removeAllContent();
			this._stackedViewport.addContent(this._nativeViewport);
			this._nativeViewport.setVisible(true);

			return this;
		},

		_activateOverlay: function(bEnable) {
			if (bEnable) {
				var oOverlay = new sap.ui.vk.Overlay();
				this.setAggregation("hotspotOverlay", oOverlay);

				oOverlay.setTarget(this._nativeViewport);
				this._fillMockData();
				this._stackedViewport.addContent(oOverlay);
			} else {
				var oOverlay = this.getAggregation("hotspotOverlay");
				this._stackedViewport.removeContent(1);
				this.removeAllAggregation("hotspotOverlay");
			}
		},

		_fillMockData : function() {
			var oOverlay = this.getAggregation("hotspotOverlay");
			oOverlay.addArea(new sap.ui.vk.OverlayArea({
				position: '0.4;0.6;0;0.6;0.6;0;0.6;0.4;0;0.4;0.4;0', tooltip: 'Area 1', changeable: false
			}));
		}
	});

	/**
	 * Collects content resource categories. The result is tested if the content resource hierarchy has the same category - 2D or 3D.
	 * @param {sap.ui.vk.ContentResource[]} resources The array of content resources.
	 * @returns {sap.ui.vk.ContentResourceSourceCategory[]} The array of distinct content resource categories.
	 * @private
	 */
	function collectContentResourceCategories(resources) {
		var categories = [];
		var map = {};

		function getResourceCategory(resource) {
			var sourceType = resource.getSourceType();
			if (sourceType) {
				var category = sap.ui.vk.ContentResourceSourceTypeToCategoryMap[sourceType] || "unknown";
				if (!map.hasOwnProperty(category)) {
					map[category] = true;
					categories.push(category);
				}
			}
			resource.getContentResources().forEach(getResourceCategory);
		}

		resources.forEach(getResourceCategory);

		return categories;
	}

	return Viewer;
});
