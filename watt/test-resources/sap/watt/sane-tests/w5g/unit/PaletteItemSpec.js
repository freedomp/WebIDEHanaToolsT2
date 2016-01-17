define(["w5g/w5gTestUtils",
	"sap/watt/saptoolsets/fiori/editor/plugin/ui5wysiwygeditor/control/palette/Palette"], function (w5gTestUtils) {
	"use strict";

	describe("Palette item", function () {
		sap.ui.getCore().loadLibrary("sap.m");
		it("Basic", function () {
			var oDesignTime = w5gTestUtils.getCurrentWindowPatchedDesignTime();

			var oItem = new sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.palette.PaletteItem("item").setDesignTime(oDesignTime);
			w5gTestUtils.placeAt("content", oItem);

			assert.ok(oItem, "Item instance created");
			oItem.setIcon("Icon");
			oItem.setTitle("Title");
			assert.equal(oItem.getIcon(), "Icon", "Icon text set right");
			assert.equal(oItem.getTitle(), "Title", "Title text set right");
			sap.ui.getCore().applyChanges();
			assert.equal(oItem.$().find("img").attr("src"), "Icon", "Icon text set right");
			assert.equal(oItem.$().find("label").html(), "Title", "Title text set right");
			oItem.destroy();
		});
	});
});
