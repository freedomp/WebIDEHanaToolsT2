define(["sap/watt/core/Proxy", "sap/watt/core/Interface", "sap/watt/core/q"], function (Proxy, Interface, coreQ) {
	"use strict";

	describe("Proxy tests", function () {

		window.Q = coreQ;
		window.sap = window.sap|| {};
		window.sap.watt = {};
		window.sap.watt.getEnv = function () {
			};
		describe("Interfaces", function () {

			it("Single", function () {
				return Proxy.create("myProxy", {
					module: "core/core/framework/proxy/TestProxy",
					"implements": "core.core.framework.proxy.TestProxy"
				}).then(function (oProxy) {
					expect(oProxy.getFoo, "getFoo method available").to.be.ok;
					expect(oProxy.getFooPromise, "getFooPromise method available").to.be.ok;
					expect(oProxy.$getInterface().hasInterfaces(), "Proxy has interfaces").to.be.ok;
				});
			});

			it("Create with module", function () {
				return Proxy.create("myProxy", {
					module: "core/core/framework/proxy/TestProxy"
				}).then(function (oProxy) {
					expect(oProxy, "Creation of Proxy works").to.be.ok;
					expect(!oProxy.$getInterface().hasInterfaces(), "Proxy has no interfaces").to.be.ok;
				});
			});



			it("Register Interface", function () {
				Interface.register("someName", "core/core/framework/proxy/TestProxy.json");

				return Proxy.create("myProxy", {
					module: "core/framework/proxy/TestProxy",
					"implements": "someName"
				}).then(function (oProxy) {
					expect(oProxy.getFoo, "getFoo method available").to.be.ok;
					expect(oProxy.getFooPromise, "getFooPromise method available").to.be.ok;
					expect(oProxy.$getInterface().hasInterfaces(), "Proxy has interfaces").to.be.ok;
				});
			});
			it("Register inline Interface", function () {
				Interface.register("someInlineInterface", {
					"methods": {
						"getFoo": {},
						"getFooPromise": {}
					}
				});

				return Proxy.create("myProxy", {
					module: "core/core/framework/proxy/TestProxy",
					"implements": "someInlineInterface"
				}).then(function (oProxy) {
					expect(oProxy.getFoo, "getFoo method available").to.be.ok;
					expect(oProxy.getFooPromise, "getFooPromise method available").to.be.ok;
					expect(oProxy.$getInterface().hasInterfaces(), "Proxy has interfaces").to.be.ok;
				});
			});

			//Default implementation test 1
			it("Register default values", function () {
				Interface.register("someInterfaceWithDefValues", {
					"methods": {
						"getDefFoo": {
							returns: {
								"type": "boolean",
								"default": true
							}
						},
						"getFooPromise": {}
					}
				});

				return Proxy.create("DefValueProxy", {
					module: "core/core/framework/proxy/TestProxy",
					"implements": "someInterfaceWithDefValues"
				}).then(function (oProxy) {
					expect(oProxy.getDefFoo, "getDefFoo method available").to.be.ok;
					return oProxy.getDefFoo().then(function (defVal) {
						assert.equal(defVal, true, "Default value returned successfuly");
					});
				});
			});

			it("Register default values - Void", function () {
				Interface.register("someInterfaceWithVoid", {
					"methods": {
						"getDefFoo": {}
					}
				});

				return Proxy.create("VoidProxy", {
					module: "core/core/framework/proxy/TestProxy",
					"implements": "someInterfaceWithVoid"
				}).then(function (oProxy) {
					return oProxy.getDefFoo().then(function (defVal) {
						assert.equal(defVal, null, "Void handled successfuly");
					});
				});
			});
		});
		describe("Method invokation", function () {
			var _oProxy;
			before(function () {
				var that = this;
				return Proxy.create("myProxy", {
					module: "core/core/framework/proxy/TestProxy"
				}).then(function (oProxy) {
					_oProxy = oProxy;
				});
			});

			after(function () {
				_oProxy = null;
			});


			it("Internal invoke method", function () {
				return _oProxy.$invoke("getFoo", {}).then(function (sFoo) {
					assert.equal(sFoo, "foo", "return value is right");
				});
			});

			it("Internal invoke method with promise returned", function () {
				return _oProxy.$invoke("getFooPromise", {}).then(function (sFoo) {
					assert.equal(sFoo, "foo", "return value is right");
				});
			});

			it("Internal invoke method with promises array returned and wrapped in promise", function () {
				return _oProxy.$invoke("getFooPromisesArray", {}).then(function (aFoo) {
					assert.deepEqual(aFoo, ["foo", "foo", "foo", "foo", "foo"], "return value is right");
				});
			});
		});

		describe("Events", function () {

			it("Without params", function () {
				return Proxy.create("myProxy", {
					module: "core/core/framework/proxy/TestProxy",
					"implements": "core.core.framework.proxy.TestProxy"
				}).then(function (oProxy) {
					oProxy.attachEvent("eventWithNoParams", function (oEvent) {
						assert.equal(oEvent.source, oProxy, "Source equals proxy");
						assert.equal(oEvent.name, "eventWithNoParams", "event name is set right");
						assert.ok(!oEvent.args, "No args available");
						assert.ok(oEvent.params, "Params object available");
						assert.equal(oEvent.params.foo, "eventWithNoParams", "Params object is passed");
					});
					return oProxy.methodWhichFiresEventWithNoParams();
				});
			});

			it("With params", function () {
				return Proxy.create("myProxy", {
					module: "core/core/framework/proxy/TestProxy",
					"implements": "core.core.framework.proxy.TestProxy"
				}).then(function (oProxy) {
					oProxy.attachEvent("eventWithParams", function (oEvent) {
						assert.equal(oEvent.source, oProxy, "Source equals proxy");
						assert.equal(oEvent.name, "eventWithParams", "event name is set right");
						assert.ok(!oEvent.args, "No args available");
						assert.ok(oEvent.params, "params object available");
						assert.equal(oEvent.params.foo, "foo", "param foo available");
						assert.equal(oEvent.params.bar, "bar", "param bar available");
						assert.equal(oEvent.params.fooBar, "fooBar", "param fooBar available");
					});
					return oProxy.methodWhichFiresEventWithParams();
				});
			});

			it("Defererd event handlers", function () {
				return Proxy.create("myProxy", {
					module: "core/core/framework/proxy/TestProxy",
					"implements": "core.core.framework.proxy.TestProxy"
				}).then(function (oProxy) {
					var bTimeoutCalledBefore1 = false;
					var bTimeoutCalledBefore2 = false;
					oProxy.attachEvent("eventWithDeferredHandlers", function (oEvent) {
						var oDeferred = Q.defer();
						setTimeout(function () {
							bTimeoutCalledBefore1 = true;
							oDeferred.resolve();
						}, 100);
						return oDeferred.promise;
					});
					oProxy.attachEvent("eventWithDeferredHandlers", function (oEvent) {
						var oDeferred = Q.defer();
						setTimeout(function () {
							bTimeoutCalledBefore2 = true;
							oDeferred.resolve();
						}, 140);
						return oDeferred.promise;
					});
					return oProxy.methodWhichFiresEventWithDeferredHandlers().then(function () {
						assert.ok(bTimeoutCalledBefore1, "Deferred handler 1 called first");
						assert.ok(bTimeoutCalledBefore2, "Deferred handler 2 called first");
					});
				});
			});

			it("Failing event handlers", function () {
				return Proxy.create("myProxy", {
					module: "core/core/framework/proxy/TestProxy",
					"implements": "core.core.framework.proxy.TestProxy"
				}).then(function (oProxy) {
					var bSecondEventHandlerWasCalled = false;
					oProxy.attachEvent("eventWithNoParams", function (oEvent) {
						throw new Error("Error in event");
					});
					oProxy.attachEvent("eventWithNoParams", function (oEvent) {
						bSecondEventHandlerWasCalled = true;
					});
					return oProxy.methodWhichFiresEventWithNoParams().fail(function () {
						assert.ok(bSecondEventHandlerWasCalled, true);
					});
				});
			});

			it("Attach once", function () {
				return Proxy.create("myProxy", {
					module: "core/core/framework/proxy/TestProxy",
					"implements": "core.core.framework.proxy.TestProxy"
				}).then(function (oProxy) {
					var oCount = 0;
					var fnHandler = function (oEvent) {
						assert.ok(true, "Event Called");
					};
					oProxy.attachEventOnce("eventWithNoParams", fnHandler);
					return oProxy.methodWhichFiresEventWithNoParams().then(function () {
						return oProxy.methodWhichFiresEventWithNoParams().then(function () {
						});
					});
				});
			});

			it("Detach", function () {
				return Proxy.create("myProxy", {
					module: "core/core/framework/proxy/TestProxy",
					"implements": "core.core.framework.proxy.TestProxy"
				}).then(function (oProxy) {
					var oCount = 0;
					var fnHandler = function (oEvent) {
						assert.ok(true, "Event Called");
					};
					oProxy.attachEvent("eventWithNoParams", fnHandler);
					return oProxy.methodWhichFiresEventWithNoParams().then(function () {
						oProxy.detachEvent("eventWithNoParams", fnHandler);
						return oProxy.methodWhichFiresEventWithNoParams().then(function () {
						});
					});
				});
			});

			it("Detach with scope", function () {
				return Proxy.create("myProxy", {
					module: "core/core/framework/proxy/TestProxy",
					"implements": "core.core.framework.proxy.TestProxy"
				}).then(function (oProxy) {
					var oCount = 0;
					var fnHandler = function (oEvent) {
						assert.ok(true, "Event Called");
					};
					oProxy.attachEvent("eventWithNoParams", fnHandler, this);
					return oProxy.methodWhichFiresEventWithNoParams().then(function () {
						oProxy.detachEvent("eventWithNoParams", fnHandler, this);
						return oProxy.methodWhichFiresEventWithNoParams().then(function () {
						});
					});
				});
			});

			it("Right scope", function () {
				return Proxy.create("myProxy", {
					module: "core/core/framework/proxy/TestProxy",
					"implements": "core.core.framework.proxy.TestProxy"
				}).then(function (oProxy) {
					var bScopeWorks = true;
					oProxy.attachEvent("eventWithNoParams", function (oEvent) {
						assert.ok(bScopeWorks, "Scope is set right");
					}, this);
					return oProxy.methodWhichFiresEventWithNoParams();
				});
			});

			describe("Method invokation", function () {

				it("1. Sync Methods With Non Lazy Proxy calls - first call async method on lazy proxy, then call sync method", function () {
					return Proxy.create("myProxy", {
						module: "core/core/framework/proxy/TestProxy",
						"implements": "core.core.framework.proxy.TestProxy"
					}).then(function (oProxy) {
						return oProxy.getProxyWithSyncMethods().then(function (oLazyProxyWithSyncMethods) {
							assert.ok(oLazyProxyWithSyncMethods, "Proxy was created via factory");
							return oLazyProxyWithSyncMethods.asyncMethod().then(function () {
								return oLazyProxyWithSyncMethods.$().then(function (oNonLazyProxyWithSyncMethods) {
									assert.ok(oNonLazyProxyWithSyncMethods.syncMethod, "Proxy has a sync method");
									assert.equal(oNonLazyProxyWithSyncMethods.syncMethod(), "this is a sync value", "Houston, we got a sync return value!");
								});
							});
						});
					});
				});

				it("2. Sync Methods With Non Lazy Proxy calls - call sync method directly", function () {
					return Proxy.create("myProxy", {
						module: "core/core/framework/proxy/TestProxy",
						"implements": "core.core.framework.proxy.TestProxy"
					}).then(function (oProxy) {
						return oProxy.getProxyWithSyncMethods().then(function (oLazyProxyWithSyncMethods) {
							assert.ok(oLazyProxyWithSyncMethods, "Proxy was created via factory");
							return oLazyProxyWithSyncMethods.$().then(function (oNonLazyProxyWithSyncMethods) {
								assert.ok(oNonLazyProxyWithSyncMethods.syncMethod, "Proxy has a sync method");
								assert.equal(oNonLazyProxyWithSyncMethods.syncMethod(), "this is a sync value", "Houston, we got a sync return value!");
							});
						});
					});
				});

				it("3. Sync Methods With Non Lazy Proxy calls - call an async method on the non lazy proxy", function () {
					return Proxy.create("myProxy", {
						module: "core/core/framework/proxy/TestProxy",
						"implements": "core.core.framework.proxy.TestProxy"
					}).then(function (oProxy) {
						return oProxy.getProxyWithSyncMethods().then(function (oLazyProxyWithSyncMethods) {
							assert.ok(oLazyProxyWithSyncMethods, "Proxy was created via factory");
							return oLazyProxyWithSyncMethods.$().then(function (oNonLazyProxyWithSyncMethods) {
								return oNonLazyProxyWithSyncMethods.asyncMethod().then(function (oValue) {
									assert.equal(oValue, "this is a async value", "Houston, we got a async return value!");
								});
							});
						});
					});
				});

				it("Sync Methods With Lazy Proxy calls", function () {
					return Proxy.create("myProxy", {
						module: "core/core/framework/proxy/TestProxy",
						"implements": "core.core.framework.proxy.TestProxy"
					}).then(function (oProxy) {
						return oProxy.getProxyWithSyncMethods().then(function (oLazyProxyWithSyncMethods) {
							assert.ok(oLazyProxyWithSyncMethods.syncMethod, "Proxy has a sync method");
							return oLazyProxyWithSyncMethods.syncMethod().then(function (sValue) {
								assert.equal(sValue, "this is a sync value", "Houston, we got a sync return value!");
							});
						});
					});
				});
			});
		});
	});
});