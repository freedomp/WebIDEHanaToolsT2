define([], function() {
	return {
		/**
		 * Returns Data connection utils
		 */
		getDataConnectionUtils : function() {
			return Q.sap.require("sap.watt.saptoolsets.fiori.project.servicecatalog/utils/DataConnectionUtils").then(function(DataConnectionUtils) {
				return DataConnectionUtils;
			});
		}
	};
});