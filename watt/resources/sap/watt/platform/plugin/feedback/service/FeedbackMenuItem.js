define(function() {
	"use strict";
	return {

		init : function() {
		    var that = this;
            this.oButton = new sap.ui.commons.Button({
            	text : that.context.i18n.getText("i18n", "feedback_button"),
            	lite : true,
            	tooltip : "",
            	press : function() {
        			that.context.service.feedback.getFeedbackUI().then(function(feedbackView) {
        			    if(feedbackView) {
    			        	feedbackView.getController().openForm();
        			    }
        			}).done();
                }
            });
			this.oButton.addStyleClass("feedbackButton");
        },

		configure : function(mConfig) {
			this._aStyles = mConfig.styles;
		},

		getContent : function() {
			if(this._isAvailable()){
				var that = this;
				return this.context.service.resource.includeStyles(this._aStyles).then(function() {
					return [that.oButton];
				});
			} else{
				return null;
			}
		},

		_isAvailable : function(){
			return sap.watt.getEnv("server_type") !== "xs2";
		}
	};
});
