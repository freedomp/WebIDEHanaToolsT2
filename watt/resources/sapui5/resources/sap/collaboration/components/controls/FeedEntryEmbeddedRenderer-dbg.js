/**
 * ! @copyright@
 */
sap.ui.define([],
	function(){
	/**
	 * FeedEntryEmbedded renderer.
	 * @namespace
	 */
	var FeedEntryEmbeddedRenderer = {};
	
	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 * @protected
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oFeedEntryEmbedded an object representation of the control that should be rendered.
	 */
	FeedEntryEmbeddedRenderer.render = function(oRm, oFeedEntryEmbedded){

		// The embedded control is divided into 2 parts:
		// 1-Timeline Item Text Display: Text Display of for the feed and timeline entries
		// 2-Timeline Item Content:	The Content contains the content from feed entries (e.g. document, picture, poll...)
		
		oRm.write("<div"); 
		oRm.writeControlData(oFeedEntryEmbedded);
		oRm.write(">");

		// text display
		if (oFeedEntryEmbedded._shouldTextBeRendered()) {
			
			var sId = oFeedEntryEmbedded.getId();
			var sText = oFeedEntryEmbedded._sTextWithPlaceholders;
			
			oRm.write("<div id='" + sId + "-text' class='sapUiTinyMarginBottom sapCollaborationEmbeddedText'>");			
			this._renderText(oRm, oFeedEntryEmbedded, sText);									
			oRm.write("</div>");
		}
		// content
		if (oFeedEntryEmbedded._shouldContentBeRendered()) {
			oRm.renderControl(oFeedEntryEmbedded._oTimelineItemContent);	
		}
		
		oRm.write("</div>");
	};
	/**
	 * Renders the HTML for text with atMentions placeholders, using the provided {@link sap.ui.core.RenderManager}.
	 * @protected
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered.
	 * @param {string} textToRender the text with placeholders to render
	 */
	FeedEntryEmbeddedRenderer._renderText = function(oRm, oFeedEntryEmbedded, textToRender) {
		
		var aTextSplitByPlaceholders = oFeedEntryEmbedded._splitByPlaceholders(textToRender);
		for (var i=0; i<aTextSplitByPlaceholders.length; i++) {
			// if placeholder, render the link control
			var rPlaceholderPattern = /@@.\{\d+\}/; // Regex pattern for placeholder
			if (rPlaceholderPattern.test(aTextSplitByPlaceholders[i])) {
				oRm.renderControl(oFeedEntryEmbedded._mAtMentionsLinks[aTextSplitByPlaceholders[i]]);
			}
			// else render the text
			else {
				// have to put text in span to apply alignment to match the rendering of the sap.m.Link control
				oRm.writeEscaped(aTextSplitByPlaceholders[i], true);
			}
		}
	};
	
	return FeedEntryEmbeddedRenderer;
}, /* bExport= */ true);


