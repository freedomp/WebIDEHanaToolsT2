define([], function() {
	return {

		execute: function(oData) {
			var updateSnippetPromise;
			if (oData.preSnippetInsertionHandler) {
				updateSnippetPromise = oData.preSnippetInsertionHandler.updateSnippetBeforeInsertion(oData.snippetContent, oData.currentDocument);
			} else {
				updateSnippetPromise = Q(oData.snippetContent);
			}
			var that = this;
			return updateSnippetPromise.then(function(sSnippetContent) {
				return oData.currentEditor.addString(sSnippetContent);
			}).fail(function(oError) {
				that.context.service.log.error("Snippet", oError.message, ["user"]).done();
				var sError = that.context.i18n.getText("i18n", "invalid_snippet");
				return that.context.service.usernotification.alert(sError);
			});
		},

		isAvailable: function() {
			return true;
		},

		isEnabled: function() {
			return true;
		}
	};
});