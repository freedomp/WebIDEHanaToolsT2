(function() {
	"use strict";
	jQuery.sap.declare("sap.watt.common.plugin.multieditor.control.TabStrip");
	jQuery.sap.require("sap.ui.commons.TabStrip");

	sap.ui.commons.TabStrip.extend("sap.watt.common.plugin.multieditor.control.TabStrip", {
		metadata : {
			events : {
				"tabClick" : {}
			}
		},

		init : function() {
			
		},
		
		selectTabByDomRef : function(oDomRef) {
		    var iTabIndex = this.getItemIndex(oDomRef);
	        if (iTabIndex > -1 && iTabIndex !== this.getSelectedIndex()) {
            	this.fireTabClick({
				    currentTabIndex : this.getSelectedIndex(),
				    selectedTabIndex : iTabIndex
			    });
	        }
		},
		
		renderer: {}
		
	});
})();