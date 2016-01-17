//  The SaneTestFramework should be imported via 'STF' path.
define(["STF"], function(STF) {
	"use strict";

	//  every suite must have a uniqueName. using a none unique name will cause an error.
	var suiteName = "editor_service_tests";
	var oEditorService;
	var oNotAvailableEditorService;
	var MockFileDocument;
	
	function assertEditorConfiguredCorrectly(oEditor, sExpFileExtension, sExpID) {
		expect(oEditor.fileExtension, sExpFileExtension + " editor is available" ).to.include(sExpFileExtension);
		expect(oEditor.service.getProxyMetadata().getName(), "Name of Editor is correct").to.equal("aceeditor");
		expect(oEditor.id, "ID for Editor is correct").to.equal(sExpID);
	}
    
	describe("Editor Service Tests", function() {
		before(function() {
			return STF.startWebIde(suiteName, {config : "editor/monaco/ideplatform/plugin/editor/service/config.json"}).
			then(function() {
				oEditorService = STF.getService(suiteName, "editor");
				oNotAvailableEditorService = STF.getService(suiteName, "notavailable");
				return STF.require(suiteName, ["sane-tests/util/mockDocument"]);
			}).spread(function(oMockDocument) {
				MockFileDocument = oMockDocument.MockFileDocument;
			});
		});
		
		after(function() {
			STF.shutdownWebIde(suiteName);
		});
		
		beforeEach(function() {
			return oNotAvailableEditorService.setAvailable(false);
		});

		it("Editor Integration for JS", function() {
			var oDocumentJS = new MockFileDocument("new/jsdoc.js", "js", "", undefined, "jsdoc.js");
            return oEditorService.getDefaultEditor(oDocumentJS).then(function (oEditor) {
                assertEditorConfiguredCorrectly(oEditor, "js", "ace");
            });
		});

		it("Get specific editor for view", function() {
			var oDocumentXML = new MockFileDocument("new/view.xml", "xml", "", undefined, "view.xml");
            return oEditorService.getSpecificEditor(oDocumentXML, "Fake-Editor").then(function (oEditor) {
            	expect(oEditor.service.getProxyMetadata().getName(), "Name of Editor service is correct").to.equal("aceeditor");
            	expect(oEditor.name, "Name of Editor is correct").to.equal("Fake-Editor");
            });
		});
		
		it("Get specific editor for view - not available", function() {
			var oDocumentJS = new MockFileDocument("new/jsdoc.js", "js", "", undefined, "jsdoc.js");
            return oEditorService.getSpecificEditor(oDocumentJS, "Not-Available").then(function (oEditor) {
            	expect(oEditor, "Editor is not available").to.not.exist;
            });
        });

		it("Different Editors for JS", function() {
			var oDocumentJS = new MockFileDocument("new/jsdoc.js", "js", "", undefined, "jsdoc.js");
  			return oEditorService.getAllEditors(oDocumentJS).then(function (aEditors) {
  				expect(aEditors, "two editors available. Not available service is filtered").to.have.length(2);
 				return oNotAvailableEditorService.setAvailable(true);
  			}).then(function() {
 				return oEditorService.getAllEditors(oDocumentJS);
 			}).then(function (aEditors) {
 				expect(aEditors, "tree editors available").to.have.length(3);
  			});
		});
		
		it("Editor Integration for HTML", function() {
			var oDocumentHTML = new MockFileDocument("new/htmldoc.html", "html", "", undefined, "htmldoc.html");
 			return oEditorService.getDefaultEditor(oDocumentHTML).then(function (oEditor) {
 				assertEditorConfiguredCorrectly(oEditor, "html", "fake");
 			});
		});

		it("Default Editor for non available editor", function() {
			var oDocumentCSS = new MockFileDocument("new/cssdoc.css", "css", "", undefined, "cssdoc.css");
 			return oEditorService.getDefaultEditor(oDocumentCSS).then(function (oEditor) {
 				expect(oEditor, "No default editor found, as editor is not available").to.not.exist;
 				return oNotAvailableEditorService.setAvailable(true);
  			}).then(function() {
 				return oEditorService.getDefaultEditor(oDocumentCSS);
 			}).then(function (oEditor) {
 				expect(oEditor, "Editor was found").to.exist;
 				expect(oEditor.id, "Right editor was found").to.equal("notavailable");
 			});
		});
		
		it("Editor Integration for *", function() {
			var oDocumentXML = new MockFileDocument("new/dummydoc.dummy", "dummy", "", undefined, "dummydoc.dummy");
			return oEditorService.getDefaultEditor(oDocumentXML).then(function (oEditor) {
				assertEditorConfiguredCorrectly(oEditor, "*", "other");
			});
		});
	});
});