// ...........................................................................//
// this module does the events implementation on a scene.....................//

// Author: Ulrich Roegelein

// ...........................................................................//
// vb sap events:

// sapdown // touchstart, mousedown,
// sapmove // mousemove
// sapleave // mouseleave
// sapup
// sapclick
// sapdblclick // double mouse click
// sapsecclick // contextmenu rightclick taphold

// // sapzoom
// // saprotate

// ...........................................................................//
// pointer events............................................................//

VBI.ScenePointerEvents = function(scene, ele) {
	"use strict";
	/* global VBI */// declare unusual global vars for ESLint/SAPUI5 validation
	// gesture support........................................................//
	scene.m_Gesture = null; // we move the gesture to the scene as state...//

	this.m_Events = [
		"msgesturetap", "msgesturehold", "msgesturestart", "msgestureend", "msgesturechange", "msgestureinertiastart", "gesturetap", "gesturehold", "gesturestart", "gestureend", "gesturechange", "gestureinertiastart", "pointerdown", "pointermove", "pointerup", "mspointerdown", "mspointermove", "mspointerup"
	];

	// ........................................................................//
	// subscribe and cleanup..................................................//

	this.clear = function() {
		// unsubscribe events..................................................//
		for (var nJ = 0, nLen = this.m_Events.length; nJ < nLen; ++nJ) {
			ele["on" + this.m_Events[nJ]] = null;
		}
	};

	this.subscribe = function() {
		// unsubscribe events..................................................//
		var ae = this.m_Events;
		for (var nJ = 0, nLen = ae.length; nJ < nLen; ++nJ) {
			var handlername;
			// check for platform tags to skip them.............................//
			if (ae[nJ].slice(0, 2) == "ms") {
				handlername = "process" + ae[nJ].slice(2);
			} else {
				handlername = "process" + ae[nJ];
			}

			if (!scene[handlername]) {
				if (VBI.m_bTrace) {
					VBI.Trace("Error: Handler " + handlername + " not defined");
				}
			}
			ele["on" + ae[nJ]] = scene[handlername];
		}
	};

	// .......................................................................//
	// attach the required handlers to the scene object.......................//

	scene.processgesturetap = function(event) {
		if (VBI.m_bTrace) {
			VBI.Trace("scene.processgesturetap");
		}
		// dispatch the event..................................................//
		return scene.onsapclick(event);
	};

	scene.processgesturehold = function(event) {
		if (VBI.m_bTrace) {
			VBI.Trace("processgesturehold");
		}
		// dispatch the event..................................................//
		scene.DispatchEvent(event, "sapsecclick");

		event.preventDefault(); // the event is handled
	};

	scene.processgesturestart = function(event) {
		if (VBI.m_bTrace) {
			VBI.Trace("processgesturestart");
		}
		// event.preventDefault(); // the event is handled
	};

	scene.processgestureend = function(event) {
		if (VBI.m_bTrace) {
			VBI.Trace("processgestureend");
		}

		// stop gesture recognition............................................//
		if (scene.m_Gesture) {
			scene.m_Gesture.target = null;
		}

		scene.m_Gesture = null;
	};

	scene.processgesturechange = function(event) {
		if (VBI.m_bTrace) {
			VBI.Trace("processgesturechange mode: " + scene.m_nInputMode);
		}

		if ((scene.m_nInputMode != VBI.InputModeDefault) && (scene.m_nInputMode != VBI.InputModeTrackMap)) {
			// dispatch the event..................................................//
			scene.DispatchEvent(event, "sapmove");
			return;
		}

		if (VBI.m_bTrace) {
			VBI.Trace("processgesturechange");
			VBI.Trace("rotation:" + event.rotation);
			VBI.Trace("scale:" + event.scale);
			VBI.Trace("trans:" + event.translationX + "," + event.translationY);
		}

		var g = event.gestureObject;
		var addX = Math.round(g.tx) - g.txdone;
		var addY = Math.round(g.ty) - g.tydone;
		var itx = Math.round(event.translationX) + addX;
		var ity = Math.round(event.translationY) + addY;

		g.tx += event.translationX;
		g.ty += event.translationY;
		g.txdone += itx;
		g.tydone += ity;

		if (VBI.m_bTrace) {
			VBI.Trace("done:" + g.txdone + "," + g.tydone);
			VBI.Trace("calc:" + g.tx + "," + g.ty);
		}

		if (itx || ity) {
			if (VBI.m_bTrace) {
				VBI.Trace("scene.processgesturechange move");
			}
			scene.MoveMap(itx, ity);
		}

		if (event.scale != 1.0) {
			scene.ZoomMap(event.scale, event.offsetX, event.offsetY);
		}

		event.stopPropagation();
		event.preventDefault(); // the event is handled
		return true;
	};

	scene.processgestureinertiastart = function(event) {
		if (VBI.m_bTrace) {
			VBI.Trace("processgestureinertiastart");
		}
		event.preventDefault(); // the event is handled
	};

	// ........................................................................//
	// pointer messages.......................................................//

	scene.processpointerdown = function(event) {
		if (VBI.m_bTrace) {
			VBI.Trace("scene.processpointerdown ");
		}

		// everything inside is handled using gesture events...................//
		// if( scene.DispatchEvent( event, "sapdown" ) == true )
		// return true;

		scene.onsapdown(event);

		// call the internal function before creating the gesture.............//
		var ges = scene.m_Gesture;

		if (ges && (event.pointerType != ges.pointerType)) {
			if (VBI.m_bTrace) {
				VBI.Trace("processpointerdown gesture pointer type mismatch");
			}
			if (scene.m_Gesture) {
				scene.m_Gesture.target = null;
			}
			ges = scene.m_Gesture = null;
		}

		if (!ges) {
			if (VBI.m_bTrace) {
				VBI.Trace("processpointerdown create gesture");
			}
			ges = scene.m_Gesture = new window.MSGesture();
			ges.target = event.srcElement; // set the element
			ges.pointerType = event.pointerType; // additionally remember pointer type
			ges.tx = 0; // x translation
			ges.ty = 0; // y translation
			ges.txdone = 0; // x translation
			ges.tydone = 0; // y translation
		}

		// pointer type must fit...............................................//
		if (event.pointerType == ges.pointerType) {
			ges.addPointer(event.pointerId);
		}
		return;
	};

	scene.processpointerup = function(event) {
		if (VBI.m_bTrace) {
			VBI.Trace("processpointerup");
		}
		return scene.onsapup(event);
	};

	scene.processpointermove = function(event) {
		if (VBI.m_bTrace) {
			VBI.Trace("scene.processpointermove");
		}

		// store some mouse position state.....................................//
		scene.m_currentMouseX = event.clientX;
		scene.m_currentMouseY = event.clientY;

		scene.onsapmove(event);
		return;
	};

	// ........................................................................//
	// do the event subscription..............................................//
	this.subscribe();
};

