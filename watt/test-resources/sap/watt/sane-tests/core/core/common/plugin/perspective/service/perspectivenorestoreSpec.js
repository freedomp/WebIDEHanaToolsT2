define(["STF"], function(STF) {
	"use strict";

	var suiteName = "perspectivenorestoreTest";
	var oLayoutService, oPreferencesService, oPerspectiveService, origFunc,
		_oImpl;
	describe("perspective no restoretest", function() {
		var getService = STF.getServicePartial(suiteName);

		before(function() {
			var qunitDiv = document.createElement('div');
			qunitDiv.id = 'qunit';
			qunitDiv.className = 'block';
			document.getElementsByTagName('body')[0].appendChild(qunitDiv);
			var content = document.createElement('div');
			content.id = 'content';
			content.className = 'contentStyle';
			var section = document.createElement('section');
			section.id = 'center';
			section.className = 'center';
			content.appendChild(section);
			document.getElementsByTagName('body')[0].appendChild(content);

			return STF.startWebIde(suiteName, {
				config: "core/core/common/plugin/perspective/confignorestore.json"
			}).then(function() {
				oLayoutService = getService("layout");
				oPerspectiveService = getService("perspective");
				oPreferencesService = getService("preferences");
			});
		});

		after(function() {
			STF.shutdownWebIde(suiteName);
		});

		describe("Restorepane", function() {

			before(function() {
				return oPreferencesService._getImpl().then(function(oImpl) {
					return oImpl._oImpl.then(function(_oImpl1) {
						origFunc = _oImpl1.get;
						_oImpl = _oImpl1;
						_oImpl.get = function() {
							return {
								"development": {
									"content": {
										"left": "dummy2",
										"right": "dummy",
										"center_top": "content",
										"center_bottom": "dummy3"
									},
									"left": "21.94148936170213%",
									"right": "61.46456866197183%",
									"center_top": "88%"
								},
								"version": 1,
								"development_lastKnown": {
									"left": "21.94148936170213%",
									"right": "61.46456866197183%",
									"center_top": "88%"
								}
							};
						};
						return oLayoutService.show().then(function() {
							return oPerspectiveService.renderPerspective("development");
						});
					});

				});
			});

			after(function() {
				_oImpl.get = origFunc;
			});

			it("test perspective non restorable pane", function() {
				return Q.all([oPerspectiveService.isAreaVisible("right"), oPerspectiveService.isAreaVisible("left"), oPerspectiveService.isAreaVisible(
					"center_bottom")]).spread(function(bVisibleRight, bVisibleLeft, bVisibleCenterBottom) {
					assert.ok(!bVisibleRight, "non restorable pane should not be visibale");
					assert.ok(!bVisibleCenterBottom, "non restorable pane should not be visibale");
					assert.ok(bVisibleLeft, "restorable pane should be visibale");
				});
			});

		});
	});
});