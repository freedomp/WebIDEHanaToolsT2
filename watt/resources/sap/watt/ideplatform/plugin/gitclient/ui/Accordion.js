jQuery.sap.declare("sap.watt.ideplatform.plugin.gitclient.ui.Accordion");

sap.ui.commons.Accordion.extend("sap.watt.ideplatform.plugin.gitclient.ui.Accordion", {

	getSelected : function() {
		var aSections = this.getSections();

		for ( var i = 0; i < aSections.length; i++) {
			if (aSections[i].getSelected()) {
				return aSections[i];
			}
		}
		return null;
	},

	renderer : function(oRenderManager, oAccordion) {
		// convenience variable
		var rm = oRenderManager;

		// write the HTML into the render manager
		rm.write("<div");
		rm.writeControlData(oAccordion);

		if (sap.ui.getCore().getConfiguration().getAccessibility()) {
			rm.writeAttribute('role', 'tablist');
		}

		rm.addClass("sapUiAcd");
		rm.addStyle("width", oAccordion.getWidth());
		rm.writeClasses();
		rm.writeStyles();
		rm.write(">"); // SPAN element

		rm.write("<div id='" + oAccordion.getId() + "-dropTarget" + "' style='width:" + oAccordion.getWidth()
				+ "' tabIndex='-1' class='sapUiAcd-droptarget'></div>");

		var aSections = oAccordion.getSections();
		var aDefaultSections = oAccordion.getOpenedSectionsId().split(",");

		for ( var i = 0; i < aSections.length; i++) {

			// Open the section if the section is part of the default opened section
			if (oAccordion.bInitialRendering) {

				if (jQuery.inArray(aSections[i].getId(), aDefaultSections) != -1) {
					aSections[i]._setCollapsed(false);
				} else {
					aSections[i]._setCollapsed(true);
				}
			}
			oAccordion.renderSection(rm, aSections[i]);
		}

		rm.write('<SPAN id="' + oAccordion.getId() + '-Descr" style="visibility: hidden; display: none;">');
		rm.write(oAccordion.rb.getText("ACCORDION_DSC"));
		rm.write('</SPAN>');
		rm.write("</div>");

		oAccordion.bInitialRendering = false;

	},

	renderSection : function(oRenderManager, oControl) {

		var rm = oRenderManager;
		var accessibility = sap.ui.getCore().getConfiguration().getAccessibility();

		var heightSet = sap.ui.commons.AccordionSection._isSizeSet(oControl.getMaxHeight());
		var widthSet = sap.ui.commons.AccordionSection._isSizeSet(oControl.getParent().getWidth());

		// root element and classes
		rm.write("<div");
		rm.writeElementData(oControl);
		rm.addClass("sapUiAcdSection");

		if (oControl.getParent().isLastSection(oControl)) {
			rm.addClass("sapUiAcdSectionLast");
		}

		rm.addStyle("width", oControl.getParent().getWidth());
		if (!oControl.getCollapsed()) {
			rm.addStyle("height", oControl.getMaxHeight());
		} else {
			rm.addClass("sapUiAcdSectionColl");
		}

		rm.addClass("sapUiAcdSectionArea");

		if (!heightSet) {
			rm.addClass("sapUiAcdSectionFlexHeight");
		}
		if (!oControl.getEnabled()) {
			rm.addClass("sapUiAcdSectionDis");
		}

		rm.writeClasses();
		rm.writeStyles();

		// header
		rm.write("><div class='sapUiAcdSectionHdr'");
		if (oControl.getEnabled()) {
			rm.write(" tabindex='0'");
		}
		rm.writeAttribute("id", oControl.getId() + "-hdr");
		if (accessibility) {
			rm.writeAttribute('role', 'tab');
			rm.writeAttribute("aria-labelledby", oControl.getId() + "-lbl");
			rm.writeAttribute("aria-describedby", oControl.getParent().getId() + "-Descr");
			if (oControl.getEnabled()) {
				if (oControl.getCollapsed()) {
					rm.writeAttribute("aria-expanded", "false");
				} else {
					rm.writeAttribute("aria-expanded", "true");
				}
			}
		}
		rm.write(">");

		rm.write("<div ");
		rm.writeAttribute("id", oControl.getId() + "-trgt");
		rm.write(">");

		rm.write("<span id='" + oControl.getId() + "-hdrL'>");

		if (oControl.getEnabled()) {
			rm.write("<a id='" + oControl.getId()
					+ "-minL' class='sapUiAcdSectionMinArrow' href='javascript:void(0)' title='Collapse/Expand'");
		} else {
			rm.write("<a id='" + oControl.getId()
					+ "-minL' class='sapUiAcdSectionMinArrow sapUiAcdCursorText' href='javascript:void(0)' title='Collapse/Expand'");
		}

		rm.write(" tabindex='-1' ");

		if (accessibility) {

			rm.writeAttribute("aria-labelledby", oControl.getId() + "-lbl");

			//Is the section opened --> selected in this case
			if (oControl.getCollapsed()) {
				rm.writeAttribute("aria-selected", "false");
			} else {
				rm.writeAttribute("aria-selected", "true");
			}
			//Disabled --> Unavailable annoucement
			if (oControl.getEnabled()) {
				rm.writeAttribute("aria-disabled", "false");
				if (!sap.ui.Device.browser.internet_explorer) {
					rm.writeAttribute("aria-grabbed", "false");
				}
			} else {
				rm.writeAttribute("aria-disabled", "true");
				if (!sap.ui.Device.browser.internet_explorer) {
					rm.writeAttribute("aria-grabbed", "");
				}
			}
		}
		rm.write("></a>");

		// label
		rm.write("<span tabindex='-1' id='" + oControl.getId() + "-lbl' class='sapUiAcdSectionLabel'");

		if (oControl.getCollapsed()) {
			rm.writeAttribute("aria-selected", "false");
			rm.addStyle("font-weight", "normal");
			rm.writeStyles();
		} else {
			rm.writeAttribute("aria-selected", "true");
			rm.addStyle("font-weight", "bold");
			rm.writeStyles();
		}

		if (accessibility) {

			rm.writeAttribute("role", "heading");
			rm.writeAttribute("aria-labelledby", oControl.getId() + "-lbl");
			rm.writeAttribute("tabindex", "0");

			if (oControl.getEnabled()) {
				rm.writeAttribute("aria-disabled", "false");
			} else {
				rm.writeAttribute("aria-disabled", "true");
			}
		}

		rm.write(">");

		rm.renderControl(oControl.getAggregation("_radioButton"));
		rm.writeEscaped(oControl.getTitle());
		rm.write("</span>");
		rm.write("</span>");
		rm.write("</div></div>");

		// everything below the header is only rendered initially if not collapsed - saves performance and Panel just re-renders later on expand
		if (!oControl.getCollapsed()) {

			// Content area
			rm.write("<div class='sapUiAcdSectionCont' tabindex='-1' id='" + oControl.getId() + "-cont'");
			if (heightSet && widthSet) {
				rm.write(" style='position:absolute;'");
			} else {
				rm.write(" style='position:relative;top:0px;'"); // for IE7, when Panel contains relatively positioned elements
			}

			if (sap.ui.getCore().getConfiguration().getAccessibility()) {
				rm.writeAttribute('role', 'tabpanel');
			}

			rm.write(">");

			// Content (child controls)
			var oControls = oControl.getContent(), iLength = oControls.length;
			for ( var i = 0; i < iLength; i++) {
				rm.renderControl(oControls[i]);
			}
			rm.write("</div>");
		}
		// End of Panel
		rm.write("</div>");
	},

	onAfterRendering : function() {
		// Collect the dom references of the items
		var accordion = this.getDomRef();
		var leftBorder = "0px";
		var rightBorder = "0px";
		//neccessary to make sure IE8 does not deliver medium if no border width is set
		if (jQuery(accordion).css("borderLeftStyle") !== "none") {
			leftBorder = jQuery(accordion).css("border-left-width");
		}
		if (jQuery(accordion).css("borderRightStyle") !== "none") {
			rightBorder = jQuery(accordion).css("border-right-width");
		}
		var borderTotal = parseFloat(leftBorder.substring(0, leftBorder.indexOf("px")))
				+ parseFloat(rightBorder.substring(0, rightBorder.indexOf("px")));
		accordion.style.height = accordion.offsetHeight - borderTotal - 7 + "px";

		// disable drag & drop
		/*
		this.$().sortable({
			handle: "> div > div",
			stop: jQuery.proxy(this._onSortChange, this)
		});
		*/
	}
});