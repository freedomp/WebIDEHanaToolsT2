//  The SaneTestFramework should be imported via 'STF' path.
define(['STF',
		"sap/watt/core/q", "sane-tests/util/RepositoryBrowserUtil",
		"sap/watt/saptoolsets/fiori/project/plugin/fioriexttemplate/extendcontrollercomponent/ExtendControllerComponent", "sap/watt/lib/jszip/jszip-shim"],
	function (STF, coreQ, repositoryBrowserUtil, extendControllerComponent, JSZip) {

		"use strict";

		var controllerWithDefineCode = null;
		var controllerWithoutDefineCode = null;

		var extendedControllerWithDefineCode = null;
		var extendedControllerWithoutDefineCode = null;

		var sPathToZip = "sap/watt/saptoolsets/fiori/project/plugin/fioriexttemplate/extendcontrollercomponent/ExtendControllerTemplate.zip";
		var sZipURL = require.toUrl(sPathToZip);
		var oTestResourcesZip = null;

		describe('Custom Controller Extension', function () {

			before(function (done) {
				var sRelativeUrl = "../test-resources/sap/watt/sane-tests/extensibility/AddExtension/ExtendControllerResources.zip";
				var sUrl = require.toUrl(sRelativeUrl);
				coreQ.sap.ajax(sUrl, {
					responseType: "arraybuffer"
				}).then(function (ajaxRes) {
					oTestResourcesZip = new JSZip(ajaxRes[0]);

					controllerWithDefineCode = oTestResourcesZip.file("defineController/defineController.js").asText();
					controllerWithDefineCode = controllerWithDefineCode.replace(/\r\n/g, "\n");

					extendedControllerWithDefineCode = oTestResourcesZip.file("defineController/extendedDefineController.js").asText();
					extendedControllerWithDefineCode = extendedControllerWithDefineCode.replace(/\r\n/g, "\n");

					controllerWithoutDefineCode = oTestResourcesZip.file("standardController/standardController.js").asText();
					controllerWithoutDefineCode = controllerWithoutDefineCode.replace(/\r\n/g, "\n");

					extendedControllerWithoutDefineCode = oTestResourcesZip.file("standardController/extendedStandardController.js").asText();
					extendedControllerWithoutDefineCode = extendedControllerWithoutDefineCode.replace(/\r\n/g, "\n");
					done();
				});
			});

			it("Copy of parent controller (with define syntax)", function (done) {
				var extensionNamespace = "nw.epm.refapps.ext.po.apv.nw.epm.refapps.ext.po.apvExtension";

				var that = this;
				coreQ.sap.ajax(sZipURL, {
					responseType: "arraybuffer"
				}).then(function (ajaxRes) {
					that.oZip = new JSZip(ajaxRes[0]);
					var sModel = oTestResourcesZip.file("defineController/defineControllerCopyModel.json").asText();
					that.model = JSON.parse(sModel);
					var oDocument = {
						content: controllerWithDefineCode,
						getContent: function () {
							return coreQ(this.content);
						}
					};
					var oContext = {};
					oContext.service = {};
					oContext.service.extensionproject = {
						getExtensionRevision: function (oModel) {
							return coreQ(0);
						}
					};

					return extendControllerComponent.onBeforeProcessDocument(oDocument, extensionNamespace, that.oZip, that.model, oContext).then(function () {
						expect(that.model.fiori.extendController.parentControllerContent).to.equal(extendedControllerWithDefineCode);
						done();
					});
				});
			});

			it("Copy of parent controller (without define syntax)", function (done) {
				var extensionNamespace = "nw.epm.refapps.ext.prod.manage.nw.epm.refapps.ext.prod.manageExtension";

				var that = this;
				coreQ.sap.ajax(sZipURL, {
					responseType: "arraybuffer"
				}).then(function (ajaxRes) {
					that.oZip = new JSZip(ajaxRes[0]);
					var sModel = oTestResourcesZip.file("standardController/standardControllerCopyModel.json").asText();
					that.model = JSON.parse(sModel);
					var oDocument = {
						content: controllerWithoutDefineCode,
						getContent: function () {
							return coreQ(this.content);
						}
					};
					var oContext = {};
					oContext.service = {};
					oContext.service.extensionproject = {
						getExtensionRevision: function (oModel) {
							return coreQ(0);
						}
					};

					return extendControllerComponent.onBeforeProcessDocument(oDocument, extensionNamespace, that.oZip, that.model, oContext).then(function () {
						expect(that.model.fiori.extendController.parentControllerContent).to.equal(extendedControllerWithoutDefineCode);
						done();
					});
				});
			});


			it("Empty controller (with define syntax)", function (done) {
				var extensionNamespace = "nw.epm.refapps.ext.po.apv.nw.epm.refapps.ext.po.apvExtension";

				var that = this;
				return coreQ.sap.ajax(sZipURL, {
					responseType: "arraybuffer"
				}).then(function (ajaxRes) {
					that.oZip = new JSZip(ajaxRes[0]);
					var sModel = oTestResourcesZip.file("defineController/defineControllerEmptyModel.json").asText();
					that.model = JSON.parse(sModel);
					var oDocument = {
						content: controllerWithDefineCode,
						getContent: function () {
							return coreQ(this.content);
						}
					};
					var oContext = {};
					oContext.service = {};
					oContext.service.extensionproject = {
						getExtensionRevision: function (oModel) {
							return coreQ(0);
						}
					};

					return extendControllerComponent.onBeforeProcessDocument(oDocument, extensionNamespace, that.oZip, that.model, oContext).then(function () {
						var sMethods = oTestResourcesZip.file("defineController/defineControllerMethodHeaders.json").asText();
						var methodHeaders = JSON.parse(sMethods);
						expect(that.model.fiori.extendController.parentMethodHeaders).to.deep.equal(methodHeaders);
						done();
					});
				});
			});

			it("Empty controller (without define syntax)", function (done) {
				var extensionNamespace = "nw.epm.refapps.ext.prod.manage.nw.epm.refapps.ext.prod.manageExtension";

				var that = this;
				return coreQ.sap.ajax(sZipURL, {
					responseType: "arraybuffer"
				}).then(function (ajaxRes) {
					that.oZip = new JSZip(ajaxRes[0]);
					var sModel = oTestResourcesZip.file("standardController/standardControllerEmptyModel.json").asText();
					that.model = JSON.parse(sModel);
					var oDocument = {
						content: controllerWithoutDefineCode,
						getContent: function () {
							return coreQ(this.content);
						}
					};
					var oContext = {};
					oContext.service = {};
					oContext.service.extensionproject = {
						getExtensionRevision: function (oModel) {
							return coreQ(0);
						}
					};

					return extendControllerComponent.onBeforeProcessDocument(oDocument, extensionNamespace, that.oZip, that.model, oContext).then(function () {
						var sMethods = oTestResourcesZip.file("standardController/standardControllerMethodHeaders.json").asText();
						var methodHeaders = JSON.parse(sMethods);
						expect(that.model.fiori.extendController.parentMethodHeaders).to.deep.equal(methodHeaders);
						done();
					});
				});
			});
		});
	});
