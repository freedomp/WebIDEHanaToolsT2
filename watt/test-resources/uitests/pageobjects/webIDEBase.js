sap.ui.define(["sap/ui/test/Opa5", "sap/ui/qunit/QUnitUtils", "sap/ui/test/opaQunit"], function(Opa5, qunitUtils){
	"use strict";

	var WebIDEBase = function() {
		var oBase = {
			constructor : function() {
				Opa5.apply(this, arguments);
			},

			getWindow: function () {
				return Opa5.getWindow();
			},

			byId : function (sId) {
				return Opa5.getWindow().sap.ui.getCore().byId(sId);
			},

			isOnScreen : function(oControlOrEl) {
				var $el = _getJQueryObject(oControlOrEl);
				if (!$el.length) {
					return false;
				}

				var oDocument = $el[0].ownerDocument;
				if (!oDocument) {
					return false;
				}

				var oCornerCoordinates = _getNECornerCoordinates($el);
				return Boolean(oDocument.elementFromPoint(
					oCornerCoordinates.left,
					oCornerCoordinates.top)
				);
			},

			// returns iframe instance, if element is in iframe, returns false otherwise
			getOwnerIFrame : function(oElement) {
				var IFrame;
				this.getWindow().$("iframe").each(function(i, oIframe) {
					if (oIframe.contentWindow.document === oElement.ownerDocument) {
						IFrame = oIframe;
						return false;
					}
				});
				return IFrame;
			},

			/**
			 * Write log message
			 * @param  {string} sMessage Message
			 * @return {object} 'this'
			 */
			writeLogMessage : function( sMessage ) {
				return this.waitFor( {
					success : function() {
						ok( true, "***** " + sMessage + " *****");
					}
				} );
			},

			simulate : {
				click : function(oControlOrEl) {
					var oElement = this._mouseEvent("focus", oControlOrEl);
					oElement.focus();
					this._mouseEvent("click", oControlOrEl);
				},

				doubleClick : function(oControlOrEl) {
					this._mouseEvent("dblclick", oControlOrEl);
				},

				rightClick : function(oControlOrEl) {
					this._mouseEvent("contextmenu", oControlOrEl);
				},

				mouseover : function(oControlOrEl) {
					this._mouseEvent("mouseover", oControlOrEl);
				},

				mouseout : function(oControlOrEl) {
					this._mouseEvent("mouseout", oControlOrEl);
				},
				
				mouseWheelScrollElementBy : function($el, iScrollByPixel) {
					$el[0].dispatchEvent(new WheelEvent("wheel", {wheelDeltaY:iScrollByPixel}))
				},

				typeInto : function (oTextInputControlOrEl, sText) {
					var $el = _getJQueryObject(oTextInputControlOrEl);
					if (!$el.length) {
						console.error("simulate.typeInto : You are trying to type into element, that is not represented in DOM  : ", oTextInputControlOrEl);
					}
					for (var i = 0; i < sText.length; i++) {
						var sChar = sText[i];
						sap.ui.test.qunit.triggerCharacterInput($el[0], sChar);

						var sCurrentValue = $el.val();
						if (oTextInputControlOrEl.fireLiveChange) {
							oTextInputControlOrEl.fireLiveChange({
								"liveValue": sCurrentValue
							});
						}

					}
					// TODO : find a better way to update the value of an UI5 TextField
					if (oTextInputControlOrEl._checkChange) {
						oTextInputControlOrEl._checkChange();
					}
				},

				// sKey in upper case, some predefined keys, like "DELETE" are in jQuery.sap.KeyCodes
				press : function(sKey, oOpts) {
					oOpts = oOpts || {};
					this._keyEvent(oOpts.target, sKey, oOpts.withShift, oOpts.withAlt, oOpts.withCtrl);
				},

				// drag oParams.source to oParams.target
				// 	if exist oParams.draggable, drags it to oParams.target from source
				//  if no oParams.target defined, just init dragging in place for oParams.source
				//  if defined, oParams.dragEvent will be used as a trigger "drag" parameter
				// oParams.left and .top to d&d with some offset
				// returns $draggable element to continue d&d with
				drag : function(oParams) {
					return this._dnd("drag", oParams);
				},

				// drag oParams.source to oParams.target and drops it there
				//  if exist oParams.draggable, drag&drops it to oParams.target from source
				dragndrop : function(oParams) {
					return this._dnd("dragndrop", oParams);
				},

				// drops oParams.draggable at oParams.target
				drop : function(oParams) {
					return this._dnd("drop", oParams);
				},

				// resize element (must be a resizable widget) on oSizeChange.x and oSizeChange.y
				resize : function(oControlOrEl, oSizeChange) {
					var sAxis = ""; // axis are n (nord) e (east) s (south) w (west) ne nw se sw

					if (oSizeChange.y) {
						sAxis += "s";
					}

					if (oSizeChange.x) {
						sAxis += "e";
					}

					var $el = _getJQueryObject(oControlOrEl);

					// set resize internal direction
					$el.data("ui-resizable").axis = sAxis;
					var $resizeHandler = $el.find(".ui-resizable-handle.ui-resizable-" + sAxis);

					this._mouseEvent("mousedown", $resizeHandler, {
						element : $resizeHandler,
						x : 0
					});

					for (var x = 0; x < oSizeChange.x; x++) {
						this._mouseEvent("mousemove", $resizeHandler, {
							element : $resizeHandler,
							x : 1
						});
					}

					for (var y = 0; y < oSizeChange.y; y++) {
						this._mouseEvent("mousemove", $resizeHandler, {
							element : $resizeHandler,
							y : 1
						});
					}

					this._mouseEvent("mouseup", $resizeHandler, {
						element : $resizeHandler
					});

					$el.data("ui-resizable").axis = undefined;

				},

				_ensureDomIsInJQueryObject : function($el, oElement, sEvtName) {
					if (!$el.filter(oElement).length && !$el.find(oElement).length) {
						console.error("simulate." + sEvtName + " : Target element is not visible because it's behind some other element or modal window : ", $el);
					}
				},

				_event : function(sEvtType, sEvtName, oControlOrEl, fnPrepareEvent) {
					var $el,
						oDocument,
						oElement;
					if (oControlOrEl) {
						$el = _getJQueryObject(oControlOrEl);
						if (!$el.length) {
							console.error("simulate." + sEvtName + " : Target element is not represented in DOM  : ", oControlOrEl);
						}
						oDocument = $el[0].ownerDocument;
						var oCornerCoordinates = _getNECornerCoordinates($el);
						oElement = oDocument.elementFromPoint(oCornerCoordinates.left, oCornerCoordinates.top);
						this._ensureDomIsInJQueryObject($el, oElement, sEvtName);
					} else {
						oDocument = oBase.getWindow().document;
					}

					if (!oDocument) {
						console.error("simulate." + sEvtName + " : Target element is not represented in DOM  : ", $el[0]);
					}

					var oEvent = oDocument.createEvent(sEvtType);

					fnPrepareEvent.call(this, oEvent, oElement, oCornerCoordinates);

					if (oElement) {
						oElement.dispatchEvent(oEvent);
					} else {
						oDocument.dispatchEvent(oEvent);
					}

					return oElement;
				},

				_mouseEvent : function(sEvtName, oControlOrEl, oParams) {
					oParams = oParams || {};
					oParams.x = oParams.x || 0;
					oParams.y = oParams.y || 0;

					return this._event("MouseEvent", sEvtName, oControlOrEl, function prepareMouseEvent(oEvent, oElement, oCornerCoordinates ){

						if (!oElement) {
							console.error("simulate." + sEvtName + " : You are trying to click an element, that is out of screen: ", oElement);
						}

						// mouse codes for mouse events
						var LEFT_MOUSE_BUTTON = 0,
							RIGHT_MOUSE_BUTTON = 2;

						// by default all events with left mouse button
						var iButtonCode = LEFT_MOUSE_BUTTON;
						// events with right mouse button in array
						if ($.inArray(sEvtName, ["contextmenu"]) !== -1) {
							iButtonCode = RIGHT_MOUSE_BUTTON;
						}

						oEvent.initMouseEvent(
							sEvtName,
							true /* bubble */, true /* cancelable */,
							window, null,
							oCornerCoordinates.left + oParams.x, oCornerCoordinates.top + oParams.y, /* screen coordinates */
							oCornerCoordinates.left + oParams.x, oCornerCoordinates.top + oParams.y, /* client coordinates */
							false, false, false, false, /* modifier keys */
							iButtonCode, null
						);
					});

				},

				_keyEvent : function(oControlOrEl, sKey, bShiftKey, bAltKey, bCtrlKey) {
					this._event("CustomEvent", "keydown", oControlOrEl, function prepareKeyEvent(oEvent){
						oEvent.initEvent("keydown", true, true);

						oEvent.keyCode = jQuery.sap.KeyCodes[sKey];
						oEvent.which = oEvent.keyCode;
						oEvent.shiftKey = bShiftKey;
						oEvent.altKey = bAltKey;
						oEvent.metaKey = bCtrlKey;
						oEvent.ctrlKey = bCtrlKey;
					});

				},

				/** its special drag&drop simulaton for webIDE, draggable.js-compatible and works both for element inside webIDE and W5G canvas
				 *
				 * 		events fired on a draged element
				 *		- dragstart
				 *		- drag
				 *		- dragend
				 *
				 *		events fired on a drop target
				 *		- dragenter
				 *		- dragover
				 *		- dragleave
				 *		- drop
				 *
				 * - Parameters:
				 * sEventName "drag", "dragndrop" or "drop"
				 * oSrcControlOrEl control or element to drag (or draggable to drop, if sEventName is "drop")
				 * oTargetControlOrEl control or element to drop a graggable at (if null, will be same as source)
				 * oParams.left and oParams.top if you want to drop with an offset
				 */
				_dnd : function(sEventName, oParams) {

					var $draggable = oParams.draggable,
						oSrcControlOrEl = oParams.source || $draggable,
						oTargetControlOrEl = oParams.target,
						oSrc, oTarget;

					var $srcEl = _getJQueryObject(oSrcControlOrEl);
					var oSrcOffset = $srcEl.offset();
					oSrc = {
						x : oSrcOffset.left,
						y : oSrcOffset.top,
						ownerDocument : $srcEl[0].ownerDocument
					};

					if (oTargetControlOrEl) {
						var $targetEl = _getJQueryObject(oTargetControlOrEl);
						var oTargetOffset = $targetEl.offset();
						oTarget = {
							x : oTargetOffset.left + oParams.left || 0,
							y : oTargetOffset.top + oParams.top || 0,
							ownerDocument : $targetEl[0].ownerDocument
						};
					}

					if (sEventName === "drag" || sEventName === "dragndrop") {
						if (!$draggable) {
							$draggable = this._grab(oSrc);
						}
						this._drag($draggable, oSrc, oTarget, oParams.dragEvent);
						if (sEventName === "drag") {
							return $draggable;
						}
					}
					if (sEventName === "dragndrop" ||sEventName === "drop") {
						this._drop($draggable, oTarget);
					}

				},

				_grab : function(oSrc) {
					var oDraggable = oSrc.ownerDocument.elementFromPoint(oSrc.x, oSrc.y);
					if (!oDraggable) {
						console.error("No element at dragstart position in ", oSrc.x, oSrc.y, oSrc.ownerDocument);
					}
					// wrap an element in base window's jquery because d&d events for graggables is bound there
					return _getJQueryObject(oDraggable, oBase.getWindow()).trigger("dragstart");
				},

				_drag : function($draggable, oSrc, oTarget, oDragEvent) {
					// Bresenham algorithm to get all pixels between to given pixels
					var move = function(oSrc, oTarget, fnCallback) {
						var x0 = oSrc.x,
							y0 = oSrc.y,
							x1 = oTarget.x,
							y1 = oTarget.y,
							dx = Math.abs(x1-x0),
							dy = Math.abs(y1-y0),
							sx = (x0 < x1) ? 1 : -1,
							sy = (y0 < y1) ? 1 : -1,
							err = dx - dy;

						while(true) {
							// calling our function on each point between src and target
							fnCallback(x0, y0);

							if ( (Math.abs(x0 - x1) < 1) && (Math.abs(y0 - y1) < 1) ) {
								break;
							}
							var e2 = 2*err;
							if (e2 > -dy) {
								err -= dy;
								x0  += sx;
							}
							if (e2 < dx) {
								err += dx;
								y0  += sy;
							}
						}

						fnCallback(x1, y1);
					};

					// if element is in IFrame, convert to a opa frame coordinates
					var convertToBaseCoordinates = function(oElement) {
						var oBaseWindow = oBase.getWindow();
						if (oElement.ownerDocument !== oBaseWindow.document) {
							var oIFrame = oBase.getOwnerIFrame(oElement);
							if (oIFrame) {
								var iFrameOffset = $(oIFrame).offset();
								return {
									ownerDocument : oBaseWindow.document,
									x : oElement.x + iFrameOffset.left,
									y : oElement.y + iFrameOffset.top
								};
							} else {
								console.error("Target element ", oElement, " is not part of W5G canvas or base webIDE window");
							}
						}
						return oElement;
					};

					oTarget = oTarget || oSrc;
					var $prevTarget,
					// take care about the coordinates diference if oSrc and oTarget are in different windows
						oBasedSrc = convertToBaseCoordinates(oSrc),
						oBasedTarget = convertToBaseCoordinates(oTarget);

					move(oBasedSrc, oBasedTarget, function(x, y) {

						var oDocument = oBasedSrc.ownerDocument;

						var oCurrentTarget = oDocument.elementFromPoint(x, y);
						// if target has content window then it's an iframe
						if (oCurrentTarget.contentWindow) {
							var oFrameOffset = _getJQueryObject(oCurrentTarget).offset();
							// replace target with iFrame element in this position
							oCurrentTarget = oCurrentTarget.contentDocument.elementFromPoint(
								x - oFrameOffset.left,
								y - oFrameOffset.top
							);
						}
						if (!oCurrentTarget) {
							console.error("No element in position ", x, y);
						}
						var $currentTarget = _getJQueryObject(oCurrentTarget);

						if (!$prevTarget || ($currentTarget[0] !== $prevTarget[0])) {
							if ($prevTarget) {
								$prevTarget.trigger("dragleave", $draggable);
							}
							$currentTarget.trigger("dragenter", $draggable);
							$prevTarget = $currentTarget;
						}

						var oEvent =  jQuery.Event("drag", oDragEvent);
						$draggable.trigger(oEvent);

						$currentTarget.trigger("dragover", $draggable);
					});
				},

				_drop : function($draggable, oTarget) {

					var oDroptarget = oTarget.ownerDocument.elementFromPoint(oTarget.x, oTarget.y);
					if (!oDroptarget) {
						console.error("No element at dragend position in ", oTarget.ownerDocument);
					}
					_getJQueryObject(oDroptarget).trigger("drop", $draggable);
					$draggable.trigger("dragend");
				}
			},

			_isMobileControl : function (oControl) {
				//could be more soffisticated
				return oControl.getMetadata().getName().indexOf("sap.m") !== -1;
			},

			//Add general Util functionality for every page object
			waitForExec : function(ofunc, errorMessage, iTimeout){
				var oPromise;
				return this.waitFor({
					check : function () {
						if (!oPromise){
							oPromise = Q(ofunc.apply(this));
							oPromise.done();
						}
						return oPromise.isFulfilled();
					},
					errorMessage : errorMessage,
					timeout : iTimeout || 90
				});
			}
		};

		// returns jquery object, wrapped in jquery instance from element's window
		var _getJQueryObject = function(oControlOrEl, oWrapWindow) {
			var oElement;

			// if UI5 control or has same structure
			if (oControlOrEl && oControlOrEl.getDomRef) {
				oElement = oControlOrEl.getDomRef();

			// if already a jQuery Object (duck typing)
			} else if (oControlOrEl && oControlOrEl.jquery && oControlOrEl.unwrap) {
				oElement = oControlOrEl[0];

			// otherwise must be already an element
			} else {
				oElement = oControlOrEl;
			}

			// wrap in jQuery Object, iframe elements are wrapped in an webIDE base jQuery
			if (oElement.ownerDocument && !oWrapWindow) {
				var oDocument = oElement.ownerDocument;
				var oWindow = oDocument.defaultView || oDocument.parentWindow;
				return oWindow.$(oElement);
			} else if (oWrapWindow) {
				return oWrapWindow.$(oElement);
			} else {
				return oBase.getWindow().$(oElement);
			}
		};

		// north-east corner coordinates (left-top corner)
		var _getNECornerCoordinates = function($el) {
			var oOffset = $el.offset();
			return {
				left : Math.ceil(oOffset.left),
				top : Math.ceil(oOffset.top)
			};
		};

		return oBase;
	};

	return Opa5.extend("sap.watt.opa.base", WebIDEBase());
});