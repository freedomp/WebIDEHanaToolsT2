define(["hanaddl/hanaddlNonUi"], function(hanaddlNonUi) {
	"use strict";
	return {
		updateSnippetBeforeInsertion : function(sSnippetContent, oDocument) {
			var sNamespace = this._buildNamespaceOfDocument(oDocument);
			var sRegex = new RegExp("{{namespace}}", "g"); //g - Perform a global match (find all matches rather than stopping after the first match) 
			sSnippetContent = sSnippetContent.replace(sRegex, sNamespace);
			
			var sName = this._buildNameOfDocument(oDocument);
			sRegex = new RegExp("{{fileName}}", "g");
			sSnippetContent = sSnippetContent.replace(sRegex, sName);
			
			return sSnippetContent;
		},
		
		_buildNamespaceOfDocument : function(oDocument) {
			var oSourceUtil = hanaddlNonUi.DdlSourceUtil;
			var sFullPath = oDocument.getEntity().getFullPath();
			var sNamespace = sFullPath.substr(1, sFullPath.lastIndexOf("/") - 1);
		    sNamespace = sNamespace.replace(/\//g, ".");
	        return oSourceUtil.getNamespace(sNamespace);
		},
		
		_buildNameOfDocument : function(oDocument) {
			var sFullPath = oDocument.getEntity().getFullPath();
			var iBegin = sFullPath.lastIndexOf("/") + 1;
			var iEnd = sFullPath.lastIndexOf(".");
			var sName = sFullPath.substr(iBegin, iEnd - iBegin);
			return sName;
		}
	};
});