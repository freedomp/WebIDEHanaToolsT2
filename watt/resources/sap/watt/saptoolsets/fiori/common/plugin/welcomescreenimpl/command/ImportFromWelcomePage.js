define([], function() {
	"use strict";

	return {
		execute: function () {
			this.context.service.import.getImportDialog().then(function(oImportDialog) {
				oImportDialog.open();
			}).done();
		}
	};
});