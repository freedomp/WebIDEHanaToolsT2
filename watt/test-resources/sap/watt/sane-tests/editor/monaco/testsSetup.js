window.TEST_REGEXP = /sane-tests\/editor\/monaco\/.*Spec\.js$/i;
window.allTestFiles = [
	"editor/monaco/ideplatform/plugin/aceeditor/service/aceeditorSpec",
	"editor/monaco/ideplatform/plugin/aceeditor/service/aceeditorcontextmenuSpec",
	"editor/monaco/ideplatform/plugin/editor/service/editorSpec",
	"editor/monaco/ideplatform/plugin/intellisence/service/intellisenceSpec",
	"editor/monaco/ideplatform/plugin/intellisence/service/intellisenceCommandSpec",
	"editor/monaco/ideplatform/plugin/intellisence/service/intellisenceLibVersionSpec",
	"editor/monaco/ideplatform/plugin/intellisence/service/CalculateLibVersionSpec",
	"editor/monaco/ideplatform/plugin/multieditor/service/multieditorSpec",
	"editor/monaco/ideplatform/plugin/projectmetadata/service/projectmetadataSpec",
	"editor/monaco/ideplatform/plugin/snippet/service/snippetSpec",
	"editor/monaco/platform/plugin/content/service/contentSpec",
	"editor/monaco/platform/plugin/content/service/contentservicepersistenceSpec",
	"editor/monaco/platform/plugin/content/unit/contentViewSpec",
	"editor/monaco/platform/plugin/content/unit/navigationBarSpec",
	"editor/monaco/platform/hcp/plugin/hcplibrarymetadataprovider/unit/HCPLibraryMetadataProviderSpec",
	"editor/monaco/saptoolsets/fiori/editor/plugin/appdescriptoreditor/service/AppDescriptorEditorSpec",
	"editor/monaco/toolsets/plugin/i18n/service/18nCodeCompletionSpec",
	"editor/monaco/toolsets/plugin/javascript/service/JSCocoCrossFileSpec",
	"editor/monaco/toolsets/plugin/javascript/service/JSDefinitionSpec",
	"editor/monaco/toolsets/plugin/javascript/service/JSAmdGoToDefinitionSpec",
	"editor/monaco/toolsets/plugin/javascript/service/JSCocoUI5AmdCrossFileSpec",
	"editor/monaco/toolsets/plugin/javascript/service/JSCocoUI5InFileSpec",
	"editor/monaco/toolsets/plugin/javascript/service/jscodecompletionSpec",
	"editor/monaco/toolsets/plugin/javascript/service/jscodecompletionMultiVersionSpec",
	"editor/monaco/toolsets/plugin/javascript/service/jscodecompletionWuWSpec",
	"editor/monaco/toolsets/plugin/javascript/service/jsCoCoMultiVersionSpec",
	"editor/monaco/toolsets/plugin/xml/service/xmlUI5LibrariesLoadedSpec",
	"editor/monaco/toolsets/plugin/xml/service/xmlSpec",
	"editor/monaco/toolsets/plugin/xml/service/xmlVersionsSpec",
	"editor/monaco/toolsets/plugin/xml/service/xmlXSDSchemaSpec"
];

window.customPaths = {
	"editor": window.webappPath() + "test-resources/sap/watt/sane-tests/editor",
	"sinon": window.webappPath() + "test-resources/sap/watt/sane-tests/libs/sinon-1.17.2",
	"jquery": window.webappPath() + "resources/sap/watt/lib/jquery/jquery-1.10.2"
};

jQuery.sap.registerModulePath('sap.watt', window.webappPath() + 'resources/sap/watt');