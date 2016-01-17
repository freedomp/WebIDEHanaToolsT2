define(function() {
	"use strict";
	return {

		init : function() {
		    var that = this;
            this.oButton = new sap.ui.commons.Button("report",{
            	icon : "sap-icon://vehicle-repair",
            
            	lite : true,
            	tooltip:"Report a Problem",
            	iconFirst :false,
            	press : function() {
        			that.context.service.reportABug.report("Report");
            	}
            });
            this.oButton.addStyleClass("reportBtn");
            
          
        },

		configure : function(mConfig) {
			this._aStyles = mConfig.styles;
		},

		getContent : function() {
			var that = this;
			return this.context.service.reportABug.isSupported().then(function(bSupported){
				if(bSupported){	
					return that.context.service.resource.includeStyles(that._aStyles).then(function() {
						return [that.oButton];
					});
				} else{
					return null;
				}
			});
		}

	};
});