// ...........................................................................//
// touch events..............................................................//
VBI.SceneTouchEvents = function(scene, ele) {
	"use strict";
	this.m_Events = [
		"touchstart", "touchend", "touchmove", "touchcancel"
	];

	// ........................................................................//
	// subscribe and cleanup..................................................//
	this.clear = function() {
		// unsubscribe events..................................................//
		for (var nJ = 0, nLen = this.m_Events.length; nJ < nLen; ++nJ) {
			ele["on" + this.m_Events[nJ]] = null;
		}
	};

	this.subscribe = function() {
		// unsubscribe events..................................................//
		var ae = this.m_Events;
		for (var nJ = 0, nLen = ae.length; nJ < nLen; ++nJ) {
			var handlername;
			// check for platform tags to skip them.............................//
			if (ae[nJ].slice(0, 2) == "ms") {
				handlername = "process" + ae[nJ].slice(2);
			} else {
				handlername = "process" + ae[nJ];
			}

			if (!scene[handlername]) {
				if (VBI.m_bTrace) {
					VBI.Trace("Error: Handler " + handlername + " not defined");
				}
			}

			ele["on" + ae[nJ]] = scene[handlername];
		}
	};

	// ........................................................................//
	// mobile event handling..................................................//
	scene.processtouchstart = function(e) {
		var bHandled = true; // ??

		var ctx = scene.m_Ctx; // closing menu in case we have an open one
		if (ctx.m_strOpenMenu) {
			ctx.m_strOpenMenu = undefined;
			var oMenuObject = ctx.m_Menus.findMenuByID(ctx.m_strOpenMenu);
			oMenuObject.close();
		}

		if (VBI.m_bTrace) {
			VBI.Trace("processtouchstart");
		}

		if (scene.m_TapTimer) { // second click done before tap timer ran up -> no single tap
			window.clearInterval(scene.m_TapTimer);
		}

		if (scene.DispatchEvent(e, "sapdown") == true) {// dispatch the event
			return;
		}

		// store the touch event...............................................//
		scene.m_Touches.push(e);
		scene.m_Touches.m_bMoveWasDone = false;

		if (e.touches.length == 1 && !scene.m_SuppressedNavigation.move) {
			scene.SetInputMode(VBI.InputModeDefault); // we set TrackMap when we move

			var touch = e.touches[0];
			scene.m_currentMouseX = touch.clientX;
			scene.m_currentMouseY = touch.clientY;

			if (VBI.m_bTrace) {
				VBI.Trace("processtouchstart" + "X:" + scene.m_currentMouseX + "Y:" + scene.m_currentMouseY);
			}
			scene.RestartContextMenuTimer(e, touch, 700);
			bHandled = true;
		} else if (e.touches.length == 2) {
			scene.SetInputMode(VBI.InputModeDefault);

			var touch1 = e.touches[0];
			var touch2 = e.touches[1];

			var touchMidX = (touch2.clientX + touch1.clientX) / 2;
			var touchMidY = (touch2.clientY + touch1.clientY) / 2;

			scene.m_currentMouseX = touchMidX;
			scene.m_currentMouseY = touchMidY;

			scene.m_midPointX = touchMidX;
			scene.m_midPointY = touchMidY;

			// calculate touch distance.........................................//
			// and store it.....................................................//

			var touchDistance = Math.sqrt(Math.pow(touch1.clientX - touch2.clientX, 2) + Math.pow(touch1.clientY - touch2.clientY, 2));

			scene.m_currentTouchDistance = touchDistance;

			if (VBI.m_bTrace) {
				VBI.Trace("processtouchstart" + "X1:" + touch1.clientX + "Y1:" + touch1.clientY + "X2:" + touch2.clientX + "Y2:" + touch2.clientY);
			}
			bHandled = true;
		}

		if (bHandled) {
			e.preventDefault();
			e.stopPropagation();
			return false;
		}
	};

	scene.RestartContextMenuTimer = function(event, touch, delay) {
		if (scene.m_ContextMenuTimer) {
			window.clearInterval(scene.m_ContextMenuTimer);
		}
		scene.m_ContextMenuTimer = window.setInterval(function() {
			window.clearInterval(scene.m_ContextMenuTimer);
			scene.m_ContextMenuTimer = null;
			scene.onPseudoRightClick(event, touch);
		}, delay);
	};

	scene.onPseudoRightClick = function(event, touch) {
		scene.SetInputMode(VBI.InputModeDefault);
		if (VBI.m_bTrace) {
			VBI.Trace("Pseudo Right Click");
		}
		if (scene.DispatchEvent(event, "sapsecclick") == true) { // dispatch the event
			scene.m_Touches = [];
			return;
		}
		var action;
		if ((action = scene.m_Ctx.m_Actions.findAction("ContextMenu", scene, "Map"))) {
			scene.m_Touches = [];
			var rect = scene.GetInternalDivClientRect();
			scene.m_Ctx.FireAction(action, scene, "Map", null, {
				x: touch.clientX - rect.left,
				y: touch.clientY - rect.top,
				scene: scene.m_ID
			});
		}
	};

	// ........................................................................//
	// tap analysis...........................................................//
	scene.IsDoubleTap = function(events) {
		// check whether there are two single taps with small distance.........//
		// and small timegap in the queue......................................//
		// there must be at least 4 events in the queue........................//
		// the last event must be a touchend...................................//
		if (events.length < 4) {
			return null;
		}

		var idxFirstStart = events.length - 4;
		var idxSecondStart = events.length - 2;

		// ensure that this was done with one finger only......................//
		if (events[idxFirstStart].type == "touchstart" && events[idxFirstStart].touches.length != 1) {
			return null;
		}
		if (events[idxSecondStart].type == "touchstart" && events[idxSecondStart].touches.length != 1) {
			return null;
		}

		var dx = events[idxFirstStart].touches[0].clientX - events[idxSecondStart].touches[0].clientX;
		var dy = events[idxFirstStart].touches[0].clientY - events[idxSecondStart].touches[0].clientY;

		// check distance......................................................//
		if ((dx * dx + dy * dy) > 1000) {
			return null; // distance of taps is too large.....................//
		}

		// check delta of time.................................................//
		var idxFirstEnd = events.length - 3;
		var idxSecondEnd = events.length - 1;
		var dt = events[idxSecondEnd].timeStamp - events[idxFirstEnd].timeStamp;
		if (dt > 300) {
			return null;
		}

		// deliver the client coordinates......................................//
		return [
			events[idxSecondStart].touches[0].clientX, events[idxSecondStart].touches[0].clientY
		];
	};

	scene.IsTwoFingerTap = function(events) {
		// check whether there are two single taps with small distance.........//
		// and small timegap in the queue......................................//
		// there must be at least 2 events in the queue........................//
		// and there must be no move as it is otherwise no tap.................//
		if ((events.length < 2) || (events.m_bMoveWasDone)) {
			return null;
		}

		var idxStart = events.length - 2;
		var idxEnd = events.length - 1;

		// ensure that this was done with two fingers..........................//
		if (events[idxStart].type != "touchstart" || events[idxStart].touches.length != 2) {
			return null;
		}

		// check delta of time.................................................//
		var dt = events[idxEnd].timeStamp - events[idxStart].timeStamp;
		if (dt > 300) {
			return null;
		}

		// deliver the client coordinates in the middle of the fingers.........//
		var touches = events[idxStart].touches;
		return [
			(touches[0].clientX + touches[1].clientX) / 2, (touches[0].clientY + touches[1].clientY) / 2
		];
	};

	scene.IsSingleTap = function(events) {
		if (events.length != 2 || (events.m_bMoveWasDone)) {
			return null;
		}

		var idxStart = events.length - 2;
		var idxEnd = events.length - 1;

		// the previous event has to be a touchstart...........................//
		if (events[idxStart].type != "touchstart" || events[idxStart].touches.length != 1) {
			return null;
		}
		if (events[idxEnd].type != "touchend") {
			return null;
		}

		var retVal = [
			events[idxStart].touches[0].clientX, events[idxStart].touches[0].clientY
		];
		retVal.timeTouchDown = events[idxEnd].timeStamp - events[idxStart].timeStamp;

		// delivers client coordinates.........................................//
		return retVal;
	};

	scene.processtouchend = function(e) {
		if (!scene.m_Touches.length) {
			return; // pseudo right click was triggered, no further processing on touch up
		}
		if (e.m_delayedExamination) {
			scene.m_Touches.pop(); // remove the previously added event and add it later again
		}
		if (VBI.m_bTrace) {
			VBI.Trace("touchend");
		}
		window.clearInterval(scene.m_ContextMenuTimer);
		scene.m_ContextMenuTimer = null;
		if (scene.DispatchEvent(e, "sapup") == true) {
			// dispatch the event
			// handled by vos, therefore the queue can be cleared...............//
			scene.m_Touches = [];
			return;
		}

		var rectDiv = scene.GetInternalDivClientRect();
		if ((rectDiv.width != scene.m_nDivWidth) || (rectDiv.height != scene.m_nDivHeight)) {
			scene.resizeCanvas(0);
		}

		// store the touch events..............................................//
		scene.m_Touches.push(e);

		var xy;
		if ((xy = scene.IsDoubleTap(scene.m_Touches))) {
			if (scene.DispatchEvent(e, "sapdblclick") == true) {
				// dispatch the event
				// handled by vos, therefore the queue can be cleared............//
				scene.m_Touches = [];
				e.stopPropagation();
				return;
			}
			scene.AnimateZoom(true, xy[0], xy[1], 12);
			scene.m_Touches = [];
		} else if ((xy = scene.IsTwoFingerTap(scene.m_Touches))) {
			scene.AnimateZoom(false, xy[0], xy[1], 33);
			scene.m_Touches = [];
		} else {
			// when touchend is reached rerender the overlay, due it was........//
			// supressed during zoom............................................//

			if (!(scene.m_nInputMode == VBI.InputModeTrackMap)) {
				scene.InternalRenderLayer(scene.m_Canvas[scene.m_nOverlayIndex], false, true, true, scene.m_Canvas[0].m_nExactLOD);
			}
		}

		// when more than 2 events are in, delete all except the 2 remaining...//
		if (scene.m_Touches.length > 2) {
			scene.m_Touches.splice(0, scene.m_Touches.length - 2);
		}

		// reset move state and touch distance.................................//
		scene.SetInputMode(VBI.InputModeDefault);

		// determine if this was a single tap..................................//
		if ((xy = scene.IsSingleTap(scene.m_Touches))) {
			// check delta of time..............................................//
			if (xy.timeTouchDown < 300 && !e.m_delayedExamination) {
				scene.m_TapTimer = window.setInterval(function() {
					e.m_delayedExamination = true;
					scene.processtouchend(e);
					window.clearInterval(scene.m_TapTimer);
				}, 300);
			} else {
				if (scene.DispatchEvent(e, "sapclick")) {
					// dispatch the event
					// handled by vos, therefore the queue can be cleared.........//
					scene.m_Touches = [];
					e.stopPropagation();
					return;
				}

				// check for map based event subscription........................//
				var action, actions = scene.m_Ctx.m_Actions;
				if (actions) {
					if ((action = actions.findAction("Click", scene, "Map"))) {
						var rect = scene.GetInternalDivClientRect();
						scene.m_Ctx.FireAction(action, scene, "Map", null, {
							x: xy[0] - rect.left,
							y: xy[1] - rect.top
						});
					}
				}
				scene.m_Touches = [];
			}
		}

		e.stopPropagation();
		e.preventDefault();
	};

	scene.processtouchcancel = function(e) {
		if (VBI.m_bTrace) {
			VBI.Trace("touchcancel");
		}

		if (scene.DispatchEvent(e, "sapup") == true) {// dispatch the event
			return;
		}
		scene.SetInputMode(VBI.InputModeDefault);
		e.preventDefault();
	};

	scene.processtouchmove = function(e) {
		if (VBI.m_bTrace) {
			VBI.Trace("touchmove");
		}
		if (!scene.m_Touches.length || !scene.m_currentMouseX) {
			return; // (length) pseudo right click was triggered, no further processing on touch up
		} // (mouse) sometimes touchmove seems to be trigger on Androids withhout touchstart

		var dx, dy, touch = {}, touch1;
		if (e.touches.length == 1) {
			touch = e.touches[0];
			dx = touch.clientX - scene.m_currentMouseX;
			dy = touch.clientY - scene.m_currentMouseY;
			if ((dx == 0) && (dy == 0)) {
				e.stopPropagation();
				return true;
			}
		}

		if (VBI.m_bIsAndroid && (e.touches.length == 2)) {
			var touch0 = e.touches[0];
			touch1 = e.touches[1];
			dx = touch0.clientX + touch1.clientX - 2 * scene.m_currentMouseX;
			dy = touch0.clientY + touch1.clientY - 2 * scene.m_currentMouseY;
			if ((dx == 0) && (dy == 0)) {
				e.stopPropagation();
				return true;
			}
		} // Android raises a move event also without move; Mouse must be in middle of both touches

		scene.m_Touches.m_bMoveWasDone = true;
		window.clearInterval(scene.m_ContextMenuTimer);
		scene.m_ContextMenuTimer = null;
		var bHandled = false;
		scene.m_nTapCount = 0;
		scene.SetInputMode(VBI.InputModeTrackMap);

		if (e.touches.length == 1) {
// if( scene.m_nInputMode != VBI.InputModeTrackMap )
// return;

			// only deal with one finger.....................................//

			scene.RestartContextMenuTimer(e, touch, 1100);

			if (VBI.m_bTrace) {
				VBI.Trace("ontouchmove " + "X1:" + touch.pageX + "Y1:" + touch.pageY);
			}

			// we are in move mode...........................................//
			// dx and dy were calculated above and one of them is unequal to zero

			scene.m_currentMouseX = touch.clientX;
			scene.m_currentMouseY = touch.clientY;

			scene.MoveMap(dx, dy);
			bHandled = true;
		} else if (e.touches.length == 2 && !scene.m_SuppressedNavigation.zoom) {

			var rectDiv = scene.GetInternalDivClientRect();
			if ((rectDiv.width != scene.m_nDivWidth) || (rectDiv.height != scene.m_nDivHeight)) {
				scene.resizeCanvas(0);
			}

			touch1 = e.touches[0];
			var touch2 = e.touches[1];

			var touchMidX = touch1.clientX + (touch2.clientX - touch1.clientX) / 2;
			var touchMidY = touch1.clientY + (touch2.clientY - touch1.clientY) / 2;

			// the touch mid is relative to page (bug?).....................//
			// correct it to be canvas relative.............................//
			var rect = scene.m_Canvas[0].getBoundingClientRect();
			touchMidX -= rect.left;
			touchMidY -= rect.top;

			// calculate touch distance and decide if it is a zoomin or.....//
			// a zoomout....................................................//
			var touchDistance = Math.sqrt(Math.pow(touch1.clientX - touch2.clientX, 2) + Math.pow(touch1.clientY - touch2.clientY, 2));

			if (Math.abs(scene.m_currentTouchDistance - touchDistance) > 10) {
				var bZoomIn = (touchDistance > scene.m_currentTouchDistance) ? true : false;
				scene.m_currentTouchDistance = touchDistance;

				if (VBI.m_bTrace) {
					VBI.Trace("ontouchmove " + " X1:" + touch1.pageX + " Y1:" + touch1.pageY + " X2:" + touch2.pageX + " Y2:" + touch2.pageY);
				}
				scene.ZoomMap(bZoomIn ? scene.m_nLodFactorZoomIn : scene.m_nLodFactorZoomOut, touchMidX, touchMidY, scene.m_nTicksInALod);

				window.clearInterval(scene.m_ReRenderTimer); // ZooMap is no more guaranteed rendering, so we trigger an asynchronous
				scene.m_ReRenderTimer = window.setInterval( // rendering 100 ms after the last change
				function() {
					window.clearInterval(scene.m_ReRenderTimer);
					scene.m_ReRenderTimer = null;
					scene.RenderAsync(true);
				}, 100);
			}
			bHandled = true;
		}

		if (bHandled) {
			e.stopPropagation();
			return true;
		}
	};

	scene.SetInputModeTrackMap = function(bSet) {
		// the desktop version tries to capture mousemove and mouseup events...//
		// here we do nearly nothing...........................................//
		if (!bSet) {
			// reset input mode when set before.................................//
			scene.m_currentMouseX = 0;
			scene.m_currentMouseY = 0;
		}
	};

	// ........................................................................//
	// do the event subscription..............................................//

	this.subscribe();
};

