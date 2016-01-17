define(["sap/watt/saptoolsets/fiori/editor/plugin/ui5wysiwygeditor/utils/ResourcesHelper"], function (ResourceHelper) {
	"use strict";

	describe("Resource Helper", function () {
		describe("Loads metadata correctly", function () {
			it("Returns 'undefined' if no metadata", function () {
				ResourceHelper.init({
					service: {
						metadataHandler: {
							getMetadataDocuments: function() {
								return Q();
							}
						},
						document: {
							attachEvent: function() {}
						}
					}
				});
				var oDummyDoc = {
					getEntity: function() {
						return {
							getFullPath: function() {
								return "";
							}
						};
					},
					getProject: function () {
						return Q();
					}
				};
				ResourceHelper.loadMetadata(oDummyDoc).then(function(aEntities) {
					expect(aEntities).to.be.a("undefined");
				});
			});
		});
	});
});
