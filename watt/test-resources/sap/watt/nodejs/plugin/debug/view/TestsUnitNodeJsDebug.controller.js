define([ //
  "../../../../../../../resources/sap/watt/nodejs/plugin/debug/view/NodeJsDebug.controller",
  "../../../../../../../resources/sap/watt/nodejs/plugin/debug/view/NodeJsDebug.view",
  "../../../../../../../resources/sap/watt/nodejs/plugin/debug/service/NodeJsBreakpointManager",
  "../util/NodeJsDebugSessionManagerMock",
  "../util/MessageChannelMock",
  "../util/NodeJsDebugSessionMock",
  "../util/LoggerMock"
], function(
  NodeJsDebugController, NodeJsDebugView,
  NodeJsBreakpointManager, NodeJsDebugSessionManagerMock,
  MessageChannelMock, NodeJsDebugSessionMock, LoggerMock) {

  "use strict";

  // console logger
  var _logger = new LoggerMock();

  var _context = {
    service: {
      log: _logger.log,
      command: {
        getCommand: function(key) {
          var index = key.lastIndexOf(".");
          if (index > 0) {
            // command object
            return Q.resolve({
              getKeyBindingAsText: function() {
                return key.substr(index + 1);
              }
            });
          }
          return Q.reject("invalid command id " + key);
        }
      },
      messageBus: {
        attachEvent: function attachEvent(event, handler, context) {}
      },
      progress: {
        _progressId: 0,
        _started: false,
        startTask: function startTask() {
          this._started = true;
          return Q.resolve(++this._progressId);
        },
        stopTask: function stopTask(progressId) {
          if (progressId === this._progressId) {
            this._started = false;
            return Q.resolve();
          }
          return Q.reject("Wrong progress id passed");
        }
      },
      content: {
        open: function() {}
      },
      editor: {
        getDefaultEditor: function() {}
      },
      document: {
        getDocumentByPath: function() {}
      }
    },
    i18n: {
      getText: function(key, params) {
        return (params && params.length >= 0 ? params[0] : null);
      }
    }
  };
  // MessageBus mock
  var MessageBusMock = function MessageBusMock() {
    this.channels = [];

    this.newChannel = function newChannel(channelName, onMessageCallback) {
      var channel = new MessageChannelMock(channelName, onMessageCallback);
      this.channels.push(channel);
      //prepare the post response for 'Debugger.setBreakpointByUrl'
      channel.onPostDataPrepareHandler = function(postData) {
        if (postData.endpoint === "/debug/nodejs/attach") {
          postData.message = {
            id: postData.message.id,
            method: "/debug/nodejs/attach",
            sessionChannel: MessageChannelMock.SESSION_CHANNEL_1,
            debugId: MessageChannelMock.SESSION_ID_1
          };
        }
      };
      return Q.resolve(channel);
    };
  };

  var _debugPart;
  var _debugSessionManager;
  var _breakpointManager;
  var _view;
  var _messageBus;
  var _sandbox;

  function _suspendDebugSession(debugSession) {
    // fire suspend event
    _view.getController()._onDebuggerSuspendResume({
      id: "suspended",
      params: {
        debugSession: debugSession
      }
    });
  }

  var _restoreModelFromExpandedVariableStateFunction;

  function _createView() {
    _view = sap.ui.view({
      type: sap.ui.core.mvc.ViewType.JS,
      viewName: "sap.xs.nodejs.debug.view.NodeJsDebug",
      viewData: {
        logger: _logger,
        debugPart: _debugPart,
        debugSessionManager: _debugSessionManager,
        breakpointManager: _breakpointManager
      }
    });
    _view.setModel(_breakpointManager.getJsonModel(), "breakpoints");
    _view.setModel(_debugSessionManager.getJsonModel(), "debugSessions");

    var controller = _view.getController();

    // disable restore VariableTree state functionality
    _restoreModelFromExpandedVariableStateFunction = controller._restoreModelFromExpandedVariableState;
    controller._restoreModelFromExpandedVariableState = function() {
      return new Q();
    };

    window.ok(!!_view, "setup - create NodeJsDebugView");

    // let the controller finish its configuration in _configure method
    return Q.delay(100).then(function() {
      return Q.resolve(_view);
    });
  }

  function _enableRestoreExpandedVariableStateFunction() {
    _view.getController()._restoreModelFromExpandedVariableState = _restoreModelFromExpandedVariableStateFunction;
  }

  function _createDebugSessionMock(data) {
    return new NodeJsDebugSessionMock(data);
  }

  module("NodeJsDebug.controller", {
    setup: function() {
      _sandbox = sinon.sandbox.create();
      _messageBus = new MessageBusMock();
      _breakpointManager = new NodeJsBreakpointManager(_logger);
      _debugSessionManager = new NodeJsDebugSessionManagerMock(_logger);
      _debugPart = {
        stackFrame: null,
        context: _context,
        _getSelectedProject: function() {
          return "/p/project1";
        },
        _onDebuggerStackFrameChange: function _onDebuggerStackFrameChange(stackFrame) {
          this.stackFrame = stackFrame;
        }
      };
    },

    teardown: function() {
      if (_view) {
        _view.destroy();
        _view = null;
      }
      _debugPart = null;
      _debugSessionManager = null;
      _breakpointManager = null;
      _logger.log.errorExpected = false;
      _logger.log.isDebug = true;
      _sandbox.restore();
    }
  });

  test("verify view initial state", window.withPromise(function(assert) {
    var suspendResumeListenersCount = 0;
    _debugSessionManager.addSuspendResumeListener = function(listener, context) {
      suspendResumeListenersCount++;
    };

    return _createView().then(function(view) {
      assert.equal(suspendResumeListenersCount, 1, "addSuspendResumeListener must have been called");

      var button = sap.ui.getCore().byId("NodeJsStepOverButton");
      assert.ok(button != null, "StepOver button must be set");
      assert.ok(button.getTooltip() != null, "Tooltip must be set");
      assert.ok(button.getTooltip().lastIndexOf("stepOver") >= 0, "Tooltip string must contain stepOver");
      assert.equal(button.getEnabled(), false, "StepOver button must be disabled");

      button = sap.ui.getCore().byId("NodeJsStepIntoButton");
      assert.ok(button != null, "StepInto button must be set");
      assert.ok(button.getTooltip() != null, "Tooltip must be set");
      assert.ok(button.getTooltip().lastIndexOf("stepInto") >= 0, "Tooltip string must contain stepInto");
      assert.equal(button.getEnabled(), false, "StepInto button must be disabled");

      button = sap.ui.getCore().byId("NodeJsStepOutButton");
      assert.ok(button != null, "StepOut button must be set");
      assert.ok(button.getTooltip() != null, "Tooltip must be set");
      assert.ok(button.getTooltip().lastIndexOf("stepOut") >= 0, "Tooltip string must contain stepOut");
      assert.equal(button.getEnabled(), false, "StepOut button must be disabled");

      button = sap.ui.getCore().byId("NodeJsAttachButton");
      assert.ok(button != null, "Attach button must be set");
      assert.equal(button.getEnabled(), true, "Attach button must be enabled");

      button = sap.ui.getCore().byId("NodeJsDetachButton");
      assert.ok(button != null, "Detach button must be set");
      assert.equal(button.getEnabled(), false, "Detach button must be disabled");

      button = sap.ui.getCore().byId("NodeJsSuspendResumeButton");
      assert.ok(button != null, "SuspendResume button must be set");
      assert.equal(button.getEnabled(), false, "SuspendResume button must be disabled");

      var debugTarget = sap.ui.getCore().byId("NodeJsDebugTargetName");
      assert.ok(debugTarget != null, "DebugTarget name control must be set");
      assert.ok(debugTarget.getText().length === 0, "DebugTarget name must not show debug session name");
    });
  }));

  test("verify message section", window.withPromise(function(assert) {
    return _createView().then(function(view) {
      var messageArea = sap.ui.getCore().byId("NodeJsMessageArea");
      assert.ok(messageArea != null, "MessageArea must be set");
      assert.equal(messageArea.getVisible(), false, "MessageArea must not be visible");

      // set error message
      view.getController()._setErrorMessage("Some error.");
      assert.equal(messageArea.getVisible(), true, "MessageArea must be visible on error");
      assert.equal(messageArea.getValue(), "Some error.", "MessageArea must have correct value");
      assert.equal(messageArea.getValueState(), sap.ui.core.ValueState.Error, "MessageArea must have value state Error");

      // set warning message
      view.getController()._setWarningMessage("Some warning.");
      assert.equal(messageArea.getVisible(), true, "MessageArea must be visible on warning");
      assert.equal(messageArea.getValue(), "Some warning.", "MessageArea must have correct value");
      assert.equal(messageArea.getValueState(), sap.ui.core.ValueState.Warning, "MessageArea must have value state Warning");

      // set info message
      view.getController()._setInfoMessage("Some info.");
      assert.equal(messageArea.getVisible(), true, "MessageArea must be visible on info");
      assert.equal(messageArea.getValue(), "Some info.", "MessageArea must have correct value");
      assert.equal(messageArea.getValueState(), sap.ui.core.ValueState.None, "MessageArea must have value state Success");

      // clear message
      view.getController()._clearMessage();
      assert.equal(messageArea.getVisible(), false, "MessageArea must not be visible");
      assert.ok(!view.getController()._controllerModel.getProperty("/message"), "Message text must be empty");
    });
  }));

  test("verify view after suspending debug session", window.withPromise(function(assert) {
    var debugSession = _createDebugSessionMock();
    _debugSessionManager.getJsonModel().setProperty("/debugSessions/0", debugSession);
    _debugSessionManager.getJsonModel().setProperty("/connected", true);

    return _createView().then(function(view) {
      // suspend debug session
      _suspendDebugSession(debugSession);

      var button = sap.ui.getCore().byId("NodeJsStepOverButton");
      assert.ok(button != null, "StepOver button must be set");
      assert.equal(button.getEnabled(), false, "StepOver button must be disabled");

      button = sap.ui.getCore().byId("NodeJsStepIntoButton");
      assert.ok(button != null, "StepInto button must be set");
      assert.equal(button.getEnabled(), false, "StepInto button must be disabled");

      button = sap.ui.getCore().byId("NodeJsStepOutButton");
      assert.ok(button != null, "StepOut button must be set");
      assert.equal(button.getEnabled(), false, "StepOut button must be disabled");

      button = sap.ui.getCore().byId("NodeJsAttachButton");
      assert.ok(button != null, "Attach button must be set");
      assert.equal(button.getEnabled(), false, "Attach button must be disabled");

      button = sap.ui.getCore().byId("NodeJsDetachButton");
      assert.ok(button != null, "Detach button must be set");
      assert.equal(button.getEnabled(), true, "Detach button must be enabled");

      button = sap.ui.getCore().byId("NodeJsSuspendResumeButton");
      assert.ok(button != null, "SuspendResume button must be set");
      assert.equal(button.getEnabled(), true, "SuspendResume button must be enabled");

      var debugTarget = sap.ui.getCore().byId("NodeJsDebugTargetName");
      assert.ok(debugTarget != null, "DebugTarget name control must be set");
      assert.ok(debugTarget.getText().lastIndexOf(MessageChannelMock.PROJECT_PATH) >= 0, "DebugTarget name must not show debug session name");
    });
  }));

  test("verify debugger resume action", window.withPromise(function(assert) {
    var debugSession = _createDebugSessionMock();
    var resumeCalled = false;
    debugSession.suspended = true;
    debugSession.resume = function() {
      resumeCalled = true;
      return Q.resolve();
    };

    _debugSessionManager.getJsonModel().setProperty("/debugSessions/0", debugSession);
    _debugSessionManager.getJsonModel().setProperty("/connected", true);

    return _createView().then(function(view) {
      // suspend debug session
      _suspendDebugSession(debugSession);

      // resume action
      var button = sap.ui.getCore().byId("NodeJsSuspendResumeButton");
      assert.ok(button != null, "SuspendResume button must be set");
      assert.equal(button.getEnabled(), true, "SuspendResume button must be enabled");
      button.firePress({
        pressed: true,
        id: button.getId()
      });
      return Q.delay(100).then(function() {
        assert.equal(resumeCalled, true, "Resume action must be processed");
      });
    });
  }));

  test("verify debugger suspend action", window.withPromise(function(assert) {
    var debugSession = _createDebugSessionMock();
    var suspendCalled = false;

    debugSession.suspended = false;
    debugSession.suspend = function() {
      suspendCalled = true;
      return Q.resolve();
    };

    _debugSessionManager.getJsonModel().setProperty("/debugSessions/0", debugSession);
    _debugSessionManager.getJsonModel().setProperty("/connected", true);

    return _createView().then(function(view) {
      // suspend debug session
      _suspendDebugSession(debugSession);

      // suspend action
      debugSession.suspended = false;
      var button = sap.ui.getCore().byId("NodeJsSuspendResumeButton");
      assert.equal(button.getEnabled(), true, "SuspendResume button must be enabled");
      button.firePress({
        pressed: true,
        id: button.getId()
      });
      return Q.delay(100).then(function() {
        assert.equal(suspendCalled, true, "Suspend action must be processed");
      });
    });
  }));

  test("verify debugger stepOver action", window.withPromise(function(assert) {
    var debugSession = _createDebugSessionMock();
    var stepOverCalled = false;

    debugSession.suspended = true;
    debugSession.stepOver = function() {
      stepOverCalled = true;
      return Q.resolve();
    };

    _debugSessionManager.getJsonModel().setProperty("/debugSessions/0", debugSession);
    _debugSessionManager.getJsonModel().setProperty("/connected", true);

    return _createView().then(function(view) {
      // suspend debug session
      _suspendDebugSession(debugSession);

      // stepOver action
      var button = sap.ui.getCore().byId("NodeJsStepOverButton");
      assert.ok(button != null, "StepOver button must be set");
      assert.equal(button.getEnabled(), true, "StepOver button must be enabled");
      button.firePress({
        pressed: true,
        id: button.getId()
      });
      return Q.delay(100).then(function() {
        assert.equal(stepOverCalled, true, "StepOver action must be processed");
      });
    });
  }));

  test("verify debugger stepOut action", window.withPromise(function(assert) {
    var debugSession = new _createDebugSessionMock();
    var stepOutCalled = false;

    debugSession.suspended = true;
    debugSession.stepOut = function() {
      stepOutCalled = true;
      return Q.resolve();
    };

    _debugSessionManager.getJsonModel().setProperty("/debugSessions/0", debugSession);
    _debugSessionManager.getJsonModel().setProperty("/connected", true);

    return _createView().then(function(view) {
      // suspend debug session
      _suspendDebugSession(debugSession);

      // stepOut action
      var button = sap.ui.getCore().byId("NodeJsStepOutButton");
      assert.ok(button != null, "StepOut button must be set");
      assert.equal(button.getEnabled(), true, "StepOut button must be enabled");
      button.firePress({
        pressed: true,
        id: button.getId()
      });
      return Q.delay(100).then(function() {
        assert.equal(stepOutCalled, true, "StepOut action must be processed");
      });
    });
  }));

  test("verify debugger stepInto action", window.withPromise(function(assert) {
    var debugSession = new _createDebugSessionMock();
    var stepIntoCalled = false;

    debugSession.suspended = true;
    debugSession.stepInto = function() {
      stepIntoCalled = true;
      return Q.resolve();
    };

    _debugSessionManager.getJsonModel().setProperty("/debugSessions/0", debugSession);
    _debugSessionManager.getJsonModel().setProperty("/connected", true);

    return _createView().then(function(view) {
      // suspend debug session
      _suspendDebugSession(debugSession);

      // stepInto action
      var button = sap.ui.getCore().byId("NodeJsStepIntoButton");
      assert.ok(button != null, "StepInto button must be set");
      assert.equal(button.getEnabled(), true, "StepInto button must be enabled");
      button.firePress({
        pressed: true,
        id: button.getId()
      });
      return Q.delay(100).then(function() {
        assert.equal(stepIntoCalled, true, "StepInto action must be processed");
      });
    });
  }));

  test("verify debugger attach method, DebugSessionManager not connected", window.withPromise(function(assert) {
    var debugSessionDefinition = {
      debugURL: new URI({
        protocol: "https",
        hostname: "host.dhcp.wdf.sap.corp",
        port: 6001,
        username: "debuguser",
        password: "abcd"
      }).toString(),
      projectPath: "mta_test1/node"
    };

    return _createView().then(function(view) {
      // test with disconnected DebugSessionManager
      return view.getController().attach(debugSessionDefinition).then(function() {
        assert.equal(_debugPart.context.service.progress._started, false, "The progress indicator must be stopped after successful attach");

        var msg = view.getController()._controllerModel.getProperty("/message");
        assert.ok(!msg, "View must not display any message");
        assert.equal(view.getController().isConnected(), true, "The debugger has to be attached to the session");
        assert.equal(view.getController().isSuspended(), false, "The debugger must not be paused after attach");

        var appName = sap.ui.getCore().byId("NodeJsDebugTargetName");
        assert.equal(appName.getText(), _debugSessionManager.getJsonModel().getProperty("/debugSessions/0").name, "Debug view must display the application's name");
      });
    });
  }));

  test("verify debugger attach method with expected error, DebugSessionManager not connected", window.withPromise(function(assert) {
    _logger.log.errorExpected = true;
    _debugSessionManager.connectDebugSession = function connectDebugSession(debugSessionDefinition) {
      if (!debugSessionDefinition) {
        throw "Illegal debug session definition";
      }
    };

    return _createView().then(function(view) {
      // test with disconnected DebugSessionManager
      return view.getController().attach(null).then(function() {
        assert.equal(_debugPart.context.service.progress._started, false, "The progress indicator must be stopped after successful attach");

        var msg = view.getController()._controllerModel.getProperty("/message");
        assert.equal(msg, "Illegal debug session definition", "View must display error message");
        assert.equal(view.getController().isConnected(), false, "The debugger has to be attached to the session");
        assert.equal(view.getController().isSuspended(), false, "The debugger must not be paused after attach");
      });
    });
  }));

  test("verify debugger attach method, DebugSessionManager already connected", window.withPromise(function(assert) {
    var debugSessionDefinition = {
      debugURL: new URI({
        protocol: "https",
        hostname: "host.dhcp.wdf.sap.corp",
        port: 6001,
        username: "debuguser",
        password: "abcd"
      }).toString(),
      projectPath: "mta_test1/node"
    };

    return _createView().then(function(view) {
      return _debugSessionManager.connect().then(function() {
        // test with disconnected DebugSessionManager
        return view.getController().attach(debugSessionDefinition).then(function() {
          assert.equal(_debugPart.context.service.progress._started, false, "The progress indicator must be stopped after successful attach");

          var msg = view.getController()._controllerModel.getProperty("/message");
          assert.ok(!msg, "View must not display any message [" + msg + "]");
          assert.equal(view.getController().isConnected(), true, "The debugger has to be attached to the session");
          assert.equal(view.getController().isSuspended(), false, "The debugger must not be paused after attach");
        });
      });
    });
  }));

  test("verify debugger attach method with error, DebugSessionManager already connected", window.withPromise(function(assert) {
    _logger.log.errorExpected = true;
    _debugSessionManager.connectDebugSession = function connectDebugSession(debugSessionDefinition) {
      if (!debugSessionDefinition) {
        throw "Illegal debug session definition";
      }
    };

    return _createView().then(function(view) {
      return _debugSessionManager.connect().then(function() {
        // test with disconnected DebugSessionManager
        return view.getController().attach(null).then(function() {
          assert.equal(_debugPart.context.service.progress._started, false, "The progress indicator must be stopped after successful attach");

          var msg = view.getController()._controllerModel.getProperty("/message");
          assert.equal(msg, "Illegal debug session definition", "View must display error message");
          assert.equal(view.getController().isConnected(), false, "The debugger has to be attached to the session");
          assert.equal(view.getController().isSuspended(), false, "The debugger must not be paused after attach");
        });
      });
    });
  }));

  test("verify debugger detach action", window.withPromise(function(assert) {
    var debugSession = new _createDebugSessionMock();
    var detachCalled = false;

    debugSession.suspended = true;
    _debugSessionManager.disconnectDebugSession = function() {
      detachCalled = true;
      return Q.resolve();
    };

    _debugSessionManager.getJsonModel().setProperty("/debugSessions/0", debugSession);
    _debugSessionManager.getJsonModel().setProperty("/connected", true);

    return _createView().then(function(view) {
      // suspend debug session
      _suspendDebugSession(debugSession);

      // detach action
      var button = sap.ui.getCore().byId("NodeJsDetachButton");
      assert.ok(button != null, "Detach button must be set");
      assert.equal(button.getEnabled(), true, "Detach button must be enabled");
      button.firePress({
        pressed: true,
        id: button.getId()
      });
      return Q.delay(100).then(function() {
        assert.equal(detachCalled, true, "Detach action must be processed");
      });
    });
  }));

  test("verify breakpoint section - sorting, enabling, disabling, removing breakpoints", window.withPromise(function(assert) {
    return _createView().then(function(view) {
      _breakpointManager.addBreakpoint("/a/f/file1.js", 7);
      _breakpointManager.addBreakpoint("/c/f/file2.js", 97);
      _breakpointManager.addBreakpoint("/b/f/file1.js", 3);
      _breakpointManager.addBreakpoint("/a/file2.js", 8);
      _breakpointManager.addBreakpoint("/b/file1.js", 1);

      var expectedBreakpoint = _breakpointManager.getBreakpointByLocation("/b/file1.js", 1);
      assert.ok(expectedBreakpoint !== null, "Breakpoint model must contain breakpoint after creation");
      assert.equal(expectedBreakpoint.enabled, true, "Breakpoint must have enabled state after creation");
      // attach the statement part which is normally done in NodeJsDebugPart
      _breakpointManager.getJsonModel().setProperty("/breakpoints/4/statement", "function log(message) {");
      assert.equal(expectedBreakpoint.statement, "function log(message) {", "Breakpoint statement must have correct value after creation");

      var table = sap.ui.getCore().byId("NodeJsBreakpointTable");
      assert.ok(table != null, "Breakpoint table control must be set");
      assert.equal(table.getColumns().length, 3, "Breakpoint section must have 3 columns");
      assert.equal(table.getVisibleRowCount(), 5, "Breakpoint section must have 5 breakpoints");

      // verify breakpoint entries
      assert.equal(table.getContextByIndex(0).getProperty("filePath"), "/b/file1.js", "Breakpoint entry must have correct file name");
      assert.equal(table.getContextByIndex(0).getProperty("lineNumber"), 1, "Breakpoint entry must have correct file name");
      assert.equal(table.getContextByIndex(0).getProperty("statement"), expectedBreakpoint.statement, "Breakpoint entry must have correct statement content");

      assert.equal(table.getContextByIndex(1).getProperty("filePath"), "/b/f/file1.js", "Breakpoint entry must have correct file name");
      assert.equal(table.getContextByIndex(1).getProperty("lineNumber"), 3, "Breakpoint entry must have correct file name");

      assert.equal(table.getContextByIndex(2).getProperty("filePath"), "/a/f/file1.js", "Breakpoint entry must have correct file name");
      assert.equal(table.getContextByIndex(2).getProperty("lineNumber"), 7, "Breakpoint entry must have correct file name");

      assert.equal(table.getContextByIndex(3).getProperty("filePath"), "/a/file2.js", "Breakpoint entry must have correct file name");
      assert.equal(table.getContextByIndex(3).getProperty("lineNumber"), 8, "Breakpoint entry must have correct file name");

      assert.equal(table.getContextByIndex(4).getProperty("filePath"), "/c/f/file2.js", "Breakpoint entry must have correct file name");
      assert.equal(table.getContextByIndex(4).getProperty("lineNumber"), 97, "Breakpoint entry must have correct file name");

      // delete breakpoint from model
      _breakpointManager.removeBreakpoint("/a/file2.js", 8);
      assert.equal(table.getVisibleRowCount(), 4, "Breakpoint section must have 4 breakpoints after deletion of breakpoint from model");
    });
  }));

  test("test breakpoint table column width calculation", window.withPromise(function(assert) {
    return _createView().then(function(view) {
      var controller = view.getController();
      controller._getContainerWidth = function() {
        return 400;
      };

      var breakpointTable = sap.ui.getCore().byId("NodeJsBreakpointTable");
      _breakpointManager.addBreakpoint("/c/f/file2.js", 97);

      var expectedCheckboxColWidth = Math.round(controller._getTextWidth("XX", "11pt arial") + 8) + "px";
      assert.equal(breakpointTable.getColumns()[0].getWidth(), expectedCheckboxColWidth, "checkbox column width must match");

      var expectedLocationColWidth = Math.round(controller._getTextWidth("file2.js:97", "11pt arial") + 8) + "px";
      assert.equal(breakpointTable.getColumns()[1].getWidth(), expectedLocationColWidth, "location column width must match");

      _breakpointManager.addBreakpoint("/c/f/f1.js", 3);
      // must not be enlarged
      assert.equal(breakpointTable.getColumns()[1].getWidth(), expectedLocationColWidth, "location column width must match");

      // must have been enlarged
      _breakpointManager.addBreakpoint("/c/f/file222.js", 98);
      var newExpectedLocationColWidth = Math.round(controller._getTextWidth("file222.js:97", "11pt arial") + 8) + "px";
      assert.ok(parseInt(newExpectedLocationColWidth) > parseInt(expectedLocationColWidth), "column size must have been enlarged");
      assert.equal(breakpointTable.getColumns()[1].getWidth(), newExpectedLocationColWidth, "location column width must match");
    });
  }));

  test("verify stackframe section after suspending debug session", window.withPromise(function(assert) {
    var debugSession = _createDebugSessionMock({
      id: MessageChannelMock.SESSION_ID_1,
      name: MessageChannelMock.PROJECT_PATH,
      channel: MessageChannelMock.SESSION_CHANNEL_1,
      connected: true,
      suspended: true,
      breakpoints: [],
      threads: [{
        id: "0",
        suspended: true,
        getParent: function() {
          return debugSession;
        },
        stackFrames: [{
          id: "1",
          getParent: function() {
            return debugSession.threads[0];
          },
          functionName: "f1",
          location: {
            resourceId: "1",
            lineNumber: 3,
            columnNumber: 0,
            resource: {
              url: "/f/file1.js"
            }
          },
          scopes: []
        }, {
          id: "2",
          getParent: function() {
            return debugSession.threads[0];
          },
          functionName: "f2",
          location: {
            resourceId: "1",
            lineNumber: 199,
            columnNumber: 0,
            resource: {
              url: "/f/p/file2.js"
            }
          },
          scopes: []
        }]
      }],
      resources: []
    });
    _debugSessionManager.getJsonModel().setProperty("/debugSessions/0", debugSession);
    _debugSessionManager.getJsonModel().setProperty("/connected", true);

    return _createView().then(function(view) {
      // suspend debug session
      _suspendDebugSession(debugSession);

      assert.equal(_debugPart.stackFrame, debugSession.threads[0].stackFrames[0], "The first stackframe has to be passed to debugPart._onDebuggerStackFrameChange(");

      var table = sap.ui.getCore().byId("NodeJsCallStackTable");
      assert.ok(table != null, "Callstack table must be set");
      assert.equal(table.getVisible(), true, "Callstack table must be visible");
      assert.equal(table.getVisibleRowCount(), 2, "Callstack table must contain entries");

      // verify 1. stackframe entry
      assert.equal(table.getContextByIndex(0).getProperty("functionName"), "f1", "Stackframe entry must have correct function name");
      // verify 2. stackframe entry
      assert.equal(table.getContextByIndex(1).getProperty("functionName"), "f2", "Stackframe entry must have correct function name");
    });
  }));

  test("verify variable section after suspending debug session", window.withPromise(function(assert) {
    var debugSession = _createDebugSessionMock({
      id: MessageChannelMock.SESSION_ID_1,
      name: MessageChannelMock.PROJECT_PATH,
      channel: MessageChannelMock.SESSION_CHANNEL_1,
      connected: true,
      suspended: true,
      breakpoints: [],
      threads: [{
        id: "0",
        suspended: true,
        getParent: function() {
          return debugSession;
        },
        stackFrames: [{
          id: "1",
          getParent: function() {
            return debugSession.threads[0];
          },
          functionName: "f1",
          location: {
            resourceId: "1",
            lineNumber: 3,
            columnNumber: 0,
            resource: {
              url: "/f/file1.js"
            }
          },
          scopes: [{
            type: "local",
            object: {
              type: "object",
              objectId: "scope:0:0"
            },
            getParent: function() {
              return debugSession.threads[0].stackFrames[0];
            },
            properties: [{
              name: "var1",
              value: {
                type: "boolean",
                value: false
              }
            }, {
              name: "var2",
              value: {
                type: "number",
                value: 99
              }
            }, {
              name: "var3",
              value: {
                type: "string",
                value: "foo1"
              }
            }, {
              name: "var4",
              value: {
                type: "undefined"
              }
            }, {
              name: "var5",
              value: {
                type: "function",
                objectId: "105",
                description: "function log(message) {\n    console.log(message);\n}"
              }
            }, {
              name: "var6",
              value: {
                type: "object",
                objectId: "137",
                description: "req"
              },
              properties: [{
                name: "var11",
                value: {
                  type: "boolean",
                  value: true
                }
              }]
            }]
          }, {
            type: "closure",
            object: {
              type: "object",
              objectId: "scope:0:1"
            },
            getParent: function() {
              return debugSession.threads[0].stackFrames[0];
            }
          }, {
            type: "global",
            object: {
              type: "object",
              objectId: "scope:0:2"
            },
            getParent: function() {
              return debugSession.threads[0].stackFrames[0];
            }
          }]
        }]
      }],
      resources: []
    });
    _debugSessionManager.getJsonModel().setProperty("/debugSessions/0", debugSession);
    _debugSessionManager.getJsonModel().setProperty("/connected", true);

    return _createView().then(function(view) {
      // suspend debug session
      _suspendDebugSession(debugSession);

      return Q.delay(100).then(function() {
        var tree = sap.ui.getCore().byId("NodeJsVariableTree");

        // verify scope nodes
        assert.equal(tree.getNodes().length, 3, "Variable section must have 3 scope nodes");
        var localScopeNode = tree.getNodes()[0];
        assert.equal(localScopeNode.getText(), "Local", "Scope node of type local must have correct text");
        assert.equal(localScopeNode.getNodes().length, 6, "Scope node must have 6 child property nodes");
        var scopeNode = tree.getNodes()[1];
        assert.equal(scopeNode.getText(), "Closure", "Scope node of type closure must have correct text");
        scopeNode = tree.getNodes()[2];
        assert.equal(scopeNode.getText(), "Global", "Scope node of type global must have correct text");

        // verify scalar child nodes
        var childNode = localScopeNode.getNodes()[0];
        assert.equal(childNode.getText(), "var1: false", "Child node of type boolean must have correct text");
        childNode = localScopeNode.getNodes()[1];
        assert.equal(childNode.getText(), "var2: 99", "Child node of type number must have correct text");
        childNode = localScopeNode.getNodes()[2];
        assert.equal(childNode.getText(), "var3: \"foo1\"", "Child node of type string must have correct text");
        childNode = localScopeNode.getNodes()[3];
        assert.equal(childNode.getText(), "var4: undefined", "Child node of type undefined must have correct text");

        // verify function child node
        childNode = localScopeNode.getNodes()[4];
        assert.equal(childNode.getText(), "var5: function log(message) {", "Child node of type function must have correct text");

        // verify object child node
        var objectNode = localScopeNode.getNodes()[5];
        assert.equal(objectNode.getText(), "var6: req", "Child node of type object must have correct text");
      });
    });
  }));

  test("verify expanding object node in variable section", window.withPromise(function(assert) {
    var debugSession = _createDebugSessionMock({
      id: MessageChannelMock.SESSION_ID_1,
      name: MessageChannelMock.PROJECT_PATH,
      channel: MessageChannelMock.SESSION_CHANNEL_1,
      connected: true,
      suspended: true,
      breakpoints: [],
      threads: [{
        id: "0",
        getParent: function() {
          return debugSession;
        },
        suspended: true,
        stackFrames: [{
          id: "1",
          getParent: function() {
            return debugSession.threads[0];
          },
          functionName: "f1",
          location: {
            resourceId: "1",
            lineNumber: 3,
            columnNumber: 0,
            resource: {
              url: "/f/file1.js"
            }
          },
          scopes: [{
            type: "local",
            object: {
              type: "object",
              objectId: "scope:0:0"
            },
            getParent: function() {
              return debugSession.threads[0].stackFrames[0];
            }
          }]
        }]
      }],
      resources: []
    });
    _debugSessionManager.getJsonModel().setProperty("/debugSessions/0", debugSession);
    _debugSessionManager.getJsonModel().setProperty("/connected", true);

    // called after selecting the top stackframe as the local scope variables are immediately shown
    debugSession.getPropertiesForScope = function(scope) {
      if (scope && scope.type === "local") {
        var uri = _debugSessionManager.getModelResolver().getUriForObject(scope);
        _debugSessionManager.setModelPropertyByUri(uri + "/properties", [{
          name: "var1",
          value: {
            type: "object",
            objectId: "137",
            description: "req"
          }
        }]);
        return Q.resolve(scope);
      } else {
        return Q.reject("Invalid scope object [" + scope + "]");
      }
    };

    // called when expanding an object node 'var1'
    debugSession.getPropertiesForObject = function(object, uri) {
      if (object && object.name === "var1") {
        _debugSessionManager.setModelPropertyByUri(uri + "/properties", [{
          name: "var11",
          value: {
            type: "boolean",
            value: true
          }
        }, {
          name: "var12",
          value: {
            type: "object",
            objectId: "140",
            description: "foo"
          }
        }]);
        return Q.resolve(_debugSessionManager.getModelResolver().getModelPropertyByUri(uri));
      } else {
        return Q.reject("Invalid objectId");
      }
    };

    return _createView().then(function(view) {
      // suspend debug session
      _suspendDebugSession(debugSession);

      return Q.delay(100).then(function() {
        var tree = sap.ui.getCore().byId("NodeJsVariableTree");

        // verify scope nodes
        assert.equal(tree.getNodes().length, 1, "Variable section must have 1 scope node");
        var scopeNode = tree.getNodes()[0];
        assert.equal(scopeNode.getNodes().length, 1, "Scope node must have 1 child property node");
        var objectNode = scopeNode.getNodes()[0];
        assert.equal(objectNode.getText(), "var1: req", "Child node of type object must have correct text");

        // expand object node and verify children
        assert.equal(objectNode.getNodes().length, 0, "Child node of type object must not have any children before being expanded");
        objectNode.fireToggleOpenState({
          opened: true,
          id: objectNode.getId()
        });
        return Q.delay(100).then(function() {
          assert.equal(objectNode.getNodes().length, 2, "Child node of type object must have 2 children after being expanded");
          var childNode = objectNode.getNodes()[0];
          assert.equal(childNode.getText(), "var11: true", "Child node of type boolean must have correct text");
          childNode = objectNode.getNodes()[1];
          assert.equal(childNode.getText(), "var12: foo", "Child node of type object must have correct text");

          // verify error handling if
          // getPropertiesForObject fails - the error is displayed using the message area
          // session
          childNode.fireToggleOpenState({
            opened: true,
            id: objectNode.getId()
          });
          return Q.delay(100).then(function() {
            assert.equal(childNode.getNodes().length, 0,
              "Child node of type object must have 0 children if reading properties from debugee fails");
            var messageArea = sap.ui.getCore().byId("NodeJsMessageArea");
            assert.equal(messageArea.getValue(), "Failed to read properties from node.js runtime for the selected node");
          });
        });
      });
    });
  }));

  test("verify caching scope and object properties in variable section", window.withPromise(function(assert) {
    var debugSession = _createDebugSessionMock({
      id: MessageChannelMock.SESSION_ID_1,
      name: MessageChannelMock.PROJECT_PATH,
      channel: MessageChannelMock.SESSION_CHANNEL_1,
      connected: true,
      suspended: true,
      breakpoints: [],
      threads: [{
        id: "0",
        getParent: function() {
          return debugSession;
        },
        suspended: true,
        stackFrames: [{
          id: "1",
          getParent: function() {
            return debugSession.threads[0];
          },
          functionName: "f1",
          location: {
            resourceId: "1",
            lineNumber: 3,
            columnNumber: 0,
            resource: {
              url: "/f/file1.js"
            }
          },
          scopes: [{
            type: "local",
            object: {
              type: "object",
              objectId: "scope:0:0"
            },
            getParent: function() {
              return debugSession.threads[0].stackFrames[0];
            },
            properties: [{
              name: "var1",
              value: {
                type: "object",
                objectId: "137",
                description: "req"
              },
              properties: [{
                name: "var11",
                value: {
                  type: "boolean",
                  value: true
                }
              }]
            }]
          }]
        }]
      }],
      resources: []
    });
    _debugSessionManager.getJsonModel().setProperty("/debugSessions/0", debugSession);
    _debugSessionManager.getJsonModel().setProperty("/connected", true);

    var propertiesForObjectCalled = false;
    var propertiesForScopeCalled = false;

    // called when expanding an object node
    debugSession.getPropertiesForObject = function(object, uri) {
      propertiesForObjectCalled = true;
      //return Q.reject("getPropertiesForObject must not be called");
    };
    // called when selecting a stackframe
    debugSession.getPropertiesForScope = function(scope) {
      propertiesForScopeCalled = true;
      //return Q.reject("propertiesForScopeCalled must not be called");
    };

    return _createView().then(function(view) {
      // suspend debug session
      _suspendDebugSession(debugSession);

      return Q.delay(100).then(function() {
        var tree = sap.ui.getCore().byId("NodeJsVariableTree");
        assert.equal(tree.getNodes().length, 1, "Variable section must have 1 scope node");
        var scopeNode = tree.getNodes()[0];
        assert.equal(scopeNode.getText(), "Local", "Scope node of type local must have correct text");

        // expand scope node
        scopeNode.fireToggleOpenState({
          opened: true,
          id: scopeNode.getId()
        });
        return Q.delay(100).then(function() {
          assert.equal(propertiesForScopeCalled, false, "The method debugSession.getPropertiesForScope must not be called if scopes have already been loaded");
          assert.equal(propertiesForObjectCalled, false, "The method debugSession.getPropertiesForObject must not be called if properties have already been loaded");
          assert.equal(scopeNode.getNodes().length, 1, "Scope node must have 1 child property node");
          var objectNode1 = scopeNode.getNodes()[0];
          assert.equal(objectNode1.getText(), "var1: req", "Child node of type object must have correct text");

          // expand property node
          objectNode1.fireToggleOpenState({
            opened: true,
            id: objectNode1.getId()
          });
          return Q.delay(100).then(function() {
            assert.equal(propertiesForScopeCalled, false, "The method debugSession.getPropertiesForScope must not be called if scopes have already been loaded");
            assert.equal(propertiesForObjectCalled, false, "The method debugSession.getPropertiesForObject must not be called if properties have already been loaded");
            assert.equal(objectNode1.getNodes().length, 1, "Scope node must have 1 child property node");
            var objectNode2 = objectNode1.getNodes()[0];
            assert.equal(objectNode2.getText(), "var11: true", "Child node of type object must have correct text");
          });
        });
      });
    });
  }));

  test("verify stackframe selection", window.withPromise(function(assert) {
    var debugSession = _createDebugSessionMock({
      id: MessageChannelMock.SESSION_ID_1,
      name: MessageChannelMock.PROJECT_PATH,
      channel: MessageChannelMock.SESSION_CHANNEL_1,
      connected: true,
      suspended: true,
      breakpoints: [],
      threads: [{
        id: "0",
        suspended: true,
        getParent: function() {
          return debugSession;
        },
        stackFrames: [{
          id: "1",
          getParent: function() {
            return debugSession.threads[0];
          },
          functionName: "f1",
          location: {
            resourceId: "1",
            lineNumber: 3,
            columnNumber: 0,
            resource: {
              url: "/f/file1.js"
            }
          },
          scopes: [{
            type: "local",
            object: {
              type: "object",
              objectId: "scope:0:0"
            },
            getParent: function() {
              return debugSession.threads[0].stackFrames[0];
            },
            properties: []
          }]
        }, {
          id: "2",
          getParent: function() {
            return debugSession.threads[0];
          },
          functionName: "f2",
          location: {
            resourceId: "1",
            lineNumber: 199,
            columnNumber: 0,
            resource: {
              url: "/f/p/file2.js"
            }
          },
          scopes: [{
            type: "local",
            object: {
              type: "object",
              objectId: "scope:0:0"
            },
            getParent: function() {
              return debugSession.threads[0].stackFrames[1];
            },
            properties: []
          }]
        }]
      }],
      resources: []
    });
    _debugSessionManager.getJsonModel().setProperty("/debugSessions/0", debugSession);
    _debugSessionManager.getJsonModel().setProperty("/connected", true);

    return _createView().then(function(view) {
      // suspend debug session
      _suspendDebugSession(debugSession);

      assert.equal(_debugPart.stackFrame, debugSession.threads[0].stackFrames[0], "The first stackframe has to be passed to debugPart._onDebuggerStackFrameChange(");

      var table = sap.ui.getCore().byId("NodeJsCallStackTable");
      assert.equal(table.getVisible(), true, "Callstack table must be visible");
      assert.equal(table.getVisibleRowCount(), 2, "Callstack table must contain entries");
      assert.equal(table.getSelectedIndex(), 0, "First row must have been selected");

      return Q.delay(100).then(function() {
        // verify variables tree detail
        var tree = sap.ui.getCore().byId("NodeJsVariableTree");
        assert.equal(tree.getNodes().length, 1, "Variable section must have 1 scope node");
        var scopeNode = tree.getNodes()[0];
        assert.equal(scopeNode.getText(), "Local", "Scope node of type local must have correct text");

        table.fireRowSelectionChange({
          id: "NodeJsCallStackTable",
          rowContext: table.getContextByIndex(1),
          rowIndex: 0,
          rowIndices: [0]
        });

        assert.equal(_debugPart.stackFrame, debugSession.threads[0].stackFrames[1], "The second stackframe has to be passed to debugPart._onDebuggerStackFrameChange(");

        return Q.delay(100).then(function() {
          assert.equal(tree.getNodes().length, 1, "Variable section must have 1 scope node");
          scopeNode = tree.getNodes()[0];
          assert.equal(scopeNode.getText(), "Local", "Scope node of type local must have correct text");
        });
      });
    });
  }));

  test("test _getExistingSiblings", window.withPromise(function(assert) {
    var debugSession = _createDebugSessionMock({
      id: MessageChannelMock.SESSION_ID_1,
      name: MessageChannelMock.PROJECT_PATH,
      channel: MessageChannelMock.SESSION_CHANNEL_1,
      connected: true,
      suspended: true,
      breakpoints: [],
      threads: [{
        id: "0",
        suspended: true,
        getParent: function() {
          return debugSession;
        },
        stackFrames: [{
          id: "frame0",
          getParent: function() {
            return debugSession.threads[0];
          },
          functionName: "f1",
          location: {
            resourceId: "1",
            resource: {
              url: "/f/file1.js"
            }
          },
          scopes: [{
            type: "local",
            object: {
              type: "object",
              objectId: "scope0"
            },
            getParent: function() {
              return debugSession.threads[0].stackFrames[0];
            },
            properties: [{
              name: "var1",
              value: {
                type: "object",
                objectId: "137",
                description: "req"
              },
              properties: [{
                name: "var",
                value: {
                  type: "object",
                  objectId: "137",
                  description: "req"
                }
              }, {
                name: "var4",
                value: {
                  type: "object",
                  objectId: "137",
                  description: "req"
                }
              }, {
                name: "var5",
                value: {
                  type: "object",
                  objectId: "137",
                  description: "req"
                }
              }]
            }]
          }, {
            type: "global",
            object: {
              type: "object",
              objectId: "scope1"
            },
            getParent: function() {
              return debugSession.threads[0].stackFrames[0];
            }
          }]
        }]
      }],
      resources: []
    });
    _debugSessionManager.getJsonModel().setProperty("/debugSessions/0", debugSession);
    _debugSessionManager.getJsonModel().setProperty("/connected", true);

    return _createView().then(function(view) {
      var controller = view.getController();
      // switch off expected log info messages
      _logger.log.isDebug = false;
      var uris = [];
      controller._addUri("/debugSessions/session_1/threads/0/stackFrames/frame0", uris);
      controller._addUri("/debugSessions/session_1/threads/0/stackFrames/frame0/scopes/local", uris);
      controller._addUri("/debugSessions/session_1/threads/0/stackFrames/frame0/scopes/local/properties/var1/properties/var", uris);
      controller._addUri("/debugSessions/session_1/threads/0/stackFrames/frame0/scopes/local/properties/var1/properties/var4", uris);
      controller._addUri("/debugSessions/session_1/threads/0/stackFrames/frame0/scopes/global", uris);
      controller._addUri("/debugSessions/session_1/threads/0/stackFrames/frame0/scopes/global/properties/var1", uris);
      controller._addUri("/debugSessions/session_1/threads/0/stackFrames/frame1/scopes/local", uris);
      controller._addUri("/debugSessions/session_1/threads/0/stackFrames/frame1/scopes/local/properties/var3", uris);
      controller._addUri("/debugSessions/session_2/threads/0/stackFrames/frame0/scopes/local", uris);
      controller._addUri("/debugSessions/session_1/threads/1/stackFrames/frame0/scopes/local", uris);

      var entries = controller._getExistingSiblings("/debugSessions/session_1/threads/0/stackFrames/frame0", uris);
      assert.equal(entries.length, 2);
      assert.equal(entries[0].uri, "/debugSessions/session_1/threads/0/stackFrames/frame0/scopes/global");
      assert.equal(entries[1].uri, "/debugSessions/session_1/threads/0/stackFrames/frame0/scopes/local");

      entries = controller._getExistingSiblings("/debugSessions/session_1/threads/0", uris);
      assert.equal(entries.length, 1);
      assert.equal(entries[0].uri, "/debugSessions/session_1/threads/0/stackFrames/frame0");

      entries = controller._getExistingSiblings("/debugSessions/session_1/threads/0/stackFrames/frame0/scopes/local/properties/var1", uris);
      assert.equal(entries.length, 2);
      assert.equal(entries[0].uri, "/debugSessions/session_1/threads/0/stackFrames/frame0/scopes/local/properties/var1/properties/var");
      assert.equal(entries[1].uri, "/debugSessions/session_1/threads/0/stackFrames/frame0/scopes/local/properties/var1/properties/var4");

      entries = controller._getExistingSiblings("/debugSessions/session_1/threads/0/stackFrames/frame1", uris);
      assert.equal(entries.length, 0);
    });
  }));

  test("test _removeUri and _addUri", window.withPromise(function(assert) {
    return _createView().then(function(view) {
      var controller = view.getController();
      var uris = [];

      controller._addUri("/debugSessions/session_1/threads/0/stackFrames/frame0/scopes/global/properties/var1", uris);
      controller._addUri("/debugSessions/session_1/threads/0/stackFrames/frame0/scopes/global", uris);
      controller._addUri("/debugSessions/session_1/threads/0/stackFrames/frame1/scopes/local", uris);
      controller._addUri("/debugSessions/session_1/threads/0/stackFrames/frame0/scopes/local/properties/var1/properties/var4", uris);
      controller._addUri("/debugSessions/session_1/threads/0/stackFrames/frame0/scopes/local/properties/var1/properties/var3", uris);
      controller._addUri("/debugSessions/session_1/threads/0/stackFrames/frame0/scopes/local", uris);
      controller._addUri("/debugSessions/session_1/threads/0/stackFrames/frame0", uris);

      assert.equal(uris[0], "/debugSessions/session_1/threads/0/stackFrames/frame0");
      assert.equal(uris[1], "/debugSessions/session_1/threads/0/stackFrames/frame0/scopes/global");
      assert.equal(uris[2], "/debugSessions/session_1/threads/0/stackFrames/frame0/scopes/global/properties/var1");
      assert.equal(uris[3], "/debugSessions/session_1/threads/0/stackFrames/frame0/scopes/local");
      assert.equal(uris[4], "/debugSessions/session_1/threads/0/stackFrames/frame0/scopes/local/properties/var1/properties/var3");
      assert.equal(uris[5], "/debugSessions/session_1/threads/0/stackFrames/frame0/scopes/local/properties/var1/properties/var4");
      assert.equal(uris[6], "/debugSessions/session_1/threads/0/stackFrames/frame1/scopes/local");

      // remove uri and all descendants
      uris = controller._removeUri("/debugSessions/session_1/threads/0/stackFrames/frame0/scopes/local", uris);

      assert.equal(uris[0], "/debugSessions/session_1/threads/0/stackFrames/frame0");
      assert.equal(uris[1], "/debugSessions/session_1/threads/0/stackFrames/frame0/scopes/global");
      assert.equal(uris[2], "/debugSessions/session_1/threads/0/stackFrames/frame0/scopes/global/properties/var1");
      assert.equal(uris[3], "/debugSessions/session_1/threads/0/stackFrames/frame1/scopes/local");
    });
  }));

  test("test restoreModelFromExpandedVariableState", window.withPromise(function(assert) {
    var debugSession = _createDebugSessionMock({
      id: MessageChannelMock.SESSION_ID_1,
      name: MessageChannelMock.PROJECT_PATH,
      channel: MessageChannelMock.SESSION_CHANNEL_1,
      connected: true,
      suspended: true,
      breakpoints: [],
      threads: [{
        id: "0",
        suspended: true,
        getParent: function() {
          return debugSession;
        },
        stackFrames: [{
          id: "frame0",
          getParent: function() {
            return debugSession.threads[0];
          },
          functionName: "f1",
          location: {
            resourceId: "1",
            lineNumber: 3,
            columnNumber: 0,
            resource: {
              url: "/f/file1.js"
            }
          },
          scopes: [{
            type: "closure",
            object: {
              type: "object",
              objectId: "scope0"
            },
            getParent: function() {
              return debugSession.threads[0].stackFrames[0];
            }
          }, {
            type: "global",
            object: {
              type: "object",
              objectId: "scope1"
            },
            getParent: function() {
              return debugSession.threads[0].stackFrames[0];
            }
          }]
        }]
      }],
      resources: []
    });
    _debugSessionManager.getJsonModel().setProperty("/debugSessions/0", debugSession);
    _debugSessionManager.getJsonModel().setProperty("/connected", true);

    // called when expanding an object node
    debugSession.getPropertiesForObject = function(object, uri) {
      if (object && object.name === "var1") {
        _debugSessionManager.setModelPropertyByUri(uri + "/properties", [{
          name: "var3",
          value: {
            type: "boolean",
            value: true
          }
        }, {
          name: "var4",
          value: {
            type: "object",
            objectId: "140",
            description: "foo"
          }
        }]);
        return Q.resolve(_debugSessionManager.getModelResolver().getModelPropertyByUri(uri));
      }
      return Q.reject("Invalid object [" + uri + "]");
    };
    // called when selecting a stackframe
    debugSession.getPropertiesForScope = function(scope) {
      if (_debugSessionManager.getModelResolver().getModelIdForScope(scope) === "closure_scope0") {
        var uri = _debugSessionManager.getModelResolver().getUriForObject(scope);
        _debugSessionManager.setModelPropertyByUri(uri + "/properties", [{
          name: "var1",
          value: {
            type: "object",
            objectId: "137",
            description: "req"
          }
        }]);
        return Q.resolve(scope);
      }
      if (_debugSessionManager.getModelResolver().getModelIdForScope(scope) === "global") {
        var uri = _debugSessionManager.getModelResolver().getUriForObject(scope);
        _debugSessionManager.setModelPropertyByUri(uri + "/properties", []);
        return Q.resolve(scope);
      }
      return Q.reject("Invalid scope");
    };

    return _createView().then(function(view) {
      // these nodes have been expanded while debugging
      var expandedNodeUris = view.getController()._expandedVariableNodeUris;
      expandedNodeUris.push("/debugSessions/session_1/threads/0/stackFrames/frame0/scopes/global");
      expandedNodeUris.push("/debugSessions/session_1/threads/0/stackFrames/frame0/scopes/closure_scope0/properties/var1");

      _enableRestoreExpandedVariableStateFunction();

      // suspend debug session
      _suspendDebugSession(debugSession);

      return Q.delay(100).then(function() {
        var tree = sap.ui.getCore().byId("NodeJsVariableTree");
        assert.equal(tree.getNodes().length, 2, "Variable section must have 2 scope nodes");

        var nodeScope0 = tree.getNodes()[0];
        assert.equal(nodeScope0.getText(), "Closure", "Scope node of type closure must have correct text");
        assert.equal(nodeScope0.getNodes().length, 1, "Variable section must have 1 property node");

        var nodeVar1 = nodeScope0.getNodes()[0];
        assert.equal(nodeVar1.getText(), "var1: req", "Property node must have correct text");
        assert.equal(nodeVar1.getNodes().length, 2, "Property node must have 2 property node children");
        assert.equal(nodeVar1.getNodes()[0].getText(), "var3: true", "Property node must have correct text");
        assert.equal(nodeVar1.getNodes()[1].getText(), "var4: foo", "Property node must have correct text");
      });
    });
  }));

  test("test _openDefaultEditor", window.withPromise(function(assert) {
    return _createView().then(function(view) {
      // this._context.service.document.getDocumentByPath(filePath).then(function(document) {
      //   if (document) {
      //     that._context.service.editor.getDefaultEditor(document).then(function(editorDelegate) {
      //       if (editorDelegate) {
      //         that._context.service.content.open(document, editorDelegate.service).then(function() {
      //           //scroll to line
      //           editorDelegate.service.getUI5Editor().then(function(editor) {
      //             if (editor) {
      //               editor.oEditor.scrollToLine(lineNumber, true, true);
      //             }
      //           });
      //         });
      //       }
      //     }
      //   }
      // });

      var mockContentService = _sandbox.mock(_context.service.content);
      var mockDocumentService = _sandbox.mock(_context.service.document);
      var mockEditorService = _sandbox.mock(_context.service.editor);

      var ui5Editor = {
        oEditor: {
          scrollToLine: function() {}
        }
      };
      var mockEditor = _sandbox.mock(ui5Editor.oEditor);
      mockEditor.expects("scrollToLine").once().withArgs(21, true, true);

      var defaultEditor = {
        service: {
          getUI5Editor: function() {}
        }
      };
      var mockDefaulEditorService = _sandbox.mock(defaultEditor.service);
      mockDefaulEditorService.expects("getUI5Editor").once().returns(
        Q(ui5Editor)
      );

      mockEditorService.expects("getDefaultEditor").once().returns(
        Q(defaultEditor)
      );

      mockContentService.expects("open").once().returns(
        Q()
      );
      mockDocumentService.expects("getDocumentByPath").once().withArgs("f1/file1.js").returns(
        Q({})
      );

      view.getController()._openDefaultEditor("f1/file1.js", 21);

      return Q.delay(100).then(function() {
        assert.ok(mockContentService.verify());
        assert.ok(mockDocumentService.verify());
        assert.ok(mockEditorService.verify());
        assert.ok(mockDefaulEditorService.verify());
        assert.ok(mockEditor.verify());
      });
    });
  }));
});
