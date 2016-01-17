"use strict";
define(['STF', 'sinon'], function (STF, sinon) {

	var suiteName = "intellisenceCommand";

	var SelectionOwner = function (sServiceName, bIsVisible) {

		this.sServiceName = sServiceName;
		this.bIsVisible = bIsVisible;

		this.instanceOf = function (sOtherServiceName) {
			return sOtherServiceName === sServiceName;
		};

		this.getVisible = function () {
			return Q(bIsVisible);
		};
	};

	describe('Integration Test without UI Example + custom config', function () {
		// this timeout is inherited for the entire "describe" suite
		var oCommandService;
		var oIntellisenceCommand;
		var oSelectionService;


		before(function () {
			var loadWebIdePromise = STF.startWebIde(suiteName, {config : "examples/intellisence/config.json"});
			return loadWebIdePromise.then(function () {
				oCommandService = STF.getService(suiteName, "command");
				oSelectionService = STF.getService(suiteName, "selection");
				var sIntellisenceCommandID = "intellisence";
				// note the way we return even the inner promise, otherwise mocha won't wait for the inner
				// one to resolve too.
				return oCommandService.getCommand(sIntellisenceCommandID).then(function (oCommand) {
					oIntellisenceCommand = oCommand;
				});
			});
		});

		it('"Intellisence command status while ace editor is visible but not in focus"', function () {
			var oSelectionOwner = new SelectionOwner("sap.watt.common.service.ui.Browser", true);
			var getSelectionOwnerStub = sinon.stub(oSelectionService, "getOwner").returns(Q(oSelectionOwner));
			return oIntellisenceCommand._oService.isEnabled().then(function (bIsEnabled) {
				expect(bIsEnabled).to.equal(false);
				getSelectionOwnerStub.restore();
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});
	});
});
