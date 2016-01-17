jQuery.sap.declare("sap.watt.platform.plugin.qrcode.lib.QRCodeRenderer");

/**
 * @class QRCode renderer. 
 * @static
 */
sap.watt.platform.plugin.qrcode.lib.QRCodeRenderer = {
};


/**
 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
 * 
 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
 */
sap.watt.platform.plugin.qrcode.lib.QRCodeRenderer.render = function(oRm, oControl) {
	var sValue = oControl.getValue();
	var bIsLink = sValue && sValue.substring(0, 4) === "http";

	oRm.write("<div ");
	oRm.writeControlData(oControl);
	oRm.writeClasses();
	oRm.write(">");
	var completeUrl = sValue;
	
	var regex = /^https?:\/\/localhost/;
	if (regex.test(completeUrl)) {
		oRm.write("<div id='localhost-warning' style='color:#d14900; padding: 2px; padding-bottom:18px;'>Warning: the URI's hostname is localhost. <br/>It will be unreachable on mobile device</div>");
	}
	
	if (bIsLink) {
		oRm.write("<a id='qr-code'");
		oRm.writeAttribute("target", "_blank");
		oRm.writeAttribute("href", completeUrl);
		oRm.write("/>");
	} else {
		oRm.write("<div id='qr-code'/>");
	}
	oRm.write("</div>");
};