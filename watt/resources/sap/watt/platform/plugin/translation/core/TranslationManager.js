define(function() {
	var TranslationManager = function() {
		this._translationService = sap.watt.core.Service.get("translation");
	};

	//sap.watt.ideplatform.plugin.template.core.Templates = [];
	//sap.watt.ideplatform.plugin.template.core.Components = [];

	TranslationManager.prototype = {

		showTerm : function() {
			jQuery.sap.log.info("showTerm !");

			this._translationService.showGetTermsUI(null, "username", true, true, true);

		},

		onSelectedTerm : function(selectedTemplate) {

		},

		onSelectedTranslation : function(selectedComponent) {

		}

	};

	// TODO: think about other concept
	define("sap/watt/platform/plugin/translation/core/TranslationManagerSingleton", new TranslationManager());
	require([ "sap/watt/platform/plugin/translation/core/TranslationManagerSingleton" ]);

	return TranslationManager;

});
