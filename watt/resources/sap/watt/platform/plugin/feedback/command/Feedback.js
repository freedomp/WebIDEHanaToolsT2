define(function() {
	"use strict";
	return {

		execute : function() {
			this.context.service.feedback.getFeedbackUI().then(function(feedbackView) {
			    if(feedbackView) {
		        	feedbackView.getController().openForm();
			    }
			}).done();
		},

		isAvailable : function() {
			return true;
		},

		isEnabled : function() {
			return true;
		}
	};
});