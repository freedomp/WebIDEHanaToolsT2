sap.ui.define(
	[
		"sap/ui/dt/plugin/ControlDragDrop",
		"sap/ui/dt/ElementUtil"
	],
	function (ControlDragDrop, ElementUtil) {
		"use strict";

// Private variables and methods
// Begin

		/**
		 * calculates the distance between given overlay and mouse location.
		 * @param {sap.ui.dt.ElementOverlay} oOverlay
		 * @param {{originalEvent: Event}} oEvent
		 */
		function calculateDistance(oOverlay, oEvent) {
			var $overlay = oOverlay.$();
			var oOffset = $overlay.offset();
			var iClientX = oEvent.originalEvent.clientX;
			var iClientY = oEvent.originalEvent.clientY;
			var iLeft = oOffset.left, iTop = oOffset.top;
			var iRight = iLeft + $overlay.width(), iBottom = iTop + $overlay.height();
			// "clamp" the point into rectangle and then compute the distance from clamped point
			var cx = Math.max(Math.min(iClientX, iRight), iLeft);
			var cy = Math.max(Math.min(iClientY, iBottom), iTop);
			return Math.sqrt((iClientX - cx) * (iClientX - cx) + (iClientY - cy) * (iClientY - cy));
		}

		/**
		 * finds the overlay from the given aggregation children that is closest to the mouse location.
		 * @param {sap.ui.dt.AggregationOverlay} oAggregationOverlay
		 * @param {{originalEvent: Event}} oEvent
		 * @return {sap.ui.dt.ElementOverlay}
		 */
		function findClosestChild(oAggregationOverlay, oEvent) {
			var /** Array<sap.ui.dt.ElementOverlay> */ aChildren = oAggregationOverlay.getChildren();
			var oClosestOverlay = null;
			var fClosestDistance = Infinity;
			aChildren.forEach(function (oOverlay) {
				var fDistance = calculateDistance(oOverlay, oEvent);
				if (fDistance < fClosestDistance) {
					fClosestDistance = fDistance;
					oClosestOverlay = oOverlay;
				}
			});
			return oClosestOverlay;
		}

		/**
		 * @param {number} i
		 * @return {number}
		 */
		function grid(i) {
			return Math.floor(i / 4);
		}

		/**
		 * Checks whether oParentOverlay is an ancestor or equal to oOverlay
		 * @param {sap.ui.dt.ElementOverlay} oParentOverlay
		 * @param {sap.ui.dt.ElementOverlay} oOverlay
		 * @return {boolean}
		 */
		function isAncestorOf(oParentOverlay, oOverlay) {
			if (oParentOverlay === oOverlay) {
				return true;
			}
			if (!oOverlay) {
				return false;
			}
			return isAncestorOf(oParentOverlay, oOverlay.getParent());
		}
// End
// Private variables and methods

		/**
		 * Constructor for a new W5gDragDrop.
		 *
		 * @param {string} [sId] id for the new object, generated automatically if no id is given
		 * @param {object} [mSettings] initial settings for the new object
		 *
		 * @class
		 * The BaseDragDrop enables D&D functionality for the overlays based on aggregation types on the layout editor
		 * @extends sap.ui.dt.plugin.ControlDragDrop
		 *
		 */
		var BaseDragDrop = ControlDragDrop.extend("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.dtplugins.BaseDragDrop",
			/** @lends sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.dtplugins.BaseDragDrop.prototype */ {
			metadata: {
				library: "sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.dtplugins",
				properties: {
					editor: {type: "object"}
				}
			}
		});

		/**
		 * @override
		 */
		BaseDragDrop.prototype.onDragEnter = function (oTargetOverlay, oEvent) {
			// Do nothing. Reposition is done on drag over instead
		};

		/**
		 * check if drag onto canvas or outside
		 * @return {boolean}
		 */
		BaseDragDrop.prototype.onAggregationDrop = function () {
			this._bDroppedOnCanvas = true;
		};

		/**
		 * @override
		 */
		BaseDragDrop.prototype.onDragEnd = function (oOverlay, oEvent) {
			ControlDragDrop.prototype.onDragEnd.apply(this, arguments);
			if(this._bDroppedOnCanvas) {
				delete this._bDroppedOnCanvas;
				this.getEditor().selectUI5Control(oOverlay.getElementInstance()).done();
			}
		};

		/**
		 * @override
		 */
		BaseDragDrop.prototype.onAggregationDragEnter = function (oAggregationOverlay, oEvent) {
			// Do nothing. Reposition is done on drag over instead
		};

		/**
		 * check if the mouse has moved since last event in order to reduce flickering.
		 * mouse is considered on the same position if it stays in the same imaginary 4x4 grid.
		 * @param {{originalEvent: Event}} oEvent
		 * @return {boolean}
		 */
		BaseDragDrop.prototype.hasMouseMovedSinceLastEvent = function (oEvent) {
			var clientX = oEvent.originalEvent.clientX;
			var clientY = oEvent.originalEvent.clientY;
			if (grid(this._iClientX) === grid(clientX) && grid(this._iClientY) === grid(clientY)) {
				return false;
			} else {
				this._iClientX = clientX;
				this._iClientY = clientY;
				return true;
			}
		};

		/**
		 * before trying to reposition something on the view again, some time should pass
		 * @return {boolean}
		 */
		BaseDragDrop.prototype.isNoneFlickeringIntervalPassed = function () {
			this._iLastResponseTimestamp = this._iLastResponseTimestamp || 0;
			var iNow = Date.now();
			if (iNow - this._iLastResponseTimestamp > 300) {
				this._iLastResponseTimestamp = iNow;
				return true;
			}
			return false;
		};

		/**
		 * @param {sap.ui.dt.ElementOverlay} oTargetOverlay
		 * @param {{originalEvent: Event}} oEvent
		 * @override
		 */
		BaseDragDrop.prototype.onDragOver = function (oTargetOverlay, oEvent) {
			if (this.isNoneFlickeringIntervalPassed() && this._oPreviousTarget !== oTargetOverlay) {
				if (this.hasMouseMovedSinceLastEvent(oEvent) && !isAncestorOf(this.getDraggedOverlay(), oTargetOverlay)) {
					this._repositionOn(oTargetOverlay);
				}
				this._oPreviousTarget = oTargetOverlay;
			}
		};

		/**
		 * @param {sap.ui.dt.AggregationOverlay} oAggregationOverlay
		 * @param {{originalEvent: Event}} oEvent
		 * @override
		 */
		BaseDragDrop.prototype.onAggregationDragOver = function (oAggregationOverlay, oEvent) {
			this._oPreviousTarget = null;
			if (this.isNoneFlickeringIntervalPassed() && this.hasMouseMovedSinceLastEvent(oEvent)) {
				var oDraggedOverlay = this.getDraggedOverlay();
				if (oAggregationOverlay !== oDraggedOverlay.getParentAggregationOverlay() && !isAncestorOf(oDraggedOverlay, oAggregationOverlay.getParent())) {
					if (oAggregationOverlay.getChildren().length === 0) {
						return this._repositionAsLastChildOf(oAggregationOverlay);
					}
					var oClosestChildOverlay = findClosestChild(oAggregationOverlay, oEvent),
						$closestChildOverlay = oClosestChildOverlay.$(),
						iClosestRight = $closestChildOverlay.offset().left + $closestChildOverlay.width(),
						iClosestBottom = $closestChildOverlay.offset().top + $closestChildOverlay.height();
					this._repositionAsSiblingOf(oClosestChildOverlay, oEvent.originalEvent.clientX < iClosestRight && oEvent.originalEvent.clientY < iClosestBottom);
				}
			}
		};

		/**
		 * places the dragged control as last child of the given aggregation overlay
		 * @param {sap.ui.dt.AggregationOverlay} oAggregationOverlay
		 * @private
		 */
		BaseDragDrop.prototype._repositionAsLastChildOf = function (oAggregationOverlay) {
			var oTargetParentElement = oAggregationOverlay.getElementInstance();
			var oDraggedElement = this.getDraggedOverlay().getElementInstance();
			var sAggregationName = oAggregationOverlay.getAggregationName();
			ElementUtil.addAggregation(oTargetParentElement, sAggregationName, oDraggedElement);
			this.onControlAdded(oTargetParentElement, sAggregationName);
		};

		/**
		 * places the dragged control as sibling of the given target control before or after according to indicator
		 * @param {sap.ui.dt.ElementOverlay} oTargetOverlay
		 * @param {boolean} bIsBefore
		 * @private
		 */
		BaseDragDrop.prototype._repositionAsSiblingOf = function (oTargetOverlay, bIsBefore) {
			var oDraggedElement = this.getDraggedOverlay().getElementInstance();

			var oTargetElement = oTargetOverlay.getElementInstance();
			var oPublicParent = oTargetOverlay.getParentElementOverlay().getElementInstance();
			var sPublicParentAggregationName = oTargetOverlay.getParentAggregationOverlay().getAggregationName();

			var aChildren = ElementUtil.getAggregation(oPublicParent, sPublicParentAggregationName);
			var iIndexOfTarget = aChildren.indexOf(oTargetElement);
			if (iIndexOfTarget === -1) {
				return;
			}
			var iIndexOfDragged = aChildren.indexOf(oDraggedElement);
			if (iIndexOfDragged !== -1 && iIndexOfDragged < iIndexOfTarget) {
				iIndexOfTarget--;
			}
			if (!bIsBefore) {
				iIndexOfTarget++;
			}

			ElementUtil.insertAggregation(oPublicParent, sPublicParentAggregationName, oDraggedElement, iIndexOfTarget);
			this.onControlAdded(oPublicParent, sPublicParentAggregationName);
		};

		/**
		 * override method in order to add call to onControlAdded hook
		 * @param {sap.ui.dt.ElementOverlay} oTargetOverlay
		 * @private
		 * @override
		 */
		BaseDragDrop.prototype._repositionOn = function (oTargetOverlay) {
			ControlDragDrop.prototype._repositionOn.apply(this, arguments);
			if (oTargetOverlay.getParentElementOverlay()) {
				this.onControlAdded(oTargetOverlay.getParentElementOverlay().getElementInstance(),
					oTargetOverlay.getParentAggregationOverlay().getAggregationName());
			}
		};

		//noinspection Eslint
		/**
		 * Hook for listening on the event of element added to some aggregation while drag
		 * @param {sap.ui.core.Control} oPublicParent
		 * @param {string} sPublicParentAggregationName
		 */
		BaseDragDrop.prototype.onControlAdded = function (oPublicParent, sPublicParentAggregationName) {
		};

		return BaseDragDrop;
	}, 
	/* bExport= */ true
);
