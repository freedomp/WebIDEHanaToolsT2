window.TEST_REGEXP = /sane-tests\/w5g\/unit\/.*Spec\.js$/i;

window.allTestFiles = window.allTestFiles || [];
window.allTestFiles = window.allTestFiles.concat([
	'w5g/unit/AdapterSpec',
	'w5g/unit/CopyPasteUtilsSpec',
	'w5g/unit/IFrameSpec',
	'w5g/unit/ModulePathSpec',
	'w5g/unit/OutlineControllerSpec',
	'w5g/unit/PaletteItemSpec',
	'w5g/unit/PaletteSpec',
	'w5g/unit/PropertiesMassSpec',
	'w5g/unit/PropertyBindingDialogUtilsSpec',
	'w5g/unit/UndoRedoStackSpec',
	'w5g/unit/UserMessagesSpec',
	'w5g/unit/UtilsSpec',
	'w5g/unit/ResourcesHelperSpec',
	'w5g/unit/W5gSpec',
	'w5g/unit/W5gUi5LibraryMediatorSpec',
	'w5g/unit/DragDropPluginSpec',
	'w5g/unit/MouseSelectionPluginSpec',
	'w5g/unit/ActionsPluginSpec',
	'w5g/unit/PropertyModelSpec',
	'w5g/unit/isolated/XMLAdapterSpec',
	'w5g/unit/EventBusHelperSpec',
	'w5g/unit/EventsUtilsSpec'
]);


window.w5gEnvJson = "../../../../test-resources/sap/watt/sane-tests/w5g/service1/env.json";

window.customPaths = {
	'w5g': window.webappPath() + 'test-resources/sap/watt/sane-tests/w5g'
};

window.W5G_LIBS_PREFIX = window.isRunningInKarmaWebServer() ? '/base' : '';

// uncomment to enable runtime type checks
window.STF_RUNTIME_CHECKS = true;
window.STF_RUNTIME_CHECKS_FILTER = /plugin\/ui5wysiwygeditor|sane-tests\/w5g/;

(function(){
	'use strict';
	window.jQuery.sap.registerModulePath('sap.watt', window.webappPath() + 'resources/sap/watt');
	window.jQuery.sap.registerModulePath('sap.watt.saptoolsets.fiori.editor.ui5wysiwygeditor',
		window.webappPath() + 'resources/sap/watt/saptoolsets/fiori/editor/plugin/ui5wysiwygeditor');

})();

