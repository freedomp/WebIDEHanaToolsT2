define(["STF", "sinon"], function(STF, sinon) {
	"use strict";

	var sandbox;
	var suiteName = "chooseFile";

	describe("Choose File Step Content", function() {
		var jQuery;
		var oEsprimaParser;
		var oChooseFileUtil;

		function getFileAsString(sFileName) {
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
				return STF.require(suiteName, ["sap/watt/saptoolsets/fiori/project/plugin/qunit/util/ChooseFileUtil"]).spread(function(
					chooseFileUtil) {
					sandbox = sinon.sandbox.create();
					jQuery = webIdeWindowObj.jQuery;
					oEsprimaParser = STF.getService(suiteName, "esprimaParser");
					oChooseFileUtil = chooseFileUtil;
				});

			});
		});

		after(function() {
			STF.shutdownWebIde(suiteName);
		});

		afterEach(function() {
			sandbox.restore();
		});

		it("Test function getFileData",
			function() {
				var sFileContent = getFileAsString("ChooseFile.js");
				return oChooseFileUtil.getFileData(sFileContent, oEsprimaParser).then(function(aFuncList) {
					var iLength = aFuncList.length;
					expect(iLength).to.equal(4);
					var sObjectName = aFuncList[1].objectName;
					expect(sObjectName).to.not.equal(null);
					var sFunctionName = aFuncList[3].functionName;
					expect(sFunctionName).to.not.equal(null);
				});
			});

		it("Test function updateWizardModel",
			function() {
				var aTableFuncList = [{
					"objectName": null,
					"functionName": "anonymus",
					"selected": true,
					"aFunctionParameters": []
				}, {
					"objectName": "myFiori.view.Master",
					"functionName": "handleSearch",
					"selected": true,
					"aFunctionParameters": []
				}, {
					"objectName": "myFiori.view.Master",
					"functionName": "handleSelect",
					"selected": true,
					"aFunctionParameters": [{
						"paramerName": "oEvent",
						"defaultValue": ""
					}]
				}];
				var oQunitData = oChooseFileUtil.updateWizardModel(aTableFuncList);
				var iFuncNum = oQunitData.aFunctionsList.length;
				expect(iFuncNum).to.equal(1);
				var iObjectsNum = oQunitData.aObjectList.length;
				expect(iObjectsNum).to.equal(1);
				var iObjfunction = oQunitData.aObjectList[0].aFunctionsList.length;
				expect(iObjfunction).to.equal(2);
			});

	});
});