define([
	"sap/watt/lib/lodash/lodash",
	"w5g/w5gTestUtils",
	"sap/watt/saptoolsets/fiori/editor/plugin/ui5wysiwygeditor/utils/CopyPasteUtils"
], function (_, w5gTestUtils, CopyPasteUtils) {
	"use strict";

	describe("Cut/Copy Paste Utilities", function () {
		var xmlString =
			"<mvc:View xmlns=\"sap.m\" xmlns:core=\"sap.ui.core\" xmlns:mvc=\"sap.ui.core.mvc\" xmlns:l=\"sap.ui.layout\" xmlns:f=\"sap.ui.layout.form\" controllerName=\"SalesOrder.view.Detail\">\r\n" +
			"    <Page id=\"detailPage\" navButtonPress=\"onNavBack\" showNavButton=\"{device&gt;/isPhone}\" headerContent=\"{test&gt;/SalesOrders2}\" title=\"{i18n&gt;detailTitle}\">\r\n" +
			"        <content>\r\n" +
			"        <sap.ui.layout.form:SimpleForm editable=\"false\" layout=\"ResponsiveGridLayout\" id=\"__form1\">\r\n" +
			"            <sap.ui.layout.form:content>\r\n" +
			"                <core:Title text=\"Title\" id=\"__title1\"/>\r\n" +
			"                <Label text=\"Label 1\" id=\"__label2\"/>\r\n" +
			"                <Input width=\"100%\" id=\"__input4\"/>\r\n" +
			"                <Input width=\"100%\" id=\"__input5\"/>\r\n" +
			"                <Label text=\"Label 2\" id=\"__label3\"/>\r\n" +
			"                <Input width=\"100%\" id=\"__input6\"/></sap.ui.layout.form:content>\r\n" +
			"        </sap.ui.layout.form:SimpleForm>\r\n" +
			"        </content>\r\n" +
			"        <headerContent>\r\n" +
			" 		 	<Button text=\"{text}\" width=\"110px\" type=\"Default\"/>\r\n" +
			"        </headerContent>\r\n" +
			"    </Page>\r\n" +
			"</mvc:View>";
		var parser = new DOMParser();
		var xmlDoc = parser.parseFromString(xmlString, 'text/xml');

		it("Creates next id", function () {
			expect(CopyPasteUtils.createNextId("kuku")).to.equal("kuku_copy");
			expect(CopyPasteUtils.createNextId("kuku1")).to.equal("kuku1_copy");
			expect(CopyPasteUtils.createNextId("kuku_cpy")).to.equal("kuku_cpy_copy");
			expect(CopyPasteUtils.createNextId("kuku_copy3r3")).to.equal("kuku_copy3r3_copy");
			expect(CopyPasteUtils.createNextId("kuku_copy")).to.equal("kuku_copy2");
			expect(CopyPasteUtils.createNextId("kuku_copy2")).to.equal("kuku_copy3");
			expect(CopyPasteUtils.createNextId("kuku_copy356")).to.equal("kuku_copy357");
		});
		it("Find whether node has id already", function () {
			expect(CopyPasteUtils.isAlreadyUsed("detailPage", xmlDoc, _.wrap(false), [])).to.be.true;
			expect(CopyPasteUtils.isAlreadyUsed("__label2", xmlDoc, _.wrap(false), [])).to.be.true;
			expect(CopyPasteUtils.isAlreadyUsed("__does_not_exist", xmlDoc, _.wrap(false), [])).to.be.false;
			expect(CopyPasteUtils.isAlreadyUsed("", xmlDoc, _.wrap(false), [])).to.be.false;
			expect(CopyPasteUtils.isAlreadyUsed("__does_exist_in_array", xmlDoc, _.wrap(false), ["stam", "__does_exist_in_array"])).to.be.true;
			var fnGetById = function (s) {
				return s === "__does_exist_in_view";
			};
			expect(CopyPasteUtils.isAlreadyUsed("__does_exist_in_view", xmlDoc, fnGetById, ["stam"])).to.be.true;
		});
		describe("Fixes all ids in XML representation of a control so that they don't conflict with existing view", function () {
			it("Fixes simple label", function () {
				var clipBoardControl = "<Label text=\"Label 1\" id=\"__label2\"/>";
				expect(CopyPasteUtils.fixAllIds(clipBoardControl, xmlDoc, _.wrap(false))).to.equal("<Label text=\"Label 1\" id=\"__label2_copy\"/>");
			});
			it("Fixes simple label with spaces on id attribute", function () {
				var clipBoardControl = "<Label text=\"Label 1\" id  \n=\t\"__label2\"/>";
				expect(CopyPasteUtils.fixAllIds(clipBoardControl, xmlDoc, _.wrap(false))).to.equal("<Label text=\"Label 1\" id=\"__label2_copy\"/>");
			});
			it("Fixes simple form with single id", function () {
				var clipBoardControl = "<sap.ui.layout.form:SimpleForm editable=\"false\" layout=\"ResponsiveGridLayout\" id=\"newone\">\r\n" +
					"	<sap.ui.layout.form:content>\r\n" +
					"		<core:Title text=\"Title\" id=\"__title1\"/>\r\n" +
					"	</sap.ui.layout.form:content>\r\n" +
					"</sap.ui.layout.form:SimpleForm>\r\n";
				expect(CopyPasteUtils.fixAllIds(clipBoardControl, xmlDoc, _.wrap(false))).to.equal(clipBoardControl.replace("__title1", "__title1_copy"));
			});
			it("Fixes simple form with two ids conflicting each other", function () {
				var clipBoardControl = "<sap.ui.layout.form:SimpleForm editable=\"false\" layout=\"ResponsiveGridLayout\" id=\"newone\">\r\n" +
					"	<sap.ui.layout.form:content>\r\n" +
					"		<core:Title text=\"Title\" id=\"__title1\"/>\r\n" +
					"		<core:Title text=\"Title\" id=\"__title1_copy\"/>\r\n" +
					"	</sap.ui.layout.form:content>\r\n" +
					"</sap.ui.layout.form:SimpleForm>\r\n";
				expect(CopyPasteUtils.fixAllIds(clipBoardControl, xmlDoc, _.wrap(false))).to.equal(clipBoardControl
					.replace("__title1_copy", "__title1_copy2")
					.replace("__title1", "__title1_copy"));
			});
		});

		describe("Control copy paste black list", function () {
			it("doesn't support fragment", function () {

			});
			it("doesn't support view", function () {
				var view = sap.ui.view({
					viewContent: "<View xmlns=\"sap.ui.core.mvc\" ></View>",
					type: sap.ui.core.mvc.ViewType.XML
				});
				expect(CopyPasteUtils.isControlCopyUnsupported(view, window)).to.be.true;
			});
			it("doesn't support page", function () {
				jQuery.sap.require("sap.m.Page");
				var p = new sap.m.Page();
				expect(CopyPasteUtils.isControlCopyUnsupported(p, window)).to.be.true;
			});
			it("does support button", function () {
				jQuery.sap.require("sap.m.Button");
				var b = new sap.m.Button();
				expect(CopyPasteUtils.isControlCopyUnsupported(b, window)).to.be.false;
			});
		});

		describe("Control copy paste fine tuning", function () {

			it("IconTabFilter key attribute should be reset before paste", function () {
				jQuery.sap.require("sap.m.IconTabBar");
				jQuery.sap.require("sap.m.IconTabSeparator");
				jQuery.sap.require("sap.m.IconTabFilter");

				var sTabBar = "<IconTabBar id=\"iconTabBar\" \n\r " +
				"	xmlns:core=\"sap.ui.core\" xmlns:mvc=\"sap.ui.core.mvc\" xmlns=\"sap.m\"> \n\r " +
				"	<items> \n\r " +
				"		<IconTabFilter count=\"0\" id=\"iconTabFilterAll\" key=\"All\" showAll=\"true\" text=\"Order Status\"/> \n\r " +
				"		<IconTabSeparator/> \n\r " +
				"		<IconTabFilter count=\"0\" id=\"iconTabFilterProcess\" key=\"In-Process\" text=\"In-Process\"/> \n\r " +
				"		<IconTabFilter count=\"0\" id=\"iconTabFilterDelReady\" key=\"Ready-Delivery\" text=\"Ready-Delivery\"/> \n\r " +
				"	</items> \n\r " +
				"</IconTabBar>";
				var oParent = new sap.ui.xmlfragment({fragmentContent: sTabBar});
				var sXMLWithRevisedIds = "<IconTabFilter id=\"iconTabFilter2\" key=\"Ready-Delivery\" \n\r " +
					"	xmlns:core=\"sap.ui.core\" xmlns:mvc=\"sap.ui.core.mvc\" xmlns=\"sap.m\"> \n\r " +
					"<content>\n\r " +
					"	<Input width=\"100%\" id=\"_iconTabFilter2_input\"/>\n\r " +
					"</content>\n\r " +
					"</IconTabFilter>";
				var oControl = new sap.ui.xmlfragment({fragmentContent: sXMLWithRevisedIds});
				expect(oControl.getKey()).to.equal("Ready-Delivery");
				var oDesignTime = w5gTestUtils.createDesignTime({
					designTimeMetadata: sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.adapter.designTimeMetadata,
					rootElements: [],
					plugins: []
				});
				oControl = CopyPasteUtils.adjustControlBeforeAdd(oControl, oParent, "items", oDesignTime);
				expect(oControl.getKey()).to.equal("");
			});

			it("IconTabFilter key attribute should NOT be reset before paste", function () {
				jQuery.sap.require("sap.m.IconTabBar");
				jQuery.sap.require("sap.m.IconTabSeparator");
				jQuery.sap.require("sap.m.IconTabFilter");

				var sTabBar = "<IconTabBar id=\"iconTabBar1\" \n\r " +
					"	xmlns:core=\"sap.ui.core\" xmlns:mvc=\"sap.ui.core.mvc\" xmlns=\"sap.m\"> \n\r " +
					"	<items> \n\r " +
					"		<IconTabFilter count=\"0\" id=\"iconTabFilterAll1\" key=\"All\" showAll=\"true\" text=\"Order Status\"/> \n\r " +
					"		<IconTabSeparator/> \n\r " +
					"		<IconTabFilter count=\"0\" id=\"iconTabFilterProcess1\" key=\"In-Process\" text=\"In-Process\"/> \n\r " +
					"		<IconTabFilter count=\"0\" id=\"iconTabFilterDelReady1\" key=\"Ready-Delivery\" text=\"Ready-Delivery\"/> \n\r " +
					"	</items> \n\r " +
					"</IconTabBar>";
				var oParent = new sap.ui.xmlfragment({fragmentContent: sTabBar});
				var sXMLWithRevisedIds = "<IconTabFilter id=\"iconTabFilter1\" key=\"selfInfo\" \n\r " +
					"	xmlns:core=\"sap.ui.core\" xmlns:mvc=\"sap.ui.core.mvc\" xmlns=\"sap.m\"> \n\r " +
					"<content>\n\r " +
					"	<Input width=\"100%\" id=\"__iconTabFilter1_input1\"/>\n\r " +
					"</content>\n\r " +
					"</IconTabFilter>";
				var oControl = new sap.ui.xmlfragment({fragmentContent: sXMLWithRevisedIds});
				expect(oControl.getKey()).to.equal("selfInfo");
				var oDesignTime = w5gTestUtils.createDesignTime({
					designTimeMetadata: sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.adapter.designTimeMetadata,
					rootElements: [],
					plugins: []
				});

				oControl = CopyPasteUtils.adjustControlBeforeAdd(oControl, oParent, "items", oDesignTime);
				expect(oControl.getKey()).to.equal("selfInfo");
			});

	});

	});


});
