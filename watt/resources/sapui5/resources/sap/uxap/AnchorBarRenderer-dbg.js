sap.ui.define(['sap/m/ToolbarRenderer','sap/ui/core/Renderer'],
	function(ToolbarRenderer, Renderer) {
	"use strict";

	/**
	 * @class ObjectPageRenderer renderer.
	 * @static
	 */
	var AnchorBarRenderer = Renderer.extend(ToolbarRenderer);

	AnchorBarRenderer.renderBarContent = function (rm, oToolbar) {

		if (oToolbar._bHasButtonsBar) {

			rm.renderControl(oToolbar._oArrowLeft);

			rm.write("<div");
			rm.writeAttributeEscaped("id", oToolbar.getId() + "-scrollContainer");
			// ARIA attributes
			var oRb = sap.uxap.i18nModel.getResourceBundle();
			rm.writeAttributeEscaped("aria-label", oRb.getText("ANCHOR_BAR_LABEL"));
			//
			rm.addClass("sapUxAPAnchorBarScrollContainer");
			rm.writeClasses();
			rm.write(">");

			rm.write("<div");
			rm.writeAttributeEscaped("id", oToolbar.getId() + "-scroll");
			rm.write(">");

			ToolbarRenderer.renderBarContent.apply(this, arguments);

			rm.write("</div>");

			rm.write("</div>");

			rm.renderControl(oToolbar._oArrowRight);
		}

		sap.m.BarInPageEnabler.addChildClassTo(oToolbar._oSelect, oToolbar);
		rm.renderControl(oToolbar._oSelect);

	};


	return AnchorBarRenderer;

}, /* bExport= */ true);
