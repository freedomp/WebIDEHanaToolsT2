define(["STF", "sinon"], function(STF, sinon) {
	"use strict";

	var sandbox;
	var suiteName = "esprima";

	describe("Qunit Esprima Parser", function() {
		var jQuery;
		var oEsprimaParser;

		function getFileAsString(sFileName) {
			//var sURL = new URI(".").absoluteTo(document.baseURI).path() + "service/qunit/testData/" + sFileName;
			var sURL = require.toUrl("../test-resources/sap/watt/sane-tests/runner/service/qunit/testData/" + sFileName);

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
				config: "runner/service/qunit/config.json"
			});
			return loadWebIdePromise.then(function(webIdeWindowObj) {
				sandbox = sinon.sandbox.create();
				jQuery = webIdeWindowObj.jQuery;
				oEsprimaParser = STF.getService(suiteName, "esprimaParser");
			});
		});

		after(function() {
			STF.shutdownWebIde(suiteName);
		});

		afterEach(function() {
			sandbox.restore();
		});

		it("Test empty pattern",
			function() {
				var sContent = getFileAsString("empty.js");
				return oEsprimaParser.parse(sContent).then(function(oParsedContent) {
					expect(oParsedContent).to.not.equal(null);
					var aFunctionsList = oParsedContent.getFunctions();
					expect(aFunctionsList.length).to.equal(0);
					var aObjectList = oParsedContent.getObjects();
					expect(aObjectList.length).to.equal(0);
				});
			});

		it("Test Controller pattern", function() {
			var sContent = getFileAsString("controllerPattern.js");
			return oEsprimaParser.parse(sContent).then(function(oParsedContent) {
				expect(oParsedContent).to.not.equal(null);
				var aFunctionsList = oParsedContent.getFunctions();
				expect(aFunctionsList.length).to.equal(1);
				var aObjectList = oParsedContent.getObjects();
				expect(aObjectList.length).to.equal(1);
				var sObjectName = aObjectList[0].objectName;
				var aFunctionsinObject = aObjectList[0].getFunctions();
				expect(aFunctionsinObject.length).to.equal(2);
				expect(sObjectName).to.equal("myFiori.view.Master");
			});
		});

		it("Test Model pattern", function() {
			var sContent = getFileAsString("modelPattern.js");
			return oEsprimaParser.parse(sContent).then(function(oParsedContent) {
				expect(oParsedContent).to.not.equal(null);
				var aFunctionsList = oParsedContent.getFunctions();
				expect(aFunctionsList.length).to.equal(0);
				var aObjectList = oParsedContent.getObjects();
				expect(aObjectList.length).to.equal(1);
				var aFunctionsinObject = aObjectList[0].getFunctions();
				expect(aFunctionsinObject.length).to.equal(8);
				var sObjectName = aObjectList[0].objectName;
				expect(sObjectName).to.equal("cus.sd.sofulfil.monitor.model.IN02_Model");
			});
		});

		it("Test HelperFile1 pattern", function() {
			var sContent = getFileAsString("helperPattern.js");
			return oEsprimaParser.parse(sContent).then(function(oParsedContent) {
				expect(oParsedContent).to.not.equal(null);
				var aFunctionsList = oParsedContent.getFunctions();
				expect(aFunctionsList.length).to.equal(1);
				var sFunctionName = aFunctionsList[0].functionName;
				expect(sFunctionName).to.equal("cus.sd.sofulfil.monitor.model.SOModelHelper");
				var aObjectList = oParsedContent.getObjects();
				expect(aObjectList.length).to.equal(1);
				var aFunctionsinObject = aObjectList[0].getFunctions();
				expect(aFunctionsinObject.length).to.equal(19);
				var sObjectName = aObjectList[0].objectName;
				expect(sObjectName).to.equal("cus.sd.sofulfil.monitor.model.SOModelHelper.prototype");
			});
		});

		it("Test HelperFile2 pattern", function() {
			var sContent = getFileAsString("helperPattern2.js");
			return oEsprimaParser.parse(sContent).then(function(oParsedContent) {
				expect(oParsedContent).to.not.equal(null);
				var aFunctionsList = oParsedContent.getFunctions();
				expect(aFunctionsList.length).to.equal(3);
				var sFunctionName = aFunctionsList[0].functionName;
				expect(sFunctionName).to.equal("cus.sd.sofulfil.monitor.utils.Commons.Utils.resetFooterContentRightWidth");
				var aObjectList = oParsedContent.getObjects();
				expect(aObjectList.length).to.equal(1);
				var aFunctionsinObject = aObjectList[0].getFunctions();
				expect(aFunctionsinObject.length).to.equal(1);
				var sObjectName = aObjectList[0].objectName;
				expect(sObjectName).to.equal("cus.sd.sofulfil.monitor.utils.Commons");
			});
		});

		it("Test Wrapper File pattern", function() {
			var sContent = getFileAsString("wrapperPattern.js");
			return oEsprimaParser.parse(sContent).then(function(oParsedContent) {
				expect(oParsedContent).to.not.equal(null);
				var aFunctionsList = oParsedContent.getFunctions();
				expect(aFunctionsList.length).to.equal(2);
				expect(aFunctionsList[0].functionName).to.equal("method1");
				expect(aFunctionsList[1].functionName).to.equal("method2");
			});
		});
	});
});