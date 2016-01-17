define([], function() {
	"use strict";
	return {
		updateSnippetBeforeInsertion : function(sSnippetContent, oDocument) {
			var sFullPath = oDocument.getEntity().getFullPath();
			var sSnippetUpdatedContent = sSnippetContent.replace("<docFullPath>", sFullPath);
			return sSnippetUpdatedContent;
		}
	};
});