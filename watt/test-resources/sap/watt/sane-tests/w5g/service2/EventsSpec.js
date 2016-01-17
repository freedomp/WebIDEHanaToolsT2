define(["STF", "sap/watt/lib/lodash/lodash"], function (STF, _) {
	"use strict";
	var suiteName = "Events manipulation", getService = STF.getServicePartial(suiteName);
	describe(suiteName, function () {
		var w5gTestUtils, oWysiwygEditorService, oW5gPropertiesService, oPropertiesServiceImpl, mDocuments, w5gUtils;

		before(function () {
			return STF.startWebIde(suiteName, {
				config: "w5g/config.json",
				html: "w5g/service2/w5geditor.html"
			}).then(function () {
				return STF.require(suiteName, ["sane-tests/w5g/w5gTestUtils", "sap.watt.saptoolsets.fiori.editor.ui5wysiwygeditor/utils/W5gUtils"]).spread(function (util, _w5gUtils) {
					w5gTestUtils = util;
					w5gUtils = _w5gUtils;
					var oProjectSettings = getService('setting.project');
					w5gTestUtils.initializeBeforeServiceTest(oProjectSettings);
					oWysiwygEditorService = getService('ui5wysiwygeditor');
					oWysiwygEditorService.context.service.ui5projecthandler.getAttribute = function () {
						return Q({
							resourceRoots: {
								"xmlView.Events": "/xmlView/Events",
								"xmlView.EventsSimpleController": "/xmlView/EventsSimpleController",
								"xmlView.EventsEmptyController": "/xmlView/EventsEmptyController"
							}
						});
					};
					oWysiwygEditorService.context.service.ui5projecthandler.getHandlerFilePath = _.wrap("dummy1");
					oWysiwygEditorService.context.service.ui5projecthandler.getAppNamespace = _.wrap("dummy2");
					oW5gPropertiesService = getService('w5gproperties');
					return w5gTestUtils.configureEditor(getService, "ace");
				}).then(function () {
					return w5gTestUtils.retrieveDocumentsAndSetupW5G(getService);
				}).then(function (mDocs) {
					mDocuments = mDocs;
					return STF.getServicePrivateImpl(oW5gPropertiesService);
				}).then(function (oPrivate) {
					oPropertiesServiceImpl = oPrivate;
				});
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});

		function createNewFunctionAndAssignToEventField(sEventName, sFunctionName, retrieveControlFromViewFunction) {
			return oWysiwygEditorService.getRoot().then(function (oView) {
				var oControl = retrieveControlFromViewFunction(oView);
				return w5gTestUtils.selectAndRefreshUI(oControl, oWysiwygEditorService).then(function () {
					return getEventsForCurrentSelection().then(function (aEvents) {
						var iEventIndex = _.findIndex(aEvents, {name: sEventName});
						var sFieldValuePath = "/events/" + iEventIndex + "/value";
						return oPropertiesServiceImpl.addFunctionToController(oW5gPropertiesService.context, sFunctionName, sFieldValuePath);
					});
				});
			});
		}

		function getEventsForCurrentSelection() {
			return w5gTestUtils.switchToEventsSection(oW5gPropertiesService).then(function (oEventsSection) {
				return oEventsSection.getContent()[0].getModel().getProperty('/events');
			});
		}

		function getEventFieldFromPanelByName(oDocument, sEventName, retrieveControlFromViewFunction) {
			return w5gTestUtils.openDocAndCleanAfter(oWysiwygEditorService, oDocument, function () {
				return oWysiwygEditorService.getRoot().then(function (oView) {
					return getEventsPanelValueForControl(retrieveControlFromViewFunction(oView), sEventName);
				});
			});
		}

		function changeEventsUsingPanelForControl(oControl, sEventName, aCtrlFuncValue) {
			return w5gTestUtils.selectAndRefreshUI(oControl, oWysiwygEditorService).then(function () {
				w5gTestUtils.getFieldByInnerId(sEventName).setValue(aCtrlFuncValue);
			});
		}

		function getEventsPanelValueForControl(oControl, sEventName) {
			return w5gTestUtils.selectAndRefreshUI(oControl, oWysiwygEditorService).then(function () {
				return w5gTestUtils.getFieldByInnerId(sEventName);
			});
		}

		function testChangeViaEventsPanel(sEvent, newHandlerVal, sId, retrieveControlFromViewFunction) {
			return assert.eventually.equal(w5gTestUtils.openDocAndCleanAfter(oWysiwygEditorService, mDocuments.oEventsView, function () {
				return oWysiwygEditorService.getRoot().then(function (oView) {
					var oControl = retrieveControlFromViewFunction(oView);
					return changeEventsUsingPanelForControl(oControl, sEvent, newHandlerVal)
						.then(_.bindKey(oWysiwygEditorService, 'flush'))
						.then(_.bindKey(mDocuments.oEventsView, 'getContent'))
						.then(function (sContent) {
							return w5gTestUtils.getAttributeFromXML(sContent, sId, sEvent);
						});
				});
			}), newHandlerVal, sId + " " + sEvent + " event should change to " + newHandlerVal);
		}

		function navigateToControllerAndSelectFunction(oDocument, sFunctionName) {
			return w5gTestUtils.openDocAndCleanAfter(oWysiwygEditorService, oDocument, function () {
				return oPropertiesServiceImpl.navigateToController(oW5gPropertiesService.context, sFunctionName);
			});
		}

		function testGoToFunction(oView, sControllerName, sFunctionName, iExpectedLineNumber) {
			return navigateToControllerAndSelectFunction(oView, sFunctionName).then(function () {
				return getService('content').getCurrentEditor();
			}).then(function (oEditor) {
				return Q.all([oEditor.getName(), oEditor.getCurrentFilePath(), oEditor.getSelectionRange(), oEditor.getUI5Editor()]);
			}).spread(function (sEditorName, sFilePath, oRange, oUI5Editor) {
				assert.equal(sEditorName, 'aceeditor');
				assert.ok(_.endsWith(sFilePath, sControllerName + '.controller.js'));
				assert.equal(oRange.end.row, iExpectedLineNumber);
				var pos = oUI5Editor.getCursorPosition();
				assert.equal(pos.row, oRange.end.row);
			});
		}

		it("open w5g editor and switch to Events pane", function () {
			return w5gTestUtils.openDocAndCleanAfter(oWysiwygEditorService, mDocuments.oEventsView, function () {
				return w5gTestUtils.switchToEventsSection(oW5gPropertiesService);
			});
		});

		it("Select button of the canvas and check that its events are bounded to the events view", function () {

			var aExpectedEvents = ["press", "tap", "validateFieldGroup", "formatError", "parseError", "validationError", "validationSuccess"];

			return w5gTestUtils.openDocAndCleanAfter(oWysiwygEditorService, mDocuments.oEventsView, function () {
				return oWysiwygEditorService.getRoot().then(function (oView) {
					var oControl = oView.byId("__button0");
					return w5gTestUtils.selectAndRefreshUI(oControl, oWysiwygEditorService).then(function () {
						return getEventsForCurrentSelection().then(function (aEvents) {
							var aEventNames = _.map(aEvents, "name");
							assert.deepEqual(aEventNames, aExpectedEvents, "button events should be as expected. actual: " + aEventNames.join(",") + " Expected: " + aExpectedEvents.join(","));
						});
					});
				});
			});
		});

		it("Select button of the canvas and check that the controller methods are listed in the events combo", function () {
			return getEventFieldFromPanelByName(mDocuments.oEventsView, 'press', function (oView) {
				return oView.byId("__button0");
			}).then(function (oValueField) {
				assert.deepEqual(_.map(oValueField.getItems(), function (oItem) {
					return oItem.getText();
				}), ["", "action1", "action2"], "events combo should contain action1 and action2 events and empty value");
			});
		});

		it("Select button of the canvas and check that the simple controller methods are listed in the events combo", function () {
			return getEventFieldFromPanelByName(mDocuments.oEventsSimpleCtrlView, 'press', function (oView) {
				return oView.byId("__button0");
			}).then(function (oValueField) {
				assert.deepEqual(_.map(oValueField.getItems(), function (oItem) {
					return oItem.getText();
				}), ["", "action1", "action2"], "events combo should contain action1 and action2 events and empty value");
			});
		});

		it("Select button of the canvas with empty controller and check that there are no values in the events combo", function () {
			return getEventFieldFromPanelByName(mDocuments.oEventsEmptyCtrlView, 'press', function (oView) {
				return oView.byId("__button0");
			}).then(function (oValueField) {
				assert.deepEqual(_.map(oValueField.getItems(), function (oItem) {
					return oItem.getText();
				}), [""], "events combo should contain empty value only");
			});
		});

		it("Select button of the canvas and check that its event are reflected in the events pane", function () {
			return getEventFieldFromPanelByName(mDocuments.oEventsView, 'press', function (oView) {
				return oView.byId("__button0");
			}).delay().then(function (oValueField) {
				assert.equal(oValueField.getValue(), "action1", "button press event should be bounded to action1 function");
			});
		});

		it("Change button event via event pane and check the xml code after flush", function () {
			return testChangeViaEventsPanel("press", "action2", "__button0", function retrieveControlFromView(oView) {
				return oView.byId("__button0");
			});
		});

		it("load view which has no controller and verify that a proper message is loaded", function () {
			return w5gTestUtils.openDocAndCleanAfter(oWysiwygEditorService, mDocuments.oDataBindingTestViewDoc, function () {
				return oWysiwygEditorService.getRoot().then(function (oView) {
					var oControl = oView.byId('masterPage');
					return w5gTestUtils.selectAndRefreshUI(oControl, oWysiwygEditorService).then(function () {
						return w5gTestUtils.switchToEventsSection(oW5gPropertiesService).then(function (oEventsSection) {
							var oEventsView = oEventsSection.getContent()[0];
							var oEventsEditor = oEventsView.byId('eventseditor');
							assert.equal(oEventsEditor.getMessage(), "The controller for this view is unreachable or its code cannot be parsed.", "proper message should appear");
						});
					});
				});
			});
		});

		it("Add new function and verify that is where added to both controller and filed value", function () {

			var sFuncNameToAdd = "testFunc";
			var sNewFunctionTemplate =
				"/**" +
				"*@memberOf xmlView.Events" +
				"*/" +
				"testFunc: function () {" +
				"	//This code was generated by the layout editor." +
				"}";

			var fRetrieveControlFromViewFunction = function (oView) {
				return oView.byId("__button0");
			};

			return w5gTestUtils.openDocAndCleanAfter(oWysiwygEditorService, mDocuments.oEventsView, function () {
				return createNewFunctionAndAssignToEventField('press', sFuncNameToAdd, fRetrieveControlFromViewFunction).then(function () {
					return oWysiwygEditorService.getScope().then(function (oScope) {
						return oWysiwygEditorService.getRoot().then(function (oView) {
							return w5gUtils.getControllerDocument(oW5gPropertiesService.context, oView, oScope).then(function (oDocument) {
								//test that the function code was added to the controller
								return oDocument.getContent().then(function (sContent) {
									assert.ok(_.contains(sContent.replace(/(\n|\t|\r)/g, ""), sNewFunctionTemplate.replace(/(\n|\t|\r)/g, "")), "new function template should be part of controllers code");
									//test that the function name was added to the event field
									return getEventsPanelValueForControl(fRetrieveControlFromViewFunction(oView), 'press').then(function (oValueField) {
										assert.equal(oValueField.getValue(), sFuncNameToAdd, "button press event should be bounded to " + sFuncNameToAdd + " function");
									});
								});
							});
						});
					});
				});
			});
		});

		it("Add new function to a non-dirty controller and verify the controller has been saved", function () {

			var sFuncNameToAdd = "testFunc";

			var fRetrieveControlFromViewFunction = function (oView) {
				return oView.byId("__button0");
			};

			return w5gTestUtils.openDocAndCleanAfter(oWysiwygEditorService, mDocuments.oEventsView, function () {
				return createNewFunctionAndAssignToEventField('press', sFuncNameToAdd, fRetrieveControlFromViewFunction).then(function () {
					return oWysiwygEditorService.getScope().then(function (oScope) {
						return oWysiwygEditorService.getRoot().then(function (oView) {
							return w5gUtils.getControllerDocument(oW5gPropertiesService.context, oView, oScope).then(function (oDocument) {
								assert.ok(!oDocument.isDirty(), "controller should not be dirty as the content has been saved");
							});
						});
					});
				});
			});
		});

		it("Add new function to a dirty controller and verify the controller has not been saved", function () {

			var sFuncNameToAdd = "testFunc";

			var fRetrieveControlFromViewFunction = function (oView) {
				return oView.byId("__button0");
			};

			return w5gTestUtils.openDocAndCleanAfter(oWysiwygEditorService, mDocuments.oEventsView, function () {
				return oWysiwygEditorService.getScope().then(function (oScope) {
					return oWysiwygEditorService.getRoot().then(function (oView) {
						return w5gUtils.getControllerDocument(oW5gPropertiesService.context, oView, oScope).then(function (oDocument) {
							return oDocument.getContent().then(function (sContent) {
								return oDocument.setContent(sContent + "\n\  \n").then(function () {
									assert.ok(oDocument.isDirty(), "controller should be dirty after change");
									return createNewFunctionAndAssignToEventField('press', sFuncNameToAdd, fRetrieveControlFromViewFunction).then(function () {
										return w5gUtils.getControllerDocument(oW5gPropertiesService.context, oView, oScope).then(function (oDocument) {
											assert.ok(oDocument.isDirty(), "controller should be still dirty as the content has not been saved");
										});
									});
								});
							});
						});
					});
				});
			});
		});

		it("verify navigation to controller without selection of a function code", function () {
			return testGoToFunction(mDocuments.oEventsView, 'Events', undefined, 0);
		});

		it("verify navigation to controller with selection of a function code", function () {
			return testGoToFunction(mDocuments.oEventsView, 'Events', "action1", 8);
		});

	});
});
