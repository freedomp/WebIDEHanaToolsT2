define(["STF"], function (STF) {
	"use strict";
	var suiteName = "W5gServiceUtils", getService = STF.getServicePartial(suiteName);
	describe(suiteName, function () {
		var W5gUtils, ResourcesHelper, w5gTestUtils, oUsernotification, oContext;

		before(function () {
			jQuery.sap.require("sap.ui.commons.Toolbar");
			jQuery.sap.require("sap.ui.commons.Button");
			jQuery.sap.require("sap.ui.commons.Panel");
			return STF.startWebIde(suiteName, {
				config: "w5g/config.json",
				html: "w5g/service1/w5geditor.html"
			}).then(function () {
				return STF.require(suiteName, [
					"sap/watt/saptoolsets/fiori/editor/plugin/ui5wysiwygeditor/utils/W5gUtils",
					"sap/watt/saptoolsets/fiori/editor/plugin/ui5wysiwygeditor/utils/ResourcesHelper",
					"sane-tests/w5g/w5gTestUtils"
				]).spread(function (_W5gUtils, _ResourcesHelper, _W5gTestUtils) {
					W5gUtils = _W5gUtils;
					ResourcesHelper = _ResourcesHelper;
					w5gTestUtils = _W5gTestUtils;
					oUsernotification = getService('usernotification');
					return STF.getServicePrivateImpl(getService('ui5wysiwygeditor')).then(function (oW5gPrivate) {
						oContext = oW5gPrivate.context;
					});
				});
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});


		function presetNotificationConfirmValue(bVal) {
			oUsernotification.setConfirmValue({bResult: bVal});
		}

		it("delete control with content. user choose YES in the confirmation popup", function () {
			return Q().then(function () {
				//generate control
				var oToolbar = new sap.ui.commons.Toolbar({
					text: "fake toolbar for deleting",
					id: "fakeToolbarDelete"
				});

				oToolbar.addItem(new sap.ui.commons.Button({
					text: "fake button inside toolbar",
					id: "fakeToolbarDeleteButton"
				}));

				presetNotificationConfirmValue(true);
				return W5gUtils.deleteControlWithConfirmationDialog(oToolbar, oContext).then(function (oResult) {
					assert.ok(oResult.bResult === true, "User choose to delete");
				});

			});
		});

		it("delete control with content. user choose No in the confirmation popup", function () {
			return Q().then(function () {
				//generate control
				var oToolbar2 = new sap.ui.commons.Toolbar({
					text: "fake toolbar for not deleting",
					id: "fakeToolbarNotDelete"
				});

				oToolbar2.addItem(new sap.ui.commons.Button({
					text: "fake button inside toolbar not for delete",
					id: "fakeToolbarNotDeleteButton"
				}));

				presetNotificationConfirmValue(false);
				return W5gUtils.deleteControlWithConfirmationDialog(oToolbar2, oContext).then(function (oResult) {
					assert.ok(oResult.bResult === false, "User choose to not to delete");
				});

			});
		});

		it("delete control with no content. confirmation popup should not raise", function () {
			return Q().then(function () {
				//generate control
				var oButton = new sap.ui.commons.Button({
					text: "test delete button",
					id: "buttonForDelete"
				});

				presetNotificationConfirmValue(false);
				return Q(W5gUtils.deleteControlWithConfirmationDialog(oButton, oContext)).then(function (oResult) {
					assert.ok(oResult.sResult === "YES", "Confirmation Popup didn't raise. automatic delete");
				});
			});
		});

		it("delete control with empty content. confirmation popup should not raise", function () {
			return Q().then(function () {
				//generate control
				var oPanel = new sap.ui.commons.Panel({
					id: "panelId"
				});

				presetNotificationConfirmValue(false);
				return Q(W5gUtils.deleteControlWithConfirmationDialog(oPanel, oContext)).then(function (oResult) {
					assert.ok(oResult.sResult === "YES", "Confirmation Popup didn't raise. automatic delete");
				});

			});
		});

		it("delete control with content- content is empty container. confirmation popup should appear", function () {
			return Q().then(function () {
				//generate control
				var oToolbar = new sap.ui.commons.Toolbar({
					id: "toolbarId"
				});

				oToolbar.addItem(new sap.ui.commons.Toolbar({
					id: "InsideToolbarId"
				}));

				presetNotificationConfirmValue(true);
				return W5gUtils.deleteControlWithConfirmationDialog(oToolbar, oContext).then(function (oResult) {
					assert.ok(oResult.bResult === true, "User choose to not to delete");
				});

			});
		});

		it("Test user preferences", function () {
			return Q().then(function () {
				(function () {
					var _mSettings = {};
					oContext.service.preferences = {
						get: function () {
							return Q(jQuery.extend({}, _mSettings));
						},
						set: function (mSettings) {
							_mSettings = mSettings;
							return Q();
						}
					};
				})();

				//add new value
				ResourcesHelper.init(oContext);
				ResourcesHelper.updateUserPreferences({_test_: "test value"}).then(function () {
					ResourcesHelper.retrieveUserPreferences().then(function (mSettings) {
						assert.deepEqual(mSettings, {_test_: "test value"}, "value1 is created");
					}).then(function () {

						//update existing value
						ResourcesHelper.updateUserPreferences({_test_: "test value2"}).then(function () {
							ResourcesHelper.retrieveUserPreferences().then(function (mSettings) {
								assert.deepEqual(mSettings, {_test_: "test value2"}, "value1 is updated");
							}).then(function () {

								//add another value
								ResourcesHelper.updateUserPreferences({_test1_: "test value1"}).then(function () {
									ResourcesHelper.retrieveUserPreferences().then(function (mSettings) {
										assert.deepEqual(mSettings, {
											_test_: "test value2", _test1_: "test value1"
										}, "value2 is created");
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