// ...........................................................................//
// scene events .............................................................//
VBI.SceneEvent = function(scene, ele) {
	"use strict";
	// device specific additional handlers....................................//
	this.m_DeviceHandlers = [];

	this.m_Events = [
		"mousedown", "mouseup", "mousemove", "mousewheel", "wheel", "mouseout", "click", "dblclick", "contextmenu", "selectstart", "dragstart", "dragenter", "dragover", "dragleave", "drop", "dragend", "keydown"
	];

// additional stuff.......................................................//
	ele.dropzone = "true";

// check for pointer events...............................................//
// when available add the specific device handler.........................//
// only when touch events are available, instantiate the gesture object...//
// and dispatch pointer events............................................//

	if (sap.ui.Device.support.pointer && navigator.msMaxTouchPoints) {
		this.m_DeviceHandlers.push(new VBI.ScenePointerEvents(scene, ele));
	}

// ........................................................................//
// subscribe and cleanup..................................................//

	this.clear = function() {
		// clear specific device handlers......................................//
		var nJ;
		for (nJ = 0; nJ < this.m_DeviceHandlers.length; ++nJ) {
			this.m_DeviceHandlers[nJ].clear();
		}
		this.m_DeviceHandlers = [];

		// unsubscribe events..................................................//
		for (nJ = 0; nJ < this.m_Events.length; ++nJ) {
			var name = "on" + this.m_Events[nJ];
			if (ele[name]) {
				ele[name] = null;
			}
		}
	};

	this.subscribe = function() {
		// unsubscribe events..................................................//
		var ae = this.m_Events;
		for (var nJ = 0, nLen = ae.length; nJ < nLen; ++nJ) {
			var handlername;
			// check for platform tags to skip them.............................//
			if (ae[nJ].slice(0, 2) == "ms") {
				handlername = "process" + ae[nJ].slice(2);
			} else {
				handlername = "process" + ae[nJ];
			}

			if (!scene[handlername]) {
				jQuery.sap.log.error("Handler " + handlername + " not defined");
			}

			ele["on" + ae[nJ]] = scene[handlername];
		}
	};

	// check for touch, but no pointer support................................//
	if (sap.ui.Device.support.touch && !(sap.ui.Device.support.pointer && navigator.msMaxTouchPoints)) {
		this.m_DeviceHandlers.push(new VBI.SceneTouchEvents(scene, ele));

		if (!sap.ui.Device.system.desktop) { // no mouse and keyboard events for non-desktop
			return;
		}
	}

	// ........................................................................//
	// helper functions.......................................................//
	scene.SetInputModeTrackMap = function(bSet) {
		// !capured event listeners on canvas will not work, <document> is.....//
		// is mandatory........................................................//

		if (bSet) {
			// remove documents event listeners.................................//
			// current positions must be set outside............................//
			document.addEventListener('mouseup', scene.processmouseup, true);
			document.addEventListener('mousemove', scene.processmousemove, true);
		} else {
			// reset input mode when set before.................................//
			scene.m_currentMouseX = 0;
			scene.m_currentMouseY = 0;
			document.removeEventListener('mouseup', scene.processmouseup, true);
			document.removeEventListener('mousemove', scene.processmousemove, true);
		}
	};

	// ........................................................................//
	// event handlers.........................................................//
	scene.onsapdown = function(event) {
		if (VBI.m_bTrace) {
			VBI.Trace("scene.onsapdown");
		}

		// store current mouse positions.......................................//
		scene.m_currentMouseDownX = event.clientX;
		scene.m_currentMouseDownY = event.clientY;
		scene.m_currentMouseX = event.clientX;
		scene.m_currentMouseY = event.clientY;

		if (scene.DispatchEvent(event, "sapdown") == true) { // dispatch the event
			return true;
		}
	};

	scene.onsapup = function(event) {
		if (VBI.m_bTrace) {
			VBI.Trace("scene.onsapup");
		}

		if (scene.DispatchEvent(event, "sapup") == true) { // dispatch the event
			return;
		}

		// prevent from default handling.......................................//
		scene.SetInputMode(VBI.InputModeDefault);

		event.preventDefault();
		return false;
	};

	scene.onsapclick = function(event) {
		// raise a click event.................................................//
		// when the click is subscribed........................................//
		// use the m_clientX and m_clientY values to get relative canvas.......//
		// relative coordinates................................................//

		if (VBI.m_bTrace) {
			VBI.Trace("scene.onsapclick");
		}

		var dx = scene.m_currentMouseDownX - event.clientX;
		var dy = scene.m_currentMouseDownY - event.clientY;
		if ((dx * dx + dy * dy) <= 5) {
			// dispatch the event
			if (VBI.m_bTrace) {
				VBI.Trace("process click dispatch");
			}
			if (scene.DispatchEvent(event, "sapclick") == true) {
				if (VBI.m_bTrace) {
					VBI.Trace("process click handled in dispatch");
				}
				return;
			}

			// the criteria for a click is fulfilled
			if (scene.Click) {
				// enhance the event with canvas relative click coordinates...//
				var rect = scene.m_Canvas[scene.m_nOverlayIndex].getBoundingClientRect();
				event.m_clientX = event.clientX - rect.left;
				event.m_clientY = event.clientY - rect.top;
				if (scene.Click(event)) {
					return; // the event is handled...........................//
				}
			}

			// check for map based event subscription........................//
			var action, actions = scene.m_Ctx.m_Actions;
			if (actions) {
				if ((action = actions.findAction("Click", scene, "Map"))) {
					scene.m_Ctx.FireAction(action, scene, "Map", null, scene.GetEventVPCoordsObj(event));
				}
				event.preventDefault(); // the event is handled
			}
		}
	};

	scene.onsapmove = function(event) {
		// this is the common move handle between pointer and mouse messages...//
		if (VBI.m_bTrace) {
			VBI.Trace("scene.onsapmove");
		}

		if (scene.DispatchEvent(event, "sapmove") == true) { // dispatch the event
			return true;
		}

		var bTransparent;
		if ((bTransparent = scene.IsTransparent(event.clientX, event.clientY))) {
			scene.SetToolTip("");
			scene.SetCursor('default');
			scene.InternalSetHotItem(null, null);
		}

		scene.SetCursor(bTransparent ? 'default' : 'pointer');
		return false;
	};

	scene.processmousedown = function(event) {
		if (VBI.m_bTrace) {
			VBI.Trace("scene.processmousedown");
		}
		if (scene.m_Gesture) {
			return;
		}
		if (scene.onsapdown(event)) {
			return;
		}
		// do default mouse handling...........................................//
		if (!scene.m_SuppressedNavigation.move && (event.type.indexOf("pointer") < 0) && (!sap.ui.Device.os.macintosh || event.which == 1)) {
			// On Mac we do not set track mode for right mouse as context menu is triggered immediatelly
			if (VBI.m_bTrace) {
				VBI.Trace("set input mode track map");
			}
			scene.SetInputMode(VBI.InputModeTrackMap);
			// !capured event listeners on canvas will not work, document is....//
			// is mandatory.....................................................//
			// it is important to remove the listener with the capture flag!....//

			// do !not! prevent from default handling...........................//
			// IE needs to activate the canvas..................................//
			scene.m_Canvas[scene.m_nLabelIndex].focus();
		}
	};

	scene.processkeydown = function(event) {
		if (VBI.m_bTrace) {
			VBI.Trace("scene.processkeydown");
		}

		var bHandled = false, keyCode = event.keyCode;

		// dispatch the keydown event..........................................//
		if (scene.DispatchEvent(event, "sapkeydown") == true) { // dispatch the event
			return;
		}

		var rectDiv = scene.GetInternalDivClientRect();
		if ((rectDiv.width != scene.m_nDivWidth) || (rectDiv.height != scene.m_nDivHeight)) {
			scene.resizeCanvas(0);
		}
		if (keyCode == 72) { // 'h' for got to initial start position
			scene.GoToInitialStart();
			bHandled = true;
		} else if (keyCode == 90) { // 'z' for rectangular zoom mode
			new scene.RectangularZoom();
			bHandled = true;
		} else if (keyCode == 82) { // 'r' for rectangular selection
			new scene.RectSelection();
			bHandled = true;
		} else {
			if (!scene.m_SuppressedNavigation.zoom) {
				var zoomStep = 0;
				var centerPoint = scene.GetCenterPos();
				var newZoomLevel = scene.getCanvas().m_nExactLOD;
				if (keyCode == 187 || keyCode == 107 || keyCode == 171 /* 171 for Firefox!! */) { // +
					zoomStep = 1;
				} else if (keyCode == 189 || keyCode == 109 || keyCode == 173 /* 173 for Firefox!! */) { // -
					zoomStep = -1;
				}
				if (zoomStep) {
					var minLOD = scene.GetMinLOD();
					if ((zoomStep > 0) && (newZoomLevel == minLOD) && (newZoomLevel != Math.ceil(newZoomLevel))) {
						newZoomLevel = Math.ceil(newZoomLevel);
					} else {
						newZoomLevel += zoomStep;
					}
					scene.AnimateZoomToGeo(centerPoint, Math.round(newZoomLevel), 20);
					bHandled = true;
				}
			}
			if (!scene.m_SuppressedNavigation.move) {
				var distance = 20;
				switch (keyCode) {
					case 37: // arrow left
						scene.MoveMap(distance, 0);
						bHandled = true;
						break;
					case 39: // arrow right
						scene.MoveMap(-distance, 0);
						bHandled = true;
						break;
					case 38: // arrow up
						scene.MoveMap(0, distance);
						bHandled = true;
						break;
					case 40: // arrow down
						scene.MoveMap(0, -distance);
						bHandled = true;
						break;
					default:
						break;
				}
			}
		}

		if (bHandled) {
			event.preventDefault();
		}
		return;
	};

	scene.processcontextmenu = function(event) {
		if (VBI.m_bTrace) {
			VBI.Trace("scene.processcontextmenu");
		}

		// dispatch the event..................................................//
		if (scene.DispatchEvent(event, "sapsecclick") == true) {
			return; // return due it has been handled by a VO
		}

		// check for map based event...........................................//
		var action, actions = scene.m_Ctx.m_Actions;
		if (actions) {
			if ((action = actions.findAction("ContextMenu", scene, "Map"))) {
				scene.m_Ctx.FireAction(action, scene, "Map", null, scene.GetEventVPCoordsObjWithScene(event));
			}
			event.preventDefault(); // the event is handled
		}
	};

	scene.processmouseout = function(event) {
		if (VBI.m_bTrace) {
			VBI.Trace("scene.processmouseout");
		}

		// dispatch the event
		if (scene.DispatchEvent(event, "sapout") == true) {
			return;
		}

		// when the mouse moves out, reset the hot state.......................//
		scene.InternalSetHotItem(null, null);

		return false;
	};

	scene.processdblclick = function(event) {
		if (VBI.m_bTrace) {
			VBI.Trace("scene.processdblclick");
		}

		// dispatch the event..................................................//
		if (scene.DispatchEvent(event, "sapdblclick") == true) {
			return; // return due it has been handled by a VO
		}
		return;
	};

	scene.processclick = function(event) {
		if (VBI.m_bTrace) {
			VBI.Trace("scene.processclick");
		}

		// when a gesture is running the click is produced there...............//
		if (scene.m_Gesture) {
			return;
		}

		return scene.onsapclick(event);
	};

	scene.processmouseup = function(event) {
		if (VBI.m_bTrace) {
			VBI.Trace("scene.processmouseup");
		}
		scene.dragclear();

		return scene.onsapup(event);
	};

	scene.processmousemove = function(event) {
		if (VBI.m_bTrace) {
			VBI.Trace("scene.processmousemove");
		}
		if (scene.m_DragInfo) {
			if (scene.m_DragInfo.bDragStart) {
				return false;
			}
			return;
		}

		// store some mouse position state.....................................//
		var dx = event.clientX - scene.m_currentMouseX;
		var dy = event.clientY - scene.m_currentMouseY;
		scene.m_currentMouseX = event.clientX;
		scene.m_currentMouseY = event.clientY;

		// when a gesture is processed return immediately due .................//
		// pointer move events should do the same thing........................//
		if (scene.m_Gesture) {
			return;
		}
		if (scene.onsapmove(event)) {
			return;
		}

		if (scene.m_nInputMode == VBI.InputModeTrackMap) {
			if (!(event.buttons == 1 || event.which == 1)) {
				// button is no longer pressed, stop mouse capturing and move....//
				// mode..........................................................//
				scene.SetInputMode(VBI.InputModeDefault);
				return false;
			}

			if (dx || dy) {
				scene.MoveMap(dx, dy);
			}
			return false;
		}
		event.preventDefault();
	};

	scene.processmousewheel = function(event) {
		if (VBI.m_bTrace) {
			VBI.Trace("processmousewheel");
		}

		// set own browser independent event parameters........................//
		event.m_OffsetX = event.offsetX;
		event.m_OffsetY = event.offsetY;
		event.m_Delta = event.wheelDelta;

		scene.processcommonwheel(event);
		return false;
	};

	scene.processwheel = function(event) {
		if (VBI.m_bTrace) {
			VBI.Trace("processwheel");
		}

		// set own browser independent event parameters.....................//
		// due to ff, there is no correct offsetX
		var rect = event.target.getBoundingClientRect();

		event.m_OffsetX = event.clientX - rect.left;
		event.m_OffsetY = event.clientY - rect.top;
		event.m_Delta = -event.deltaY;

		scene.processcommonwheel(event);
		return false;
	};

	scene.processcommonwheel = function(event) {
		if (sap.ui.Device.os.macintosh) {
			var timeNow = Date.now();
			var bMustReturn = ((scene.m_LastCWEvent != undefined) && (timeNow - scene.m_LastCWEvent < 100));
			scene.m_LastCWEvent = timeNow;
			if (bMustReturn) {
				return;
			}
		}
		if (VBI.m_bTrace) {
			VBI.Trace("processcommonwheel");
		}

		if (scene.DispatchEvent(event) == true) {// dispatch the event
			return;
		}

		if (!scene.m_SuppressedNavigation.zoom && event.m_Delta) {
			var rect = scene.GetInternalDivClientRect();
			if ((rect.width != scene.m_nDivWidth) || (rect.height != scene.m_nDivHeight)) {
				scene.resizeCanvas(0);
			}
			if (scene.m_nZoomMode) {
				var rc = scene.m_Canvas[0].getBoundingClientRect();
				// VBI.Trace("Call AnimateZoom with "+event.m_OffsetX+"+"+rc.left+" / "+event.m_OffsetY+"+"+rc.top)
				scene.AnimateZoom(event.m_Delta > 0, event.m_OffsetX + rc.left, event.m_OffsetY + rc.top, 40, event);
			} else {
				scene.ZoomMap(event.m_Delta > 0 ? scene.m_nLodFactorZoomIn : scene.m_nLodFactorZoomOut, event.m_OffsetX, event.m_OffsetY, scene.m_nTicksInALod);
			}

			event.preventDefault();
		}

		return;
	};

	// .....................................................................//
	// drag and drop processing............................................//
	scene.dragclear = function(event) {
		var img = document.getElementById(scene.m_Target.id + "-transparentImg");
		if (img) {
			scene.m_Div.removeChild(img);
		}
		scene.m_DragInfo = null;
	};

	scene.processdragleave = function(event) {
		// if (scene.m_DragInfo) { }
		return;
	};

	scene.processdragend = function(event) {
		event.preventDefault();
		event.stopPropagation();

		scene.dragclear();
		return true;
	};

	scene.processselectstart = function(event) {
		if (event.target.dragDrop && scene.m_DragInfo) {
			event.target.dragDrop();
		}
		event.preventDefault();
		return true;
	};

	scene.processdragstart = function(event) {
		if (scene.m_DragInfo) {
			if (scene.m_DragInfo.strExtData) {
				event.dataTransfer.setData('text', scene.m_DragInfo.strExtData);
			} else {
				event.dataTransfer.setData('text', "");
			}
			event.dataTransfer.effectAllowed = 'copy';

			scene.m_DragInfo.bDragStart = true;

			if (event.dataTransfer.setDragImage) {
				var image = VBI.Utilities.GetTransparentImage();
				image.id = scene.m_Target.id + "-transparentImg";
				scene.m_Div.appendChild(image);
				event.dataTransfer.setDragImage(image, 0, 0);
			}
			return true;
		}
		return false;
	};

	scene.processdragenter = function(event) {
		if (!event.dataTransfer) {
			return false;
		}
		if (event.dataTransfer) {
			try {
				event.dataTransfer.dropEffect = 'copy';
			} catch (err) {
				// just trace the message...........................................//
				jQuery.sap.log.warning("scene.processdragenter exception occured: " + err.message);
			}
		}
		event.preventDefault();
		return true;
	};

	scene.processdragover = function(event) {
		if (!event.dataTransfer) {
			return false; // Is required for cross browser compatibility!
		}
		if (scene.m_Gesture) {
			return;
		}

		if (scene.m_DragInfo && scene.m_DragInfo.bDragStart) {
			scene.DispatchEvent(event, "sapdrag");
		} else {
			event.preventDefault();
		}
		// var dat = event.dataTransfer.getData('text');
		// todo: dat should be analyzed to determine further steps

		return;
	};

	scene.DesignCreateObject = function(data, pos, func) {
		// ensure that the data parameter is of type string....................//
		var dat = null;
		if (typeof data == 'string') {
			dat = data;
		} else {
			dat = JSON.stringify(data);
		}

		// .....................................................................//
		// only one placeholder can be processed when an object is created.....//

		if (dat.indexOf("{POS}") >= 0) {
			// replace single positions when specified..........................//
			if (pos) {
				var strpos = "" + pos[0] + ";" + pos[1] + ";" + "0.0";
				var tmp = dat.replace(/{POS}/g, strpos);
				func(tmp); // done
			} else {
				// just get one point............................................//
				new scene.DesignPositionArray(null, dat, func, "{POS}", 1); // create exactly
			}
		} else if (dat.indexOf("{POSARRAY}") >= 0) {
			// get a complete array.............................................//
			new scene.DesignPositionArray(pos ? [
				pos[0], pos[1], 0.0
			] : null, dat, func, "{POSARRAY}", null);
		} else {
			// just call the function...........................................//
			func(data);
		}
		return;
	};

	scene.processdrop = function(event) {

		if (!event.dataTransfer) {
			scene.dragclear();
			return false;
		}

		if (scene.m_DragInfo && scene.m_DragInfo.bDragStart) {
			scene.DispatchEvent(event, "sapdrop");
			// dispatch the event
			event.preventDefault();
			event.stopPropagation();
			scene.dragclear();
			return true;
		}
		// get the transfer data...............................................//
		var dat = event.dataTransfer.getData('text');

		// determine the drop position.........................................//
		var rect = scene.m_Canvas[0].getBoundingClientRect();
		var pos = scene.GetPosFromPoint([
			event.clientX - rect.left, event.clientY - rect.top, 0.0
		]);

		// check if there is a drop action subscribed..........................//
		var action = null, actions = scene.m_Ctx.m_Actions;
		if (actions) {
			action = scene.m_Ctx.m_Actions.findAction("Drop", scene, "Map");
		}

		// determine the right callback function for the drop action...........//
		var func = null;
		if (action) {
			// bind to a callback that raises the event.........................//
			func = function(data) {
				var params = scene.GetEventVPCoordsObj(event);
				params.content = data; // append the load content..............//
				scene.m_Ctx.FireAction(action, scene, "Map", null, params);
			};
		} else {
			// by default we bind the loader function of the vbi instance.......//
			func = scene.m_Ctx.m_Control.load.bind(scene.m_Ctx.m_Control);
		}

		// call object creator function........................................//
		// scene.DesignCreateObject( dat, pos, func );
		scene.DesignCreateObject(dat, pos, func);

		// important for ff to stop propagation................................//
		event.preventDefault();
		event.stopPropagation();

		scene.dragclear();
		return true;
	};

	scene.RectangularTracking = function() {
		this.m_PosStart = null;
		this.m_PosMove = null;
		this.m_bTrack = false;
		this.m_keycode = 0;
	};

	scene.RectangularTracking.prototype.onsapkeydown = function(e) {
		if (e.keyCode == this.m_keycode) {
			// exit mode selection mode ................//
			return (this.ExitRectMode(e));
		}

	};
	scene.RectangularTracking.prototype.onsapdown = function(e) {
		// determine the sap down position.....................................//
		var rect = scene.m_Canvas[scene.m_nOverlayIndex].getBoundingClientRect();
		this.m_PosStart = scene.GetPosFromPoint([
			e.clientX - rect.left, e.clientY - rect.top, 0
		]);
		this.m_bTrack = true;
		e.preventDefault();
		scene.m_Canvas[scene.m_nLabelIndex].focus();
		return true;
	};
	scene.RectangularTracking.prototype.onsapmove = function(e) {
		if (this.m_bTrack) {
			// determine the move position......................................//
			var rect = scene.m_Canvas[scene.m_nOverlayIndex].getBoundingClientRect();
			this.m_PosMove = scene.GetPosFromPoint([
				e.clientX - rect.left, e.clientY - rect.top, 0
			]);
		}
		scene.SetCursor('crosshair');
		scene.RenderAsync(true); // trigger async rendering...................//
		e.preventDefault();
		return true;
	};

	scene.RectangularTracking.prototype.onsapout = function(e) {
		// return ( this.ExitRectMode( e ) );
	};
	scene.RectangularTracking.prototype.execute = function(e) {
		// The prototype impl is empty
	};

	scene.RectangularTracking.prototype.onsapup = function(e) {
		if (!this.m_bTrack) {
			return false;
		}

		if (this.m_PosStart && this.m_PosMove) {
			this.execute(e);
		}
		this.m_PosStart = null;
		this.m_PosMove = null;
		this.m_bTrack = false;

		// trigger async rendering..........................................//
		scene.RenderAsync(true);
		e.preventDefault();
		return true;

	};

	scene.RectangularTracking.prototype.Hook = function() {
		scene.SetInputMode(VBI.InputModeRectSelect);
		scene.m_DesignVO = this;
		scene.SetCursor('crosshair');
		scene.RenderAsync(true);
	};

	scene.RectangularTracking.prototype.UnHook = function() {
		if (scene.m_nInputMode == VBI.InputModeRectSelect) {
			scene.SetInputMode(VBI.InputModeDefault);
		} else {
			jQuery.sap.log.error("Wrong InputMode in UnHook: " + scene.m_nInputMode);
		}

		this.m_PosStart = null;
		this.m_PosMove = null;
		this.m_bTrack = false;

		scene.m_DesignVO = null;
		scene.RenderAsync(true); // trigger async rendering...................//
	};

	scene.RectangularTracking.prototype.ExitRectMode = function(e) {
		// exit mode selection mode ................//
		this.UnHook();
		scene.SetCursor('default');
		scene.RenderAsync(true); // trigger async rendering...................//

		e.preventDefault();
		return true;
	};

// ........................................................................//
// rectangular zoom ( sub class of RectangularTracking ) .................//
// ........................................................................//
	scene.RectangularZoom = function() {
		scene.RectangularTracking.call(this);
		this.m_keycode = 90;
		this.Hook();
	};

	scene.RectangularZoom.prototype = Object.create(scene.RectangularTracking.prototype);

	scene.RectangularZoom.prototype.constructor = scene.RectangularZoom;

	scene.RectangularZoom.prototype.execute = function(e) {
		var lons = [];
		var lats = [];
		lons[0] = this.m_PosStart[0];
		lons[1] = this.m_PosMove[0];
		lats[0] = this.m_PosStart[1];
		lats[1] = this.m_PosMove[1];
		scene.ZoomToMultiplePositions(lons, lats, 1.0);
	};

	scene.RectangularZoom.prototype.Render = function(canvas, dc) {
		if (!this.m_bTrack) {
			return false;
		}

		// check positions to prevent from failures.........................//
		if (this.m_PosMove && this.m_PosStart) {
			var ptStart = scene.GetPointFromPos(this.m_PosStart, false);
			var ptMove = scene.GetPointFromPos(this.m_PosMove, false);

			var ptCorrectedMove = ptMove.slice(0);
			var CurrentWidthZoomRect = ptMove[0] - ptStart[0];
			var CurrentHeightZoomRect = ptMove[1] - ptStart[1];

			var rectDiv = scene.GetInternalDivClientRect();

			var currentRatioDiv = Math.abs(rectDiv.width / rectDiv.height);
			var currentRatioZoomRect = Math.abs(CurrentWidthZoomRect / CurrentHeightZoomRect);
			var height = 0;
			var width = 0;

			if (currentRatioZoomRect < currentRatioDiv) {
				// keep width
				width = ptMove[0] - ptStart[0];
				height = width / currentRatioDiv;
				if (ptMove[0] < ptStart[0] && ptMove[1] > ptStart[1] || ptMove[0] > ptStart[0] && ptMove[1] < ptStart[1]) {
					ptCorrectedMove[1] = ptStart[1] - height;
				} else {
					ptCorrectedMove[1] = ptStart[1] + height;
				}
			} else {
				// keep height
				height = ptMove[1] - ptStart[1];
				width = currentRatioDiv * height;
				if (ptMove[0] < ptStart[0] && ptMove[1] > ptStart[1] || ptMove[0] > ptStart[0] && ptMove[1] < ptStart[1]) {
					ptCorrectedMove[0] = ptStart[0] - width;
				} else {
					ptCorrectedMove[0] = ptStart[0] + width;
				}
			}

			VBI.Utilities.DrawTrackingRect(dc, ptStart[0], ptStart[1], ptCorrectedMove[0], ptCorrectedMove[1]);

			var zf = scene.GetStretchFactor4Mode();
			ptCorrectedMove[0] *= zf[0];
			ptCorrectedMove[1] *= zf[1];

			this.m_PosMove = scene.GetPosFromPoint([
				ptCorrectedMove[0], ptCorrectedMove[1]
			]);

		}
	};

// ........................................................................//
// rectangular selection ( sub class of RectangularTracking ) ............//
// ........................................................................//
	scene.RectSelection = function() {
		scene.RectangularTracking.call(this);
		this.m_keycode = 82;
		this.Hook();
	};

	scene.RectSelection.prototype = Object.create(scene.RectangularTracking.prototype);

	scene.RectSelection.prototype.constructor = scene.RectSelection;

	scene.RectSelection.prototype.execute = function(e) {
		var pt1 = scene.GetPointFromPos(this.m_PosStart, false);
		var pt2 = scene.GetPointFromPos(this.m_PosMove, false);
		var ptStart = [];
		var ptMove = [];
		var nJ;
		for (nJ = 0; nJ <= 1; nJ++) {
			if (pt1[nJ] < pt2[nJ]) {
				ptStart[nJ] = pt1[nJ];
				ptMove[nJ] = pt2[nJ];
			} else {
				ptStart[nJ] = pt2[nJ];
				ptMove[nJ] = pt1[nJ];
			}
		}

		var zf = scene.GetStretchFactor4Mode();

		// bounding boxes are defined always in non stretched canvas........//
		// coordinates, therefore transform them............................//
		ptStart[0] /= zf[0];
		ptMove[0] /= zf[0];
		ptStart[1] /= zf[1];
		ptMove[1] /= zf[1];

		var selectionRect = [
			ptStart[0], ptStart[1], ptMove[0], ptMove[1]
		];
		var bShift, bCtrl;
		if ((e.type.indexOf("touch") >= 0) || (e.type.indexOf("pointer") >= 0)) {
			bShift = bCtrl = false;
		} else {
			bCtrl = e.ctrlKey;
			bShift = e.shiftKey;
		}

		var lenVOS = scene.m_VOS.length;
		var selectionChanged = false;
		var nK, nM, node, ele, ds, vo;
		var orgHits = [];
		for (nJ = 0; nJ < lenVOS; ++nJ) {
			if (!scene.m_VOS[nJ].RectSelect) {
				continue;
			}
			var hitsPerVO = [];
			orgHits[nJ] = [];
			if (scene.m_VOS[nJ].RectSelect(selectionRect, hitsPerVO, orgHits[nJ])) {
				vo = scene.m_VOS[nJ];
				if (!(ds = vo.m_DataSource)) {
					continue;
				}
				if (!bShift && !bCtrl && ds) {
					// selection without key modifier
					if ((node = ds.GetCurrentNode(scene.m_Ctx))) {
						for (nM = 0; nM <= 1; nM++) {
							// do this twice to make sure that a selection or deselection that could not be done in the first loop because of
							// cardinality
							// ( 1:N ) can be done in the second loop!!
							for (nK = 0; nK < node.m_dataelements.length; ++nK) {
								ds.Select(nK);
								if ((ele = ds.GetIndexedElement(scene.m_Ctx, nK))) {
									if (vo.IsSelected(scene.m_Ctx)) {
										if (VBI.IndexOf(hitsPerVO, nK) == -1) {
											vo.Select(ele, scene.m_Ctx, false);
											selectionChanged = true;
										}
									} else if (VBI.IndexOf(hitsPerVO, nK) != -1) {
										vo.Select(ele, scene.m_Ctx, true);
										selectionChanged = true;
									}
								}
							}
						}
					}
				} else if (bShift) {
					// add selection
					for (nK = 0; nK < hitsPerVO.length; nK++) {
						ds.Select(hitsPerVO[nK]);
						if ((ele = ds.GetIndexedElement(scene.m_Ctx, hitsPerVO[nK]))) {
							if (!vo.IsSelected(scene.m_Ctx)) {
								vo.Select(ele, scene.m_Ctx, true);
								selectionChanged = true;
							}
						}
					}
				} else if (bCtrl) {
					var select = [];
					for (nK = 0; nK < hitsPerVO.length; nK++) {
						// collect all items that are affected
						ds.Select(hitsPerVO[nK]);
						var sel = {};
						if (vo.IsSelected(scene.m_Ctx)) {
							sel.toSelect = false;
						} else {
							sel.toSelect = true;
						}
						sel.idx = nK;
						select.push(sel);
					}
					for (nM = 0; nM <= 1; nM++) {
						// do this twice to make sure that a selection or deselection that could not be done in the first loop because of cardinality
						// ( 1:N ) can be done in the second loop!!
						for (nK = 0; nK < select.length; nK++) {
							ds.Select(hitsPerVO[select[nK]]);
							if ((ele = vo.m_DataSource.GetIndexedElement(scene.m_Ctx, hitsPerVO[select[nK].idx]))) {
								if (nM == 0 && select[nK].toSelect) {
									vo.Select(ele, scene.m_Ctx, true);
									selectionChanged = true;
								}
								if (nM == 1 && !select[nK].toSelect) {
									vo.Select(ele, scene.m_Ctx, false);
									selectionChanged = true;
								}
							}
						}
					}
				}
			}
		}

		if (scene.m_PreassembledData) {
			scene.UpdatePreData4SelArray(orgHits);
		}

		// fire selection event when subscribed.............................//
		var actions;
		if (selectionChanged && (actions = scene.m_Ctx.m_Actions)) {
			var action;
			if ((action = actions.findAction("Select", scene, "General"))) {
				// todo: add event parameters
				scene.m_Ctx.FireAction(action, scene, "General", null, null);

			}
		}

	};

	scene.RectSelection.prototype.Render = function(canvas, dc) {
		if (!this.m_bTrack) {
			return false;
		}

		// check positions to prevent from failures.........................//
		if (this.m_PosMove && this.m_PosStart) {
			var ptStart = scene.GetPointFromPos(this.m_PosStart, false);
			var ptMove = scene.GetPointFromPos(this.m_PosMove, false);
			VBI.Utilities.DrawTrackingRect(dc, ptStart[0], ptStart[1], ptMove[0], ptMove[1]);
		}
	};

// ........................................................................//
// design object movements................................................//
// mode: InputModeTrackObject
	scene.DesignTrack = function(obj) {
		// start tracking......................................................//
		this.m_Tcx = obj; // store track object

		// ........................................................................//
		// event handlers.........................................................//

		this.onsapkeydown = function(e) {
			if (e.keyCode == 27) { // ESC
				// exit mode array creation without applying data................//
				this.UnHook(false);
				e.preventDefault();
				return true;
			}
		};

		this.onsapclick = function(e) {
			if (VBI.m_bTrace) {
				VBI.Trace("Track sapclick");
			}

			// stop tracking....................................................//
			this.UnHook();
			return false;
		};

		this.onsapdown = function(e) {
			if (VBI.m_bTrace) {
				VBI.Trace("Track sapdown");
			}

			// this helps to prevent from moving the control into visible.......//
			// area.............................................................//
			e.preventDefault();
			return true;
		};

		this.onsapmove = function(e) {
			if (VBI.m_bTrace) {
				VBI.Trace("Track sapmove");
			}

			// process move callback............................................//
			// provide current relative canvas coordinates......................//
			var tcx = this.m_Tcx;
			tcx.m_ClientX = e.offsetX;
			tcx.m_ClientY = e.offsetY;

			if (tcx.m_CBDrag) {
				if (VBI.m_bTrace) {
					VBI.Trace("Track sapmove: orig type " + e.type);
				}
				tcx.m_CBDrag(tcx, e);
			}

			e.preventDefault();
			e.stopPropagation();
			return true;
		};

		this.onsapup = function(e) {
			if (VBI.m_bTrace) {
				VBI.Trace("Track sapup");
			}

			// process move callback............................................//
			// provide current relative canvas coordinates......................//
			var tcx = this.m_Tcx;
			tcx.m_ClientX = e.offsetX;
			tcx.m_ClientY = e.offsetY;

			if (tcx.m_CBDrop) {
				// notify about drop
				tcx.m_CBDrop(tcx, e);
			}

			if (tcx.m_CBEnd) {
				// notify about end of operation
				tcx.m_CBEnd(tcx, e);
			}

			// stop tracking....................................................//
			this.UnHook();

			// prevent from default handling....................................//
			e.preventDefault();
			e.stopPropagation();
			return true;
		};

		// .....................................................................//
		// hook and unhook into scene events...................................//

		this.Hook = function() {
			scene.SetInputMode(VBI.InputModeTrackObject);
			scene.m_DesignVO = this;
		};

		this.UnHook = function() {
			// check if hook is still there.....................................//
			if (scene.m_DesignVO != this) {
				return;
			}

			if (scene.m_nInputMode == VBI.InputModeTrackObject) {
				scene.SetInputMode(VBI.InputModeDefault);
			} else {
				jQuery.sap.log.error("Wrong InputMode in UnHook: " + scene.m_nInputMode);
			}

			// release object references........................................//
			scene.m_DesignVO = null;
			this.m_Tcx = null;

			scene.RenderAsync(true); // trigger async rendering...............//
		};

		// render calls........................................................//
		this.Render = function(canvas, dc) {
			return;
		};

		this.Hook();
	};

// ........................................................................//
// design create a position array.........................................//

	scene.DesignPositionArray = function(pos, loaddata, func, placeholder, maxpos) {
		// it should be possible to call this function by automation...........//

		// add a design object creator to the scene that captures the required.//
		// events and removes itself when done.................................//

		// pos can be the initial drop array which can be empty as well........//
		// loaddata is the json string that can be loaded afterwards...........//
		// maxpos is optional the object will unhook when the maximum positions//
		// are entered to the array............................................//

		this.m_PosArray = pos ? pos : []; // prefill position array..........//
		this.m_PosMove = null;
		this.m_Func = func;
		this.m_PlaceHolder = placeholder;

		scene.SetCursor('crosshair');

		this.onsapkeydown = function(e) {
			if (e.keyCode == 27) {
				// ESC
				// exit mode array creation without applying data................//
				this.UnHook(false);
				e.preventDefault();
				return true;
			}
		};

		this.onsapclick = function(e) {
			if (VBI.m_bTrace) {
				VBI.Trace("this.onsapclick " + e.type);
			}

			// determine the click position.....................................//
			var rect = scene.m_Canvas[scene.m_nOverlayIndex].getBoundingClientRect();
			var pos = scene.GetPosFromPoint([
				e.clientX - rect.left, e.clientY - rect.top, 0
			]);
			var tmp = [
				pos[0], pos[1], 0.0
			];

			var alen = this.m_PosArray.length;
			var numPos = alen / 3;

			// check if last position is already in.............................//
			if ((numPos >= 1) && (this.m_PosArray[alen - 3] == tmp[0]) && (this.m_PosArray[alen - 2] == tmp[1]) && (this.m_PosArray[alen - 1] == tmp[2])) {
				return true;
			}

			// push the position to the position array..........................//
			for (var nJ = 0, len = tmp.length; nJ < len; ++nJ) {
				this.m_PosArray.push(tmp[nJ]);
			}

			numPos = this.m_PosArray.length / 3;

			scene.RenderAsync(true); // trigger async rendering...................//
			e.preventDefault();

			// end of position creation reached.................................//
			if (maxpos && numPos >= maxpos) {
				this.UnHook(true);
			}

			return true;
		};

		this.onsapdown = function(e) {
			// this helps to prevent from moving the control into visible.......//
			// area.............................................................//
			e.preventDefault();
			return true;
		};

		this.onsapmove = function(e) {
			jQuery.sap.log.debug("this.onsapmove");
			jQuery.sap.log.error("Wrong InputMode in onsapmove: " + scene.m_nInputMode);

			// determine the move position......................................//
			var rect = scene.m_Canvas[0].getBoundingClientRect();
			this.m_PosMove = scene.GetPosFromPoint([
				e.clientX - rect.left, e.clientY - rect.top, 0
			]);

			scene.RenderAsync(true); // trigger async rendering...................//
			e.preventDefault();
			return true;
		};

		this.onsapdblclick = function(e) {
			this.UnHook(true);
			return true;
		};

		// .....................................................................//
		// hook and unhook into scene events...................................//
		this.Hook = function() {
			scene.SetInputMode(VBI.InputModeTrackDesign);

			scene.m_DesignVO = this;
		};

		this.UnHook = function(bApply) {
			if (scene.m_nInputMode == VBI.InputModeTrackDesign) {
				scene.SetInputMode(VBI.InputModeDefault);
			} else {
				jQuery.sap.log.error("Wrong InputMode in UnHook: " + scene.m_nInputMode);
			}

			this.m_PosMove = null;
			var strposarray = VBI.Types.vector2string(this.m_PosArray);

			var tmp = loaddata.replace(new RegExp(this.m_PlaceHolder, 'g'), strposarray);

			scene.m_DesignVO = null;
			scene.RenderAsync(true); // trigger async rendering...................//

			// do the callback when requested...................................//
			// we do not do a callback
			if (bApply && this.m_Func) {
				this.m_Func(tmp);
			}
		};

		// render..............................................................//
		this.Render = function(canvas, dc) {
			var xyz, linewidth = 1.0;

			if (!this.m_PosArray.length) {
				return;
			}

			// one burst convert to points......................................//
			// for all round world instances....................................//

			// determine the nearest position array.............................//
			// and the instance offsets.........................................//
			var bStrokeRequired = false;
			var aCompletePositions = this.m_PosArray.concat(this.m_PosMove);
			var apos = scene.GetNearestPosArray(aCompletePositions);
			var pointarray = scene.GetPointArrayFromPosArray(apos, false);

			dc.strokeStyle = "rgba( 255, 0, 20, 0.5 )";
			dc.lineWidth = linewidth;
			var sqdistance = linewidth * linewidth / 2;

			dc.beginPath();
			var tmp = [
				pointarray[0], pointarray[1]
			];
			dc.moveTo(pointarray[0], pointarray[1]); // move to start.......//
			for (var nJ = 0, tdx, tdy; nJ < pointarray.length / 3; ++nJ) {
				xyz = [
					pointarray[nJ * 3], pointarray[nJ * 3 + 1], 0.0
				];

				// when the distance is too small between projected points.......//
				// skip rendering................................................//
				if (((tdx = (tmp[0] - xyz[0])) * tdx + (tdy = (tmp[1] - xyz[1])) * tdy) < sqdistance) {
					continue;
				}

				// set flag that strokeis required...............................//
				bStrokeRequired = true;

				dc.lineTo(xyz[0], xyz[1]);
				tmp = xyz;
			}

			if (bStrokeRequired) {
				dc.stroke();
			}
		};

		this.Hook();
	};

// ........................................................................//
// do the event subscription...............................................//
	this.subscribe();
};

