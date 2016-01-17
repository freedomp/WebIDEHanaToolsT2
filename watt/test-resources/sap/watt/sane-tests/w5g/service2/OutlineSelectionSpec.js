define(["sap/watt/lib/lodash/lodash", "STF"], function (_, STF) {
	"use strict";

	var suiteName = "Outline selection", getService = STF.getServicePartial(suiteName),
		oWindow, jQuery, oW5GOutline, oPrivateOutline, oFakeEditor, oEditorView, oW5GOutlineView;

	describe(suiteName, function () {

		before(function () {
			return STF.startWebIde(suiteName, {
				config: "w5g/config.json",
				html: "w5g/service2/w5geditor.html"
			}).then(function (_oWindow) {
				oWindow = _oWindow;
				jQuery = oWindow.jQuery;
				return STF.require(suiteName, ["sane-tests/w5g/w5gTestUtils"]).spread(function (w5gTestUtils) {
					var oProjectSettings = getService('setting.project');
					w5gTestUtils.initializeBeforeServiceTest(oProjectSettings);
					oW5GOutline = getService('w5gOutline');
					var mConsumer = {
						"name": "testConsumer",
						"requires": {
							"services": [
								"w5gOutline"
							]
						},
						"provides": {
							"services": {
								"fakeEditor": {
									"implements": "sap.watt.common.fake.editor",
									"module": "w5g/service2/FakeEditor"
								}
							},
							"interfaces": {
								"sap.watt.common.fake.editor": {
									"extends": "sap.watt.saptoolsets.fiori.editor.ui5wysiwygeditor.WYSIWYGEditor"
								}
							}
						}
					};
					return STF.register(suiteName, mConsumer).then(function () {
						oFakeEditor = getService("fakeEditor");
						return Q.spread([oFakeEditor.getContent(), oW5GOutline.getContent()], function (oFakeView, oOutlineView) {
							oEditorView = oFakeView;
							oW5GOutlineView = oOutlineView;
							w5gTestUtils.placeAt("editor", oEditorView);
							w5gTestUtils.placeAt("outline", oW5GOutlineView);
							return STF.getServicePrivateImpl((oW5GOutline));
						}).then(function (oPrivate) {
							oPrivateOutline = oPrivate;
						});
					});
				});
			});
		});

		after(function () {
			oEditorView.destroy();
			oW5GOutlineView.destroy();
			STF.shutdownWebIde(suiteName);
		});

		it("Tests with fake wysiwyg", function () {
			var fakeDoc = {
				getKeyString: _.wrap("fake.doc")
			};
			return oFakeEditor.open(fakeDoc)
				.then(function () {
					return oPrivateOutline.onViewHasChanged({params: {editor: oFakeEditor}});
				})
				.then(function () {
					assertTreeIsRendered();
				})

				.then(function () {
					return oPrivateOutline.onViewElementSelected({
						params: {
							selection: [{
								document: fakeDoc,
								control: oWindow.sap.ui.getCore().byId("fakeButton")
							}],
							owner: oFakeEditor
						}
					});
				})
				.then(function () {
					assertNodeIsSelected("fakeButton");
				})

				.then(function () {
					return oPrivateOutline.onViewElementSelected({
						params: {
							selection: [{
								document: fakeDoc
							}],
							owner: oW5GOutline
						}
					});
				})
				.then(function () {
					assertNoException();
				})

				.then(function () {
					return oPrivateOutline.onViewElementSelected({
						params: {
							selection: [{
								document: fakeDoc
							}],
							owner: oFakeEditor
						}
					});
				})
				.then(function () {
					assertNoNodeIsSelected();
				});
		});

		var assertTreeIsRendered = function () {
			// 3 controls build up at least 3 nodes, we don't know how many properties
			// and how many aggregations they'll have tomorrow :-)
			assert.ok(jQuery(".sapUiTreeNode").length > 3, "Tree for a fake editor is built");
		};

		var assertNodeIsSelected = function (sTagName) {
			assert.ok(jQuery(".sapUiTreeNodeSelected").attr("tag"), sTagName, "Node " + sTagName + " is selected");
		};

		var assertNoNodeIsSelected = function () {
			assert.ok(jQuery(".sapUiTreeNodeSelected").length === 0, "No node is selected");
		};

		var assertNoException = function () {
			assert.ok(true, "No exception thrown when selecting control in outline and not in editor");
		};
	});

});
