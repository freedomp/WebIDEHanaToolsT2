define(
	[
		"../../utils/W5gUtils"
	],
	function (W5gUtils) {
		"use strict";

		var XMLAdaptListener = function (oXMLManipulator, oWindow) {
			this._oXMLManipulator = oXMLManipulator;
			this._oWindow = oWindow;

			/**
			 * holds state of designtime to go back to in case of drag abort
			 *
			 * control: {sap.ui.core.Control}
			 * parent: {sap.ui.core.Control}
			 * aggregation: {string}
			 * index: {integer}
			 * multiple: {boolean}
			 *
			 */
			this._oInitialState = null;
		};

		XMLAdaptListener.prototype.onDragStart = function (oOverlay) {
			this._oSourceDraggedOverlayContainer = oOverlay.getParentElementOverlay(); // find origin of control
			if (this._oSourceDraggedOverlayContainer) { //drag has a source... it was dragged from canvas

				var oDraggedControl = oOverlay.getElementInstance();
				var oParentInfo = W5gUtils.getWYSIWYGParentAggregationInfo(oDraggedControl, this._oWindow);
				var oAggregationMetadata = oParentInfo.parent.getMetadata().getAggregation(oParentInfo.aggregationName);
				var bMultiple = oAggregationMetadata.multiple;
				var iIndex = bMultiple ? oParentInfo.parent[oAggregationMetadata._sGetter]().indexOf(oDraggedControl): 0;

				this._oInitialState = {
					control: oDraggedControl,
					parent: oParentInfo.parent,
					aggregation: oParentInfo.aggregationName,
					index: iIndex,
					multiple: bMultiple
				};
			}
		};

		XMLAdaptListener.prototype.onAggregationDrop = function() {
			this._bDroppedOnCanvas = true;
		};

		XMLAdaptListener.prototype.onCanvasDrop = XMLAdaptListener.prototype.onAggregationDrop;

		XMLAdaptListener.prototype.onDragEnd = function (oOverlay) {
			var oDraggedControl = oOverlay.getElementInstance();
			var oParentAggregationOverlay = oOverlay.getParentAggregationOverlay();

			if (!this._bDroppedOnCanvas) { //control is dropped outside the canvas
				if (this._oSourceDraggedOverlayContainer){ //drag has a source... it was dragged from canvas
					if (this._oInitialState.multiple) {
						this._oWindow.sap.ui.dt.ElementUtil.insertAggregation(this._oInitialState.parent, this._oInitialState.aggregation, this._oInitialState.control, this._oInitialState.index);
					} else {
						this._oWindow.sap.ui.dt.ElementUtil.addAggregation(this._oInitialState.parent, this._oInitialState.aggregation, this._oInitialState.control);
					}
				} else { //drag has no source... it was dragged from palette... we should remove the control that was just created
					W5gUtils.destroyControl(oDraggedControl);
				}
			} else if (oParentAggregationOverlay) { //There is a parent aggregation to drop to
				var sTargetAggregation = oOverlay.getParentAggregationOverlay().getAggregationName();
				var sTargetId = oOverlay.getParentElementOverlay().getElementInstance().sId;
				var aElements = this._oWindow.sap.ui.dt.ElementUtil.getAggregation(oOverlay.getParentElementOverlay().getElementInstance(), sTargetAggregation);
				var iTargetIndex = aElements.indexOf(oDraggedControl);
				if (this._oSourceDraggedOverlayContainer) {
					var sSourceId = this._oSourceDraggedOverlayContainer.getElementInstance().sId;
					this._oXMLManipulator.emitMoveEvent(oDraggedControl, sTargetAggregation, sSourceId, sTargetId, iTargetIndex);
				} else {
					this._oXMLManipulator.emitAddEvent(oDraggedControl, sTargetAggregation, sTargetId, iTargetIndex);
				}
			}
			delete this._oSourceDraggedOverlayContainer;
			delete this._bDroppedOnCanvas;
		};

		return XMLAdaptListener;
	}
);

