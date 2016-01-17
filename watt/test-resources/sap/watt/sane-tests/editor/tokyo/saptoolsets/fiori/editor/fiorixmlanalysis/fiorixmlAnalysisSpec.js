define(["sap/watt/lib/lodash/lodash", "sinon", 'STF'], function (_, sinon, STF) {

	var sandbox;
	var suiteName = "fiori_xml_code_validator_adopter";
	var oProjectmetadataService;
	var oLibrarymetadataService;
	var oFioriXmlAnalysisService;

	function _getRemoteResource(sFileName) {
		var baseUrl = "editor/tokyo/saptoolsets/fiori/editor/fiorixmlanalysis/test/rules/";
		sFileName = (baseUrl + sFileName);
		var sURL = require.toUrl(sFileName);
		return Q(
			$.ajax({
				dataType: "text",
				url: sURL
			})
		);
	}

	function _expect(expected, id) {
		return function (oResult) {
			var issues = oResult.issues;
			var counted = 0;
			for (var ii = 0; ii < issues.length; ii++) {
				var issue = issues[ii];
				if (issue.id === id) {
					counted++;
				}
			}
			assert.ok(expected === counted, "Expected " + expected + " " + id + " findings, got " + counted);
		};
	}

	function _fakeConfig() {
		return {
			"show": ["error", "warning", "info"],
			"rules": {}
		};
	}

	function _fakePath() {
		return "/aaaaaaaaaaaa/view/Main.xml";
	}

	describe("Problems display of validation Tests", function () {
		before(function () {
			return STF.startWebIde(suiteName, {
				config: "editor/tokyo/saptoolsets/fiori/editor/fiorixmlanalysis/config.json"
			}).then(function (webIdeWindowObj) {
				oProjectmetadataService = STF.getService(suiteName, "projectmetadata");
				oLibrarymetadataService = STF.getService(suiteName, "librarymetadata");
				oFioriXmlAnalysisService = STF.getService(suiteName, "fioriXmlAnalysis");
			});
		});

		beforeEach(function () {
			sandbox = sinon.sandbox.create();
		});

		// XML_ICON_ACCESSIBILITY
		it("apply rule - XML_ICON_ACCESSIBILITY - test1.xml", function () {
			return _getRemoteResource("XML_ICON_ACCESSIBILITY/test1.xml").then(function (xmlFileContent) {
				return oFioriXmlAnalysisService.getIssuesSynchronously(xmlFileContent, _fakeConfig(), _fakePath())
					.then(_expect(3, "XML_ICON_ACCESSIBILITY"));
			});
		});

		// XML_ICON_BUTTON_ACCESSIBILITY
		it("apply rule - XML_ICON_BUTTON_ACCESSIBILITY - test1.xml", function () {
			return _getRemoteResource("XML_ICON_BUTTON_ACCESSIBILITY/test1.xml").then(function (xmlFileContent) {
				return oFioriXmlAnalysisService.getIssuesSynchronously(xmlFileContent, _fakeConfig(), _fakePath())
					.then(_expect(4, "XML_ICON_BUTTON_ACCESSIBILITY"));
			});
		});

		// XML_IMAGE_ACCESSIBILITY
		it("apply rule - XML_IMAGE_ACCESSIBILITY - test1.xml", function () {
			return _getRemoteResource("XML_IMAGE_ACCESSIBILITY/test1.xml").then(function (xmlFileContent) {
				return oFioriXmlAnalysisService.getIssuesSynchronously(xmlFileContent, _fakeConfig(), _fakePath()).then(_expect(6, "XML_IMAGE_ACCESSIBILITY"));
			});
		});

		// XML_TITLE_ACCESSIBILITY 1-3
		it("apply rule - XML_TITLE_ACCESSIBILITY - test2.xml", function () {
			return _getRemoteResource("XML_TITLE_ACCESSIBILITY/test2.xml").then(function (xmlFileContent) {
				return oFioriXmlAnalysisService.getIssuesSynchronously(xmlFileContent, _fakeConfig(), _fakePath())
					.then(_expect(4, "XML_TITLE_ACCESSIBILITY"));
			});
		});

		// XML_PAGE_ACCESSIBILITY
		it("apply rule - XML_PAGE_ACCESSIBILITY - test1.xml", function () {
			return _getRemoteResource("XML_PAGE_ACCESSIBILITY/test1.xml").then(function (xmlFileContent) {
				return oFioriXmlAnalysisService.getIssuesSynchronously(xmlFileContent, _fakeConfig(), _fakePath())
					.then(_expect(6, "XML_PAGE_ACCESSIBILITY"));
			});
		});

		// XML_TABLE_ACCESSIBILITY
		it("apply rule - XML_TABLE_ACCESSIBILITY - test1.xml", function () {
			return _getRemoteResource("XML_TABLE_ACCESSIBILITY/test1.xml").then(function (xmlFileContent) {
				return oFioriXmlAnalysisService.getIssuesSynchronously(xmlFileContent, _fakeConfig(), _fakePath())
					.then(_expect(1, "XML_TABLE_ACCESSIBILITY"));
			});
		});

		// DG_XML_FOOTER_BUTTON_TEXT_ICON
		it("apply rule - DG_XML_FOOTER_BUTTON_TEXT_ICON - test1.xml", function () {
			return _getRemoteResource("DG_XML_FOOTER_BUTTON_TEXT_ICON/test1.xml").then(function (xmlFileContent) {
				return oFioriXmlAnalysisService.getIssuesSynchronously(xmlFileContent, _fakeConfig(), _fakePath())
					.then(_expect(2, "DG_XML_FOOTER_BUTTON_TEXT_ICON"));
			});
		});

		// DG_XML_LIST_BASE_SHOW_NO_DATA
		it("apply rule - DG_XML_LIST_BASE_SHOW_NO_DATA - test1.xml", function () {
			return _getRemoteResource("DG_XML_LIST_BASE_SHOW_NO_DATA/test1.xml").then(function (xmlFileContent) {
				return oFioriXmlAnalysisService.getIssuesSynchronously(xmlFileContent, _fakeConfig(), _fakePath())
					.then(_expect(3, "DG_XML_LIST_BASE_SHOW_NO_DATA"));
			});
		});

		// DG_XML_NO_DUPLICATE_ICONS
		it("apply rule - DG_XML_NO_DUPLICATE_ICONS - test1.xml", function () {
			return _getRemoteResource("DG_XML_NO_DUPLICATE_ICONS/test1.xml").then(function (xmlFileContent) {
				return oFioriXmlAnalysisService.getIssuesSynchronously(xmlFileContent, _fakeConfig(), _fakePath())
					.then(_expect(0, "DG_XML_NO_DUPLICATE_ICONS"));
			});
		});

		it("apply rule - DG_XML_NO_DUPLICATE_ICONS - test2.xml", function () {
			return _getRemoteResource("DG_XML_NO_DUPLICATE_ICONS/test2.xml").then(function (xmlFileContent) {
				return oFioriXmlAnalysisService.getIssuesSynchronously(xmlFileContent, _fakeConfig(), _fakePath())
					.then(_expect(3, "DG_XML_NO_DUPLICATE_ICONS"));
			});
		});

		// DG_MULTIPLE_OBJECT_IDENTIFIER 1-2
		/** rule deactivated
		 test("apply rule - DG_MULTIPLE_OBJECT_IDENTIFIER - test1.xml", withPromise(function(){
			return _getRemoteResource("DG_MULTIPLE_OBJECT_IDENTIFIER/test1.xml").then(function(xmlFileContent){
				return oFioriXmlAnalysisService
					.getIssuesSynchronously(xmlFileContent, _fakeConfig(), _fakePath())
					.then(_expect(2, "DG_MULTIPLE_OBJECT_IDENTIFIER"));
			});
		}));
		 */
		// DG_MULTIPLE_OBJECT_NUMBER
		/** rule deactivated
		 test("apply rule - DG_MULTIPLE_OBJECT_NUMBER - test1.xml", withPromise(function(){
			return _getRemoteResource("DG_MULTIPLE_OBJECT_NUMBER/test1.xml").then(function(xmlFileContent){
				return oFioriXmlAnalysisService
					.getIssuesSynchronously(xmlFileContent, _fakeConfig(), _fakePath())
					.then(_expect(2, "DG_MULTIPLE_OBJECT_NUMBER"));
			});
		}));
		 */
			// DG_XML_NO_SINGLE_TAB
		it("apply rule - DG_XML_NO_SINGLE_TAB - test1.xml", function () {
			return _getRemoteResource("DG_XML_NO_SINGLE_TAB/test1.xml").then(function (xmlFileContent) {
				return oFioriXmlAnalysisService.getIssuesSynchronously(xmlFileContent, _fakeConfig(), _fakePath())
					.then(_expect(1, "DG_XML_NO_SINGLE_TAB"));
			});
		});

		// DG_XML_FIRST_OBJECT_IDENTIFIER
		/** rule deactivated
		 test("apply rule - DG_XML_FIRST_OBJECT_IDENTIFIER - test1.xml", withPromise(function(){
			return _getRemoteResource("DG_XML_FIRST_OBJECT_IDENTIFIER/test1.xml").then(function(xmlFileContent){
				return oFioriXmlAnalysisService
					.getIssuesSynchronously(xmlFileContent, _fakeConfig(), _fakePath())
					.then(_expect(2, "DG_XML_FIRST_OBJECT_IDENTIFIER"));
			});
		}));
		 */
		// DG_XML_USAGE_OBJECT_IDENTIFIER
		/** rule deactivated
		 test("apply rule - DG_XML_USAGE_OBJECT_IDENTIFIER - test1.xml", withPromise(function(){
			return _getRemoteResource("DG_XML_USAGE_OBJECT_IDENTIFIER/test1.xml").then(function(xmlFileContent){
				return oFioriXmlAnalysisService
					.getIssuesSynchronously(xmlFileContent, _fakeConfig(), _fakePath())
					.then(_expect(1, "DG_XML_USAGE_OBJECT_IDENTIFIER"));
			});
		}));
		 */
			// XML_DIALOG_IN_VIEW
		it("apply rule - XML_DIALOG_IN_VIEW - test1.xml", function () {
			return _getRemoteResource("XML_DIALOG_IN_VIEW/test1.xml").then(function (xmlFileContent) {
				return oFioriXmlAnalysisService.getIssuesSynchronously(xmlFileContent, _fakeConfig(), _fakePath())
					.then(_expect(4, "XML_DIALOG_IN_VIEW"));
			});
		});

		// XML_UPLOAD_IN_VIEW 1-6
		it("apply rule - XML_UPLOAD_IN_VIEW - test1.xml", function () {
			return _getRemoteResource("XML_UPLOAD_IN_VIEW/test1.xml").then(function (xmlFileContent) {
				return oFioriXmlAnalysisService.getIssuesSynchronously(xmlFileContent, _fakeConfig(), _fakePath())
					.then(_expect(1, "XML_UPLOAD_IN_VIEW"));
			});
		});

		// XML_COMMONS_USAGE
		it("apply rule - XML_COMMONS_USAGE - test1.xml", function () {
			return _getRemoteResource("XML_COMMONS_USAGE/test1.xml").then(function (xmlFileContent) {
				return oFioriXmlAnalysisService
					.getIssuesSynchronously(xmlFileContent, _fakeConfig(), _fakePath())
					.then(_expect(1, "XML_COMMONS_USAGE"));
			});
		});

		// XML_FORM_USAGE
		it("apply rule - XML_FORM_USAGE - test1.xml", function () {
			return _getRemoteResource("XML_FORM_USAGE/test1.xml").then(function (xmlFileContent) {
				return oFioriXmlAnalysisService.getIssuesSynchronously(xmlFileContent, _fakeConfig(), _fakePath())
					.then(_expect(1, "XML_FORM_USAGE"));
			});
		});

		// XML_LAYOUT_USAGE
		it("apply rule - XML_LAYOUT_USAGE - test1.xml", function () {
			return _getRemoteResource("XML_LAYOUT_USAGE/test1.xml").then(function (xmlFileContent) {
				return oFioriXmlAnalysisService.getIssuesSynchronously(xmlFileContent, _fakeConfig(), _fakePath())
					.then(_expect(1, "XML_LAYOUT_USAGE"));
			});
		});


		// XML_MISSING_STABLE_ID
		it("apply rule - XML_MISSING_STABLE_ID - test1.xml", function () {
			return _getRemoteResource("XML_MISSING_STABLE_ID/test1.xml").then(function (xmlFileContent) {
				return oFioriXmlAnalysisService.getIssuesSynchronously(xmlFileContent, _fakeConfig(), _fakePath())
					.then(_expect(4, "XML_MISSING_STABLE_ID"));
			});
		});

		/*
		 // XML_DEPRECATION
		 test("apply rule - XML_DEPRECATION - test1.xml", withPromise(function(){
		 aStubs.push(sinon.stub(oProjectmetadataService, "getDependencies").returns(
		 Q([{
		 library: "sapui5",
		 version: "1.32.4"
		 }])
		 ));
		 aStubs.push(sinon.stub(oLibrarymetadataService, "getMetadata").returns(
		 Q({
		 metadata: {
		 files: {
		 "sap.me.json": {
		 asText: function(){
		 return '{"metadatas": {"sap.me.ProgressIndicator": {"Deprecated": true,"events": {},"extend": "sap.ui.core.Control","Experimental": false,"associations": {},"filetype": "class"},"sap.me.Calendar": {"Deprecated": true,"extend": "sap.ui.core.Control","description": "This is the Calendar control","Experimental": false,"associations": {},"filetype": "class"}}}';
		 }
		 }
		 }
		 }
		 })
		 ));
		 return _getRemoteResource("XML_DEPRECATION/test1.view.xml").then(function(xmlFileContent){
		 return oFioriXmlAnalysisService
		 .getIssuesSynchronously(xmlFileContent, _fakeConfig(), _fakePath().replace(".xml",".view.xml"))
		 .then(_expect(1, "XML_DEPRECATION"));
		 });
		 }));
		 */

		// XML_METADATA_MEDIA_SRC_WITHOUT_FORMATTER
		it("apply rule - XML_METADATA_MEDIA_SRC_WITHOUT_FORMATTER - test1.xml", function () {
			return _getRemoteResource("XML_METADATA_MEDIA_SRC_WITHOUT_FORMATTER/test1.xml").then(function (xmlFileContent) {
				return oFioriXmlAnalysisService.getIssuesSynchronously(xmlFileContent, _fakeConfig(), _fakePath())
					.then(_expect(2, "XML_METADATA_MEDIA_SRC_WITHOUT_FORMATTER"));
			});
		});


		/* test template
		 test("apply rule - REPLACE - test1.xml", withPromise(function(){
		 return _getRemoteResource("REPLACE/test1.xml").then(function(xmlFileContent){
		 return oFioriXmlAnalysisService
		 .getIssuesSynchronously(xmlFileContent, _fakeConfig(), _fakePath())
		 .then(_expect(1, "REPLACE"));
		 });
		 }));
		 */
		afterEach(function () {
			sandbox.restore();
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});
	});
});
