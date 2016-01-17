define(['STF', "sinon", "sap/watt/platform/plugin/tipsandtricks/service/TipsAndTricksManager"], function(STF, sinon, TipsAndTricksManager) {
	describe("The TipsAndTricksManager", function() {

		describe("defines an init method", function() {
			it("includes the TipsAndTricksDialogStyles.css file", function() {
				if(sap.watt.includeCSS) {
					throw new Error("The test assumes that includeCSS is not defined. Now it is. Please correct the test");
				}
				sap.watt.includeCSS = function(sPath) {
					expect(sPath).to.contain("sap.watt.platform.tipsandtricks/css/TipsAndTricksDialogStyles.css");
				};

				TipsAndTricksManager.init();

				sap.watt.includeCSS = undefined;
			});
		});

		describe("defines openTipsAndTricksDialog", function() {

			describe("creates the UI of the dialog", function() {
				var suiteName = "sap/watt/platform/plugin/tipsandtricks/service/TipsAndTricksManager/defines openTipsAndTricksDialog/creates the UI of the dialog";
				var oDialog;

				before("start Web-IDE and init the service variable", function() {
					return STF.startWebIde(suiteName).then(function (_iFrameWindow) {
						return STF.getService(suiteName, "tipsandtricks").openTipsAndTricksDialog().then(function(_oDialog) {
							oDialog = _oDialog;
						});
					});
				});


				it("has a don't show checkbox", function() {
					expect(oDialog).to.be.ok;
					expect(oDialog.getButtons()).to.have.length(4);
					expect(oDialog.getButtons()[0]).to.be.ok;
					expect(oDialog.getButtons()[0].getMetadata().getName()).to.equal("sap.ui.commons.CheckBox");
					expect(oDialog.getButtons()[0].getText()).to.equal("Don't show on startup");
				});

				it("has a previous button", function() {
					expect(oDialog).to.be.ok;
					expect(oDialog.getButtons()).to.have.length(4);
					expect(oDialog.getButtons()[1]).to.be.ok;
					expect(oDialog.getButtons()[1].getMetadata().getName()).to.equal("sap.ui.commons.Button");
					expect(oDialog.getButtons()[1].getText()).to.equal("Previous");
				});

				it("has a next button", function() {
					expect(oDialog).to.be.ok;
					expect(oDialog.getButtons()).to.have.length(4);
					expect(oDialog.getButtons()[2]).to.be.ok;
					expect(oDialog.getButtons()[2].getMetadata().getName()).to.equal("sap.ui.commons.Button");
					expect(oDialog.getButtons()[2].getText()).to.equal("Next");
				});

				it("has a close button", function() {
					expect(oDialog).to.be.ok;
					expect(oDialog.getButtons()).to.have.length(4);
					expect(oDialog.getButtons()[3]).to.be.ok;
					expect(oDialog.getButtons()[3].getMetadata().getName()).to.equal("sap.ui.commons.Button");
					expect(oDialog.getButtons()[3].getText()).to.equal("Close");
				});

				after("shutdown Web-IDE", function() {
					STF.shutdownWebIde(suiteName);
				});

			});

			it("opens the tips and tricks dialog with content", function() {
				var suiteName = "sap/watt/platform/plugin/tipsandtricks/service/TipsAndTricksManager/defines openTipsAndTricksDialog/opens the tips and tricks dialog with content";

				var openWasCalled = false;

				return STF.startWebIde(suiteName).then(function (iFrame) {
					//Mock the Dialog open method
					var originalOpen = iFrame.sap.ui.commons.Dialog.prototype.open;
					iFrame.sap.ui.commons.Dialog.prototype.open = function() {
						openWasCalled = true;
						originalOpen.apply(this,arguments);
					};

					return STF.getService(suiteName, "tipsandtricks").openTipsAndTricksDialog();
				}).then(function() {
					expect(openWasCalled).to.be.true;
				}).finally(function() {
					//There is no need to restore the old open method since this iFrame will die soon
					STF.shutdownWebIde(suiteName);
				});
			});
		});

		describe("defines a configure method", function() {

			var sandbox;

			beforeEach(function() {
				sandbox = sinon.sandbox.create();
				sandbox.stub(window.console, "error");
				//The fact that the array is shuffeled before creating the list is irrelevant for the tests
				//therefore we override the _.shuffle function for these tests only
				sandbox.stub(_, "shuffle", function(collection) {
					return collection;
				});
			});

			afterEach(function() {
				sandbox.restore();
			});

			it("initializes the configs linked list", function() {
				var mConfig = {
					tips: [
						{
							id: 1,
							service: {
								isAvailable: function() {
									return Q(true);
								}
							}
						},
						{
							id: 2,
							service: {

							},
							available: true
						},
						{
							id: 3,
							service: {
								isAvailable: function() {
									return Q(true);
								}
							}
						}
					]
				};

				return TipsAndTricksManager.configure(mConfig).then(function() {
					var theList = TipsAndTricksManager._getConfigsList();

					expect(theList).not.to.be.null;
					expect(theList.getCurrent().data.id).to.be.at.least(1);
					expect(theList.getCurrent().data.id).to.be.at.most(3);
					expect(theList.next().data.id).to.be.at.least(1);
					expect(theList.getCurrent().data.id).to.be.at.most(3);
					expect(theList.next().data.id).to.be.at.least(1);
					expect(theList.getCurrent().data.id).to.be.at.most(3);
					//Validate that no duplicate id errors exist
					sinon.assert.notCalled(console.error);
				});
			});

			it("uses _filterInvalidTips to log errors to the console if the same tip ID exists more than once", function() {
				var mConfig = {
					tips: [
						{
							id: 1,
							service: {
								isAvailable: function() {
									return Q(true);
								}
							}
						},
						{
							id: 1,
							service: {
								isAvailable: function() {
									return Q(true);
								}
							}
						},
						{
							id: 1,
							service: {
								isAvailable: function() {
									return Q(true);
								}
							}
						},
						{
							id: 1,
							service: {
								isAvailable: function() {
									return Q(true);
								}
							}
						},
						{
							id: 2,
							service: {
								isAvailable: function() {
									return Q(true);
								}
							}
						},
						{
							id: 2,
							service: {
								isAvailable: function() {
									return Q(true);
								}
							}
						},
						{
							id: 2,
							service: {
								isAvailable: function() {
									return Q(true);
								}
							}
						},
						{
							id: 3,
							service: {
								isAvailable: function() {
									return Q(true);
								}
							}
						},
						{
							id: 4,
							service: {
								isAvailable: function() {
									return Q(true);
								}
							}
						}
					]
				};

				return TipsAndTricksManager._filterInvalidTips(mConfig.tips).then(function() {
					sinon.assert.calledTwice(console.error);
					sinon.assert.calledWithExactly(console.error, "Tip ID: 1 exists 4 times and that's not cool! Only one of them will appear in the dialog.");
					sinon.assert.calledWithExactly(console.error, "Tip ID: 2 exists 3 times and that's not cool! Only one of them will appear in the dialog.");
				});
			});

			it("uses _filterInvalidTips to filter tips that are unavailable", function() {
				var mConfig = {
					tips: [
						{
							id: 1,
							service: {
								isAvailable: function() {
									return Q(false);
								}
							}
						},
						{
							id: 2,
							service: {
								isAvailable: function() {
									return Q(true);
								}
							}
						},
						{
							id: 3,
							service: {

							},
							available: false
						},
						{
							id: 4,
							service: {
								isAvailable: function() {
									return Q(true);
								}
							}
						}
					]
				};

				return TipsAndTricksManager._filterInvalidTips(mConfig.tips).then(function(aValidTips) {
					sinon.assert.notCalled(console.error);
					expect(aValidTips).to.have.length(2);
					expect(aValidTips[0]).to.deep.equal(mConfig.tips[1]);
					expect(aValidTips[1]).to.deep.equal(mConfig.tips[3]);
				});
			});
		});

	});

	describe("has a _changeDialogContentTo", function() {
		it("changes the content of the dialog", function() {
			sap.ui.jsview("my.own.view", {
				// defines the UI of this View
				createContent: function(oController) {
					// button text is bound to Model, "press" action is bound to Controller's event handler
					return new sap.ui.commons.Button({
						text : "Button of View1",
						press: function(oEvent) {}
					});
				}
			});

			var myView1 = sap.ui.view({
				type:sap.ui.core.mvc.ViewType.JS,
				viewName:"my.own.view"
			});

			sap.ui.jsview("my.own.view2", {
				// defines the UI of this View
				createContent: function(oController) {
					// button text is bound to Model, "press" action is bound to Controller's event handler
					return new sap.ui.commons.Button({
						text : "Button of View2",
						press: function(oEvent) {}
					});
				}
			});

			var myView2 = sap.ui.view({
				type:sap.ui.core.mvc.ViewType.JS,
				viewName:"my.own.view2"
			});



			var oTipsAndTricksDialog = new sap.ui.commons.Dialog({
				title: "batata",
				resizable: false,
				width: "795px",
				modal: true,
				content:[myView1]
			});

			TipsAndTricksManager._changeDialogContentTo(oTipsAndTricksDialog, myView2);

			expect(oTipsAndTricksDialog.getContent()).to.have.length(1);
			expect(oTipsAndTricksDialog.getContent()[0]).not.to.deep.equal(myView1);
			expect(oTipsAndTricksDialog.getContent()[0]).to.deep.equal(myView2);

		});
	});
});
