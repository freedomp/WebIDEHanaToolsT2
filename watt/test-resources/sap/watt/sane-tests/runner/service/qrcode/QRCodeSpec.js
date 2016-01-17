define(["STF", "sinon"], function(STF, sinon) {
	"use strict";

	var sandbox;
	var suiteName = "qrcode";

	describe("QR Code", function() {
		var oQrCodeService;
		var $;
		var jQueryTest = function(target, isURL, expected, checkLocalHostWarning) {
			var oQrCodeJQuery = oQrCodeService.getQrCode(target, isURL);
			expect(oQrCodeJQuery).to.not.equal(null);
			expect(oQrCodeJQuery.oDiv).to.not.equal(null);
			var oDiv = oQrCodeJQuery.oDiv;
			$("#jquery_content").append(oDiv);
			var oCanvas = oDiv.find("canvas");
			expect(oCanvas.length).to.equal(1);
			if (checkLocalHostWarning) {
				expect(oDiv.find("#localhost-warning").length).to.equal(1);
			}
		};

		var ui5ControlTest = function(done, target, isURL, expected, checkLocalHostWarning) {
			var oQrCodeUi5 = oQrCodeService.getQrCodeControl(target, isURL);
			oQrCodeUi5.oControl.placeAt("ui5_content");
			setTimeout(function() {
				expect(oQrCodeUi5).to.not.equal(null);
				expect(oQrCodeUi5.oControl).to.not.equal(null);
				expect(oQrCodeUi5.oControl.$().length).to.equal(1);
				var oContainer = oQrCodeUi5.oControl.$().find("#qr-code");
				expect(oContainer.length).to.equal(1);
				var oCanvas = oContainer.find("canvas");
				expect(oCanvas.length).to.equal(1);
				if (checkLocalHostWarning) {
					expect(oQrCodeUi5.oControl.$().find("#localhost-warning").length).to.equal(1);
				}
				done();
			}, 250);
		};

		before(function() {
			var loadWebIdePromise = STF.startWebIde(suiteName, {
				config: "runner/service/qrcode/config.json"
			});
			return loadWebIdePromise.then(function(oWebIdeWindow) {
				$ = oWebIdeWindow.$;
				return STF.require(suiteName, ["sap/watt/platform/plugin/qrcode/service/QrCodeImpl"]).spread(function(qrCode) {
					sandbox = sinon.sandbox.create();
					oQrCodeService = qrCode;
					var div = oWebIdeWindow.window.document.createElement('div');
					div.id = 'ui5_content';
					oWebIdeWindow.window.document.body.appendChild(div);
				});
			});
		});

		after(function(done) {
			STF.shutdownWebIde(suiteName);
			done();
		});

		afterEach(function() {
			sandbox.restore();
		});

		it("Test Absolute URL - jQuery", function() {
			var target = window.location.origin + "../../../../qunit/plugin/qrcode/testdata/index.html";
			jQueryTest(target, true, target);
		});

		it("Test Root Relative URL - jQuery", function() {
			var target = "../../../../qunit/plugin/qrcode/testdata/index.html";
			var origin = window.location.origin;
			var expected = origin + target;
			jQueryTest(target, true, expected);
		});

		it("Test Relative URL - jQuery", function() {
			var target = "testdata/index.html";

			var origin = window.location.origin;
			var path = window.location.pathname;
			path = path.substring(0, path.lastIndexOf("/"));
			var expected = origin + path + "/" + target;
			jQueryTest(target, true, expected);
		});

		it("Test LocalHost Warning - jQuery", function() {
			var target = "http://localhost/watt-tests/qunit/plugin/qrcode/testdata/index.html";
			jQueryTest(target, true, target);
		});

		it("Test Non URL Number - jQuery", function() {
			var target = "123456";
			jQueryTest(target, false, target);
		});

		it("Test Non URL AlphaNumeric - jQuery", function() {
			var target = "abcde12345";
			jQueryTest(target, false, target);
		});

		it("Test Absolute URL - UI5 Control", function(done) {
			var target = require.toUrl("../test-resources/sap/watt/sane-tests/runner/service/qunit/testData/index.html");
			ui5ControlTest(done, target, true, target);
		});

		it("Test Root Relative URL - UI5 Control", function(done) {
			var target = "../test-resources/sap/watt/sane-tests/runner/service/qunit/testData/index.html";
			var expected = require.toUrl("../test-resources/sap/watt/sane-tests/runner/service/qunit/testData/index.html");
			ui5ControlTest(done,target, true, expected);
		});

		it("Test Relative URL - UI5 Control", function(done) {
			var target = "testdata/index.html";
			var origin = window.location.origin;
			var path = window.location.pathname;
			path = path.substring(0, path.lastIndexOf("/"));
			var expected = origin + path + "/" + target;
			ui5ControlTest(done,target, true, expected);
		});

		it("Test LocalHost Warning - jQuery", function(done) {
			var target = "http://localhost/watt-tests/qunit/plugin/qrcode/testdata/index.html";
			ui5ControlTest(done,target, true, target, true);
		});

		it("Test Non URL Number - UI5 Control", function(done) {
			var target = "123456";
			ui5ControlTest(done,target, false, target);
		});

		it("Test Non URL AlphaNumeric - UI5 Control", function(done) {
			var target = "abcde12345";
			ui5ControlTest(done,target, false, target);
		});

	});
});