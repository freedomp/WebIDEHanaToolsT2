sap.ui.define(
	[
		"jquery.sap.global",
		"sap/ui/core/Control",
		"sap/ui/core/IntervalTrigger"
	],
	function(jQuery, Control, IntervalTrigger) {
		"use strict";

// Private variables and methods
// Begin
		var _oResizeTrigger = new IntervalTrigger(300);

		function _attachEvents(oIFrame)	{
			if(!oIFrame._bAttached) {
				oIFrame._bAttached = true;
				_oResizeTrigger.addListener(_syncIFrame, oIFrame);
			}
		}
		function _detachEvents(oIFrame) {
			_oResizeTrigger.removeListener(_syncIFrame, oIFrame);
			oIFrame._bAttached = false;
		}
		function _getPlaceholderId(oIFrame) {
			return oIFrame.getId() + "-placeholder";
		}
		function _getPlaceholderDomRef(oIFrame) {
			return document.getElementById(_getPlaceholderId(oIFrame));
		}
		/**
		 * @this {IFrame}
		 * @private
		 */
		function _syncIFrame() {
			var oIFrame = this.getDomRef();
			var $iFrame = jQuery(oIFrame);
			var oPlaceholder = _getPlaceholderDomRef(this);
			if (oPlaceholder && (oPlaceholder.offsetHeight > 0 && oPlaceholder.offsetWidth > 0)) {
				var $placeholder = jQuery(oPlaceholder);
				$iFrame.height($placeholder.height());
				$iFrame.width($placeholder.width());
				var mOffset = $placeholder.offset();
				$iFrame.css({
					display : "block",
					left : mOffset.left,
					top : mOffset.top
				});
				oIFrame.className = oPlaceholder.className;
			} else {
				$iFrame.css({
					display : "none"
				});
			}
		}
		/**
		 * @this {IFrame}
		 * @private
		 */
		function _onLoaded() {
			_attachEvents(this);
			this.fireLoaded();
		}
// End
// Private variables and methods

		var IFrame = Control.extend("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.IFrame",
			/** @lends sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.IFrame.prototype */ {
				metadata: {
					properties: {
						"width": { type: "sap.ui.core.CSSSize" },
						"height": { type: "sap.ui.core.CSSSize"},
						"frameBorder": { type: "int", defaultValue: 0 },
						"source": { type: "string", defaultValue: ""},
						"seamless": { type: "boolean", defaultValue: true},
						"content" : { type: "string", defaultValue: ""},
						"visible" : { type: "boolean", defaultValue: true}
					},
					events :{
						"loaded" : {}
					}
				},
				constructor: function () {
					this._oIFrame = null;
					this._bAttached = false;

					Control.apply(this, arguments);
				},
				renderer: function(rm, oControl) {
					if (!oControl.getVisible()) {
						_syncIFrame.call(this);
						return;
					}
					rm.write("<div id='" + _getPlaceholderId(oControl) + "'");
					rm.addClass("sapWysiwygIframe");
					rm.writeClasses();
					rm.addStyle("visibility", "hidden");
					if (oControl.getWidth() != '') {
						rm.addStyle("width", oControl.getWidth());
					}
					if (oControl.getHeight() != '') {
						rm.addStyle("height", oControl.getHeight());
					}
					rm.writeStyles();
					rm.write(">");
					rm.write("</div>");
				}
			});

		IFrame.prototype.exit = function() {
			_detachEvents(this);
			if (this._oIFrame) {
				var $iFrame = jQuery(this._oIFrame);
				$iFrame.off("load", jQuery.proxy(_onLoaded, this));
				$iFrame.attr("src", " ");
				$iFrame.remove();
				this._oIFrame = null;
			}
		};

		IFrame.prototype.setContent = function(sContent) {
			var $iFrame = jQuery(this.getDomRef());
			var oDocument = $iFrame.contents()[0];
			oDocument.open();
			oDocument.write(this.getContent());
			oDocument.close();
			this.setProperty("content", sContent, true);
			return this;
		};

		IFrame.prototype.setSeamless = function(bSeamless) {
			jQuery(this.getDomRef()).attr("seamless",bSeamless ? "seamless" : undefined);
			this.setProperty("seamless", bSeamless, true);
			return this;
		};

		IFrame.prototype.setFrameBorder = function(iFrameBorder) {
			jQuery(this.getDomRef()).attr("frameborder", iFrameBorder);
			this.setProperty("frameBorder", iFrameBorder, true);
			return this;
		};

		IFrame.prototype.setSource = function(sSource) {
			_detachEvents(this);
			jQuery(this.getDomRef()).attr("src", sSource);
			this.setProperty("source", sSource, true);
			return this;
		};

		IFrame.prototype.getWindow = function() {
			var oIFrame = this.getDomRef();
			return oIFrame.contentWindow || oIFrame.defaultView;
		};

		IFrame.prototype.getDomRef = function() {
			if (!this._oIFrame && !this._bIsBeingDestroyed) {
				// iFrames always reload when appended to another DOM element. That is why we add the iframe initial to the
				// body and place it absolute to the position of the
				// Placeholder element.

				// See the following bugs:
				// https://bugs.webkit.org/show_bug.cgi?id=13574
				// https://bugzilla.mozilla.org/show_bug.cgi?id=254144

				// AdoptNode does not work as "if the adopted node is already part of this document (i.e. the source and target
				// document are the same), this method still has the effect of removing the source node from the child list of its paren"
				// see. http://www.w3.org/TR/DOM-Level-3-Core/core.html#Document3-adoptNode

				// the "magic iframe" workaround with adoptNode was removed from webkit https://bugs.webkit.org/show_bug.cgi?id=81590

				this._oIFrame = document.createElement("iframe");
				// TODO: Apply all the css
				jQuery(this._oIFrame)
					.attr({
						id : this.getId()
					})
					.css({
						position: "absolute",
						display : "none"
					})
					.on("load", jQuery.proxy(_onLoaded, this))
					.prependTo(document.body);
				this.setSeamless(this.getSeamless());
				this.setFrameBorder(this.getFrameBorder());
			}
			return this._oIFrame;
		};

		return IFrame;
	},
	/* bExport= */ true
);
