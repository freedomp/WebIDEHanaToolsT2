define(["STF", "core/core/platform/plugin/selection/mConsumer/Plugin"], function(STF, oPlugin) {
	"use strict";

	var suiteName = "selectionTest";
	var oSelection;
	var oFocusService;
	var oFocusServiceImpl;
	var oProviderPart1Service;
	var oProviderPart2Service;
	var oTypedSelectionProvider1Service;
	var oTypedSelectionProvider2Service;
	var oNonProviderPartService;
	var oProviderPart1Impl, oProviderPart2Impl, oTypedSelectionProvider1Impl, oTypedSelectionProvider2Impl;
	var eventHandler, typeEventHandler;

	describe("Selection Service test", function() {
		var getService = STF.getServicePartial(suiteName);

		var aSelection1 = [{
			document: {
				id: 1
			}
		}];

		var aSelection2 = [{
			document: {
				id: 2
			}
		}];

		function attachSelctionChangeEventHandler() {
			var eventHandler = function(event) {
				++eventHandler.numberOfTimesCalled;
				eventHandler.event = event;
			};
			eventHandler.numberOfTimesCalled = 0;
			oSelection.attachEvent("changed", eventHandler);

			return eventHandler;
		}

		function attachTypedSelctionChangeEventHandler() {
			var typeEventHandler = function(event) {
				++typeEventHandler.numberOfTimesCalled;
				typeEventHandler.event = event;
			};
			typeEventHandler.numberOfTimesCalled = 0;
			oSelection.attachEvent("typedSelectionChanged", typeEventHandler);

			return typeEventHandler;
		}

		before(function() {
			return STF.startWebIde(suiteName, {
				config: "core/core/platform/plugin/selection/config.json"
			}).then(function() {
				oSelection = getService("selection");
				oFocusService = getService("focus");

				return STF.getServicePrivateImpl(oFocusService).then(function(oFocusImplResult) {
					oFocusServiceImpl = oFocusImplResult;

					define("sap.watt.platform.focus/service/focus", [], oFocusServiceImpl);

					oFocusServiceImpl.focus = null;
					oFocusServiceImpl.getFocus = function() {
						return this.ofocusedService;
					};
					oFocusServiceImpl.change = function(ofocusedService) {
						this.ofocusedService = ofocusedService;
						// Will be handeled in: selection:onFocusChanged
						return this.context.event.fireChanged();
					};

					return Q();
				});

			});
		});

		after(function() {
			STF.shutdownWebIde(suiteName);
		});

		describe("Selection tests", function() {

			before(function() {
				oProviderPart1Service = getService("providerPart1");
				oProviderPart2Service = getService("providerPart2");
				oNonProviderPartService = getService("nonProviderPart");

				oTypedSelectionProvider1Service = getService("TypedSelectionProvider");
				oTypedSelectionProvider2Service = getService("TypedSelectionProvider2");

				define("selectionTestConsumer/providerPart1", [], oProviderPart1Service);

				// Get part1 impl and add override methods
				return Q.all(
					[
						STF.getServicePrivateImpl(oProviderPart1Service),
						STF.getServicePrivateImpl(oProviderPart2Service),
						STF.getServicePrivateImpl(oTypedSelectionProvider1Service),
						STF.getServicePrivateImpl(oTypedSelectionProvider2Service)
					]).spread(function(oImpl1, oImpl2, oImpl3, oImpl4) {
					oProviderPart1Impl = oImpl1;
					oProviderPart2Impl = oImpl2;
					oTypedSelectionProvider1Impl = oImpl3;
					oTypedSelectionProvider2Impl = oImpl4;

					return oFocusServiceImpl.change(oProviderPart1Service).then(function() {
						oPlugin.reset();
					});
				});
			});
			
			function clearHandlers() {
				oPlugin.reset();
				eventHandler.numberOfTimesCalled = 0;
				typeEventHandler.numberOfTimesCalled = 0;
			}

			it("Selection changes", function() {

				//Focus is on part1 because we called: oFocusServiceImpl.change(oProviderPart1Service)
				return oSelection.getSelection().then(function(selection) {
					assert.ok(selection);

					eventHandler = attachSelctionChangeEventHandler();
					typeEventHandler = attachTypedSelctionChangeEventHandler();
					// Switch both providers
					return Q.all([oProviderPart1Impl.change(aSelection1), oProviderPart2Impl.change(aSelection2)]);
				}).then(function() {
					return oSelection.getSelection();
				}).then(function(selection) {
					// The selection checged in the 2 providers. But the focus is only on the first provider which will be returned from the getSelection.
					assert.equal(selection, aSelection1, "Selection is of provider 1");
					expect(eventHandler.numberOfTimesCalled).to.equal(1);
					assert.equal(eventHandler.event.params.owner, oProviderPart1Service);
					assert.equal(eventHandler.event.params.selection, aSelection1, "Selection is of provider 1");

					// Switch to part 2
					clearHandlers();
					return oFocusServiceImpl.change(oProviderPart2Service);
				}).then(function() {
					return oSelection.getSelection();
				}).then(function(selection) {
					assert.equal(selection, aSelection2, "Selection is of provider 2");
					expect(eventHandler.numberOfTimesCalled).to.equal(1);
					assert.equal(eventHandler.event.params.owner, oProviderPart2Service);
					assert.equal(eventHandler.event.params.selection, aSelection2, "Selection is of provider 2");

					// reset
					clearHandlers();

					//Switch to non-selection provider
					return oFocusServiceImpl.change(oNonProviderPartService);
				}).then(function() {
					return oSelection.getSelection();
				}).then(function(selection) {
					assert.deepEqual(selection, [], "Selection is empty");
					expect(eventHandler.numberOfTimesCalled).to.equal(1);
					assert.equal(eventHandler.event.params.owner, oSelection.context.service.dummyselectionprovider);
					assert.deepEqual(eventHandler.event.params.selection, [], "Selection is empty");
					clearHandlers();
					return Q();
				});
			});

			it("Special Selection changes", function() {
				return Q.all([oSelection.getSelection("somethingSpecial"), oSelection.getOwner("somethingSpecial")]).spread(function(selection,
					owner) {
					// No selection provider is set
					assert.deepEqual(selection, [], "Without provider an empty selection is returned");
					assert.equal(owner, oSelection.context.service.dummyselectionprovider); // "Without provider a dummy provider is returned");

					eventHandler.numberOfTimesCalled = 0;
					typeEventHandler.numberOfTimesCalled = 0;

					//Switch typed selection to provider 1
					oProviderPart1Impl.change([]); // new setup
					return oTypedSelectionProvider1Impl.change(oProviderPart1Service);

				}).then(function() {
					return Q.all([oSelection.getSelection("somethingSpecial"), oSelection.getOwner("somethingSpecial")]);
				}).spread(function(selection, owner) {
					assert.deepEqual(selection, [], "Selection is ok");
					assert.equal(owner, oProviderPart1Service); // "Selection provider is correct";
					expect(eventHandler.numberOfTimesCalled).to.equal(0); // "No focus selection event occured"
					expect(typeEventHandler.numberOfTimesCalled).to.equal(1);
					assert.equal(typeEventHandler.event.params.id, "somethingSpecial", "Typed selection event id is correct");
					assert.equal(typeEventHandler.event.params.owner, oProviderPart1Service, "Typed selection event owner is correct");
					assert.deepEqual(typeEventHandler.event.params.selection, [], "Typed selection event selection is correct");

					//Change selection of both providers
					clearHandlers();
					return Q.all([oProviderPart1Impl.change(aSelection1), oProviderPart2Impl.change(aSelection2)]);
				}).then(function() {
					return Q.all([oSelection.getSelection("somethingSpecial"), oSelection.getOwner("somethingSpecial")]);
				}).spread(function(selection, owner) {
					assert.equal(selection, aSelection1, "Typed selection is the one of active provider");
					assert.equal(owner, oProviderPart1Service, "Owner is active provider");
					expect(typeEventHandler.numberOfTimesCalled).to.equal(1);
					assert.equal(typeEventHandler.event.params.id, "somethingSpecial", "Typed selection event id is correct");
					assert.equal(typeEventHandler.event.params.owner, oProviderPart1Service);
					assert.equal(typeEventHandler.event.params.selection, aSelection1, "Typed selection event selection is correct");

					clearHandlers();

					//Switch to provider 2
					return oTypedSelectionProvider1Impl.change(oProviderPart2Service);
				}).then(function() {
					return Q.all([oSelection.getSelection("somethingSpecial"), oSelection.getOwner("somethingSpecial")]);
				}).spread(function(selection, owner) {
					assert.deepEqual(selection, aSelection2, "Selection is ok");
					assert.equal(owner, oProviderPart2Service, "Owner is active provider");
					expect(typeEventHandler.numberOfTimesCalled).to.equal(1);
					assert.equal(typeEventHandler.event.params.id, "somethingSpecial", "Typed selection event id is correct");
					assert.equal(typeEventHandler.event.params.owner, oProviderPart2Service);
					assert.deepEqual(typeEventHandler.event.params.selection, aSelection2, "Typed selection event selection is correct");

					clearHandlers();

					//Switch other selection type provider
					return oTypedSelectionProvider2Impl.change(oProviderPart1Service);
				}).then(function() {
					return Q.all([oSelection.getSelection("somethingSpecial"), oSelection.getOwner("somethingSpecial")]);
				}).spread(function(selection, owner) {
					assert.deepEqual(selection, aSelection2, "Selection is ok");
					assert.equal(owner, oProviderPart2Service, "Owner is active provider");
					expect(typeEventHandler.numberOfTimesCalled).to.equal(1);
					assert.equal(typeEventHandler.event.params.id, "somethingElse", "Typed selection event id is correct");
					assert.equal(typeEventHandler.event.params.owner, oProviderPart1Service, "Owner is active provider");
					assert.deepEqual(typeEventHandler.event.params.selection, aSelection1, "Typed selection event selection is correct");
				});
			});

		});
	});
});