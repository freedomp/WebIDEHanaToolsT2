define(["sap/watt/core/q"], function (coreQ) {

	"use strict";

	describe("Unit tests for ExtensionHook class", function () {

		var oExtensionHook;

		// This is the JS escaped code (escaped so it can be used here as a string. http://www.freeformatter.com/javascript-escape.html)
		// of the S2 controller from MM_PO_APV (purchase and approval order)
		var controllerJs_MM_PO_APV_S2 = "\/*\r\n * Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved\r\n *\/\r\njQuery.sap.require(\"ui.s2p.mm.purchorder.approve.util.Conversions\");\r\njQuery.sap.require(\"sap.ca.scfld.md.controller.ScfldMasterController\");\r\nsap.ca.scfld.md.controller.ScfldMasterController.extend(\"ui.s2p.mm.purchorder.approve.view.S2\", {\r\n\tonInit: function() {\r\n\t\tthis.getView().getModel().setSizeLimit(1000000);\r\n\t\tthis.getData();\r\n\t\tvar c = sap.ui.core.Component.getOwnerIdFor(this.getView());\r\n\t\tvar C = sap.ui.component(c);\r\n\t\tC.oEventBus.subscribe(\"ui.s2p.mm.purchorder.approve\", \"selectNextWorkItem\", this._selectNextWorkItem, this);\r\n\t\tthis.oRouter.attachRoutePatternMatched(function(e) {\r\n\t\t\tif (e.getParameter(\"name\") === \"detail\") {\r\n\t\t\t\tvar b = this.getBindingContextPathFor(e.getParameter(\"arguments\"));\r\n\t\t\t\tvar i = this.findItemByContextPath(b);\r\n\t\t\t\tvar l = this.getList();\r\n\t\t\t\tvar I = l.indexOfItem(i);\r\n\t\t\t\tvar a = l.getItems().length;\r\n\t\t\t\tif (a > 1) {\r\n\t\t\t\t\tvar n = 0;\r\n\t\t\t\t\tif (a === I + 1) {\r\n\t\t\t\t\t\tn = I - 1\r\n\t\t\t\t\t} else {\r\n\t\t\t\t\t\tn = I + 1\r\n\t\t\t\t\t}\r\n\t\t\t\t\tvar N = l.getItems()[n];\r\n\t\t\t\t\tvar o = l.getItems()[I];\r\n\t\t\t\t\tthis._sNextDetailPath = N && N.getBindingContext(this.sModelName).getPath();\r\n\t\t\t\t\tthis._sCurrentDetailPath = i && o.getBindingContext(this.sModelName).getPath()\r\n\t\t\t\t}\r\n\t\t\t}\r\n\t\t}, this);\r\n\t\tif (this.extHookOnInit) {\r\n\t\t\tthis.extHookOnInit()\r\n\t\t}\r\n\t},\r\n\t_selectNextWorkItem: function(c, e, d) {\r\n\t\tif (e === \"selectNextWorkItem\") {\r\n\t\t\tif (sap.ui.Device.system.phone) {\r\n\t\t\t\twindow.history.go(-1)\r\n\t\t\t}\r\n\t\t\tvar l = this.getList();\r\n\t\t\tl.getBinding(\'items\').refresh();\r\n\t\t\tl.attachEventOnce(\"updateFinished\", function() {\r\n\t\t\t\tvar C = this.findItemByContextPath(this._sCurrentDetailPath);\r\n\t\t\t\tvar i = this.findItemByContextPath(this._sNextDetailPath);\r\n\t\t\t\tif (!sap.ui.Device.system.phone) {\r\n\t\t\t\t\tif (C) {\r\n\t\t\t\t\t\tthis.setListItem(C)\r\n\t\t\t\t\t} else if (i) {\r\n\t\t\t\t\t\tthis.setListItem(i)\r\n\t\t\t\t\t} else {\r\n\t\t\t\t\t\tif (this.getList().getItems().length >= 1) {\r\n\t\t\t\t\t\t\tthis.selectFirstItem()\r\n\t\t\t\t\t\t} else {\r\n\t\t\t\t\t\t\tthis.showEmptyView(\"DETAIL_TITLE\", \"NO_ITEMS_AVAILABLE\")\r\n\t\t\t\t\t\t}\r\n\t\t\t\t\t}\r\n\t\t\t\t}\r\n\t\t\t\tif (d.bMessageToast && d.bMessageToast === true && d.sMessage) {\r\n\t\t\t\t\tsap.m.MessageToast.show(d.sMessage, {\r\n\t\t\t\t\t\tduration: 3500\r\n\t\t\t\t\t})\r\n\t\t\t\t}\r\n\t\t\t}, this)\r\n\t\t}\r\n\t},\r\n\tgetData: function() {\r\n\t\tvar l = this.getList();\r\n\t\tvar t = l.getItems()[0].clone();\r\n\t\tvar s = new sap.ui.model.Sorter(\"WiCreatedAt\", true);\r\n\t\tvar f = [];\r\n\t\tl.bindItems(\"\/WorkflowTaskCollection\", t, s, f)\r\n\t},\r\n\tgetHeaderFooterOptions: function() {\r\n\t\tvar l = {\r\n\t\t\tsI18NMasterTitle: \"MASTER_TITLE\"\r\n\t\t};\r\n\t\tif (this.extHookSetHeaderFooterOptions) {\r\n\t\t\tl = this.extHookSetHeaderFooterOptions(l)\r\n\t\t}\r\n\t\treturn l\r\n\t},\r\n\t_getODataSearchFields: function() {\r\n\t\tvar o = [\"CreatedByName\", \"ForwardedByName\", \"ItemDescriptions\", \"PoNumber\", \"PoNumberFormatted\", \"SearchForText\", \"SubstitutingForName\",\r\n\t\t\t\"SupplierID\", \"SupplierName\", \"WiCreatedAt\", \"WorkitemID\"];\r\n\t\tif (this.extHookModifySearchableODataFieldsForMasterListSearch) {\r\n\t\t\to = this.extHookModifySearchableODataFieldsForMasterListSearch(o)\r\n\t\t}\r\n\t\treturn o\r\n\t},\r\n\t_getTextsFromUIElementsForSearch: function(i) {\r\n\t\tvar u = [];\r\n\t\tif (i.getIntro()) u.push(i.getIntro());\r\n\t\tif (i.getTitle()) u.push(i.getTitle());\r\n\t\tif (i.getNumber()) u.push(i.getNumber());\r\n\t\tif (i.getNumberUnit()) u.push(i.getNumberUnit());\r\n\t\tif (i.getFirstStatus()) u.push(i.getFirstStatus().getText());\r\n\t\tif (i.getSecondStatus()) u.push(i.getSecondStatus().getText());\r\n\t\tvar a = i.getAttributes();\r\n\t\tfor (var j = 0; j < a.length; j++) {\r\n\t\t\tu.push(a[j].getText())\r\n\t\t}\r\n\t\tif (this.extHookDefineSearchableUITextsForMasterListSearch) {\r\n\t\t\tu = this.extHookDefineSearchableUITextsForMasterListSearch(i)\r\n\t\t}\r\n\t\treturn u\r\n\t},\r\n\t_searchOnODataFields: function(i, f) {\r\n\t\tvar o = this._getODataSearchFields();\r\n\t\tvar m = i.getBindingContext(this.sModelName).getProperty();\r\n\t\tfor (var a = 0; a <= o.length; a++) {\r\n\t\t\tvar k = o[a];\r\n\t\t\tvar v = \"\";\r\n\t\t\tif (k === \"WiCreatedAt\") {\r\n\t\t\t\tvar M = m[k];\r\n\t\t\t\tvar b = sap.ca.ui.model.format.DateFormat.getDateInstance({\r\n\t\t\t\t\tstyle: \"medium\"\r\n\t\t\t\t}, sap.ui.getCore().getConfiguration().getLocale());\r\n\t\t\t\tif (M !== \"\") {\r\n\t\t\t\t\tv = b.format(M, false)\r\n\t\t\t\t}\r\n\t\t\t} else {\r\n\t\t\t\tv = m[k]\r\n\t\t\t} if (typeof v === \"string\") {\r\n\t\t\t\tif (v.toLowerCase().indexOf(f) !== -1) {\r\n\t\t\t\t\treturn true\r\n\t\t\t\t}\r\n\t\t\t}\r\n\t\t}\r\n\t},\r\n\t_searchOnUITexts: function(i, f) {\r\n\t\tvar u = this._getTextsFromUIElementsForSearch(i);\r\n\t\tfor (var a = 0; a <= u.length; a++) {\r\n\t\t\tif (typeof u[a] !== \"undefined\" && u[a] !== \"\") {\r\n\t\t\t\tif (u[a].toLowerCase().indexOf(f) !== -1) {\r\n\t\t\t\t\treturn true\r\n\t\t\t\t}\r\n\t\t\t}\r\n\t\t}\r\n\t},\r\n\tapplySearchPatternToListItem: function(i, f) {\r\n\t\tif (f === \"\") {\r\n\t\t\treturn true\r\n\t\t}\r\n\t\tif (this._searchOnODataFields(i, f) === true) {\r\n\t\t\treturn true\r\n\t\t}\r\n\t\tif (this._searchOnUITexts(i, f) === true) {\r\n\t\t\treturn true\r\n\t\t}\r\n\t\treturn false\r\n\t}\r\n});"
		// Same controller, but after removal of the hooks
		var controllerJs_MM_PO_APV_S2_without_hooks = "\/*\r\n * Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved\r\n *\/\r\njQuery.sap.require(\"ui.s2p.mm.purchorder.approve.util.Conversions\");\r\njQuery.sap.require(\"sap.ca.scfld.md.controller.ScfldMasterController\");\r\nsap.ca.scfld.md.controller.ScfldMasterController.extend(\"ui.s2p.mm.purchorder.approve.view.S2\", {\r\n\tonInit: function() {\r\n\t\tthis.getView().getModel().setSizeLimit(1000000);\r\n\t\tthis.getData();\r\n\t\tvar c = sap.ui.core.Component.getOwnerIdFor(this.getView());\r\n\t\tvar C = sap.ui.component(c);\r\n\t\tC.oEventBus.subscribe(\"ui.s2p.mm.purchorder.approve\", \"selectNextWorkItem\", this._selectNextWorkItem, this);\r\n\t\tthis.oRouter.attachRoutePatternMatched(function(e) {\r\n\t\t\tif (e.getParameter(\"name\") === \"detail\") {\r\n\t\t\t\tvar b = this.getBindingContextPathFor(e.getParameter(\"arguments\"));\r\n\t\t\t\tvar i = this.findItemByContextPath(b);\r\n\t\t\t\tvar l = this.getList();\r\n\t\t\t\tvar I = l.indexOfItem(i);\r\n\t\t\t\tvar a = l.getItems().length;\r\n\t\t\t\tif (a > 1) {\r\n\t\t\t\t\tvar n = 0;\r\n\t\t\t\t\tif (a === I + 1) {\r\n\t\t\t\t\t\tn = I - 1\r\n\t\t\t\t\t} else {\r\n\t\t\t\t\t\tn = I + 1\r\n\t\t\t\t\t}\r\n\t\t\t\t\tvar N = l.getItems()[n];\r\n\t\t\t\t\tvar o = l.getItems()[I];\r\n\t\t\t\t\tthis._sNextDetailPath = N && N.getBindingContext(this.sModelName).getPath();\r\n\t\t\t\t\tthis._sCurrentDetailPath = i && o.getBindingContext(this.sModelName).getPath()\r\n\t\t\t\t}\r\n\t\t\t}\r\n\t\t}, this);\r\n\t\t\r\n\t},\r\n\t_selectNextWorkItem: function(c, e, d) {\r\n\t\tif (e === \"selectNextWorkItem\") {\r\n\t\t\tif (sap.ui.Device.system.phone) {\r\n\t\t\t\twindow.history.go(-1)\r\n\t\t\t}\r\n\t\t\tvar l = this.getList();\r\n\t\t\tl.getBinding(\'items\').refresh();\r\n\t\t\tl.attachEventOnce(\"updateFinished\", function() {\r\n\t\t\t\tvar C = this.findItemByContextPath(this._sCurrentDetailPath);\r\n\t\t\t\tvar i = this.findItemByContextPath(this._sNextDetailPath);\r\n\t\t\t\tif (!sap.ui.Device.system.phone) {\r\n\t\t\t\t\tif (C) {\r\n\t\t\t\t\t\tthis.setListItem(C)\r\n\t\t\t\t\t} else if (i) {\r\n\t\t\t\t\t\tthis.setListItem(i)\r\n\t\t\t\t\t} else {\r\n\t\t\t\t\t\tif (this.getList().getItems().length >= 1) {\r\n\t\t\t\t\t\t\tthis.selectFirstItem()\r\n\t\t\t\t\t\t} else {\r\n\t\t\t\t\t\t\tthis.showEmptyView(\"DETAIL_TITLE\", \"NO_ITEMS_AVAILABLE\")\r\n\t\t\t\t\t\t}\r\n\t\t\t\t\t}\r\n\t\t\t\t}\r\n\t\t\t\tif (d.bMessageToast && d.bMessageToast === true && d.sMessage) {\r\n\t\t\t\t\tsap.m.MessageToast.show(d.sMessage, {\r\n\t\t\t\t\t\tduration: 3500\r\n\t\t\t\t\t})\r\n\t\t\t\t}\r\n\t\t\t}, this)\r\n\t\t}\r\n\t},\r\n\tgetData: function() {\r\n\t\tvar l = this.getList();\r\n\t\tvar t = l.getItems()[0].clone();\r\n\t\tvar s = new sap.ui.model.Sorter(\"WiCreatedAt\", true);\r\n\t\tvar f = [];\r\n\t\tl.bindItems(\"\/WorkflowTaskCollection\", t, s, f)\r\n\t},\r\n\tgetHeaderFooterOptions: function() {\r\n\t\tvar l = {\r\n\t\t\tsI18NMasterTitle: \"MASTER_TITLE\"\r\n\t\t};\r\n\t\t\r\n\t\treturn l\r\n\t},\r\n\t_getODataSearchFields: function() {\r\n\t\tvar o = [\"CreatedByName\", \"ForwardedByName\", \"ItemDescriptions\", \"PoNumber\", \"PoNumberFormatted\", \"SearchForText\", \"SubstitutingForName\",\r\n\t\t\t\"SupplierID\", \"SupplierName\", \"WiCreatedAt\", \"WorkitemID\"];\r\n\t\t\r\n\t\treturn o\r\n\t},\r\n\t_getTextsFromUIElementsForSearch: function(i) {\r\n\t\tvar u = [];\r\n\t\tif (i.getIntro()) u.push(i.getIntro());\r\n\t\tif (i.getTitle()) u.push(i.getTitle());\r\n\t\tif (i.getNumber()) u.push(i.getNumber());\r\n\t\tif (i.getNumberUnit()) u.push(i.getNumberUnit());\r\n\t\tif (i.getFirstStatus()) u.push(i.getFirstStatus().getText());\r\n\t\tif (i.getSecondStatus()) u.push(i.getSecondStatus().getText());\r\n\t\tvar a = i.getAttributes();\r\n\t\tfor (var j = 0; j < a.length; j++) {\r\n\t\t\tu.push(a[j].getText())\r\n\t\t}\r\n\t\t\r\n\t\treturn u\r\n\t},\r\n\t_searchOnODataFields: function(i, f) {\r\n\t\tvar o = this._getODataSearchFields();\r\n\t\tvar m = i.getBindingContext(this.sModelName).getProperty();\r\n\t\tfor (var a = 0; a <= o.length; a++) {\r\n\t\t\tvar k = o[a];\r\n\t\t\tvar v = \"\";\r\n\t\t\tif (k === \"WiCreatedAt\") {\r\n\t\t\t\tvar M = m[k];\r\n\t\t\t\tvar b = sap.ca.ui.model.format.DateFormat.getDateInstance({\r\n\t\t\t\t\tstyle: \"medium\"\r\n\t\t\t\t}, sap.ui.getCore().getConfiguration().getLocale());\r\n\t\t\t\tif (M !== \"\") {\r\n\t\t\t\t\tv = b.format(M, false)\r\n\t\t\t\t}\r\n\t\t\t} else {\r\n\t\t\t\tv = m[k]\r\n\t\t\t} if (typeof v === \"string\") {\r\n\t\t\t\tif (v.toLowerCase().indexOf(f) !== -1) {\r\n\t\t\t\t\treturn true\r\n\t\t\t\t}\r\n\t\t\t}\r\n\t\t}\r\n\t},\r\n\t_searchOnUITexts: function(i, f) {\r\n\t\tvar u = this._getTextsFromUIElementsForSearch(i);\r\n\t\tfor (var a = 0; a <= u.length; a++) {\r\n\t\t\tif (typeof u[a] !== \"undefined\" && u[a] !== \"\") {\r\n\t\t\t\tif (u[a].toLowerCase().indexOf(f) !== -1) {\r\n\t\t\t\t\treturn true\r\n\t\t\t\t}\r\n\t\t\t}\r\n\t\t}\r\n\t},\r\n\tapplySearchPatternToListItem: function(i, f) {\r\n\t\tif (f === \"\") {\r\n\t\t\treturn true\r\n\t\t}\r\n\t\tif (this._searchOnODataFields(i, f) === true) {\r\n\t\t\treturn true\r\n\t\t}\r\n\t\tif (this._searchOnUITexts(i, f) === true) {\r\n\t\t\treturn true\r\n\t\t}\r\n\t\treturn false\r\n\t}\r\n});";
		// This is the JS escaped code of a custom controller created for the S3 controller from MM_PO_APV. It contains 2 hooks
		var customControllerJs_MM_PO_APV_S3 = "sap.ui.controller(\"ui.s2p.mm.purchorder.approve.MM_PO_APVExtension.view.S3Custom\", {\r\n\r\n\t\/\/@@@extHookOnInit start - do not remove this line\r\n\textHookOnInit: function() {\r\n\t\t\/* Place your hook implementation code here *\/\r\n\t}\r\n\t\/\/@@@extHookOnInit end - do not remove this line\r\n\r\n\r\n\r\n\t\/\/@@@extHookSetHeaderFooterOptions start - do not remove this line\r\n\t,extHookSetHeaderFooterOptions: function(l) {\r\n\t\t\/* Place your hook implementation code here *\/\r\n\t\talert(\"bla bla\");\r\n\t}\r\n\t\/\/@@@extHookSetHeaderFooterOptions end - do not remove this line\r\n});";
		// Controller with duplicate call to extHookOnInit
		var customControllerJsDuplicateCalls = "jQuery.sap.require(\"sap.ca.scfld.md.controller.ScfldMasterController\");\r\nsap.ca.scfld.md.controller.ScfldMasterController.extend(\"ui.s2p.mm.purchorder.approve.view.S2\", {\r\n\tonInit: function() {\r\n\t\tif (this.extHookOnInit) {\r\n\t\t\tthis.extHookOnInit();\r\n\t\t}\r\n\t\t\r\n\t\tif (this.extHookOnInit) {\r\n\t\t\tthis.extHookOnInit();\r\n\t\t}\r\n\t}\r\n});";

		beforeEach(function () {
			return coreQ.sap.require("sap/watt/saptoolsets/fiori/project/plugin/fioriexttemplate/util/ExtensionHook").then(function(ExtensionHook) {
				oExtensionHook = ExtensionHook;
			});
		});

		it("Tests getHooks method", function() {
			var actualHooks = oExtensionHook.getHooks(controllerJs_MM_PO_APV_S2);
			var expectedHooks = [
				{"args": ["i"], "name": "extHookDefineSearchableUITextsForMasterListSearch"},
				{"args": ["o"], "name": "extHookModifySearchableODataFieldsForMasterListSearch"},
				{"args": [], "name": "extHookOnInit"},
				{"args": ["l"], "name": "extHookSetHeaderFooterOptions"}
			];
			expect(actualHooks).to.deep.equal(expectedHooks);
		});

		it("Tests getHooks method - zero hooks", function() {
			var actualHooks = oExtensionHook.getHooks(controllerJs_MM_PO_APV_S2_without_hooks);
			var expectedHooks = [];
			expect(actualHooks).to.deep.equal(expectedHooks);
		});

		it("Tests getHooks method - duplicate hooks", function() {
			var actualHooks = oExtensionHook.getHooks(customControllerJsDuplicateCalls);
			var expectedHooks = [
				{"args": [], "name": "extHookOnInit"}
			];
			expect(actualHooks).to.deep.equal(expectedHooks);
		});

		it("Tests isHookExtended method", function() {
			var foundFlag = oExtensionHook.isHookExtended("extHookSetHeaderFooterOptions", customControllerJs_MM_PO_APV_S3);
			expect(foundFlag).to.be.true;
		});

		it("Tests isHookExtended method - not finding", function() {
			var foundFlag = oExtensionHook.isHookExtended("extHookNoSuchHook", customControllerJs_MM_PO_APV_S3);
			expect(foundFlag).to.be.false;
		});

		it("Tests addHook method - first hook in the controller", function() {
			var controllerJsPrefix = "sap.ui.controller(\"S2Custom\", {";
			var controllerJsSuffix = "});";
			var hookDef = "extHookNew: function () {}";
			var actualModifiedController = oExtensionHook.addHook(hookDef, controllerJsPrefix + controllerJsSuffix);
			var expectedModifiedController = controllerJsPrefix + hookDef + controllerJsSuffix;
			// Compare while ignoring white spaces
			expect(actualModifiedController.replace(/\s/g, '')).to.equal(expectedModifiedController.replace(/\s/g, ''));
		});

		it("Tests addHook method - additional hook in the controller", function() {
			var controllerJsPrefix = "sap.ui.controller(\"S2Custom\", { extHookOld: function () {}";
			var controllerJsSuffix = "});";
			var hookDef = "extHookNew: function () {}";
			var actualModifiedController = oExtensionHook.addHook(hookDef, controllerJsPrefix + controllerJsSuffix);
			var expectedModifiedController = controllerJsPrefix + "," + hookDef + controllerJsSuffix;
			// Compare while ignoring white spaces
			expect(actualModifiedController.replace(/\s/g, '')).to.equal(expectedModifiedController.replace(/\s/g, ''));
		});

		it("Tests removeHook method", function() {
			var controllerJsPrefix = "sap.ui.controller(\"S2Custom\", {";
			var hookName = "extHookABC";
			var hookDef = hookName + ": function () {}";
			var controllerJsSuffix = "});";
			var actualModifiedController = oExtensionHook.removeHook(hookName, controllerJsPrefix + hookDef + controllerJsSuffix);
			var expectedModifiedController = controllerJsPrefix + controllerJsSuffix;
			// Compare while ignoring white spaces
			expect(actualModifiedController.replace(/\s/g, '')).to.equal(expectedModifiedController.replace(/\s/g, ''));
		});

		it("Tests removeHook method - hook doesn't exist", function() {
			var controllerJsPrefix = "sap.ui.controller(\"S2Custom\", {";
			var hookName = "extHookABC";
			var controllerJsSuffix = "});";
			var inputControllerJs = controllerJsPrefix + controllerJsSuffix;
			var outputControllerJs = oExtensionHook.removeHook(hookName, inputControllerJs);
			// When there is nothing to remove, we expect to get the input controller back as-is
			expect(outputControllerJs).to.equal(inputControllerJs);
		});

		it("Tests _getArgumentString method", function() {
			// Simple identifier - y
			var oYArgument = {type: esprima.Syntax.Identifier, name: "y"};
			var sArgument = oExtensionHook._getArgumentString(oYArgument);
			expect(sArgument).to.equal("y");

			// 'this'
			var oThisArgument = {type: esprima.Syntax.ThisExpression};
			sArgument = oExtensionHook._getArgumentString(oThisArgument);
			expect(sArgument).to.equal("that");

			// Member access - y.x
			var oYDotXArgument = {type: esprima.Syntax.MemberExpression, object: oYArgument, property: {name: "x"}};
			sArgument = oExtensionHook._getArgumentString(oYDotXArgument);
			expect(sArgument).to.equal("y_x");

			// Member access - y.x.z
			var oYDotXDotZArgument = {type: esprima.Syntax.MemberExpression, object: oYDotXArgument, property: {name: "z"}};
			sArgument = oExtensionHook._getArgumentString(oYDotXDotZArgument);
			expect(sArgument).to.equal("y_x_z");

			// this member access - this.x
			var oThisDotXArgument = {type: esprima.Syntax.MemberExpression, object: oThisArgument, property: {name: "x"}};
			sArgument = oExtensionHook._getArgumentString(oThisDotXArgument);
			expect(sArgument).to.equal("that_x");
		});

		it("Tests _getArgumentString method - negative", function() {
			var sArgument = oExtensionHook._getArgumentString();
			expect(sArgument).to.equal("");

			sArgument = oExtensionHook._getArgumentString(null);
			expect(sArgument).to.equal("");

			sArgument = oExtensionHook._getArgumentString({});
			expect(sArgument).to.equal("");
		});

		afterEach(function () {
			oExtensionHook = undefined;
		});
	});
});