define(["STF", "sinon"], function(STF, sinon) {
	"use strict";

	var sandbox;
	var suiteName = "ui5versions";
	describe("UI5 versions utils", function() {
		var UI5VersionsUtil;
		var URI;
		var jQuery;
		var externalUi5Version;
		var internalUi5Version;
		function getFileAsString(sFileName) {
			var sURL = require.toUrl("../test-resources/sap/watt/sane-tests/runner/service/ui5versionsutil/testData/" +sFileName);
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
				config: "runner/service/ui5versionsutil/config.json"
			});
			return loadWebIdePromise.then(function(webIdeWindowObj) {
				sandbox = sinon.sandbox.create();
				UI5VersionsUtil = STF.getService(suiteName, "UI5VersionsUtil");
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
				return UI5VersionsUtil._getImpl().then(function(oNonLazyProxy) {
					return oNonLazyProxy._getImpl().then(function(oImpl) {
						var oUi5Version = JSON.parse(externalUi5Version);
						var oUi5VersionInternal = JSON.parse(internalUi5Version);
						var aUi5Version = oImpl._getUI5AllVersions(oUi5Version, oUi5VersionInternal);
						expect(aUi5Version.length).to.equal(35);
					});
				});
			});

		it("Test get external UI5 versions",
			function() {
				return UI5VersionsUtil._getImpl().then(function(oNonLazyProxy) {
					return oNonLazyProxy._getImpl().then(function(oImpl) {
						var oUi5Version = JSON.parse(getFileAsString("externalUi5Version.json"));
						var aUi5Version = oImpl._getUI5AllVersions(oUi5Version);
						expect(aUi5Version.length).to.equal(24);
					});
				});
			});

		it("Test get internal UI5 versions with appD with minimal version",
			function() {
				var sUI5MinimalVersion = "1.22.3";
				return UI5VersionsUtil._getImpl().then(function(oNonLazyProxy) {
					return oNonLazyProxy._getImpl().then(function(oImpl) {					
						var oUi5Version = JSON.parse(getFileAsString("externalUi5Version.json"));
						var oUi5VersionInternal = JSON.parse(getFileAsString("internalUi5Version.json"));
						var aUi5Version = oImpl._getUI5AllVersions(oUi5Version, oUi5VersionInternal);
						var aUi5SortVersion = oImpl._sortOutVersionsBelowAppDescriptorVersion(sUI5MinimalVersion, aUi5Version);
						expect(aUi5SortVersion.length).to.equal(30);
					});
				});
			});

		it("Test get internal UI5 versions with appD with empty minimal version",
			function() {
				var sUI5MinimalVersion = "";
				return UI5VersionsUtil._getImpl().then(function(oNonLazyProxy) {
					return oNonLazyProxy._getImpl().then(function(oImpl) {
						var oUi5Version = JSON.parse(getFileAsString("externalUi5Version.json"));
						var oUi5VersionInternal = JSON.parse(getFileAsString("internalUi5Version.json"));
						var aUi5Version = oImpl._getUI5AllVersions(oUi5Version, oUi5VersionInternal);
						var aUi5SortVersion = oImpl._sortOutVersionsBelowAppDescriptorVersion(sUI5MinimalVersion, aUi5Version);
						expect(aUi5SortVersion.length).to.equal(35);
						expect(aUi5SortVersion).to.equal(aUi5Version);
					});
				});
			});

		it("Test get internal UI5 versions with appD with empty versions list",
			function() {
				var sUI5MinimalVersion = "1.22.3";
				return UI5VersionsUtil._getImpl().then(function(oNonLazyProxy) {
					return oNonLazyProxy._getImpl().then(function(oImpl) {
						var aUi5SortVersion = oImpl._sortOutVersionsBelowAppDescriptorVersion(sUI5MinimalVersion, undefined);
						expect(aUi5SortVersion).to.equal(undefined);
					});
				});
			});
	});
});