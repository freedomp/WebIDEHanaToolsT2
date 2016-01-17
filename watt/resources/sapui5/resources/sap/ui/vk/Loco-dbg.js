/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.Loco.
sap.ui.define([
	"jquery.sap.global", "sap/ui/base/EventProvider", "./InputDevicePointer", "./InputDeviceMouse", "./InputDeviceTouch"
], function(jQuery, EventProvider, InputDevicePointer, InputDeviceMouse, InputDeviceTouch) {
	"use strict";

	/**
	 * @class
	 * The Loco library's core purpose is to intercept input event data for a SAPUI5 target and interpret the data based on a supported set of gestures.
	 */
	var Loco = EventProvider.extend("sap.ui.vk.Loco", {
		metadata: {
			publicMethods: [
			    "addHandler",
			    "removeHandler",
			    "beginGesture",
			    "move",
			    "endGesture",
			    "contextMenu"
			]
		},

		/**
		 * Constructor for a Loco.
		 *
		 * @class
		 * Some class description goes here.
		 * @extends sap.ui.core.EventProvider
		 *
		 * @author SAP SE
		 * @version 1.32.3
		 *
		 * @constructor
		 * @public
		 * @alias sap.ui.vk.Loco
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 * @experimental Since 1.32.0 This class is experimental and might be modified or removed in future versions.
		 */
		constructor: function() {
			if (Loco._instance) {
				return Loco._instance;
			}

			EventProvider.apply(this);
			/* Array of ViewportHandler object */
			this._handlers = [];
			this._gesture = false;

			/* Click, double-click simulation */
			this._touchOrigin = {x: 0, y: 0, z: 0};
			this._touchMoved = false;
			this._touchButton = 0;

			/* Tick and timer */
			this._touchStart = 0;
			this._touchEnd = 0;
			this._clickTimer = 0;
			this._isDoubleClick = false;

			Loco._instance = this;
		},

		/**
		 * Cleans up, removes all handlers.
		 *
		 * @public
		 */
		destroy: function() {
			this._gesture = false;
			this._handlers = [];
		},

		/**
		 * Adds a viewport event handler from Loco.
		 *
		 * @param {handler} handler to be added.
		 *
		 * @public
		 */
		addHandler: function (handler) {
			this._handlers.push(handler);
			var viewport = handler.getViewport();
			
			var pointer = new InputDevicePointer(this);
			if (pointer.isSupported()) {
				pointer.enable(viewport);
				viewport._pointer = pointer;
			} else {
				var mouse = new InputDeviceMouse(this);
				if (mouse.isSupported()) {
					mouse.enable(viewport);
					viewport._mouse = mouse;
				}

				var touch = new InputDeviceTouch(this);
				if (touch.isSupported()) {
					touch.enable(viewport);
					viewport._touch = touch;
				}
			}
		},

		/**
		 * Removes a viewport event handler from Loco.
		 *
		 * @param {handler} handler to be removed.
		 *
		 * @public
		 */
		removeHandler: function (handler) {
			var h = this._handlers;
			var count = h.length;
			var viewport = handler.getViewport();

			for (var i = 0; i < count; i++) {
				if (h[i] == handler) {
					h.splice(i, 1);
					
					if (viewport._pointer) {
						viewport._pointer.disable();
						viewport._pointer = null;
					}
					
					if (viewport._touch) {
						viewport._touch.disable();
						viewport._touch = null;
					}
					
					if (viewport._mouse) {
						viewport._mouse.disable();
						viewport._mouse = null;
					}
					
					break;
				}
			}
		},

		/**
		 * @private
		 */
		_processClick: function (dblclk) {
			this._clickTimer = 0;

			var event = { x: 0, y: 0, z: 0, d: 0, n: 0, buttons: 0, scrolls: [], points: [], handled: false};
			event.x = this._touchOrigin.x;
			event.y = this._touchOrigin.y;
			event.z = this._touchOrigin.z;
			event.buttons = this._touchButton;

			var h = this._handlers;
			var count = h.length;

			for (var i = 0; i < count; i++) {
				if (dblclk) {
					h[i].doubleClick(event);
				} else {
					h[i].click(event);
				}

				if (event.handled) {
					break;
				}
			}
		},

		/**
		 * @private
		 */
		_processInput: function (event) {
			// Calculate action point (x, y, z) and distance (d)
			var eps = event.points;

			switch (event.n) {
			case 0:
				event.x = 0;
				event.y = 0;
				event.z = 0;
				event.d = 0;
				break;
			case 2:
				var dx = eps[0].x - eps[1].x, dy = eps[0].y - eps[1].y, dz = eps[0].z - eps[1].z;
				event.x = (eps[0].x + eps[1].x) / 2;
				event.y = (eps[0].y + eps[1].y) / 2;
				event.z = (eps[0].z + eps[1].z) / 2;
				event.d = Math.sqrt(dx * dx + dy * dy + dz * dz);
				break;
			default:
				event.x = eps[0].x;
				event.y = eps[0].y;
				event.z = eps[0].z;
				event.d = 0;
				break;
			}

			return event;
		},
		
		/**
		 * Signal begin of a input gesture.
		 *
		 * @param {event} JSON object including input event data.
		 *
		 * @public
		 */
		beginGesture: function (event) {
			if (this._gesture) {
				return;
			}

			if (this._clickTimer > 0) {
				clearTimeout(this._clickTimer);
				this._clickTimer = 0;
				this._isDoubleClick = true;

				if (event.n == 1 && event.buttons <= 1 && this._touchButton <= 1) {
					this._processClick(true);
				}
			}

			this._processInput(event);
			var h = this._handlers;
			var count = h.length;

			for (var i = 0; i < count; i++) {
				h[i].beginGesture(event);

				if (event.handled) {
					break;
				}
			}	

			var now = new Date();
			this._touchStart = now.getTime();
			this._touchMoved = false;
			this._gesture = true;

			this._touchOrigin.x = event.x;
			this._touchOrigin.y = event.y;
			this._touchOrigin.z = event.z;
			this._touchButton = event.buttons;

			if (this._touchEnd != 0 && this._touchStart - this._touchEnd < 50) {
				this._touchMoved = true;
			}
		},

		/**
		 * Signal movement of a input gesture.
		 *
		 * @param {event} JSON object including input event data.
		 *
		 * @public
		 */
		move: function (event) {
			if (!this._gesture) {
				return;
			}

			this._processInput(event);
			var h = this._handlers;
			var count = h.length;

			for (var i = 0; i < count; i++) {
				h[i].move(event);

				if (event.handled) {
					break;
				}
			}

			var dx = this._touchOrigin.x - event.x;
			var dy = this._touchOrigin.y - event.y;
			var dz = this._touchOrigin.z - event.z;

			if ((dx * dx + dy * dy + dz * dz) > 8) {
				this._touchMoved = true;
			}
		},

		/**
		 * Signal end of a input gesture.
		 *
		 * @param {event} JSON object including input event data.
		 *
		 * @public
		 */
		endGesture: function (event) {
			if (!this._gesture) {
				return;
			}

			this._processInput(event);
			var h = this._handlers;
			var count = h.length;

			for (var i = 0; i < count; i++) {
				h[i].endGesture(event);

				if (event.handled) {
					break;
				}
			}

			var now = new Date();
			this._touchEnd = now.getTime();

			if (!this._touchMoved && !this._isDoubleClick && (this._touchEnd - this._touchStart) < 2000) {
				this._clickTimer = setTimeout(function (that) { that._processClick(false); }, 200, this);
			}

			this._isDoubleClick = false;
			this._gesture = false;
		},
		
		/**
		 * Signal context menu event.
		 *
		 * @param {event} JSON object including input event data
		 *
		 * @public
		 */
		contextMenu: function (event) {
			this._processInput(event);
			
			var h = this._handlers;
			var count = h.length;

			for (var i = 0; i < count; i++) {
				h[i].contextMenu(event);

				if (event.handled) {
					break;
				}
			}
		}
	});

	return Loco;
}, /* bExport= */ true);