define(["STF"] , function(STF) {

	"use strict";

	var suiteName = "FioriRefAppTempValidator_Integration",  getService = STF.getServicePartial(suiteName);
	describe(suiteName, function () {
		var oFakeFileDAO, oRefTemplateValidator;

		before(function () {
			return STF.startWebIde(suiteName, {config : "template/config.json"})
				.then(function () {
					oFakeFileDAO = getService('fakeFileDAO');
					oRefTemplateValidator = getService('reftemplatevalidator');
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});

		it("Reference Template Validator - non exists project", function() {
			var oFileStructure = {
				"otherProject" : {
					"index.html" : "some content"
				}
			};
			var oTemplate = {
				getAdditionalData : function(){
					return {"projectName" : "nw.epm.refapps.ext.po.apv"};
				}
			};
			return oFakeFileDAO.setContent(oFileStructure).then(function() {
				return oRefTemplateValidator.validate(oTemplate).then(function(bResult) {
					assert.ok(bResult, "Reference template validation should succeed when reference project not exists");
				});
			});
		});

		it("Reference Template Validator - exists project", function() {
			var oFileStructure = {
				"nw.epm.refapps.ext.po.apv" : {
					"index.html" : "some content"
				}
			};
			var oTemplate = {
				getAdditionalData : function(){
					return {"projectName" : "nw.epm.refapps.ext.po.apv"};
				}
			};
			return oFakeFileDAO.setContent(oFileStructure).then(function() {
				return oRefTemplateValidator.validate(oTemplate).then(function(bResult) {
					assert.ok(false, "Reference template validation should fail when reference project exists");
				}).fail(function(oError){
					assert.ok(oError.message !== undefined, "Reference template validation should fail when reference project exists");
				});
			});
		});

		it("Reference Template Validator - no additional data", function() {
			var oFileStructure = {
				"nw.epm.refapps.ext.po.apv" : {
					"index.html" : "some content"
				}
			};
			var oTemplate = {
				getAdditionalData : function(){
					return undefined;
				}
			};
			return oFakeFileDAO.setContent(oFileStructure).then(function() {
				return oRefTemplateValidator.validate(oTemplate).then(function(bResult) {
					assert.ok(bResult, "Reference template validation should succeed when no additional data (default project name should be used)");
				});
			});
		});

		it("Reference Template Validator - no project name", function() {
			var oFileStructure = {
				"nw.epm.refapps.ext.po.apv" : {
					"index.html" : "some content"
				}
			};
			var oTemplate = {
				getAdditionalData : function(){
					return {};
				}
			};
			return oFakeFileDAO.setContent(oFileStructure).then(function() {
				return oRefTemplateValidator.validate(oTemplate).then(function(bResult) {
					assert.ok(bResult, "Reference template validation should succeed when no project name (default name should be used)");
				});
			});
		});

	});
});
