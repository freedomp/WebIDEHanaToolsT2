sap.ui.define(['sap/ui/core/Renderer','./ObjectPageHeaderRenderer'],
	function(Renderer, ObjectPageHeaderRenderer) {
	"use strict";

	/**
	 * @class HeaderContent renderer.
	 * @static
	 */
	var ObjectPageHeaderContentRenderer = {};

	ObjectPageHeaderContentRenderer.render = function (oRm, oControl) {
		var oParent = oControl.getParent(),
			bParentLayout = (oParent instanceof sap.uxap.ObjectPageLayout),
			oHeader = (oParent && bParentLayout) ? oParent.getHeaderTitle() : false,
			bRenderTitle = (oParent && bParentLayout) ? ((oParent instanceof sap.uxap.ObjectPageLayout)
			&& oParent.getShowTitleInHeaderContent()) : false;

			oRm.write("<div ");
			oRm.writeControlData(oControl);
			oRm.addClass("ui-helper-clearfix");
			oRm.addClass("sapUxAPObjectPageHeaderContent");
			oRm.addClass("sapUxAPObjectPageHeaderContentDesign-" + oControl.getContentDesign());
			if (!oControl.getVisible()) {
				oRm.addClass("sapUxAPObjectPageHeaderContentHidden");
			}
			oRm.writeClasses();
			oRm.write(">");

			if (bRenderTitle) {
				this._renderTitleImage(oRm, oHeader);

				if ( oControl.getContent().length == 0 ) {
					oRm.write("<span class=\"sapUxAPObjectPageHeaderContentItem\">");
					this._renderTitle(oRm, oHeader);
					oRm.write("</span>");
				}
			}

			oControl.getContent().forEach(function (oItem, iIndex) {
				this._renderHeaderContent(oItem, iIndex, oRm, bRenderTitle, oHeader, oControl);
			}, this);

			oRm.write("</div>");
	};

	/**
	 * This method is called to render the content
	 */
	ObjectPageHeaderContentRenderer._renderHeaderContent = function (oHeaderContent, iIndex, oRm, bRenderTitle, oHeader, oControl) {
		var bHasSeparatorBefore = false,
			bHasSeparatorAfter = false,
			oLayoutData = oControl._getLayoutDataForControl(oHeaderContent);

		if (oLayoutData) {
			bHasSeparatorBefore = oLayoutData.getShowSeparatorBefore();
			bHasSeparatorAfter = oLayoutData.getShowSeparatorAfter();

			oRm.write("<span ");
			oRm.addClass("sapUxAPObjectPageHeaderWidthContainer");
			oRm.addClass("sapUxAPObjectPageHeaderContentItem");
			oRm.addStyle("width", oLayoutData.getWidth());
			oRm.writeStyles();

			if (bHasSeparatorAfter || bHasSeparatorBefore) {
				oRm.addClass("sapUxAPObjectPageHeaderSeparatorContainer");
			}

			if (!oLayoutData.getVisibleL()) {
				oRm.addClass("sapUxAPObjectPageHeaderLayoutHiddenL");
			}
			if (!oLayoutData.getVisibleM()) {
				oRm.addClass("sapUxAPObjectPageHeaderLayoutHiddenM");
			}
			if (!oLayoutData.getVisibleS()) {
				oRm.addClass("sapUxAPObjectPageHeaderLayoutHiddenS");
			}

			oRm.writeClasses();
			oRm.write(">");

			if (bHasSeparatorBefore) {
				oRm.write("<span class=\"sapUxAPObjectPageHeaderSeparatorBefore\"/>");
			}

			if (iIndex == 0 && bRenderTitle) { // render title inside the first contentItem
				this._renderTitle(oRm, oHeader);
			}
		} else {
			if (iIndex == 0 && bRenderTitle) { // render title inside the first contentItem
				oRm.write("<span class=\"sapUxAPObjectPageHeaderContentItem\">");
				this._renderTitle(oRm, oHeader);
			} else {
				oHeaderContent.addStyleClass("sapUxAPObjectPageHeaderContentItem");
			}
		}

		oRm.renderControl(oHeaderContent);

		if (bHasSeparatorAfter) {
			oRm.write("<span class=\"sapUxAPObjectPageHeaderSeparatorAfter\"/>");
		}

		if (oLayoutData || (iIndex == 0 && bRenderTitle)) {
			oRm.write("</span>");
		}
	};

	/**
	 * This method is called to render title and all it's parts if the property showTitleInHeaderContent is set to true
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 * @param {sap.ui.core.Control} oHeader an object representation of the titleHeader that should be rendered
	 */
	ObjectPageHeaderContentRenderer._renderTitleImage = function(oRm, oHeader) {

		if (oHeader.getObjectImageURI() || oHeader.getShowPlaceholder()) {
			oRm.write("<span");
			oRm.addClass("sapUxAPObjectPageHeaderContentImageContainer");
			oRm.addClass("sapUxAPObjectPageHeaderObjectImage-" + oHeader.getObjectImageShape());
			oRm.writeClasses();
			oRm.write(">");
		
			if (oHeader.getObjectImageURI()) {
				oRm.renderControl(oHeader._getInternalAggregation("_objectImage"));
				if (oHeader.getShowPlaceholder()) {
					ObjectPageHeaderRenderer._renderPlaceholder(oRm, oHeader, false);
				}
			} else {
				ObjectPageHeaderRenderer._renderPlaceholder(oRm, oHeader, true);
			}

			oRm.write("</span>");
		}
	};

	/**
	 * This method is called to render title and all it's parts if the property showTitleInHeaderContent is set to true
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	ObjectPageHeaderContentRenderer._renderTitle = function(oRm, oHeader) {
		ObjectPageHeaderRenderer._renderObjectPageTitle(oRm, oHeader, true); // force title to be visible inside the content header
	};

	return ObjectPageHeaderContentRenderer;

}, /* bExport= */ true);
