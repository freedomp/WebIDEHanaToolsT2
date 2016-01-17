/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2013 SAP SE. All rights reserved
 */

// Provides default renderer for control sap.watt.platform.plugin.filesearch.view.SearchResultTreeRenderer
jQuery.sap.declare("sap.watt.platform.plugin.filesearch.view.SearchResultTreeRenderer");

/**
 * @class Tree renderer.
 * @static
 */
sap.watt.platform.plugin.filesearch.view.SearchResultTreeRenderer = {};

/**
 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
 *
 * @param {sap.ui.core.RenderManager} oRenderManager the RenderManager that can be used for writing to the Render-Output-Buffer
 * @param {sap.ui.core.Control} oTree an object representation of the control that should be rendered
 */
sap.watt.platform.plugin.filesearch.view.SearchResultTreeRenderer.render = function(oRenderManager, oTree) {
	// convenience variable
	var rm = oRenderManager;
	var sTerm = oTree.getProperty("term");
	//First node get is focusable.
	sap.watt.platform.plugin.filesearch.view.SearchResultTreeRenderer.bFirstNodeRendered = false;

	rm.write("<div");
	rm.writeControlData(oTree);
	rm.addClass("sapUiTree searchResultTree");

	if (oTree.getHeight() != "" && oTree.getHeight() != "auto") {
		rm.addClass("sapUiTreeFixedHeight");
	}
	if (!oTree.getShowHeader()) {
		rm.addClass("sapUiTreeTransparent");
	}
	rm.writeClasses();

	rm.addStyle("width", oTree.getWidth() || "auto");
	rm.addStyle("height", oTree.getHeight());
	rm.addStyle("min-width", oTree.getMinWidth());

	rm.writeStyles();

	//ARIA
	rm.writeAttribute('role', 'tree');
	rm.write(">");

	if (oTree.getShowHeader()) {

		rm.write("<div id=\"" + oTree.getId() + "-Header\" class=\"sapUiTreeHeader\""); //Header
		rm.writeAttribute('role', 'heading');
		rm.write(">");

		//Title
		rm.write("<div class='sapUiTreeTitle'");

		if (oTree.getTooltip_AsString()) {
			rm.writeAttributeEscaped("title", oTree.getTooltip_AsString());//Tree tooltip
		}
		rm.write(">");
		rm.writeEscaped(oTree.getTitle());
		rm.write("</div>");

		if (oTree.getShowHeaderIcons()) {
			rm.write("<div id='" + oTree.getId() + "-TBCont' class='sapUiTreeTbCont'"); //ToolbarContainer
			rm.writeAttribute('role', 'toolbar');
			rm.write(">");
			rm.renderControl(oTree.oCollapseAllButton);
			rm.renderControl(oTree.oExpandAllButton);

			rm.write("</div>");
		}

		rm.write("</div>");//End of Header
	}

	rm.write("<div id=\"" + oTree.getId() + "-TreeCont\""); //tree container

	rm.addClass("sapUiTreeCont");
	rm.addClass("wattSearchResultTree");
	var showScroll = oTree.getShowHorizontalScrollbar();
	if (showScroll) {
		rm.addClass("sapUiTreeContScroll");
	} else {
		rm.addClass("sapUiTreeContNoScroll");
	}
	rm.writeClasses();

	rm.write(">");

	// write the HTML into the render manager
	rm.write("<ul class=\"sapUiTreeList\">");

	var aNodes = oTree.getNodes();
	for (var i = 0; i < aNodes.length; i++) {
		sap.watt.platform.plugin.filesearch.view.SearchResultTreeRenderer.renderNode(rm, aNodes[i], 1, aNodes.length, i + 1, sTerm);
	}

	rm.write("</ul>");
	rm.write("</div>");//Tree Container
	rm.write("</div>");//Tree
};

/**
 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
 *
 * @param {sap.ui.core.RenderManager} oRenderManager the RenderManager that can be used for writing to the Render-Output-Buffer
 * @param {sap.ui.core.Control} oNode an object representation of the control that should be rendered
 * @param {int} iLevel the hierarchical level value of the node
 */
