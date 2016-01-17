/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.InputDevicTouch.
sap.ui.define(["jquery.sap.global", "sap/ui/base/EventProvider"], function(jQuery, EventProvider) {
	"use strict";
	
	var Touch = EventProvider.extend("sap.ui.vk.InputDeviceSAPUI5", {
		metadata: {
			publicMethods: [
			    "isSupported",
			    "enable",
			    "disable"
			]
		},
		
		constructor: function (Loco) {
			this._loco = Loco;
			this._points = 0;
		},
		
		_eventToInput: function (event) {
			// Encapsulate HTML touch event to this._loco input event
			var input = { x: 0, y: 0, z: 0, d: 0, n: event.touches.length, buttons: 0, scroll: 0, points: [], handled: false};	
	
			for (var i = 0; i < input.n; i++) {
				var et = event.touches[i];
				input.points.push({x: et.pageX, y: et.pageY, z: 0});
			}
			
			return input;
		},
		
		_ontouchdown: function (event) {
			//if (event._sapui_handledByControl) {
			//	return;
			//}
			
			var input = this._eventToInput(event);
			
			if (this._points != 0 && this._points != input.n) {
				this._loco.endGesture(input);
			}
	
			this._points = input.n;
			input.handled = false;
			this._loco.beginGesture(input);
			
			if (input.handled) {
				event._sapui_handledByControl = true;
				event.preventDefault();
			}
		},
		
		_ontouchup: function (event) {
			//if (event._sapui_handledByControl) {
			//	return;
			//}
			
			var input = this._eventToInput(event);
			
			
			this._loco.endGesture(input);
			this._points = 0;
			
			if (input.handled) {
				event._sapui_handledByControl = true;
				event.preventDefault();
			}
		},
	
		_ontouchmove: function (event) {
			//if (event._sapui_handledByControl) {
			//	return;
			//}
			
			var input = this._eventToInput(event);
			
			//console.log("points: " + input.n);
			if (this._points != input.n) {
				this._loco.endGesture(input);
				input.handled = false;
				this._loco.beginGesture(input);
				this._points = input.n;
			} else {
				this._loco.move(input);
			}
			
			if (input.handled) {
				event._sapui_handledByControl = true;
				event.preventDefault();
			}
		},
	
		isSupported: function () {
			return typeof window.ontouchstart !== 'undefined';
		},
		
		enable: function (control) {
			this._points = 0;
			this._touchdownProxy = this._ontouchdown.bind(this);
			this._touchupProxy = this._ontouchup.bind(this);
			this._touchmoveProxy = this._ontouchmove.bind(this);
			this._control = control;
			
			if (!this._control) {
				return;
			}
			control.attachBrowserEvent("saptouchstart", this._touchdownProxy, false);
			control.attachBrowserEvent("saptouchend", this._touchupProxy, false);
			control.attachBrowserEvent("saptouchmove", this._touchmoveProxy, false);
			control.attachBrowserEvent("touchstart", this._touchdownProxy, false);
			control.attachBrowserEvent("touchend", this._touchupProxy, false);
			control.attachBrowserEvent("touchmove", this._touchmoveProxy, false);
		},
		
		disable: function () {
			if (!this._control) {
				return;
			}
			this._control.detachBrowserEvent("saptouchstart", this._touchdownProxy, false);
			this._control.detachBrowserEvent("saptouchend", this._touchupProxy, false);
			this._control.detachBrowserEvent("saptouchmove", this._touchmoveProxy, false);
			this._control.detachBrowserEvent("touchstart", this._touchdownProxy, false);
			this._control.detachBrowserEvent("touchend", this._touchupProxy, false);
			this._control.detachBrowserEvent("touchmove", this._touchmoveProxy, false);
		}
	});
	
	return Touch;
}, /* bExport= */ true);