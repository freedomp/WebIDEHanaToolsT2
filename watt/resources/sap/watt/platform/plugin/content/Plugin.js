define(function() {
	"use strict";
	return {

		openDocument : function(oEvent) {
			var that = this;
			var oDocument = oEvent.params.document;
			var oContentService = this.context.service.content;
			
			return oContentService.getEditorProvider().then(function(oEditorProvider) {
				return oEditorProvider.getDefaultEditor(oDocument);
			}).then(function(oEditor) {
				if (that._isValidEditor(oEditor)) {
					// be sure that the content service is in place
					return oContentService.setVisible(true).then(function(){
						return oContentService.open(oDocument, oEditor.service);
					});
				} else {
					that.context.service.usernotification.alert(that.context.i18n.getText("i18n", "plugin_mimeTypeNotSupported")).done();
				}
			});
		},

		_isValidEditor : function(oEditor) {
			return oEditor && oEditor.service && oEditor.service.getContent;
		}
	};
});