/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.Viewport.
sap.ui.define([
	"jquery.sap.global", "./library", "sap/ui/core/Control", "sap/ui/core/ResizeHandler", "./Loco", "./ViewportHandler"
], function(jQuery, library, Control, ResizeHandler, Loco, ViewportHandler) {
	"use strict";

	/**
	 * Creates a new Viewport control.
	 *
	 * @class
	 * This control provides a rendering canvas for the 3D elements of a loaded scene.
	 *
	 * @param {string} [sId] ID for the new Viewport control. Generated automatically if no ID is given.
	 * @param {object} [mSettings] Initial settings for the new Viewport control.
	 * @public
	 * @author SAP SE
	 * @version 1.32.3
	 * @extends sap.ui.core.Control
	 * @alias sap.ui.vk.Viewport
	 * @experimental Since 1.32.0 This class is experimental and might be modified or removed in future versions.
	 */
	var Viewport = Control.extend("sap.ui.vk.Viewport", /** @lends sap.ui.vk.Viewport.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			publicMethods: [
				"setGraphicsCore",
				"getGraphicsCore",
				"setScene",
				"setViewStateManager",
				"beginGesture",
				"endGesture",
				"pan",
				"rotate",
				"zoom",
				"tap",
				"queueCommand"
			]
		},

		init: function() {
			if (Control.prototype.init) {
				Control.prototype.init(this);
			}

			this._graphicsCore = null;
			this._dvl = null;
			this._dvlRendererId = null;
			this._canvas = null;
			this._resizeListenerId = null;

			this._viewportHandler = new ViewportHandler(this);
			this._loco = new Loco();
			this._loco.addHandler(this._viewportHandler);
		},

		exit: function() {
			this._loco.removeHandler(this._viewportHandler);
			this._viewportHandler.destroy();

			if (this._resizeListenerId) {
				ResizeHandler.deregister(this._resizeListenerId);
				this._resizeListenerId = null;
			}

			this.setViewStateManager(null);
			this.setScene(null);
			this.setGraphicsCore(null);

			if (Control.prototype.exit) {
				Control.prototype.exit.apply(this);
			}
		},

		/**
		 * Attaches or detaches the Viewport to the {@link sap.ui.vk.GraphicsCore GraphicsCore} object.
		 *
		 * @param {sap.ui.vk.GraphicsCore} graphicsCore The {@link sap.ui.vk.GraphicsCore GraphicsCore} object or <code>null</code>.
		 * If the <code>graphicsCore</code> parameter is not <code>null</code>, a rendering object corresponding to the Viewport is created.
		 * If the <code>graphicsCore</code> parameter is <code>null</code>, the rendering object corresponding to the Viewport is destroyed.
		 * @returns {sap.ui.vk.Viewport} <code>this</code> to allow method chaining.
		 * @public
		 */
		setGraphicsCore: function(graphicsCore) {
			if (graphicsCore != this._graphicsCore) {
				if (graphicsCore && this._graphicsCore && this._graphicsCore._getViewportCount() > 0) {
					throw new Error("Only one viewport instance is supported in the current implementation. This will change in future releases.");
				}

				if (this._graphicsCore) {
					if (this._graphicsCore._unregisterViewport(this)) {
						if (this._graphicsCore._getViewportCount() === 0) {
							this._dvl.Core.StopRenderLoop();
						}
					}
				}

				if (this._dvlRendererId) {
					this._dvl.Core.DoneRenderer();
					this._dvlRendererId = null;
				}

				this._dvl = null;

				this._graphicsCore = graphicsCore;

				if (this._graphicsCore) {
					var shouldStartRenderLoop = this._graphicsCore._getViewportCount() === 0;
					this._dvl = this._graphicsCore._getDvl();
					this._dvl.Core.InitRenderer();
					this._dvlRendererId = this._dvl.Core.GetRendererPtr();
					this._dvl.Renderer.SetBackgroundColor(0, 0, 0, 0, 0, 0, 0, 0);
					this._setCanvas(this._graphicsCore._getCanvas());
					this._graphicsCore._registerViewport(this);
					if (shouldStartRenderLoop) {
						this._dvl.Core.StartRenderLoop();
					}
				}
			}
			return this;
		},

		/**
		 * Gets the {@link sap.ui.vk.GraphicsCore GraphicsCore} object the Viewport is attached to.
		 * @returns {sap.ui.vk.GraphicsCore} The {@link sap.ui.vk.GraphicsCore GraphicsCore} object the Viewport is attached to, or <code>null</code>.
		 * @public
		 */
		getGraphicsCore: function() {
			return this._graphicsCore;
		},

		/**
		 * Sets the {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement HTMLCanvasElement} element for rendering 3D content.
		 * @param {HTMLCanvasElement} canvas The {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement HTMLCanvasElement} element.
		 * @returns {sap.ui.vk.Viewport} <code>this</code> to allow method chaining.
		 * @private
		 */
		_setCanvas: function(canvas) {
			// Invalidate the viewport only when it is already rendered.
			var shouldInvalidate = this.getDomRef() && this._canvas !== canvas;
			this._canvas = canvas;
			if (shouldInvalidate) {
				this.invalidate();
			}
			return this;
		},

		/**
		 * Attaches the scene to the Viewport for rendering.
		 * @param {sap.ui.vk.Scene} scene The scene to attach to the Viewport.
		 * @returns {sap.ui.vk.Viewport} <code>this</code> to allow method chaining.
		 * @public
		 */
		setScene: function(scene) {
			if (this._dvlRendererId) {
				this._dvl.Renderer.AttachScene(scene && scene._getDvlSceneId() || null);
			}
			return this;
		},

		onBeforeRendering: function() {
			if (this._resizeListenerId) {
				ResizeHandler.deregister(this._resizeListenerId);
				this._resizeListenerId = null;
			}
		},

		onAfterRendering: function() {
			if (this._canvas) {
				var domRef = this.getDomRef();
				domRef.appendChild(this._canvas);
				this._resizeListenerId = ResizeHandler.register(this, this._handleResize.bind(this));
				this._handleResize({ size: { width: domRef.clientWidth, height: domRef.clientHeight } } );
			}
		},

		/**
		 * Handles the resize events from the {@link sap.ui.core.ResizeHandler ResizeHandler} object.
		 * @param {jQuery.Event} event The event object.
		 * @private
		 */
		_handleResize: function(event) {
			if (this._dvlRendererId && this._canvas) {
				var devicePixelRatio    = window.devicePixelRatio || 1;
				var drawingBufferWidth  = event.size.width  * devicePixelRatio;
				var drawingBufferHeight = event.size.height * devicePixelRatio;

				this._dvl.Renderer.SetDimensions(drawingBufferWidth, drawingBufferHeight);
				this._dvl.Renderer.SetOptionF(sap.ve.dvl.DVLRENDEROPTIONF.DVLRENDEROPTIONF_DPI, 96 * devicePixelRatio);
				this._canvas.width = drawingBufferWidth;
				this._canvas.height = drawingBufferHeight;
				this._canvas.style.width = event.size.width + "px";
				this._canvas.style.height = event.size.height + "px";
				
				return true;
			}
		},

		/**
		 * @param viewStateManager
		 * @returns {sap.ui.vk.Viewport} this
		 * @public
		 */
		setViewStateManager: function(viewStateManager) {
			this._viewStateManager = viewStateManager;
			return this;
		},

		////////////////////////////////////////////////////////////////////////
		// 3D Rendering handling begins.

		/**
		 * @experimental
		 */
		shouldRenderFrame: function() {
			return this._dvlRendererId && this._dvl.Renderer.ShouldRenderFrame();
		},

		/**
		 * @experimental
		 */
		renderFrame: function() {
			if (this._dvlRendererId) {
				this._dvl.Renderer.RenderFrame(this._dvlRendererId);
			}
			return this;
		},

		/**
		 * @experimental
		 */
		renderFrameEx: function(viewMatrix, projectionMatrix) {
			if (this._dvlRendererId) {
				this._dvl.Renderer.RenderFrameEx.apply(this, [].concat(viewMatrix, projectionMatrix), this._dvlRendererId);
			}
			return this;
		},

		/**
		 * @experimental
		 */
		setOption: function(option, enable) {
			if (this._dvlRendererId) {
				this._dvl.Renderer.SetOption(option, enable, this._dvlRendererId);
			}
			return this;
		},

		/**
		 * @experimental
		 */
		getOption: function(option) {
			return this._dvlRendererId && this._dvl.Renderer.GetOption(option, this._dvlRendererId);
		},

		/**
		 * @experimental
		 */
		setOptionF: function(option, value) {
			if (this._dvlRendererId) {
				this._dvl.Renderer.SetOptionF(option, value, this._dvlRendererId);
			}
			return this;
		},

		/**
		 * @experimental
		 */
		getOptionF: function(option) {
			if (this._dvlRendererId) {
				return this._dvl.Renderer.GetOptionF(option, this._dvlRendererId);
			} else {
				return 0;
			}
		},

		/**
		 * @experimental
		 */
		resetView: function() {
			if (this._dvlRendererId) {
				this._dvl.Renderer.ResetView(this._dvlRendererId);
			}
			return this;
		},

		/**
		 * @experimental
		 */
		canIsolateNode: function(nodeId) {
			if (this._dvlRendererId) {
				return this._dvl.Renderer.CanIsolateNode(nodeId, this._dvlRendererId);
			} else {
				return false;
			}
		},

		/**
		 * @experimental
		 */
		setIsolatedNode: function(nodeId) {
			if (this._dvlRendererId) {
				this._dvl.Renderer.SetIsolatedNode(nodeId, this._dvlRendererId);
			}
			return this;
		},

		/**
		 * @experimental
		 */
		getIsolatedNode: function() {
			if (this._dvlRendererId) {
				return this._dvl.Renderer.GetIsolatedNode(this._dvlRendererId);
			} else {
				return "i0000000000000000";
			}
		},

		/**
		 * @experimental
		 */
		zoomTo: function(what, nodeId, crossFadeInSeconds) {
			if (this._dvlRendererId) {
				this._dvl.Renderer.ZoomTo(what, nodeId, crossFadeInSeconds, this._dvlRendererId);
			}
		},

		// 3D Rendering handling ends.
		////////////////////////////////////////////////////////////////////////

		////////////////////////////////////////////////////////////////////////
		// Gesture handling ends.

		/**
		 * Marks the start of the current gesture operation.
		 * 
		 * @param {int} x The x-coordinate of the gesture.
		 * @param {int} y The y-coordinate of the gesture.
		 * @returns {sap.ui.vk.Viewport} this
		 * @public
		 */
		beginGesture: function(x, y) {
			if (this._dvlRendererId) {
				var pixelRatio = window.devicePixelRatio || 1;
				this._dvl.Renderer.BeginGesture(x * pixelRatio, y * pixelRatio, this._dvlRendererId);
			}
			return this;
		},

		/**
		 * Marks the end of the current gesture operation.
		 * 
		 * @returns {sap.ui.vk.Viewport} this
		 * @public
		 */
		endGesture: function() {
			if (this._dvlRendererId) {
				this._dvl.Renderer.EndGesture(this._dvlRendererId);
			}
			return this;
		},

		/**
		 * Performs a <code>pan</code> gesture to pan across the Viewport.
		 * 
		 * @param {int} dx The change in distance along the x-coordinate.
		 * @param {int} dy The change in distance along the y-coordinate.
		 * @returns {sap.ui.vk.Viewport} this
		 * @public
		 */
		pan: function(dx, dy) {
			if (this._dvlRendererId) {
				var pixelRatio = window.devicePixelRatio || 1;
				this._dvl.Renderer.Pan(dx * pixelRatio, dy * pixelRatio, this._dvlRendererId);
			}
			return this;
		},

		/**
		 * Rotates the content resource displayed on the Viewport.
		 * 
		 * @param {int} dx The change in x-coordinate used to define the desired rotation.
		 * @param {int} dy The change in y-coordinate used to define the desired rotation.
		 * @returns {sap.ui.vk.Viewport} this
		 * @public
		 */
		rotate: function(dx, dy) {
			if (this._dvlRendererId) {
				var pixelRatio = window.devicePixelRatio || 1;
				this._dvl.Renderer.Rotate(dx * pixelRatio, dy * pixelRatio, this._dvlRendererId);
			}
			return this;
		},

		/**
		 * Performs a <code>zoom</code> gesture to zoom in or out on the beginGesture coordinate.
		 * @param {double} dy Zoom factor. A scale factor that specifies how much to zoom in or out by.
		 * @returns {sap.ui.vk.Viewport} this
		 * @public
		 */
		zoom: function(dy) {
			if (this._dvlRendererId) {
				this._dvl.Renderer.Zoom(dy, this._dvlRendererId);
			}
			return this;
		},

		/**
		 * Executes a click or tap gesture.
		 * 
		 * @param {int} x The tap gesture's x-coordinate.
		 * @param {int} y The tap gesture's y-coordinate.
		 * @param {boolean} isDoubleClick Indicates whether the tap gesture should be interpreted as a double-click. A value of <code>true</code> indicates a double-click gesture, and <code>false</code> indicates a single click gesture.
		 * @returns {sap.ui.vk.Viewport} this
		 * @public
		 */
		tap: function(x, y, isDoubleClick) {
			if (this._dvlRendererId) {
				var pixelRatio = window.devicePixelRatio || 1;
				this._dvl.Renderer.Tap(x * pixelRatio, y * pixelRatio, isDoubleClick, this._dvlRendererId);
			}
			return this;
		},

		/**
		 * Queues a command for execution during the rendering cycle. All gesture operations should be called using this method.
		 * 
		 * @param {function} command The command to be executed.
		 * @returns {sap.ui.vk.Viewport} this
		 * @public
		 */
		queueCommand: function(command) {
			if (this._dvlRendererId) {
				this._dvl.Renderer._queueCommand(command, this._dvlRendererId);
			}
			return this;
		}

		// Gesture handling ends.
		////////////////////////////////////////////////////////////////////////
	});

	return Viewport;
});
