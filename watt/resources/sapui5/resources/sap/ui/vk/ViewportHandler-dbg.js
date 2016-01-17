/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.ViewportHandler.
sap.ui.define([
    "jquery.sap.global", "sap/ui/base/EventProvider", "sap/ui/core/ResizeHandler"
], function(jQuery, EventProvider, ResizeHandler) {
	"use strict";
	
	var ViewportHandler = EventProvider.extend("sap.ui.vk.ViewportHandler", {
		metadata: {
			publicMethods: [
			    "beginGesture",
			    "move",
			    "endGesture",
			    "click",
			    "doubleClick",
			    "contextMenu",
			    "getViewport"
			]
		},
		
		constructor: function(Viewport) {
			this._viewport = Viewport;
			this._rect = null;
			this._evt = {x: 0, y: 0, z: 0, d: 0, initd: 0};
			this._gesture = false;
			this._viewport.attachEvent("resize", this, this._onresize);
			this._nomenu = false;
		},
		
		destroy: function() {
			this._viewport = null;
			this._rect = null;
			this._evt = null;
			this._gesture = false;
		},
		
		_getOffset: function (obj) {
			var p = {
				x: obj.offsetLeft,
				y: obj.offsetTop
			};
			
			var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
			
			while (obj.offsetParent) {
				var parent = obj.offsetParent;
				
				// Second statement in if () fixes Chrome's nasty bug in full screen mode where offsetTop/offsetLeft is wrong
				if (parent == document.getElementsByTagName("body")[0] || parent.parentElement == fullscreenElement) {
					break;
				}
				
				p.x = p.x + parent.offsetLeft - parent.scrollLeft;
				p.y = p.y + parent.offsetTop - parent.scrollTop;
				obj = obj.offsetParent;
			}
			
			return p;
		},
		
		_inside: function (event) {
			if (this._rect == null || true) {
				var id = this._viewport.getIdForLabel();
				var domobj = document.getElementById(id);
				
				if (domobj == null) {
					return false;
				}
				
				var o = this._getOffset(domobj);
				this._rect = {
					x: o.x,
					y: o.y,
					w: domobj.offsetWidth,
					h: domobj.offsetHeight
				};
			}
			
			return (event.x >= this._rect.x && event.x <= this._rect.x + this._rect.w && event.y >= this._rect.y && event.y <= this._rect.y + this._rect.h);
		},
		
		_onresize: function (event) {
			this._gesture = false;
			this._rect = null;
		},
	
		beginGesture: function (event) {
			if (this._inside(event) && !this._gesture) {
				this._gesture = true;
				
				var x = event.x - this._rect.x, y = event.y - this._rect.y;

				this._evt.x = x;
				this._evt.y = y;
				this._evt.d = event.d;
				this._evt.initd = event.d;
				this._evt.avgd = event.d;
				this._evt.avgx = 0;
				this._evt.avgy = 0;

				jQuery.sap.log.debug("Loco: beginGesture: " + x + ", " + y);
				this._viewport.queueCommand(function() {
					this._viewport.beginGesture(x, y);
				}.bind(this));
				
				event.handled = true;

				if (document.activeElement) {
					try {
						document.activeElement.blur();
					} catch (e) {
						// IE can have error calling blur() in fullscreen mode
					}
				}

				var domobj = document.getElementById(this._viewport.getIdForLabel());
				domobj.focus();
			}
			this._nomenu = false;
		},
		
		move: function (event) {
			if (this._gesture) {
				var x = event.x - this._rect.x, y = event.y - this._rect.y;
				var dx = x - this._evt.x;
				var dy = y - this._evt.y;
				var dd = event.d - this._evt.d;
				
				this._evt.x = x;
				this._evt.y = y;
				this._evt.d = event.d;
				
				this._evt.avgx = this._evt.avgx * 0.99 + dx * 0.01;
				this._evt.avgy = this._evt.avgy * 0.99 + dy * 0.01;
				
				var z = 1.0;
				
				if (this._evt.initd > 0) {
					z = 1.0 + dd * (1.0 / this._evt.initd);
				} else if (event.n == 2) {
					if (event.points[0].y > event.points[1].y) {
						z = 1.0 - dd * 0.005;
						if (z < 0.333) {
							z = 0.333;
						}
					} else {
						z = 1.0 + dd * 0.005;
						if (z > 3) {
							z = 3;
						}
					}
				}
				
				//console.log("n: " + event.n + " Zoom factor: " + z);
				
				// Zoom smoothing
				if (this._evt.initd > 0) {
					var avgdist = Math.sqrt(this._evt.avgx * this._evt.avgx + this._evt.avgy * this._evt.avgy);
					
					jQuery.sap.log.debug("AvgDist: " + avgdist);
					if ((Math.abs(event.d - this._evt.avgd) / this._evt.avgd) < (avgdist / 10)) {
						z = 1.0;
					}
				}
				
				// Weighted average threshold
				this._evt.avgd = this._evt.avgd * 0.97 + event.d * 0.03;
				
				switch (event.n) {
				case 1:
					jQuery.sap.log.debug("Loco: Rotate: " + (dx) + ", " + (dy));

					this._viewport.queueCommand(function() {
						this._viewport.rotate(dx, dy);
					}.bind(this));
					break;
				case 2:
					jQuery.sap.log.debug("Loco: Pan: " + (dx) + ", " + (dy));
					if (z != 0 && z != 1.0) {
						jQuery.sap.log.debug("Loco: Zoom: " + (z));
					}
					
					this._viewport.queueCommand(function() {
						this._viewport.pan(dx, dy);
						
						if (dx < 10 && dy < 10 && z != 0 && z != 1.0) {
							this._viewport.zoom(z);
						}
					}.bind(this));
					break;
				default:
					break;
				}
				
				this._nomenu = true;
				event.handled = true;
			}
		},
		
		endGesture: function (event) {
			if (this._gesture) {
				var x = event.x - this._rect.x, y = event.y - this._rect.y;

				jQuery.sap.log.debug("Loco: endGesture: " + x + ", " + y);
				
				this._viewport.queueCommand(function() {
					this._viewport.endGesture();
				}.bind(this));
				
				this._gesture = false;
				event.handled = true;		
			}
		},
		
		click: function (event) {
			if (this._inside(event) && event.buttons <= 1) {
				var x = event.x - this._rect.x, y = event.y - this._rect.y;
				jQuery.sap.log.debug("Loco: click: " + (x) + ", " + (y));
				
				this._viewport.queueCommand(function() {
					this._viewport.tap(x, y, false);
				}.bind(this));
				
				event.handled = true;
			}
		},
		
		doubleClick: function (event) {
			if (this._inside(event) && event.buttons <= 1) {
				var x = event.x - this._rect.x, y = event.y - this._rect.y;
				jQuery.sap.log.debug("Loco: doubleClick: " + (x) + ", " + (y));

				this._viewport.queueCommand(function() {
					this._viewport.tap(x, y, true);
				}.bind(this));
				
				event.handled = true;
			}
		},
		
		contextMenu: function (event) {
			if (this._inside(event) || this._nomenu) {
				this._nomenu = false;

				//jQuery.sap.log.debug("Loco: context menu")
				event.handled = true;
			}
		},
		
		getViewport: function() {
			return this._viewport;
		}
	});
	
	return ViewportHandler;
}, /* bExport= */ true);