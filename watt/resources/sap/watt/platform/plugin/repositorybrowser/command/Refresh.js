define(function() {
	"use strict";
	return {

		execute : function() {
			this.context.service.usagemonitoring.report("repositoryBrowser", "commandExecuted", this.context.self._sName).done();
			return this.context.service.repositorybrowser.getSelection().then(function(aSelection) {
				for (var i = 0; i < aSelection.length; i++) {
					var oDocument = aSelection[i].document;
					if (oDocument.getEntity().isFile()) {
						oDocument.reload();
					} else if (oDocument.getEntity().isFolder()) {
						oDocument.refresh();
					}
				}	
			});
		},

		isAvailable : function() {
			return this.context.service.selection.isOwner(this.context.service.repositorybrowser);
		},

		isEnabled : function() {
			return this.context.service.selection.isOwner(this.context.service.repositorybrowser);
		}
	};
});