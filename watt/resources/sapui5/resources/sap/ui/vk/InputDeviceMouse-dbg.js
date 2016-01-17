/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.InputDeviceMouse.
sap.ui.define(["jquery.sap.global", "sap/ui/base/EventProvider"], function(jQuery, EventProvider) {
	"use strict";
	
	var Mouse = EventProvider.extend("sap.ui.vk.InputDeviceMouse", {
		metadata: {
			publicMethods: [
			    "isSupported",
			    "enable",
			    "disable"
			]
		},
		
		constructor: function (Loco) {
			this._loco = Loco;
			this._buttons = 0;
			this._buttonFlagsValue = 0;
			this._zoomOrigin = {x: 0, y: 0};
		},
		
		_buttonFlags: function (button, down) {
			if (down) {
				this._buttonFlagsValue |= (1 << button);
			} else {
				this._buttonFlagsValue &= ~(1 << button);
			}
			
			return this._buttonFlagsValue;
		},
		
		_eventToInput: function (event, buttonsOverride) {
			// Encapsulate HTML mouse event to Loco input event
			// "button" as bit mask: 1: left, 2: right, 4: middle, 8: Fourth, 16: Fifth, ...			
			var btn = (event.buttons != undefined) ? event.buttons : this._buttonFlagsValue;
			if (buttonsOverride) {
				btn = buttonsOverride;
			}
			var input = { x: 0, y: 0, z: 0, d: 0, n: 0, buttons: btn, scroll: event.wheelDelta, points: [], handled: false};		
			var n = 0;
			
			switch (btn) {
			case 0: // Mouse up?
			case 1:	// 1 finger pan
				n = 1;
				input.points.push({x: event.pageX, y: event.pageY, z: 0});
				break;
			case 3:	// 2 fingers pan
			case 4: 
				n = 2;
				input.points.push({x: event.pageX, y: event.pageY, z: 0});
				input.points.push({x: event.pageX, y: event.pageY, z: 0});
				break;
			case 2: // 2 fingers zoom
				n = 2;
				input.points.push({x: this._zoomOrigin.x, y: event.pageY, z: 0});
				input.points.push({x: this._zoomOrigin.x, y: event.pageY + (this._zoomOrigin.y - event.pageY) * 2, z: 0});
				break;
			default:
				n = 0;
				break;
			}
			
			input.n = n;
			
			return input;
		},
		
		_onmouseup: function (event) {
			var btn = (event.buttons != undefined) ? event.buttons : this._buttonFlags(event.button, false);
			if (event._sapui_handledByControl) {
				return;
			}
			
			var input = this._eventToInput(event, this._buttons);
			this._loco.endGesture(input);
			
			if (btn == 2) {
				this._zoomOrigin.x = event.pageX;
				this._zoomOrigin.y = event.pageY;
			}
			
			var input = this._eventToInput(event);			
			if (btn != 0) {
				input.handled = false;
				this._loco.beginGesture(input);
			}
	
			this._buttons = btn;
			
			if (input.handled) {
				event.preventDefault();
			}
			
			event._sapui_handledByControl = true;
		},
		
		_onmousemove: function (event) {
			var btn = (event.buttons != undefined) ? event.buttons : this._buttonFlagsValue;
			if (event._sapui_handledByControl || btn == 0) {
				return;
			}
			
			var input = this._eventToInput(event);
			this._loco.move(input);
	
			if (input.handled) {
				event._sapui_handledByControl = true;
				event.preventDefault();
			}
		},
		
		_onmousedown: function (event) {
			var btn = (event.buttons != undefined) ? event.buttons : this._buttonFlags(event.button, true);
			
			if (event._sapui_handledByControl) {
				return;
			}
			
			if (this._buttons != 0) {
				var input = this._eventToInput(event, this._buttons);
				this._loco.endGesture(input);
			}

			if (btn == 2) {
				this._zoomOrigin.x = event.pageX;
				this._zoomOrigin.y = event.pageY;
			}			
			var input = this._eventToInput(event);
						
			input.handled = false;
			this._loco.beginGesture(input);
			this._prevButtons = btn;
			this._buttons = btn;
			
			if (input.handled) {
				event._sapui_handledByControl = true;
				event.preventDefault();
			}
		},
		
		_onmousewheel: function (ev) {
			var event = ev.originalEvent ? ev.originalEvent : ev;
			if (event._sapui_handledByControl || this._buttons != 0) {
				return;
			}
			
			this._zoomOrigin.x = event.pageX;
			this._zoomOrigin.y = event.pageY;
			
			var simevent = {pageX: event.pageX, pageY: event.pageY, buttons: 2, wheelDelta: event.wheelDelta};
			var input = this._eventToInput(simevent);
			this._loco.beginGesture(input);
			
			var delta = event.detail ? event.detail * (-40) : event.wheelDelta;
			
			simevent.pageY -= delta / 5;
			input = this._eventToInput(simevent);
			
			input.handled = false;
			this._loco.move(input);
			
			input.handled = false;
			this._loco.endGesture(input);
			
			if (input.handled) {
				event._sapui_handledByControl = true;
				event.preventDefault();
			}
		},
		
		_oncontextmenu: function (event) {			
			var input = this._eventToInput(event);
			
			this._loco.contextMenu(input);
			
			if (input.handled) {
				event._sapui_handledByControl = true;
				event.preventDefault();
			}
		},
		
		isSupported: function () {
			return true;
		},
		
		enable: function (control) {
			this._buttonFlagsValue = 0;
			this._buttons = 0;
			this._mousedownProxy = this._onmousedown.bind(this);
			this._mouseupProxy = this._onmouseup.bind(this);
			this._mousemoveProxy = this._onmousemove.bind(this);
			this._mousewheelProxy = this._onmousewheel.bind(this);
			this._contextmenuProxy = this._oncontextmenu.bind(this);
			this._control = control;
			
			var func = (this._control) ? this._control.attachBrowserEvent.bind(this._control) : window.document.addEventListener;
			func('mousedown', this._mousedownProxy, false);
			func('mouseup', this._mouseupProxy, false);
			func('mousemove', this._mousemoveProxy, false);
			func('mousewheel', this._mousewheelProxy, false);
			func('DOMMouseScroll', this._mousewheelProxy, false);
			func("contextmenu", this._contextmenuProxy, false);
		},
		
		disable: function () {
			var func = (this._control) ? this._control.attachBrowserEvent.bind(this._control) : window.document.addEventListener;
			func('mousedown', this._mousedownProxy);
			func('mouseup', this._mouseupProxy);		
			func('mousemove', this._mousemoveProxy);
			func('mousewheel', this._mousewheelProxy);
			func('DOMMouseScroll', this._mousewheelProxy);
			func("contextmenu", this._contextmenuProxy);
		}
	});
	
	return Mouse;
}, /* bExport= */ true);