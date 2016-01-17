define(["STF"], function(STF) {
	"use strict";

	//  every suite must have a uniqueName. using a none unique name will cause an error.
	var suiteName = "hcp_ui5_libraries_loaded_locally_service_tests";
	var suiteWindowObj;

	var oXMLCodeCompletionService;

	var mConsumer = {
		"name": "xmlCocoConsumer",

		"requires": {
			"services": [
				"xmlcodecompletion"
			]
		},

		"configures": {
			"services": {
				"xmlcodecompletion:libraries": [{
					"id": "xml",
					"name": "sapui5",
					"version": "1.32.4",
					"libTemplate": "sap.watt.toolsets.xml/service/template/ui5/1.32.4.zip",
					"libMetadata": "sap.watt.toolsets.xml/service/metadata/ui5/1.32.4.zip"
				}]
			}
		}
	};

	var sContent = "<mvc:View\n";
	sContent += "\tcontrollerName=\"view.Detail\"\n";
	sContent += "\txmlns:table=\"sap.ui.table\"\n";
	sContent += "\txmlns:com=\"sap.ui.commons\"\n";
	sContent += "\txmlns:form=\"sap.ui.layout.form\"\n";
	sContent += "\txmlns:mvc=\"sap.ui.core.mvc\"\n";
	sContent += "\txmlns:ca=\"sap.ca.ui\"\n";
	sContent += "\txmlns:fl=\"sap.ui.fl\"\n";
	sContent += "\txmlns:gen=\"sap.ui.generic\"\n";
	sContent += "\txmlns:temp=\"sap.ui.generic.template\"\n";
	sContent += "\txmlns:lay=\"sap.ui.layout\"\n";
	sContent += "\txmlns:core=\"sap.ui.core\"\n";
	sContent += "\txmlns:suite=\"sap.ui.suite\"\n";
	sContent += "\txmlns:rta=\"sap.ui.rta\"\n";
	sContent += "\txmlns:viz=\"sap.viz\"\n";
	sContent += "\txmlns:ushell=\"sap.ushell\"\n";
	sContent += "\txmlns:ux3=\"sap.ui.ux3\"\n";
	sContent += "\txmlns:rich=\"sap.ui.richtexteditor\">\n";

	sContent += "\t<table:DataTable xmlns=\"sap.ui.table\" columnHeaderHeight=\"\" >\n";
	sContent += "\t</table:DataTable>\n";
	sContent += "\t<com:Tree xmlns=\"sap.m\" showHorizontalScrollbar=\"\" >\n";
	sContent += "\t</com:Tree>\n";
	sContent += "\t<form:FormContainer xmlns=\"sap.ui.layout\" expanded=\"true\" >\n";
	sContent += "\t</form:FormContainer>\n";
	sContent += "\t<fl:Preprocessor xmlns=\"sap.ui.fl\" id=\"id\" >\n";
	sContent += "\t</fl:Preprocessor>\n";
	sContent += "\t<gen:>\n";
	sContent += "\t</gen:>\n";
	sContent += "\t<temp:>\n";
	sContent += "\t</temp:>\n";
	sContent += "\t<lay:>\n";
	sContent += "\t</lay:>\n";
	sContent += "\t<core:Control busy=\"\" >\n";
	sContent += "\t</core:Control>\n";
	sContent += "\t<suite:>\n";
	sContent += "\t</suite:>\n";
	sContent += "\t<rta:>\n";
	sContent += "\t</rta:>\n";
	sContent += "\t<viz:>\n";
	sContent += "\t</viz:>\n";
	sContent += "\t<ushell:>\n";
	sContent += "\t</ushell:>\n";
	sContent += "\t<ux3:>\n";
	sContent += "\t</ux3:>\n";
	sContent += "\t<rich:>\n";
	sContent += "\t</rich:>\n";
	sContent += "</mvc:View>";

	var sContent2 = "<core:View\n";
	sContent2 += "\tcontrollerName=\"view.Detail\"\n";
	sContent2 += "\txmlns:ca=\"sap.ca.ui\"\n";
	sContent2 += "\txmlns:m=\"sap.m\"\n";
	sContent2 += "\txmlns:me=\"sap.me\"\n";
	sContent2 += "\txmlns:com=\"sap.ui.commons\"\n";
	sContent2 += "\txmlns:form=\"sap.ui.layout.form\"\n";
	sContent2 += "\txmlns:mvc=\"sap.ui.core.mvc\"\n";
	sContent2 += "\txmlns:ndc=\"sap.ndc\"\n";
	sContent2 += "\txmlns:demo=\"sap.ui.demokit\"\n";
	sContent2 += "\txmlns:comp=\"sap.ui.comp.smartfilterbar\"\n";
	sContent2 += "\txmlns:core=\"sap.ui.core\">\n";

	sContent2 += "\t<ca:PictureTileContainer busyIndicatorDelay=\"\" >\n";
	sContent2 += "\t</ca:PictureTileContainer>\n";
	sContent2 += "\t<m:ActionSheet xmlns=\"sap.m\" cancelButtonTap=\"\" >\n";
	sContent2 += "\t</m:ActionSheet>\n";
	sContent2 += "\t<me:OverlapCalendarEvent startDay=\"\" >\n";
	sContent2 += "\t</me:OverlapCalendarEvent>\n";
	sContent2 += "\t<ndc:BarcodeScannerButton xmlns=\"sap.ndc\" provideFallback=\"\" >\n";
	sContent2 += "\t</ndc:BarcodeScannerButton>\n";
	sContent2 += "\t<demo:CodeSampleContainer xmlns=\"sap.ui.demokit\" persistencyKey=\"\" >\n";
	sContent2 += "\t</demo:CodeSampleContainer>\n";
	sContent2 += "\t<comp:SmartFilterBar xmlns=\"sap.ui.comp\" persistencyKey=\"\" >\n";
	sContent2 += "\t</comp:SmartFilterBar>\n";
	sContent2 += "</core:View>";
	
	describe("Xml Code Completion Local Library Service", function() {
		before(function() {
			return STF.startWebIde(suiteName, {
				config: "editor/monaco/toolsets/plugin/xml/service/config.json"
			}).
			then(function(webIdeWindowObj) {
				suiteWindowObj = webIdeWindowObj;
				STF.register(suiteName, mConsumer);
				oXMLCodeCompletionService = STF.getService(suiteName, "xmlcodecompletion");
			});
		});

		beforeEach(function() {
		});

		afterEach(function() {
		});

		it("check that we're getting all the namesapces starting with c", function() {
			var iOffset = sContent.indexOf("<c") + 2;
			var oContentStatus = {
				buffer: sContent,
				offset: iOffset
			};
			return oXMLCodeCompletionService.getWordSuggestions(oContentStatus).then(function(result) {
				expect(result.proposals, "there are " + result.proposals.length + " proposals").to.have.length.above(0);
				for (var i = 0; i < result.proposals.length; i++) {
					//check that we're getting all the namesapces defined above-ca, core, com
					if (result.proposals[i].description === "ca") {
						expect(result.proposals[i].overwrite, "overwrite true").to.be.true;
						expect(result.proposals[i].proposal, "proposal true").to.equal("ca:");
					}
					if (result.proposals[i].description === "core") {
						expect(result.proposals[i].overwrite, "overwrite true").to.be.true;
						expect(result.proposals[i].proposal, "proposal true").to.equal("core:");
					}
					if (result.proposals[i].description === "com") {
						expect(result.proposals[i].overwrite, "overwrite true").to.be.true;
						expect(result.proposals[i].proposal, "proposal true").to.equal("com:");
					}
				}
			});
		});

		it("check that we're getting all the namesapces starting with m", (function() {
			var iOffset = sContent2.indexOf("<m") + 2;
			var oContentStatus = {
				buffer: sContent2,
				offset: iOffset
			};
			return oXMLCodeCompletionService.getWordSuggestions(oContentStatus).then(function(result) {
				expect(result.proposals, "there are " + result.proposals.length + " proposals").to.have.length.above(0);
				for (var i = 0; i < result.proposals.length; i++) {
					//check that we're getting all the namesapces defined above-m, me, mvc
					if (result.proposals[i].description === "m") {
						expect(result.proposals[i].overwrite, "overwrite true").to.be.true;
						expect(result.proposals[i].proposal, "proposal true").to.equal("m:");
					}
					if (result.proposals[i].description === "me") {
						expect(result.proposals[i].overwrite, "overwrite true").to.be.true;
						expect(result.proposals[i].proposal, "proposal true").to.equal("me:");
					}
					if (result.proposals[i].description === "mvc") {
						expect(result.proposals[i].overwrite, "overwrite true").to.be.true;
						expect(result.proposals[i].proposal, "proposal true").to.equal("mvc:");
					}
				}
			});
		}));

		it("check that we're getting all the namesapces starting with t", (function() {
			var iOffset = sContent.indexOf("<t") + 2;
			var oContentStatus = {
				buffer: sContent,
				offset: iOffset
			};
			return oXMLCodeCompletionService.getWordSuggestions(oContentStatus).then(function(result) {
				expect(result.proposals, "there are " + result.proposals.length + " proposals").to.have.length.above(0);
				for (var i = 0; i < result.proposals.length; i++) {
					//check that we're getting all the namesapces defined above-table 
					if (result.proposals[i].description === "table") {
						expect(result.proposals[i].overwrite, "overwrite true").to.be.true;
						expect(result.proposals[i].proposal, "proposal true").to.equal("table:");
					}
				}
			});
		}));

		it("check that we're getting all the namesapces starting with f", (function() {
			var iOffset = sContent.indexOf("<f") + 2;
			var oContentStatus = {
				buffer: sContent,
				offset: iOffset
			};
			return oXMLCodeCompletionService.getWordSuggestions(oContentStatus).then(function(result) {
				expect(result.proposals, "there are " + result.proposals.length + " proposals").to.have.length.above(0);
				for (var i = 0; i < result.proposals.length; i++) {
					//check that we're getting all the namesapces defined above-table 
					if (result.proposals[i].description === "form") {
						expect(result.proposals[i].overwrite, "overwrite true").to.be.true;
						expect(result.proposals[i].proposal, "proposal true").to.equal("form:");
					}
				}
			});
		}));

		it("check templates and metadata under sap.ui.core", (function() {
			var libName = "sap.ui.core";
			var prefix = "<core:";
			var lib1 = {};
			lib1["name"] = "Element";
			lib1["description"] = "Element in sap.ui.core";
			lib1["props"] = ["id", "validationSuccess", "validationError", "parseError", "formatError"];

			var lib2 = {};
			lib2["name"] = "ComponentContainer";
			lib2["description"] = "ComponentContainer in sap.m";
			lib2["props"] = ["id", "busy", "busyIndicatorDelay", "visible", "name", "url", "handleValidation", "settings", "propagateModel",
				"width", "height", "validationSuccess", "parseError", "change", "formatError"
			];

			var lib3 = {};
			lib3["name"] = "LayoutData";
			lib3["description"] = "LayoutData in sap.ui.core";
			lib3["props"] = [];

			var lib4 = {};
			lib4["name"] = "UIArea";
			lib4["description"] = "UIArea in sap.ui.core";
			lib4["props"] = [];

			var libs = [lib1, lib2, lib3, lib4];

			return triggerTest(sContent, libs, prefix);
		}));

		it("check templates and metadata under sap.m", (function() {
			var libName = "sap.m";
			var prefix = "<m:";
			var lib1 = {};
			lib1["name"] = "ActionSelect";
			lib1["description"] = "ActionSelect in sap.m";
			lib1["props"] = ["id", "name", "enabled", "width", "maxWidth", "selectedKey", "selectedItemId", "icon", "type", "autoAdjustWidth",
				"textAlign", "textDirection", "change"
			];

			var lib2 = {};
			lib2["name"] = "MultiComboBox";
			lib2["description"] = "MultiComboBox in sap.m";
			lib2["props"] = ["id", "value", "width", "enabled", "valueState", "placeholder", "editable", "valueStateText",
				"showValueStateMessage", "textAlign", "textDirection", "maxWidth", "selectedKeys", "change", "selectionChange", "selectionFinish"
			];

			var lib3 = {};
			lib3["name"] = "Bar";
			lib3["description"] = "Bar in sap.m";
			lib3["props"] = [];

			var lib4 = {};
			lib4["name"] = "BusyIndicator";
			lib4["description"] = "BusyIndicator in sap.m";
			lib4["props"] = [];

			var libs = [lib1, lib2, lib3, lib4];

			return triggerTest(sContent2, libs, prefix);
		}));

		it("check templates and metadata under sap.me", (function() {
			var libName = "sap.me";
			var prefix = "<me:";
			var lib1 = {};
			lib1["name"] = "Calendar";
			lib1["description"] = "Calendar in sap.me";
			lib1["props"] = ["hideNavControls", "weeksPerRow", "disabledWeekDays"];

			var lib2 = {};
			lib2["name"] = "OverlapCalendar";
			lib2["description"] = "OverlapCalendar in sap.me";
			lib2["props"] = ["weeksPerRow", "showOverlapIndicator", "swipeToNavigate"];

			var lib3 = {};
			lib3["name"] = "ProgressIndicator";
			lib3["description"] = "ProgressIndicator in sap.me";
			lib3["props"] = [];

			var lib4 = {};
			lib4["name"] = "CalendarLegend";
			lib4["description"] = "CalendarLegend in sap.me";
			lib4["props"] = [];

			var libs = [lib1, lib2, lib3, lib4];

			return triggerTest(sContent2, libs, prefix);
		}));

		it("check templates and metadata under sap.ui.table", (function() {
			var libName = "sap.ui.commons";
			var prefix = "<table:";
			var lib1 = {};
			lib1["name"] = "TreeTable";
			lib1["description"] = "TreeTable in sap.ui.table";
			lib1["props"] = ["enableSelectAll", "useGroupMode", "columnMove"];

			var lib2 = {};
			lib2["name"] = "DataTable";
			lib2["description"] = "DataTable in sap.ui.table";
			lib2["props"] = ["columnHeaderHeight", "allowColumnReordering", "enableColumnFreeze"];

			var lib3 = {};
			lib3["name"] = "Row";
			lib3["description"] = "Row in sap.ui.table";
			lib3["props"] = [];

			var lib4 = {};
			lib4["name"] = "Table";
			lib4["description"] = "Table in sap.ui.table";
			lib4["props"] = [];

			var libs = [lib1, lib2, lib3, lib4];

			return triggerTest(sContent, libs, prefix);
		}));

		it("check templates and metadata under sap.ui.commons", (function() {
			var libName = "sap.ui.commons";
			var prefix = "<com:";
			var lib1 = {};
			lib1["name"] = "Tree";
			lib1["description"] = "Tree in sap.ui.commons";
			lib1["props"] = ["showHeaderIcons", "showHorizontalScrollbar", "selectionMode"];

			var lib2 = {};
			lib2["name"] = "MessageList";
			lib2["description"] = "MessageList in sap.ui.layout.form";
			lib2["props"] = ["visible", "anchorId", "maxListed"];

			var lib3 = {};
			lib3["name"] = "GridContainerData";
			lib3["description"] = "MessageList in sap.ui.layout.form";
			lib3["props"] = ["id"];

			var lib4 = {};
			lib4["name"] = "FormElement";
			lib4["description"] = "FormElement in sap.ui.layout.form";
			lib4["props"] = ["id"];

			var libs = [lib1, lib2, lib3, lib4];

			return triggerTest(sContent, libs, prefix);
		}));

		it("check templates and metadata under sap.ui.layout.form", (function() {
			var libName = "sap.ui.layout.form";
			var prefix = "<form:";
			var lib1 = {};
			lib1["name"] = "GridLayout";
			lib1["description"] = "GridLayout in sap.ui.layout.form";
			lib1["props"] = ["id", "singleColumn"];

			var lib2 = {};
			lib2["name"] = "ResponsiveLayout";
			lib2["description"] = "ResponsiveLayout in sap.ui.layout.form";
			lib2["props"] = ["id"];

			var lib3 = {};
			lib3["name"] = "GridContainerData";
			lib3["description"] = "GridContainerData in sap.ui.layout.form";
			lib3["props"] = ["id"];

			var lib4 = {};
			lib4["name"] = "FormElement";
			lib4["description"] = "FormElement in sap.ui.layout.form";
			lib4["props"] = ["id"];

			var libs = [lib1, lib2, lib3, lib4];

			return triggerTest(sContent, libs, prefix);
		}));

		it("check templates and metadata under sap.ca.ui",   (function() {
    	    var libName = "sap.ca.ui";
    	    var prefix = "<ca:";
    	    var lib1 = {};
    	    lib1["name"] = "PictureTileContainer";
    	    lib1["description"] = "PictureTileContainer in sap.ca.ui";
    	    lib1["props"] = ["busy", "busyIndicatorDelay", "visible", "width", "height", "editable", "allowAdd", "tileMove", "tileDelete", "tileAdd"];
    	    
    	    var lib2 = {};
    	    lib2["name"] = "HierarchicalSelectDialogItem";
    	    lib2["description"] = "HierarchicalSelectDialogItem in sap.ca.ui";
    	    lib2["props"] = [ ];
    	   
    	   	var lib3 = {};
    	    lib3["name"] = "DatePicker";
    	    lib3["description"] = "DatePicker in sap.ca.ui";
    	    lib3["props"] = [ ];
    	    
    	    var lib4 = {};
    	    lib4["name"] = "FileUpload";
    	    lib4["description"] = "FileUpload in sap.ca.ui";
    	    lib4["props"] = [ ];
    	    
    	    var libs = [lib1, lib2, lib3, lib4];
    	    
    	    return triggerTest(sContent2, libs, prefix );
    	}));

		/*it("check templates and metadata under sap.ui.rta",   (function() {
    	    var libName = "sap.ui.rta";
    	    var prefix = "<rta:";
    	    var lib1 = {};
    	    lib1["name"] = "ContextMenu";
    	    lib1["description"] = "ContextMenu in sap.ui.rta";
    	    lib1["props"] = ["id"];

    	    var lib2 = {};
    	    lib2["name"] = "FieldRepository";
    	    lib2["description"] = "FieldRepository in sap.ui.rta";
    	    lib2["props"] = ["id", "opened", "closed", "openCCF"];
    	    
    	   	var lib3 = {};
    	    lib3["name"] = "RuntimeAuthoring";
    	    lib3["description"] = "RuntimeAuthoring in sap.ui.rta";
    	    lib3["props"] = ["id", "customFieldUrl", "start", "stop" ];
    	    
    	    var lib4 = {};
    	    lib4["name"] = "ToolsMenu";
    	    lib4["description"] = "ToolsMenu in sap.ui.rta";
    	    lib4["props"] = ["id", "close", "selectedTool"];
    	    
    	    var libs = [lib1, lib2, lib3, lib4];
    	    
    	    return triggerTest(sContent, libs, prefix );
    	}));*/

	/*	it("check templates and metadata under sap.ui.suite", (function() {
    	    var libName = "sap.ui.suite";
    	    var prefix = "<suite:";
    	    var lib1 = {};
    	    lib1["name"] = "ContextMenu";
    	    lib1["description"] = "ContextMenu in sap.ui.suite";
    	    lib1["props"] = ["id"];

    	    var lib2 = {};
    	    lib2["name"] = "FieldRepository";
    	    lib2["description"] = "FieldRepository in sap.ui.suite";
    	    lib2["props"] = ["id", "opened", "closed", "openCCF"];

    	    var libs = [lib1, lib2];
    	    
    	    return triggerTest(sContent, libs, prefix );
    	}));*/
    	
    	it("check templates and metadata under sap.viz", (function() {
    	    var libName = "sap.viz";
    	    var prefix = "<viz:";
    	    
    	    var lib1 = {};
    	    lib1["name"] = "ui5/controls.Popover";
    	    lib1["description"] = "ui5/controls.Popover in sap.viz";
    	    lib1["props"] = ["id"];

    	    var lib2 = {};
    	    lib2["name"] = "ui5/controls.VizFrameme";
    	    lib2["description"] = "ui5/controls.VizFrameme in sap.viz";
    	    lib2["props"] = ["id"];

            var lib3 = {};
    	    lib3["name"] = "ui5/types.RootContainerer";
    	    lib3["description"] = "ui5/types.RootContainerer in sap.viz";
    	    lib3["props"] = [];
    	    
    	    var libs = [lib1, lib2, lib3];
    	    
    	    return triggerTest(sContent, libs, prefix );
    	}));
    	
    	it("check templates and metadata under sap.ushell", (function() {
    	    var libName = "sap.ushell";
    	    var prefix = "<ushell:";
    	    
    	    var lib1 = {};
    	    lib1["name"] = "ui/launchpad.HeaderTilele";
    	    lib1["description"] = "ui/launchpad.HeaderTilele in sap.ushell";
    	    lib1["props"] = ["id"];

    	    var lib2 = {};
    	    lib2["name"] = "components/factsheet.controls.PictureViewerItemem";
    	    lib2["description"] = "components/factsheet.controls.PictureViewerItemem in sap.ushell";
    	    lib2["props"] = ["id"];

            var lib3 = {};
    	    lib3["name"] = "ui5/types.RootContainerer";
    	    lib3["description"] = "ui5/types.RootContainerer in sap.ushell";
    	    lib3["props"] = [];
    	    
    	    var libs = [lib1, lib2, lib3];
    	    
    	    return triggerTest(sContent, libs, prefix );
    	}));
    	
		it("check templates and metadata under sap.suite.ui.commons", (function() {
			var libName = "sap.suite.ui.commons";
			var prefix = "<suite:";
			var lib1 = {};
			lib1["name"] = "ContextMenu";
			lib1["description"] = "ContextMenu in sap.suite.ui.commons";
			lib1["props"] = ["id"];

			var lib2 = {};
			lib2["name"] = "FieldRepository";
			lib2["description"] = "FieldRepository in sap.suite.ui.commons";
			lib2["props"] = ["id", "opened", "closed", "openCCF"];

			var libs = [lib1, lib2];

			return triggerTest(sContent, libs, prefix);
		}));

	/*	it("check templates and metadata under sap.ndc",   (function() {
    	    var libName = "sap.ndc";
    	    var prefix = "<ndc:";
    	    var lib1 = {};
    	    lib1["name"] = "BarcodeScannerButton";
    	    lib1["description"] = "BarcodeScannerButton in sap.ndc";
    	    lib1["props"] = ["id", "provideFallback", "visible", "scanSuccess", "scanFail", "inputLiveUpdate"];

    	    var libs = [lib1];
    	    
    	    return triggerTest(sContent2, libs, prefix );
    	}));*/

		it("check templates and metadata under sap.ui.comp.smartfilterbar", (function() {
			var libName = "sap.ui.comp";
			var prefix = "<comp:";
			var lib1 = {};
			lib1["name"] = "ControlConfiguration";
			lib1["description"] = "ControlConfiguration in sap.ui.comp";
			lib1["props"] = ["id", "key", "groupId", "label", "visible", "hasValueHelpDialog", "controlType", "filterType", "index",
				"hasTypeAhead", "mandatory", "width", "visibleInAdvancedArea", "preventInitialDataFetchInValueHelpDialog", "displayBehaviour",
				"change"
			];

			var lib2 = {};
			lib2["name"] = "SmartFilterBar";
			lib2["description"] = "SmartFilterBar in sap.ui.comp";
			lib2["props"] = [];

			var lib3 = {};
			lib3["name"] = "ControlConfigurationSmartFilterBar";
			lib3["description"] = "ControlConfigurationSmartFilterBar in sap.ui.comp";
			lib3["props"] = [];

			var lib4 = {};
			lib4["name"] = "SelectOptionControlConfigurationSmartFilterBar";
			lib4["description"] = "SelectOptionControlConfigurationSmartFilterBar in sap.ui.comp";
			lib4["props"] = [];

			var libs = [lib1, lib2, lib3, lib4];

			return triggerTest(sContent2, libs, prefix);
		}));

	/*	it("check templates and metadata under sap.ui.demokit",   (function() {
    	    var libName = "sap.ui.demokit";
    	    var prefix = "<demo:";
    	    var lib1 = {};
    	    lib1["name"] = "CodeSampleContainer";
    	    lib1["description"] = "CodeSampleContainer in sap.ui.demokit";
    	    lib1["props"] = ["id", "scriptElementId", "uiAreaId", "title", "sourceVisible", "width", "apply"];
    	    
    	    var lib2 = {};
    	    lib2["name"] = "CodeViewer";
    	    lib2["description"] = "CodeViewer in sap.ui.demokit";
    	    lib2["props"] = [ ];
    	   
    	   	var lib3 = {};
    	    lib3["name"] = "FileUploadIntrospector";
    	    lib3["description"] = "FileUploadIntrospector in sap.ui.demokit";
    	    lib3["props"] = [ ];
    	    
    	    var lib4 = {};
    	    lib4["name"] = "IndexLayout";
    	    lib4["description"] = "IndexLayout in sap.ui.demokit";
    	    lib4["props"] = [ ];
    	    
    	    var libs = [lib1, lib2, lib3, lib4];
    	    
    	    return triggerTest(sContent2, libs, prefix );
    	}));*/

		it("check templates and metadata under sap.ui.ux3", (function() {
			var libName = "sap.ui.ux3";
			var prefix = "<ux3:";
			var lib1 = {};
			lib1["name"] = "Shell";
			lib1["description"] = "Shell in sap.ui.ux3";
			lib1["props"] = ["id"];

			var lib2 = {};
			lib2["name"] = "ActionBar";
			lib2["description"] = "ActionBar in sap.ui.ux3";
			lib2["props"] = ["id"];

			var lib3 = {};
			lib3["name"] = "Collection";
			lib3["description"] = "Collection in sap.ui.ux3";
			lib3["props"] = [];

			var lib4 = {};
			lib4["name"] = "Feed";
			lib4["description"] = "Feed in sap.ui.ux3";
			lib4["props"] = [];

			var libs = [lib1, lib2, lib3, lib4];

			return triggerTest(sContent, libs, prefix);
		}));

		/*it("check templates and metadata under sap.ui.fl",   (function() {
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
    	    
    	    return triggerTest(sContent, libs, prefix );
    	}));*/

		it("check templates and metadata under sap.ui.richtexteditor",   (function() {
    	    var libName = "sap.ui.richtexteditor";
    	    var prefix = "<rich:";
    	    var lib1 = {};
    	    lib1["name"] = "RichTextEditor";
    	    lib1["description"] = "RichTextEditor in sap.ui.richtexteditor";
    	    lib1["props"] = ["id"];

    	    var libs = [lib1];
    	    
    	    return triggerTest(sContent, libs, prefix );
    	}));

		/*	it("check templates and metadata under sap.ui.generic.app",   (function() {
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
    	    
    	    return triggerTest(sContent, libs, prefix );
    	}));*/

		/*it("check templates and metadata under sap.ui.generic.template",   (function() {
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
    	    
    	    return triggerTest(sContent, libs, prefix );
    	}));*/

		function triggerTest(content, libraries, prefix) {
			var iOffset = content.indexOf(prefix) + prefix.length;
			var oContentStatus = {
				buffer: content,
				offset: iOffset
			};
			var countAllTemplates = 0;
			var countAllMetadatas = 0;
			var countAllDeprecatedTemplates = 0;
			var countAllDeprecatedMetadatas = 0;
			var listOfDeprecatedTemplates = " ";
			var listOfDeprecatedMetadatas = " ";
			var allProposals = 0;

			return oXMLCodeCompletionService.getWordSuggestions(oContentStatus).then(function(result) {
				if (result.proposals) {
					allProposals = result.proposals.length;
				}
				for (var i = 0; i < allProposals; i++) {
					//count all templates
					if (result.proposals[i].categoryDesc === "SNIPPET") {
						countAllTemplates++;
						//count all deprecated templates 
						if (result.proposals[i].helpDescription && result.proposals[i].helpDescription.indexOf("Deprecated!") > -1) {
							countAllDeprecatedTemplates++;
							listOfDeprecatedTemplates = listOfDeprecatedTemplates + "  ,  " + result.proposals[i].description;
						}
					}

					//count all metadatas
					if (!(result.proposals[i].categoryDesc)) {
						countAllMetadatas++;
						//count all deprecated metadatas 
						if (result.proposals[i].helpDescription && result.proposals[i].helpDescription.indexOf("Deprecated!") > -1) {
							countAllDeprecatedMetadatas++;
							listOfDeprecatedMetadatas = listOfDeprecatedMetadatas + "  ,  " + result.proposals[i].description;
						}
					}

					for (var l = 0; l < libraries.length; l++) {

						if (result.proposals[i].description === libraries[l].description) {

							if (result.proposals[i].categoryDesc === "SNIPPET") {
								//check the properties
								if (result.proposals[i].proposal) {
									var properties = libraries[l].props;
									for (var j = 0; j < properties.length; j++) {
										expect(result.proposals[i].proposal.indexOf(properties[j]), "there is property " + properties[j] + " in " + libraries[l].description)
											.to.be.above(-1);
									}
								}
							}
						}
					}

				}
				expect(allProposals, "SUMMARY--- NUMBER OF METADATA AND TEMPLATES: " + allProposals).to.be.above(0);
				expect(countAllTemplates, "NUMBER OF TEMPLATES: " + countAllTemplates).to.be.at.least(0);
				expect(countAllMetadatas, "NUMBER OF METADATAS: " + countAllMetadatas).to.be.at.least(0);
				expect(listOfDeprecatedTemplates, "LIST OF DEPRECATED TEMPLATES: " + listOfDeprecatedTemplates).to.have.length.of.at.least(0);
				expect(countAllDeprecatedTemplates, "NUMBER OF DEPRECATED TEMPLATES: " + countAllDeprecatedTemplates).to.be.at.least(0);
				expect(listOfDeprecatedMetadatas, "LIST OF DEPRECATED METADATAS: " + listOfDeprecatedMetadatas).to.have.length.of.at.least(0);
				expect(countAllDeprecatedMetadatas, "NUMBER OF DEPRECATED METADATAS: " + countAllDeprecatedMetadatas).to.be.at.least(0);
			});
		};

		after(function() {
			STF.shutdownWebIde(suiteName);
		});
	});
});