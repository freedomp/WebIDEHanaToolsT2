define(["sap/watt/core/q"], function (coreQ) {
	"use strict";
	
	function createFixturesDiv(webIdeWindowObj) {
		var fixturesDiv = webIdeWindowObj.document.createElement("div");
		fixturesDiv.id = "fixtures";
		fixturesDiv.style.visibility = "hidden";
		webIdeWindowObj.document.body.appendChild(fixturesDiv);
    }
    
	var bINVISIBLE = false;
	var bVISIBLE = true;
	var bWITH_HEADER = true;
	var bWITHOUT_HEADER = false;
	var sACE_ID = "ace";
	var sOTHER_ID = "other";
	
	
	var Document = function(sTitle, sFullPath, bDirty) {
		this.title = sTitle;
		this.entity = {
			getFullPath : function() {
				return this.fullPath;
			}
		};
		this.fullPath = sFullPath;
		this.dirty = bDirty;

		this.getEntity = function() {
			return this.entity;
		};

		this.isDirty = function() {
			return this.dirty;
		};

		this.getTitle = function() {
			return this.title;
		};
	};
	var Decorator = function (sTitle) {
	    this.sTitle = sTitle;
	    this.getHeader = function() {
        	return Q(new sap.ui.commons.Label({text:sTitle}));
	    };
	};
	var aTabs = [];
		   
	//Hardcoded values for the test with decorators
	var oContentServiceMock = {
			_getTab : function(iIndex){
				return {
					getDocument : function() {
						return aTabs[iIndex].document;
					},
					getDecorator : function() {
					    return aTabs[iIndex].decorator;
					}
				};
			}
	};
	
	var oAceEditorControl;
	var oOtherEditor;
	var oViewController;
	var oView;
	
	function buildTabSettings(sTitle, sFullQualifiedName, oEditorControl, bDirty) {
		var oDocument = new Document(sTitle, sFullQualifiedName, bDirty);
		return {
			title : sTitle,
			tooltip : sFullQualifiedName,
			fullQualifiedName : sFullQualifiedName,
			editorControl : oEditorControl,
			document : oDocument,
			editorClass : oEditorControl.getId()
		};
	}

	function getNavBar() {
		var oNavBar = sap.ui.getCore().byId("testContentView--tabStripNavBar");
		expect(oNavBar, "NavBar available").to.exist;
		return oNavBar;
	}
	
	function openEditorTab(sTitle, sFullQualifiedName,bEditorVisible,oEditorControl) {
		var oTabSettings = buildTabSettings(sTitle, sFullQualifiedName, oEditorControl);
		var iIndex = oViewController.createTab(oTabSettings, bEditorVisible);
		sap.ui.getCore().applyChanges();
		return iIndex;
	}
	
	function openAceEditorTab(sTitle, sFullQualifiedName,bEditorVisible) {
		return openEditorTab(sTitle, sFullQualifiedName,bEditorVisible, oAceEditorControl);
	}
	
	function openOtherEditorTab(sTitle, sFullQualifiedName,bEditorVisible) {
		return openEditorTab(sTitle, sFullQualifiedName,bEditorVisible, oOtherEditor);
	}
	

	
	function expectingEditorDivIsAvailable(sEditorId,bEditorVisible,bWithHeader) {
		sap.ui.getCore().applyChanges();
			
		var oEditorArea = jQuery(".wattEditorArea");
		expect(oEditorArea.is(":hidden"), "Editor Area should be visible").to.be.false;
		var oEditorDiv = oEditorArea.find(".wattEditor_"+sEditorId);
		expect(oEditorDiv, "Only one " + sEditorId + " Editor div should be available").to.have.length(1);
		expect(!oEditorDiv.is(":hidden"), "Editor "+sEditorId + " Visibility="+bEditorVisible).to.equal(bEditorVisible);
		var oEditorHeaderDiv = oEditorArea.find(".wattEditor_"+sEditorId+"_header");
		expect(oEditorHeaderDiv, "Header for " + sEditorId + " should be available").to.have.length(1);
		expect(!oEditorHeaderDiv.is(":hidden"),"Header should be visible="+bWithHeader).to.equal(!!bWithHeader);
		if(bWithHeader){
			expect(oEditorHeaderDiv.children()).to.have.length(1);
		}
	}
	
	function expectingAceEditorDivToBe(bEditorVisible,bWithHeader) {
		expectingEditorDivIsAvailable(sACE_ID, bEditorVisible,bWithHeader);
	}
	
	function expectingOtherEditorDivToBe(bEditorVisible,bWithHeader) {
		expectingEditorDivIsAvailable(sOTHER_ID, bEditorVisible,bWithHeader);
	}

	
	function expectingInitialAreToBe(bVisible) {
		var oEditorArea = jQuery(".wattEditorArea");
		var oInitialAreaDiv = oEditorArea.find(".wattContentInitialArea");
		expect(!oInitialAreaDiv.is(":hidden"),"Initial Area should be visible="+bVisible).to.equal(bVisible);
	}
		
	describe("Content view", function () {

		var oldWindowQ;

		before(function() {
			createFixturesDiv(window);
			oldWindowQ = window.Q;
			window.Q = coreQ;	//core Q is needed here because content controller is using Q.sap.queue
			jQuery.sap.require("sap.watt.ideplatform.plugin.aceeditor.control.Editor");
		});
		
		after(function() {
			window.Q = oldWindowQ;
			$("#fixtures").remove();
		});
		
		beforeEach(function() {
			aTabs = [
    		    {
    		        document:  new Document("Decoration 1"),
    		        decorator: new Decorator("Decoration 1")
    		    },
    		    {
    		        document:  new Document("Decoration 2"),
    		        decorator: new Decorator("Decoration 2")
    		    },
    		    {
    		        document:  new Document("Undecorated")
    		        
    		    },
    		    {
    		        document:  new Document("Decoration 3"),
    		        decorator: new Decorator("Decoration 3")
    		    },
    		    {
    		        document:  new Document("Decoration 4"),
    		        decorator: new Decorator("Decoration 4")
    		    }
		    ];
	    
			oView = sap.ui.view({
				id : "testContentView",
				viewName : "sap.watt.platform.plugin.content.view.Content",
				type : sap.ui.core.mvc.ViewType.XML
			});
			oViewController = oView.getController();
			//HACK TO CIRCUMVENT UI5 BUG CACHING Controller (new Controller line 44 taking it from mRegistry instead of creating it new) instances
			oViewController._mEditors = [];
			oViewController._oNavigation = new Navigation();
			oViewController.setContext(oContentServiceMock, null);

			oView.placeAt("fixtures");
			
			oAceEditorControl = new sap.watt.common.plugin.aceeditor.control.Editor({id : sACE_ID});
			oOtherEditor = {
					
					isPlaced : false,
					
					getId : function() {
						return sOTHER_ID;
					},
					placeAt : function() {
						this.isPlaced = true;
					},
					destroy : function() {
					}
			};
			
			sap.ui.getCore().applyChanges();
			expect(oView).to.exist;
		});
		
		afterEach(function() {
			oAceEditorControl.destroy();
			oView.destroy();
			$("#fixtures").empty();	
		});
		
		it("Close Tab selected after previous selected was closed ", function() {
			var oDeferred = Q.defer();
			
			openAceEditorTab("file.js", "/close3/file.js", bVISIBLE);
			openOtherEditorTab("file2.js", "/close3/file2.js", bVISIBLE);
			openAceEditorTab("file3.js", "/close3/file3.js", bVISIBLE);
			
			oViewController.attachEventOnce("contentTabSelected",function(){
                oViewController.attachEventOnce("contentTabSelected",function(){
                    oViewController.attachEventOnce("contentTabSelected",function(){
	    	            oDeferred.resolve();
                    });
                    oViewController.closeTab();    
                });
            	oViewController.closeTab();
			});
			
		    oViewController.showTab(0);
		    
			return oDeferred.promise.then(function(){
			    expect(oViewController.getSelectedIndex(), "Correct Tab Index selected").to.equal(0);    
			});

		});

		it("Create Tab, expecting corresponding editors to be opened", function() {
			var iTabIndex = -1;
			
			expectingInitialAreToBe(bVISIBLE);
			
			iTabIndex = openAceEditorTab("file.js", "/hugo/file.js", bINVISIBLE);
			
			expect(iTabIndex, "First Tab opened at index 0").to.equal(0);
			var oNavBar = getNavBar();
			expect(oNavBar.getTabTitle(iTabIndex), "Tab Title correct").to.equal("file.js");
			expect(oAceEditorControl.getDomRef().parentElement, "Editor is placed").to.exist;
			
			expectingAceEditorDivToBe(bINVISIBLE);
			
			oViewController.showTab(0);
			expectingAceEditorDivToBe(bVISIBLE);
			expectingInitialAreToBe(bINVISIBLE);
		});

		it("Create multiple Tabs, show and hide", function() {

			openAceEditorTab("file.js", "/multi/file.js", bVISIBLE);
			
			openOtherEditorTab("file2.js", "/foo2/file2.js", bINVISIBLE);
			
			expectingOtherEditorDivToBe(bINVISIBLE);
			
			oViewController.showTab(0);
			sap.ui.getCore().applyChanges();
			
			expectingAceEditorDivToBe(bVISIBLE);

		});
		
		it("Open the same file in multiple editors", function() {

			openAceEditorTab("file.js", "/multi/file.js", bVISIBLE);
			
			openOtherEditorTab("file.js", "/multi/file.js", bVISIBLE);
			
			expect(oViewController.getAllTabIndexes(), "both editors open").to.have.length(2);

		});
		
		it("Tabs switching", function() {

			openAceEditorTab("file.js", "/switch/file.js", bVISIBLE);
			openOtherEditorTab("file2.js", "/switch/file2.js", bVISIBLE);
			openAceEditorTab("file3.js", "/switch/file3.js", bVISIBLE);

			expectingAceEditorDivToBe(bVISIBLE);
			
			oViewController.onTabSelected({
				getParameter : function(sParam) {
					switch (sParam) {
						case "clicked":
							return true;
						case "index":
							return 1;
						case "editorClass":
							return "wattEditor_"+sOTHER_ID;
					}
				}
			});
			
			expectingAceEditorDivToBe(bINVISIBLE);
			expectingOtherEditorDivToBe(bVISIBLE);
			
		});
		
		it("Tabs switching with Decorator", function() {
			
			function attachTabHeaderHandledWait(){
				var oWaitUntilHeaderHandled = Q.defer();
				oViewController.attachEventOnce("tabHeaderHandled", function() {
					oWaitUntilHeaderHandled.resolve();
				});
				return oWaitUntilHeaderHandled.promise;
			}
		
			//start the test by first attaching the assertion as event handler
			var oWaitUntilHeaderHandled = attachTabHeaderHandledWait();
			
			openAceEditorTab("file.js", "/switch2/file.js",bVISIBLE);
			return oWaitUntilHeaderHandled.then(function() {
				expectingAceEditorDivToBe(bVISIBLE,bWITH_HEADER);
			}).then(function() {
				oWaitUntilHeaderHandled = attachTabHeaderHandledWait();
				
				openOtherEditorTab("file2.js", "/switch2/file2.js", bVISIBLE);
				
				return oWaitUntilHeaderHandled.then(function() {
					expectingAceEditorDivToBe(bINVISIBLE,bWITHOUT_HEADER);
					expectingOtherEditorDivToBe(bVISIBLE,bWITH_HEADER);
				});
			}).then(function() {
				oWaitUntilHeaderHandled = attachTabHeaderHandledWait();
				
				openAceEditorTab("file3.js", "/switch2/file3.js", bVISIBLE);
				
				return oWaitUntilHeaderHandled.then(function() {
					expectingAceEditorDivToBe(bVISIBLE,bWITHOUT_HEADER);
					expectingOtherEditorDivToBe(bINVISIBLE,bWITHOUT_HEADER);
				});
			}).then(function() {
				oWaitUntilHeaderHandled = attachTabHeaderHandledWait();
				
				openAceEditorTab("file4.js", "/switch2/file4.js", bVISIBLE);
				
				return oWaitUntilHeaderHandled.then(function() {
					expectingAceEditorDivToBe(bVISIBLE,bWITH_HEADER);
					expectingOtherEditorDivToBe(bINVISIBLE,bWITHOUT_HEADER);
				});
			}).then(function() {
				oWaitUntilHeaderHandled = attachTabHeaderHandledWait();
				
				oViewController.showTab(1);
				
				return oWaitUntilHeaderHandled.then(function() {
					expectingAceEditorDivToBe(bINVISIBLE,bWITHOUT_HEADER);
					expectingOtherEditorDivToBe(bVISIBLE,bWITH_HEADER);
				});
			}).then(function() {
				oWaitUntilHeaderHandled = attachTabHeaderHandledWait();
				
				oViewController.showTab(0);
				
				return oWaitUntilHeaderHandled.then(function() {
					expectingAceEditorDivToBe(bVISIBLE,bWITH_HEADER);
					expectingOtherEditorDivToBe(bINVISIBLE,bWITHOUT_HEADER);
				});
			});
		});
		
 		it("Close current Tab", function() {

 			openAceEditorTab("file.js", "/close1/file.js", bVISIBLE);

 			expectingAceEditorDivToBe(bVISIBLE);
			
 			return oViewController.closeTab().then(function(){
 	 			expectingAceEditorDivToBe(bINVISIBLE);
 	 			expectingInitialAreToBe(bVISIBLE);
 			});
 		});
		
		it("Close multiple Tabs", function() {

			openAceEditorTab("file.js", "/close2/file.js", bVISIBLE);
			openOtherEditorTab("file2.js", "/close2/file2.js", bVISIBLE);
			openAceEditorTab("file3.js", "/close2/file3.js", bVISIBLE);
			
			expectingInitialAreToBe(bINVISIBLE);
			
			oViewController.closeAll(false);
			
			expectingInitialAreToBe(bVISIBLE);
		});
		
		it("Close other Tabs",  function() {
			
			openAceEditorTab("file.js", "/close3/file.js", bVISIBLE);
			openOtherEditorTab("file2.js", "/close3/file2.js", bVISIBLE);
			openAceEditorTab("file3.js", "/close3/file3.js", bVISIBLE);
			
			var sId = getNavBar().getTabIdByIndex(1);
			aTabs.splice(1,1); // for test reason only
			return oViewController.closeTab(sId, false).then(function(){
			    expectingInitialAreToBe(bINVISIBLE);
				expectingAceEditorDivToBe(bVISIBLE);
				expectingOtherEditorDivToBe(bINVISIBLE);
			});
		});
		
		it("Close other Tabs with dataloss", function() {

			openAceEditorTab("file.js", "/close3/file.js", bVISIBLE);
			openOtherEditorTab("file2.js", "/close3/file2.js", bVISIBLE);
			openAceEditorTab("file3.js", "/close3/file3.js", bVISIBLE);

			//var oTab = sap.ui.getCore().byId("tab_1");
			var sId = getNavBar().getSelectedTabId();
			var oTab = sap.ui.getCore().byId(sId);
			oViewController.closeOthers(oTab);
			
			expectingInitialAreToBe(bINVISIBLE);
			expectingAceEditorDivToBe(bVISIBLE);
			expectingOtherEditorDivToBe(bINVISIBLE);
			
		});
		it("Close Tab selected - select previous left ", function() {
			var oDeferred = Q.defer();
			
			openAceEditorTab("file.js", "/close3/file.js", bVISIBLE);
			openOtherEditorTab("file2.js", "/close3/file2.js", bVISIBLE);
			openAceEditorTab("file3.js", "/close3/file3.js", bVISIBLE);
			
			oViewController.attachEventOnce("contentTabSelected",function (){
                if (oViewController.getSelectedIndex() === 0) {
                    oViewController.attachEventOnce("contentTabSelected",function() {
                        if (oViewController.getSelectedIndex() === 1) {
    		    	        oViewController.closeTab();
    		    	        oDeferred.resolve();
                        }
                    });
                    oViewController.showTab(1);
                }
			});
			
		    oViewController.showTab(0);
		    
			return oDeferred.promise.then(function(){
			    expect(oViewController.getSelectedIndex(), "Correct Tab Index selected (myTest)").to.equal(0);    
			});

		});
		
		it("Close Tab selected - select previous right ", function() {
			var oDeferred = Q.defer();
			
			openAceEditorTab("file.js", "/close3/file.js", bVISIBLE);
			openOtherEditorTab("file2.js", "/close3/file2.js", bVISIBLE);
			openAceEditorTab("file3.js", "/close3/file3.js", bVISIBLE);
			
			oViewController.attachEventOnce("contentTabSelected",function(){
                if (oViewController.getSelectedIndex() === 0) {
                    oViewController.attachEventOnce("contentTabSelected",function(){
                        if (oViewController.getSelectedIndex() === 2) {
                            oViewController.attachEventOnce("contentTabSelected", function(){
	    		    	        oViewController.closeTab();
		    	    	        oDeferred.resolve();
                            });
                    		oViewController.showTab(1);    
                        }
                    });
                    oViewController.showTab(2);
                }
			});
			
		    oViewController.showTab(0);
		    
			return oDeferred.promise.then(function(){
			    expect(oViewController.getSelectedIndex(), "Correct Tab Index selected").to.equal(1);    
			});

		});
	
		it("Close Tab unselected - select previous left ", function() {
			var oDeferred = Q.defer();
			openAceEditorTab("file.js", "/close3/file.js", bVISIBLE);
			openOtherEditorTab("file2.js", "/close3/file2.js", bVISIBLE);
			openAceEditorTab("file3.js", "/close3/file3.js", bVISIBLE);
			
			oViewController.attachEventOnce("contentTabSelected",function() {
                if (oViewController.getSelectedIndex() === 0) {
					var sId = getNavBar().getTabIdByIndex(1);
	    	        oViewController.closeTab(sId);
	    	        oDeferred.resolve();
                }
			});
			
		    oViewController.showTab(0);
		    
			return oDeferred.promise.then(function(){
			    expect(oViewController.getSelectedIndex(), "Correct Tab Index selected").to.equal(0);    
			});

		});

	    it("Navigations are diabled when only 1 tab exist", function() {

 			openAceEditorTab("file.js", "/close1/file.js", bVISIBLE);
			
 			expect(oViewController.hasNavigateBack(), "Expecting Navigate Back to be disabled").to.be.false;
 			expect(oViewController.hasNavigateForward(), "Expecting Navigate Forward to be disabled").to.be.false;
 		});
 		
 		it("Navigation forward diabled when only 2 tabs exist and focus on second(file1,file2)", function() {

 			openAceEditorTab("file0.js", "/open/file0.js", bVISIBLE);
			openOtherEditorTab("file1.js", "/open/file1.js", bVISIBLE);

			expect(oViewController.hasNavigateBack(), "Expecting Navigate Back to be enabled").to.be.true;
 			expect(oViewController.hasNavigateForward(), "Expecting Navigate Forward to be disabled").to.be.false;
 		});
 		
 		it("Navigation forward diabled when only 2 tabs exist and focus on first(file1,file2,file1)", function() {

 			openAceEditorTab("file0.js", "/open/file0.js", bVISIBLE);
			openOtherEditorTab("file1.js", "/open/file1.js", bVISIBLE);
			
			expect(oViewController.hasNavigateBack(), "Expecting Navigate Back to be enabled").to.be.true;
 			expect(oViewController.hasNavigateForward(), "Expecting Navigate Forward to be disabled").to.be.false;
 		});
 		
 		it("Navigation forward diabled when 3 tabs exist and focus on last(file1,file2,file3)", function() {

 			openAceEditorTab("file0.js", "/open/file0.js", bVISIBLE);
			openOtherEditorTab("file1.js", "/open/file1.js", bVISIBLE);
			openAceEditorTab("file2.js", "/open/file2.js", bVISIBLE);
		
			expect(oViewController.hasNavigateBack(), "Expecting Navigate Back to be enabled").to.be.true;
 			expect(oViewController.hasNavigateForward(), "Expecting Navigate Forward to be disabled").to.be.false;
 		});


 		it("Open 3 tabs and navigate back once(file1,file2,file3)", function() {

 			openAceEditorTab("file0.js", "/open/file0.js", bVISIBLE);
			openOtherEditorTab("file1.js", "/open/file1.js", bVISIBLE);
			openAceEditorTab("file2.js", "/open/file2.js", bVISIBLE);
			
			oViewController.navigateBack();
			
			expect(oViewController.getSelectedIndex(), "One back will return to the second item").to.equal(1);
 			expect(oViewController.hasNavigateBack(), "Expecting Navigate Back to be enabled").to.be.true;
 			expect(oViewController.hasNavigateForward(), "Expecting Navigate Forward to be enabled").to.be.true;
 		});
 		
 		it("Open 4 tabs and navigate back twice(file1,file2,file3,file4)", function() {

 			openAceEditorTab("file0.js", "/open/file0.js", bVISIBLE);
			openOtherEditorTab("file1.js", "/open/file1.js", bVISIBLE);
			openOtherEditorTab("file2.js", "/open/file2.js", bVISIBLE);
		    openOtherEditorTab("file3.js", "/open/file3.js", bVISIBLE);

			oViewController.navigateBack();
			oViewController.navigateBack();
			
			expect(oViewController.getSelectedIndex(), "One back will return to the second item").to.equal(1);
 			expect(oViewController.hasNavigateBack(), "Expecting Navigate Back to be enabled").to.be.true;
 			expect(oViewController.hasNavigateForward(), "Expecting Navigate Forward to be enabled").to.be.true;
 		});
 		
 		it("Open 4 tabs and navigate back 3 times(file1,file2,file3,file4)", function() {

 			openAceEditorTab("file0.js", "/open/file0.js", bVISIBLE);
			openOtherEditorTab("file1.js", "/open/file1.js", bVISIBLE);
			openOtherEditorTab("file2.js", "/open/file2.js", bVISIBLE);
		    openOtherEditorTab("file3.js", "/open/file3.js", bVISIBLE);
		    
			oViewController.navigateBack();
			oViewController.navigateBack();
			oViewController.navigateBack();
			
			expect(oViewController.getSelectedIndex(), "One back will return to the second item").to.equal(0);
 			expect(oViewController.hasNavigateBack(), "Expecting Navigate Back to be disabled").to.be.false;
 			expect(oViewController.hasNavigateForward(), "Expecting Navigate Forward to be enabled").to.be.true;
 		});
 		
 		it("Open 4 tabs and navigate back 2 times and forward 1 time", function() {

 			openAceEditorTab("file0.js", "/open/file0.js", bVISIBLE);
			openOtherEditorTab("file1.js", "/open/file1.js", bVISIBLE);
			openOtherEditorTab("file2.js", "/open/file2.js", bVISIBLE);
		    openOtherEditorTab("file3.js", "/open/file3.js", bVISIBLE);
		    
			oViewController.showTab(3);
			
			oViewController.navigateBack();
			oViewController.navigateBack();
			oViewController.navigateForward();
			
			expect(oViewController.getSelectedIndex(), "One back will return to the second item").to.equal(2);
 			expect(oViewController.hasNavigateBack(), "Expecting Navigate Back to be enabled").to.be.true;
 			expect(oViewController.hasNavigateForward(), "Expecting Navigate Forward to be enabled").to.be.true;
 		});
 		
 		it("Open 4 tabs and navigate back 2 times and forward 2 times", function() {

 			openAceEditorTab("file0.js", "/open/file0.js", bVISIBLE);
			openOtherEditorTab("file1.js", "/open/file1.js", bVISIBLE);
			openOtherEditorTab("file2.js", "/open/file2.js", bVISIBLE);
		    openOtherEditorTab("file3.js", "/open/file3.js", bVISIBLE);
			
			oViewController.navigateBack();
			oViewController.navigateBack();
			oViewController.navigateForward();
			oViewController.navigateForward();
			
			expect(oViewController.getSelectedIndex(), "One back will return to the second item").to.equal(3);
 			expect(oViewController.hasNavigateBack(), "Expecting Navigate Back to be enabled").to.be.true;
 			expect(oViewController.hasNavigateForward(), "Expecting Navigate Forward to be disabled").to.be.false;
 		});
 		
 		it("Open 4 tabs and navigate back and forward + close file", function() {

 			openAceEditorTab("file0.js", "/open/file0.js", bVISIBLE);
			openOtherEditorTab("file1.js", "/open/file1.js", bVISIBLE);
			openOtherEditorTab("file2.js", "/open/file2.js", bVISIBLE);
		    openOtherEditorTab("file3.js", "/open/file3.js", bVISIBLE);
			
			oViewController.navigateBack();
			oViewController.navigateBack();
			oViewController.navigateForward();
			oViewController.navigateForward();

			oViewController.closeTabs([2]); //close file2
			expect(oViewController.getSelectedIndex(), "We will get file3, index 2").to.equal(2);
			
			oViewController.navigateBack();//to 
			expect(oViewController.getSelectedIndex(), "We will get file1, index 1").to.equal(1);
			
 			expect(oViewController.hasNavigateBack(), "Expecting Navigate Back to be enabled").to.be.true;
 			expect(oViewController.hasNavigateForward(), "Expecting Navigate Forward to be enabled").to.be.true;
 		});
 	
 	 	it("Open 4 tabs and navigate 2 back  + close file", function() {

 			openAceEditorTab("file0.js", "/open/file0.js", bVISIBLE);
			openOtherEditorTab("file1.js", "/open/file1.js", bVISIBLE);
			openOtherEditorTab("file2.js", "/open/file2.js", bVISIBLE);
		    openOtherEditorTab("file3.js", "/open/file3.js", bVISIBLE);
		    
			oViewController.navigateBack();
			oViewController.navigateBack();
			
			oViewController.closeTabs([2]); //close file2
			expect(oViewController.getSelectedIndex(), "We will get file1, index 1").to.equal(1);
			
			oViewController.navigateForward();
			expect(oViewController.getSelectedIndex(), "We will get file3, index 2").to.equal(2);
			
 			expect(oViewController.hasNavigateBack(), "Expecting Navigate Back to be enabled").to.be.true;
 			expect(oViewController.hasNavigateForward(), "Expecting Navigate Forward to be disabled").to.be.false;
 		});	
 		
 		it("Open 4 tabs and navigate 2 back  + forward+ close + back + close", function() {

 			openAceEditorTab("file0.js", "/open/file0.js", bVISIBLE);
			openOtherEditorTab("file1.js", "/open/file1.js", bVISIBLE);
			openOtherEditorTab("file2.js", "/open/file2.js", bVISIBLE);
		    openOtherEditorTab("file3.js", "/open/file3.js", bVISIBLE);
		    
			oViewController.navigateBack();
			oViewController.navigateBack();
			
			oViewController.navigateForward();
			expect(oViewController.getSelectedIndex(), "We will get file3, index 2").to.equal(2);
			
			oViewController.closeTabs([2]); //close file2
			expect(oViewController.getSelectedIndex(), "We will get file1, index 1").to.equal(1);
			
			oViewController.navigateBack();
			expect(oViewController.getSelectedIndex(), "We will get file0, index 0").to.equal(0);
			
			oViewController.closeTabs([2]); //close file2
			expect(oViewController.getSelectedIndex(), "We will get file0, index 0").to.equal(0);
			
 			expect(oViewController.hasNavigateBack(), "Expecting Navigate Back to be disabled").to.be.false;
 			expect(oViewController.hasNavigateForward(), "Expecting Navigate Forward to be enabled").to.be.true;
 		});	
 		
 		it("Open 5 tabs and navigate 3 back  + select file + back", function() {

 			openAceEditorTab("file0.js", "/open/file0.js", bVISIBLE);
			openOtherEditorTab("file1.js", "/open/file1.js", bVISIBLE);
			openOtherEditorTab("file2.js", "/open/file2.js", bVISIBLE);
		    openOtherEditorTab("file3.js", "/open/file3.js", bVISIBLE);
		    openOtherEditorTab("file4.js", "/open/file4.js", bVISIBLE);
			
			oViewController.navigateBack();
			oViewController.navigateBack();
			oViewController.navigateBack();
			expect(oViewController.getSelectedIndex(), "We will get file1, index 1").to.equal(1);

			oViewController.showTab(3, true);//file3
			expect(oViewController.getSelectedIndex(), "We will get file3, index 3").to.equal(3);
			expect(oViewController.hasNavigateBack(), "Expecting Navigate Back to be enabled").to.be.true;
 			expect(oViewController.hasNavigateForward(), "Expecting Navigate Forward to be disabled").to.be.false;
 			
			oViewController.navigateBack();
			expect(oViewController.getSelectedIndex(), "We will get file1, index 1").to.equal(1);
			
 			expect(oViewController.hasNavigateBack(), "Expecting Navigate Back to be enabled").to.be.true;
 			expect(oViewController.hasNavigateForward(), "Expecting Navigate Forward to be enabled").to.be.true;
 		});	
 		
 		it("Open 5 tabs and navigate 3 back  + select file + close file + back", function() {

 			openAceEditorTab("file0.js", "/open/file0.js", bVISIBLE);
			openOtherEditorTab("file1.js", "/open/file1.js", bVISIBLE);
			openOtherEditorTab("file2.js", "/open/file2.js", bVISIBLE);
		    openOtherEditorTab("file3.js", "/open/file3.js", bVISIBLE);
		    openOtherEditorTab("file4.js", "/open/file4.js", bVISIBLE);
		  
			oViewController.navigateBack();
			oViewController.navigateBack();
			oViewController.navigateBack();
			expect(oViewController.getSelectedIndex(), "We will get file1, index 1").to.equal(1);

			oViewController.showTab(3, true);//file3
			expect(oViewController.getSelectedIndex(), "We will get file3, index 3").to.equal(3);
 			expect(oViewController.hasNavigateBack(), "Expecting Navigate Back to be enabled").to.be.true;
 			expect(oViewController.hasNavigateForward(), "Expecting Navigate Forward to be disabled").to.be.false;
 			
			oViewController.closeTabs([1]); //close file1
			
			oViewController.navigateBack();
			expect(oViewController.getSelectedIndex(), "We will get file0, index 0").to.equal(0);
			
 			expect(oViewController.hasNavigateBack(), "Expecting Navigate Back to be disabled").to.be.false;
 			expect(oViewController.hasNavigateForward(), "Expecting Navigate Forward to be enabled").to.be.true;
 		});	
 		
 		it("Open 5 tabs and navigate 3 back  + 2 selects file + 2 back file", function() {

 			openAceEditorTab("file0.js", "/open/file0.js", bVISIBLE);
			openOtherEditorTab("file1.js", "/open/file1.js", bVISIBLE);
			openOtherEditorTab("file2.js", "/open/file2.js", bVISIBLE);
		    openOtherEditorTab("file3.js", "/open/file3.js", bVISIBLE);
		    openOtherEditorTab("file4.js", "/open/file4.js", bVISIBLE);
		    
			oViewController.navigateBack();
			oViewController.navigateBack();
			oViewController.navigateBack();
			expect(oViewController.getSelectedIndex(), "We will get file1, index 1").to.equal(1);

			oViewController.showTab(3, true);//file3
			expect(oViewController.getSelectedIndex(), "We will get file3, index 3").to.equal(3);
			expect(oViewController.hasNavigateBack(), "Expecting Navigate Back to be enabled").to.be.true;
 			expect(oViewController.hasNavigateForward(), "Expecting Navigate Forward to be disabled").to.be.false;
 			
			oViewController.showTab(4, true);//file4
			expect(oViewController.getSelectedIndex(), "We will get file4, index 4").to.equal(4);
 			expect(oViewController.hasNavigateBack(), "Expecting Navigate Back to be enabled").to.be.true;
 			expect(oViewController.hasNavigateForward(), "Expecting Navigate Forward to be disabled").to.be.false;
 			
			oViewController.navigateBack();
			expect(oViewController.getSelectedIndex(), "We will get file1, index 3").to.equal(3);
			oViewController.navigateBack();
			expect(oViewController.getSelectedIndex(), "We will get file1, index 1").to.equal(1);
			
 			expect(oViewController.hasNavigateBack(), "Expecting Navigate Back to be enabled").to.be.true;
 			expect(oViewController.hasNavigateForward(), "Expecting Navigate Forward to be enabled").to.be.true;
 		});	
 		
 		it("Last edit tab - open 3 tabs + edit file2 + close file2", function() {

 			openAceEditorTab("file0.js", "/open/file0.js", bVISIBLE);
			openOtherEditorTab("file1.js", "/open/file1.js", bVISIBLE);
			openOtherEditorTab("file2.js", "/open/file2.js", bVISIBLE);
		    
		    //1.check that last edit tab button is disabled
		    expect(oViewController.hasNavigateToLastEdit(), "Expecting Navigate To Last Edit to be disabled").to.be.false;
			//2.update the last edit tab index to be 2
			oViewController.setLastEditTabIndex();//should be 2
			//3.check that last edit tab button is disabled
		    expect(oViewController.hasNavigateToLastEdit(), "Expecting Navigate To Last Edit to be disabled").to.be.false;
			//4.Close file2
			oViewController.closeTabs([2]); 
			//5.check that the button is disabled and the current index is correct
			expect(oViewController.hasNavigateToLastEdit(), "Expecting Navigate To Last Edit to be disabled").to.be.false;
			expect(oViewController.getSelectedIndex(), "We will get file1").to.equal(1);
			
 		});	
 		
 		it("Last edit tab - open 3 tabs + edit file2 + close file1", function() {

 			openAceEditorTab("file0.js", "/open/file0.js", bVISIBLE);
			openOtherEditorTab("file1.js", "/open/file1.js", bVISIBLE);
			openOtherEditorTab("file2.js", "/open/file2.js", bVISIBLE);
		    
		    //1.check that last edit tab button is disabled
		    expect(oViewController.hasNavigateToLastEdit(), "Expecting Navigate To Last Edit to be disabled").to.be.false;
			//2.update the last edit tab index to be 2
			oViewController.setLastEditTabIndex();//should be 2
			//3.check that last edit tab button is disabled
		    expect(oViewController.hasNavigateToLastEdit(), "Expecting Navigate To Last Edit to be disabled").to.be.false;
			//4.Close file1
			oViewController.closeTabs([1]); 
			//5.check that the button is disabled and the current index is correct
		    expect(oViewController.hasNavigateToLastEdit(), "Expecting Navigate To Last Edit to be disabled").to.be.false;
			expect(oViewController.getSelectedIndex(), "We will get file2 on index 1").to.equal(1);
			
 		});	
 		
 		it("Last edit tab - open 5 tabs + edit file0 + close file1", function() {

 			openAceEditorTab("file0.js", "/open/file0.js", bVISIBLE);
			openOtherEditorTab("file1.js", "/open/file1.js", bVISIBLE);
		    //0 1 0 1 0, selected index is 4
		    oViewController.showTab(0, true);
		    oViewController.showTab(1, true);
		    oViewController.showTab(0, true);
		    
		    //1.check that last edit tab button is disabled
		    expect(oViewController.hasNavigateToLastEdit(), "Expecting Navigate To Last Edit to be disabled").to.be.false;
			//2.update the last edit tab index to be 0
			oViewController.setLastEditTabIndex();//should be 0
			//3.check that last edit tab button is disabled
		    expect(oViewController.hasNavigateToLastEdit(), "Expecting Navigate To Last Edit to be disabled").to.be.false;
			//4.Close file1
			oViewController.closeTabs([1]); 
			//5.check that the button is disabled and the current index is correct
		    expect(oViewController.hasNavigateToLastEdit(), "Expecting Navigate To Last Edit to be disabled").to.be.false;
			expect(oViewController.getSelectedIndex(), "We will get file0").to.equal(0);
			
 		});	
 		
 		it("Last edit tab - open 3 tabs + edit file1 + close file0", function() {

 			openAceEditorTab("file0.js", "/open/file0.js", bVISIBLE);
			openOtherEditorTab("file1.js", "/open/file1.js", bVISIBLE);
			openOtherEditorTab("file2.js", "/open/file2.js", bVISIBLE);
			
		    //1.check that last edit tab button is disabled
		    expect(oViewController.hasNavigateToLastEdit(), "Expecting Navigate To Last Edit to be disabled").to.be.false;
			//2.update the last edit tab index to be 1
			oViewController.showTab(1, true);
			oViewController.setLastEditTabIndex();//should be 1
			//3.check that last edit tab button is disabled
		    expect(oViewController.hasNavigateToLastEdit(), "Expecting Navigate To Last Edit to be disabled").to.be.false;
			//4.Navigate To file2 
		    oViewController.showTab(2, true);
		    expect(oViewController.hasNavigateToLastEdit(), "Expecting Navigate To Last Edit to be enabled").to.be.true;
		    //5.Navigate To Last Edit- should changed to file1
			oViewController.navigateToLastEdit();
			expect(oViewController.getSelectedIndex(), "We will get file1").to.equal(1);
			//6.Close file0
			oViewController.closeTabs([0]); 
			//7.check that last edit tab button is disabled
		    expect(oViewController.hasNavigateToLastEdit(), "Expecting Navigate To Last Edit to be disabled").to.be.false;
			expect(oViewController.getSelectedIndex(), "We will get file1").to.equal(0);
 		});	 
 		
 		it("Last edit tab - open 3 tabs + edit file1 + close file2", function() {

 			openAceEditorTab("file0.js", "/open/file0.js", bVISIBLE);
			openOtherEditorTab("file1.js", "/open/file1.js", bVISIBLE);
			openOtherEditorTab("file2.js", "/open/file2.js", bVISIBLE);
			
		    //1.check that last edit tab button is disabled
		    expect(oViewController.hasNavigateToLastEdit(), "Expecting Navigate To Last Edit to be disabled").to.be.false;
			//2.update the last edit tab index to be 1
			oViewController.showTab(1, true);
			oViewController.setLastEditTabIndex();//should be 1
			//3.check that last edit tab button is disabled
		    expect(oViewController.hasNavigateToLastEdit(), "Expecting Navigate To Last Edit to be disabled").to.be.false;
		    //4.Navigate To file2 
		    oViewController.showTab(2, true);
		    //5.Navigate To Last Edit- should changed to file1
			oViewController.navigateToLastEdit();
			expect(oViewController.getSelectedIndex(), "We will get file1").to.equal(1);
			//6.Close file2
			oViewController.closeTabs([2]); 
			//7.check that the button is disabled and the current index is correct
		    expect(oViewController.hasNavigateToLastEdit(), "Expecting Navigate To Last Edit to be disabled").to.be.false;
			expect(oViewController.getSelectedIndex(), "We will get file1").to.equal(1);
 		});	
 		
	});
});