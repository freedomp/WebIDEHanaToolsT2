sap.ui.define(
	[
		"./BaseDragDrop"
	],
	function (BaseDragDrop) {
		"use strict";

// Private variables and methods
// Begin
		/**
		 *
		 * @param {sap.ui.dt.Overlay} oCurrentOverlay
		 * @return {sap.ui.dt.Overlay}
		 *
		 * @name _findSelectedOverlayInHierarchy
		 * @function
		 * @private
		 */
		function _findSelectedOverlayInHierarchy(oCurrentOverlay) {
			if (!oCurrentOverlay || oCurrentOverlay.isSelected()) {
				return oCurrentOverlay;
			}
			return _findSelectedOverlayInHierarchy(oCurrentOverlay.getParentElementOverlay());
		}

		/**
		 * This method does the following:
		 *  1. attaches/detaches drop listener to non-droppable overlays. it allows us to know if target
		 *            is dropped within the canvas or not
		 *  2. update widget-droparea-sortable-* class to support drop action in empty/invisible containers
		 *
		 * @param {object} oEvent
		 *
		 * @name _checkDroppableChange
		 * @function
		 * @private
		 */
		function _checkDroppableChange(oEvent) {
			var oAggregationOverlay = oEvent.getSource();
			var sAggregationName = oAggregationOverlay.getAggregationName();

			if ((oAggregationOverlay.getElementInstance() instanceof sap.ui.core.Control) &&
				(oAggregationOverlay.getParent().getDesignTimeMetadata().getData().aggregations || {})[sAggregationName]) {
				oAggregationOverlay.getElementInstance()
					.toggleStyleClass("widget-droparea-sortable-" + sAggregationName, oEvent.getParameter("droppable"));
			}
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
		 * The W5gDragDrop enables D&D functionality for the overlays based on aggregation types on the layout editor
		 * @extends sap.ui.dt.plugin.BaseDragDrop
		 *
		 */
		var W5gDragDrop = BaseDragDrop.extend("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.dtplugins.W5gDragDrop",
			/** @lends sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.dtplugins.W5gDragDrop.prototype */ {
			metadata: {
				library: "sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.dtplugins",
				properties: {
					listeners: {type: "object[]"},
					w5gUtils: {type: "object"},
					controlMetadata: {type: "object"}
				}
			}
		});

		W5gDragDrop.prototype.checkDraggable = function (oOverlay) {
			return Boolean(oOverlay.getDesignTimeMetadata().getData().draggable);
		};

		// call super for all of these methods and then call all listeners for them
		["onDragStart", "onDragEnd", "onDragEnter", "onDragOver", "onAggregationDrop", "onControlAdded", "onCanvasDrop"]
			.forEach(function (sFuncName) {
				W5gDragDrop.prototype[sFuncName] = function () {
					if (BaseDragDrop.prototype[sFuncName]) {
						BaseDragDrop.prototype[sFuncName].apply(this, arguments);
					}
					var thatArguments = arguments;
					this.getListeners().forEach(function (oListener) {
						if (oListener[sFuncName]) {
							oListener[sFuncName].apply(oListener, thatArguments);
						}
					});
				};
			});

		W5gDragDrop.prototype._onDragStart = function (oEvent) {
			this.getW5gUtils().closeW5gTooltips();
			var oOverlay = sap.ui.getCore().byId(oEvent.currentTarget.id);

			//WORKAROUND START (issue 21 in WIKI: 1740748722)
			oOverlay = _findSelectedOverlayInHierarchy(oOverlay) || oOverlay;
			//WORKAROUND END
			this._oDraggedOverlay = oOverlay;

			oEvent.stopPropagation();

			// Fix for Firefox - Firefox only fires drag events when data is set
			if (sap.ui.Device.browser.firefox && oEvent && oEvent.originalEvent && oEvent.originalEvent.dataTransfer && oEvent.originalEvent.dataTransfer.setData) {
				oEvent.originalEvent.dataTransfer.setData("text/plain", "");
			}

			this.showGhost(oOverlay, oEvent);
			this.onDragStart(oOverlay, oEvent);
		};

		W5gDragDrop.prototype._onDragEnd = function(oEvent) {
			var oOverlay = sap.ui.getCore().byId(oEvent.currentTarget.id);

			oOverlay = this.getDraggedOverlay() || oOverlay;

			this._removeGhost();
			this.onDragEnd(oOverlay, oEvent);

			delete this._oDraggedOverlay;
			oEvent.stopPropagation();
		};

		W5gDragDrop.prototype.registerOverlay = function (oOverlay) {
			var W5gUtils = this.getW5gUtils(),
				ControlMetadata = this.getControlMetadata();

			BaseDragDrop.prototype.registerOverlay.apply(this, arguments);
			var oControl = oOverlay.getElementInstance();

			// At this point oControl parent can be a null.
			// It happens because oOverlay was created but still has not been added to its parent (add aggregation from outline).
			// So we need to wait for ui rendering to get reference to the parent
			setTimeout(function() {
				if (W5gUtils.testAncestors(oControl, [W5gUtils.isControlFragment, W5gUtils.isNestedView], window)) {
					oOverlay.setDraggable(false);
				}
				var oParent = W5gUtils.getWYSIWYGParent(oControl, window);
				if (oParent && W5gUtils.testAncestors(oParent, ControlMetadata.isControlNotDroppable, window)) {
					oOverlay.setDraggable(false);
				}
			});
			oOverlay.attachBrowserEvent("drop", this.onCanvasDrop, this);
		};

		W5gDragDrop.prototype.deregisterOverlay = function (oOverlay) {
			BaseDragDrop.prototype.deregisterOverlay.apply(this, arguments);
			oOverlay.detachBrowserEvent("drop", this.onCanvasDrop, this);
		};

		/**
		 * Returns true if the current draggable can be dropped to the given oAggregationOverlay.
		 * It consider design time function logic.
		 *
		 * @param {sap.ui.dt.AggregationOverlay} oAggregationOverlay
		 * @returns {boolean}
		 *
		 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.dtplugins.W5gDragDrop#checkDroppable
		 * @function
		 * @public
		 */
		W5gDragDrop.prototype.checkDroppable = function (oAggregationOverlay) {
			var oDraggedControl = this.getDraggedOverlay().getElementInstance(),
				oDropAreaControl = oAggregationOverlay.getElementInstance(),
				W5gUtils = this.getW5gUtils(),
				ControlMetadata = this.getControlMetadata();

			if (W5gUtils.testAncestors(oDropAreaControl,
					[W5gUtils.isControlFragment, W5gUtils.isNestedView, ControlMetadata.isControlNotDroppable], window)) {
				return false;
			}

			if (W5gUtils.validateDropTarget(oDraggedControl, oAggregationOverlay, oDropAreaControl) &&
				W5gUtils.validateAsDropTarget(oDropAreaControl, oAggregationOverlay, oDraggedControl)) {
				// draggable accepts drop target and drop target aggregation accepts draggable
				return BaseDragDrop.prototype.checkDroppable.apply(this, arguments);
			}
			return false;
		};

		/**
		 * @override sap.ui.dt.Plugin.prototype.registerAggregationOverlay
		 *
		 * @param {sap.ui.dt.AggregationOverlay} oAggregationOverlay which should be registered
		 */
		W5gDragDrop.prototype.registerAggregationOverlay = function (oAggregationOverlay) {
			BaseDragDrop.prototype.registerAggregationOverlay.apply(this, arguments);

			oAggregationOverlay.attachDroppableChange(_checkDroppableChange);
			oAggregationOverlay.attachBrowserEvent("drop", this.onCanvasDrop, this);
		};

		/**
		 * @override sap.ui.dt.Plugin.prototype.deregisterAggregationOverlay
		 *
		 * @param {sap.ui.dt.AggregationOverlay} oAggregationOverlay which should be deregistered
		 */
		W5gDragDrop.prototype.deregisterAggregationOverlay = function (oAggregationOverlay) {
			BaseDragDrop.prototype.deregisterAggregationOverlay.apply(this, arguments);

			oAggregationOverlay.detachDroppableChange(_checkDroppableChange);
			oAggregationOverlay.detachBrowserEvent("drop", this.onCanvasDrop, this);
		};

		return W5gDragDrop;
	},
	/* bExport= */ true
);
