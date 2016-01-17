define([], function() {
	"use strict";
	
	return {
		configure: function(mConfig) {
		},
		
		/**
		 * Get proposal with online help url based on given proposal
		 *
		 * @param {object} proposal The given proposal object
		 * @param {string} rootUrl The root url of given library
		 * @return {object} The proposal with online help url if exists
		 * @public
		 * @name getHelpProposal
		 * @function
		 */
	    getHelpProposal: function (proposal, rootUrl) {
			if (!proposal) {
				return Q();
			}
			
	        var helpCategory = proposal.category;
			var helpTarget = proposal.helpTarget;
			if (helpCategory && helpTarget && rootUrl) {
				var helpUrl;
				if (proposal.library === "sapui5") {
					if (helpTarget.indexOf('sap.') === 0 || 
						helpTarget.indexOf('jQuery.') === 0) {
						if (helpCategory == "namespace" || 
							helpCategory == "class" || helpCategory == "static class") {
							helpUrl = rootUrl + helpTarget + ".html";
						} else if (helpCategory == "function"/* || helpCategory == "enum"*/) {
							var pos = helpTarget.lastIndexOf('.');
							if (pos > 0) {
								var htmlAnchor = helpTarget.substring(pos + 1);
								var htmlTarget = helpTarget.substring(0, pos);
								helpUrl = rootUrl + htmlTarget + ".html#" + htmlAnchor;
							}
						}
					}
				}
				proposal.helpUrl = helpUrl;
			}
			return Q(proposal);
	    }
	};
});