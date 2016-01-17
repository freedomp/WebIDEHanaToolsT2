define(function() {
	"use strict";
	return {

		selection : null,

		getSelection : function() {
			return this.selection;
		},
		
		change : function(selection) {
			this.selection = selection;
			return this.context.event.fireSelectionChanged();
		}

	};
});