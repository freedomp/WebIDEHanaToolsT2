/* Adapted copy of UI5 TreeRenderer
 */

// Provides default renderer for control sap.ui.commons.TreeRenderer
(function() {
	"use strict";
	jQuery.sap.declare("sap.watt.platform.plugin.repositorybrowser.view.BrowserTreeRenderer");

	/**
	 * @class Tree renderer.
	 * @static
	 */
	sap.watt.platform.plugin.repositorybrowser.view.BrowserTreeRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRenderManager the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oTree an object representation of the control that should be rendered
	 */
	sap.watt.platform.plugin.repositorybrowser.view.BrowserTreeRenderer.render = function(oRenderManager, oTree) {
		// convenience variable
		var rm = oRenderManager;

		//First node get is focusable.
		sap.watt.platform.plugin.repositorybrowser.view.BrowserTreeRenderer.bFirstNodeRendered = false;

		rm.write("<div");
		rm.writeControlData(oTree);
		rm.addClass("sapUiTree");

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
		for ( var i = 0; i < aNodes.length; i++) {
			sap.watt.platform.plugin.repositorybrowser.view.BrowserTreeRenderer.renderNode(rm, aNodes[i], 1, aNodes.length, i + 1);
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
	sap.watt.platform.plugin.repositorybrowser.view.BrowserTreeRenderer.renderNode = function(oRenderManager, oNode, iLevel, iSize, iPos) {
		// convenience variable
		var rm = oRenderManager;
		var bExpanded;

		// write the HTML into the render manager
		rm.write("<li");
		rm.writeElementData(oNode);
		rm.addClass("sapUiTreeNode");
		
//============================== Decoration ======================================================		
		if (oNode._aStyleClasses){
			for (var i = 0; i < oNode._aStyleClasses.length; i++){
				rm.addClass(oNode._aStyleClasses[i]);
			}
		}
//================================================================================================		

		// Set icon decorator according to project type
		if(oNode._decoratorIconStyleClass) {
			rm.addClass(oNode._decoratorIconStyleClass);
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

		rm.writeClasses(oNode);

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
		rm.writeAttributeEscaped("title", oNode.getTooltip_AsString());

		if (!sap.watt.platform.plugin.repositorybrowser.view.BrowserTreeRenderer.bFirstNodeRendered) {
			rm.write("tabindex='0'");
			sap.watt.platform.plugin.repositorybrowser.view.BrowserTreeRenderer.bFirstNodeRendered = true;
		}

		//Begin: WATT-specific adaptation / add padding for indentation explicitly
		rm.writeAttribute('style', 'padding-left:' + (iLevel - 1) + 'em');
		//End: WATT-specific adaptation / add padding for indentation explicitly		

		rm.write(">");

//================================================================================================================
		// Icon Decorations:
		
		if (oNode._decoratorIconBottomLeft){
			rm.write("<span");
			rm.addClass("sapUiTreeNodeDecoratorSpan");
			rm.writeClasses();
			rm.write(">");
			rm.write("<img");
			rm.addClass("sapUiTreeNodeDecoratorBottomLeftOnly");
			rm.writeClasses();
			rm.writeAttributeEscaped("src", oNode._decoratorIconBottomLeft);
			rm.write(">");
			rm.write("</span>");
		}	
		if (oNode._decoratorIconBottomRight){
			rm.write("<span");
			rm.addClass("sapUiTreeNodeDecoratorSpan");
			rm.writeClasses();
			rm.write(">");
			rm.write("<img");
			rm.addClass("sapUiTreeNodeDecoratorBottomRightOnly");
			rm.writeClasses();
			rm.writeAttributeEscaped("src", oNode._decoratorIconBottomRight);
			rm.write(">");
			rm.write("</span>");
		}	
		if (oNode._decoratorIconTopLeft){
			rm.write("<span");
			rm.addClass("sapUiTreeNodeDecoratorSpan");
			rm.writeClasses();
			rm.write(">");
			rm.write("<img");
			rm.addClass("sapUiTreeNodeDecoratorTopLeftOnly");
			rm.writeClasses();
			rm.writeAttributeEscaped("src", oNode._decoratorIconTopLeft);
			rm.write(">");
			rm.write("</span>");
		}	
		if (oNode._decoratorIconTopRight){
			rm.write("<span");
			rm.addClass("sapUiTreeNodeDecoratorSpan");
			rm.writeClasses();
			rm.write(">");
			rm.write("<img");
			rm.addClass("sapUiTreeNodeDecoratorTopRightOnly");
			rm.writeClasses();
			rm.writeAttributeEscaped("src", oNode._decoratorIconTopRight);
			rm.write(">");
			rm.write("</span>");
		}

		rm.write("<span"); //Node Content

		rm.addClass("sapUiTreeNodeContent");
		if (!oNode.getSelectable()) {
			rm.addClass("sapUiTreeNodeNotSelectable");
		}
		rm.writeClasses();

		rm.write(">"); //Node Content
		
	
		if (oNode.getIcon()) {
			rm.writeIcon(oNode.getIcon(), "sapUiTreeIcon");
		}

//========================================== Decoration: Prefix ==========================================		
		if (oNode._oPrefix && oNode._oPrefix.text){
			rm.write("<span");
			if (oNode._oPrefix.styleClass){
				rm.addClass(oNode._oPrefix.styleClass);
				rm.writeClasses();				
			}
			rm.write("> ");

			rm.writeEscaped(oNode._oPrefix.text);
			rm.write(" </span>");
		}
//================================================================================================================	

		rm.writeEscaped(oNode.getText());

//=============== Decoration: Suffix =================================================================================================		
		if (oNode._aSuffixes){
			for (var i = 0; i < oNode._aSuffixes.length; i++){
				var oSuffix = oNode._aSuffixes[i];
				rm.write("<span");
				if (oSuffix.styleClass){
					rm.addClass(oSuffix.styleClass);
					rm.writeClasses();				
				}
				rm.write("> ");
				rm.writeEscaped(oSuffix.text);
				rm.write(" </span>");
			}
		}
//================================================================================================================
		
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
			for ( var i = 0; i < aSubNodes.length; i++) {
				sap.watt.platform.plugin.repositorybrowser.view.BrowserTreeRenderer.renderNode(rm, aSubNodes[i], iLevel, aSubNodes.length,
						i + 1);
			}
			rm.write("</ul>");
		}
	};
}());