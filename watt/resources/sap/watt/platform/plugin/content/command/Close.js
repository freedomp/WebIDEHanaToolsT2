define(function() {
	"use strict";
	return {

		execute : function() {
			return this.context.service.content.close();
		},

		isEnabled : function() {
			return this.context.service.content.getDocumentCount().then(function(iCount) {
				return (iCount > 0);
			});
		}
	};
});