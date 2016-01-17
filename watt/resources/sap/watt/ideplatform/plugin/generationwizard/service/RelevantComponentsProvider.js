define([ "sap.watt.ideplatform.generationwizard/service/RelevantArtifactsProvider"], function(relevantArtifactsProvider) {

	"use strict";

	return {
		/**
		 * This method gets all the templates of tpye "component" and returns those which relevant to the user selection.
		 * @returns {Array}	an array of Action Items.
		 */
		getItems : function() {
			return relevantArtifactsProvider.getItemsByType(this.context,"component");
		}
	};
});
