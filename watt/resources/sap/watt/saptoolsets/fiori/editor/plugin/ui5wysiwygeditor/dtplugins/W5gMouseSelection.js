sap.ui.define(
	[
		"sap/ui/dt/plugin/MouseSelection"
	],
	function (MouseSelection) {
		"use strict";

// Private variables and methods
// Begin
		var W5gUtils, _oEditor, _oLastClickedOverlay;

		function _selectOverlayControl(/** sap.ui.dt.ElementOverlay */ oOverlay) {
			_oEditor.selectUI5Control(oOverlay.getElementInstance()).done();
		}

		function _selectParent(/** sap.ui.dt.ElementOverlay */ oOverlay) {
			if (oOverlay.isSelectable()) {
				_selectOverlayControl(oOverlay);
				return;
			}
			var oParent = oOverlay.getParentElementOverlay();
			while (oParent && !oParent.isSelectable()) {
				oParent = oParent.getParentElementOverlay();
			}
			oParent && _selectOverlayControl(oParent);
		}
// End
// Private variables and methods

		/**
		 * Constructor for a new W5gMouseSelection.
		 *
		 * @param {string} [sId] id for the new object, generated automatically if no id is given
		 * @param {object} [mSettings] initial settings for the new object
		 *
		 * @class
		 * The W5gMouseSelection enables D&D functionality for the overlays based on aggregation types on the layout editor
		 * @extends sap.ui.dt.plugin.ControlDragDrop
		 *
		 */
		var W5gMouseSelection = MouseSelection.extend("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.dtplugins.W5gMouseSelection",
			/** @lends sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.dtplugins.W5gMouseSelection.prototype */ {
			metadata: {
				library: "sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.dtplugins",
				properties: {
					w5gUtils: {type: "object"},
					editor: {type: "object"}
				}
			},

			constructor: function () {
				MouseSelection.apply(this, arguments);
				W5gUtils = this.getW5gUtils();
				_oEditor = this.getEditor();
			}
		});

		/**
		 * @override
		 */
		W5gMouseSelection.prototype._onClick = function (oEvent) {
			if (this === _oLastClickedOverlay) {
				var oOverlay = this;
				while (oOverlay.getParentElementOverlay() && !oOverlay.getSelected()) {
					oOverlay = oOverlay.getParentElementOverlay();
				}
				if (oOverlay.getParentElementOverlay() && oOverlay.getSelected()) {
					_selectOverlayControl(oOverlay.getParentElementOverlay());
				} else {
					_selectParent(this);
				}
			} else {
				if (this.isSelectable()) {
					_selectOverlayControl(this);
				} else {
					_selectParent(this);
				}
			}
			_oLastClickedOverlay = this;
			oEvent.preventDefault();
			oEvent.stopPropagation();
		};

		W5gMouseSelection.prototype.registerOverlay = function (oOverlay) {
			MouseSelection.prototype.registerOverlay.apply(this, arguments);
			var oControl = oOverlay.getElementInstance();
			// Controls inside Fragment and inside Nested view should not be selectable
			if (W5gUtils.testAncestors(oControl, [W5gUtils.isControlFragment, W5gUtils.isNestedView], window, true)) {
				oOverlay.setSelectable(false);
			}
		};

		return W5gMouseSelection;
	},
	/* bExport= */ true
);
