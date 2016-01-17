define(['STF'], function (STF) {
	"use strict";

	var suiteName = "WelcomeScreenPersistency_Service";
	var iFrameWindow = null;
	var oWelcomeScreenPersistency;

	describe('WelcomeScreenPersistency service - service tests', function () {

		before(function (done) {
			STF.startWebIde(suiteName).then(function (_iFrameWindow) {
				iFrameWindow = _iFrameWindow;
				oWelcomeScreenPersistency = STF.getService(suiteName, "WelcomeScreenPersistency");

				oWelcomeScreenPersistency.context.service.preferences = {
					_settings : {},

					get : function(oNode) {
						var oDeferred = Q.defer();
						oDeferred.resolve(this._settings[oNode]);
						return oDeferred.promise;
					},

					set : function(oSettings, oNode) {
						var oDeferred = Q.defer();
						this._settings[oNode] = oSettings;
						oDeferred.resolve(true);
						return oDeferred.promise;
					},

					remove : function(oNode) {
						var oDeffered = Q.defer();
						if(this._settings[oNode]) {
							this._settings[oNode] = undefined;
						}
						oDeffered.resolve(true);
						return oDeffered.promise;
					}
				};

				done();
			});
		});

		it('Tests getPerspectiveSettings method', function() {

			return oWelcomeScreenPersistency.setPerspectiveSettings({bIsOpen : true}).then(function() {
				return oWelcomeScreenPersistency.getPerspectiveSettings().then(function (oSettings) {
					expect(oSettings.bIsOpen).to.equal(true);
				});
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});
	});
});
