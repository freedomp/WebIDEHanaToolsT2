sap.ui.define([], function() {
	"use strict";
	var TitleExtendedControlRenderer = {};
	TitleExtendedControlRenderer.render = function(oRm, oControl) {
		oRm.write('<h4');
		oRm.writeControlData(oControl);
		oRm.addClass("spaceUpBetweenControls");
		oRm.addClass("sapUiFormTitle");
		oRm.addClass("sapUiFormTitleH4");
		oRm.writeClasses();
		oRm.write('>');
		oRm.writeEscaped(oControl.getTitle().getText());
		oRm.write('</h4>');
	};
	return TitleExtendedControlRenderer;
}, true);