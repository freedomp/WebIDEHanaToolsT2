define(["STF", "sinon"], function(STF, sinon) {
	"use strict";

	var sandbox;
	var suiteName = "ui5versions";
	describe("Common Runners - UI5 versions", function() {
		var oUi5Versions;
		var URI;
		var jQuery;
		var externalUi5Version;
		var internalUi5Version;
		function getFileAsString(sFileName) {
			//var sURL =  new URI(".").absoluteTo(document.baseURI).path() + "service/commonrunners/testData/" + sFileName;
			var sURL = require.toUrl("../test-resources/sap/watt/sane-tests/runner/service/commonrunners/testData/" +sFileName);
			var sResult;
			jQuery.ajax({
				url: sURL,
				dataType: 'text',
				success: function(result) {
					sResult = result;
				},
				async: false
			});
			return sResult;
		}

		before(function() {
			var loadWebIdePromise = STF.startWebIde(suiteName, {
				config: "runner/service/commonrunners/config.json"
			});
			return loadWebIdePromise.then(function(webIdeWindowObj) {
				sandbox = sinon.sandbox.create();
				oUi5Versions = STF.getService(suiteName, "ui5versions");
				URI = webIdeWindowObj.URI;
				jQuery = webIdeWindowObj.jQuery;
				externalUi5Version = getFileAsString("externalUi5Version.json");
				internalUi5Version = getFileAsString("internalUi5Version.json");
			});
		});

		after(function() {
			STF.shutdownWebIde(suiteName);
		});

		afterEach(function() {
			sandbox.restore();
		});

		it("Test get internal UI5 versions",
			function() {
				return oUi5Versions._getImpl().then(function(oNonLazyProxy) {
					return oNonLazyProxy._getImpl().then(function(oImpl) {
						var oUi5Version = JSON.parse(externalUi5Version);
						var oUi5VersionInternal = JSON.parse(internalUi5Version);
						var aUi5Version = oImpl._getUI5Versions(oUi5Version, oUi5VersionInternal);
						expect(aUi5Version.length).to.equal(35);
					});
				});
			});

		it("Test get external UI5 versions",
			function() {
				return oUi5Versions._getImpl().then(function(oNonLazyProxy) {
					return oNonLazyProxy._getImpl().then(function(oImpl) {
						var oUi5Version = JSON.parse(getFileAsString("externalUi5Version.json"));
						var aUi5Version = oImpl._getUI5Versions(oUi5Version);
						expect(aUi5Version.length).to.equal(24);
					});
				});
			});

		it("Test get internal UI5 versions with appD with minimal version",
			function() {
				var sUI5MinimalVersion = "1.22.3";
				return oUi5Versions._getImpl().then(function(oNonLazyProxy) {
					return oNonLazyProxy._getImpl().then(function(oImpl) {
						var oUi5Version = JSON.parse(getFileAsString("externalUi5Version.json"));
						var oUi5VersionInternal = JSON.parse(getFileAsString("internalUi5Version.json"));
						var aUi5Version = oImpl._getUI5Versions(oUi5Version, oUi5VersionInternal);
						var aUi5SortVersion = oImpl.sortOutVersionsBelowAppDescriptorVersion(sUI5MinimalVersion, aUi5Version);
						expect(aUi5SortVersion.length).to.equal(30);
					});
				});
			});

		it("Test get internal UI5 versions with appD with empty minimal version",
			function() {
				var sUI5MinimalVersion = "";
				return oUi5Versions._getImpl().then(function(oNonLazyProxy) {
					return oNonLazyProxy._getImpl().then(function(oImpl) {
						var oUi5Version = JSON.parse(getFileAsString("externalUi5Version.json"));
						var oUi5VersionInternal = JSON.parse(getFileAsString("internalUi5Version.json"));
						var aUi5Version = oImpl._getUI5Versions(oUi5Version, oUi5VersionInternal);
						var aUi5SortVersion = oImpl.sortOutVersionsBelowAppDescriptorVersion(sUI5MinimalVersion, aUi5Version);
						expect(aUi5SortVersion.length).to.equal(35);
						expect(aUi5SortVersion).to.equal(aUi5Version);
					});
				});
			});

		it("Test get internal UI5 versions with appD with empty versions list",
			function() {
				var sUI5MinimalVersion = "1.22.3";
				return oUi5Versions._getImpl().then(function(oNonLazyProxy) {
					return oNonLazyProxy._getImpl().then(function(oImpl) {
						var aUi5SortVersion = oImpl.sortOutVersionsBelowAppDescriptorVersion(sUI5MinimalVersion, undefined);
						expect(aUi5SortVersion).to.equal(undefined);
					});
				});
			});
	});
});