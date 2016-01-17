//  The SaneTestFramework should be imported via 'STF' path.
define(["STF"], function(STF) {
	"use strict";

	//  every suite must have a uniqueName. using a none unique name will cause an error.
	var suiteName = "aceeditor_service_tests";

	var oAceEditorService;
	var oDocument;
	var oAceEditorControl;
	var sContent = "hello world";
	var sFullPath = "new/doc.js";
	var ace;
	var jQuery;
	var sap;
	var MockFileDocument;
	
    function createFixturesDiv(webIdeWindowObj) {
		var fixturesDiv = webIdeWindowObj.document.createElement("div");
		fixturesDiv.id = "fixtures";
		fixturesDiv.style.display = "none";
		fixturesDiv.style.visibility = "hidden";
		webIdeWindowObj.document.body.appendChild(fixturesDiv);
    }
    
    function isSearchFormVisible() {
		return jQuery("div.ace_search") 
		    && jQuery("div.ace_search").css("display") === "block"
            && jQuery("div.ace_search_form").css("display") === "block"
            && jQuery("div.ace_replace_form").css("display") === "none";
	}
		
	function isSearchAndReplaceFormVisible() {
		return jQuery("div.ace_search") 
		    && jQuery("div.ace_search").css("display") === "block"
            && jQuery("div.ace_search_form").css("display") === "block"
            && jQuery("div.ace_replace_form").css("display") === "block";
	}
	
	function assertMarkerWasAdded(sClazz, iId, bInFront, oRange, sType) {
        return oAceEditorService.getMarkers(bInFront).then(function(oMarkers) {
            var bMarkerAdded = oMarkers[iId] 
                && oMarkers[iId].clazz === sClazz
                && oMarkers[iId].id === iId
                && oMarkers[iId].inFront === bInFront
                && oMarkers[iId].range === oRange 
                && oMarkers[iId].type === sType;
            expect(bMarkerAdded).to.be.true;
        });
	}
	
	describe("Ace Editor Service Tests", function() {
		before(function(done) {
			STF.startWebIde(suiteName, {config : "editor/monaco/ideplatform/plugin/aceeditor/service/config.json"}).
			then(function(webIdeWindowObj) {
				ace = webIdeWindowObj.ace;
				createFixturesDiv(webIdeWindowObj);
				oAceEditorService = STF.getService(suiteName, "aceeditor");
				return oAceEditorService.getContent().then(function(_oAceEditorControl) {	
					jQuery = webIdeWindowObj.jQuery;
					sap = webIdeWindowObj.sap;
					oAceEditorControl = _oAceEditorControl;
					ace = webIdeWindowObj.ace;
					return STF.require(suiteName, ["sane-tests/util/mockDocument"]);
				}).spread(function(oMockDocument) {
					MockFileDocument = oMockDocument.MockFileDocument;
					ace.config.loadModule("ace/mode/javascript", function() {
						done();
					});
				});
			}).done();
		});
		
		after(function() {
			STF.shutdownWebIde(suiteName);
		});
		
		beforeEach(function() {
			oAceEditorControl.placeAt("fixtures");
	    	sap.ui.getCore().applyChanges();
    		oDocument = new MockFileDocument(sFullPath, "js", sContent);
			return oAceEditorService.open(oDocument);
		});
		
		afterEach(function() {
			return oAceEditorService.close(oDocument).then(function() {
	       		jQuery("#fixtures").empty();
	        });
		});

		it("Open/Close Editor", function() {
			 return oAceEditorService.getVisible().then(function(bIsVisible) {
			 	expect(bIsVisible, "Editor is visible after opening").to.be.true;
                expect(oAceEditorControl.getSession(), "Edit session was created").to.exist;
                expect(oAceEditorControl.getValue(), "Editor content is as expected").to.equal(sContent);
                return oAceEditorService.close(oDocument);
            }).then(function() {     
                return oAceEditorService.getVisible();
            }).then(function(bIsVisible) {
            	expect(bIsVisible, "Editor is not visible after closing").to.be.false;
            });
		});

		it("Add String", function() {
			return oAceEditorService.addString("myText").then(function() {
				expect(oAceEditorControl.getValue(), "Editor content was updated").to.equal("myText" + sContent);
        	});
		});

		it("Toggle JS Line Comment", function() {
			return oAceEditorService.toggleComment().then(function() {
				expect(oAceEditorControl.getValue(), "Line Comment was added").to.equal("// " + sContent);
        	});
		});
		
		it("Toggle JS Block Comment", function() {
			 return oAceEditorService.executeCommand("selecttolineend").then(function() {
            	return oAceEditorService.toggleBlockComment();
            }).then(function() {
        		expect(oAceEditorControl.getValue(), "Block Comment was added").to.equal("/*" + sContent + "*/");
        	});
		});

		it("Set Font Size", function() {
			 return oAceEditorService.setFontSize("16px").then(function() {
                var sFontsize = oAceEditorControl.oEditor.getOption("fontSize"); 
                expect(sFontsize, "Editor Font Size is as expected").to.equal("16px");
            });  
		});
		
		it("set Theme", function() {
			 return oAceEditorService.setTheme("ace/theme/sap-basement").then(function() {
               return oAceEditorService.getTheme();
            }).then(function(sTheme) {
            	expect(sTheme, "Theme set was success").to.equal("ace/theme/sap-basement");
            });
		});
		
		it("Get Tooltip", function() {
			return oAceEditorService.getTooltip().then(function(sTooltip) {
				expect(sTooltip, "Editor tooltip is as expected").to.equal(sFullPath);
            });
		});
		
		it("Get Title", function() {
			return oAceEditorService.getTitle().then(function(sTitle) {
				expect(sTitle, "Editor title is as expected").to.equal(sFullPath);
            });
		});
		
		it("Get Name", function() {
			return oAceEditorService.getName().then(function(sName) {
				expect(sName, "Editor name is as expected").to.equal("aceeditor");
            });
		});
		
		it("Index to Position", function() {
			var sNewContent = "hello\nworld";
            oAceEditorControl.setValue(sNewContent);
            return oAceEditorService.indexToPosition(7,0).then(function(oPosition) {
            	expect(oPosition).to.deep.equal({row: 1, column: 1});
            });
		});
		
		it("Position to Index", function() {
			var oPosition = {row: 0, column: 1};
            return oAceEditorService.positionToIndex(oPosition, 0).then(function(iIndex) {
        		expect(iIndex).to.equal(1);
            });
		});
		
		it("Go to Line", function() {
			var sNewContent = "hello\nworld";
            oAceEditorControl.setValue(sNewContent);
            return oAceEditorService.gotoLine(1,5,false).then(function() {    
                return oAceEditorService.addString("2");
            }).then(function() {
                expect(oAceEditorControl.getValue()).to.equal("hello2\nworld");
            });
		});
		
		it("Add Todo", function() {
			var sNewContent = "hello\nworld";
            oAceEditorControl.setValue(sNewContent);
            return oAceEditorService.gotoLine(2, 2, false).then(function() {    
                return oAceEditorService.addTodo();
            }).then(function() {
                expect(oAceEditorControl.getValue()).to.equal("hello\nwo// TODO: rld");
            });
		});
		
		it("Show Find", function() {
			return oAceEditorService.showFind().then(function() {   
                expect(isSearchFormVisible()).to.be.true;
            });
		});
		
		it("Show Replace", function() {
			return oAceEditorService.showReplace().then(function() {  
				expect(isSearchAndReplaceFormVisible()).to.be.true;
            });
		});
		
		it("Add/Remove Front Marker", function() {
			var Range = ace.require("ace/range").Range;
            var oRange = new Range(0,0,0,3);
            var sClazz = "new_class";
            var sType = "new_type";
            var bInFront = true;
            var iMarkerId;
         
            return oAceEditorService.addMarker(oRange, sClazz, sType, bInFront).then(function(iId) {  
                iMarkerId = iId;
                return assertMarkerWasAdded(sClazz, iMarkerId, bInFront, oRange, sType);
            }).then(function() {
                return oAceEditorService.removeMarker(iMarkerId);
            }).then(function() {
                return oAceEditorService.getMarkers(bInFront);
            }).then(function(oMarkers) {
            	expect(oMarkers[iMarkerId]).to.not.exist;
            });
		});
		
		it("Add/Remove Back Marker", function() {
			var Range = ace.require("ace/range").Range;
            var oRange = new Range(0,0,0,3);
            var sClazz = "new_class";
            var sType = "new_type";
            var bInFront = false;
            var iMarkerId;
         
            return oAceEditorService.addMarker(oRange, sClazz, sType, bInFront).then(function(iId) {  
                 iMarkerId = iId;
                 return assertMarkerWasAdded(sClazz, iMarkerId, bInFront, oRange, sType);
            }).then(function() {
                return oAceEditorService.removeMarker(iMarkerId);
            }).then(function() {
                return oAceEditorService.getMarkers(bInFront);
            }).then(function(oMarkers) {
        		expect(oMarkers[iMarkerId]).to.not.exist;
            });
		});
		
		it("Has Undo/Redo on opening", function() {
			 return oAceEditorService.hasUndo().then(function(bHasUndo) {
                expect(bHasUndo).to.be.false;
                return oAceEditorService.hasRedo();
            }).then(function(bHasRedo) {
                expect(bHasRedo).to.be.false;
                return oAceEditorService.isClean();
            }).then(function(bIsClean) {
                expect(bIsClean).to.be.true;
            }); 
		});
		
		it("Undo/Redo", function() {
			var sText = "myText";
       	    // attach to "liveChange", otherwise undomanager will be checked too early
    		var oDeferred = Q.defer();
    		oAceEditorControl.attachEventOnce("liveChange", function(){
    			oDeferred.resolve();
    		});

           	return Q.all([oAceEditorService.hasUndo(), oAceEditorService.hasRedo(), oAceEditorService.isClean()])
           	.spread(function(bHasUndo, bHasRedo, bIsClean) {
                expect(bHasUndo, "Undo stack should be empty at start").to.be.false;
                expect(bHasRedo, "Redo stack should be empty at start").to.be.false;
                expect(bIsClean, "Dirty counter should be clean at start").to.be.true;
	            return oAceEditorService.addString(sText);
            }).then(function() {
            	expect(oAceEditorControl.getValue()).to.equal(sText + sContent);
	        	return oDeferred.promise;
	        }).then(function(){
            	return Q.all([oAceEditorService.hasUndo(), oAceEditorService.hasRedo(), oAceEditorService.isClean()]);
            }).spread(function(bHasUndo, bHasRedo, bIsClean) {
            	expect(bHasUndo, "should have undo after change").to.be.true;
            	expect(bHasRedo, "Redo stack should be empty after change").to.be.false;
        		expect(bIsClean, "Dirty counter should not be clean after change").to.be.false;
	            return oAceEditorService.undo();
            }).then(function() {
            	expect(oAceEditorControl.getValue(), "Editor content should be reverted after undo").to.equal(sContent);
            	return Q.all([oAceEditorService.hasUndo(), oAceEditorService.hasRedo(), oAceEditorService.isClean()]);
            }).spread(function(bHasUndo, bHasRedo, bIsClean) {
        		expect(bHasUndo, "Undo stack should be empty after undo operation").to.be.false;
    			expect(bHasRedo, "Should have redo after undo operation").to.be.true;
				expect(bIsClean, "Dirty counter should be clean after undo operation").to.be.true;
                return oAceEditorService.redo();
            }).then(function() {
            	expect(oAceEditorControl.getValue(), "Editor content should be updated after redo").to.equal(sText + sContent);
            	return Q.all([oAceEditorService.hasUndo(), oAceEditorService.hasRedo(), oAceEditorService.isClean()]);
            }).spread(function(bHasUndo, bHasRedo, bIsClean) {
        		expect(bHasUndo, "Should have undo after redo operation").to.be.true;
        		expect(bHasRedo, "Redo stack should be empty after redo operation").to.be.false;
    			expect(bIsClean, "Dirty counter should not be clean after redo operation").to.be.false;
                return oAceEditorService.markClean();
            }).then(function() {
                return oAceEditorService.isClean();
            }).then(function(bIsClean) {
        		expect(bIsClean, "Dirty counter should be clean after markClean operation").to.be.true;
            });
		});
	});
});