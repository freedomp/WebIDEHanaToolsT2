define(["../codecompletion/I18nTemplateContentAssist", "../codecompletion/templates"], function(oI18nTemplateAssist, oTemplates) {
	"use strict";

    return {
        
        _oTemplateContentAssistProvider: null,
        
        init: function() {
            this._oTemplateContentAssistProvider = new oI18nTemplateAssist.I18nTemplateContentAssistProvider();
            this._loadTemplates();
        },
        
     	getWordSuggestions: function(oContentStatus) {
     	    var proposals = [];
     	    if (!oContentStatus.isAutoHint && this._isFileNameSupported(oContentStatus)) {
	            var proposals = this._oTemplateContentAssistProvider.computeTemplateProposals(oContentStatus.buffer, oContentStatus.offset, oContentStatus);
     	    }
    	    return {proposals: proposals};
    	},
    	
    	// TODO remove when more generic mechanism will be implemented
    	_isFileNameSupported: function(oContentStatus) {
	        var sFilePath = oContentStatus.targetFile;
 	        var sFullFileName = sFilePath.substring(sFilePath.lastIndexOf("/") + 1).toLowerCase();
 	        return sFullFileName === "i18n.properties" || sFullFileName === "messagebundle.properties";
    	},
    	
    	_loadTemplates: function() {
    	    var sEnterComment = this.context.i18n.getText("i18n", "i18n_enterComment");
    	    var sEnterKey = this.context.i18n.getText("i18n", "i18n_enterKey");
    	    var sEnterValue = this.context.i18n.getText("i18n", "i18n_enterValue");
	    	var sTemplateSuffix = ": ${" + sEnterComment + "}\n${" + sEnterKey + "} = ${" + sEnterValue + "}\n\n";
	    	
	    	// Load templates from file and add for each one a suffix
	    	var aTemplates = oTemplates.templates;
	    	for (var i=0; i<aTemplates.length; i++) {
	    	    aTemplates[i].template += sTemplateSuffix;
	    	}
	    	
	    	this._oTemplateContentAssistProvider.addTemplates(aTemplates);
    	}
    };
	
});