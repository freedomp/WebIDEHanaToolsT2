sap.ui.define(['jquery.sap.global', 'sap/ui/commons/ListBoxRenderer', 'sap/ui/core/Renderer'],
	function(jQuery, ListBox, Renderer) {
		"use strict";

		/**
		 * Renderer for the sap.ui.commons.ComboBox
		 * @namespace
		 */
		var MultiSelectListBoxRenderer = Renderer.extend(ListBox);

		/**
		 * Renders the outer &lt;div&gt; for the ComboBox to the TextField
		 *
		 * @param {sap.ui.fw.RenderManager} oRenderManager the RenderManager that can be used for writing to the Render-Output-Buffer
		 * @param {sap.ui.fw.Control} oControl an object representation of the control that should be rendered
		 */

		MultiSelectListBoxRenderer.renderItemList = function(oListBox, rm) {

			// Write the start tag
			rm.write("<ul id='" + oListBox.getId() + "-list'");

			rm.writeAttribute("tabindex", this.getTabIndex(oListBox));

			// add ARIA stuff
			rm.writeAccessibilityState(oListBox, {
				role: "listbox",
				multiselectable: oListBox.getAllowMultiSelect()
			});
			rm.write(">");

			var items = oListBox.getItems(),
				checkBoxes = oListBox.getAggregation("_checkBoxes"),
				iRealItemIndex = 0, // to not count separators
				iRealItemCount = 0;

			for (var i = 0; i < items.length; i++) { // TODO: required only for ARIA setsize
				if (!(items[i] instanceof sap.ui.core.SeparatorItem)) {
					iRealItemCount++;
				}
			}

			var bDisplaySecondaryValues = oListBox.getDisplaySecondaryValues();

			// Write the rows with the items
			for (var i = 0; i < items.length; i++) {
				var item = items[i];

				if (item instanceof sap.ui.core.SeparatorItem) {
					// draw a separator
					rm.write("<div id='", item.getId(), "' class='sapUiLbxSep' role='separator'><hr/>");

					// colspan is not available, so add more separator cells
					if (oListBox.getDisplayIcons()) {
						rm.write("<hr/>");
					}
					if (bDisplaySecondaryValues) {
						rm.write("<hr/>");
					}
					rm.write("</div>");

				} else {
					// regular ListItem or just a plain Item
					rm.write("<li");
					rm.writeElementData(item);
					rm.writeAttribute("data-sap-ui-lbx-index", i);

					rm.addClass("sapUiLbxI");
					if (!item.getEnabled()) {
						rm.addClass("sapUiLbxIDis");
					}
					rm.writeAttribute("tabindex", "-1"); // make all LIs to focusable elements, tabindex will be changed by ItemNavigation
					if (oListBox.isIndexSelected(i)) {
						rm.addClass("sapUiLbxISel");
					}
					rm.writeClasses();

					// get the text values
					var sText = item.getText();
					var sSecondaryValue = item.getAdditionalText ? item.getAdditionalText() : ""; // allow usage of sap.ui.core.Item

					// tooltip
					if (item.getTooltip_AsString()) {
						rm.writeAttributeEscaped("title", item.getTooltip_AsString());
					} else {
						rm.writeAttributeEscaped("title", sText + ((bDisplaySecondaryValues && sSecondaryValue) ? "  --  " + sSecondaryValue : ""));
					}

					// ARIA
					rm.writeAccessibilityState(item, {
						role: "option",
						selected: (i === oListBox.getSelectedIndex()),
						setsize: iRealItemCount,
						posinset: iRealItemIndex + 1
					});

					rm.write(">");
					if (checkBoxes[i].getVisible()) {
						rm.write("<span");
						rm.writeAttribute("id", checkBoxes[i].getId() + "-chk");
						rm.write(">");
						rm.renderControl(checkBoxes[i]);
						rm.write("</span>");
					}

					// write icon column if required
					if (oListBox.getDisplayIcons()) {
						var sIcon;
						if (item.getIcon) { // allow usage of sap.ui.core.Item
							sIcon = item.getIcon();
						}
						rm.write("<span");
						if (sap.ui.core.IconPool.isIconURI(sIcon)) {
							rm.addClass("sapUiLbxIIco");
							rm.addClass("sapUiLbxIIcoFont");
							var oIconInfo = sap.ui.core.IconPool.getIconInfo(sIcon);
							rm.addStyle("font-family", "'" + oIconInfo.fontFamily + "'");
							if (oIconInfo && !oIconInfo.skipMirroring) {
								rm.addClass("sapUiIconMirrorInRTL");
							}
							rm.writeClasses();
							rm.writeStyles();
							rm.write(">");
							rm.write(oIconInfo.content);
						} else {
							rm.write(" class='sapUiLbxIIco'><img src='");
							// if the item has an icon, use it; otherwise use something empty
							if (sIcon) {
								rm.writeEscaped(sIcon);
							} else {
								rm.write(sap.ui.resource('sap.ui.commons', 'img/1x1.gif'));
							}
							rm.write("'/>");
						}
						rm.write("</span>");
					}

					// write the main text
					rm.write("<span class='sapUiLbxITxt");
					rm.write("'");
					rm.writeAttribute("id", item.getId() + "-txt");
					var sTextAlign = MultiSelectListBoxRenderer.getTextAlign(oListBox.getValueTextAlign(), null);
					if (sTextAlign) {
						rm.write("style='text-align:" + sTextAlign + "'"); // TODO: check whether the ListBox needs its own textDirection property
					}
					rm.write(">");
					if (sText === "" || sText === null) {
						rm.write("&nbsp;");
					} else {
						rm.writeEscaped(sText);
					}

					// Potentially display second column
					if (bDisplaySecondaryValues) {
						rm.write("</span><span class='sapUiLbxISec");
						rm.write("'");
						sTextAlign = MultiSelectListBoxRenderer.getTextAlign(oListBox.getSecondaryValueTextAlign(), null);
						if (sTextAlign) {
							rm.write("style='text-align:" + sTextAlign + "'"); // TODO: check whether the ListBox needs its own textDirection property
						}
						rm.write(">");
						rm.writeEscaped(sSecondaryValue);
					}

					rm.write("</span></li>");
					iRealItemIndex++;
				}
			}

			// Close the surrounding element
			rm.write("</ul>");
		};

		MultiSelectListBoxRenderer.handleSelectionChanged = function(oListBox) {
			if (oListBox.getDomRef()) {
				var items = oListBox.getItems();
				for (var i = 0, l = items.length; i < l; i++) {
					if (oListBox.isIndexSelected(i)) {
						items[i].$().addClass("sapUiLbxISel").attr("aria-selected", "true");
					} else {
						items[i].$().removeClass("sapUiLbxISel").attr("aria-selected", "false");
					}
				}
			}
		};
		return MultiSelectListBoxRenderer;

	}, /* bExport= */ true);