define(["sap/watt/lib/lodash/lodash"], function (_) {
	"use strict";

	return {

		/**
		 * Get neo-app.json content as an object.
		 *
		 * @param oDocument
		 * @returns {object}
		 */
		getNeoMetadata: function getNeoMetadata(oDocument) {
			return oDocument.getProject().then(function (oProjectDocument) {
				return oProjectDocument.getFolderContent().then(function (aContent) {
					var oNeoAppJsonDocument = _.find(aContent, function (oRootLevelDocument) {
						return "neo-app.json".toUpperCase() === oRootLevelDocument.getEntity().getName().toUpperCase();
					});
					if (oNeoAppJsonDocument) {
						return oNeoAppJsonDocument.getContent().then(function (sContent) {
							return JSON.parse(sContent.replace(/(\r\n|\n|\r)/gm, ""));
						});
					}
					return null;
				});
			});
		}
	};
});
