//  The SaneTestFramework should be imported via 'STF' path.
define(["STF", "sinon"], function(STF, sinon) {
	"use strict";

	//  every suite must have a uniqueName. using a none unique name will cause an error.
	var suiteName = "multieditor_service_tests";

	var oTestMultiEditorService;
	var oMultiEditorControl;
	var oTestEditor1Service;
	var oTestEditor2Service;
	var oFocusService;
    var oDocument1;
    var oDocument2;
    var oTestMultiEditorServiceImpl;
    var sandbox;
    var jQuery;
    var Q;
    var sap;
    
	function clearServiceData() {
   	    oTestMultiEditorServiceImpl._mSelectedIndexByDocument = {};
   	    oTestMultiEditorServiceImpl._oDocument = null;
   	    oTestMultiEditorServiceImpl._oTabStrip.setSelectedIndex(-1);
    }
        
    function selectTab(iTabIndex) {
        oMultiEditorControl.getTabs()[iTabIndex].$().trigger( "mousedown" );
    }
    
    function createFixturesDiv(webIdeWindowObj) {
		var fixturesDiv = webIdeWindowObj.document.createElement("div");
		fixturesDiv.id = "fixtures";
		fixturesDiv.style.display = "none";
		fixturesDiv.style.visibility = "hidden";
		webIdeWindowObj.document.body.appendChild(fixturesDiv);
    }
	
	describe("MultiEditor Service Tests", function() {
		before(function() {
			return STF.startWebIde(suiteName, {config : "editor/monaco/ideplatform/plugin/multieditor/service/config.json"}).
			then(function(webIdeWindowObj) {
				oTestMultiEditorService = STF.getService(suiteName, "testMultiEditor");
				oTestEditor1Service = STF.getService(suiteName, "testEditor1");
				oTestEditor2Service = STF.getService(suiteName, "testEditor2");
				oFocusService = STF.getService(suiteName, "focus");
				sandbox = sinon.sandbox.create();
				jQuery = webIdeWindowObj.jQuery;
				Q = webIdeWindowObj.Q;
				sap = webIdeWindowObj.sap;
				createFixturesDiv(webIdeWindowObj);
				
				return STF.require(suiteName, [
					"sane-tests/util/mockDocument"
				]);
			}).spread(function(oMockDocument) {
				var MockFileDocument = oMockDocument.MockFileDocument;
				oDocument1 = new MockFileDocument("new/doc1.js", "js", "hello world1", false, false);
				oDocument2 = new MockFileDocument("new/doc2.js", "js", "hello world2", false, false);
				return STF.getServicePrivateImpl(oTestMultiEditorService).then(function(_oTestMultiEditorServiceImpl) {
					oTestMultiEditorServiceImpl = _oTestMultiEditorServiceImpl._oImplSync;
					return oTestMultiEditorService.getContent();
				}).then(function(_oMultiEditorControl) {
					oMultiEditorControl = _oMultiEditorControl;
				});
			});
		});
		
		after(function() {
			STF.shutdownWebIde(suiteName);
		});
		
		beforeEach(function() {
        	// When trigger mousedown event in test, fix(event) sap-ui-core behaves differently than in real event,
        	// and as a result "originalEvent" propery is not added to event, which leads to exception in tabstrip._isTouchMode method
    		if (oMultiEditorControl._isTouchMode) {
    			sandbox.stub(oMultiEditorControl, "_isTouchMode").returns(false);
    		}
    	    oMultiEditorControl.placeAt("fixtures");
	    	sap.ui.getCore().applyChanges();
		});

		afterEach(function() {
			sandbox.restore();
			clearServiceData();
	    	jQuery("#fixtures").empty();
		});

		it("Check initial state", function() {
			 var aPromises = [
	             oTestMultiEditorService.getAllEditors(),
	             oTestMultiEditorService.getActiveEditor(),
	             oTestMultiEditorService.containsEditor(oTestEditor1Service),
	             oTestMultiEditorService.containsEditor(oTestEditor2Service)
	        ];
	        return Q.all(aPromises).spread(function(aEditors, oActiveEditor, bContainsEditor1, bContainsEditor2) {
	        	expect(aEditors, "There should be 2 editors configured").to.have.length(2);
	            expect(aEditors[0], "First editor service should be " + oTestEditor1Service._sName).to.equal(oTestEditor1Service);
	            expect(aEditors[1], "Second editor service should be " + oTestEditor2Service._sName).to.equal(oTestEditor2Service);
	            expect(oActiveEditor, "Active editor should be editor1 at start").to.equal(oTestEditor1Service);
	            expect(bContainsEditor1, "Multi editor should contain " + oTestEditor1Service._sName).to.be.true;
	            expect(bContainsEditor2, "Multi editor should contain " + oTestEditor2Service._sName).to.be.true;
		    });
		});

		it("Open document", function() {
			var oTestEditor1Spy = sandbox.spy(oTestEditor1Service, "open");
        	return oTestMultiEditorService.open(oDocument1).then(function() {
        		expect(oTestEditor1Spy.called).to.be.true;
	        	return Q.all([oTestMultiEditorService.getActiveEditor(), 
	        	              oTestMultiEditorService.hasDocuments(),
	        	              oTestMultiEditorService.hasDocument(oDocument1)]);
        	}).spread(function(oActiveEditor, bHasDocuments, bHasDocument) {
        		expect(oActiveEditor, "Active editor should be editor1").to.equal(oTestEditor1Service);
        		expect(bHasDocuments, "Multi editor should have open documents").to.be.true;
    			expect(bHasDocument, "document1 should be open").to.be.true;
        	});
		});

		it("Open/close multiple documents", function() {
			 var oTabSelectDefer = Q.defer();
            sandbox.stub(oFocusService, "setFocus", function(oService) {
                if (oService === oTestEditor2Service) {
                    oTabSelectDefer.resolve();
                }
                return Q();
            });
        	return oTestMultiEditorService.open(oDocument1).then(function() {
        	    selectTab(1);
        	    // Wait for tab select handler to finish
        	    return oTabSelectDefer.promise;
        	}).then(function() {
        	    return oTestMultiEditorService.getActiveEditor();
        	}).then(function(oActiveEditor) {
    			expect(oActiveEditor, "Active editor is editor2 when selecting second tab").to.equal(oTestEditor2Service);
        	    return oTestMultiEditorService.open(oDocument2);
        	}).then(function() {
	    	    return oTestMultiEditorService.getActiveEditor();
        	}).then(function(oActiveEditor) {
    			expect(oActiveEditor, "Active editor should be editor1 when openning another document").to.equal(oTestEditor1Service);
    	        return oTestMultiEditorService.open(oDocument1);
        	}).then(function() {
	    	    return Q.all([oTestMultiEditorService.getActiveEditor(),
	    	                 oTestMultiEditorService.hasDocument(oDocument1),
	    	                 oTestMultiEditorService.hasDocument(oDocument2)]);
        	}).spread(function(oActiveEditor, bHasDocument1, bHasDocument2) {
        		expect(oActiveEditor, "Active editor should be editor2 when reopening first document").to.equal(oTestEditor2Service);
        		expect(bHasDocument1, "document1 should be open").to.be.true;
    			expect(bHasDocument2, "document2 should be open").to.be.true;
	            return oTestMultiEditorService.close(oDocument1);
        	}).then(function() {
        	     return Q.all([oTestMultiEditorService.hasDocument(oDocument1),
	    	                 oTestMultiEditorService.hasDocument(oDocument2)]);
        	}).spread(function(bHasDocument1, bHasDocument2) {
        		expect(bHasDocument1, "document1 should be closed").to.be.false;
    			expect(bHasDocument2, "document2 should be open").to.be.true;
        	});
		});
		
		it("Undo/Redo support", function() {
			var oEditor1SetFocus = Q.defer();
            var oEditor2SetFocus = Q.defer();
            sandbox.stub(oFocusService, "setFocus", function(oService) {
                if (oService === oTestEditor1Service) {
                    oEditor1SetFocus.resolve();
                } else if (oService === oTestEditor2Service) {
                    oEditor2SetFocus.resolve();
                }
                return Q();
            });
        	return oTestMultiEditorService.hasUndo().then(function(bHasUndo) {
    			expect(bHasUndo, "undo should not be available when no documents are open").to.be.false;
        	    return oTestMultiEditorService.open(oDocument1);
    	    }).then(function() {
    	    	return oEditor1SetFocus.promise;
    	    }).then(function() {
	        	return oTestMultiEditorService.hasUndo();
    	    }).then(function(bHasUndo) {
	    		expect(bHasUndo, "undo should not be supported on editor1").to.be.false;
    	        selectTab(1);
    	    	return oEditor2SetFocus.promise;
    	    }).then(function() {
	        	return oTestMultiEditorService.hasUndo();
    	    }).then(function(bHasUndo) {
	    		expect(bHasUndo, "undo should be supported on editor2").to.be.true;
        	});
		});

		it("Get title and tooltip", function() {
			return Q.all([oTestMultiEditorService.getTitle(),
        	            oTestMultiEditorService.getTooltip()]).spread(function(sTitle, sTooltip) {
        	    expect(sTitle, "No title when no documents are open").to.not.exist;        	
    	    	expect(sTooltip, "No tooltip when no documents are open").to.not.exist;    
        	    return oTestMultiEditorService.open(oDocument1);
    	    }).then(function() {
	        	return Q.all([oTestMultiEditorService.getTitle(),
        	            oTestMultiEditorService.getTooltip()]);
            }).spread(function(sTitle, sTooltip) {
            	expect(sTitle, "Title should be document name").to.equal(oDocument1.getEntity().getName());
    	    	expect(sTooltip, "Tooltip should be document path").to.equal(oDocument1.getEntity().getFullPath());
    	    });
		});
		
		it("setFocus() should be called on multieditor opening and on tab switching, inner editor should be rendered on each call", function() {
			var oEditor1SetFocus = Q.defer();
			var oEditor1SetFocus2 = Q.defer();
            var oEditor2SetFocus = Q.defer();
        	var bSetFocusForEditor1CalledOnce;
        	var bEditor1Rendered;
        	var bEditor1Rendered2;
    		var bEditor2Rendered;
        	var oEditor1Control;
    		var oEditor2Control;
        	
        	sandbox.stub(oFocusService, "setFocus", function(oService) {
                if (oService === oTestEditor1Service) {
            		if (bSetFocusForEditor1CalledOnce) {
            			bEditor1Rendered2 = oEditor1Control.getDomRef() != null;
            			oEditor1SetFocus2.resolve();
            		} else {
            			bSetFocusForEditor1CalledOnce = true;
            			bEditor1Rendered = true;
            			oEditor1SetFocus.resolve();
            		}
                    oEditor1SetFocus.resolve();
                } else if (oService === oTestEditor2Service) {
            		bEditor2Rendered = oEditor2Control.getDomRef() != null;
                    oEditor2SetFocus.resolve();
                }
                return Q();
            });
            
            var aEditorsContentPromises = [oTestEditor1Service.getContent(), oTestEditor2Service.getContent()];
            return Q.all(aEditorsContentPromises).spread(function(_oEditor1Control, _oEditor2Control) {
            	oEditor1Control = _oEditor1Control;
        		oEditor2Control = _oEditor2Control;
        		return oTestMultiEditorService.open(oDocument1);
    		}).then(function() {
        		return oEditor1SetFocus.promise;
    		}).then(function() {
				expect(true, "setFocus() is called for Editor1 after opening multieditor").to.be.true;
				expect(bEditor1Rendered, "Editor1 should be rendered when calling setFocus()").to.be.true;
        		selectTab(1);
        		return oEditor2SetFocus.promise;
    		}).then(function() {
				expect(true, "setFocus() is called for Editor2 after switching from first tab").to.be.true;
				expect(bEditor2Rendered, "Editor2 should be rendered when calling setFocus()").to.be.true;
        		selectTab(0);
        		return oEditor1SetFocus2.promise;
    		}).then(function() {
				expect(true, "setFocus() is called for Editor1 after switching from second tab").to.be.true;
				expect(bEditor1Rendered2, "Editor1 should be rendered when calling setFocus()").to.be.true;
        	});
		});
	});
});