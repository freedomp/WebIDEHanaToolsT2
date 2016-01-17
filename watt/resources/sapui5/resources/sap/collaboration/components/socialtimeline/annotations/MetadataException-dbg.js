/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.base.Object");

jQuery.sap.declare("sap.collaboration.components.socialtimeline.annotations.MetadataException");

sap.ui.base.Object.extend("sap.collaboration.components.socialtimeline.annotations.MetadataException", {
	constructor: function(sExceptionMessage) {
		this._sClassName = "sap.collaboration.components.socialtimeline.annotations.MetadataException";
		this._sExceptionMessage = sExceptionMessage;
	}
});