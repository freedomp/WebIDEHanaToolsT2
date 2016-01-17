define([], function() {
	"use strict";
	
	return {
	    
	    _oSuggestions: null,
	    
	    setWordSuggestions: function (oSuggestions) { 
	        this._oSuggestions = oSuggestions;
	    },
		 
	    getWordSuggestions: function (oContentStatus) {
	        return this._oSuggestions;
	    }
	};
});