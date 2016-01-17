define(["STF", "sap/watt/lib/lodash/lodash", "sap/watt/saptoolsets/fiori/editor/plugin/ui5wysiwygeditor/utils/ViewState"],
	function (STF, _, ViewState) {
		"use strict";
		var suiteName = "Outline with editor", getService = STF.getServicePartial(suiteName);

		describe(suiteName, function () {
			var w5gTestUtils, oWysiwygEditorService, oW5gOutlineService, mDocuments,
				ADD = 0, DEL = 1;

			before(function () {
				return STF.startWebIde(suiteName, {
					config: "w5g/config.json", html: "w5g/service2/w5geditor.html"
				}).then(function () {
					return STF.require(suiteName, ["sane-tests/w5g/w5gTestUtils"]).spread(function (testUtils) {
						w5gTestUtils = testUtils;
						var oProjectSettings = getService('setting.project');
						w5gTestUtils.initializeBeforeServiceTest(oProjectSettings);
						oWysiwygEditorService = getService('ui5wysiwygeditor');
						oW5gOutlineService = getService('w5gOutline');
						return w5gTestUtils.retrieveDocumentsAndSetupW5G(getService).then(function (mDocs) {
							mDocuments = mDocs;
						});
					});
				});
			});

			after(function () {
				STF.shutdownWebIde(suiteName);
			});

			beforeEach(function () {
				return w5gTestUtils.openDocument(oWysiwygEditorService, mDocuments.oViewDoc);
			});

			afterEach(function () {
				return w5gTestUtils.closeAndResetDocument(oWysiwygEditorService, mDocuments.oViewDoc);
			});

			function getOutlineToolbarButtons() {
				return oW5gOutlineService.getContent().then(function (oOutlineView) {
					return oOutlineView.getContent()[0].getRightItems();
				});
			}

			it("on open view is selected and outline toolbar add is enabled and delete is disabled", function () {
				return getOutlineToolbarButtons().then(function (aButtons) {
					expect(aButtons[ADD].getEnabled()).to.be.true;
					expect(aButtons[DEL].getEnabled()).to.be.false;
				});
			});

			it("on button selected outline toolbar add is disabled and delete is enabled", function () {
				return oWysiwygEditorService.selectUI5Control("button").then(function () {
					return getOutlineToolbarButtons().then(function (aButtons) {
						expect(aButtons[ADD].getEnabled()).to.be.false;
						expect(aButtons[DEL].getEnabled()).to.be.true;
					});
				});
			});

			it("refresh outline after undo/redo in W5G editor", function () {
				return oWysiwygEditorService.getRoot().then(function (oView) {
					var oButton = oView.byId("button");
					return oWysiwygEditorService.deleteUI5Control(oButton)
						.then(_.bindKey(oWysiwygEditorService, 'flush'))
						.then(function () {
							return STF.getServicePrivateImpl(oWysiwygEditorService).then(function (oPrivateWysiwygEditor) {
								return mDocuments.oViewDoc.getContent().then(function (sContent) {
									return oWysiwygEditorService.getCurrentSelectedControl().then(function (oOpenedDocSelectedControl) {
										var newState = new ViewState(sContent, oOpenedDocSelectedControl && oOpenedDocSelectedControl.getId());
										oPrivateWysiwygEditor._getCurrentUndoRedoStack().push(newState);
										return oWysiwygEditorService.undo()
											.then(_.bindKey(oWysiwygEditorService, 'flush'))
											.then(function () {
												return oWysiwygEditorService.selectUI5Control("button").then(function () {
													return STF.getServicePrivateImpl(oW5gOutlineService).then(function (oPrivateImplW5GOutline) {
														return Q(oPrivateImplW5GOutline.getContent()).then(function (oOutlineView) {
															var oTreeContent = oOutlineView.getContent()[1];
															var oViewNode = oTreeContent.getNodes()[0];
															assert.ok(oViewNode.__data.oControl, "must be truthy on proper outline event");
															var oNode = oViewNode.__data.oControl.getContent()[0];
															assert.ok(oNode, "must be truthy on proper outline event");
															var oPageNodes = oNode.getContent();
															var oTreeButton = oPageNodes[4];
															assert.equal(oTreeButton.__XMLNode.id, "button");
														});
													});
												});
											});

									});
								});
							});
						});
				});
			});
		});
	});
