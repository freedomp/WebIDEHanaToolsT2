define(["STF", "sinon"], function(STF, sinon) {
	"use strict";

	var sandbox;
	var suiteName = "Preview Composite Control Handler";

	describe("Preview Handler methods", function() {

		var _oImpl;
		var oPreviewHandler;
		var mockGrid;
		var mockIcon;
		var mockTogleButton;
		var myModel;

		before(function() {
			var loadWebIdePromise = STF.startWebIde(suiteName, {
				config: "runner/service/ideplatform/config.json"
			});
			return loadWebIdePromise.then(function(webIdeWindowObj) {
				sandbox = sinon.sandbox.create();
				oPreviewHandler = STF.getService(suiteName, "previewhandler");
				return STF.getServicePrivateImpl(oPreviewHandler).then(function(oImpl) {
					_oImpl = oImpl;

					mockIcon = webIdeWindowObj.sap.ui.core.Icon({
						color: {
							path: "/previewMode",
							formatter: function(e) {
								return e === 0 ? "#107dc2" : "#787878";
							}
						}
					});

					mockTogleButton = webIdeWindowObj.sap.ui.commons.ToggleButton({
						pressed: {
							path: "/previewMode",
							formatter: function(e) {
								return e === 0 ? true : false;
							}
						}
					});

					mockGrid = webIdeWindowObj.sap.ui.layout.Grid({
						content: [mockIcon, mockTogleButton]
					});

					myModel = webIdeWindowObj.sap.ui.model.json.JSONModel({
						previewMode: 0
					});
				});
			});
		});

		after(function() {
			STF.shutdownWebIde(suiteName);
		});

		afterEach(function() {
			sandbox.restore();
		});

		it("Test updatePreviewSelected method",
			function() {
				mockGrid.setModel(myModel);
				var oEventData = {
					getSource: function() {
						return mockTogleButton;
					}
				};
				//check the state of button from pressed to unpressed
				return oPreviewHandler.updatePreviewSelected(oEventData, "/previewMode", 1).then(function() {
					var test = mockTogleButton.getModel().getProperty("/previewMode");
					expect(test).to.deep.equal(1);
					var isPressed = mockTogleButton.getPressed();
					expect(isPressed).to.deep.equal(false);

					//check the state of button from unpressed to pressed
					return oPreviewHandler.updatePreviewSelected(oEventData, "/previewMode", 0).then(function() {
						test = mockTogleButton.getModel().getProperty("/previewMode");
						expect(test).to.deep.equal(0);
						isPressed = mockTogleButton.getPressed();
						expect(isPressed).to.deep.equal(true);
					});
				});
			});

		it("Test onIconPressed method",
			function() {
				myModel.setProperty("/previewMode", 0);
				mockGrid.setModel(myModel);
				var oEventData = {
					getSource: function() {
						return mockIcon;
					}
				};
				//check the color of icon from pressed to unpressed
				return oPreviewHandler.onIconPressed(oEventData, "/previewMode", 1).then(function() {
					var test = mockIcon.getModel().getProperty("/previewMode");
					expect(test).to.deep.equal(1);
					var sColor = mockIcon.getColor();
					expect(sColor).to.deep.equal("#787878");
					var isPressed = mockTogleButton.getPressed();
					expect(isPressed).to.deep.equal(false);

					//check the color of icon from unpressed to pressed
					return oPreviewHandler.onIconPressed(oEventData, "/previewMode", 0).then(function() {
						test = mockIcon.getModel().getProperty("/previewMode");
						expect(test).to.deep.equal(0);
						sColor = mockIcon.getColor();
						expect(sColor).to.deep.equal("#107dc2");
						isPressed = mockTogleButton.getPressed();
						expect(isPressed).to.deep.equal(true);
					});
				});
			});

	});
});