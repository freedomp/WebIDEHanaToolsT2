/*!
 * @copyright@
 */

jQuery.sap.declare("sap.collaboration.components.fiori.sharing.attachment.InvalidAttachmentParameterException");

sap.ui.base.Object.extend("sap.collaboration.components.fiori.sharing.attachment.InvalidAttachmentParameterException", {
	constructor: function(parameter) {
		/** @private */ this.exceptionName = "InvalidAttachmentParameterException: " + parameter;
	}
});
