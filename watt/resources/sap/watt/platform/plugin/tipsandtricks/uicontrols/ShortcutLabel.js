define([], function() {
	jQuery.sap.require("sap.ui.commons.Label");
	var ShortcutLabel = sap.ui.commons.Label.extend("sap.watt.platform.plugin.tipsandtricks.ui.controls.ShortcutLabel", {
		renderer: function(oRm, oControl) {
			//Add styles for the text
			oRm.addStyle('color','#346187');
			oRm.addStyle('font-size','12px');
			oRm.addStyle('font-family','Segoe UI');

			//Add general label styles
			oRm.addStyle('border-color','#4d4d4d !important');
			oRm.addStyle('background-color','white');

			//Add border-bottom styles
			oRm.addStyle('border-bottom','1px double');
			oRm.addStyle('border-bottom-width','4px');

			//Add border-top/right/left
			oRm.addStyle('border-top','1px solid');
			oRm.addStyle('border-right','1px solid');
			oRm.addStyle('border-left','1px solid');

			sap.ui.commons.LabelRenderer.render(oRm, oControl);
			oRm.writeStyles();
		}
	});

	return ShortcutLabel;
});
