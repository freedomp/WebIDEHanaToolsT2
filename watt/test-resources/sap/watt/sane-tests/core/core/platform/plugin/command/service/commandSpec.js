define(["STF"], function(STF) {
	"use strict";

	var oCommandService;
	var suiteName = "command_test";
	var iFrameWindow = null;
	var sap;
	var mEnv = {};
	var SAMPLE_COMMAND_PATH = "core.core.platform.plugin.command.SampleCommand";
	var SOME_WINDOW_TARGET = "someID";
	var sampleCommand;
	var keyBindingCommand;

	var oSampleCommand = null;
	var oCommandWithWindow = null;
	var oBooleanCommand = null;
	var oKeyBindingCommand = null;

	var oSampleCommandImpl = null;
	var oCommandWithWindowImpl = null;
	var oBooleanCommandImpl = null;
	var oKeyBindingCommandImpl = null;
	var oStaticExpressionCommand = null;
	var oExpressionCommand = null;
	var oStartupPromise;

	describe("Command test", function() {
		var getService = STF.getServicePartial(suiteName);
		before(function() {
			return STF.startWebIde(suiteName, {
				config: "core/core/platform/plugin/command/config.json"
			}).
				then(function(webIdeWindowObj) {
					var mConsumer = {
						"name": "testConsumer",

						"requires": {
							"services": [
								"command"
							]
						},

						"configures": {
							"services": {
								"command:commands": [{
									"id": "test.sample.Command",
									"label": "Run",
									"icon": "run",
									"service": SAMPLE_COMMAND_PATH,
									"keyBinding": "mod+y"
								}, {
									"id": "test.with.windowTarget",
									"windowTarget": SOME_WINDOW_TARGET,
									"label": "Run without frame",
									"service": SAMPLE_COMMAND_PATH,
									"keyBinding": "mod+shift+y"
								}, {
									"id": "test.with.type.boolean",
									"label": "Boolean Command",
									"type": "boolean",
									"value": true,
									"service": SAMPLE_COMMAND_PATH,
									"keyBinding": "mod+shift+b"
								}, {
									"id": "test.sample.KeybindingCommand",
									"label": "Run",
									"icon": "run",
									"service": SAMPLE_COMMAND_PATH,
									"keyBinding": "mod+shift+alt+y"
								}, {
									"id": "test.with.staticExpressionCommand",
									"label": "Configured",
									"available": true,
									"enabled": false,
									"service": SAMPLE_COMMAND_PATH
								}, {
									"id": "test.with.expressionCommand",
									"label": "Configured",
									//(boolean1&&!boolean2) || boolean3
									"available": {
										"or": [{
											"and": [{"env": "boolean1"},
												{"not": {"env": "boolean2"}}]
										},
											{"env": "boolean3"}]
									},
									//string==="yes"
									"enabled": {"equals": [{"env": "string"}, "yes"]},
									"service": "qunit.platform.plugin.command.DoesNotExist"
								}]
							}
						}

					};

					iFrameWindow = webIdeWindowObj;
					sap = iFrameWindow.sap;
					oCommandService = getService("command");

					var fOldGetEnv = sap.watt.getEnv;
					sap.watt.getEnv = function(sKey){
						if (mEnv[sKey]) {
							return mEnv[sKey];
						}
						return fOldGetEnv.apply(this, arguments);
					};

					return STF.register(suiteName, mConsumer).then(function () {
						return Q.all(
							[
								oCommandService.getCommand("test.sample.Command"),
								oCommandService.getCommand("test.with.windowTarget"),
								oCommandService.getCommand("test.with.type.boolean"),
								oCommandService.getCommand("test.sample.KeybindingCommand"),
								oCommandService.getCommand("test.with.staticExpressionCommand"),
								oCommandService.getCommand("test.with.expressionCommand")
							]).spread(function (c1, c2, c3, c4, c5, c6) {
								oSampleCommand = c1;
								oCommandWithWindow = c2;
								oBooleanCommand = c3;
								oKeyBindingCommand = c4;
								oStaticExpressionCommand = c5;
								oExpressionCommand = c6;

								//test changed w.r.t. lazy vs. non lazy proxy
								return Q.all(
									[
										STF.getServicePrivateImpl(oSampleCommand._oService),
										STF.getServicePrivateImpl(oCommandWithWindow._oService),
										STF.getServicePrivateImpl(oBooleanCommand._oService),
										STF.getServicePrivateImpl(oKeyBindingCommand._oService)
									]).spread(function (oImpl1, oImpl2, oImpl3, oImpl4) {
										oSampleCommandImpl = oImpl1;
										oCommandWithWindowImpl = oImpl2;
										oBooleanCommandImpl = oImpl3;
										oKeyBindingCommandImpl = oImpl4;
										return Q();
									});
							});
					});
				});
		});

		after(function() {
			STF.shutdownWebIde(suiteName);
		});

		describe("interface method tests", function() {
			before(function() {
				sampleCommand = {
					"id" : "test.sample.Command",
					"label": "Run",
					"icon": "run",
					"keyBinding": "mod+y"
				};
				keyBindingCommand = {
					"id" : "test.sample.KeybindingCommand",
					"label": "Run",
					"icon": "run",
					"service": SAMPLE_COMMAND_PATH,
					"keyBinding": "mod+shift+alt+y"
				};
			});

			it("test register command with properties id label icon checked", function() {
				expect(true).to.equal(true);
				var expectedCommand = sampleCommand;
				return oCommandService.getCommand(expectedCommand.id).then(function(oCommand) {
					assert.ok(oCommand, 'getCommand returns a result'); // "getCommand returns a result"
					_assertRegisteredCommand(oCommand, expectedCommand);
				});

				function _assertRegisteredCommand(oActualCommand, oExpectedCommand) {
					assert.strictEqual(oActualCommand.getId(), oExpectedCommand.id, "simple command is registered with id: " + oExpectedCommand.id);
					assert.strictEqual(oActualCommand.getLabel(), oExpectedCommand.label, "simple command is registered with label: " + oExpectedCommand.label);
					assert.strictEqual(oActualCommand.getIcon(), oExpectedCommand.icon, "simple command is registered with icon: " + oExpectedCommand.icon);
				}

			});

			it("test none existing command", function() {
				var noneExistingCommandId = "dummy";
				return oCommandService.getCommand(noneExistingCommandId).then(function(oCommand) {
					assert.ok(false, "getCommand should not return any result");
				}, function(oError) {
					assert.ok(true, "getCommand throws error");
					return Q();
				});
			});

			it("filtering item without getCommand method defined", function() {
				var item = {
					sId : "dummy",

					getId : function() {
						return this.sId;
					}
				};

				var oItems = [item];

				return oCommandService.filter(oItems).then(function(oFilteredResult){
					expect(oFilteredResult.length).to.equal(1); // Command impl. added the item without getCommand() impl.
				});
			});

			function _getDummyItem() {
				var dummyItem = {
					sId : "dummy",
					oCommand : null,

					getId : function() {
						return this.sId;
					},

					getCommand : function() {
						return this.oCommand;
					}
				};

				return dummyItem;
			}

			it("filtering item without result returned from getCommand()", function() {
				var item = _getDummyItem();
				var oItems = [item];

				return oCommandService.filter(oItems).then(function(oFilteredResult){
					expect(oFilteredResult.length).to.equal(1); // Command impl. added the item without result fom getCommand()
				});
			});

			it("filtering item with command without available and enable defined", function() {
				var expectedCommand = sampleCommand;
				return oCommandService.getCommand(expectedCommand.id).then(function(oCommand) {
					var item = _getDummyItem();
					item.oCommand = oCommand;
					var oItems = [item];
					return oCommandService.filter(oItems).then(function(oFilteredResult){
						expect(oFilteredResult.length).to.equal(1); // not defined attributes are ignored, simpleCommand overwrites the availability and enability
					});
				});
			});

			it("filtering item with command with either available or enable defined with non-boolean", function() {
				var expectedCommand = sampleCommand;
				return oCommandService.getCommand(expectedCommand.id).then(function(oCommand) {
					oCommand._bAvailable = 1;
					oCommand._bEnabled = 1;
					var item = _getDummyItem();
					item.oCommand = oCommand;
					var oItems = [item];
					return oCommandService.filter(oItems).then(function(oFilteredResult){
						assert.ok(false, "non-boolean in config should lead to error");
					}, function() {
						assert.ok(true, "non-boolean in config leads to error");
					});
				});
			});

			it("filtering item with unavailable command", function() {
				var expectedCommand = sampleCommand;
				return oCommandService.getCommand(expectedCommand.id).then(function(oCommand) {
					oCommand._bAvailable = false;
					oCommand._bEnabled = null;
					var item = _getDummyItem();
					item.oCommand = oCommand;
					var oItems = [item];
					return oCommandService.filter(oItems).then(function(oFilteredResult){
						expect(oFilteredResult.length).to.equal(0); // unavailble command results in empty result
					});
				});
			});

			it("filtering item with available command with state enabled  ", function() {
				var expectedCommand = sampleCommand;
				return oCommandService.getCommand(expectedCommand.id).then(function(oCommand) {
					oCommand._bAvailable = true;
					oCommand._bEnabled = true;
					var item = _getDummyItem();
					item.oCommand = oCommand;
					var oItems = [item];
					return oCommandService.filter(oItems).then(function(oFilteredResult){
						expect(oFilteredResult.length).to.equal(1); // filter returns result
						expect(oFilteredResult[0].enabled).to.equal(true); // enable sets to true
					});
				});
			});

			it("filtering item with available command with state disabled  ", function() {
				var expectedCommand = sampleCommand;
				return oCommandService.getCommand(expectedCommand.id).then(function(oCommand) {
					oCommand._bAvailable = true;
					oCommand._bEnabled = false;
					var item = _getDummyItem();
					item.oCommand = oCommand;
					var oItems = [item];
					return oCommandService.filter(oItems).then(function(oFilteredResult){
						expect(oFilteredResult.length).to.equal(1); // filter returns result
						expect(oFilteredResult[0].enabled).to.equal(false); // enable sets to false
					});
				});
			});

			it("set command value", function() {
				var testCommand = sampleCommand;
				return oCommandService.getCommand(testCommand.id).then(function(oCommand) {
					oCommand.setValue("hugo", testCommand.id);
					assert.strictEqual(oCommand._mValues[testCommand.id], "hugo", "setValue sets right value of vValue");
				});
			});

			it("get command value", function() {
				var testCommand = sampleCommand;
				return oCommandService.getCommand(testCommand.id).then(function(oCommand) {
					oCommand.setValue("hugo");
					assert.strictEqual(oCommand.getValue(), "hugo", "getValue return the right value of _vValue");
				});
			});

			it("getKeyBindingAsText", function() {
				var testCommand = keyBindingCommand;
				var bIsMac = (sap.ui.Device.os.name === "mac");
				var bIsWin = (sap.ui.Device.os.name === "win");
				var expectedText = bIsMac ? "\u2325\u21E7\u2318Y" : (bIsWin ? "Ctrl+Alt+Shift+Y" : "Shift+Ctrl+Alt+Y");
				return oCommandService.getCommand(testCommand.id).then(function(oCommand) {
					var text = oCommand.getKeyBindingAsText();
					assert.strictEqual(text, expectedText, "key binding text must be properly formatted");
				});
			});

		});


		describe("Command Service", function() {
			before(function() {
				/*oCommandWithWindow._getCommandWindow = function () {
					iFrameWindow.window;
				};
				*/
			});

			beforeEach(function () {
				oSampleCommandImpl.reset();
				oCommandWithWindowImpl.reset();
				oBooleanCommandImpl.reset();
				oSampleCommand._bAvailable = null;
				oSampleCommand._bEnabled = null;
			});

			it("execute is triggered on service impl", function(){
				assert.ok(!oSampleCommandImpl.executed,"impl not executed before");

				var oVal = { 1 : 2};
				oSampleCommand._bAvailable = true;
				oSampleCommand._bEnabled = true;
				return oSampleCommand.execute(oVal).then(function() {
					assert.ok(oSampleCommandImpl.executed,"impl executed afterwards");
					assert.strictEqual(oSampleCommandImpl.vValue,oVal,"value is given to execute method");
					assert.ok(!oSampleCommandImpl.oWindow,"no window given");
				});

			});

			///////////////////////

			it("isEnabled is only triggered when isAvailable is true", function(){

				oSampleCommandImpl.available = false;
				oSampleCommandImpl.enabled = true;
				return oSampleCommand.getState().then(function(mState) {
					assert.ok(oSampleCommandImpl.isAvailableCalled,"isAvailable should be called");
					assert.ok(!oSampleCommandImpl.isEnabledCalled,"isEnabled should not be called");
					assert.ok(!mState.enabled);
					assert.ok(!mState.available);
					return Q();
				});
			});

			it("execute gets a window object when windowTarget is set", function(){
				assert.strictEqual(oCommandWithWindow._sWindowTarget,SOME_WINDOW_TARGET,"window target is given from the config");
				assert.ok(!oCommandWithWindowImpl.executed,"impl not executed before");

				return oCommandWithWindow.execute().then(function() {
					assert.equal(oCommandWithWindowImpl.oWindow.name,SOME_WINDOW_TARGET,"window with the name from the command configuration is passed");

					assert.ok(!oCommandWithWindowImpl.oWindow.closed,"the window is open");

					//cleanup
					oCommandWithWindowImpl.oWindow.close();
				});
			});

			it("execute closes window in case of exception, but is rethrowing the error", function(){
				var sERROR = "Some error";
				oCommandWithWindowImpl.throwError = sERROR;

				return oCommandWithWindow.execute().then(function() {
					assert.ok(false,"Exception expected");
				}, function(oException){
					assert.equal(oException.message,sERROR,"Exception is rethrown");
					assert.ok(!oCommandWithWindow._oCommandWindow,"window is closed afterwards");
				}).then(function() {
					//cleanup
					oCommandWithWindowImpl.oWindow.close();
				});
			});

			it("non executable command closes the window directly", function(){
				assert.ok(!oCommandWithWindowImpl.executed,"impl not executed before");

				oCommandWithWindowImpl.enabled = false;

				return oCommandWithWindow.execute().then(function() {
					assert.ok(!oCommandWithWindowImpl.executed,"impl not executed");
					assert.ok(!oCommandWithWindow._oCommandWindow,"window is closed afterwards");
					//cleanup
					var oWindow = window.open("",SOME_WINDOW_TARGET);
					oWindow.close();
				});
			});

			it("boolean command", function(){
				assert.ok(oBooleanCommand.getValue(), "Boolean command value shall be true.");
				assert.ok(oBooleanCommand.getType() == "boolean", "Boolean command type shall be 'boolean''.");
				oBooleanCommand.setValue(false);
				assert.ok(!oBooleanCommand.getValue(), "Boolean command value shall be false.");
				try {
					oBooleanCommand.setValue("TEST");
				} catch(oError) {
					assert.equal(oError.message, "Just boolean values are allowed in boolean commands", "Setting of a non boolean value should fail.");
				}
			});
		});

		describe("Command Service 2", function() {
			beforeEach(function () {
				oSampleCommandImpl.reset();
				oKeyBindingCommandImpl.reset();
			});

			it("Static expression command", function(){
				return oStaticExpressionCommand.getState().then(function(oState) {
					assert.ok(oState, "State returned");
					assert.equal(oState.available, true, "Command is available");
					assert.equal(oState.enabled, false, "Command is not enabled");
				});
			});

			it("Expression command", function(){
				//available = (boolean1&&!boolean2) || boolean3
				//enabled = string==="yes"
				mEnv = {boolean1:true,boolean3:false,"string":"yes"};
				return oExpressionCommand.getState().then(function(oState) {
					assert.ok(oState, "State returned");
					assert.equal(oState.available, true, "Command is available");
					assert.equal(oState.enabled, true, "Command is enabled");

					mEnv = {boolean1:true,boolean2:false,"string":"no"};
					return oExpressionCommand.getState();
				}).then(function(oState) {
					assert.ok(oState, "State returned");
					assert.equal(oState.available, true, "Command is available");
					assert.equal(oState.enabled, false, "Command is not enabled");

					mEnv = {boolean1:false,boolean3:true,"string":"yes"};
					return oExpressionCommand.getState();
				}).then(function(oState) {
					assert.ok(oState, "State returned");
					assert.equal(oState.available, true, "Command is available");
					assert.equal(oState.enabled, true, "Command is enabled");

					mEnv = {boolean1:false,boolean3:false};
					return oExpressionCommand.getState();
				}).then(function(oState) {
					assert.ok(oState, "State returned");
					assert.equal(oState.available, false, "Command is available");
					assert.equal(oState.enabled, false, "Command is not enabled");
				});
			});

		});
	});
});
