define(function () {
	"use strict";

	/**
	 * This listener is responsible for going over the overlays that overlap with their parent aggregation
	 * (same left or top position) and shrink them so that the user can drag his element into the gap.
	 * This is done by giving them .wysiwygShrink class which use scale transform.
	 * @param {sap.ui.dt.Plugin} oDragDropPlugin
	 */
	var OverlappingOverlaysShrinkListener = function (oDragDropPlugin) {
		this._oDragDropPlugin = oDragDropPlugin;
		/**
		 * @type {Array<sap.ui.core.Element>}
		 * @private
		 */
		this._aSrinkedElements = [];
	};


	OverlappingOverlaysShrinkListener.prototype.onDragStart = function () {
		var that = this;
		this._oDragDropPlugin._iterateAllAggregations(function (oAggregationOverlay) {
			if (oAggregationOverlay.isDroppable()) {
				var oParentOverlay = oAggregationOverlay.getParent();
				var oParentAggregationOverlay = oParentOverlay.getParentAggregationOverlay();
				var $aggregationOverlay = oAggregationOverlay.$();
				if (oParentAggregationOverlay && oParentAggregationOverlay.isDroppable()
					&& $aggregationOverlay.width() > 0 && $aggregationOverlay.height() > 0) {
					var oElement = oParentOverlay.getElementInstance();
					oElement.addStyleClass("wysiwygShrink");
					that._aSrinkedElements.push(oElement);
				}
			}
		});
	};

	OverlappingOverlaysShrinkListener.prototype.onDragEnd = function () {
		this._aSrinkedElements.forEach(function (/** sap.ui.core.Element */ oElement) {
			oElement.removeStyleClass("wysiwygShrink");
		});
		this._aSrinkedElements = [];
	};

	return OverlappingOverlaysShrinkListener;
});

