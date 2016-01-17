//  The SaneTestFramework should be imported via 'STF' path.
define(["STF", "sinon"], function(STF, sinon) {
	"use strict";

	//  every suite must have a uniqueName. using a none unique name will cause an error.
	var suiteName = "aceeditorcontextmenu_service_tests";
	
	var sandbox;
	var oDocument;
	var oCommandGroupSpy;
	var oAceEditorControl;
	var oContextMenuService;
	var oCommandGroupService;
	var oAceEditorService;
	var MockFileDocument;
	var sContent = "hello world";
	var oMockMouseEvent = new MouseEvent("click");
	
	 function createFixturesDiv(webIdeWindowObj) {
		var fixturesDiv = webIdeWindowObj.document.createElement("div");
		fixturesDiv.id = "fixtures";
		fixturesDiv.style.display = "none";
		fixturesDiv.style.visibility = "hidden";
		webIdeWindowObj.document.body.appendChild(fixturesDiv);
    }
    
    function assertGroup (oGroup, sId, iNumOfSubItems) {
        expect(oGroup, "Check menu group exist").to.exist;
        expect(oGroup._sId, "Verify menu ID: " + sId).to.equal(sId);
        expect(oGroup._aItems, "verify number of sub items: actual: "+ oGroup._aItems.length + " expected: " + iNumOfSubItems).to.have.length(iNumOfSubItems);
    }
	    
    function assertDefaultGroup(oGroup) {
        //check main menu group
        assertGroup(oGroup,"commonContextMenu", 1);
        // check 1st sub menu group (default)
        var subGroup0 = oGroup._aItems[0]._oGroup ;
        assertGroup(subGroup0,"editor.undoRedo", 2);
    }
	
	describe("Ace Editor context menu items", function() {
		before(function() {
			return STF.startWebIde(suiteName, {config : "editor/monaco/ideplatform/plugin/aceeditor/service/config.json"}).
			then(function(webIdeWindowObj) {
				createFixturesDiv(webIdeWindowObj);
				oAceEditorService = STF.getService(suiteName, "aceeditor");
				oCommandGroupService = STF.getService(suiteName, "commandGroup");
				oContextMenuService = STF.getService(suiteName, "contextMenu");
				sandbox = sinon.sandbox.create();
				return oAceEditorService.getContent().then(function(_oAceEditorControl) {	
					oAceEditorControl = _oAceEditorControl;
					oAceEditorControl.placeAt("fixtures");
	    			webIdeWindowObj.sap.ui.getCore().applyChanges();
					return STF.require(suiteName, ["sane-tests/util/mockDocument"]);
				}).spread(function(oMockDocument) {
					MockFileDocument = oMockDocument.MockFileDocument;
				});
			});
		});
		
		after(function() {
			STF.shutdownWebIde(suiteName);
		});
		
		beforeEach(function() {
			sandbox.stub(oContextMenuService, "open").returns(Q());
            oCommandGroupSpy = sandbox.spy(oCommandGroupService, "getGroup");
		});
		
		afterEach(function() {
			sandbox.restore();
			return oAceEditorService.close(oDocument);
		});

		it("Default context menu items", function(done) {
	        oDocument = new MockFileDocument("new/doc.html", "html", sContent);
            oAceEditorService.open(oDocument).then(function() {
                oAceEditorControl.oEditor.textInput.onContextMenu(oMockMouseEvent);
                oCommandGroupSpy.returnValues[0].then(function(oGroup) {
                    assertDefaultGroup(oGroup);
                    done();
                }).done(); 
            }).done();
		});
		
    	//TODO add test for custom menu that configured in test consumer
        
	
	});
});