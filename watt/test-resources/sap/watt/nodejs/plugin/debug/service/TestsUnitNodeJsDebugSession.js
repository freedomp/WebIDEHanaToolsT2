define([ //
    "../../../../../../../resources/sap/watt/nodejs/plugin/debug/service/NodeJsBreakpointManager",
    "../../../../../../../resources/sap/watt/nodejs/plugin/debug/service/NodeJsDebugSession",
    "../util/MessageChannelMock",
    "../util/NodeJsDebugSessionManagerMock",
    "../util/LoggerMock"
  ],
  function(NodeJsBreakpointManager, NodeJsDebugSession, MessageChannelMock, NodeJsDebugSessionManagerMock, LoggerMock) {
    "use strict";

    var _messageBus;
    var _debugSessionManager;

    // console logger
    var _logger = new LoggerMock();

    // MessageBus mock
    var MessageBusMock = function MessageBusMock() {
      this.channels = [];

      this.newChannel = function newChannel(channelName, onMessageCallback) {
        var channel = new MessageChannelMock(channelName, onMessageCallback);
        this.channels.push(channel);
        return Q.resolve(channel);
      };
    };

    module("NodeJsDebugSession", {
      setup: function() {
        _messageBus = new MessageBusMock();
        _debugSessionManager = new NodeJsDebugSessionManagerMock(_logger);
      },

      teardown: function() {
        _logger.log.errorExpected = false;
        _debugSessionManager = null;
      }
    });

    var _createDebugSession = function _createDebugSession(assert, sessionChannel, sessionId, sessionDefinition) {

      if (!sessionDefinition) {
        throw new Error("Test has to specify session definition");
      }

      var debugSession = new NodeJsDebugSession(_logger, _messageBus, _debugSessionManager, new NodeJsBreakpointManager(), sessionChannel,
        sessionId, sessionDefinition);
      _debugSessionManager.getJsonModel().setProperty("/debugSessions/0", debugSession);

      return debugSession.connect().then(function() {
        assert.equal(_messageBus.channels.length, 1, "There must be at least one message bus channel after debugSession.connect()");
        assert.equal(_messageBus.channels[0].subscribed, true,
          "MessageBus.subscribeToChannel must have been called by debugSession.connect()");
        assert.equal(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1, "connected"), true,
          "Debug session must be in connected state after debugSession.connect()");

        // reset cached posts
        _messageBus.channels[0].posts.length = 0;
        return Q.resolve(debugSession);
      });
    };

    test("get document provider", window.withPromise(function(assert) {

      return _createDebugSession(assert, MessageChannelMock.SESSION_CHANNEL_1, MessageChannelMock.SESSION_ID_1, MessageChannelMock.SESSION_DEFINITION).then(function(debugSession) {

        var documentProvider = debugSession.getSourceDocumentProvider();

        assert.ok(documentProvider);
      });
    }));

    test("get source code", window.withPromise(function(assert) {
      var expectedSourceCode = "function helloworld() { console.log('The most primitive hello world of the world');};";
      var url1 = MessageChannelMock.URL_1;

      return _createDebugSession(assert, MessageChannelMock.SESSION_CHANNEL_1, MessageChannelMock.SESSION_ID_1, MessageChannelMock.SESSION_DEFINITION).then(function(debugSession) {

        var channel = _messageBus.channels[0];
        //prepare the post response for 'Debugger.setBreakpointByUrl'
        channel.onPostDataPrepareHandler = function(postData) {
          if (postData.payload && (postData.payload.params.scriptId === 1) && postData.payload.method === "Debugger.getScriptSource") {
            postData.message = {
              id: postData.message.id,
              method: "Debugger.getScriptSource",
              result: {
                scriptSource: expectedSourceCode
              }
            };
          }
        };

        return debugSession.getSourceCodeForId(MessageChannelMock.SCRIPT_ID_1).then(function(result) {
          assert.equal(_messageBus.channels[0].posts.length, 1);

          assert.ok(result);
          assert.equal(result, expectedSourceCode);
        });
      });
    }));

    test("get resource resolver", window.withPromise(function(assert) {

      var expectedProjectPath = "/project/path/";

      return _createDebugSession(assert, MessageChannelMock.SESSION_CHANNEL_1, MessageChannelMock.SESSION_ID_1, {
        projectPath: expectedProjectPath
      }).then(function(debugSession) {

        var resourceResolver = debugSession.getResourceResolver();

        assert.ok(resourceResolver);

        assert.equal(resourceResolver.getProjectPath(), expectedProjectPath);
      });
    }));

    test("get Resource By File Path", window.withPromise(function(assert) {

      var PROJECT_PATH = "/project/path";

      return _createDebugSession(assert, MessageChannelMock.SESSION_CHANNEL_1, MessageChannelMock.SESSION_ID_1, {
        projectPath: PROJECT_PATH
      }).then(function(debugSession) {

        var expectedUrl = "file:///usr/sap/xs2work/executionagent/executionroot/198956a6-5abd-4011-ab25-4e28d26dce88/app/folder/index.js";

        debugSession.resources.push({
          url: "file:///usr/sap/xs2work/executionagent/executionroot/198956a6-5abd-4011-ab25-4e28d26dce88/app/index.js"
        });
        debugSession.resources.push({
          url: expectedUrl
        });
        debugSession.resources.push({
          url: "file:///usr/sap/xs2work/executionagent/executionroot/198956a6-5abd-4011-ab25-4e28d26dce88/app/folder/code.js"
        });

        debugSession.getResourceResolver().updateRemoteRoot(expectedUrl);

        var resource = debugSession.getResourceByFilePath(PROJECT_PATH + "/folder/index.js");

        assert.ok(resource);

        assert.equal(resource.url, expectedUrl);
      });
    }));

    test("get Resource By File Path no project", window.withPromise(function(assert) {

      return _createDebugSession(assert, MessageChannelMock.SESSION_CHANNEL_1, MessageChannelMock.SESSION_ID_1, {
        projectPath: null
      }).then(function(debugSession) {

        var expectedUrl = "file:///home/D026715/git/chat-example/index.js";

        var moduleUrl = "file:///home/D026715/git/chat-example/node_modules/express/node_modules/fresh/index.js";

        var otherUrl = "file:///home/D026715/git/chat-example/folder/other.js";

        debugSession.resources.push({
          url: moduleUrl
        });
        debugSession.resources.push({
          url: expectedUrl
        });
        debugSession.resources.push({
          url: otherUrl
        });

        debugSession.getResourceResolver().updateRemoteRoot(moduleUrl);

        var resource = debugSession.getResourceByFilePath("/chat-example/index.js");

        assert.ok(resource);

        assert.equal(resource.url, expectedUrl);

        var resource2 = debugSession.getResourceByFilePath("/chat-example/folder/other.js");

        assert.ok(resource2);

        assert.equal(resource2.url, otherUrl);
      });
    }));

    test("get readable name using project path", window.withPromise(function(assert) {
      return _createDebugSession(assert, MessageChannelMock.SESSION_CHANNEL_1, MessageChannelMock.SESSION_ID_1, MessageChannelMock.SESSION_DEFINITION).then(function(debugSession) {
        assert.equal(debugSession.name, MessageChannelMock.PROJECT_PATH, "DebugSession.name must match project path");
      });
    }));

    test("get readable name using host and port", window.withPromise(function(assert) {
      return _createDebugSession(assert, MessageChannelMock.SESSION_CHANNEL_1, MessageChannelMock.SESSION_ID_1, {
        debugURL: "http://user:abc@host:6003"
      }).then(function(debugSession) {
        assert.equal(debugSession.name, "host:6003", "DebugSession.name must match host:port");
      });
    }));

    test("get readable name using fallback", window.withPromise(function(assert) {
      return _createDebugSession(assert, MessageChannelMock.SESSION_CHANNEL_1, MessageChannelMock.SESSION_ID_1, {}).then(function(debugSession) {
        assert.equal(debugSession.name, MessageChannelMock.SESSION_ID_1, "DebugSession.name must match session id");
      });
    }));

    test("connect", window.withPromise(function(assert) {
      var debugSession = new NodeJsDebugSession(_logger, _messageBus, _debugSessionManager, new NodeJsBreakpointManager(), MessageChannelMock.SESSION_CHANNEL_1,
        MessageChannelMock.SESSION_ID_1, MessageChannelMock.SESSION_DEFINITION);
      _debugSessionManager.getJsonModel().setProperty("/debugSessions/0", debugSession);

      return debugSession.connect().then(function() {
        assert.equal(_messageBus.channels.length, 1, "There must be at least one message bus channel");

        var channel = _messageBus.channels[0];
        assert.equal(channel.posts.length, 4, "4 post requests required for connect");
        assert.equal(channel.subscribed, true, "MessageBus.subscribeToChannel must have been called by connect");
        assert.ok(channel.validatePost("/debug/nodejs/command/" + MessageChannelMock.SESSION_ID_1, "Page.enable"),
          "Connect must call 'Page.enable'." + channel.validatePostError);
        assert.ok(channel.validatePost("/debug/nodejs/command/" + MessageChannelMock.SESSION_ID_1, "Debugger.enable"),
          "Connect must call 'Debugger.enable'." + channel.validatePostError);
        assert.ok(channel.validatePost("/debug/nodejs/command/" + MessageChannelMock.SESSION_ID_1, "Runtime.enable"),
          "Connect must call 'Runtime.enable'." + channel.validatePostError);
        assert.ok(channel.validatePost("/debug/nodejs/command/" + MessageChannelMock.SESSION_ID_1, "Page.getResourceTree"),
          "Connect did not invoke 'Page.getResourceTree'." + channel.validatePostError);
        assert.equal(debugSession.id, MessageChannelMock.SESSION_ID_1,
          "Session id must have been set session after connect");
        assert.equal(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1, "connected"), true,
          "Debug session must be in connected state after connect");
        assert.equal(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1, "suspended"), false,
          "Debug session must not be in suspended state after connect");
      });
    }));

    test("disconnect", window.withPromise(function(assert) {
      return _createDebugSession(assert, MessageChannelMock.SESSION_CHANNEL_1, MessageChannelMock.SESSION_ID_1, MessageChannelMock.SESSION_DEFINITION).then(function(debugSession) {
        return debugSession.disconnect().then(function() {
          var channel = _messageBus.channels[0];
          assert.equal(channel.posts.length, 1,
            "1 post request required if the debug sesssion is disconnected");
          assert.ok(channel.validatePost("/debug/nodejs/detach/" + MessageChannelMock.SESSION_ID_1),
            "Disconnect must call '/debug/nodejs/detach/<sessionId>'." + channel.validatePostError);
          assert.equal(channel.subscribed, false, "MessageBus.unsubscribeFromChannel must have been called by disconnect");
        });
      });
    }));

    test("disconnectWithoutConnect", window.withPromise(function(assert) {
      var debugSession = new NodeJsDebugSession(_logger, _messageBus, _debugSessionManager, new NodeJsBreakpointManager(), MessageChannelMock.SESSION_CHANNEL_1,
        MessageChannelMock.SESSION_ID_1, MessageChannelMock.SESSION_DEFINITION);
      _debugSessionManager.getJsonModel().setProperty("/debugSessions/0", debugSession);
      // just to check whether unsubscribeFromChannel has been called
      _messageBus.subscribed = null;

      //execute disconnect
      return debugSession.disconnect().then(function() {
        assert.equal(_messageBus.channels.length, 0, "There must be no message bus channels opened");
      });
    }));

    test("disconnectWithExistingBreakpoints", window.withPromise(function(assert) {
      return _createDebugSession(assert, MessageChannelMock.SESSION_CHANNEL_1, MessageChannelMock.SESSION_ID_1, MessageChannelMock.PROJECT_PATH).then(function(debugSession) {
        // mock existing breakpoints
        var breakpoint1 = {
          id: 11,
          filePath: MessageChannelMock.FILE_PATH_1,
          lineNumber: 11,
          resourceId: MessageChannelMock.SCRIPT_ID_1,
          enabled: true
        };
        var breakpoint2 = {
          id: 22,
          filePath: MessageChannelMock.FILE_PATH_2,
          lineNumber: 22,
          resourceId: MessageChannelMock.SCRIPT_ID_2,
          enabled: false
        };
        _debugSessionManager.data.debugSessions[0].breakpoints.push(breakpoint1);
        _debugSessionManager.data.debugSessions[0].breakpoints.push(breakpoint2);
        assert.ok(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1, "breakpoints"),
          "Debug session must contain 2 breakpoints");
        assert.equal(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1, "breakpoints").length, 2,
          "Debug session must contain 2 breakpoints");

        //execute disconnect
        return debugSession.disconnect().then(function() {
          var channel = _messageBus.channels[0];
          assert.equal(channel.posts.length, 2,
            "2 post requests required if debug sesssion is disconnected with 1 enabled and 1 disabled breakpoint");
          assert.ok(channel.validatePost("/debug/nodejs/detach/" + MessageChannelMock.SESSION_ID_1),
            "Disconnect must call '/debug/nodejs/detach/<sessionId>'." + channel.validatePostError);
          assert.ok(channel.validatePost("/debug/nodejs/command/" + MessageChannelMock.SESSION_ID_1, "Debugger.removeBreakpoint", [{
              key: "breakpointId",
              value: 11
            }]),
            "Disconnect with existing  breakpoints must call 'Debugger.removeBreakpoint'." + channel.validatePostError);
          assert.equal(channel.subscribed, false, "MessageBus.unsubscribeFromChannel must have been called by disconnect");
        });
      });
    }));

    test("setBreakpoint", window.withPromise(function(assert) {
      return _createDebugSession(assert, MessageChannelMock.SESSION_CHANNEL_1, MessageChannelMock.SESSION_ID_1, MessageChannelMock.SESSION_DEFINITION).then(function(debugSession) {
        var channel = _messageBus.channels[0];
        //prepare the post response for 'Debugger.setBreakpointByUrl'
        channel.onPostDataPrepareHandler = function(postData) {
          if (postData.payload && postData.payload.method === "Debugger.setBreakpointByUrl") {
            postData.message = {
              id: postData.payload.id,
              result: {
                locations: [{
                  scriptId: MessageChannelMock.SCRIPT_ID_1,
                  lineNumber: 9,
                  columnNumber: 0
                }],
                breakpointId: 1
              }
            };
          }
        };

        //execute setBreakpoint
        return debugSession.setBreakpoint(MessageChannelMock.FILE_PATH_1, 7).then(function() {
          assert.equal(channel.posts.length, 1, "1 post request required for setBreakpoint");
          assert.ok(channel.validatePost("/debug/nodejs/command/" + MessageChannelMock.SESSION_ID_1, "Debugger.setBreakpointByUrl", [{
              key: "lineNumber",
              value: 7
            }, {
              key: "url",
              value: MessageChannelMock.URL_1
            }]),
            "Disconnect with existing  breakpoints must call 'Debugger.removeBreakpoint'." + channel.validatePostError);
          assert.equal(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1, "breakpoints/0/filePath"),
            MessageChannelMock.FILE_PATH_1,
            "Breakpoint's filePath property must be set");
          assert.equal(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1, "breakpoints/0/lineNumber"), 9,
            "Breakpoint's lineNumber property must be set");
          assert.equal(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1, "breakpoints/0/resourceId"),
            MessageChannelMock.SCRIPT_ID_1,
            "Breakpoint's script id property must be set");
          assert.equal(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1, "breakpoints/0/enabled"), true,
            "Breakpoint's enabled property must be set");
        });
      });
    }));

    test("setBreakpointAlreadyExisting", window.withPromise(function(assert) {
      return _createDebugSession(assert, MessageChannelMock.SESSION_CHANNEL_1, MessageChannelMock.SESSION_ID_1, MessageChannelMock.SESSION_DEFINITION).then(function(debugSession) {
        // mock existing breakpoint
        var breakpoint = {
          id: 1,
          filePath: MessageChannelMock.FILE_PATH_1,
          lineNumber: 7,
          resourceId: MessageChannelMock.SCRIPT_ID_1,
          enabled: false
        };
        _debugSessionManager.data.debugSessions[0].breakpoints.push(breakpoint);
        assert.ok(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1, "breakpoints"),
          "Debug session must contain 1 breakpoint");
        assert.equal(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1, "breakpoints").length, 1,
          "Debug session must contain 1 breakpoint");

        //execute setBreakpoint
        return debugSession.setBreakpoint(MessageChannelMock.FILE_PATH_1, 7)
          .then(function() {
            assert.ok(false, "setBreakpoint must fail for already existing breakpoint");
          }).fail(function(error) {
            // expected as the breakpoint does not exist
            assert.ok(error && error.toLocaleString().search(MessageChannelMock.FILE_PATH_1) !== -1,
              "setBreakpoint error message does not contain breakpoint location");
          });
      });
    }));

    test("enableBreakpoint", window.withPromise(function(assert) {
      return _createDebugSession(assert, MessageChannelMock.SESSION_CHANNEL_1, MessageChannelMock.SESSION_ID_1, MessageChannelMock.SESSION_DEFINITION).then(function(debugSession) {
        assert.equal(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1, "connected"), true,
          "Debug session must be in connected state after connect");

        // mock existing breakpoint
        var breakpoint = {
          id: 1,
          filePath: MessageChannelMock.FILE_PATH_1,
          lineNumber: 11,
          resourceId: MessageChannelMock.SCRIPT_ID_1,
          enabled: false
        };
        _debugSessionManager.data.debugSessions[0].breakpoints.push(breakpoint);
        assert.ok(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1, "breakpoints"),
          "Debug session must contain 1 breakpoint");
        assert.equal(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1, "breakpoints").length, 1,
          "Debug session must contain 1 breakpoint");
        var channel = _messageBus.channels[0];
        //prepare the post response for 'Debugger.setBreakpointByUrl'
        channel.onPostDataPrepareHandler = function(postData) {
          if (postData.payload && postData.payload.method === "Debugger.setBreakpointByUrl") {
            // enabling breakpoints must not change the breakpoints location
            postData.message = {
              id: postData.payload.id,
              result: {
                locations: [{
                  scriptId: MessageChannelMock.SCRIPT_ID_1,
                  lineNumber: 13,
                  columnNumber: 0
                }],
                breakpointId: 1
              }
            };
          }
        };

        //execute enableBreakpoint
        return debugSession.enableBreakpoint(MessageChannelMock.FILE_PATH_1, 11).then(function() {
          assert.equal(channel.posts.length, 1, "1 post request required for enableBreakpoint");
          assert.ok(channel.validatePost("/debug/nodejs/command/" + MessageChannelMock.SESSION_ID_1, "Debugger.setBreakpointByUrl", [{
              key: "lineNumber",
              value: 11
            }, {
              key: "url",
              value: MessageChannelMock.URL_1
            }]),
            "Method enableBreakpoint must call 'Debugger.setBreakpointByUrl'." + channel.validatePostError);
          assert.equal(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1, "breakpoints/0/filePath"),
            MessageChannelMock.FILE_PATH_1,
            "Breakpoint's filePath property must be set");
          assert.equal(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1, "breakpoints/0/lineNumber"), 11,
            "Breakpoint's lineNumber property must be set");
          assert.equal(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1, "breakpoints/0/resourceId"),
            MessageChannelMock.SCRIPT_ID_1,
            "Breakpoint's script id property must be set");
          assert.equal(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1, "breakpoints/0/enabled"), true,
            "Breakpoint's enabled property must be set");
        });
      });
    }));

    test("enableBreakpointNotExisting", window.withPromise(function(assert) {
      return _createDebugSession(assert, MessageChannelMock.SESSION_CHANNEL_1, MessageChannelMock.SESSION_ID_1, MessageChannelMock.SESSION_DEFINITION).then(function(debugSession) {

        //execute enableBreakpoint
        return debugSession.enableBreakpoint(MessageChannelMock.FILE_PATH_1, 7).then(function() {
          assert.ok(false, "enableBreakpoint must fail on not existing breakpoint");
        }).fail(function(error) {
          // expected as the breakpoint does not exist
          assert.ok(error && error.toLocaleString().search(MessageChannelMock.FILE_PATH_1) !== -1,
            "enableBreakpoint error message does not contain breakpoint location");
        });
      });
    }));

    test("disableBreakpoint", window.withPromise(function(assert) {
      return _createDebugSession(assert, MessageChannelMock.SESSION_CHANNEL_1, MessageChannelMock.SESSION_ID_1, MessageChannelMock.SESSION_DEFINITION).then(function(debugSesson) {
        // mock existing breakpoint
        var breakpoint = {
          id: 1,
          filePath: MessageChannelMock.FILE_PATH_1,
          lineNumber: 11,
          resourceId: MessageChannelMock.SCRIPT_ID_1,
          enabled: true
        };
        _debugSessionManager.data.debugSessions[0].breakpoints.push(breakpoint);
        assert.ok(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1, "breakpoints"),
          "Debug session must contain 1 breakpoint");
        assert.equal(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1, "breakpoints").length, 1,
          "Debug session must contain 1 breakpoint");

        //execute disableBreakpoint
        return debugSesson.disableBreakpoint(MessageChannelMock.FILE_PATH_1, 11).then(function() {
          var channel = _messageBus.channels[0];
          assert.equal(channel.posts.length, 1, "1 post request required for disableBreakpoint");
          assert.ok(channel.validatePost("/debug/nodejs/command/" + MessageChannelMock.SESSION_ID_1, "Debugger.removeBreakpoint", [{
              key: "breakpointId",
              value: 1
            }]),
            "Method disableBreakpoint must call 'Debugger.removeBreakpoint'." + channel.validatePostError);
          assert.equal(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1, "breakpoints/0/filePath"),
            MessageChannelMock.FILE_PATH_1,
            "Breakpoint's filePath property must be set");
          assert.equal(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1, "breakpoints/0/lineNumber"), 11,
            "Breakpoint's lineNumber property must be set");
          assert.equal(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1, "breakpoints/0/resourceId"),
            MessageChannelMock.SCRIPT_ID_1,
            "Breakpoint's script id property must be set");
          assert.equal(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1, "breakpoints/0/enabled"), false,
            "Breakpoint's enabled property must be set to false");
        });
      });
    }));

    test("disableBreakpointNotExisting", window.withPromise(function(assert) {
      return _createDebugSession(assert, MessageChannelMock.SESSION_CHANNEL_1, MessageChannelMock.SESSION_ID_1, MessageChannelMock.SESSION_DEFINITION).then(function(debugSesson) {

        //execute disableBreakpoint
        return debugSesson.disableBreakpoint(MessageChannelMock.FILE_PATH_1, 11).then(function() {
          var channel = _messageBus.channels[0];
          assert.equal(channel.posts.length, 0, "0 post request required for disableBreakpoint if breakpoint not existing");
          assert.equal(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1, "breakpoints/0/filePath"),
            MessageChannelMock.FILE_PATH_1,
            "Breakpoint's filePath property must be set");
          assert.equal(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1, "breakpoints/0/lineNumber"), 11,
            "Breakpoint's lineNumber property must be set");
          assert.equal(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1, "breakpoints/0/resourceId"),
            MessageChannelMock.SCRIPT_ID_1,
            "Breakpoint's script id property must be set");
          assert.equal(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1, "breakpoints/0/enabled"), false,
            "Breakpoint's enabled property must be set to false");
        });
      });
    }));

    test("suspend", window.withPromise(function(assert) {
      return _createDebugSession(assert, MessageChannelMock.SESSION_CHANNEL_1, MessageChannelMock.SESSION_ID_1, MessageChannelMock.SESSION_DEFINITION).then(function(debugSesson) {
        var channel = _messageBus.channels[0];
        //prepare the post response for 'Debugger.paused' event
        channel.onPostDataPrepareHandler = function(postData) {
          if (postData.payload && postData.payload.method === "Debugger.pause") {
            // let the message queue remove the corresponding request message
            channel.onMessageCallback(postData.message, postData.error, postData.context);
            //prepare the 'debugger.paused' event containg the stackframe information
            postData.message = {
              id: ++postData.payload.id,
              method: "Debugger.paused",
              params: {
                reason: "other",
                callFrames: [{
                  callFrameId: 11,
                  functionName: "function1",
                  location: {
                    scriptId: MessageChannelMock.SCRIPT_ID_1,
                    lineNumber: 2,
                    columnNumber: 1
                  }
                }, {
                  callFrameId: 22,
                  functionName: "function2",
                  location: {
                    scriptId: MessageChannelMock.SCRIPT_ID_2,
                    lineNumber: 3,
                    columnNumber: 2
                  }
                }]
              }
            };
          }
        };

        //execute suspend
        return debugSesson.suspend().then(function() {
          assert.equal(channel.posts.length, 1, "1 post request required for suspend");
          assert.ok(channel.validatePost("/debug/nodejs/command/" + MessageChannelMock.SESSION_ID_1, "Debugger.pause"),
            "Method suspend must call 'Debugger.pause'." + channel.validatePostError);
          assert.equal(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1, "suspended"), true,
            "Debug session must be in suspended state after suspend called");
          assert.ok(_debugSessionManager.validateEvent("suspended", {
            debugSession: _debugSessionManager.data.debugSessions[0]
          }), "An event [suspended] has to be fired if suspend is called");
          assert.equal(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1, "threads/0/stackFrames/0/id"), 11,
            "Callframe's id property must be set");
          assert.equal(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1, "threads/0/stackFrames/0/functionName"),
            "function1",
            "Callframe's functionName property must be set");
          assert.equal(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1,
              "threads/0/stackFrames/0/location/lineNumber"), 2,
            "Callframe's lineNumber property must be set");
          assert.equal(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1,
              "threads/0/stackFrames/0/location/columnNumber"), 1,
            "Callframe's columnNumber property must be set");
          assert.ok(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1, "threads/0/stackFrames/0/location/resource"),
            "Callframe's resource property must be set");
          assert.ok(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1, "threads/0/stackFrames/0/location/resource/id"),
            "Callframe's resource id property must be set");
          assert.equal(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1,
              "threads/0/stackFrames/0/location/resourceId"), 1,
            "Callframe's resource id property must be set");
          assert.equal(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1, "threads/0/stackFrames/1/id"), 22,
            "Callframe's id property must be set");

        });
      });
    }));

    test("resume", window.withPromise(function(assert) {
      return _createDebugSession(assert, MessageChannelMock.SESSION_CHANNEL_1, MessageChannelMock.SESSION_ID_1, MessageChannelMock.SESSION_DEFINITION).then(function(debugSesson) {
        var channel = _messageBus.channels[0];
        //prepare some stackFrame data in order to check whether resume will clear this
        var stackFrame = {
          id: 11,
          functionName: "function1",
          location: {
            resourceId: MessageChannelMock.SCRIPT_ID_1,
            lineNumber: 2,
            columnNumber: 1
          }
        };
        _debugSessionManager.data.debugSessions[0].threads[0].stackFrames.push(stackFrame);
        assert.equal(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1, "threads/0/stackFrames").length, 1,
          "Debug session must contain 1 stack frame");
        //prepare the post response for 'Debugger.paused' event
        channel.onPostDataPrepareHandler = function(postData) {
          if (postData.payload && postData.payload.method === "Debugger.resume") {
            // let the message queue remove the corresponding request message
            channel.onMessageCallback(postData.message, postData.error, postData.context);
            //prepare the 'debugger.resumed' event
            postData.message = {
              id: ++postData.payload.id,
              method: "Debugger.resumed"
            };
          }
        };

        //execute resume
        return debugSesson.resume().then(function() {
          assert.equal(channel.posts.length, 1, "1 post request required for suspend");
          assert.ok(channel.validatePost("/debug/nodejs/command/" + MessageChannelMock.SESSION_ID_1, "Debugger.resume"),
            "Method resume must call 'Debugger.resume'." + channel.validatePostError);
          assert.equal(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1, "suspended"), false,
            "Debug session must be in resumed state after resume called");
          assert.ok(_debugSessionManager.validateEvent("resumed", {
            debugSession: _debugSessionManager.data.debugSessions[0]
          }), "An event [resumed] has to be fired if resume is called");
          assert.equal(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1, "threads/0/stackFrames").length, 0,
            "Debug session must contain 0 stack frames");
        });
      });
    }));

    test("stepOver", window.withPromise(function(assert) {
      return _createDebugSession(assert, MessageChannelMock.SESSION_CHANNEL_1, MessageChannelMock.SESSION_ID_1, MessageChannelMock.SESSION_DEFINITION).then(function(debugSesson) {
        var channel = _messageBus.channels[0];
        //prepare some stackFrame data in order to check whether stepOver will clear this
        var stackFrame = {
          id: 11,
          functionName: "function1",
          location: {
            resourceId: MessageChannelMock.SCRIPT_ID_1,
            lineNumber: 2,
            columnNumber: 1
          }
        };
        _debugSessionManager.data.debugSessions[0].threads[0].stackFrames.push(stackFrame);
        //prepare the post response for 'Debugger.resumed' event
        channel.onPostDataPrepareHandler = function(postData) {
          if (postData.payload && postData.payload.method === "Debugger.stepOver") {
            // let the message queue remove the corresponding request message
            channel.onMessageCallback(postData.message, postData.error, postData.context);
            //prepare the 'debugger.resumed' event
            postData.message = {
              id: ++postData.payload.id,
              method: "Debugger.resumed"
            };
          }
        };

        //execute stepOver
        return debugSesson.stepOver().then(function() {
          assert.equal(channel.posts.length, 1, "1 post request required for stepOver");
          assert.ok(channel.validatePost("/debug/nodejs/command/" + MessageChannelMock.SESSION_ID_1, "Debugger.stepOver"),
            "Method resume must call 'Debugger.stepOver'." + channel.validatePostError);
          assert.equal(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1, "suspended"), false,
            "Debug session must be in resumed state after stepOver called");
          assert.ok(_debugSessionManager.validateEvent("resumed", {
            debugSession: _debugSessionManager.data.debugSessions[0]
          }), "An event [resumed] has to be fired if stepOver is called");
          assert.equal(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1, "threads/0/stackFrames").length, 0,
            "Debug session must contain 0 stack frames after stepOver has been called");
        });
      });
    }));

    test("stepInto", window.withPromise(function(assert) {
      return _createDebugSession(assert, MessageChannelMock.SESSION_CHANNEL_1, MessageChannelMock.SESSION_ID_1, MessageChannelMock.SESSION_DEFINITION).then(function(debugSesson) {
        var channel = _messageBus.channels[0];
        //prepare some stackFrame data in order to check whether stepInto will clear this
        var stackFrame = {
          id: 11,
          functionName: "function1",
          location: {
            resourceId: MessageChannelMock.SCRIPT_ID_1,
            lineNumber: 2,
            columnNumber: 1
          }
        };
        _debugSessionManager.data.debugSessions[0].threads[0].stackFrames.push(stackFrame);
        assert.equal(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1, "threads/0/stackFrames").length, 1,
          "Debug session must contain 1 stack frame");
        //prepare the post response for 'Debugger.resumed' event
        channel.onPostDataPrepareHandler = function(postData) {
          if (postData.payload && postData.payload.method === "Debugger.stepInto") {
            // let the message queue remove the corresponding request message
            channel.onMessageCallback(postData.message, postData.error, postData.context);
            //prepare the 'debugger.resumed' event
            postData.message = {
              id: ++postData.payload.id,
              method: "Debugger.resumed"
            };
          }
        };

        //execute stepInto
        return debugSesson.stepInto().then(function() {
          assert.equal(channel.posts.length, 1, "1 post request required for stepInto");
          assert.ok(channel.validatePost("/debug/nodejs/command/" + MessageChannelMock.SESSION_ID_1, "Debugger.stepInto"),
            "Method resume must call 'Debugger.stepInto'." + channel.validatePostError);
          assert.equal(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1, "suspended"), false,
            "Debug session must be in resumed state after stepInto called");
          assert.ok(_debugSessionManager.validateEvent("resumed", {
            debugSession: _debugSessionManager.data.debugSessions[0]
          }), "An event [resumed] has to be fired if stepInto is called");
          assert.equal(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1, "threads/0/stackFrames").length, 0,
            "Debug session must contain 0 stack frames after stepInto has been called");
        });
      });
    }));

    test("stepOut", window.withPromise(function(assert) {
      return _createDebugSession(assert, MessageChannelMock.SESSION_CHANNEL_1, MessageChannelMock.SESSION_ID_1, MessageChannelMock.SESSION_DEFINITION).then(function(debugSesson) {
        var channel = _messageBus.channels[0];
        //prepare some stackFrame data in order to check whether stepOut will clear this
        var stackFrame = {
          id: 11,
          functionName: "function1",
          location: {
            resourceId: MessageChannelMock.SCRIPT_ID_1,
            lineNumber: 2,
            columnNumber: 1
          }
        };
        _debugSessionManager.data.debugSessions[0].threads[0].stackFrames.push(stackFrame);
        assert.equal(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1, "threads/0/stackFrames").length, 1,
          "Debug session must contain 1 stack frame");
        //prepare the post response for 'Debugger.resumed' event
        channel.onPostDataPrepareHandler = function(postData) {
          if (postData.payload && postData.payload.method === "Debugger.stepOut") {
            // let the message queue remove the corresponding request message
            channel.onMessageCallback(postData.message, postData.error, postData.context);
            //prepare the 'debugger.resumed' event
            postData.message = {
              id: ++postData.payload.id,
              method: "Debugger.resumed"
            };
          }
        };

        //execute stepOut
        return debugSesson.stepOut().then(function() {
          assert.equal(channel.posts.length, 1, "1 post request required for stepOut");
          assert.ok(channel.validatePost("/debug/nodejs/command/" + MessageChannelMock.SESSION_ID_1, "Debugger.stepOut"),
            "Method resume must call 'Debugger.stepOut'." + channel.validatePostError);
          assert.equal(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1, "suspended"), false,
            "Debug session must be in resumed state after stepOut called");
          assert.ok(_debugSessionManager.validateEvent("resumed", {
            debugSession: _debugSessionManager.data.debugSessions[0]
          }), "An event [resumed] has to be fired if stepOut is called");
          assert.equal(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1, "threads/0/stackFrames").length, 0,
            "Debug session must contain 0 stack frames after stepOut has been called");
        });
      });
    }));

    test("getPropertiesForScope", window.withPromise(function(assert) {
      return _createDebugSession(assert, MessageChannelMock.SESSION_CHANNEL_1, MessageChannelMock.SESSION_ID_1, MessageChannelMock.SESSION_DEFINITION).then(function(debugSesson) {
        var channel = _messageBus.channels[0];
        //prepare stacktrace data containing 2 scopes
        var stackFrame = {
          id: "frame0",
          getParent: function() {
            return debugSesson.threads[0];
          },
          functionName: "function1",
          location: {
            resourceId: MessageChannelMock.SCRIPT_ID_1,
            lineNumber: 2,
            columnNumber: 1
          },
          scopes: [{
            type: "local",
            object: {
              type: "object",
              objectId: "scope0:0"
            },
            getParent: function() {
              return stackFrame;
            }
          }, {
            type: "global",
            object: {
              type: "object",
              objectId: "scope0:1"
            },
            getParent: function() {
              return stackFrame;
            }
          }]
        };

        var scope0 = stackFrame.scopes[0];
        var scope1 = stackFrame.scopes[1];

        _debugSessionManager.data.debugSessions[0].threads[0].stackFrames.push(stackFrame);

        assert.equal(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1, "threads/0/stackFrames/0/scopes").length, 2,
          "Debug session must contain 1 stackframe having 2 scopes");
        //prepare the post response for 'Runtime.getProperties'
        channel.onPostDataPrepareHandler = function(postData) {
          if (postData.payload && postData.payload.method === "Runtime.getProperties") {
            if (postData.payload.params.objectId === "scope0:0") {
              postData.message = {
                id: postData.payload.id,
                result: {
                  result: [{
                    name: "var1",
                    value: {
                      type: "boolean",
                      value: false
                    }
                  }, {
                    name: "var2",
                    value: {
                      type: "object",
                      objectId: "137"
                    }
                  }]
                }
              };
            } else if (postData.payload.params.objectId === "scope0:1") {
              postData.message = {
                id: postData.payload.id,
                result: {
                  result: [{
                    name: "var5",
                    value: {
                      type: "number",
                      value: 1
                    }
                  }]
                }
              };
            }
          }
        };
        _debugSessionManager.getUriForObject = function(object) {
          if (object === scope0) {
            return "/debugSessions/" + MessageChannelMock.SESSION_ID_1 + "/threads/0/stackFrames/frame0/scopes/local";
          }
        };

        _debugSessionManager.setModelPropertyByUri = function(uri, object) {
          if (uri === "/debugSessions/" + MessageChannelMock.SESSION_ID_1 + "/threads/0/stackFrames/frame0/scopes/local/properties") {
            _debugSessionManager.setModelProperty(debugSesson.id, "threads/0/stackFrames/0/scopes/0/properties", object);
          }
        };

        //execute getPropertiesForStackFrame
        return debugSesson.getPropertiesForScope(scope0).then(function() {
          assert.equal(channel.posts.length, 1, "1 post requests required for reading properties of scope");
          assert.ok(channel.validatePost("/debug/nodejs/command/" + MessageChannelMock.SESSION_ID_1, "Runtime.getProperties"),
            "Method getPropertiesForScope must call 'Runtime.getProperties'." + channel.validatePostError);
          assert.ok(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1, "threads/0/stackFrames/0/scopes/0/properties"),
            "Scope must contain 2 properties after getPropertiesForScope has been called");
          assert.equal(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1,
              "threads/0/stackFrames/0/scopes/0/properties").length, 2,
            "Scope must contain 2 properties after getPropertiesForScope has been called");
          assert.equal(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1,
              "threads/0/stackFrames/0/scopes/0/properties/0/name"), "var1",
            "StackFrame scope must contain property 'var1' after getPropertiesForScope has been called");
        });
      });
    }));

    test("getPropertiesForObject", window.withPromise(function(assert) {
      return _createDebugSession(assert, MessageChannelMock.SESSION_CHANNEL_1, MessageChannelMock.SESSION_ID_1, MessageChannelMock.SESSION_DEFINITION).then(function(debugSesson) {
        var channel = _messageBus.channels[0];
        //prepare stacktrace data with 1 scope containing 2 objects
        var property0 = {
          name: "var1",
          value: {
            type: "boolean",
            value: false
          }
        };
        var property1 = {
          name: "var2",
          value: {
            type: "object",
            objectId: "137"
          }
        };
        var stackFrame = {
          id: "frame0",
          getParent: function() {
            return debugSesson.threads[0];
          },
          functionName: "function1",
          location: {
            resourceId: MessageChannelMock.SCRIPT_ID_1,
            lineNumber: 2,
            columnNumber: 1
          },
          scopes: [{
            getParent: function() {
              return stackFrame;
            },
            type: "local",
            object: {
              type: "object",
              objectId: "scope0:0"
            },
            properties: [
              property0,
              property1
            ]
          }]
        };
        _debugSessionManager.data.debugSessions[0].threads[0].stackFrames.push(stackFrame);
        assert.equal(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1, "threads/0/stackFrames/0/scopes/0/properties").length,
          2, "Debug session must contain 1 stackframe having 1 scope, having 2 properties");

        _debugSessionManager.getUriForObject = function(object) {
          if (object === property1) {
            return "/debugSessions/" + MessageChannelMock.SESSION_ID_1 + "/threads/0/stackFrames/frame0/scopes/scope0:0/properties/137";
          }
        };

        _debugSessionManager.setModelPropertyByUri = function(uri, object) {
          if (uri === "/debugSessions/" + MessageChannelMock.SESSION_ID_1 + "/threads/0/stackFrames/frame0/scopes/scope0:0/properties/137/properties") {
            _debugSessionManager.setModelProperty(debugSesson.id, "threads/0/stackFrames/0/scopes/0/properties/1/properties", object);
          }
        };

        //prepare the post response for 'Runtime.getProperties'
        channel.onPostDataPrepareHandler = function(postData) {
          if (postData.payload && postData.payload.method === "Runtime.getProperties") {
            if (postData.payload.params.objectId === "137" && postData.payload.params.ownProperties === true && postData.payload.params.accessorPropertiesOnly ===
              false) {
              postData.message = {
                id: postData.payload.id,
                result: {
                  result: [{
                    name: "var3",
                    value: {
                      type: "number",
                      value: 1
                    }
                  }, {
                    name: "var4",
                    value: {
                      type: "boolean",
                      value: false
                    }
                  }]
                }
              };
            } else if (postData.payload.params.objectId === "137" && postData.payload.params.ownProperties === false && postData.payload.params
              .accessorPropertiesOnly === true) {
              postData.message = {
                id: postData.payload.id,
                result: {
                  result: [{
                    name: "var5",
                    value: {
                      type: "number",
                      value: 1
                    }
                  }]
                }
              };
            }
          }
        };

        //execute getPropertiesForObject
        return debugSesson.getPropertiesForObject(property1, "/debugSessions/" + MessageChannelMock.SESSION_ID_1 + "/threads/0/stackFrames/frame0/scopes/scope0:0/properties/137").then(function() {
          assert.equal(channel.posts.length, 1, "1 request required for reading object properties");
          assert.ok(channel.validatePost("/debug/nodejs/command/" + MessageChannelMock.SESSION_ID_1, "Runtime.getProperties"),
            "Method getPropertiesForObject must call 'Runtime.getProperties'." + channel.validatePostError);
          assert.ok(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1,
              "threads/0/stackFrames/0/scopes/0/properties/1/properties"),
            "Object must contain 2 properties after getPropertiesForObject has been called");
          assert.equal(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1,
              "threads/0/stackFrames/0/scopes/0/properties/1/properties").length, 2,
            "Object must contain 2 properties after getPropertiesForObject has been called");
          assert.equal(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1,
              "threads/0/stackFrames/0/scopes/0/properties/1/properties/0/name"), "var3",
            "StackFrame scope must contain property 'var3' after getPropertiesForStackFrame has been called");
          assert.equal(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1,
              "threads/0/stackFrames/0/scopes/0/properties/1/properties/1/name"), "var4",
            "StackFrame scope must contain property 'var4' after getPropertiesForStackFrame has been called");
          // assert.ok(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1,
          // 		"threads/0/stackFrames/0/scopes/0/properties/1/accessors"),
          // 	"Object must contain 1 accessor after getPropertiesForObject has been called");
          // assert.equal(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1,
          // 		"threads/0/stackFrames/0/scopes/0/properties/1/accessors").length, 1,
          // 	"Object must contain 1 accessor after getPropertiesForObject has been called");
          // assert.equal(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1,
          // 		"threads/0/stackFrames/0/scopes/0/properties/1/accessors/0/name"), "var5",
          // 	"StackFrame scope must contain property 'var5' after getPropertiesForStackFrame has been called");
        });
      });
    }));

    test("getPropertiesForArray", window.withPromise(function(assert) {
      return _createDebugSession(assert, MessageChannelMock.SESSION_CHANNEL_1, MessageChannelMock.SESSION_ID_1, MessageChannelMock.SESSION_DEFINITION).then(function(debugSesson) {
        var channel = _messageBus.channels[0];
        //prepare stacktrace data with 1 scope containing 1 array
        var property0 = {
          name: "var2",
          value: {
            className: "Array",
            type: "array",
            objectId: "137"
          }
        };
        var stackFrame = {
          id: "frame0",
          getParent: function() {
            return debugSesson.threads[0];
          },
          functionName: "function1",
          location: {
            resourceId: MessageChannelMock.SCRIPT_ID_1,
            lineNumber: 2,
            columnNumber: 1
          },
          scopes: [{
            getParent: function() {
              return stackFrame;
            },
            type: "local",
            object: {
              type: "object",
              objectId: "scope0:0"
            },
            properties: [
              property0
            ]
          }]
        };
        _debugSessionManager.data.debugSessions[0].threads[0].stackFrames.push(stackFrame);
        assert.equal(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1, "threads/0/stackFrames/0/scopes/0/properties").length,
          1, "Debug session must contain 1 stackframe having 1 scope, having 1 property");

        _debugSessionManager.getUriForObject = function(object) {
          if (object === property0) {
            return "/debugSessions/" + MessageChannelMock.SESSION_ID_1 + "/threads/0/stackFrames/frame0/scopes/scope0:0/properties/137";
          }
        };

        _debugSessionManager.setModelPropertyByUri = function(uri, object) {
          if (uri === "/debugSessions/" + MessageChannelMock.SESSION_ID_1 + "/threads/0/stackFrames/frame0/scopes/scope0:0/properties/137/properties") {
            _debugSessionManager.setModelProperty(debugSesson.id, "threads/0/stackFrames/0/scopes/0/properties/0/properties", object);
          }
        };

        //prepare the post response for 'Runtime.getProperties'
        channel.onPostDataPrepareHandler = function(postData) {
          if (postData.payload && postData.payload.method === "Runtime.getProperties") {
            if (postData.payload.params.objectId === "137" && postData.payload.params.ownProperties === true && postData.payload.params.accessorPropertiesOnly ===
              false) {
              postData.message = {
                id: postData.payload.id,
                result: {
                  result: [{
                    name: "9",
                    enumerable: true,
                    value: {
                      type: "number",
                      value: 42
                    }
                  }, {
                    name: "0",
                    enumerable: true,
                    value: {
                      type: "boolean",
                      value: false
                    }
                  }, {
                    name: "10",
                    enumerable: true,
                    value: {
                      type: "string",
                      value: "value"
                    }
                  }, {
                    name: "length",
                    enumerable: false,
                    value: {
                      type: "number",
                      value: 3
                    }
                  }]
                }
              };
            }
          }
        };

        //execute getPropertiesForObject
        return debugSesson.getPropertiesForObject(property0, "/debugSessions/" + MessageChannelMock.SESSION_ID_1 + "/threads/0/stackFrames/frame0/scopes/scope0:0/properties/137").then(function() {
          assert.equal(channel.posts.length, 1, "1 request required for reading object properties");
          assert.ok(channel.validatePost("/debug/nodejs/command/" + MessageChannelMock.SESSION_ID_1, "Runtime.getProperties"),
            "Method getPropertiesForObject must call 'Runtime.getProperties'." + channel.validatePostError);
          assert.ok(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1,
              "threads/0/stackFrames/0/scopes/0/properties/0/properties"),
            "Object must contain 1 property after getPropertiesForObject has been called");
          assert.equal(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1,
              "threads/0/stackFrames/0/scopes/0/properties/0/properties/0/name"), "0",
            "StackFrame scope must contain property '0' after getPropertiesForStackFrame has been called");
          assert.equal(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1,
              "threads/0/stackFrames/0/scopes/0/properties/0/properties/1/name"), "9",
            "StackFrame scope must contain property '9' after getPropertiesForStackFrame has been called");
          assert.equal(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1,
              "threads/0/stackFrames/0/scopes/0/properties/0/properties/2/name"), 10,
            "StackFrame scope must contain property '10' after getPropertiesForStackFrame has been called");
          assert.equal(_debugSessionManager.getModelProperty(MessageChannelMock.SESSION_ID_1,
              "threads/0/stackFrames/0/scopes/0/properties/0/properties/3/name"), undefined,
            "StackFrame scope must contain no more than 2 properties after getPropertiesForStackFrame has been called");
        });
      });
    }));

  });
