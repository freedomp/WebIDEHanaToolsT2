define([ //
    "../../../../../../../resources/sap/watt/nodejs/plugin/debug/service/NodeJsBreakpointManager",
    "../../../../../../../resources/sap/watt/nodejs/plugin/debug/service/NodeJsDebugSessionManager",
    "../util/MessageChannelMock",
    "../util/NodeJsDebugSessionMock",
    "../util/LoggerMock"
  ],
  function(NodeJsBreakpointManager, NodeJsDebugSessionManager, MessageChannelMock, NodeJsDebugSessionMock, LoggerMock) {

    "use strict";

    var _messageBus;
    var _breakpointManager;

    // console logger
    var _logger = new LoggerMock();

    // MessageBus mock
    function MessageBusMock() {
      this.channels = [];

      this.newChannel = function newChannel(channelName, onMessageCallback) {
        var channel = new MessageChannelMock(channelName, onMessageCallback);
        this.channels.push(channel);
        return Q.resolve(channel);
      };
    }

    function _createDebugSessionManager(assert) {
      var debugSessionManager = new NodeJsDebugSessionManager(_logger, _messageBus, _breakpointManager);
      return debugSessionManager.connect().then(function() {
        assert.equal(_messageBus.channels.length, 1, "There must be at least one message bus channel after debugSessionManager.connect()");
        assert.equal(_messageBus.channels[0].subscribed, true,
          "MessageBus.subscribeToChannel must have been called by debugSessionManager.connect()");
        assert.equal(debugSessionManager.getJsonModel().getProperty("/connected"), true,
          "Debug session manager must be in connected state after connect");
        return Q.resolve(debugSessionManager);
      });
    }

    var _debugSession = new NodeJsDebugSessionMock({
      id: "session0",
      threads: [{
        id: "thread0",
        suspended: true,
        getParent: function getParent() {
          return _debugSession;
        },
        stackFrames: [{
          id: "frame0",
          getParent: function getParent() {
            return _debugSession.threads[0];
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
            getParent: function getParent() {
              return _debugSession.threads[0].stackFrames[0];
            },
            object: {
              type: "object",
              objectId: "scope:0:0"
            },
            properties: [{
              name: "var1",
              value: {
                type: "boolean",
                value: false
              }
            }, {
              name: "var3",
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
            getParent: function getParent() {
              return _debugSession.threads[0].stackFrames[0];
            },
            object: {
              type: "object",
              objectId: "scope:0:1"
            }
          }]
        }, {
          id: "frame1",
          getParent: function getParent() {
            return _debugSession.threads[0];
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
            getParent: function getParent() {
              return _debugSession.threads[0].stackFrames[0];
            },
            object: {
              type: "object",
              objectId: "scope:1:0"
            }
          }]
        }]
      }]
    });

    module("NodeJsDebugSessionManager", {
      setup: function() {
        _messageBus = new MessageBusMock();
        _breakpointManager = new NodeJsBreakpointManager(_logger);
      },

      teardown: function() {
        _messageBus = null;
        _breakpointManager = null;
        _logger.log.errorExpected = false;
      }
    });

    test("connect DebugSessionManager", window.withPromise(function(assert) {
      var debugSessionManager = new NodeJsDebugSessionManager(_logger, _messageBus, _breakpointManager);

      // register connectDisconnect listener
      var events = [];
      var listener = function(event) {
        events.push(event);
      };
      debugSessionManager.addConnectDisconnectListener(listener);

      return debugSessionManager.connect().then(function() {
        assert.equal(_messageBus.channels.length, 1, "There must be at least one message bus channel");
        var channel = _messageBus.channels[0];
        assert.equal(channel.posts.length, 0, "0 post requests required for connect");
        assert.equal(channel.subscribed, true, "MessageBus.subscribeToChannel must have been called by connect");
        assert.equal(debugSessionManager.getJsonModel().getProperty("/connected"), true,
          "Debug session manager must be in connected state after connect");

        assert.equal(1, events.length);
        assert.ok(events[0].id === "connected", "Main ws channel connected event has to be fired");
        assert.ok(events[0].params);
        assert.ok(!events[0].params.debugSession, "Main ws channel connected event has to be fired");
      });
    }));

    test("disconnect DebugSessionManager", window.withPromise(function(assert) {
      return _createDebugSessionManager(assert).then(function(debugSessionManager) {
        //prepare 1 existing debug session
        var debugSession = new NodeJsDebugSessionMock();
        debugSession.connect();
        debugSessionManager.getJsonModel().getProperty("/debugSessions").push(debugSession);
        assert.equal(debugSessionManager.getModelProperty(debugSession.id, "connected"), true,
          "Debug session must be in connected state after connect");

        // register connectDisconnect listener
        var events = [];
        var listener = function(event) {
          events.push(event);
        };
        debugSessionManager.addConnectDisconnectListener(listener);

        return debugSessionManager.disconnect().then(function() {
          var channel = _messageBus.channels[0];
          assert.equal(debugSessionManager.getJsonModel().getProperty("/debugSessions").length, 0,
            "0 debug session must exist after disconnect");
          assert.equal(channel.posts.length, 0, "0 post requests required for disconnect");
          assert.equal(channel.subscribed, false, "MessageBus.unsubscribeFromChannel must have been called by disconnect");
          assert.equal(debugSessionManager.isConnected(), false, "Debug session manager must be in disconnected state after disconnect");

          assert.equal(2, events.length);
          assert.ok(events[0].params);
          assert.ok(events[0].id === "disconnected", "DebugSession disconnected event has to be fired");
          assert.ok(!!events[0].params.debugSession, "DebugSession disconnected event has to be fired");

          assert.ok(events[1].params);
          assert.ok(events[1].id === "disconnected", "Main ws channel disconnected event has to be fired");
          assert.ok(!events[1].params.debugSession, "Main ws channel disconnected event has to be fired");
        });
      });
    }));

    test("connect DebugSession", window.withPromise(function(assert) {
      return _createDebugSessionManager(assert).then(function(debugSessionManager) {
        // register connectDisconnect listener
        var events = [];
        var listener = function(event) {
          events.push(event);
        };
        debugSessionManager.addConnectDisconnectListener(listener);

        var channel = _messageBus.channels[0];

        //prepare the post response for '/debug/nodejs/attach'
        channel.onPostDataPrepareHandler = function(postData) {
          if (postData.endpoint === "/debug/nodejs/attach") {
            postData.message = {
              id: postData.payload.id,
              debugId: "session_1",
              sessionChannel: "channel_1"
            };
          }
        };
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
        return debugSessionManager.connectDebugSession(debugSessionDefinition).then(function(debugSession) {
          assert.ok(debugSession, "A debug session must be returned by connectDebugSession");
          assert.equal(1, events.length);
          assert.ok(events[0].params);
          assert.ok(events[0].id === "connected", "DebugSession connected event has to be fired");
          assert.ok(!!events[0].params.debugSession, "DebugSession connected event has to be fired");
          assert.equal(channel.posts.length, 1, "1 post requests required for connectDebugSession");
          assert.ok(channel.validatePost("/debug/nodejs/attach"), "connectDebugSession must call '/debug/nodejs/attach'" + channel.validatePostError);
          assert.equal(debugSessionManager.getJsonModel().getProperty("/debugSessions").length, 1,
            "1 debug session must have been created after connectDebugSession");
          assert.equal(debugSessionManager.getJsonModel().getProperty("/debugSessions/0/id"), "session_1",
            "The debug session's id must be set");
          assert.equal(debugSessionManager.getJsonModel().getProperty("/debugSessions/0/channel"), "channel_1",
            "The debug session's channel must be set");
        });
      });
    }));

    test("disconnect DebugSession", window.withPromise(function(assert) {
      return _createDebugSessionManager(assert).then(function(debugSessionManager) {
        // register connectDisconnect listener
        var events = [];
        var listener = function(event) {
          events.push(event);
        };
        debugSessionManager.addConnectDisconnectListener(listener);

        //prepare 1 existing debug session
        var debugSession = new NodeJsDebugSessionMock();
        debugSession.connect();
        debugSessionManager.getJsonModel().getProperty("/debugSessions").push(debugSession);
        assert.equal(debugSessionManager.getModelProperty(debugSession.id, "connected"), true,
          "Debug session must be in connected state after connect");

        return debugSessionManager.disconnectDebugSession(debugSession).then(function() {
          assert.equal(1, events.length);
          assert.ok(events[0].params);
          assert.ok(events[0].id === "disconnected", "DebugSession disconnected event has to be fired");
          assert.ok(!!events[0].params.debugSession, "DebugSession disconnected event has to be fired");
          assert.equal(debugSession.connected, false, "Debug session must be in disconnected state after detach");
          assert.equal(debugSessionManager.getJsonModel().getProperty("/debugSessions").length, 0,
            "0 debug session must exist after disconnectDebugSession");
        });
      });
    }));

    test("disconnect DebugSession - server is not responding", window.withPromise(function(assert) {
      return _createDebugSessionManager(assert).then(function(debugSessionManager) {
        // register connectDisconnect listener
        var listenerMock = {
          onConnectDisconnectCalled: false,
          onConnectDisconnect: function(event) {
            this.onConnectDisconnectCalled = (event.id === "disconnected" ? true : false);
          }
        };
        debugSessionManager.addConnectDisconnectListener(listenerMock.onConnectDisconnect, listenerMock);

        //prepare 1 existing debug session
        var debugSession = new NodeJsDebugSessionMock();
        debugSession.connect();

        // mock behavior that the server is not responding after 1sec while detach command has been posted
        debugSessionManager.TIMEOUT = 500;
        debugSession.disconnect = function() {
          var that = this;
          // debug session manager is using timeout of 5sec - after that point in time disconnect is enforced
          return Q.delay(1000).then(function() {
            that.connected = false;
          });
        };

        debugSessionManager.getJsonModel().getProperty("/debugSessions").push(debugSession);
        assert.equal(debugSessionManager.getModelProperty(debugSession.id, "connected"), true,
          "Debug session must be in connected state after connect");

        return debugSessionManager.disconnectDebugSession(debugSession).then(function() {
          assert.equal(listenerMock.onConnectDisconnectCalled, true, "Detach event has to be fired");
          assert.equal(debugSession.connected, true, "Debug session must be in connected state as the server did not respond");
          assert.equal(debugSessionManager.getJsonModel().getProperty("/debugSessions").length, 0,
            "0 debug session must exist after disconnectDebugSession");
        });
      });
    }));

    test("add breakpoint", window.withPromise(function(assert) {
      return _createDebugSessionManager(assert).then(function(debugSessionManager) {
        //prepare 1 existing debug session
        var debugSession = new NodeJsDebugSessionMock();
        debugSession.connect();
        debugSessionManager.getJsonModel().getProperty("/debugSessions").push(debugSession);
        assert.equal(debugSessionManager.getModelProperty(debugSession.id, "connected"), true,
          "Debug session must be in connected state after connect");

        // adding breakpoint will call BreakpointChangeListener registered by NodeJsDebugSessionManager which will in turn propagate the breakpoint to the node.js runtime
        _breakpointManager.addBreakpoint(MessageChannelMock.FILE_PATH_1, 11);
        return Q.delay(100).then(function() {
          assert.equal(debugSessionManager.getModelProperty(debugSession.id, "breakpoints/0/lineNumber"), 11,
            "A node.js runtime breakpoint must have been set after breakpointManager.addBreakpoint");
        });
      });
    }));

    test("add breakpoint - runtime breakpoint at different location", window.withPromise(function(assert) {
      return _createDebugSessionManager(assert).then(function(debugSessionManager) {
        //prepare 1 existing debug session which is setting runtime breakpoint at different location
        var debugSession = new NodeJsDebugSessionMock();
        debugSession.setBreakpoint = function setBreakpoint(filePath, lineNumber) {
          var breakpoint = {
            filePath: filePath,
            lineNumber: lineNumber + 17,
            columnNumber: 0
          };
          this.breakpoints.push(breakpoint);
          return Q.resolve(breakpoint);
        };

        debugSession.connect();
        debugSessionManager.getJsonModel().getProperty("/debugSessions").push(debugSession);
        assert.equal(debugSessionManager.getModelProperty(debugSession.id, "connected"), true,
          "Debug session must be in connected state after connect");

        // adding breakpoint will call BreakpointChangeListener registered by NodeJsDebugSessionManager which will in turn propagate the breakpoint to the node.js runtime
        _breakpointManager.addBreakpoint(MessageChannelMock.FILE_PATH_1, 11);

        return Q.delay(100).then(function() {
          assert.equal(debugSessionManager.getModelProperty(debugSession.id, "breakpoints/0/lineNumber"), 28,
            "A node.js runtime breakpoint must have been set at different location after breakpointManager.addBreakpoint");
          // local breakpoint data managed by breakpoint manager has to be updated as well
          assert.equal(_breakpointManager.getJsonModel().getProperty("/breakpoints/0/lineNumber"), 28,
            "A node.js local breakpoint must have been updated to location returned by node.js runtime");
        });
      });
    }));

    test("remove breakpoint", window.withPromise(function(assert) {
      return _createDebugSessionManager(assert).then(function(debugSessionManager) {
        //prepare 1 existing debug session having 1 breakpoint
        var debugSession = new NodeJsDebugSessionMock();
        debugSession.connect();
        debugSessionManager.getJsonModel().getProperty("/debugSessions").push(debugSession);

        // prepare NodeJsDebugSession and NodeJsBreakpointManager having 1 breakpoint
        var breakpoint = {
          filePath: MessageChannelMock.FILE_PATH_1,
          lineNumber: 11,
          enabled: true
        };
        // runtime specific properties can be ignored for this test
        debugSession.breakpoints.push(breakpoint);
        _breakpointManager.getJsonModel().getProperty("/breakpoints").push(jQuery.extend({}, breakpoint));
        assert.equal(debugSessionManager.getModelProperty(debugSession.id, "breakpoints/0/filePath"), MessageChannelMock.FILE_PATH_1,
          "Debug session must have 1 breakpoint when test starts");

        // removing breakpoint will call BreakpointChangeListener registered by NodeJsDebugSessionManager which will in turn remove the breakpoint on the node.js runtime
        _breakpointManager.removeBreakpoint(MessageChannelMock.FILE_PATH_1, 11);
        return Q.delay(100).then(function() {
          assert.equal(debugSessionManager.getModelProperty(debugSession.id, "breakpoints").length, 0,
            "Debug session must have 0 breakpoints after breakpointManager.removeBreakpoint");
        });
      });
    }));

    test("enable breakpoint", window.withPromise(function(assert) {
      return _createDebugSessionManager(assert).then(function(debugSessionManager) {
        //prepare 1 existing debug session having 1 breakpoint
        var debugSession = new NodeJsDebugSessionMock();
        debugSession.connect();
        debugSessionManager.getJsonModel().getProperty("/debugSessions").push(debugSession);

        // prepare NodeJsDebugSession and NodeJsBreakpointManager having 1 breakpoint
        var breakpoint = {
          filePath: MessageChannelMock.FILE_PATH_1,
          lineNumber: 11,
          enabled: false
        }; // runtime specific properties can be ignored for this test
        debugSession.breakpoints.push(breakpoint);
        // add a clone in order to ensure separation of breakpoints belonging to breakpoint manager and breakpoints belonging to debug session
        _breakpointManager.getJsonModel().getProperty("/breakpoints").push(jQuery.extend({}, breakpoint));
        assert.equal(debugSessionManager.getModelProperty(debugSession.id, "breakpoints/0/enabled"), false,
          "Debug session must have 1 disabled breakpoint when test starts");

        // enabling breakpoint will call BreakpointChangeListener registered by NodeJsDebugSessionManager which will in turn set the breakpoint on the node.js runtime
        _breakpointManager.enableBreakpoint(MessageChannelMock.FILE_PATH_1, 11);
        return Q.delay(100).then(function() {
          assert.equal(debugSessionManager.getModelProperty(debugSession.id, "breakpoints/0/enabled"), true,
            "Debug session breakpoint must be in enabled state after breakpointManager.enableBreakpoint");
        });
      });
    }));

    test("disable breakpoint", window.withPromise(function(assert) {
      return _createDebugSessionManager(assert).then(function(debugSessionManager) {
        //prepare 1 existing debug session having 1 breakpoint
        var debugSession = new NodeJsDebugSessionMock();
        debugSession.connect();
        debugSessionManager.getJsonModel().getProperty("/debugSessions").push(debugSession);
        // prepare NodeJsDebugSession and NodeJsBreakpointManager having 1 breakpoint
        var breakpoint = {
          filePath: MessageChannelMock.FILE_PATH_1,
          lineNumber: 11,
          enabled: true
        }; // runtime specific properties can be ignored for this test
        debugSession.breakpoints.push(breakpoint);
        // add a clone in order to ensure separation of breakpoints belonging to breakpoint manager and breakpoints belonging to debug session
        _breakpointManager.getJsonModel().getProperty("/breakpoints").push(jQuery.extend({}, breakpoint));
        assert.equal(debugSessionManager.getModelProperty(debugSession.id, "breakpoints/0/enabled"), true,
          "Debug session must have 1 enabled breakpoint when test starts");

        // disabling breakpoint will call BreakpointChangeListener registered by NodeJsDebugSessionManager which will in turn remove the breakpoint on the node.js runtime
        _breakpointManager.disableBreakpoint(MessageChannelMock.FILE_PATH_1, 11);
        return Q.delay(100).then(function() {
          assert.equal(debugSessionManager.getModelProperty(debugSession.id, "breakpoints/0/enabled"), false,
            "Debug session breakpoint must be in enabled state after breakpointManager.enableBreakpoint");
        });
      });
    }));

    test("setModelPropertyByUri", window.withPromise(function(assert) {
      return _createDebugSessionManager(assert).then(function(debugSessionManager) {

        var debugSession = new NodeJsDebugSessionMock({
          id: "session1"
        });
        debugSessionManager.setModelPropertyByUri("/debugSessions", [debugSession]);
        assert.ok(debugSessionManager.getJsonModel().getProperty("/debugSessions"), "debug session must have been added to model");
        assert.equal(debugSessionManager.getJsonModel().getProperty("/debugSessions").length, 1);
        assert.equal(debugSessionManager.getJsonModel().getProperty("/debugSessions/0").id, "session1");

        var thread = {
          id: "thread1",
          getParent: function() {
            return debugSession;
          }
        };
        debugSessionManager.setModelPropertyByUri("/debugSessions/session1/threads", [thread]);
        assert.ok(debugSessionManager.getJsonModel().getProperty("/debugSessions/0/threads"), "thread must have been added to model");
        assert.equal(debugSessionManager.getJsonModel().getProperty("/debugSessions/0/threads").length, 1);
        assert.equal(debugSessionManager.getJsonModel().getProperty("/debugSessions/0/threads/0").id, "thread1");

        var stackFrame = {
          id: "frame1",
          getParent: function() {
            return thread;
          }
        };
        debugSessionManager.setModelPropertyByUri("/debugSessions/session1/threads/thread1/stackFrames", [stackFrame]);
        assert.ok(debugSessionManager.getJsonModel().getProperty("/debugSessions/0/threads/0/stackFrames"), "stackFrame must have been added to model");
        assert.equal(debugSessionManager.getJsonModel().getProperty("/debugSessions/0/threads/0/stackFrames").length, 1);
        assert.equal(debugSessionManager.getJsonModel().getProperty("/debugSessions/0/threads/0/stackFrames/0").id, "frame1");

        var scope = {
          getParent: function() {
            return stackFrame;
          },
          object: {
            type: "object",
            objectId: "scope1"
          }
        };
        debugSessionManager.setModelPropertyByUri("/debugSessions/session1/threads/thread1/stackFrames/frame1/scopes", [scope]);
        assert.ok(debugSessionManager.getJsonModel().getProperty("/debugSessions/0/threads/0/stackFrames/0/scopes"), "scope must have been added to model");
        assert.equal(debugSessionManager.getJsonModel().getProperty("/debugSessions/0/threads/0/stackFrames/0/scopes").length, 1);
        var actualScope = debugSessionManager.getJsonModel().getProperty("/debugSessions/0/threads/0/stackFrames/0/scopes/0");
        assert.ok(actualScope);
        assert.equal(debugSessionManager.getModelResolver().getModelIdForScope(actualScope), "closure_scope1");

        // setModelPropertyByUri is not supported for properties on Property objects
        //   debugSessionManager.getJsonModel().getProperty("/debugSessions").push(_debugSession);
        //
        //   var properties = debugSessionManager.getModelPropertyByUri("/debugSessions/session0/threads/thread0/stackFrames/frame0/scopes/scope:0:0/properties");
        //   assert.ok(properties, "properties array must be present");
        //   assert.equal(properties.length, 2, "property must be contained in array");
        //   assert.equal(properties[1].value.objectId, "137", "property must be contained in array");
        //
        //   var newProperties = [{
        //     name: "var11",
        //     value: {
        //       type: "boolean",
        //       value: true
        //     }
        //   }];
        //
        //   debugSessionManager.setModelPropertyByUri("/debugSessions/session1/threads", new NodeJsDebugSessionMock({id: "session1"}));
        //   assert.ok(debugSessionManager.getJsonModel().getProperty("/debugSessions/1"), "debug session must have been added to model");
        //   assert.equal(debugSessionManager.getJsonModel().getProperty("/debugSessions/1").id, "session1");
        //
        //   debugSessionManager.setModelPropertyByUri("/debugSessions/session0/threads/thread0/stackFrames/frame0/scopes/local/properties", newProperties);
        //   assert.ok(properties, "properties must have been changed");
        //   assert.equal(properties.length, 1, "properties must have been changed");
        //   assert.equal(properties[0].name, newProperties[0].name, "properties must have been changed");
      });
    }));
  });
