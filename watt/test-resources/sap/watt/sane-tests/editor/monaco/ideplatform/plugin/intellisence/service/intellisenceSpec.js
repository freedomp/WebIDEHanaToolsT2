//  The SaneTestFramework should be imported via 'STF' path.
define(["STF", "sinon"], function(STF, sinon) {
	"use strict";

	//  every suite must have a uniqueName. using a none unique name will cause an error.
	var suiteName = "intellisence_service_tests";
	var oTestCocoService;
	var oIntellisenceService;
	var oContentService;
	var oAceEditorService;
	var oFakeSelectionService;
	var MockFileDocument;
	var sandbox;
	
	 function createFixturesDiv(webIdeWindowObj) {
		var fixturesDiv = webIdeWindowObj.document.createElement("div");
		fixturesDiv.id = "fixtures";
		fixturesDiv.style.display = "none";
		fixturesDiv.style.visibility = "hidden";
		webIdeWindowObj.document.body.appendChild(fixturesDiv);
    }
    
	describe("Test 'getCodeCompletion' method", function() {
		before(function() {
			return STF.startWebIde(suiteName, {config : "editor/monaco/ideplatform/plugin/intellisence/service/config.json"}).
			then(function(webIdeWindowObj) {
				createFixturesDiv(webIdeWindowObj);
				sandbox = sinon.sandbox.create();
				oTestCocoService = STF.getService(suiteName, "testcodecompletion");
				oIntellisenceService = STF.getService(suiteName, "intellisence");
				oContentService = STF.getService(suiteName, "content");
				oAceEditorService = STF.getService(suiteName, "aceeditor");
				oFakeSelectionService = STF.getService(suiteName, "selection");
				return STF.require(suiteName, ["sane-tests/util/mockDocument"]);
			}).spread(function(oMockDocument) {
				MockFileDocument = oMockDocument.MockFileDocument;
			});
		});
		
		after(function() {
			STF.shutdownWebIde(suiteName);
		});
		
		afterEach(function() {
			sandbox.restore();
		});

		it("'getCodeCompletion' when no editors are open", function() {
	        sandbox.stub(oContentService, "getCurrentDocument").returns(Q());
		    return oIntellisenceService.getCodeCompletion().then(function(oCodeCompletion) {
		        expect(oCodeCompletion).to.not.exist;
		    });
		});
		
	    it("'getCodeCompletion' when a document with an unsupported file extension is open", function() {
        	var oDocument = new MockFileDocument("new/doc.unsupported", "unsupported", "");
	    	sandbox.stub(oContentService, "getCurrentDocument").returns(Q(oDocument));
		    return oIntellisenceService.getCodeCompletion().then(function(oCodeCompletion) {
		         expect(oCodeCompletion).to.not.exist;
		    });
		});
		
		it("'getCodeCompletion' when a document with a supported file extension is opened in an unsupported editor", function() {
	        var oDocument = new MockFileDocument("new/doc.unsupported", "unsupported", "");
	    	sandbox.stub(oContentService, "getCurrentDocument").returns(Q(oDocument));
		    var oUnsupportedEditorService = {
		        instanceOf: function() {
		            return false;
		        },
		        getName: function() {
		            return Q("unsupported");
		        } 
		    };
		    return oFakeSelectionService.setSelectionOwner(oUnsupportedEditorService).then(function() {
		        return oIntellisenceService.getCodeCompletion();
		    }).then(function(oCodeCompletion) {
	        	expect(oCodeCompletion).to.not.exist;
		    });
		});
		
		it("'getCodeCompletion' when a document with a supported file extension is opened in a supported editor", function() {
	        var oDocument = new MockFileDocument("new/doc.test", "test", "", false, false);
	    	sandbox.stub(oContentService, "getCurrentDocument").returns(Q(oDocument));
	        return oAceEditorService.getContent().then(function(oAceEditorControl) {
        	    oAceEditorControl.placeAt("fixtures");
                return oAceEditorService.open(oDocument);
	        }).then(function() {
	            var aSelection = [{"document": oDocument}];
	            var oSelectionOwner = oAceEditorService;
	            return oFakeSelectionService.setSelectionAndOwner(aSelection, oSelectionOwner);
	        }).then(function() {
	            return oIntellisenceService.getCodeCompletion();
	        }).then(function(oCodeCompletion) {
	        	expect(oCodeCompletion).to.equal(oTestCocoService);
	        });
		});
	});
});