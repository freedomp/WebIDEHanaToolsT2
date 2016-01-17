sap.ui.define(
	[
		"sap/ui/dt/Plugin"
	],
	function (Plugin) {
		"use strict";

// Private variables and methods
// Begin
		function _callParentAggregationsActions(oCurrentOverlay) {
			var oParentAggOverlay = oCurrentOverlay.getParentAggregationOverlay();
			if (oParentAggOverlay) {
				var oParentOverlay = oCurrentOverlay.getParentElementOverlay();
				var oParentDTData = oParentOverlay.getDesignTimeMetadata().getData();
				var fnShow = (oParentDTData.aggregations[oParentAggOverlay.getAggregationName()] || {}).show;
				if (typeof fnShow === "function") {
					fnShow.call(oParentOverlay.getElementInstance(), oCurrentOverlay.getElementInstance());
				}
				_callParentAggregationsActions(oParentOverlay);
			}
		}

		function _selectionChangeHandler(oEvent) {
			var aSelectedOverlays = oEvent.getParameter("selection");
			if (aSelectedOverlays && aSelectedOverlays.length) {
				//assuming only single selection is supported
				_callParentAggregationsActions(aSelectedOverlays[0]);
			}
		}
// End
// Private variables and methods

		/**
		 * Constructor for a new Actions plugin.
		 *
		 * @param {string} [sId] id for the new object, generated automatically if no id is given
		 * @param {object} [mSettings] initial settings for the new object
		 *
		 * @class
		 * The Actions implements overlay<>control interactions
		 * @extends sap/ui/dt/Plugin
		 *
		 */
		var Actions = Plugin.extend("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.dtplugins.Actions",
			/** @lends sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.dtplugins.Actions.prototype */ {
			metadata: {
				library: "sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.dtplugins"
			}
		});

		/*
		 * @derived
		 */
		Actions.prototype.setDesignTime = function (oDesignTime) {
			Plugin.prototype.setDesignTime.apply(this, arguments);

			if (oDesignTime) {
				oDesignTime.attachEvent("selectionChange", _selectionChangeHandler);
			}

		};

		/*
		 * @derived
		 */
		Actions.prototype.exit = function () {
			if (this.getDesignTime()) {
				this.getDesignTime().detachEvent("selectionChange", _selectionChangeHandler);
			}
			Plugin.prototype.exit.apply(this, arguments);
		};

		return Actions;
	},
	/* bExport= */ true
);
