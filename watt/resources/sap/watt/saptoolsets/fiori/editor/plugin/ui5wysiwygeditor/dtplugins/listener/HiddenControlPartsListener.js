define(
	[
		"../../utils/ControlMetadata"
	],
	function (ControlMetadata) {
		"use strict";

		var HiddenControlPartsListener = function (oDragDropPlugin) {
			this._oDragDropPlugin = oDragDropPlugin;

			/**
			 * @type {Array<function>}
			 * @private
			 */
			this._aOnDragEndHandlers = [];
		};

		HiddenControlPartsListener.prototype.onDragStart = function () {
			var that = this,
				oDropAreaControl, fnShowInvisibleParts, aDragEndHandler;
			this._oDragDropPlugin._iterateAllAggregations(function (oAggregationOverlay) {
				if (oAggregationOverlay.isDroppable()) {
					oDropAreaControl = oAggregationOverlay.getElementInstance();
					fnShowInvisibleParts = ControlMetadata.getAggregationsAdapterFunction(
						oDropAreaControl,
						oAggregationOverlay.getAggregationName(),
						"showInvisibleParts"
					);
					if (fnShowInvisibleParts) {
						aDragEndHandler = fnShowInvisibleParts.call(oDropAreaControl);
						if (aDragEndHandler.length) {
							that._aOnDragEndHandlers = that._aOnDragEndHandlers.concat(aDragEndHandler);
						}
					}
				}
			});
		};

		HiddenControlPartsListener.prototype.onDragEnd = function () {
			this._aOnDragEndHandlers.forEach(function (fnHandler) {
				fnHandler();
			});
			this._aOnDragEndHandlers = [];
		};

		return HiddenControlPartsListener;
	}
);
