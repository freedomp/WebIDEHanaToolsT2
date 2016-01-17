define(["STF", "sinon"], function(STF, sinon) {
	"use strict";

	//  every suite must have a uniqueName. using a none unique name will cause an error.
	var suiteName = "js_codecompletion_libraries_HCP_service_tests";
	var suiteWindowObj;
	var sandbox;
	var oJSCodeCompletionService;
	var oJsApiReferenceService;
	var oContentService;
	var oCalculateLibVersionService;
	var MockFileDocument;
	var i;
	var l;
	var j; 
	
	var mConsumer = {
		"name": "JSCocoServiceConsumer",

		"requires": {
			"services": [
				"jscodecompletion",
				"jsapireference",
				"intellisence.calculatelibraryversion",
				"intellisence.libmetadataprovider"
			]
		},

		"configures": {
			"services": {
				"intellisence.calculatelibraryversion:sdkVersionProvider": {
					"service": "@libraryMetaAccess"
				},
				"intellisence.libmetadataprovider:sdkProvider": {
					"service": "@libraryMetaAccess"
				}
			}
		}
	};

	describe.skip("JS Code Completion Loading UI5 Libraries from HCP Service", function() {
		before(function() {
			return STF.startWebIde(suiteName, {
				config: "ci_tests/editor_ci/javascript/service/config.json"
			}).
			then(function(webIdeWindowObj) {
				suiteWindowObj = webIdeWindowObj;
				STF.register(suiteName, mConsumer);
				oJSCodeCompletionService = STF.getService(suiteName, "jscodecompletion");
				oJsApiReferenceService = STF.getService(suiteName, "jsapireference");
				oContentService = STF.getService(suiteName, "content");
				oCalculateLibVersionService = STF.getService(suiteName, "intellisence.calculatelibraryversion");
				return STF.require(suiteName, [
					"sane-tests/util/mockDocument"
				]);
			}).spread(function(oMockDocument) {
				MockFileDocument = oMockDocument.MockFileDocument;
			});
		});

		beforeEach(function() {
			sandbox = sinon.sandbox.create();
			var oDocument = new MockFileDocument("new/doc.js", "js", "");
			sandbox.stub(oContentService, "getCurrentDocument").returns(Q(oDocument));
			return oCalculateLibVersionService.useUI5Snapshot(true);
		});

		afterEach(function() {
			sandbox.restore();
		});

		it("Check [getWordSuggestions] for UI5: sap.m.Butt", (function() {
			var oContentStatus = {
				buffer: "sap.m.Butt",
				offset: 10,
				prefix: "Butt",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};
			var lib1 = {};

			lib1["description"] = "Button(sId, mSettings)";

			var libs = [lib1];

			return getProposals(oContentStatus, libs);
		}));

		it("Check [getWordSuggestions] for UI5: Butt", (function() {
			var oContentStatus = {
				buffer: "Butt",
				offset: 4,
				prefix: "Butt",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};
			var lib1 = {};

			lib1["description"] = "Button(sId, mSettings)";

			var libs = [lib1];

			return getProposals(oContentStatus, libs);
		}));

		it("Check [getWordSuggestions] for UI5: sap.ui.core.", (function() {
			var oContentStatus = {
				buffer: "sap.ui.core.",
				offset: 12,
				prefix: "",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};
			var lib1 = {};
			lib1["description"] = "Element(sId, mSettings)";

			var lib2 = {};
			lib2["description"] = "Component(sId, mSettings)";

			var lib3 = {};
			lib3["description"] = "LocalBusyIndicator(sId, mSettings)";

			var lib4 = {};

			lib4["description"] = "LayoutData(sId, mSettings)";

			var lib5 = {};

			lib4["description"] = "UIArea(oCore, [oRootNode])";

			var libs = [lib1, lib2, lib3, lib4, lib5];

			return getProposals(oContentStatus, libs);

		}));

		it("Check [getWordSuggestions] for UI5: sap.m.", (function() {
			var oContentStatus = {
				buffer: "sap.m.",
				offset: 6,
				prefix: "",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};
			var lib1 = {};
			lib1["description"] = "ActionSelect(sId, mSettings)";

			var lib2 = {};
			lib2["description"] = "MultiComboBox(sId, mSettings)";

			var lib3 = {};
			lib3["description"] = "Bar(sId, mSettings)";

			var lib4 = {};
			lib4["description"] = "BusyIndicator(sId, mSettings)";

			var lib5 = {};
			lib4["description"] = "GrowingList(sId, mSettings)";

			var libs = [lib1, lib2, lib3, lib4, lib5];

			return getProposals(oContentStatus, libs);

		}));

		it("Check template ActionSelect in UI5: sap.m.", (function() {
			var oContentStatus = {
				buffer: "ActionSelect",
				offset: 12,
				prefix: "ActionSelect",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};
			var lib1 = {};
			lib1["description"] = "ActionSelect in sap.m";
			lib1["props"] = ["id", "name", "enabled", "width", "maxWidth", "selectedKey", "selectedItemId", "icon", "type", "autoAdjustWidth",
				"textAlign", "textDirection", "change"
			];

			var libs = [lib1];

			return getProposals(oContentStatus, libs);

		}));

		it("Check template MultiComboBox in UI5: sap.m.", (function() {
			var oContentStatus = {
				buffer: "MultiComboBox",
				offset: 13,
				prefix: "MultiComboBox",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};

			var lib1 = {};
			lib1["description"] = "MultiComboBox in sap.m";
			lib1["props"] = ["id", "value", "width", "enabled", "valueState", "placeholder", "editable", "valueStateText",
				"showValueStateMessage", "textAlign", "textDirection", "maxWidth", "selectedKeys", "change", "selectionChange", "selectionFinish"
			];

			var libs = [lib1];

			return getProposals(oContentStatus, libs);

		}));

		it("Check [getWordSuggestions] for UI5: sap.me.", (function() {
			var oContentStatus = {
				buffer: "sap.me.",
				offset: 7,
				prefix: "",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};

			var lib1 = {};
			lib1["description"] = "Calendar(sId, mSettings)";

			var lib2 = {};
			lib2["description"] = "OverlapCalendar(sId, mSettings)";

			var lib3 = {};
			lib3["description"] = "ProgressIndicator(sId, mSettings)";

			var lib4 = {};
			lib4["description"] = "CalendarLegend(sId, mSettings)";

			var libs = [lib1, lib2, lib3, lib4];

			return getProposals(oContentStatus, libs);
		}));

		it("Check template OverlapCalendar in UI5: sap.me.", (function() {
			var oContentStatus = {
				buffer: "OverlapCalendar",
				offset: 15,
				prefix: "OverlapCalendar",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};

			var lib1 = {};
			lib1["description"] = "OverlapCalendar in sap.me";
			lib1["props"] = ["weeksPerRow", "showOverlapIndicator", "swipeToNavigate"];

			var libs = [lib1];

			return getProposals(oContentStatus, libs);
		}));

		it("Check template Calendar in UI5: sap.me.", (function() {
			var oContentStatus = {
				buffer: "Calendar",
				offset: 8,
				prefix: "Calendar",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};

			var lib1 = {};
			lib1["description"] = "Calendar in sap.me";
			lib1["props"] = ["hideNavControls", "weeksPerRow", "disabledWeekDays"];

			var libs = [lib1];

			return getProposals(oContentStatus, libs);
		}));

		it("Check [getWordSuggestions] for UI5: sap.ui.table.", (function() {

			var oContentStatus = {
				buffer: "sap.table.",
				offset: 10,
				prefix: "",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};

			var lib1 = {};
			lib1["description"] = "TreeTable(sId, mSettings)";

			var lib2 = {};
			lib2["description"] = "DataTable(sId, mSettings)";

			var lib3 = {};
			lib3["description"] = "Row(sId, mSettings)";

			var lib4 = {};
			lib4["description"] = "Table(sId, mSettings)";

			var libs = [lib1, lib2, lib3, lib4];

			return getProposals(oContentStatus, libs);
		}));

		it("Check template DataTable in UI5: sap.ui.table.", (function() {

			var oContentStatus = {
				buffer: "Data",
				offset: 4,
				prefix: "Data",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};

			var lib1 = {};
			lib1["description"] = "DataTable in sap.ui.table";
			lib1["props"] = ["columnHeaderHeight", "allowColumnReordering", "enableColumnFreeze"];

			var libs = [lib1];

			return getProposals(oContentStatus, libs);
		}));

		it("Check template Row in UI5: sap.ui.table.", (function() {

			var oContentStatus = {
				buffer: "Row",
				offset: 3,
				prefix: "Row",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};

			var lib1 = {};
			lib1["description"] = "Row in sap.ui.table";
			lib1["props"] = ["id", "cells"];

			var libs = [lib1];

			return getProposals(oContentStatus, libs);
		}));

		it("Check [getWordSuggestions] for UI5: sap.ui.commons.", (function() {

			var oContentStatus = {
				buffer: "sap.ui.commons.",
				offset: 15,
				prefix: "",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};

			var lib1 = {};
			lib1["description"] = "Tree(sId, mSettings)";

			var lib2 = {};
			lib2["description"] = "DatePicker(sId, mSettings)";

			var lib3 = {};
			lib3["description"] = "Title(sId, mSettings)";

			var lib4 = {};
			lib4["description"] = "Accordion(sId, mSettings)";

			var libs = [lib1, lib2, lib3, lib4];

			return getProposals(oContentStatus, libs);
		}));

		it("Check template Tree for UI5: sap.ui.commons.", (function() {

			var oContentStatus = {
				buffer: "Tree",
				offset: 4,
				prefix: "Tree",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};

			var lib1 = {};
			lib1["description"] = "Tree in sap.ui.commons";
			lib1["props"] = ["showHeaderIcons", "showHorizontalScrollbar", "selectionMode"];

			var libs = [lib1];

			return getProposals(oContentStatus, libs);
		}));

		it("Check template MessageList for UI5: sap.ui.commons.", (function() {

			var oContentStatus = {
				buffer: "MessageList",
				offset: 11,
				prefix: "MessageList",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};

			var lib1 = {};
			lib1["description"] = "MessageList in sap.ui.commons";
			lib1["props"] = ["visible", "anchorId", "maxListed"];

			var libs = [lib1];

			return getProposals(oContentStatus, libs);
		}));

		it("Check [getWordSuggestions] for UI5: sap.ui.layout.form", (function() {

			var oContentStatus = {
				buffer: "sap.ui.layout.form.",
				offset: 19,
				prefix: "",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};

			var lib1 = {};
			lib1["description"] = "GridLayout(sId, mSettings)";

			var lib2 = {};
			lib2["description"] = "ResponsiveLayout(sId, mSettings)";

			var lib3 = {};
			lib3["description"] = "GridContainerData(sId, mSettings)";

			var lib4 = {};
			lib4["description"] = "FormElement(sId, mSettings)";

			var libs = [lib1, lib2, lib3, lib4];

			return getProposals(oContentStatus, libs);

		}));

		it("Check template GridLayout in UI5: sap.ui.layout.form", (function() {

			var oContentStatus = {
				buffer: "GridLayout",
				offset: 10,
				prefix: "GridLayout",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};

			var lib1 = {};
			lib1["description"] = "GridLayout in sap.ui.layout";
			lib1["props"] = ["id", "singleColumn"];

			var libs = [lib1];

			return getProposals(oContentStatus, libs);

		}));

		it("Check template ResponsiveLayout in UI5: sap.ui.layout.form", (function() {

			var oContentStatus = {
				buffer: "GridLayout",
				offset: 10,
				prefix: "GridLayout",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};

			var lib1 = {};
			lib1["description"] = "ResponsiveLayout in sap.ui.layout";
			lib1["props"] = ["id"];

			var libs = [lib1];

			return getProposals(oContentStatus, libs);

		}));
		/*it("Check [getWordSuggestions] for UI5: sap.ui.suite",  (function() {
    	    
    	       var oContentStatus = {
    				buffer: "sap.ui.rta.",
    				offset: 11,
    				prefix: "",
    				coords: {
        			    pageX: 14,
        			    pageY: 2
        			}
    			};
    			
        	    var lib1 = {};
        	    lib1["description"] = "ContextMenu(sId, mSettings)";

        	    var lib2 = {};
        	    lib2["description"] = "FieldRepository(sId, mSettings)";

        	    var libs = [lib1, lib2];
        	    
        	    return getProposals(oContentStatus, libs);
        	
    	}));*/

		it("Check [getWordSuggestions] for UI5: sap.ui.comp.smartfilterbar", (function() {

			var oContentStatus = {
				buffer: "sap.ui.comp.smartfilterbar",
				offset: 26,
				prefix: "",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};

			var lib1 = {};
			lib1["description"] = "ControlConfiguration(sId, mSettings)";

			var lib2 = {};
			lib2["description"] = "SmartFilterBar(sId, mSettings)";

			var lib3 = {};
			lib3["description"] = "ControlConfigurationSmartFilterBar(sId, mSettings)";

			var lib4 = {};
			lib4["description"] = "SelectOptionControlConfigurationSmartFilterBar(sId, mSettings)";

			var libs = [lib1, lib2, lib3, lib4];
			return getProposals(oContentStatus, libs);

		}));

		it("Check template for UI5: sap.ui.comp.smartfilterbar", (function() {

			var oContentStatus = {
				buffer: "ControlConfiguration",
				offset: 20,
				prefix: "ControlConfiguration",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};

			var lib1 = {};
			lib1["description"] = "ControlConfiguration in sap.ui.comp";
			lib1["props"] = ["id", "key", "groupId", "label", "visible", "hasValueHelpDialog", "controlType", "filterType", "index",
				"hasTypeAhead", "mandatory", "width", "visibleInAdvancedArea", "preventInitialDataFetchInValueHelpDialog", "displayBehaviour",
				"change"
			];

			var libs = [lib1];
			return getProposals(oContentStatus, libs);

		}));

		it("Check template for UI5: sap.ui.comp.smartfilterbar", (function() {

			var oContentStatus = {
				buffer: "SmartFilterBar",
				offset: 14,
				prefix: "SmartFilterBar",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};

			var lib1 = {};
			lib1["description"] = "SmartFilterBar in sap.ui.comp";
			lib1["props"] = ["id", "persistencyKey", "advancedMode", "expandAdvancedArea", "searchEnabled", "filterBarExpanded"];

			var libs = [lib1];
			return getProposals(oContentStatus, libs);

		}));
		it("Check [getWordSuggestions] for UI5: sap.ui.ux3", (function() {

			var oContentStatus = {
				buffer: "sap.ui.ux3.",
				offset: 11,
				prefix: "",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};

			var lib1 = {};
			lib1["description"] = "Shell(sId, mSettings)";

			var lib2 = {};
			lib2["description"] = "ActionBar(sId, mSettings)";

			var lib3 = {};
			lib3["description"] = "Collection(sId, mSettings)";

			var lib4 = {};
			lib4["description"] = "Feed(sId, mSettings)";

			var libs = [lib1, lib2, lib3, lib4];
			return getProposals(oContentStatus, libs);

		}));

		it("Check template ActionBar in UI5: sap.ui.ux3", (function() {

			var oContentStatus = {
				buffer: "ActionBar",
				offset: 9,
				prefix: "ActionBar",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};

			var lib1 = {};
			lib1["description"] = "ActionBar in sap.ui.ux3";
			lib1["props"] = ["id", "followState", "flagState", "favoriteState", "updateState"];

			var libs = [lib1];
			return getProposals(oContentStatus, libs);

		}));

		/*it("Check [getWordSuggestions] for UI5: sap.ndc",  (function() {
		    
		    var oContentStatus = {
    				buffer: "sap.ndc.",
    				offset: 8,
    				prefix: "",
    				coords: {
        			    pageX: 14,
        			    pageY: 2
        			}
    			};
    			
        	    var lib1 = {};
        	    lib1["description"] = "BarcodeScannerButton(sId, mSettings)";
        	    var libs = [lib1];
        	    return getProposals(oContentStatus, libs);
        	    
    	}));*/

		/*it("Check [getWordSuggestions] for UI5: sap.ui.demokit",  (function() {
    	    
    	    var oContentStatus = {
    				buffer: "sap.ui.demokit.",
    				offset: 15,
    				prefix: "",
    				coords: {
        			    pageX: 14,
        			    pageY: 2
        			}
    			};
    			
        	    var lib1 = {};
        	    lib1["description"] = "CodeSampleContainer(sId, mSettings)";
        	    
        	    var lib2 = {};
        	    lib2["description"] = "CodeViewer(sId, mSettings)";

        	   	var lib3 = {};
        	    lib3["description"] = "FileUploadIntrospector(sId, mSettings)";

        	    var lib4 = {};
        	    lib4["description"] = "IndexLayout(sId, mSettings)";

        	    var libs = [lib1, lib2, lib3, lib4];
        	    return getProposals(oContentStatus, libs);
        	    
    	}));*/

		/*	it("Check [getWordSuggestions] for UI5: sap.ca.ui",  (function() {
                 var oContentStatus = {
    				buffer: "sap.ca.ui.",
    				offset: 10,
    				prefix: "",
    				coords: {
        			    pageX: 14,
        			    pageY: 2
        			}
    			};
    			
        	    var lib1 = {};
        	    lib1["description"] = "PictureTileContainer(sId, mSettings)";

        	    var lib2 = {};
        	    lib2["description"] = "HierarchicalSelectDialogItem(sId, mSettings)";

        	   	var lib3 = {};
        	    lib3["description"] = "DatePicker(sId, mSettings)";

        	    var lib4 = {};
        	    lib4["description"] = "FileUpload(sId, mSettings)";

        	    var libs = [lib1, lib2, lib3, lib4];
        	    
        	    return getProposals(oContentStatus, libs);
        	    
    	}));*/

		/*	it("Check [getWordSuggestions] for UI5: sap.ui.rta",  (function() {
		    
		        var oContentStatus = {
    				buffer: "sap.ui.rta.",
    				offset: 11,
    				prefix: "",
    				coords: {
        			    pageX: 14,
        			    pageY: 2
        			}
    			};
    			
        	    var lib1 = {};
        	    lib1["description"] = "ContextMenu(sId, mSettings)";

        	    var lib2 = {};
        	    lib2["description"] = "FieldRepository(sId, mSettings)";

        	   	var lib3 = {};
        	    lib3["description"] = "RuntimeAuthoring(sId, mSettings)";

        	    var lib4 = {};
        	    lib4["description"] = "ToolsMenu(sId, mSettings)";

        	    var libs = [lib1, lib2, lib3, lib4];
        	    
        	    return getProposals(oContentStatus, libs);
        
    	}));*/

		/*it("Check [getWordSuggestions] for UI5: sap.ui.fl",  (function() {
    	    var libName = "sap.ui.fl";
    	    var prefix = "<fl:";
    	    var lib1 = {};
    	    lib1["name"] = "PreprocessorImpl";
    	    lib1["description"] = "PreprocessorImpl in sap.ui.fl";
    	    lib1["props"] = ["id"];

    	    var lib2 = {};
    	    lib2["name"] = "Preprocessor";
    	    lib2["description"] = "Preprocessor in sap.ui.fl";
    	    lib2["props"] = ["id"];
    	    var libs = [lib1, lib2];
    	    
    	    return triggerit(sContent, libs, prefix );
    	}));*/

		/*it("Check [getWordSuggestions] for UI5: sap.ui.richtexteditor",  (function() {
    	    var libName = "sap.ui.richtexteditor";
    	    var prefix = "<rich:";
    	    var lib1 = {};
    	    lib1["name"] = "RichTextEditor";
    	    lib1["description"] = "RichTextEditor in sap.ui.richtexteditor";
    	    lib1["props"] = ["id"];

    	    var libs = [lib1];
    	    
    	    return triggerit(sContent, libs, prefix );
    	}));*/

		/*	it("Check [getWordSuggestions] for UI5: sap.ui.generic.app",  (function() {
    	    var libName = "sap.ui.generic.app";
    	    var prefix = "<gen:";
    	    var lib1 = {};
    	    lib1["name"] = "transaction/BaseController";
    	    lib1["description"] = "transaction/BaseController in sap.ui.generic.app";
    	    lib1["props"] = ["id"];

    	    var lib2 = {};
    	    lib2["name"] = "util/ModelUtil";
    	    lib2["description"] = "util/ModelUtil in sap.ui.generic.app";
    	    lib2["props"] = ["id"];
    	    
    	   	var lib3 = {};
    	    lib3["name"] = "transaction/DraftContext";
    	    lib3["description"] = "transaction/DraftContext in sap.ui.generic.app";
    	    lib3["props"] = [ ];
    	    
    	    var lib4 = {};
   	    lib4["name"] = "transaction/TransactionController";
    	    lib4["description"] = "transaction/TransactionController in sap.ui.generic.app";
    	    lib4["props"] = [ ];
    	    
    	    var libs = [lib1, lib2, lib3, lib4];
    	    
    	    return triggerit(sContent, libs, prefix );
    	}));*/

		/*it("Check [getWordSuggestions] for UI5: sap.ui.generic.template",  (function() {
    	    var libName = "sap.ui.generic.template";
    	    var prefix = "<temp:";
    	    var lib1 = {};
    	    lib1["name"] = "transaction/TransactionController";
    	    lib1["description"] = "transaction/TransactionController in sap.ui.generic.app";
    	    lib1["props"] = ["id"];

    	    var lib2 = {};
    	    lib2["name"] = "util/ModelUtil";
    	    lib2["description"] = "util/ModelUtil in sap.ui.generic.app";
    	    lib2["props"] = ["id"];
    	    
    	   	var lib3 = {};
    	    lib3["name"] = "transaction/DraftContext";
    	    lib3["description"] = "transaction/DraftContext in sap.ui.generic.app";
    	    lib3["props"] = [ ];
    	    
    	    var lib4 = {};
    	    lib4["name"] = "transaction/TransactionController";
    	    lib4["description"] = "transaction/TransactionController in sap.ui.generic.app";
    	    lib4["props"] = [ ];
    	    
    	    var libs = [lib1, lib2, lib3, lib4];
    	    
    	    return triggerit(sContent, libs, prefix );
    	}));*/

		function getProposals(oContentStatus, libraries) {

			var listOfDeprecatedProposals = "";
			var NumberOfDeprecatedProposals = 0;
			var allProposals = 0;
			var properties;
			
			return oJSCodeCompletionService.getWordSuggestions(oContentStatus).then(function(result) {
				if (result.proposals) {
					allProposals = result.proposals.length;
				}
				for (i = 0; i < allProposals; i++) {
					if (result.proposals[i].helpDescription && result.proposals[i].helpDescription.indexOf("Deprecated!") > -1) {
						NumberOfDeprecatedProposals++;
						listOfDeprecatedProposals = listOfDeprecatedProposals + "  ,  " + result.proposals[i].description;
					}
					for (l = 0; l < libraries.length; l++) {
						if (result.proposals[i].description === libraries[l].description) {
							expect(result.proposals[i].description, "there is proposal " + result.proposals[i].description + " in " +oContentStatus.buffer ).to.equal(libraries[l].description);
							//check the properties
							if (result.proposals[i].proposal) {
								properties = libraries[l].props;
								if (properties) {
									for (j = 0; j < properties.length; j++) {
										expect(result.proposals[i].proposal.indexOf(properties[j]) , "there is property " + properties[j] + " in " + libraries[l].description).to.be.above(-1);
									}
								}
							}
						}
					}
				}
				expect(allProposals, "SUMMARY--- NUMBER OF PROPOSALS: " + allProposals).to.be.above(0);
				expect(listOfDeprecatedProposals.length, "Number and list OF DEPRECATED PROPOSALS: " + NumberOfDeprecatedProposals + "- " +
					listOfDeprecatedProposals ).to.be.at.least(0);
			});
		}

		after(function() {
			STF.shutdownWebIde(suiteName);
		});

	});
});