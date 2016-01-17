/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */
// Provides default renderer for control sap.ui.richtexteditor.RichTextEditor
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Renderer'],
	function(jQuery, Renderer) {
	"use strict";


	/**
	 * RichTextEditorRenderer
	 * @class
	 * @static
	 * @author Malte Wedel, Andreas Kunz
	 */
	var RichTextEditorRenderer = {
	};
	
	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 * 
	 * @param {sap.ui.core.RenderManager} oRenderManager The RenderManager that can be used for writing to the Render-Output-Buffer.
	 * @param {sap.ui.richtexteditor.RichTextEditor}
	 *            oRichTextEditor The RichTextEditor control that should be rendered.
	 */
	RichTextEditorRenderer.render = function(oRenderManager, oRichTextEditor) {
		var rm = oRenderManager,
		    r  = RichTextEditorRenderer;
		
		// root tag
		rm.write('<div');
		rm.writeControlData(oRichTextEditor);
		rm.addClass("sapUiRTE");
		if (oRichTextEditor.getRequired()) {
			rm.addClass("sapUiRTEReq");
		}
		if (oRichTextEditor.getUseLegacyTheme()) {
			rm.addClass("sapUiRTELegacyTheme");
		}
		
		rm.writeClasses();
		rm.addStyle("width", oRichTextEditor.getWidth());
		rm.addStyle("height", oRichTextEditor.getHeight());
		rm.writeStyles();
		if (oRichTextEditor.getTooltip_AsString()) { // ensure not to render null
			rm.writeAttributeEscaped("title", oRichTextEditor.getTooltip_AsString());
		}
		rm.write('>');
		
		// render the actual editor - could be different ones depending on configuration
		var renderMethodName = "render" + oRichTextEditor.getEditorType() + "Editor";
		if (r[renderMethodName] && typeof r[renderMethodName] === "function") {
			r[renderMethodName].call(r, rm, oRichTextEditor);
		} // else {
			// no valid editor configured; render a plain textarea - but it will not be a full-fledged sap.ui.commons.TextArea!!
			/*
			rm.write('<textarea class="sapUiRTEPlainTextarea sapUiTf sapUiTfBack sapUiTfBrd sapUiTfStd sapUiTxtA" ');
			rm.writeAttribute('id', oRichTextEditor.getId() + "-textarea");
			rm.addStyle("width", oRichTextEditor.getWidth());
			rm.addStyle("height", oRichTextEditor.getHeight());
			rm.writeStyles();
			rm.write('></textarea>');
			 */
		// }
		
		// close the tag
		rm.write('</div>');
	};
	
	
	
	/* Editor-implementation-dependent code 
	 * The following code will only be executed if the configured editor is TinyMCE */
	
	/**
	 * Creates the HTML required to run the TinyMCE editor
	 * 
	 * @param {sap.ui.core.RenderManager} [rm] The RenderManager instance
	 * @param {sap.ui.richtexteditor.RichTextEditor} [oRichTextEditor] The control instance
	 * @private
	 */
	RichTextEditorRenderer.renderTinyMCEEditor = function(rm, oRichTextEditor) {
	
		if (!RichTextEditorRenderer.bTinyMCELoaded) {
			// load tinymce script
			jQuery.sap.includeScript(sap.ui.resource('sap.ui.richtexteditor', oRichTextEditor.getEditorLocation()));
			RichTextEditorRenderer.bTinyMCELoaded = true;
		}
	
		rm.write('<textarea ');
		rm.writeAttribute('id', oRichTextEditor.getId() + "-textarea");
		rm.addStyle("width", oRichTextEditor.getWidth());
		rm.addStyle("height", oRichTextEditor.getHeight());
		rm.writeStyles();
		if (oRichTextEditor.getTooltip_AsString()) {
			rm.writeAttributeEscaped("title", oRichTextEditor.getTooltip_AsString());
		}
		rm.write('>');
		rm.writeEscaped(oRichTextEditor.getValue());
		rm.write('</textarea>');
	};
	
	/* Editor-implementation-dependent code 
	 * The following code will only be executed if the configured editor is TinyMCE */
	
	/**
	 * Creates the HTML required to run the TinyMCE4 editor
	 * 
	 * @param {sap.ui.core.RenderManager} [rm] The RenderManager instance
	 * @param {sap.ui.richtexteditor.RichTextEditor} [oRichTextEditor] The control instance
	 * @private
	 */
	RichTextEditorRenderer.renderTinyMCE4Editor = function(rm, oRichTextEditor) {
	
		if (!RichTextEditorRenderer.bTinyMCE4Loaded) {
			// load tinymce script
			jQuery.sap.includeScript(sap.ui.resource('sap.ui.richtexteditor', oRichTextEditor.getEditorLocation()));
			RichTextEditorRenderer.bTinyMCE4Loaded = true;
		}
	
		rm.write("<div");
		rm.addStyle("width", oRichTextEditor.getWidth());
		rm.addStyle("height", oRichTextEditor.getHeight());
		rm.write('>');
	
		rm.write('<textarea ');
		rm.writeAttribute('id', oRichTextEditor.getId() + "-textarea");
		rm.addStyle("width", oRichTextEditor.getWidth());
		rm.addStyle("height", oRichTextEditor.getHeight());
		rm.writeStyles();
		if (oRichTextEditor.getTooltip_AsString()) {
			rm.writeAttributeEscaped("title", oRichTextEditor.getTooltip_AsString());
		}
		rm.write('>');
		rm.writeEscaped(oRichTextEditor.getValue());
		rm.write('</textarea>');

		rm.write('</div>');
	};
	

	return RichTextEditorRenderer;

}, /* bExport= */ true);
