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
	 * Constructor for a new browser Native Viewport control.
	 *
	 * @param {string} [sId] ID for the new Native Viewport control, generated automatically if no ID is given.
	 * @param {object} [mSettings] Initial settings for the new Native Viewport control.
	 *
	 * @class
	 * This control enables loading, pan, zoom and overlay capabilities for a subset of file formats capable of being loaded into a browser natively. 
	 * <pre>viewer.loadContent("https://www.google.co.nz/images/srpr/logo11w.png", "png", true);</pre>
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version 1.32.3
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.vk.NativeViewport
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 * @experimental Since 1.32.0 This class is experimental and might be modified or removed in future versions.
	 */
	var NativeViewport = Control.extend("sap.ui.vk.NativeViewport", /** @lends sap.ui.vk.NativeViewport.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			publicMethods: [
				"beginGesture",
				"endGesture",
				"pan",
				"rotate",
				"zoom",
				"tap",
				"queueCommand",
				"getViewInfo",
				"setViewInfo",
				"loadUrl"
			],
			events: {
				/**
				 * Raised when the display size of the image in the Native Viewport changes.
				 * 
				 * @param {object} [oldSize] The starting size of the image.
				 * @param {object} [size] The final size of the image after the <code>resize</code> event.
				 */
				"resize": {
					parameters: {
						oldSize: "object",
						size: "object"
					}
				},
				/**
				 * Raised when the display position or magnification of the image in the Native Viewport changes.
				 * 
				 * @param {object} [pan] The change in distance along the x, y-coordinates.
				 * @param {float} [zoom] The change in zoom factor.
				 */
				"move": {
					parameters: {
						pan: "object",
						zoom: "float"
					}
				}
			}
		},

		init: function() {
			if (Control.prototype.init) {
				Control.prototype.init(this);
			}
			
			this._canvas = null;
			this._canvas = document.createElement("div");
			this._canvas.style.overflow = "none";
			this._canvas.style.width = "100%";
			this._canvas.style.height = "100%";
			this._canvas.id = jQuery.sap.uid();
			
			this._resizeListenerId = null;

			this._viewportHandler = new ViewportHandler(this);
			this._loco = new Loco();
			this._loco.addHandler(this._viewportHandler);
			
			this._img = null;
			this._reset();
			
			this._gx = 0;
			this._gy = 0;
			
			this._imageW = 0;
			this._imageH = 0;
		},

		exit: function() {
			this._loco.removeHandler(this._viewportHandler);
			this._viewportHandler.destroy();
			this._inputDevice.disable();
			
			if (this._resizeListenerId) {
				ResizeHandler.deregister(this._resizeListenerId);
				this._resizeListenerId = null;
			}
			if (Control.prototype.exit) {
				Control.prototype.exit.apply(this);
			}
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
				this._bestFit();
				this._handleResize({ size: { width: domRef.clientWidth, height: domRef.clientHeight } } );
			}
		},
		
		/**
		 * @private
		 */
		_handleResize: function(event) {
			this.fireResize({ oldSize: event.oldSize, size: event.size } );
			this._update();
		},
		
		/**
		 * @private
		 */
		_reset: function() {
			this._x = 0;
			this._y = 0;
			this._s = 1.0;
			this._r = 0;
		},
		
		/**
		 * @private
		 */
		_update: function() {
			if (this._img != null) {
				var x = this._x - (this._imageW - this._canvas.clientWidth) / 2;
				var y = this._y - (this._imageH - this._canvas.clientHeight) / 2;
				var transform =  "matrix(" + this._s + ",0,0," + this._s + "," + x + "," + y + ")";
			
				this._img.style.transform = transform;
				this._img.style.webkitTransform = transform;
				this._img.style.msTransform = transform;
				this._img.style.MozTransform = transform;
				this._img.style.OTransform = transform;
			}
		},
		
		/**
		 * @private
		 */
		_bestFit: function() {
			this._reset();
			var sx = this._canvas.clientWidth / this._imageW;
			var sy = this._canvas.clientHeight / this._imageH;
			this._s = sx < sy ? sx : sy;
			if (this._s == 0) {
				this._s = 1.0;
			}
			this._x = 0;
			this._y = 0;
			this._update();
		},
		
		/**
		 * Loads a image URL into Viewport.
		 * 
		 * @param {string} url: The URL of the resource.
		 * @param {function} onload: onload callback, called when the resource is loaded successfully. 
		 * @param {function} onerror: onerror callback, called when an error occurs during the loading process. 
		 * @param {function} onprogress: onprogress callback, called during the loading process.
		 * @param {array} resourceType: an array of type of resources to load.
		 * @return {sap.ui.vk.NativeViewport} this
		 * @public
		 */
		loadUrl: function(url, onload, onerror, onprogress, resourceType) {
			 if (/^(jpg|png|gif)$/.test(resourceType) == false){
				 jQuery.sap.log.error("Unsupported content resource type " + resourceType);
				 return this;
			 }
			 
			 while (this._canvas.lastChild) {
				 this._canvas.removeChild(this._canvas.lastChild);
			 }
			 
			 //pdf rendering 
			 //http://mozilla.github.io/pdf.js/web/viewer.html
			 //http://stackoverflow.com/questions/15341010/render-pdf-to-single-canvas-using-pdf-js-and-imagedata
			 //https://github.com/mozilla/pdf.js
			 this._reset();
			 
			 this._img = new Image();
			 this._img.onload = function() {
				 this._imageW = this._img.width;
				 this._imageH = this._img.height;
				 this._canvas.appendChild(this._img);
				 this._bestFit();
				 onload();
			 }.bind(this);
			 
			 this._img.onerror = function() {
				 onerror();
			 };
			 
			 this._img.src = url;
			 
			 return this;
		},
		
		/**
		 * Marks the start of the current gesture operation. 
		 * 
		 * @param {int} x: x-coordinate in screen space.
		 * @param {int} y: y-coordinate in screen space.
		 * @return {sap.ui.vk.NativeViewport} this
		 * @public
		 */
		beginGesture: function(x, y) {
			this._gx = (x - this._canvas.clientWidth / 2 - this._x) / this._s;
			this._gy = (y - this._canvas.clientHeight / 2 - this._y) / this._s;
			
			return this;
		},
		
		/**
		 * Marks the end of the current gesture operation. 
		 * 
		 * @return {sap.ui.vk.NativeViewport} this
		 * @public
		 */
		endGesture: function() {
			this._gx = 0;
			this._gy = 0;
			return this;
		},

		/**
		 * Performs a <code>pan</code> gesture to pan across the Viewport.
		 * 
		 * @param {int} dx: The change in distance along the x-coordinate.
		 * @param {int} dy: The change in distance along the y-coordinate.
		 * @return {sap.ui.vk.NativeViewport} this
		 * @public
		 */
		pan: function(dx, dy) {
			this._x += dx;
			this._y += dy;
			this._update();
			this.fireMove({pan: {x: dx, y: dy}, zoom: 1.0});
			
			return this;
		},

		/**
		 * Rotates the content of the Viewport.
		 * 
		 * @param {int} dx: The change in x-coordinate used to define the desired rotation.
		 * @param {int} dy: The change in y-coordinate used to define the desired rotation.
		 * @return {sap.ui.vk.NativeViewport} this
		 * @public
		 */
		rotate: function(dx, dy) {
			this._x += dx;
			this._y += dy;
			this._update();
			this.fireMove({pan: {x: dx, y: dy}, zoom: 1.0});
			
			return this;
		},

		/**
		 * Performs a <code>zoom</code> gesture to zoom in or out on the beginGesture coordinate.
		 * 
		 * @param {double} z: Zoom factor. A scale factor that specifies how much to zoom in or out by.
		 * @return {sap.ui.vk.NativeViewport} this
		 * @public
		 */
		zoom: function(z) {
			//Canvas zooming: http://stackoverflow.com/questions/3420975/html5-canvas-zooming
			var gxo = this._gx * this._s;
			var gyo = this._gy * this._s;
			this._s *= z;
			var gxn = this._gx * this._s;
			var gyn = this._gy * this._s;
			var dx = gxo - gxn;
			var dy = gyo - gyn;

			this._x += dx;
			this._y += dy;
			this._update();
			this.fireMove({pan: {x: dx, y: dy}, zoom: z});
			
			return this;
		},

		/**
		 * Executes a click or tap gesture.
		 * 
		 * @param {int} x: The tap gesture's x-coordinate.
		 * @param {int} y: The tap gesture's y-coordinate.
		 * @param {boolean} isDoubleClick: Indicates whether the tap gesture should be interpreted as a double-click. 
		 * A value of <code>true</code> indicates a double-click gesture, and <code>false</code> indicates a single click gesture.
		 * @return {sap.ui.vk.NativeViewport} this
		 * @public
		 */
		tap: function(x, y, isDoubleClick) {
			if (isDoubleClick) {
				this._bestFit();
			}
			return this;
		},

		/**
		 * Queues a command for execution during the rendering cycle. All gesture operations should be called using this method.
		 * 
		 * @param {function} command: The function to be executed.
		 * @return {sap.ui.vk.NativeViewport} this
		 * @public
		 */
		queueCommand: function(command) {
			command();
			return this;
		},
		
		/**
		 * Gets information about the Viewport's attributes; for example, camera.
		 * 
		 * @return {object} ViewInfo object.
		 * @public
		 */
		getViewInfo: function() {
			var viewInfo = {};			
			viewInfo.camera = [this._s, 0, 0, this._s, this._x, this._y];
			
			return viewInfo;
		},
		
		/**
		 * Sets information about the Viewport's attributes; for example, camera.
		 * 
		 * @param {object} viewInfo: ViewInfo object.
		 * @return {sap.ui.vk.NativeViewport} this
		 * @public
		 */
		setViewInfo: function(viewInfo) {
			var cam = viewInfo.camera;
			
			this._s = cam[0];
			this._x = cam[4];
			this._y = cam[5];
			
			this._update();
			
			return this;
		}
	});

	return NativeViewport;

});
