define([], function() {
	"use strict";
	return {
		updateSnippetBeforeInsertion : function(sSnippetContent, oDocument) {
			var sNamespace = this._buildNamespaceOfDocument(oDocument);
			var sRegex = new RegExp("{{package_path}}", "g"); //g - Perform a global match (find all matches rather than stopping after the first match) 
			sSnippetContent = sSnippetContent.replace(sRegex, sNamespace);
			return sSnippetContent;
		},
		
		_buildNamespaceOfDocument : function(oDocument) {
			var sFullPath = oDocument.getEntity().getFullPath();
			var sNamespace = sFullPath.substr(1, sFullPath.lastIndexOf("/") - 1);
			return sNamespace = sNamespace.replace(/\//g, ".");
		}
	};
});