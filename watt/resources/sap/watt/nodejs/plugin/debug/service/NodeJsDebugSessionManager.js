define(["./MessageQueue",
  "./NodeJsDebugSession",
  "./NodeJsDebugModelResolver"
], function(MessageQueue, NodeJsDebugSession, NodeJsDebugModelResolver) {
  "use strict";

  var NodeJsDebugSessionManager = function NodeJsDebugSessionManager(logger, messageBus, breakpointManager) {
    if (!logger) {
      throw new Error("Parameter [logger] missing");
    }
    if (!messageBus) {
      throw new Error("Parameter [messageBus] missing");
    }
    if (!breakpointManager) {
      throw new Error("Parameter [breakpointManager] missing");
    }

    var that = this;
    var _logger = logger;
    var _messageBus = messageBus;
    var _mainMessageChannel = null;
    var _breakpointManager = breakpointManager;
    var _messageQueue = new MessageQueue();
    var _debugEventListeners = [];

    var _data = {
      connected: false,
      debugSessions: []
    };

    var _model = new sap.ui.model.json.JSONModel(_data);
    // read-only model as the model state is maintained according to the node.js runtime state
    _model.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);

    var _modelResolver = new NodeJsDebugModelResolver(logger, _model);

    this.TIMEOUT = 5000;


    // register listener for breakpoint changes performed by the user
    _breakpointManager.addBreakpointChangedListener(_onEditorBreakpointChange, this);

    function _setDebuggingActiveEnvState(debuggingActive) {
      // there should actually be a function "sap.watt.setEnv()" in Global.js
      window["sap-ide-env"] = window["sap-ide-env"] || {};
      window["sap-ide-env"]["sap.xs.nodejs.debugging.active"] = debuggingActive;
    }

    function _addDebugSession(debugSession) {
      _data.debugSessions.push(debugSession);
      _model.setProperty("/debugSessions", _data.debugSessions);
    }

    function _removeDebugSession(debugSession) {
      if (debugSession) {
        var idx = _modelResolver.indexOfDebugSessionById(debugSession.id);
        if (idx !== -1) {
          _data.debugSessions.splice(idx, 1);
          _model.setProperty("/debugSessions", _data.debugSessions);
        }
      }
    }

    function _setBreakpoint(filePath, lineNumber) {
      var promises = [];
      var i;

      for (i = 0; i < _data.debugSessions.length; i++) {
        promises.push(_data.debugSessions[i].setBreakpoint(filePath, lineNumber));
      }
      return Q.allSettled(promises).then(function(results) {
        // In this version we do not support debugging of different versions of same node.js app in parallel.
        // If we do need to support such a scenario we must not stop at the first match, instead we need to
        // proceed and have to add the debug session information to the BreakpointChangeEvent
        for (i = 0; i < results.length; i++) {
          // the breakpoint is undefined in case the corresponding file is not known to the running session
          if (results[i].state === "fulfilled" && results[i].value) {
            var breakpoint = results[i].value;
            // update breakpoint location if runtime source is not in sync with the workspace version
            if (lineNumber !== breakpoint.lineNumber) {
              _breakpointManager.updateBreakpointLocation(filePath, lineNumber, breakpoint.lineNumber);
            }
            break;
          }
        }
      }).fail(function() {
        // log error
        _logger.logError("Failed to set breakpoint at location [" + filePath + "].[" + lineNumber + "]");
      }).done();
    }

    function _removeBreakpoint(filePath, lineNumber) {
      var promises = [];
      for (var i = 0; i < _data.debugSessions.length; i++) {
        promises.push(_data.debugSessions[i].removeBreakpoint(filePath, lineNumber));
      }
      return Q.allSettled(promises).fail(function() {
        // log error
        _logger.logError("Failed to remove breakpoint at location [" + filePath + "].[" + lineNumber + "]");
      }).done();
    }

    function _enableBreakpoint(filePath, lineNumber) {
      var promises = [];
      for (var i = 0; i < _data.debugSessions.length; i++) {
        promises.push(_data.debugSessions[i].enableBreakpoint(filePath, lineNumber));
      }
      return Q.allSettled(promises).fail(function() {
        // log error
        _logger.logError("Failed to enable breakpoint at location [" + filePath + "].[" + lineNumber + "]");
      }).done();
    }

    function _disableBreakpoint(filePath, lineNumber) {
      var promises = [];
      for (var i = 0; i < _data.debugSessions.length; i++) {
        promises.push(_data.debugSessions[i].disableBreakpoint(filePath, lineNumber));
      }
      return Q.allSettled(promises).fail(function() {
        // log error
        _logger.logError("Failed to disable breakpoint at location [" + filePath + "].[" + lineNumber + "]");
      }).done();
    }

    function _connectDebugSession(debugSessionDefinition) {
      // clone the input data so that we can safely insert new data like the id
      debugSessionDefinition = jQuery.extend({}, debugSessionDefinition);
      var deferred = Q.defer();
      // attach is not a method of the debug protocol, therefore we must not use _invokeMethod
      var request = _messageQueue.pushRequest("/debug/nodejs/attach", deferred);
      debugSessionDefinition.id = request.id;

      request.context.debugSessionDefinition = debugSessionDefinition;

      _mainMessageChannel.post(request.method, debugSessionDefinition, request.id).then(function(response) {
        // promise will be resolved and removed from queue in subscribeToChannel

        if (_logger.isDebug()) {
          _logger.logInfo("NodeJsDebugSessionManager: Received response from post " + response);
        }
      }, function(error) {
        _logger.logError("Failed to connect to debug target '" + debugSessionDefinition.projectPath + "'.\n\nDetails:\n" + error.stack);
        return deferred.reject(error);
      });
      return deferred.promise;
    }

    function _disconnectDebugSession(debugSession) {
      var deferred = Q.defer();
      var timer = null;

      try {
        // allow the debugSession to perform additional cleanup activities, e.g. clearing existing breakpoints on node.js runtime
        debugSession.disconnect().then(function() {
          if (timer) {
            clearTimeout(timer);
            timer = null;
          }
          return deferred.resolve();
        }).fail(function(error) {
          if (timer) {
            clearTimeout(timer);
            timer = null;
          }
          _logger.logError("Failed to disconnect from debug target '" + debugSession.name + "'.\n\nDetails:\n" + error.stack);
          return deferred.reject(error);
        });

        // make sure the disconnect event is fired and the debug session gets removed from the local cache
        timer = setTimeout(function() {
          return deferred.resolve();
        }, that.TIMEOUT);
      } catch (e) {
        return Q.reject(e);
      }
      return deferred.promise;
    }

    /**
     * Called by the breakpoint manager whenever the location or state of a editor breakpoint
     * has been changed.
     */
    function _onEditorBreakpointChange(event) {
      switch (event.id) {
        case "add":
          _setBreakpoint(event.breakpoint.filePath, event.breakpoint.lineNumber);
          break;
        case "remove":
          _removeBreakpoint(event.breakpoint.filePath, event.breakpoint.lineNumber);
          break;
        case "change":
          // currently only one delta is supported
          if (event.delta.key === "enabled") {
            // enablement state has changed
            if (event.delta.value) { // former value
              _disableBreakpoint(event.breakpoint.filePath, event.breakpoint.lineNumber);
            } else {
              _enableBreakpoint(event.breakpoint.filePath, event.breakpoint.lineNumber);
            }
          } else if (event.delta.key === "lineNumber") {
            // we do not adapt the runtime breakpoints in case the location of existing breakpoints changes
            // as only the local state might have changed at this point in time
          }
          break;
        default:
          throw new Error("Invalid breakpoint event payload, event: " + event);
      }
    }

    function _onMessageBusCallback(message, error, errorContext) {
      var request = message !== null ? _messageQueue.getRequest(message.id) : _messageQueue.getRequest(errorContext);
      if (request) {
        // remove from queue
        _messageQueue.removeRequest(request.id);
      }

      // handle errors of failing post requests - occuring while processing the actual operation (e.g. attach) in the backend
      if (error) {
        if (request) {
          _logger.logError("NodeJsDebugSessionManager: Failed to process request [" + request.method + "].[" + request.id + "], details: " + error);
        } else {
          _logger.logError("NodeJsDebugSessionManager: Failed to process request, details: " + error);
        }

        return (request ? request.promise.reject(error) : Q.reject(error));
      }

      // handle response of succeeded post requests
      if (_logger.isDebug()) {
        _logger.logInfo("NodeJsDebugSessionManager: Handle callback message - " + message);
      }

      if (request) {
        if (request.method === "/debug/nodejs/attach") {
          var debugSession = new NodeJsDebugSession(_logger, _messageBus, that, _breakpointManager, message.sessionChannel, message.debugId, request.context.debugSessionDefinition);
          // immediately add debug session to model as connect will update the model data maintained by thís NodeJsDebugSessionManager instance
          _addDebugSession(debugSession);

          return debugSession.connect().then(function() {
            return request.promise.resolve(debugSession);
          }).fail(function(connectError) {
            _removeDebugSession(debugSession);
            return request.promise.reject(connectError);
          });
        }
      }
    }

    function _removeListener(listener, eventId) {
      if (typeof listener !== "function") {
        throw new Error("The given listener parameter is not a function");
      }
      for (var i = 0; i < _debugEventListeners.length; i++) {
        if (_debugEventListeners[i].listener === listener) {
          if (_debugEventListeners[i].id === eventId) {
            _debugEventListeners.splice(i, 1);
            break;
          }
          throw new Error("The passed listener has eventId [" + _debugEventListeners[i].id + "], expected eventId is [" + eventId + "]");
        }
      }
    }

    /**
     * Initializes this session manager and connects to the websocket by subscribing to the channel 'debug:nodejs:events:'.
     * A new websocket connection is created if not already open.
     */
    this.connect = function connect() {
      if (this.isConnected()) {
        return Q.resolve();
      }

      // open web socket for node.js debugger
      return _messageBus.newChannel("debug:nodejs:events:", _onMessageBusCallback).then(function(channel) {
        _mainMessageChannel = channel;
        return channel.subscribe().then(function() {
          _model.setProperty("/connected", true);
          // notify clients that the main entity has switched to connected state
          that.fireEvent("connected", {});
          return Q.resolve();
        }).fail(function(error) {
          return Q.reject(error);
        });
      });
    };

    /**
     * Disconnects this session manager from the websocket by unsubscribing from the
     * channel 'debug:nodejs:events:', the websocket is kept open.
     */
    this.disconnect = function disconnect() {
      var promises = [];
      var debugSessions = _data.debugSessions.slice(0);
      // detach each session before disconnecting web socket connection
      for (var i = 0; i < debugSessions.length; i++) {
        promises.push(this.disconnectDebugSession(_data.debugSessions[i]));
      }

      // ensure that the local state gets cleared in case the backend is not responding
      var messageChannel = _mainMessageChannel;
      _mainMessageChannel = null;

      // unsubscribe from channel regardless whether individual debugSession.disconnect is failing
      return Q.allSettled(promises).fin(function() {
        _model.setProperty("/connected", false);
        // notify clients that the main entity has disconnected
        that.fireEvent("disconnected", {});

        if (messageChannel) {
          messageChannel.unsubscribe();
        }
      });
    };

    /**
     * Connects to the running debugee defined by the given debugSessionDefinition. Registered listeners are notified
     * after the connection has been established by sending a 'connected' event.
     * If the operation fails an error is returned containing a readable description of the actual cause of the error.
     */
    this.connectDebugSession = function connectDebugSession(debugSessionDefinition) {
      return _connectDebugSession(debugSessionDefinition).then(function(debugSession) {
        that.fireEvent("connected", {
          debugSession: debugSession
        });
        // set our state globally, see command registration in plugin.json
        _setDebuggingActiveEnvState(true);
        return Q.resolve(debugSession);
      });
    };

    /**
     * Disconnects the given debug session from the debugee. Registered listeners are notified after the debug session has
     * been disconnected by sending a 'disconnected' event.
     * <p>
     * Required cleanup has been performed, e.g. removing existing breakpoints, resuming the debugee if in suspended state.
     * Corresponding events are dispatched before the disconnected event.
     */
    this.disconnectDebugSession = function disconnectDebugSession(debugSession) {
      if (!debugSession) {
        return Q.resolve();
      }
      return _disconnectDebugSession(debugSession).fin(function() {
        // always remove debug session and fire disconnect event as server might not respond
        _removeDebugSession(debugSession);
        that.fireEvent("disconnected", {
          debugSession: debugSession
        });
        // set to false if no more sessions, see command registration in plugin.json
        _setDebuggingActiveEnvState(_data.debugSessions.length > 0);
      });
    };

    this.fireEvent = function fireEvent(eventId, params) {
      var event = {
        id: eventId,
        params: params
      };
      // ensure we do not run into some concurrent modification errors
      var listeners = _debugEventListeners.slice(0);
      listeners.forEach(function(listener) {
        try {
          if (listener.id === eventId) {
            listener.listener.call(listener.context, event);
          } else if ((eventId === "suspended" || eventId === "resumed") && listener.id === "suspendedResumed") {
            listener.listener.call(listener.context, event);
          } else if ((eventId === "connected" || eventId === "disconnected") && listener.id === "connectedDisconnected") {
            listener.listener.call(listener.context, event);
          }
        } catch (e) {
          // be robust and ignore any event handler errors
          _logger.logError("Event handler for eventId [" + event.id + "] has thrown exception [" + (e instanceof Error ? e.message : e) + "]");
        }
      });
    };

    /**
     * Distinguishes whether a connection to the websocket channel 'debug:nodejs:events:'
     * has been opened or not. This does not necessarily mean that the connection is still open and healthy.
     */
    this.isConnected = function isConnected() {
      return _data.connected;
    };

    this.getJsonModel = function getJsonModel() {
      return _model;
    };

    /**
     * Sets a new value in the model for property 'path' on the given debug session. If the model value changed all interested parties are informed.
     *
     * @returns {boolean} true if the value was set correctly and false if errors occurred like the entry was not found
     */
    this.setModelProperty = function setModelProperty(sessionId, path, value) {
      var idx = _modelResolver.indexOfDebugSessionById(sessionId);
      if (idx !== -1) {
        return _model.setProperty("/debugSessions/" + idx + "/" + path, value);
      }
    };

    /**
     * Returns the value as stored in the underlying model for property 'path' of the given the debug session.
     *
     * @returns {object} the property value or undefined if the property was not found
     */
    this.getModelProperty = function getModelProperty(sessionId, path) {
      var idx = _modelResolver.indexOfDebugSessionById(sessionId);
      if (idx !== -1) {
        return _model.getProperty("/debugSessions/" + idx + "/" + path);
      }
    };

    this.setModelPropertyByUri = function setModelPropertyByUri(uri, value) {
      var path = _modelResolver.convertUriToModelPath(uri);
      if (path) {
        _model.setProperty(path, value);
      } else {
        throw new Error("The referenced property [" + uri + "] does not exist in the model.");
      }
    };

    this.addSuspendResumeListener = function addSuspendResumeListener(listener, context) {
      if (typeof listener !== "function") {
        throw new Error("The given listener parameter is not a function");
      }
      _debugEventListeners.push({
        id: "suspendedResumed",
        context: context,
        listener: listener
      });
    };

    this.removeSuspendResumeListener = function removeSuspendResumeListener(listener) {
      _removeListener(listener, "suspendedResumed");
    };

    this.addResourceLoadedListener = function addResourceLoadedListener(listener, context) {
      if (typeof listener !== "function") {
        throw new Error("The given listener parameter is not a function");
      }
      _debugEventListeners.push({
        id: "resourceLoaded",
        context: context,
        listener: listener
      });
    };

    this.removeResourceLoadedListener = function removeResourceLoadedListener(listener) {
      _removeListener(listener, "resourceLoaded");
    };

    this.addConnectDisconnectListener = function addConnectDisconnectListener(listener, context) {
      if (typeof listener !== "function") {
        throw new Error("The given listener parameter is not a function");
      }
      _debugEventListeners.push({
        id: "connectedDisconnected",
        context: context,
        listener: listener
      });
    };

    this.removeConnectDisconnectListener = function removeConnectDisconnectListener(listener) {
      _removeListener(listener, "connectedDisconnected");
    };

    this.getModelResolver = function getModelResolver() {
      return _modelResolver;
    };
  };

  return NodeJsDebugSessionManager;
});
