define([
	"../core/TranslationManager"
], {

	execute : function() {
		jQuery.sap.log.info("showTerm command executed!");
		sap.watt.platform.plugin.translation.core.TranslationManagerSingleton.showTerm();
		//alert("Term");
	}
});