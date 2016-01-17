define([ //
    "../../../../../../../resources/sap/watt/nodejs/plugin/debug/service/NodeJsDebugModelResolver",
    "../util/NodeJsDebugSessionMock",
    "../util/LoggerMock"
  ],
  function(NodeJsDebugModelResolver, NodeJsDebugSessionMock, LoggerMock) {

    "use strict";

    // console logger
    var _logger = new LoggerMock();
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

    var _modelResolver;

    module("NodeJsDebugModelResolver", {
      setup: function() {
        _modelResolver = new NodeJsDebugModelResolver(_logger, new sap.ui.model.json.JSONModel({connected: true, debugSessions: []}));
        _modelResolver.getModel().getProperty("/debugSessions").push(_debugSession);
      },

      teardown: function() {
        _logger.log.errorExpected = false;
        _modelResolver = null;
      }
    });

    test("getModelPropertyByUri", function(assert) {
        var debugSession = _modelResolver.getModelPropertyByUri("/debugSessions/session0");
        assert.equal(debugSession.id, "session0", "debug session must be present");
        var debugSessions = _modelResolver.getModelPropertyByUri("/debugSessions");
        assert.ok(debugSessions, "debugSessions array must be present");
        assert.equal(debugSessions.length, 1, "debugSession must be contained in array");

        var thread = _modelResolver.getModelPropertyByUri("/debugSessions/session0/threads/thread0");
        assert.equal(thread.id, "thread0", "thread must be present");
        var threads = _modelResolver.getModelPropertyByUri("/debugSessions/session0/threads");
        assert.ok(threads, "threads array must be present");
        assert.equal(threads.length, 1, "thread must be contained in array");

        var stackFrame = _modelResolver.getModelPropertyByUri("/debugSessions/session0/threads/thread0/stackFrames/frame1");
        assert.equal(stackFrame.id, "frame1", "stack frame must be present");
        var stackFrames = _modelResolver.getModelPropertyByUri("/debugSessions/session0/threads/thread0/stackFrames");
        assert.ok(stackFrames, "stackFrames array must be present");
        assert.equal(stackFrames.length, 2, "stackFrame must be contained in array");
        assert.equal(stackFrames[1].id, "frame1", "stackFrame must be contained in array");

        var scope = _modelResolver.getModelPropertyByUri("/debugSessions/session0/threads/thread0/stackFrames/frame0/scopes/local");
        assert.equal(_modelResolver.getModelIdForScope(scope), "local", "scope must be present");
        scope = _modelResolver.getModelPropertyByUri("/debugSessions/session0/threads/thread0/stackFrames/frame1/scopes/local");
        assert.equal(_modelResolver.getModelIdForScope(scope), "local", "scope must be present");
        var scopes = _modelResolver.getModelPropertyByUri("/debugSessions/session0/threads/thread0/stackFrames/frame0/scopes");
        assert.ok(scopes, "scopes array must be present");
        assert.equal(scopes.length, 2, "scope must be contained in array");
        assert.equal(_modelResolver.getModelIdForScope(scopes[1]), "closure_scope:0:1", "scope must be contained in array");

        var property = _modelResolver.getModelPropertyByUri("/debugSessions/session0/threads/thread0/stackFrames/frame0/scopes/local/properties/var3");
        assert.ok(property, "property must be present");
        assert.equal(_modelResolver.getModelIdForProperty(property), "var3", "property must be present");
        var properties = _modelResolver.getModelPropertyByUri("/debugSessions/session0/threads/thread0/stackFrames/frame0/scopes/local/properties");
        assert.ok(properties, "properties array must be present");
        assert.equal(properties.length, 2, "property must be contained in array");
        assert.equal(_modelResolver.getModelIdForProperty(properties[1]), "var3", "property must be contained in array");

        properties = _modelResolver.getModelPropertyByUri("/debugSessions/session0/threads/thread0/stackFrames/frame0/scopes/local/properties/var3/properties");
        assert.ok(properties, "properties array must be present");
        assert.equal(properties.length, 1, "property must be contained in array");
        assert.equal(properties[0].name, "var11", "property must be contained in array");

        // invalid URIs
        _logger.log.errorExpected = true;

        // invalid debugSession URI
        properties = _modelResolver.getModelPropertyByUri("/debugSessio/session0/threads/thread0/stackFrames/frame0/scopes/local/properties/var3/properties");
        assert.ok(!properties, "properties array must not exist");
        assert.equal(_logger.log.message.indexOf("Invalid URI"), 0, "Invalid URI expected'");

        properties = _modelResolver.getModelPropertyByUri("/debugSessions/notExistingSession/threads/thread0/stackFrames/frame0/scopes/local/properties/var3/properties");
        assert.ok(!properties, "property must not exist");
        assert.equal(_logger.log.message.indexOf("Failed to resolve URI"), 0, "Resolving URI must fail");

        // invalid thread URI
        properties = _modelResolver.getModelPropertyByUri("/debugSessions/session0/threa/thread0/stackFrames/frame0/scopes/local/properties/var3/properties");
        assert.ok(!properties, "properties array must not exist");
        assert.equal(_logger.log.message.indexOf("Invalid URI"), 0, "Invalid URI expected'");

        properties = _modelResolver.getModelPropertyByUri("/debugSessions/session0/threads/notExistingThread/stackFrames/frame0/scopes/local/properties/var3/properties");
        assert.ok(!properties, "property must not exist");
        assert.equal(_logger.log.message.indexOf("Failed to resolve URI"), 0, "Resolving URI must fail");

        // invalid stackFrame URI
        properties = _modelResolver.getModelPropertyByUri("/debugSessions/session0/threads/thread0/stackFra/frame0/scopes/local/properties/var3/properties");
        assert.ok(!properties, "properties array must not exist");
        assert.equal(_logger.log.message.indexOf("Invalid URI"), 0, "Invalid URI expected'");

        properties = _modelResolver.getModelPropertyByUri("/debugSessions/session0/threads/thread0/stackFrames/notExistingFrame/scopes/local/properties/var3/properties");
        assert.ok(!properties, "property must not exist");
        assert.equal(_logger.log.message.indexOf("Failed to resolve URI"), 0, "Resolving URI must fail");

        // invalid scope URi
        properties = _modelResolver.getModelPropertyByUri("/debugSessions/session0/threads/thread0/stackFrames/frame0/sco/local/properties/var3/properties");
        assert.ok(!properties, "properties array must not exist");
        assert.equal(_logger.log.message.indexOf("Invalid URI"), 0, "Invalid URI expected'");

        properties = _modelResolver.getModelPropertyByUri("/debugSessions/session0/threads/thread0/stackFrames/frame0/scopes/notExistingScope/properties/var3/properties");
        assert.ok(!properties, "property must not exist");
        assert.equal(_logger.log.message.indexOf("Failed to resolve URI"), 0, "Resolving URI must fail");

        // invalid property URI
        properties = _modelResolver.getModelPropertyByUri("/debugSessions/session0/threads/thread0/stackFrames/frame0/scopes/local/propert");
        assert.ok(!properties, "properties array must not exist");
        assert.equal(_logger.log.message.indexOf("Invalid URI"), 0, "Invalid URI expected'");

        properties = _modelResolver.getModelPropertyByUri("/debugSessions/session0/threads/thread0/stackFrames/frame0/scopes/local/properties/var");
        assert.ok(!properties, "property must not exist");
        assert.equal(_logger.log.message.indexOf("Failed to resolve URI"), 0, "Resolving URI must fail");
    });

    test("getUriForObject", function(assert) {
        var uri = _modelResolver.getUriForObject(_debugSession);
        assert.equal(uri, "/debugSessions/session0");

        uri = _modelResolver.getUriForObject(_debugSession.threads[0]);
        assert.equal(uri, "/debugSessions/session0/threads/thread0");

        uri = _modelResolver.getUriForObject(_debugSession.threads[0].stackFrames[0]);
        assert.equal(uri, "/debugSessions/session0/threads/thread0/stackFrames/frame0");

        uri = _modelResolver.getUriForObject(_debugSession.threads[0].stackFrames[0].scopes[1]);
        assert.equal(uri, "/debugSessions/session0/threads/thread0/stackFrames/frame0/scopes/closure_scope:0:1");

        _logger.log.errorExpected = true;
        uri = _modelResolver.getUriForObject(_debugSession.threads[0].stackFrames[0].scopes[0].properties[0]);
        assert.ok(!uri, "Retrieving the URI for some property object is currently not supported, must return null and log an error, uri [" + uri + "]");
    });

    test("getModelPathForObject", function(assert) {
        var path = _modelResolver.getModelPathForObject(_debugSession);
        assert.equal(path, "/debugSessions/0");

        path = _modelResolver.getModelPathForObject(_debugSession.threads[0]);
        assert.equal(path, "/debugSessions/0/threads/0");

        path = _modelResolver.getModelPathForObject(_debugSession.threads[0].stackFrames[0]);
        assert.equal(path, "/debugSessions/0/threads/0/stackFrames/0");

        path = _modelResolver.getModelPathForObject(_debugSession.threads[0].stackFrames[0].scopes[1]);
        assert.equal(path, "/debugSessions/0/threads/0/stackFrames/0/scopes/1");

        _logger.log.errorExpected = true;
        path = _modelResolver.getModelPathForObject(_debugSession.threads[0].stackFrames[0].scopes[0].properties[0]);
        assert.ok(!path, "Retrieving the URI for some property object is currently not supported, must return null and log an error, uri [" + path + "]");
    });
  });
