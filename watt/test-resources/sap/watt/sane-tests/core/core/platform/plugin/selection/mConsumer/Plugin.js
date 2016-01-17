define(function() {
	"use strict";

	var oReturnPlugin = {
		selectionChanged: [],
		typedSelectionChanged : [],
		
		onSelectionChanged : function(event) {
			this.selectionChanged.push(event);
		},
		
		onTypedSelectionChanged : function(event) {
			this.typedSelectionChanged.push(event);
		},
		
		reset : function() {
			this.selectionChanged = [];
			this.typedSelectionChanged = [];
		},
		
		getSelectionChanged : function () {
			return this.selectionChanged;
		}
	};
	
	return oReturnPlugin;
});