sap.watt.platform.plugin.filesearch.view.SearchResultTreeRenderer.renderNode = function(oRenderManager, oNode, iLevel, iSize, iPos,
		sTerm) {

	// convenience variable
	var rm = oRenderManager;
	var bExpanded;

	// write the HTML into the render manager
	rm.write("<li");
	rm.writeElementData(oNode);
	rm.addClass("sapUiTreeNode");
	if(iLevel == 1) {
		rm.addClass("firstLevel");
	}
	if (oNode.getExpanded() && (oNode.getHasExpander() || oNode.hasChildren())) {
		rm.addClass("sapUiTreeNodeExpanded");
		bExpanded = true;
	} else if (!oNode.getExpanded() && (oNode.getHasExpander() || oNode.hasChildren())) {

		rm.addClass("sapUiTreeNodeCollapsed");
		bExpanded = false;
	}

	if (oNode.getSelectable() && oNode.getIsSelected()) {
		rm.addClass("sapUiTreeNodeSelected");
		rm.writeAttribute('aria-selected', 'true');
	}

	if (!bExpanded && oNode.hasSelectedHiddenChild()) {
		rm.addClass("sapUiTreeNodeSelectedParent");
		rm.writeAttribute('aria-selected', 'true');
	}

	rm.writeClasses();

	//ARIA
	rm.writeAttribute('role', 'treeitem');
	rm.writeAttribute('aria-level', iLevel);
	rm.writeAttribute('aria-setsize', iSize);
	rm.writeAttribute('aria-posinset', iPos);

	if (bExpanded) {
		rm.writeAttribute("aria-expanded", "true");
	} else {
		// don't write aria expanded attribute if a node has no children
		// if a node has an expander we assume that it also has children
		if (oNode.getHasExpander()) {
			rm.writeAttribute("aria-expanded", "false");
		}
	}

	//Tooltip
	rm.writeAttributeEscaped("title", oNode.getTooltip());

	if (!sap.watt.platform.plugin.filesearch.view.SearchResultTreeRenderer.bFirstNodeRendered) {
		rm.write("tabindex='0'");
		sap.watt.platform.plugin.filesearch.view.SearchResultTreeRenderer.bFirstNodeRendered = true;
	}
	rm.write(">");

	rm.write("<span"); //Node Content

	rm.addClass("sapUiTreeNodeContent");
	if (!oNode.getSelectable()) {
		rm.addClass("sapUiTreeNodeNotSelectable");
	}
	rm.writeClasses();

	rm.write(">"); //Node Content

	if (oNode.getIcon()) {
		rm.write("<img class='sapUiTreeIcon'");
		rm.writeAttributeEscaped("src", oNode.getIcon());
		rm.write("/>");
	}

	//rm.writeEscaped( oNode.getText());
	this.renderNodeText(rm, oNode, sTerm);

	rm.write("</span>"); //Node Content

	rm.write("</li>");

	if (oNode.getNodes()) {
		var aSubNodes = oNode.getNodes();
		rm.write("<ul");

		rm.writeAttribute("id", oNode.getId() + "-children");

		rm.addClass("sapUiTreeChildrenNodes");
		if (!bExpanded) {
			rm.addClass("sapUiTreeHiddenChildrenNodes");
		} else {
			rm.writeAttribute("style", "display: block;");//For animation sake
		}
		rm.writeClasses();

		rm.write(">");
		iLevel++;
		for (var i = 0; i < aSubNodes.length; i++) {
			sap.watt.platform.plugin.filesearch.view.SearchResultTreeRenderer.renderNode(rm, aSubNodes[i], iLevel, aSubNodes.length,
					i + 1, sTerm);
		}
		rm.write("</ul>");
	}
};
/**
 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
 *
 * @param {sap.ui.core.RenderManager} oRenderManager the RenderManager that can be used for writing to the Render-Output-Buffer
 * @param {sap.ui.core.Control} oNode an object representation of the control that should be rendered
 * @param {string} sTerm the term being searched for
 */
sap.watt.platform.plugin.filesearch.view.SearchResultTreeRenderer.renderNodeText = function(oRenderManager, oNode, sTerm) {
	var sText = oNode.getText();
	// convenience variable
	var rm = oRenderManager;
	if (oNode.hasChildren() || sTerm == null || sTerm.length == 0) {
		rm.writeEscaped(sText);
		// number of matches
		var nMatches = oNode.getMatches();
		if(nMatches>=0) {
			rm.write("<span class=\"tag\">");
			rm.write(nMatches);
			rm.write("</span>");
		}
		return;
	}
	// line number
	var sLineNo = oNode.getLineNo();
	if (typeof(sLineNo)=="string" && sLineNo.trim()!="") {
		rm.write("<span class=\"wattSRLineNo\">");
		rm.write(sLineNo);
		rm.write("</span>");
	}
	// content text
	var range = oNode.getOccurrenceRange();
	if(range) {
		if(oNode._start === undefined) {
			oNode._start = range.start.column;
			oNode._end = range.end.column;
		}
		rm.writeEscaped(sText.substring(0, oNode._start));
		rm.write("<span class=\"wattSRTerm\">");
		rm.writeEscaped(sText.substring(oNode._start, oNode._end));
		rm.write("</span>");
		rm.writeEscaped(sText.substring(oNode._end));
	} else {
		rm.writeEscaped(sText);
	}
	// item button
	var sTooltip = oNode.getButtonTooltip();
	rm.write("<span class=\"itemButton\"");
	if(sTooltip != null) {
		rm.write(" title=\""+ sTooltip +"\"");
	}
	rm.write("></span>");
};