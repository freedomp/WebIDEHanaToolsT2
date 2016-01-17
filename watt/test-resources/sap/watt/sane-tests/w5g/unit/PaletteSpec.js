define(["w5g/w5gTestUtils",
		"sap/watt/saptoolsets/fiori/editor/plugin/ui5wysiwygeditor/utils/W5gUi5LibraryMediator",
		"sap/watt/saptoolsets/fiori/editor/plugin/ui5wysiwygeditor/control/palette/Palette"],
	function (w5gTestUtils, W5gUi5LibraryMediator) {
		"use strict";
		describe("Palette Model", function () {
			function _setPaletteFilter(oPalette, sFilter) {
				oPalette.getModel().applyFilter(sFilter);
			}

			/**
			 * Gets palette section from given index <code>iIndex</code> if any
			 *
			 * @param {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.palette.Palette} oPalette palette
			 * @param {number}  iIndex section index
			 * @return {sap.ui.commons.Panel} returns section from given index <code>iIndex</code>
			 *
			 * @private
			 * @function
			 */
			function _getSectionAt(oPalette, iIndex) {
				var aPanels = oPalette.getAggregation("sections") || [];
				return aPanels.length > iIndex && aPanels[iIndex];
			}

			/**
			 * Gets children of palette section from given index <code>iIndex</code> if any
			 *
			 * @param {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.palette.Palette} oPalette palette
			 * @param {number}  iIndex section index
			 * @return {sap.ui.commons.Panel} returns children of palette section from given index <code>iIndex</code>
			 *
			 * @private
			 * @function
			 */
			function _getSectionChildren(oPalette, iIndex) {
				var oPanel = _getSectionAt(oPalette, iIndex);
				return oPanel && oPanel.getContent() || [];
			}

			/**
			 * Check whether a section with given index <code>iSectionIndex</code> is collapsed
			 *
			 * @param {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.palette.Palette} oPalette
			 * @param {number} iSectionIndex section index
			 *
			 * @return {boolean} returns whether a section with given index is collapsed
			 *
			 * @public
			 * @function
			 */
			function _isSectionCollapsed(oPalette, iSectionIndex) {
				var oPanel = _getSectionAt(oPalette, iSectionIndex);
				return !!(oPanel && oPanel.getCollapsed());
			}

			/**
			 * Check whether a section with given index <code>iSectionIndex</code> is visible
			 *
			 * @param {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.palette.Palette} oPalette
			 * @param {number} iSectionIndex section index
			 *
			 * @return {boolean} returns whether a section with given index is visible
			 *
			 * @public
			 * @function
			 */
			function _isSectionVisible(oPalette, iSectionIndex) {
				var oPanel = _getSectionAt(oPalette, iSectionIndex);
				return !!(oPanel && oPanel.getVisible());
			}


			/**
			 * Collapse/expand a section with given index <code>iSectionIndex</code>
			 *
			 * @param {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.palette.Palette} oPalette
			 * @param {number} iSectionIndex section index
			 * @param {boolean} bCollapsed
			 *
			 * @public
			 * @function
			 */
			function _collapseSection(oPalette, iSectionIndex, bCollapsed) {
				var oPanel = _getSectionAt(oPalette, iSectionIndex);
				if (oPanel) {
					oPanel.setCollapsed(bCollapsed);
				}
			}

			/**
			 * Gets number of visible children of the section with given index <code>iSectionIndex</code>
			 *
			 * @param {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.palette.Palette} oPalette
			 * @param {number} iSectionIndex section index
			 *
			 * @return {Array<string>} returns the array of visible children titles of the section with given index
			 *
			 * @public
			 * @function
			 */
			function _getSectionVisibleChildrenTitles(oPalette, iSectionIndex) {
				var aChildren = _getSectionChildren(oPalette, iSectionIndex),
					aTitles = [];
				aChildren.forEach(function (oControl) {
					if (oControl.getVisible()) {
						aTitles.push(oControl.getTitle());
					}
				});
				return aTitles;
			}

			var oDesignTime, oControls, mCategories;

			before(function () {
				// We need to manually patch the sap.ui.core.Element
				oDesignTime = w5gTestUtils.getCurrentWindowPatchedDesignTime();
				sap.ui.getCore().setModel(new sap.ui.model.resource.ResourceModel({
					bundleName: "i18n.i18n",
					locale: sap.ui.getCore().getConfiguration().getLanguage()
				}), "i18n");
			});

			beforeEach(function () {
				oControls = [
					{
						title: "Button", name: "sap.m.Button",
						icon: "/resources/sap/watt/saptoolsets/fiori/editor/plugin/ui5wysiwygeditor/control/wysiwyg/libs/sap.m/sap.m.Button.png",
						description: "description here", category: "Action"
					},
					{
						title: "Image", visible: false, name: "sap.m.Image",
						icon: "/resources/sap/watt/saptoolsets/fiori/editor/plugin/ui5wysiwygeditor/control/wysiwyg/libs/sap.m/sap.m.Image.png",
						description: "description here", category: "Display"
					},
					{
						title: "Action List Item", name: "sap.m.ActionListItem",
						icon: "/resources/sap/watt/saptoolsets/fiori/editor/plugin/ui5wysiwygeditor/control/wysiwyg/libs/sap.m/sap.m.ActionListItem.png",
						description: "description here", category: "List Items"
					},
					{
						title: "Custom List Item", name: "sap.m.CustomListItem",
						icon: "/resources/sap/watt/saptoolsets/fiori/editor/plugin/ui5wysiwygeditor/control/wysiwyg/libs/sap.m/sap.m.CustomListItem.png",
						description: "description here", category: "List Items"
					},
					{
						title: "Calendar", name: "sap.me.Calendar",
						icon: "/resources/sap/watt/saptoolsets/fiori/editor/plugin/ui5wysiwygeditor/control/wysiwyg/libs/sap.m/sap.me.Calendar.png",
						description: "Description here", category: "Display"
					}
				];
				mCategories = {
					"Action": ["sap.m.Button"],
					"Display": ["sap.m.Image", "sap.me.Calendar"],
					"List Items": ["sap.m.ActionListItem", "sap.m.CustomListItem"]
				};
			});

			it("Palette Model Test", function () {
				var oModel = new sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.models.W5gPaletteModel();
				oModel.setControls(oControls);

				// check if Categories were built according to categories of oControls given to the PaletteModel
				var oData = oModel.getData();

				assert.equal(jQuery.grep(oData.data, function (e) {
					return e.name === "Action";
				}).length, 1, "Palette category found: \"Action\"");
				assert.equal(jQuery.grep(oData.data, function (e) {
					return e.name === "List Items";
				}).length, 1, "Palette category found: \"List Items\"");
				assert.equal(jQuery.grep(oData.data, function (e) {
					return e.name === "Display";
				}).length, 1, "Palette Category found: \"Display\"");

				// check if Image control was added to both categories Action and Display

				for (var i = 0; i < oData.data.length; i++) {
					var oCategory = oData.data[i];
					assert.equal(mCategories[oCategory.name].length, oCategory.controls.length, "Category '" + oCategory.name +
						"' has wrong controls number");
					for (var j = 0; j < oCategory.controls.length; j++) {
						assert.notEqual(mCategories[oCategory.name].indexOf(oCategory.controls[j].name), -1,
							"Category '" + oCategory.name + "' has wrong control: " + oCategory.controls[j].name);
					}
				}

				oModel.destroy();
			});

			// Simple instantiation and rendering test

			it("Control instantiation", function () {
				var oPalette = new sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.palette.Palette();
				oPalette.setDesignTime(oDesignTime);
				oPalette._setPaletteModel(oControls);
				assert.ok(oPalette, "instantiated");

				w5gTestUtils.placeAt("palette", oPalette);
				sap.ui.getCore().applyChanges();
				assert.ok(true, "rendered");
				oPalette.destroy();
			});

			it("Filter", function () {
				var oPalette = new sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.palette.Palette();
				oPalette.setDesignTime(oDesignTime);
				oPalette._setPaletteModel(oControls);
				assert.ok(oPalette, "instantiated");

				w5gTestUtils.placeAt("palette", oPalette);
				sap.ui.getCore().applyChanges();
				_setPaletteFilter(oPalette, "Calendar");
				sap.ui.getCore().applyChanges();

				assert.ok(!_isSectionCollapsed(oPalette, 1), "Panel 2 is not collapsed");
				assert.ok(_getSectionVisibleChildrenTitles(oPalette, 1).length === 1, "Only one Control is visible");
				assert.ok(_getSectionVisibleChildrenTitles(oPalette, 1).indexOf("Calendar") !== -1, "The visible control is Calendar");
				_setPaletteFilter(oPalette, "");
				sap.ui.getCore().applyChanges();
				assert.ok(_isSectionVisible(oPalette, 0), "Panel 1 is shown");
				assert.ok(_isSectionVisible(oPalette, 1), "Panel 2 is shown");
				assert.ok(_isSectionVisible(oPalette, 2), "Panel 3 is shown");
				assert.ok(!_isSectionCollapsed(oPalette, 0) && _isSectionCollapsed(oPalette, 1) && _isSectionCollapsed(oPalette, 2), "Panel 1 is expanded, 2 and 3 are collapsed");

				// expand category 1
				_collapseSection(oPalette, 0, false);
				assert.ok(!_isSectionCollapsed(oPalette, 0) && _isSectionCollapsed(oPalette, 1) && _isSectionCollapsed(oPalette, 2), "Panel 1, 2 and 3 are collapsed");

				// search in expanded palette
				_setPaletteFilter(oPalette, "Bu");
				assert.ok(_getSectionVisibleChildrenTitles(oPalette, 0).length === 1
					&& _getSectionVisibleChildrenTitles(oPalette, 1).length === 0
					&& _getSectionVisibleChildrenTitles(oPalette, 2).length === 0, "Panel 1 has one entry, 2 and 3 are empty");

				// remove filter
				_setPaletteFilter(oPalette, "");
				assert.ok(!_isSectionCollapsed(oPalette, 0) && _isSectionCollapsed(oPalette, 1) && _isSectionCollapsed(oPalette, 2), "Panel 1 is expanded, 2 and 3 are collapsed");

				// search in collapsed palette
				_setPaletteFilter(oPalette, "Bu");
				assert.ok(_getSectionVisibleChildrenTitles(oPalette, 0).length === 1
					&& _getSectionVisibleChildrenTitles(oPalette, 1).length === 0
					&& _getSectionVisibleChildrenTitles(oPalette, 2).length === 0, "Panel 1 has one entry, 2 and 3 are empty");

				// remove filter
				_setPaletteFilter(oPalette, "");
				assert.ok(!_isSectionCollapsed(oPalette, 0) && _isSectionCollapsed(oPalette, 1) && _isSectionCollapsed(oPalette, 2), "Panel 1 is expanded, 2 and 3 are collapsed");


				// Filter with results in multiple categories
				_setPaletteFilter(oPalette, "Im");
				assert.ok(_getSectionVisibleChildrenTitles(oPalette, 0).length === 0
					&& _getSectionVisibleChildrenTitles(oPalette, 1).length === 1
					&& _getSectionVisibleChildrenTitles(oPalette, 2).length === 0, "Panel 1 and 2 has one entry, 3 is empty");
				oPalette.destroy();
			});

			it("sap.m.SegmentedButton in Palette", function () {
				var oPalette = new sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.palette.Palette();
				oPalette.setDesignTime(oDesignTime);

				//load real palette items
				jQuery.sap.require("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.adapter");
				oDesignTime.setDesignTimeMetadata(sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.adapter.designTimeMetadata);
				W5gUi5LibraryMediator.isControlSupported = function () { //just for the test
					return true;
				};
				oPalette._setPaletteModel(W5gUi5LibraryMediator.getSupportedControls(oDesignTime));

				w5gTestUtils.placeAt("palette", oPalette);
				sap.ui.getCore().applyChanges();
				_setPaletteFilter(oPalette, "Segmented");
				sap.ui.getCore().applyChanges();

				assert.ok(!_isSectionCollapsed(oPalette, 6), "Panel 1 is not collapsed");
				assert.ok(_getSectionVisibleChildrenTitles(oPalette, 6).length === 1, "Only one palette item is visible");
				assert.ok(_getSectionVisibleChildrenTitles(oPalette, 6).indexOf("Segmented Button") !== -1, "The visible control is Page");

				oPalette.destroy();
			});
		});
	});