VBI.ThumbnailEvent = function(scene, ele) {
	"use strict";
	// device specific additional handlers....................................//
	this.m_DeviceHandlers = [];

	this.m_Events = [
		"click", "contextmenu"
	];
	if (sap.ui.Device.support.touch && !(sap.ui.Device.support.pointer && navigator.msMaxTouchPoints)) {
		var touchEvents = [
			"touchstart", "touchend", "touchmove"
		];

		if (!sap.ui.Device.system.desktop) { // no mouse and keyboard events for non-desktop
			this.m_Events = touchEvents;
		} else {
			this.m_Events = this.m_Events.concat(touchEvents);
		}
	}

// ........................................................................//
// subscribe and cleanup..................................................//

	this.clear = function() {
		// clear specific device handlers......................................//
		var nJ;
		for (nJ = 0; nJ < this.m_DeviceHandlers.length; ++nJ) {
			this.m_DeviceHandlers[nJ].clear();
		}
		this.m_DeviceHandlers = [];

		// unsubscribe events..................................................//
		for (nJ = 0; nJ < this.m_Events.length; ++nJ) {
			var name = "on" + this.m_Events[nJ];
			if (ele[name]) {
				ele[name] = null;
			}
		}
	};

	this.subscribe = function() {
		// unsubscribe events..................................................//
		var ae = this.m_Events;
		for (var nJ = 0, nLen = ae.length; nJ < nLen; ++nJ) {
			var handlername;
			// check for platform tags to skip them.............................//
			if (ae[nJ].slice(0, 2) == "ms") {
				handlername = "process" + ae[nJ].slice(2);
			} else {
				handlername = "process" + ae[nJ];
			}

			if (!scene[handlername]) {
				jQuery.sap.log.error("Handler " + handlername + " not defined");
			}

			ele["on" + ae[nJ]] = scene[handlername];
		}
	};

	scene.processclick = function(event) {
		if (VBI.m_bTrace) {
			VBI.Trace("thumbnail.processclick");
		}

		// check for map based event subscription........................//
		var action, actions = scene.m_Ctx.m_Actions;
		if (actions) {
			if ((action = actions.findAction("Click", scene, "Thumbnail"))) {
				scene.m_Ctx.FireAction(action, scene, "Thumbnail", null, scene.GetEventVPCoordsObj(event));
			}
			event.preventDefault(); // the event is handled
		}
	};

	scene.processcontextmenu = function(event) {
		if (VBI.m_bTrace) {
			VBI.Trace("thumbnail.processcontextMenu");
		}

		// check for map based event subscription........................//
		var action, actions = scene.m_Ctx.m_Actions;
		if (actions) {
			if ((action = actions.findAction("ContextMenu", scene, "Thumbnail"))) {
				scene.m_Ctx.FireAction(action, scene, "Thumbnail", null, scene.GetEventVPCoordsObj(event));
			}
			event.preventDefault(); // the event is handled
		}
	};

	scene.onPseudoThumbRightClick = function(event, touch) {
		if (VBI.m_bTrace) {
			VBI.Trace("Pseudo Right Click");
		}
		var action;
		if ((action = scene.m_Ctx.m_Actions.findAction("ContextMenu", scene, "Thumbnail"))) {
			scene.m_Touches = [];
			var rect = scene.GetInternalDivClientRect();
			scene.m_Ctx.FireAction(action, scene, "Thumbnail", null, {
				x: touch.clientX - rect.left,
				y: touch.clientY - rect.top,
				scene: scene.m_ID
			});
		}
	};

	scene.RestartThumbnailCMTimer = function(event, touch, delay) {
		if (scene.m_ContextMenuTimer) {
			window.clearInterval(scene.m_ContextMenuTimer);
		}
		scene.m_ContextMenuTimer = window.setInterval(function() {
			window.clearInterval(scene.m_ContextMenuTimer);
			scene.m_ContextMenuTimer = null;
			scene.onPseudoThumbRightClick(event, touch);
		}, delay);
	};

	scene.processtouchstart = function(e) {
		var bHandled = true; // ??

		if (VBI.m_bTrace) {
			VBI.Trace("processtouchstart");
		}

		// store the touch event...............................................//
		scene.m_Touches.push(e);

		if (e.touches.length == 1) {

			var touch = e.touches[0];
			scene.m_currentMouseX = touch.clientX;
			scene.m_currentMouseY = touch.clientY;

			scene.RestartThumbnailCMTimer(e, touch, 700);
			bHandled = true;
		}

		if (bHandled) {
			e.preventDefault();
			e.stopPropagation();
			return false;
		}
	};

	scene.IsSingleTapOnThumb = function(events) {
		if (events.length != 2) {
			return null;
		}

		var idxStart = events.length - 2;
		var idxEnd = events.length - 1;
		// the previous event has to be a touchstart...........................//
		if (events[idxStart].type != "touchstart" || events[idxStart].touches.length != 1) {
			return null;
		}
		if (events[idxEnd].type != "touchend") {
			return null;
		}
		var retVal = [
			events[idxStart].touches[0].clientX, events[idxStart].touches[0].clientY
		];
		retVal.timeTouchDown = events[idxEnd].timeStamp - events[idxStart].timeStamp;

		// delivers client coordinates.........................................//
		return retVal;
	};

	scene.processtouchend = function(e) {
		if (!scene.m_Touches.length) {
			return; // pseudo right click was triggered, no further processing on touch up
		}

		if (VBI.m_bTrace) {
			VBI.Trace("touchend");
		}

		window.clearInterval(scene.m_ContextMenuTimer);
		scene.m_ContextMenuTimer = null;

		// store the touch events..............................................//
		scene.m_Touches.push(e);

		var xy, action, actions = scene.m_Ctx.m_Actions;
		if ((xy = scene.IsSingleTapOnThumb(scene.m_Touches)) && actions) {
			if ((action = actions.findAction("Click", scene, "Thumbnail"))) {
				var rect = scene.GetInternalDivClientRect();
				scene.m_Ctx.FireAction(action, scene, "Thumbnail", null, {
					x: xy[0] - rect.left,
					y: xy[1] - rect.top
				});
			}
		}
		scene.m_Touches = [];

		e.stopPropagation();
		e.preventDefault();
	};

	// ........................................................................//
	// do the event subscription..............................................//

	this.subscribe();
};
