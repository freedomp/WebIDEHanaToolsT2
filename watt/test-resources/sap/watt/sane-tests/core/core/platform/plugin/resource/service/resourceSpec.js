define(["sap/watt/platform/plugin/resource/service/Resource"], function(oResourceService) {
	"use strict";

	describe("Resource Include Styles Unit Test", function() {
		it("Resource Include Styles", (function() {
			var aStyle = [{
				"uri": "core/core/platform/plugin/resource/css/someCSSFile.css"
			}];
			return oResourceService.includeStyles(aStyle).then(function() {

				var aLink = document.querySelectorAll('link[href$="css/someCSSFile.css"]');
				assert.equal(aLink.length, 1, "No link is found");
			});
		}));

		it("Resource Include Styles wrong Uri", (function() {
			var aStyle = [{
				"uri": "core/core/platform/plugin/resource/css/noneExistingFile.css"
			}];
			return oResourceService.includeStyles(aStyle).then(
				function() {
					assert.ok(false, "Service should reject promise");
				}, function() {
					assert.ok(true, "Service did reject promise");
				});
		}));
	});
});