define(["STF", "sinon"], function(STF, sinon) {
	"use strict";

	var sandbox;
	var suiteName = "ushellsandbox";
	
	describe("Ushell Sandbox", function() {
		var oRunInSandboxCommand;
		var oPreviewService;
		var oI18nBundle;
		var sOriginalServerType;
		var URI;
		var jQuery;

		function DocumentStub(sEntityName, sDocumentType) {

			this.getEntity = function() {
				return {
					getName: function() {
						return sEntityName;
					}
				};
			};

			this.getType = function() {
				return sDocumentType;
			};
		}

		function checkHostAndPort(oURI) {
			var sPort = oURI.port();
			var sHostPort = oURI.hostname() + (sPort ? ":" + sPort : "");
			expect(sHostPort).to.equal(sHostPort);
		}

		function givenRunningOnHCProxy(fFunc) {
			oPreviewService._sServerType = "hcproxy";
			var oPreviewUrlOld = oPreviewService._sPreviewUrl;
			oPreviewService._sPreviewUrl = "/";

			try {
				fFunc();
			} finally {
				oPreviewService._sPreviewUrl = oPreviewUrlOld;
			}
		}

		function givenRunningOnLocalHCProxy(fFunc) {
			oPreviewService._sServerType = "local_hcproxy";
			var oPreviewUrlOld = oPreviewService._sPreviewUrl;
			oPreviewService._sPreviewUrl = "/rdepreview/";

			try {
				fFunc();
			} finally {
				oPreviewService._sPreviewUrl = oPreviewUrlOld;
			}
		}
		before(function() {
			var loadWebIdePromise = STF.startWebIde(suiteName, {
				config: "runner/service/ushellsandbox/config.json"
			});
			return loadWebIdePromise.then(function(oWebIdeWindow) {
				URI = oWebIdeWindow.URI;
				jQuery = oWebIdeWindow.jQuery;
				return STF.require(suiteName, ["sap/watt/saptoolsets/fiori/run/plugin/ushellsandbox/command/RunInSandbox",
						"sap/watt/saptoolsets/fiori/run/plugin/ushellsandbox/service/PreviewImpl", "sap/watt/core/I18nBundle"
					])
					.spread(function(runInSandboxCommand, previewService, i18nBundle) {
						sandbox = sinon.sandbox.create();
						oRunInSandboxCommand = runInSandboxCommand;
						oPreviewService = previewService;
						oI18nBundle = i18nBundle;
					});
			});
		});

		afterEach(function() {
			sandbox.restore();
		});

		after(function() {
			STF.shutdownWebIde(suiteName);
		});

		describe("Ushell Sandbox 1", function() {
			before(function() {
				sOriginalServerType = oRunInSandboxCommand._sServerType;
			});
			after(function() {
				oPreviewService.oRunInSandboxCommand = sOriginalServerType;
			});

			it("is available for server type java", function() {
				oRunInSandboxCommand._sServerType = "java";
				expect(oRunInSandboxCommand.isAvailable()).to.equal(true);
			});

			it("is available for server type hcproxy", function() {
				oRunInSandboxCommand._sServerType = "hcproxy";
				expect(oRunInSandboxCommand.isAvailable()).to.equal(true);
			});

			it("is not available for server type other", function() {
				oRunInSandboxCommand._sServerType = "other";
				expect(oRunInSandboxCommand.isAvailable()).to.equal(false);
			});

			it("_isExecutable false for undefined selection", function() {
				expect(oRunInSandboxCommand._isExecutable(undefined)).to.equal(false);
			});

			it("_isExecutable false for selection without document", function() {
				expect(oRunInSandboxCommand._isExecutable()).to.equal(false);
			});

			it("_isExecutable false for Component.js folders", function() {
				expect(oRunInSandboxCommand._isExecutable({
					document: new DocumentStub("Component.js", "folder")
				})).to.equal(false);
			});

			it("_isExecutable false for some.html files", function() {
				expect(oRunInSandboxCommand._isExecutable({
					document: new DocumentStub("some.html", "file")
				})).to.equal(false);
			});

			it("_isExecutable true for Component.js files", function() {
				expect(oRunInSandboxCommand._isExecutable({
					document: new DocumentStub("Component.js", "file")
				})).to.equal(true);
			});

			it("_isExecutable true for arbitrary fioriSandboxConfig.json files", function() {
				expect(oRunInSandboxCommand._isExecutable({
					document: new DocumentStub("ArbitraryFioriSandboxConfigWithSuffix.json", "file")
				})).to.equal(true);
			});
		});
		describe("Ushell Sandbox 2", function() {
			before(function() {
				sOriginalServerType = oPreviewService._sServerType;
				oPreviewService.context = {
					i18n: new oI18nBundle("sap.watt.saptoolsets.fiori.run.ushellsandbox/i18n/i18n")
				};
			});
			after(function() {
				oPreviewService._sServerType = sOriginalServerType;
				delete oPreviewService.context;
			});

			it("_getComponentName - test new Fiori template", function() {
				var sExpectedComponent = 'samples.components.helloworld',
					sComponentSrc =
					'jQuery.sap.require("sap.ui.core.UIComponent"); \
					 jQuery.sap.declare("samples.components.helloworld.Component"); \
					 sap.ui.core.UIComponent.extend("samples.components.helloworld.Component", { }); \
					 samples.components.helloworld.Component.prototype.createContent = function(){ \
					   return new sap.m.Text({ \
					       text: "Hello World" \
					   }); \
					 };';
				expect(sExpectedComponent).to.equal(oPreviewService._getComponentName(sComponentSrc));
			});

			it("_getComponentName - test old Fiori template", function() {
				var sExpectedComponent = 'samples.components.helloworld',
					sComponentSrc =
					'jQuery.sap.require("sap.ui.core.UIComponent"); \
					 sap.ui.core.UIComponent.extend("samples.components.helloworld.Component", { }); \
					 samples.components.helloworld.Component.prototype.createContent = function(){ \
					   return new sap.m.Text({ \
					       text: "Hello World" \
					   }); \
					 };';
				expect(sExpectedComponent).to.equal(oPreviewService._getComponentName(sComponentSrc));
			});

			it("_getComponentName: test invalid source", function() {
				var sExpectedComponent = 'samples.components.helloworld',
					sComponentSrc =
					'jQuery.sap.require("sap.ui.core.UIComponent"); \
					 samples.components.helloworld.Component.prototype.createContent = function(){ \
					   return new sap.m.Text({ \
					       text: "Hello World" \
					   }); \
					 };';

				assert.throws(function() {
						oPreviewService._getComponentName(sComponentSrc, "dummy/path/to/Component.js");
					},
					'previewImpl_undeclaredComponent');
			});

			it("_getSandboxUrl for Component.js - serverType java", function() {
				var sActualSandboxUrl;
				var oActualSandboxURI;
				oPreviewService._sServerType = "java";

				sActualSandboxUrl = oPreviewService._getSandboxUrlForComponent("/unittest/executeUrl/Component.js", "samples.components.helloworld");
				expect(sActualSandboxUrl).to.not.equal(undefined);
				oActualSandboxURI = new URI(sActualSandboxUrl);
				expect(oActualSandboxURI.protocol()).to.equal(window.location.protocol.replace(":", ""));
				expect(oActualSandboxURI.host()).to.equal(window.location.host);
				expect(oActualSandboxURI.path()).to.equal("/sapui5-sdk-dist/test-resources/sap/ushell/shells/sandbox/fioriSandbox.html");
				expect(oActualSandboxURI.query()).to.equal(
					"sap-ushell-test-url-url=%2Funittest%2FexecuteUrl&sap-ushell-test-url-additionalInformation=SAPUI5.Component%3Dsamples.components.helloworld",
					"query equal");
				expect(oActualSandboxURI.fragment()).to.equal("Test-url");
			});

			it("_getSandboxUrl for Component.js - serverType hcproxy", function() {
				var sActualSandboxUrl;
				var oActualSandboxURI;
				givenRunningOnHCProxy(function() {
					sActualSandboxUrl = oPreviewService._getSandboxUrlForComponent(
						"https://watt-test:8888/unittest/executeUrl/Component.js?with-query=abc", "samples.components.helloworld");
					expect(sActualSandboxUrl).to.not.equal(undefined);
					oActualSandboxURI = new URI(sActualSandboxUrl);
					expect(oActualSandboxURI.protocol()).to.equal("https");
					checkHostAndPort(oActualSandboxURI, "watt-test:8888");
					expect(oActualSandboxURI.path()).to.equal("/test-resources/sap/ushell/shells/sandbox/fioriSandbox.html");
					expect(oActualSandboxURI.query()).to.equal(
						"with-query=abc&sap-ushell-test-url-url=..%2F..%2F..%2F..%2F..%2Funittest%2FexecuteUrl&sap-ushell-test-url-additionalInformation=SAPUI5.Component%3Dsamples.components.helloworld"
					);
					expect(oActualSandboxURI.fragment()).to.equal("Test-url");
				});
			});

			it("_getSandboxUri - serverType hcproxy", function() {
				var sActualSandboxUrl;
				var oActualSandboxURI;
				givenRunningOnHCProxy(function() {
					sActualSandboxUrl = oPreviewService._getSandboxUri("https://watt-test:8888/unittest/executeUrl/AnyThing?with-query=abc");
					expect(sActualSandboxUrl).to.not.equal(undefined);
					oActualSandboxURI = new URI(sActualSandboxUrl);
					expect(oActualSandboxURI.protocol()).to.equal("https");
					checkHostAndPort(oActualSandboxURI, "watt-test:8888");
					expect(oActualSandboxURI.path()).to.equal("/test-resources/sap/ushell/shells/sandbox/fioriSandbox.html");
					expect(oActualSandboxURI.query()).to.equal("with-query=abc");
					expect(oActualSandboxURI.fragment()).to.equal("");
				});
			});

			it("_getSandboxUri - serverType local hcproxy", function() {
				var sActualSandboxUrl;
				var oActualSandboxURI;
				givenRunningOnLocalHCProxy(function() {
					sActualSandboxUrl = oPreviewService._getSandboxUri("/rdepreview/unittest/executeUrl/AnyThing?with-query=abc");
					expect(sActualSandboxUrl).to.not.equal(undefined);
					oActualSandboxURI = new URI(sActualSandboxUrl);
					expect(oActualSandboxURI.protocol()).to.equal("");
					checkHostAndPort(oActualSandboxURI, "");
					expect(oActualSandboxURI.path()).to.equal("/rdepreview/test-resources/sap/ushell/shells/sandbox/fioriSandbox.html");
					expect(oActualSandboxURI.query()).to.equal("with-query=abc");
					expect(oActualSandboxURI.fragment()).to.equal("");
				});
			});

			it("_constructUrlForComponent - serverType hcproxy", function() {
				var sActualSandboxUrl;
				var oActualSandboxURI;
				var oURI = new URI(
					"https://watt-test:8888/unittest/executeUrl/test-resources/sap/ushell/shells/sandbox/fioriSandbox.html?this=that");
				givenRunningOnHCProxy(function() {
					sActualSandboxUrl = oPreviewService._constructUrlForComponent(oURI, "/my/sap/erp/mybsp?a=a%20b", "samples.components.helloworld");
					expect(sActualSandboxUrl).to.not.equal(undefined);
					oActualSandboxURI = new URI(sActualSandboxUrl);
					expect(oActualSandboxURI.protocol()).to.equal("https");
					checkHostAndPort(oActualSandboxURI, "watt-test:8888");
					expect(oActualSandboxURI.path()).to.equal("/unittest/executeUrl/test-resources/sap/ushell/shells/sandbox/fioriSandbox.html");
					expect(oActualSandboxURI.query()).to.equal(
						"this=that&sap-ushell-test-url-url=%2Fmy%2Fsap%2Ferp%2Fmybsp%3Fa%3Da%2520b&sap-ushell-test-url-additionalInformation=SAPUI5.Component%3Dsamples.components.helloworld"
					);
					expect(oActualSandboxURI.fragment()).to.equal("Test-url");
				});
			});

			it("_constructUrlForComponent - serverType localhcproxy", function() {
				var sActualSandboxUrl;
				var oActualSandboxURI;
				var oURI = new URI("/rdepreview/unittest/executeUrl/test-resources/sap/ushell/shells/sandbox/fioriSandbox.html?this=that");
				givenRunningOnLocalHCProxy(function() {
					sActualSandboxUrl = oPreviewService._constructUrlForComponent(oURI, "/my/sap/erp/mybsp?a=a%20b", "samples.components.helloworld");
					expect(sActualSandboxUrl).to.not.equal(undefined);
					oActualSandboxURI = new URI(sActualSandboxUrl);
					expect(oActualSandboxURI.protocol()).to.equal("");
					checkHostAndPort(oActualSandboxURI, "");
					expect(oActualSandboxURI.path()).to.equal(
						"/rdepreview/unittest/executeUrl/test-resources/sap/ushell/shells/sandbox/fioriSandbox.html");
					expect(oActualSandboxURI.query()).to.equal(
						"this=that&sap-ushell-test-url-url=%2Fmy%2Fsap%2Ferp%2Fmybsp%3Fa%3Da%2520b&sap-ushell-test-url-additionalInformation=SAPUI5.Component%3Dsamples.components.helloworld"
					);
					expect(oActualSandboxURI.fragment()).to.equal("Test-url");
				});
			});

			it("_getSandboxUrl for Component.js - serverType unknown", function() {
				oPreviewService._sServerType = "unknown";

				assert.throws(
					function() {
						oPreviewService._getSandboxUrlForComponent("https://watt-test:8888/unittest/executeUrl/anything?with-query=abc",
							"samples.components.helloworld");
					},
					"previewImpl_unsupportedServerType");
			});

			it("_getSandboxUrl for Component.js - undefined execute URL", function() {
				oPreviewService._sServerType = "java";

				assert.throws(
					function() {
						oPreviewService._getSandboxUrlForComponent(undefined, "samples.components.helloworld");
					},
					"previewImpl_undefinedUrl");
			});

			it("_getSandboxUrl for Component.js - empty component name", function() {
				oPreviewService._sServerType = "java";

				assert.throws(
					function() {
						oPreviewService._getSandboxUrlForComponent("/unittest/executeUrl/Component.js", "");
					},
					"previewImpl_undefinedComponent");
			});

			it("_getSandboxUrl for fiorisandboxconfig.json - serverType java", function() {
				var sActualSandboxUrl;
				var oActualSandboxURI;
				oPreviewService._sServerType = "java";

				sActualSandboxUrl = oPreviewService._getSandboxUrlForConfig("/unittest/executeUrl/fioriSandboxConfig.json");
				expect(sActualSandboxUrl).to.not.equal(undefined);
				oActualSandboxURI = new URI(sActualSandboxUrl);
				expect(oActualSandboxURI.protocol()).to.equal(window.location.protocol.replace(":", ""));
				expect(oActualSandboxURI.host()).to.equal(window.location.host);
				expect(oActualSandboxURI.path()).to.equal("/sapui5-sdk-dist/test-resources/sap/ushell/shells/sandbox/fioriSandbox.html");
				expect(oActualSandboxURI.query()).to.equal("sap-ushell-sandbox-config=%2Funittest%2FexecuteUrl%2FfioriSandboxConfig.json");
				expect(oActualSandboxURI.fragment()).to.equal("");
			});

			it("_getSandboxUrl for fiorisandboxconfig.json - serverType hcproxy", function() {
				var sActualSandboxUrl;
				var oActualSandboxURI;
				givenRunningOnHCProxy(function() {
					sActualSandboxUrl = oPreviewService._getSandboxUrlForConfig(
						"https://watt-test:8888/unittest/executeUrl/fioriSandboxConfig.json?with-query=abc");
					expect(sActualSandboxUrl).to.not.equal(undefined);
					oActualSandboxURI = new URI(sActualSandboxUrl);
					expect(oActualSandboxURI.protocol()).to.equal("https");
					expect(oActualSandboxURI.hostname()).to.equal("watt-test");
					expect(oActualSandboxURI.port()).to.equal("8888");
					expect(oActualSandboxURI.path()).to.equal("/test-resources/sap/ushell/shells/sandbox/fioriSandbox.html");
					expect(oActualSandboxURI.query()).to.equal(
						"with-query=abc&sap-ushell-sandbox-config=..%2F..%2F..%2F..%2F..%2Funittest%2FexecuteUrl%2FfioriSandboxConfig.json");
					expect(oActualSandboxURI.fragment()).to.equal("");
				});

			});

			it("_getSandboxUrl for fiorisandboxconfig.json - serverType local_hcproxy", function() {
				var sActualSandboxUrl;
				var oActualSandboxURI;
				givenRunningOnLocalHCProxy(function() {
					sActualSandboxUrl = oPreviewService._getSandboxUrlForConfig(
						"/rdepreview/unittest/executeUrl/fioriSandboxConfig.json?with-query=abc");
					expect(sActualSandboxUrl).to.not.equal(undefined);
					oActualSandboxURI = new URI(sActualSandboxUrl);
					expect(oActualSandboxURI.protocol()).to.equal("");
					expect(oActualSandboxURI.hostname()).to.equal("");
					expect(oActualSandboxURI.port()).to.equal("");
					expect(oActualSandboxURI.path()).to.equal("/rdepreview/test-resources/sap/ushell/shells/sandbox/fioriSandbox.html");
					expect(oActualSandboxURI.query()).to.equal(
						"with-query=abc&sap-ushell-sandbox-config=..%2F..%2F..%2F..%2F..%2Funittest%2FexecuteUrl%2FfioriSandboxConfig.json");
					expect(oActualSandboxURI.fragment()).to.equal("");
				});

			});

			it("_showPreview", function() {
				var sActualPreviewUrl;
				var oActualWindow;
				var bActualNoFrame;
				// set preview service spy
				var oStdPreviewSrvSpy = jQuery.sap.getObject("context.service.preview", 0, oPreviewService);
				oStdPreviewSrvSpy.showPreview = function(documentOrUrl, oWindow, bNoFrame) {
					sActualPreviewUrl = documentOrUrl;
					oActualWindow = oWindow;
					bActualNoFrame = bNoFrame;
				};

				oPreviewService._showPreview("http://unittest/preview/url", "fake-window", false);
				expect(sActualPreviewUrl).to.equal("http://unittest/preview/url");
				expect(oActualWindow).to.equal("fake-window");
				expect(bActualNoFrame).to.equal(false);
			});
		});
	});
});