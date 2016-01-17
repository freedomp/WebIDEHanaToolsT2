define([ "sap/watt/common/plugin/platform/service/ui/AbstractEditor" ], function(AbstractEditor) {
	"use strict";

	var ImageViewer = AbstractEditor.extend("sap.watt.common.plugin.imageviewer.service.ImageViewer", {});

	jQuery.extend(ImageViewer.prototype, {

		_oView : null,
		oDocument : null,
		
		configure : function(mConfig) {
		},

		init : function() {
		},

		open : function(oDocument) {
			var that = this;
			this._oDocument = oDocument;
			return oDocument.getContent().then(function(sContent){
				var oImage = that._oView.getController().getImage();
				
				var sUrl = URL.createObjectURL(sContent);
				oImage.setSrc(sUrl);
				oImage.setAlt(that._oDocument.getEntity().getFullPath());
				that.focus();
			});
		},

		flush : function() {
		},

		close : function(oDocument) {
			// clean up
			this._oDocument = null;
			var oImage = this._oView.getController().getImage();
			oImage.setSrc("");
			oImage.setAlt("");
			AbstractEditor.prototype.close.apply(this, arguments).done();
		},

		getTitle : function() {
			return this._oDocument.getEntity().getName();
		},

		getTooltip : function() {
			return this._oDocument.getEntity().getFullPath();
		},

		getContent : function() {
			if (!this._oView) {
				this._oView = sap.ui.view("imageviewer", {
					viewName : "sap.watt.ideplatform.plugin.imageviewer.view.ImageViewer",
					type : sap.ui.core.mvc.ViewType.XML
				});
				this._oView.setWidth("100%");
				this._oView.setHeight("100%");
			}
			return this._oView;
		},
		
		getSelection : function(){
			return [ {
				document : this._oDocument
			} ];
		}

	});

	return ImageViewer;
});