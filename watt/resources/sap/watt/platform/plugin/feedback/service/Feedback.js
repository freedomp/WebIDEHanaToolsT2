define(function() {
	"use strict";
	return {

		/**
		 * Returns the feedback form
		 * @returns {sap.ui.core.mvc.View}
		 */
		getFeedbackUI: function() {
			var oFeedbackView = sap.ui.view({
				viewName: "sap.watt.platform.plugin.feedback.view.FeedbackForm",
				type: sap.ui.core.mvc.ViewType.JS,
				viewData: {
					service: this.context.service,
					context: this.context
				}
			});
			return oFeedbackView;
		},

		/**
		 * Sends the feedback to HCP backend service
		 * @param {object}		oTextAnswers			The answers of the feedback questions
		 * @param {object}		oRatings				The ratings
		 * @param {object}		oContextAttributes		The context attributes (e.g browser type and version)
		 */
		sendFeedback: function(oTextAnswers, oRatings, oContextAttributes) {
			var oData = {
				texts: oTextAnswers,
				ratings: oRatings,
				context: oContextAttributes
			};
			var sData = JSON.stringify(oData);
			return Q.sap.ajax(sap.watt.getEnv("context_root") + "feedback", {
				data: sData,
				type: "POST",
				contentType: "application/json"
			}).fail(function(oError) {
				throw oError;
			});
		}
	};
});