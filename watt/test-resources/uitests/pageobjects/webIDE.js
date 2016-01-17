sap.ui.define(["sap/ui/test/Opa5",
				"sap/ui/test/opaQunit",
				"uitests/pageobjects/webIDEBase",
				"sap/ui/test/matchers/Selector",
				"uitests/pageobjects/preferencesMock"
				],
	function(Opa5,
		opaQunit,
		WebIDEBase,
		Selector,
		oPrefsMock) {

		"use strict";

		return Opa5.createPageObjects({

			theWebIDE: {
				baseClass: WebIDEBase,

				actions: {
					isStarted: function(iTimeout) {
						this.waitFor({
							success: function() {

								// this is necessary when IDE is restarted, that the consumer can be injected once again!
								this.getContext()._projectConsumerPomise = null;

								var oWebIDEPageUri = URI("../index.html" + window.location.search);

								this.iStartMyAppInAFrame(oWebIDEPageUri.toString());

								var oFrame = $("#OpaFrame");
								oFrame.on("load", function() {

									var oFrameContentWindow = oFrame[0].contentWindow;

									oFrameContentWindow._startCallback = function() {
										oPrefsMock.installMockServerIntoWindow(oFrameContentWindow);
									};
								});
							},
							errorMessage: "WebIDE Frame didn't finish loading",
							timeout: iTimeout || 10
						});

						return this.waitFor({
							check: function() {
								var oLoadingAnimation = sap.ui.test.Opa5.getJQuery()("#loading");
								var bHidden = oLoadingAnimation.is(":hidden");
								return bHidden;
							},
							success: function() {
								//log screen size to evaluate browser behavior on headless build server
								console.log("OPAFrameWidth Test Document.Body: " + JSON.stringify(document.body.getClientRects()[0]));
								console.log("OPAFrameWidth OpaFrame: " + JSON.stringify($("#OpaFrame")[0].getClientRects()[0]));
								console.log("OPAFrameWidth Screen: " + JSON.stringify(screen));
								console.log("OPAFrameWidth Test Window.body width/heigth: " + window.getComputedStyle(document.body).width + "*" + window.getComputedStyle(
									document.body).height);
								var oCssRules = window.getMatchedCSSRules($("#OpaFrame")[0]);
								for (var i = 0; i < oCssRules.length; i++) {
									var oCssRule = oCssRules[i];
									console.log("OPAFrameWidth Frame Matched Rules: " + oCssRule.cssText);
								}
							},
							errorMessage: "WebIDE didn't finish loading",
							timeout: iTimeout || 90
						});
					},

					isRestarted: function() {
						this.iTeardownMyAppFrame();
						return this.isStarted();
					},

					iHaveAProject: function(sTemplate, sName) {
						if (!sName) {
							sName = sTemplate;
						}

						this.iCleanUpMyProject(sName);
						return this.waitForExec(function() {
							var oRoot;
							return this._getProjectConsumer().then(function(createProjectConsumer) {
								return createProjectConsumer[0]._oContext.service.filesystem.documentProvider.getRoot().then(function(_oRoot) {
									oRoot = _oRoot;
									return oRoot.getFolderContent();
								}).then(function() {
									var sURL = require.toUrl("uitests/projects/" + sTemplate + ".zip");
									return Q.all([oRoot.createFolder(sName),
											   Q.sap.ajax(sURL, {
											responseType: "blob"
										})]);
								}).spread(function(oFolder, oZip) {
									return oFolder.importZip(oZip[0]);
								}).fail(function(oError) {
									ok(false, "An error occoured when importing Project ZIP");
									console.log(oError);
								});
							});
						}, "Timeout injecting consumer");
					},

					iCleanUpMyProject: function(sProjectName) {
						return this.waitForExec(function() {
							var oRoot;
							return this._getProjectConsumer().then(function(createProjectConsumer) {
								return createProjectConsumer[0]._oContext.service.filesystem.documentProvider.getRoot().then(function(_oRoot) {
									oRoot = _oRoot;
									return oRoot.getFolderContent();
								}).then(function(mContent) {
									//Delete an existing project with same name
									for (var index in mContent) {
										if (mContent[index].getEntity().getName() === sProjectName) {
											return mContent[index]["delete"]();
										}
									}
								});
							});
						}, "Timeout injecting consumer");
					},

					// TODO: Remove this! Workaround until Core will fix the File->New
					// bug when nothing is selected in the repository browser
					menuItemIssueWorkaround: function(Given, When) {
						When.inTheMenuBar.iOpenDevelopment();
						Given.theWebIDE.iHaveAProject("ClaimsApp2");
						Given.inTheRepositoryBrowser.iSelectNode("ClaimsApp2");
					},

					_getProjectConsumer: function() {
						if (!this.getContext()._projectConsumerPomise) {
							var oFrameWindow = Opa5.getWindow();
							this.getContext()._projectConsumerPomise = oFrameWindow.Q.sap.require("sap/watt/core/PluginRegistry").then(function(oRegistry) {
								var mConsumer = {
									"name": "createProjectConsumer",

									"requires": {
										"services": [
											"filesystem.documentProvider"
										]
									}
								};

								return oRegistry.register([mConsumer]);
							});
						}
						return this.getContext()._projectConsumerPomise;
					},

					iCreateAServiceMethodStub: function(sServiceName, sMethodName, stub) {
						return this.waitForExec(function() {
							return Opa5.getWindow().Q.sap.require("sap/watt/core/PluginRegistry").then(function(oRegistry) {
								var oService = oRegistry.$getServiceRegistry()._mRegistry[sServiceName];
								sinon.stub(oService, sMethodName, stub);
							});
						}, "Error in stub");
					},

					iRemoveAServiceMethodStub: function(sServiceName, sMethodName) {
						return this.waitForExec(function() {
							return Opa5.getWindow().Q.sap.require("sap/watt/core/PluginRegistry").then(function(oRegistry) {
								var oService = oRegistry.$getServiceRegistry()._mRegistry[sServiceName];
								oService[sMethodName].restore();
							});
						}, "Error in stub");
					}
				}
			}
		});

	});