define(["STF", "sap/watt/lib/lodash/lodash"], function (STF, _) {
	"use strict";
	var suiteName = "Editor General", getService = STF.getServicePartial(suiteName);
	describe(suiteName, function () {
		var jQuery, w5gTestUtils, oWysiwygEditorService, oW5GOutline, oW5GProperties, oFakeSelection, mDocuments, W5gUtils,
			oContent, oPrivateW5g, oRemoveCmd, _cxtMenuDeferredPerActivity = {
				opened: null,
				closed: null
			};

		function resolveDeferredIfExist(oDeferred) {
			if (oDeferred) {
				oDeferred.resolve();
			}
			return Q();
		}

		var _contextServiceStub = {
			open: function () {
				return resolveDeferredIfExist(_cxtMenuDeferredPerActivity.opened);
			},
			close: function () {
				return resolveDeferredIfExist(_cxtMenuDeferredPerActivity.closed);
			}
		};

		before(function () {
			return STF.startWebIde(suiteName, {
				config: "w5g/config.json", html: "w5g/service2/w5geditor.html"
			}).then(function (oWindow) {
				return STF.require(suiteName, ["sap/watt/saptoolsets/fiori/editor/plugin/ui5wysiwygeditor/utils/W5gUtils",
					"sane-tests/w5g/w5gTestUtils"]).spread(function (_W5gUtils, _w5gTestUtils) {
					jQuery = oWindow.jQuery;
					W5gUtils = _W5gUtils;
					w5gTestUtils = _w5gTestUtils;
					var oProjectSettings = getService('setting.project');
					w5gTestUtils.initializeBeforeServiceTest(oProjectSettings);
					oWysiwygEditorService = getService('ui5wysiwygeditor');
					oW5GOutline = getService('w5gOutline');
					oW5GProperties = getService('w5gproperties');
					oFakeSelection = getService('selection');
					oContent = getService('content');
					return w5gTestUtils.configureEditor(getService, "ace").then(function () {
						return w5gTestUtils.retrieveDocumentsAndSetupW5G(getService).then(function (mDocs) {
							mDocuments = mDocs;
							return Q.all([
								STF.getServicePrivateImpl(oWysiwygEditorService),
								STF.getServicePrivateImpl(oW5GProperties),
								STF.getServicePrivateImpl(oW5GOutline)
							]).spread(function (_oPrivateW5g, _privateOutline) {
								oPrivateW5g = _oPrivateW5g;
								oPrivateW5g.context.service.contextMenu =
									_privateOutline.context.service.contextMenu = _contextServiceStub;
								return getService('command').getCommand("ui5wysiwygeditor.control.remove");
							}).then(function (oCommand) {
								oRemoveCmd = oCommand;
							});
						});

					});
				});
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});

		describe("General activities", function () {
			beforeEach(function () {
				return w5gTestUtils.openDocument(oWysiwygEditorService, mDocuments.oViewDoc);
			});

			afterEach(function () {
				return w5gTestUtils.closeAndResetDocument(oWysiwygEditorService, mDocuments.oViewDoc);
			});

			it("check nested view displayed as Subview", function () {
				return oWysiwygEditorService.selectUI5Control("myXMLView").then(function () {
					var badge = jQuery("#__iframe0").contents().find("div.controlOverlayBadge[data-sap-ui-dt-for$='myXMLView']");
					assert.ok(badge.length === 1, "Found overlay indicating that the local inner view was found.");
					assert.ok(badge.attr("badge-data") === "Subview: NestedXMLView", "Overlay badge text is 'Subview: NestedXMLView'.");
				});
			});

			it("iterator is called, Utils is tested on its own", function () {
				var oIteratorCalled = Q.defer();
				oWysiwygEditorService.iterateOverAllPublicAggregationsOfRootControl(function (oAggregation, oValue) {
					assert.ok(oAggregation);
					assert.ok(oValue);
					oIteratorCalled.resolve();
				});
				return oIteratorCalled.promise;
			});

			it("Remove control via editor, then undo/redo, than select control", function () {
				function testLayoutModel(sAction, bState) {
					return oWysiwygEditorService.getContent().then(function (oLayout) {
						assert.equal(oLayout.getModel("layoutModel").getProperty("/" + sAction + "Enabled"), bState);
					});
				}

				var sButtonInXML = '<Button id="button';
				var sButton2InXML = '<Button id="thisIsTheRegularViewForTesting';
				return oWysiwygEditorService.getRoot().then(function (oView) {
					var oButton = oView.byId("button");
					return oWysiwygEditorService.deleteUI5Control(oButton)
						.then(oWysiwygEditorService.selectUI5Control.bind(oWysiwygEditorService, "objectHeader"))
						.then(_.bindKey(oWysiwygEditorService, 'flush'))
						.then(_.bindKey(oWysiwygEditorService, 'hasUndo'))
						.then(function (bResult) {
							assert.equal(bResult, true);
							return testLayoutModel("undo", bResult);
						}).then(function () {
							return mDocuments.oViewDoc.getContent().then(function (sContent) {
								expect(sContent).to.not.contain(sButtonInXML);
							}).then(_.bindKey(oWysiwygEditorService, 'undo'))
								.then(_.bindKey(oWysiwygEditorService, 'flush'))
								.then(_.bindKey(oWysiwygEditorService, 'hasUndo'))
								.then(function (bResult) {
									assert.equal(bResult, false);
									return testLayoutModel("undo", bResult);
								}).then(function () {
									return mDocuments.oViewDoc.getContent().then(function (sContent) {
										assert.notEqual(sContent.indexOf(sButtonInXML), -1, "button should return the xml code");
									});
								}).then(_.bindKey(oWysiwygEditorService, 'redo'))
								.then(_.bindKey(oWysiwygEditorService, 'flush'))
								.then(function () {
									return oWysiwygEditorService.hasRedo().then(function (bResult) {
										assert.equal(bResult, false);
										return testLayoutModel("redo", bResult);
									});
								}).then(function () {
									return mDocuments.oViewDoc.getContent().then(function (sContent) {
										expect(sContent).to.not.contain(sButtonInXML);
										expect(sContent).to.contain(sButton2InXML);
										return oWysiwygEditorService.selectUI5Control("thisIsTheRegularViewForTesting")
											.then(_.bindKey(oWysiwygEditorService, 'flush'))
											.then(_.bindKey(oWysiwygEditorService, 'hasUndo'))
											.then(function (bResult) {
												assert.equal(bResult, true);
												return testLayoutModel("undo", bResult).then(function () {
													assert.equal(_.last(oPrivateW5g._getCurrentUndoRedoStack()._aUndoStack).getViewStateSelectedControlId(), "__xmlview0--objectHeader");
												});
											});
									});
								});
						});
				});
			});

			it("Checking focus after delete", function () {
				return oWysiwygEditorService.getScope().then(function (oScope) {
					var oView = w5gTestUtils.getViewFromScope(oScope);
					var oButton = oView.byId("button");
					oScope.sap.ui.dt.OverlayRegistry.getOverlay(oButton).setSelected(true);

					return oWysiwygEditorService.deleteUI5Control(oButton).then(function () {
						var oButton2 = oView.byId("thisIsTheRegularViewForTesting");
						assert.ok(oButton2 === oPrivateW5g.getCurrentSelectedControl());

						return oWysiwygEditorService.deleteUI5Control(oButton2).then(function () {
							return oWysiwygEditorService.deleteUI5Control(oView.byId("list")).then(function () {
								return oWysiwygEditorService.deleteUI5Control(oView.byId("objectHeader")).then(function () {
									return oWysiwygEditorService.deleteUI5Control(oView.byId("myXMLView")).then(function () {
										return oWysiwygEditorService.deleteUI5Control(oView.byId("__item0")).then(function () {
											return oWysiwygEditorService.getCurrentSelectedControl().then(function (oSel) {
												assert.ok(oSel === oView.byId("SimpleForm"));
											});
										});
									});
								});
							});
						});
					});
				});
			});


			it("Go to code of Simple Form", function () {
				return testGoToCode("SimpleForm", 56);
			});

			it("Test elements with similar ids", function () {
				return w5gTestUtils.openDocAndCleanAfter(oWysiwygEditorService, mDocuments.oViewDoc, function () {
					var oControl = oPrivateW5g._getUI5ControlById("__label0");
					assert.equal(oControl.getText(), "Label with no id");
					oControl = oPrivateW5g._getUI5ControlById("__xmlview0--__label0");
					assert.equal(oControl.getText(), "Label 1");
				});

			});

			describe("context menu on outline on selected and non selected nodes", function () {
				it("W5G outline open context menu on selected control", function () {
					return oWysiwygEditorService.selectUI5Control("button").then(function () {
						return w5gTestUtils.navigateToOutline(oW5GOutline, oWysiwygEditorService);
					}).then(function (oOutlineView) {
						var oController = oOutlineView.getController();
						var oButtonNode = oController.getSelectedNode();
						var sButtonTag = oButtonNode.getTag();
						_cxtMenuDeferredPerActivity.opened = Q.defer();
						oButtonNode.$().trigger('contextmenu');
						return _cxtMenuDeferredPerActivity.opened.promise.then(function () {
							return oWysiwygEditorService.selectUI5Control("__label0");
						}).then(function () {
							_cxtMenuDeferredPerActivity.opened = Q.defer();
							var oButtonNode = oController._getNodeByTag(sButtonTag);
							var oButton = oButtonNode.__data.oControl;
							var $buttonNode = oButtonNode.$();
							$buttonNode.trigger('contextmenu');
							return _cxtMenuDeferredPerActivity.opened.promise.then(function () {
								return oWysiwygEditorService.getSelection();
							}).then(function (aSelection) {
								expect(aSelection[0].control).to.be.equal(oButton);
								expect(aSelection[0].aggregation).to.not.be.ok;
							});
						});
					});
				});
			});

			describe("context menu on canvas", function () {
				function assertRightClickOnButton(oScope) {
					var oView = w5gTestUtils.getViewFromScope(oScope),
						oButton = oView.byId("button"),
						oOverlay = oScope.sap.ui.dt.OverlayRegistry.getOverlay(oButton).$();
					_cxtMenuDeferredPerActivity.opened = Q.defer();
					// should be resolved by _contextServiceStub
					oOverlay.trigger('contextmenu');
					return _cxtMenuDeferredPerActivity.opened.promise.then(function () {
						_cxtMenuDeferredPerActivity.closed = Q.defer();
					}).then(function () {
						return oWysiwygEditorService.getSelection();
					}).then(function (aSelection) {
						expect(aSelection[0].control).to.be.equal(oButton);
						expect(aSelection[0].aggregation).to.not.be.ok;
					});
				}

				it("W5G Editor open context menu on selected control and close upon click", function () {
					return oWysiwygEditorService.getScope().then(function (oScope) {
						var oView = w5gTestUtils.getViewFromScope(oScope);
						var oButton = oView.byId("button");
						return oWysiwygEditorService.selectUI5Control(oButton).then(function () {
							var oOverlay = oScope.sap.ui.dt.OverlayRegistry.getOverlay(oView).$();
							return assertRightClickOnButton(oScope).then(function () {
								_cxtMenuDeferredPerActivity.closed = Q.defer();
								// should be resolved by _contextServiceStub
								oOverlay.trigger('click');
								return _cxtMenuDeferredPerActivity.closed.promise;
							});
						});
					});
				});

				it("W5G Editor open context menu on none selected control, control should become selected also", function () {
					return oWysiwygEditorService.getScope().then(function (oScope) {
						var oView = w5gTestUtils.getViewFromScope(oScope);
						return oWysiwygEditorService.deselectUI5Control().then(function () {
							return assertRightClickOnButton(oScope);
						});
					});
				});
			});

		});

		describe("Go to", function () {

			it("Go to template tag XML", function () {
				return w5gTestUtils.openDocAndCleanAfter(oWysiwygEditorService, mDocuments.oDatabindingViewDoc, function () {
					return testGoToCode("__xmlview0--mainListItem-__xmlview0--list-0", 42);
				});
			});

			it("Go to Fragment in XML", function () {
				return w5gTestUtils.openDocAndCleanAfter(oWysiwygEditorService, mDocuments.oDatabindingViewDoc, function () {
					return testGoToCode("myFragment", 58);
				});
			});

			it("Open Sub View With Layout Editor command", function () {
				return w5gTestUtils.openDocAndCleanAfter(oWysiwygEditorService, mDocuments.oViewDoc, function () {
					return oWysiwygEditorService.selectUI5Control("myXMLView").then(function () {
						return oWysiwygEditorService.getScope().then(function (oScope) {
							oScope.jQuery.sap.registerModulePath("xmlView.NestedXMLView", "/xmlView/NestedXMLView");
						}).then(_.bindKey(oWysiwygEditorService, 'openInLayoutEditor')).then(function () {
							return oWysiwygEditorService.getRoot().then(function (oView) {
								assert.equal(oView.getControllerName(), "xmlView.NestedXMLView");
							}).then(function () {
								return oContent.close(mDocuments.oNestedXMLView, oWysiwygEditorService);
							});
						});
					});
				});
			});
		});

		function testGoToCode(sControlId, iExpectedLineNumber) {
			return oWysiwygEditorService.selectUI5Control(sControlId)
				.then(_.bindKey(oWysiwygEditorService, 'goToCode')).then(function () {
					return getService('content').getCurrentEditor();
				}).then(function (oCodeEditor) {
					return Q.all([oCodeEditor.getSelectionRange(), oCodeEditor.getUI5Editor()]);
				}).spread(function (oRange, oEditor) {
					assert.equal(oRange.end.row, iExpectedLineNumber);
					var pos = oEditor.getCursorPosition();
					assert.equal(pos.row, oRange.end.row);
				});
		}

		describe("Devices", function () {
			it("switches between devices", function () {
				function step(sDevice) {
					var oDummyEvent = {
						getParameter: function () {
							return sDevice;
						}
					};
					return oPrivateW5g._onDeviceTypeChanged(oDummyEvent).then(function () {
						var sDeviceStyle = "sapWysiwyg" + (sDevice.charAt(0).toUpperCase() + sDevice.slice(1));
						var $iframe = jQuery("iframe");
						assert.ok($iframe[0], "iframe should now be created");
						assert.ok($iframe.hasClass("sapWysiwygIframe") && $iframe.hasClass(sDeviceStyle), "the Iframe element has the right classes");

						var sFakeOs = W5gUtils.getFakeOsUrlParam(sDevice);
						if (!sFakeOs) {
							assert.ok($iframe.attr("src").indexOf("sap-ui-xx-fakeOS=") === -1, "the iframe has the right src after change");
						} else {
							assert.ok($iframe.attr("src").indexOf(sFakeOs) !== -1, "the iframe has the right src after change");
						}
					}).then(function () {
						return oWysiwygEditorService.getCurrentSelectedControl();
					}).then(function (oControl) {
						expect(oControl.sId).to.match(/.*page$/);
					});
				}

				return oWysiwygEditorService.open(mDocuments.oOtherViewDoc).then(function () {
					return oWysiwygEditorService.selectUI5Control("page");
				}).then(_.partial(step, "tablet"))
					.then(_.partial(step, "phone"))
					.then(_.partial(step, "desktop"))
					.then(_.partial(step, "tablet"))
					.then(_.partial(step, "desktop")).finally(function () {
						return oWysiwygEditorService.close(mDocuments.oOtherViewDoc);
					});
			});
		});

		describe("Navigation on canvas from keyboard", function () {

			beforeEach(function () {
				return w5gTestUtils.openDocument(oWysiwygEditorService, mDocuments.oViewDoc);
			});

			afterEach(function () {
				return w5gTestUtils.closeAndResetDocument(oWysiwygEditorService, mDocuments.oViewDoc);
			});

			it("Selected control should be changed to sibling on push arrow right or left", function () {
				return oWysiwygEditorService.selectUI5Control("button").then(function () {
					return oWysiwygEditorService.navigateUI5Control("next").then(function () {
						return oWysiwygEditorService.getCurrentSelectedControl().then(function (oSelectedSibling) {
							expect(oSelectedSibling.sId).to.equal("__xmlview0--thisIsTheRegularViewForTesting");
							return oWysiwygEditorService.navigateUI5Control("previous").then(function () {
								return oWysiwygEditorService.getCurrentSelectedControl().then(function (oSelected) {
									expect(oSelected.sId).to.equal("__xmlview0--button");
								});
							});
						});
					});
				});
			});

			it("Selected control should be changed to parent on push arrow up and back to child on arrow down", function () {
				return oWysiwygEditorService.selectUI5Control("button").then(function () {
					return oWysiwygEditorService.navigateUI5Control("up").then(function () {
						return oWysiwygEditorService.getCurrentSelectedControl().then(function (oSelectedParent) {
							expect(oSelectedParent.sId).to.equal("__xmlview0--page");
							return oWysiwygEditorService.navigateUI5Control("down").then(function () {
								return oWysiwygEditorService.getCurrentSelectedControl().then(function (oSelectedChild) {
									expect(oSelectedChild.sId).to.equal("__xmlview0--button");
								});
							});
						});
					});
				});
			});

			it("Verify page control is removable", function () {
				return oWysiwygEditorService.selectUI5Control("page").then(function () {
					return expect(oRemoveCmd._oService.isEnabled()).to.eventually.be.equal(true);
				});
			});

			it("Remove command not enabled when there is selection on removable control and its aggregation", function () {
				return oWysiwygEditorService.selectUI5Control("page", "footer").then(function () {
					return expect(oRemoveCmd._oService.isEnabled()).to.eventually.be.equal(false);
				});
			});

			it("Remove command not enabled when there is no selection", function () {
				return oWysiwygEditorService.deselectUI5Control().then(function () {
					return expect(oRemoveCmd._oService.isEnabled()).to.eventually.be.equal(false);
				});
			});

			it("Remove control via command without event (like in context menu). View is updated", function () {
				var sButtonInXML = '<Button id="button';
				return oWysiwygEditorService.selectUI5Control("button").then(function () {
					return oFakeSelection.setOwner(oWysiwygEditorService).then(function () {
						return oRemoveCmd.execute()
							.then(_.bindKey(oWysiwygEditorService, 'flush'))
							.then(function () {
								return mDocuments.oViewDoc.getContent().then(function (sContent) {
									expect(sContent).to.not.contain(sButtonInXML);
								});
							});
					});
				});
			});

			it("Verify XML control isn't removable", function () {
				return oWysiwygEditorService.selectUI5Control("myXMLView").then(function () {
					return oRemoveCmd._oService.isEnabled().then(function (bResult) {
						expect(bResult).to.be.equal(false);
					});
				});
			});

			it("Verify DT css files", function () {
				return oWysiwygEditorService.getScope().then(function (oScope) {
					var oDesignTimeMetadata = oScope.sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.adapter.designTimeMetadata;

					expect(oScope.$("link[id=" + W5gUtils.getDesignTimeCssId("style.css") + "]")).to.exist;
					jQuery.each(oDesignTimeMetadata, function () {
						if (this.css) {
							expect(oScope.$("link[id=" + W5gUtils.getDesignTimeCssId(this.css) + "]")).to.exist;
						}
					});
				});
			});
		});

		describe("Resource change suite", function () {
			beforeEach(function () {
				return w5gTestUtils.openDocument(oWysiwygEditorService, mDocuments.oViewDoc);
			});

			afterEach(function () {
				return w5gTestUtils.closeAndResetDocument(oWysiwygEditorService, mDocuments.oViewDoc);
			});

			function refreshAndRetrieveEntitySetsFromPropertyPane() {
				// view has change mimic tab switch back to layout editor
				return oWysiwygEditorService.context.event.fireViewHasChanged({editor: oWysiwygEditorService}).then(function () {
					return jQuery("[id$='--dataSet']").control()[0].getItems().map(function (oEntityItem) {
						return oEntityItem.getText();
					});
				});
			}

			it("Data binding should react on metadata file deleted and created again", function () {
				var sOrigContent;

				return refreshAndRetrieveEntitySetsFromPropertyPane().then(function (aEntitySetNames) {
					expect(aEntitySetNames).to.have.length(11);
					return mDocuments.oMetadataXmlDoc.getContent();
				}).then(function (sContent) {
					sOrigContent = sContent;
				}).then(function () {
					return mDocuments.oMetadataXmlDoc.delete();
				}).then(function () {
					return refreshAndRetrieveEntitySetsFromPropertyPane();
				}).then(function (aEntitySetNames) {
					expect(aEntitySetNames).to.be.empty;
				}).then(function () {
					return mDocuments.oModelDir.createFile("metadata.xml");
				}).then(function (oDoc) {
					mDocuments.oMetadataXmlDoc = oDoc;
					return mDocuments.oMetadataXmlDoc.setContent(sOrigContent);
				}).then(function () {
					return refreshAndRetrieveEntitySetsFromPropertyPane();
				}).then(function (aEntitySetNames) {
					expect(aEntitySetNames).to.have.length(11);
				});
			});

			it("Data binding should react on metadata file content change", function () {
				return mDocuments.oMetadataXmlDoc.getContent().then(function (sContent) {
					var sNewContent = sContent.replace('<EntitySet Name="NotificationCollection"', '<EntitySet Name="CHANGED_NotificationCollection"');
					return mDocuments.oMetadataXmlDoc.setContent(sNewContent);
				}).then(function () {
					return refreshAndRetrieveEntitySetsFromPropertyPane();
				}).then(function (aEntitySetNames) {
					expect(aEntitySetNames).to.not.contain("NotificationCollection");
					expect(aEntitySetNames).to.contain("CHANGED_NotificationCollection");
				});
			});
		});

		describe("Commands availability on W5G initialization", function () {
			it("Remove command should not be available when W5G is loading", function () {
				return w5gTestUtils.openDocAndCleanAfter(oWysiwygEditorService, mDocuments.oViewDoc, function () {
					oPrivateW5g._sEditorOpenState = "loading";
					return expect(oRemoveCmd._oService.isAvailable()).to.eventually.be.rejected;
				});
			});
		});
	});
});