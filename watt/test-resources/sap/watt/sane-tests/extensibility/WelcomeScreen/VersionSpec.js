define(['STF', "sap/watt/ideplatform/plugin/welcomescreen/service/Version"],
	function (STF, Version) {
		"use strict";

		var oVersionService = null;

		describe('Version service - service tests', function () {
			before(function () {
				var oContext = {};
				oContext.service = {};
				oContext.service.preferences = {
					_settings : {},

					get : function(oNode) {
						return Q(this._settings[oNode]);
					},

					set : function(oSettings, oNode) {
						this._settings[oNode] = oSettings;
						return Q(true);
					},

					remove : function(oNode) {
						if (this._settings[oNode]) {
							this._settings[oNode] = undefined;
						}
						return Q(true);
					}
				};

				oVersionService = Version;
				oVersionService.context = oContext;
			});

			it("Tests setLastSeenVersion method",function() {
				return oVersionService.setLastSeenVersion("1.2.3").then(function() {
					return oVersionService.getLastSeenVersion().then(function (sVersion) {
						expect(sVersion).to.equal("1.2.3");
					});
				}).then(function () {
					return oVersionService.setLastSeenVersion("1.20").then(function() {
						return oVersionService.getLastSeenVersion().then(function (sVersion) {
							expect(sVersion).to.equal("1.20");
						});
					});
				});

			});

			it("Tests compareVersions method", function () {
				var iCompare1 = oVersionService.compareVersions("1.1", "1.2");
				expect(iCompare1 < 0).to.equal(true);

				var iCompare2 = oVersionService.compareVersions("1.2", "1.0");
				expect(iCompare2 > 0).to.equal(true);

				var iCompare3 = oVersionService.compareVersions("1.2.3", "1.2");
				expect(iCompare3 > 0).to.equal(true);

				var iCompare4 = oVersionService.compareVersions("1.2", "1.2");
				expect(iCompare4).to.equal(0);

				expect(function() {
					oVersionService.compareVersions("1.2.3", "foo.goo");
				}).to.throw("Illegal version detected!");
			});
		});
	});
