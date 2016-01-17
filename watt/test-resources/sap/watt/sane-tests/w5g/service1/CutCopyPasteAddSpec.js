define(["STF", "sap/watt/lib/lodash/lodash"], function (STF, _) {
	"use strict";
	var suiteName = "Cut-Copy-Paste-Add Commands", getService = STF.getServicePartial(suiteName);
	describe(suiteName, function () {
		var jQuery, w5gTestUtils, oPrivateImplWysiwygEditor, oWysiwygEditorService, oW5GOutline,
			oFakeSelection, mDocuments, ControlMetadata, oView,
			copyCmd, cutCmd, pasteCmd, pasteAfterCmd, pasteBeforeCmd, removeCmd, addCmd,
			sDocumentOriginalContent, oI18n;

		/**
		 *
		 * @param {sap.ui.core.Control|string} vControl
		 * @param {string=} sAggregation
		 * @return {Q}
		 * @private
		 */
		function _selectInEditor(vControl, sAggregation) {
			return oWysiwygEditorService.selectUI5Control(vControl, sAggregation).then(function () {
				return oFakeSelection.setOwner(oWysiwygEditorService);
			});
		}

		before(function () {
			return STF.startWebIde(suiteName, {
				config: "w5g/config.json", html: "w5g/service1/w5geditor.html"
			}).then(function (oWindow) {
				return STF.require(suiteName, ["sap/watt/saptoolsets/fiori/editor/plugin/ui5wysiwygeditor/utils/ControlMetadata",
					"sane-tests/w5g/w5gTestUtils"]).spread(function (_ControlMetadata, _w5gTestUtils) {
					jQuery = oWindow.jQuery;
					ControlMetadata = _ControlMetadata;
					w5gTestUtils = _w5gTestUtils;
					oI18n = w5gTestUtils.getI18n();
					var oProjectSettings = getService('setting.project');
					w5gTestUtils.initializeBeforeServiceTest(oProjectSettings);
					oWysiwygEditorService = getService('ui5wysiwygeditor');
					oW5GOutline = getService('w5gOutline');
					oFakeSelection = getService('selection');
					var oCommandService = getService('command');
					return w5gTestUtils.configureEditor(getService, "ace").then(function () {
						return w5gTestUtils.retrieveDocumentsAndSetupW5G(getService).then(function (mDocs) {
							mDocuments = mDocs;
						}).then(function () {
							return STF.getServicePrivateImpl(oWysiwygEditorService);
						}).then(function (oW5gPrivateImpl) {
							oPrivateImplWysiwygEditor = oW5gPrivateImpl;
							return Q.all([oCommandService.getCommand("ui5wysiwygeditor.control.paste"),
								oCommandService.getCommand("ui5wysiwygeditor.control.pasteAfter"),
								oCommandService.getCommand("ui5wysiwygeditor.control.pasteBefore"),
								oCommandService.getCommand("ui5wysiwygeditor.control.copy"),
								oCommandService.getCommand("ui5wysiwygeditor.control.cut"),
								oCommandService.getCommand("ui5wysiwygeditor.control.remove"),
								oCommandService.getCommand("ui5wysiwygeditor.control.add")]);
						}).spread(function (p, pAfter, pBefore, copy, cut, remove, add) {
							pasteCmd = p;
							pasteAfterCmd = pAfter;
							pasteBeforeCmd = pBefore;
							copyCmd = copy;
							cutCmd = cut;
							removeCmd = remove;
							addCmd = add;
						}).then(function () {
							return mDocuments.oViewDoc.getContent();
						}).then(function (sCont) {
							sDocumentOriginalContent = sCont;
						});
					});
				});
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});

		beforeEach(function () {
			// first clear any previously copied control
			oPrivateImplWysiwygEditor._sClipboardControlXML = null;
			return w5gTestUtils.openDocument(oWysiwygEditorService, mDocuments.oViewDoc).then(function () {
				return Q.all([oWysiwygEditorService.getRoot(), oWysiwygEditorService.deselectUI5Control(), oFakeSelection.setOwner(null)]);
			}).spread(function (oV) {
				oView = oV;
			});
		});

		afterEach(function () {
			return w5gTestUtils.closeAndResetDocument(oWysiwygEditorService, mDocuments.oViewDoc);
		});

		function _testPastedControl(sId, sTagName, sParentId, sAggregationName, iPlace) {
			var oControl = oPrivateImplWysiwygEditor._getUI5ControlById(sId);
			expect(oControl).to.exist;
			expect(oControl.sId).to.be.equal(sId);
			return mDocuments.oViewDoc.getContent().then(function (sContent) {
				var oXmlDoc = jQuery.parseXML(sContent, "text/xml");
				var oBtn = oXmlDoc.getElementById(sId);
				expect(oBtn).to.exist;
				expect(oBtn.id).to.equal(sId);
				expect(oBtn.tagName).to.equal(sTagName);

				var oXmlDocParent = oXmlDoc.getElementById(sParentId);
				expect(oXmlDocParent).to.exist;
				var parentAggregation = _.find(oXmlDocParent.children, function (oElement) {
					return oElement.tagName === sAggregationName;
				});
				expect(parentAggregation.children[iPlace].id).to.equal(sId);
			});
		}

		it("W5G Editor should have Button 'button' after Cut & Paste", function () {
			return _selectInEditor("button").then(function () {
				return oWysiwygEditorService.cut()
					.then(_.bindKey(oWysiwygEditorService, 'flush'))
					.then(function () {
						return _selectInEditor("page").then(function () {
							return pasteCmd.execute()
								.then(_.bindKey(oWysiwygEditorService, 'flush'))
								.then(function () {
									return _testPastedControl("button", "Button", "page", "content", 6);
								});
						});
					});
			});
		});

		it("Paste after list doesn't try to put inside it, but after it", function () {
			return _selectInEditor("obli1").then(function () {
				return oWysiwygEditorService.cut()
					.then(_.bindKey(oWysiwygEditorService, 'flush'))
					.then(function () {
						var oList = oView.byId("list");
						expect(oList.getItems()).to.have.length(3);
						return _selectInEditor(oList).then(function () {
							return pasteAfterCmd.execute()
								.then(_.bindKey(oWysiwygEditorService, 'flush'))
								.then(function () {
									return _testPastedControl("obli1", "ObjectListItem", "page", "content", 4);
								});
						});
					});
			});
		});

		it("Paste when aggregation is selected in the outline and invalid doesn't happen", function () {
			return _selectInEditor("obli1").then(function () {
				return oWysiwygEditorService.copy()
					.then(_.bindKey(oWysiwygEditorService, 'flush'))
					.then(function () {
						return _selectInEditor("page", "subHeader").then(function () {
							return pasteCmd.execute()
								.then(_.bindKey(oWysiwygEditorService, 'flush'))
								.then(function () {
									return mDocuments.oViewDoc.getContent();
								}).then(function (sCont) {
									expect(sCont).to.be.equal(sDocumentOriginalContent);
								});
						});
					});
			});
		});

		it("Paste when aggregation is selected in the outline", function () {
			return _selectInEditor("obli1").then(function () {
				return oWysiwygEditorService.cut()
					.then(_.bindKey(oWysiwygEditorService, 'flush'))
					.then(function () {
						return _selectInEditor("page", "headerContent").then(function () {
							return pasteCmd.execute()
								.then(_.bindKey(oWysiwygEditorService, 'flush'))
								.then(function () {
									return _testPastedControl("obli1", "ObjectListItem", "page", "headerContent", 0);
								});
						});
					});
			});
		});

		it("Paste before list doesn't try to put inside it, but after it", function () {
			return _selectInEditor("obli1").then(function () {
				return oWysiwygEditorService.cut()
					.then(_.bindKey(oWysiwygEditorService, 'flush'))
					.then(function () {
						var oList = oView.byId("list");
						expect(oList.getItems()).to.have.length(3);
						return _selectInEditor(oList).then(function () {
							return pasteBeforeCmd.execute()
								.then(_.bindKey(oWysiwygEditorService, 'flush'))
								.then(function () {
									return _testPastedControl("obli1", "ObjectListItem", "page", "content", 3);
								});
						});
					});
			});
		});

		it("W5G Editor should have Button 'button_copy' after Copy & Paste", function () {
			return _selectInEditor("button").then(function () {
				return oWysiwygEditorService.copy()
					.then(_.bindKey(oWysiwygEditorService, 'flush'))
					.then(function () {
						return _selectInEditor("page").then(function () {
							return pasteCmd.execute()
								.then(_.bindKey(oWysiwygEditorService, 'flush'))
								.then(function () {
									return _testPastedControl("button_copy", "Button", "page", "content", 7);
								});
						});
					});
			});
		});

		it("W5G Editor should have Button 'button' after cut, switch device & paste ", function () {
			return _selectInEditor("button").then(function () {
				//Cut
				return oWysiwygEditorService.cut().then(function () {
					//Switch device
					oPrivateImplWysiwygEditor._sDevice = "tablet";
					return w5gTestUtils.openDocument(oWysiwygEditorService, mDocuments.oViewDoc).then(function () {
						//Paste
						return pasteCmd.execute()
							.then(_.bindKey(oWysiwygEditorService, 'flush'))
							.then(function () {
								var oControl = oPrivateImplWysiwygEditor._getUI5ControlById("button");
								expect(oControl).to.exist;
								expect(oControl.sId).to.be.equal("__xmlview0--button");
							});
					});
				});
			});
		});

		it("W5G Editor should have Button 'button' after copy, switch layout tab & paste ", function () {
			return _selectInEditor("button").then(function () {
				return oWysiwygEditorService.copy().then(function () {
					//Open new tab - switch to other layout
					return w5gTestUtils.openDocAndCleanAfter(oWysiwygEditorService, mDocuments.oOtherViewDoc, function () {
						return pasteCmd.execute()
							.then(_.bindKey(oWysiwygEditorService, 'flush'))
							.then(function () {
								var oControl = oPrivateImplWysiwygEditor._getUI5ControlById("button");
								expect(oControl).to.exist;
								expect(oControl.sId).to.be.equal("button");
							});
					});
				});
			});
		});

		it("Commands availability and enable/disable status after selection of control without copy/cut", function () {
			return _selectInEditor("button").then(function () {
				return Q.all([
					expect(copyCmd._oService.isAvailable()).to.eventually.be.fulfilled,
					expect(cutCmd._oService.isAvailable()).to.eventually.be.fulfilled,
					expect(pasteCmd._oService.isAvailable()).to.eventually.be.fulfilled,
					expect(pasteBeforeCmd._oService.isAvailable()).to.eventually.be.fulfilled,
					expect(pasteAfterCmd._oService.isAvailable()).to.eventually.be.fulfilled,
					expect(removeCmd._oService.isAvailable(), 'Remove should be available').to.eventually.be.fulfilled,

					expect(copyCmd._oService.isEnabled()).to.eventually.be.true,
					expect(cutCmd._oService.isEnabled()).to.eventually.be.true,
					expect(pasteCmd._oService.isEnabled()).to.eventually.be.false,
					expect(pasteBeforeCmd._oService.isEnabled()).to.eventually.be.false,
					expect(pasteAfterCmd._oService.isEnabled()).to.eventually.be.false,
					expect(removeCmd._oService.isEnabled(), 'Remove should be enabled').to.eventually.be.true
				]);
			});
		});

		it("Commands availability and enable/disable status after selection of control and aggregation after copy", function () {
			var oButton = oView.byId("button");
			return _selectInEditor(oButton).then(function () {
				return oWysiwygEditorService.copy();
			}).then(function () {
				return _selectInEditor(oButton, "customData");
			}).then(function () {
				return Q.all([
					expect(copyCmd._oService.isAvailable()).to.eventually.be.fulfilled,
					expect(cutCmd._oService.isAvailable()).to.eventually.be.fulfilled,
					expect(pasteCmd._oService.isAvailable()).to.eventually.be.fulfilled,
					expect(pasteBeforeCmd._oService.isAvailable()).to.eventually.be.fulfilled,
					expect(pasteAfterCmd._oService.isAvailable()).to.eventually.be.fulfilled,
					expect(removeCmd._oService.isAvailable(), 'Remove should be available').to.eventually.be.fulfilled,
					expect(copyCmd._oService.isEnabled()).to.eventually.be.false,
					expect(cutCmd._oService.isEnabled()).to.eventually.be.false,
					expect(pasteCmd._oService.isEnabled()).to.eventually.be.true,
					expect(pasteBeforeCmd._oService.isEnabled()).to.eventually.be.false,
					expect(pasteAfterCmd._oService.isEnabled()).to.eventually.be.false,
					expect(removeCmd._oService.isEnabled(), 'Remove should be disabled').to.eventually.be.false
				]);
			});
		});

		it("Commands availability and enable/disable status after selection of unsupported control and aggregation after copy", function () {
			oPrivateImplWysiwygEditor._sClipboardControlXML = null;
			return _selectInEditor("button").then(function () {
				return oWysiwygEditorService.copy();
			}).then(function () {
				var oUnsupported = oView.byId("__anchorBar");
				return _selectInEditor(oUnsupported).then(function () {
				}).then(function () {
					return Q.all([
						expect(copyCmd._oService.isAvailable()).to.eventually.be.fulfilled,
						expect(cutCmd._oService.isAvailable()).to.eventually.be.fulfilled,
						expect(pasteCmd._oService.isAvailable()).to.eventually.be.fulfilled,
						expect(pasteBeforeCmd._oService.isAvailable()).to.eventually.be.fulfilled,
						expect(pasteAfterCmd._oService.isAvailable()).to.eventually.be.fulfilled,
						expect(removeCmd._oService.isAvailable(), 'Remove should be available').to.eventually.be.fulfilled,
						expect(copyCmd._oService.isEnabled()).to.eventually.be.true,
						expect(cutCmd._oService.isEnabled()).to.eventually.be.true,
						expect(pasteCmd._oService.isEnabled()).to.eventually.be.false,
						expect(pasteBeforeCmd._oService.isEnabled()).to.eventually.be.true,
						expect(pasteAfterCmd._oService.isEnabled()).to.eventually.be.true,
						expect(removeCmd._oService.isEnabled()).to.eventually.be.false
					]);
				});
			});
		});

		it("Commands availability and enable/disable status after selection of control and copy", function () {
			return _selectInEditor("button").then(function () {
				return oWysiwygEditorService.copy();
			}).then(function () {
				return Q.all([
					expect(copyCmd._oService.isAvailable()).to.eventually.be.fulfilled,
					expect(cutCmd._oService.isAvailable()).to.eventually.be.fulfilled,
					expect(pasteCmd._oService.isAvailable()).to.eventually.be.fulfilled,
					expect(pasteBeforeCmd._oService.isAvailable()).to.eventually.be.fulfilled,
					expect(pasteAfterCmd._oService.isAvailable()).to.eventually.be.fulfilled,
					expect(copyCmd._oService.isEnabled()).to.eventually.be.true,
					expect(cutCmd._oService.isEnabled()).to.eventually.be.true,
					expect(pasteCmd._oService.isEnabled()).to.eventually.be.true,
					expect(pasteBeforeCmd._oService.isEnabled()).to.eventually.be.true,
					expect(pasteAfterCmd._oService.isEnabled()).to.eventually.be.true
				]);
			});
		});

		it("Add command availability and enable/disable status after selection of none container control", function () {
			return _selectInEditor("button").then(function () {
				return Q.all([
					expect(addCmd._oService.isAvailable()).to.eventually.be.fulfilled,
					expect(addCmd._oService.isEnabled()).to.eventually.be.false
				]);
			});
		});

		it("Add command availability and enable/disable status after selection of container control", function () {
			return _selectInEditor("page").then(function () {
				return Q.all([
					expect(addCmd._oService.isAvailable()).to.eventually.be.fulfilled,
					expect(addCmd._oService.isEnabled()).to.eventually.be.true
				]);
			});
		});

		it("Add command to open dialog sanity", function () {
			return _selectInEditor("page").then(function () {
				return addCmd._oService.execute();
			}).then(function () {
				expect(jQuery(".sapWysiwygControlAddDialog").length).to.be.equal(1);
				expect(jQuery(".sapWysiwygPaletteItem").length).to.be.above(100);
				expect(jQuery(".sapUiIcon, .sapWysiwygPaletteItemTooltip").css("display")).to.be.equal("none");
			});
		});

		it("Add command availability and enable/disable status after selection of aggregation", function () {
			return _selectInEditor("page", "subHeader").then(function () {
				return Q.all([
					expect(addCmd._oService.isAvailable()).to.eventually.be.fulfilled,
					expect(addCmd._oService.isEnabled()).to.eventually.be.true
				]);
			});
		});

		it("W5G Editor verify isContainer.isContainer() method functionality", function () {
			expect(ControlMetadata.isContainer(oView.byId("button"))).to.be.false;
			expect(ControlMetadata.isContainer(oView.byId("page"))).to.be.true;
			expect(ControlMetadata.isContainer(oView.byId("objectHeader"))).to.be.true;
			expect(ControlMetadata.isContainer(oView.byId("list"))).to.be.true;
			expect(ControlMetadata.isContainer(oView.byId("obli1"))).to.be.true;
			expect(ControlMetadata.isContainer(oView.byId("SimpleForm"))).to.be.true;
			expect(ControlMetadata.isContainer(oView.byId("__title0"))).to.be.false;
			expect(ControlMetadata.isContainer(oView.byId("__label0"))).to.be.false;
			expect(ControlMetadata.isContainer(oView.byId("__input0"))).to.be.true;
		});

		it("check filtered list on add controls of several types", function () {
			return w5gTestUtils.openDocAndCleanAfter(oWysiwygEditorService, mDocuments.oOtherViewDoc, function () {
				return Q.all([oWysiwygEditorService.getDesignTime(), oWysiwygEditorService.getScope()]).spread(function (oDesignTime, oScope) {
					return STF.getServicePrivateImpl(addCmd._oService).then(function (oPrivateAdd) {
						function callGetItemsFor(sClassName) {
							return oPrivateAdd._buildItems(sClassName, oDesignTime, oScope).map(function (oItem) {
								return oItem.name;
							});
						}
						var aItems = callGetItemsFor("sap.m.Button");
						expect(aItems).to.deep.equal(["sap.m.Button", "sap.m.OverflowToolbarButton", "sap.m.ToggleButton", "sap.ushell.ui.footerbar.AddBookmarkButton"]);
						aItems = callGetItemsFor("sap.m.IconTab");
						expect(aItems).to.deep.equal(["sap.m.IconTabFilter", "sap.m.IconTabSeparator"]);
					});
				});
			});
		});

		describe("Test Notification area after copy/paste", function () {

			it("Try to copy/paste onto a non container that its parent aggregation doesn't allow the copied control - (Button onto Standard List Item)", function () {
				return _selectInEditor("button").then(function () {
					return oWysiwygEditorService.copy()
						.then(_.bindKey(oWysiwygEditorService, 'flush'))
						.then(function () {
							return _selectInEditor("__stlItem0").then(function () {
								return pasteCmd.execute()
									.then(_.bindKey(oWysiwygEditorService, 'flush'))
									.then(function () {
										assert.ok(w5gTestUtils.compareMessages(oI18n,
											oPrivateImplWysiwygEditor._oNotificationBar.getMessages(),
											["message_area_control_insert_invalid_in_aggregation"],
											[["Button", "List", "items"]]
										), "string should match");
									});
							});
						});
				});
			});

			it("Cannot paste into a container that non of the aggregation accepts the copied control (Button onto Object List Item)", function () {
				return _selectInEditor("button").then(function () {
					return oWysiwygEditorService.copy()
						.then(_.bindKey(oWysiwygEditorService, 'flush'))
						.then(function () {
							return _selectInEditor("obli1").then(function () {
								return pasteCmd.execute()
									.then(_.bindKey(oWysiwygEditorService, 'flush'))
									.then(function () {
										assert.ok(w5gTestUtils.compareMessages(oI18n,
											oPrivateImplWysiwygEditor._oNotificationBar.getMessages(),
											["message_area_control_insert_invalid"],
											[["Button", "Object List Item"]]
										), "string should match");
									});
							});
						});
				});
			});

			it("Try to copy fragment and verify there is no support message", function () {
				return w5gTestUtils.openDocument(oWysiwygEditorService, mDocuments.oContainsFragmentViewDoc).then(function () {
					return _selectInEditor("fragment0--myFragment").then(function () {
						return oWysiwygEditorService.copy()
							.then(_.bindKey(oWysiwygEditorService, 'flush'))
							.then(function () {
								assert.ok(w5gTestUtils.compareMessages(oI18n,
									oPrivateImplWysiwygEditor._oNotificationBar.getMessages(),
									["message_area_control_copy_unsupported"],
									[["Fragment"]]
								), "string should match");
							});
					});
				});
			});
		}); //describe
	});
});