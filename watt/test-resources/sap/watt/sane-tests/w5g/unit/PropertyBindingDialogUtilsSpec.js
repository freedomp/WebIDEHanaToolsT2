define(["sap/watt/saptoolsets/fiori/editor/plugin/ui5wysiwygeditor/utils/PropertyBindingDialogHelper"], function (PropertyBindingDialogHelper) {
	"use strict";

	describe("ui5w5geditor databinding property binding dialog utils", function () {
		var oList;
		beforeEach(function () {
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData({
				fields: ["taskId", "taskDescription", "taskTitle", "processor"].map(function(sValue) {
					return {
						key: sValue,
						name: sValue
					};
				})
			});
			oList = new sap.ui.commons.ListBox({
				items: {
					path: "/fields",
					template: new sap.ui.core.ListItem({
						text: "{name}",
						key: "{key}"
					})
				},
				visibleItems: 4
			});
			oList.setModel(oModel);
		});

		afterEach(function () {
			oList.destroy();
		});

		it("test private methods: _applyFilter - existing filter string", function () {
			PropertyBindingDialogHelper._applyFilter("ask", oList, "");
			assert.equal(oList.getItems().length, 3, "list should be filtered correctly");
			assert.equal(oList.getItems()[0].getText(), "taskId", "list first item should be as expected after filtering");
			assert.equal(oList.getItems()[1].getText(), "taskDescription", "list second item should be as expected after filtering");
			assert.equal(oList.getItems()[2].getText(), "taskTitle", "list third item should be as expected after filtering");
		});

		it("test private methods: _applyFilter - existing filter string ignore case", function () {
			PropertyBindingDialogHelper._applyFilter("askdes", oList, "");
			assert.equal(oList.getItems().length, 1, "list should be filtered correctly");
			assert.equal(oList.getItems()[0].getText(), "taskDescription", "list second item should be as expected after filtering");
		});

		it("test private methods: _applyFilter - non-existing filter string", function () {
			PropertyBindingDialogHelper._applyFilter("blabla", oList, "");
			assert.equal(oList.getItems().length, 0, "list should be filtered correctly when there is no matching item");
		});

		it("test private methods: _applyFilter - empty list", function () {
			var oModel2 = new sap.ui.model.json.JSONModel();
			oModel2.setData({fields: []});
			var oList2 = new sap.ui.commons.ListBox({
				items: {
					path: "/fields",
					template: new sap.ui.core.ListItem({
						text: "{name}",
						key: "{key}"
					})
				}
			});
			oList2.setModel(oModel2);
			PropertyBindingDialogHelper._applyFilter("ask", oList2, "");
			assert.equal(oList2.getItems().length, 0, "list should be kept with no items and filtering shouldn't crash");
			oList2.destroy();
		});

		it("test private methods: _applyFilter - empty filter string (clear filter)", function () {
			PropertyBindingDialogHelper._applyFilter("ask", oList, "");
			assert.equal(oList.getItems().length, 3, "list should be filtered correctly");

			PropertyBindingDialogHelper._applyFilter("", oList, "");
			assert.equal(oList.getItems().length, 4, "list filter should be cleared when empty filter string provided");
		});

		it("test private methods: _applyFilter - expression value exist after filtering", function () {
			PropertyBindingDialogHelper._applyFilter("ask", oList, "{taskDescription}");
			assert.equal(oList.getItems().length, 3, "list should be filtered correctly");
			assert.equal(oList.getItems()[0].getText(), "taskId", "list first item should be as expected after filtering");
			assert.equal(oList.getItems()[1].getText(), "taskDescription", "list second item should be as expected after filtering");
			assert.equal(oList.getItems()[2].getText(), "taskTitle", "list third item should be as expected after filtering");
			assert.equal(oList.getSelectedItem(), null, "selected list item should be as expected after filtering");
		});

		it("test private methods: _applyFilter - expression value not exists after filtering", function () {
			PropertyBindingDialogHelper._applyFilter("ask", oList, "{processor}");
			assert.equal(oList.getItems().length, 3, "list should be filtered correctly");
			assert.equal(oList.getItems()[0].getText(), "taskId", "list first item should be as expected after filtering");
			assert.equal(oList.getItems()[1].getText(), "taskDescription", "list second item should be as expected after filtering");
			assert.equal(oList.getItems()[2].getText(), "taskTitle", "list third item should be as expected after filtering");
			assert.equal(oList.getSelectedItem(), null, "selected list item should be as expected after filtering");
		});
	});
});
