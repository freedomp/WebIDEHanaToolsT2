define(["./MessageQueue", "./NodeJsDebugResourceResolver", "../document/NodeJsDebugSourceDocumentProvider"], function(MessageQueue, NodeJsDebugResourceResolver, NodeJsDebugSourceDocumentProvider) {
  "use strict";

  /**
   * Constructor.
   *
   * @param {Object} the logger used to write system log messages that are displayed in the console log.
   * @param {MessageBus} client side representation of a devX websocket endpoint.
   */
  var NodeJsDebugSession = function NodeJsDebugSession(logger, messageBus, debugSessionManager, breakpointManager, sessionChannel, sessionId, debugSessionDefinition) {
    if (!logger) {
      throw new Error("Parameter [logger] missing");
    }
    if (!messageBus) {
      throw new Error("Parameter [messageBus] missing");
    }
    if (!debugSessionManager) {
      throw new Error("Parameter [debugSessionManager] missing");
    }
    if (!breakpointManager) {
      throw new Error("Parameter [breakpointManager] missing");
    }
    if (!sessionChannel) {
      throw new Error("Parameter [sessionChannel] missing");
    }
    if (!sessionId) {
      throw new Error("Parameter [sessionId] missing");
    }
    if (!debugSessionDefinition) {
      throw new Error("Parameter [debugSessionDefinition] missing");
    }

    var that = this;
    var _logger = logger;
    var _messageBus = messageBus;
    var _messageChannel = null;
    var _debugSessionManager = debugSessionManager;
    var _breakpointManager = breakpointManager;
    var _messageQueue = new MessageQueue();
    var _resourceResolver = new NodeJsDebugResourceResolver(debugSessionDefinition.projectPath);
    var _sourceDocumentProvider = new NodeJsDebugSourceDocumentProvider(this);

    function _getReadableName() {
      if (debugSessionDefinition.projectPath) {
        return debugSessionDefinition.projectPath;
      } else if (debugSessionDefinition.debugURL) {
        var url = new URI(debugSessionDefinition.debugURL);
        return url.hostname() + ":" + url.port();
      } else {
        return sessionId;
      }
    }

    function _invokeMethod(method, endpoint, payload) {
      var deferred = Q.defer();
      var request = _messageQueue.pushRequest(method, deferred);

      payload.id = request.id;
      payload.method = method;
      _messageChannel.post(endpoint, payload, request.id).then(function(response) {
        // promise will be resolved and removed from queue in subscribeToChannel

        if (_logger.isDebug()) {
          _logger.logInfo("Received response from post " + response);
        }
      }, function(error) {
        return deferred.reject(error);
      });
      return deferred.promise;
    }

    function _ensureConnected() {
      if (!that.isConnected()) {
        return Q.reject("Debugger has not been connected");
      }
    }

    /**
     * Sort properties by type and name, potentially filtering the properties
     *
     * Four categories are differentiated:
     * 1. array entries: sorted along index, with length and __proto__ removed on the array
     * 2. type undefined, string, number, boolean, object, or symbol: sorted along name
     * 3. type function: sorted along name
     * 4. __proto__: is last
     *
     * @param {Object[]} the properties to sort, might be <code>null</code>;
     * @param {Object} the parent variable, or <code>null</code> in case of a scope as parent;
     */
    function _sortProperties(properties, parent) {
      if (!properties || properties.constructor !== Array) {
        throw new Error("Parameter properties must be of type Array");
      }
      if (parent && parent.value && parent.value.className === "Array") {
        // remove "length" and "__proto__" from arrays
        properties = properties.filter(function(val) {
          return val.enumerable;
        });
      }
      return properties.sort(function(a, b) {
        if (a.name === "__proto__") {
          return 1;
        } else if (b.name === "__proto__") {
          return -1;
        }
        if (parent && parent.value && parent.value.className === "Array") {
          var aIdx = parseInt(a.name);
          var bIdx = parseInt(b.name);
          return aIdx - bIdx;
        }
        if (a.value && b.value) {
          if (["undefined", "string", "number", "boolean", "object", "symbol"].indexOf(a.value.type) >= 0 && ["undefined", "string",
              "number", "boolean", "object", "symbol"
            ].indexOf(b.value.type) >= 0) {
            return a.name.localeCompare(b.name);
          } else if (a.value.type === "function") {
            if (b.value.type === "function") {
              return a.name.localeCompare(b.name);
            }
            return 1;
          } else if (b.value.type === "function") {
            return -1;
          }
        }
        return a.name.localeCompare(b.name);
      });
    }

    function _invokeSetBreakpointByUrl(resource, lineNumber) {
      var payload = {
        params: {
          lineNumber: lineNumber,
          url: resource.url
        }
      };
      return _invokeMethod("Debugger.setBreakpointByUrl", "/debug/nodejs/command/" + that.id, payload).then(function(message) {
        return Q.resolve(message.result);
      }).fail(function(error) {
        return Q.reject(error);
      });
    }

    function _invokeGetSourceCodeForScriptId(id) {
      var payload = {
        params: {
          scriptId: id
        }
      };
      return _invokeMethod("Debugger.getScriptSource", "/debug/nodejs/command/" + that.id, payload).then(function(message) {
        return Q.resolve(message.result);
      }).fail(function(error) {
        return Q.reject(error);
      });
    }

    function _invokeRemoveBreakpoint(id) {
      var payload = {
        params: {
          breakpointId: id
        }
      };
      return _invokeMethod("Debugger.removeBreakpoint", "/debug/nodejs/command/" + that.id, payload);
    }

    function _indexOfResourceById(id) {
      if (id) {
        for (var i = 0; i < that.resources.length; i++) {
          if (that.resources[i] && that.resources[i].id === id) {
            return i;
          }
        }
      }
      return -1;
    }

    function _idOfResourceByUrl(url) {
      for (var i = 0; i < that.resources.length; i++) {
        if (that.resources[i] && that.resources[i].url === url) {
          return that.resources[i].id;
        }
      }
      return -1;
    }

    function _getResourceById(id) {
      var idx = _indexOfResourceById(id);
      if (idx !== -1) {
        return that.resources[idx];
      }
    }

    function _indexOfBreakpointByLocation(filePath, lineNumber) {
      if (filePath && lineNumber >= 0) {
        for (var i = 0; i < that.breakpoints.length; i++) {
          if (that.breakpoints[i] && that.breakpoints[i].filePath === filePath && that.breakpoints[i].lineNumber === lineNumber) {
            return i;
          }
        }
      }
      return -1;
    }

    function _internalSetBreakpoint(breakpoint, resource, updateLocation) {
      if (resource) {
        // propagate the breakpoint to the node.js runtime if the resource has been loaded
        var deferred = Q.defer();
        _invokeSetBreakpointByUrl(resource, breakpoint.lineNumber).then(function(runtimeBreakpoint) {
          // update local state with runtime state
          // TODO in which scenario do we get multiple locations for the same breakpoint id?
          // as we do not know - update only if we have one dedicated location
          if (!runtimeBreakpoint || !runtimeBreakpoint.locations) {
            return deferred.reject("Node.js runtime did not return breakpoint information for breakpoint [" + breakpoint.filePath + "].[" +
              breakpoint.lineNumber + "]");
          }
          if (runtimeBreakpoint.locations.length === 1) {
            var location = runtimeBreakpoint.locations[0];

            // make sure we have the correct resource
            breakpoint.resourceId = location.scriptId;

            if (breakpoint.lineNumber !== location.lineNumber) {
              var idx = _indexOfBreakpointByLocation(breakpoint.filePath, location.lineNumber);
              if (idx !== -1) {
                // if there already is a runtime breakpoint at the given location we delete the old one
                if (that.breakpoints[idx].id) {
                  _invokeRemoveBreakpoint(that.breakpoints[idx].id).fail(function(error) {
                    _logger.logError("_internalSetBreakpoint: Failed to delete duplicate breakpoint at location [" + breakpoint.filePath + "].[" +
                      location.lineNumber + "], details:\n" + error.stack);
                  }).done();
                }
                // delete the breakpoint from the list
                that.breakpoints.splice(idx, 1);
              }
              if (updateLocation === true) {
                // update breakpoint location according to runtime location
                breakpoint.lineNumber = location.lineNumber;
              }
            }
          } else {
            // log error and proceed
            _logger.logError("Node.js runtime returned multiple locations for breakpoint [" + breakpoint.filePath + "].[" + breakpoint.lineNumber +
              "]: runtime location [" +
              runtimeBreakpoint + "]");
          }
          breakpoint.id = runtimeBreakpoint.breakpointId;

          // update model - newly added breakpoints needed to be added to the model
          // doing it at this point in time ensures that no dublicate breakpoint entries are created
          // in case the local breakpoint's line number does not match the runtime breakpoint's line number
          idx = _indexOfBreakpointByLocation(breakpoint.filePath, breakpoint.lineNumber);
          if (idx === -1) {
            // newly added breakpoints have to be added and enabled
            that.enabled = true;
            that.breakpoints.push(breakpoint);
            _debugSessionManager.setModelProperty(that.id, "breakpoints", that.breakpoints);
          } else {
            // breakpoints that have been disabled are already contained
            _debugSessionManager.setModelProperty(that.id, "breakpoints/" + idx + "/enabled", true);
          }
          return deferred.resolve(breakpoint);
        }).fail(function(error) {
          return deferred.reject("_internalSetBreakpoint: Failed to set breakpoint [" + breakpoint.filePath + "].[" + breakpoint.lineNumber +
            "], details: " + error);
        });
        return deferred.promise;
      }
      return Q.resolve(breakpoint);
    }

    function _internalRemoveBreakpoint(breakpoint) {
      if (breakpoint.id) {
        return _invokeRemoveBreakpoint(breakpoint.id).then(function() {
          return Q.resolve(breakpoint);
        }).fail(function(error) {
          return Q.reject("_internalRemoveBreakpoint: Failed to remove breakpoint at location [" + breakpoint.filePath + "].[" +
            breakpoint.lineNumber +
            "], details: " + error);
        });
      } else {
        // log info and proceed
        _logger.logInfo("_internalRemoveBreakpoint: The breakpoint at location [" + breakpoint.filePath + "],[" + breakpoint.lineNumber +
          "] resource has not been loaded by the node.js runtime");
      }
      return Q.resolve(breakpoint);
    }

    /**
     * Resolves breakpoints that have been locally set for the given resource. Each breakpoint is set at the node.js runtime,
     * cached breakpoint data is updated, e.g. resource id, breakpoint id, line number.
     * <p>
     * This is a remote operation.
     */
    function _resolveBreakpointsForResource(resource) {
      // as the resource has just been parsed any existing breakpoints do not have a valid resourceId

      var promises = [];

      // set remote root if not yet done
      if (!_resourceResolver.getRemoteRoot()) {
        _resourceResolver.updateRemoteRoot(resource.url);
      }

      var allBreakpoints = _breakpointManager.getAllBreakpoints();

      for (var i = 0; i < allBreakpoints.length; i++) {
        var remoteUrl = _resourceResolver.getUrlMapping(allBreakpoints[i].filePath);
        if (remoteUrl && remoteUrl === resource.url) {
          promises.push(_internalSetBreakpoint(allBreakpoints[i], resource, false));
        }
      }

      // temporary fallback for xsjs
      if (promises.length == 0) {
        var bestMatches = _resourceResolver.findBestMatchesXsJs(resource.url, allBreakpoints);
        for (var i = 0; i < bestMatches.length; i++) {
          // push the Promises to our array
          promises.push(_internalSetBreakpoint(bestMatches[i], resource, false));
        }
      }

      // temporary fallback if project and remote root are not set
      if (promises.length == 0) {
        var bestMatchesFallback = _resourceResolver.findBestMatchesFallback(resource.url, allBreakpoints);
        for (var i = 0; i < bestMatchesFallback.length; i++) {

          // push the Promises to our array
          promises.push(_internalSetBreakpoint(bestMatchesFallback[i], resource, false));
        }
      }

      // asynchronously resolve all breakpoints
      Q.all(promises).then(function() {}).fail(function(error) {
        _logger.logError("Failed to resolve breakpoints for resource " + resource.url + ", details:\n" + error.stack);
      });
    }

    function _initStackFrame(parent, stackFrame) {
      stackFrame.id = stackFrame.callFrameId;
      stackFrame.getParent = function getParent() {
        return parent;
      };
      delete stackFrame.callFrameId;
      stackFrame.scopes = stackFrame.scopeChain || [];
      // add id and getParent members
      for (var j = 0; j < stackFrame.scopes.length; j++) {
        stackFrame.scopes[j].getParent = function getParent() {
          return stackFrame;
        };
      }
      delete stackFrame.scopeChain;
      if (stackFrame.location) {
        var location = stackFrame.location;
        location.resourceId = location.scriptId;
        delete location.scriptId;
        var resource = _getResourceById(location.resourceId);
        if (resource) {
          stackFrame.location.resource = resource;
        }
      }
    }

    function _onDebuggerPaused(message) {
      var thread = that.threads[0];
      thread.stackFrames = [];
      thread.reason = message.params.reason;
      thread.data = message.params.data;
      thread.hitBreakpoints = message.params.hitBreakpoints;
      thread.asyncStackTrace = message.params.asyncStackTrace;

      for (var i = 0; i < message.params.callFrames.length; i++) {
        var stackFrame = message.params.callFrames[i];
        _initStackFrame(thread, stackFrame);
        thread.stackFrames.push(stackFrame);
      }
      _debugSessionManager.setModelProperty(that.id, "suspended", true);
      _debugSessionManager.setModelProperty(that.id, "threads/0/suspended", true);
      _debugSessionManager.setModelProperty(that.id, "threads/0/stackFrames", that.threads[0].stackFrames);
      _debugSessionManager.fireEvent("suspended", {
        debugSession: that
      });
    }

    function _onDebuggerResumed() {
      var thread = that.threads[0];
      thread.stackFrames = [];
      thread.reason = null;
      thread.data = null;
      thread.hitBreakpoints = null;
      thread.asyncStackTrace = null;

      _debugSessionManager.setModelProperty(that.id, "suspended", false);
      _debugSessionManager.setModelProperty(that.id, "threads/0/suspended", false);
      _debugSessionManager.setModelProperty(that.id, "threads/0/stackFrames", that.threads[0].stackFrames);
      _debugSessionManager.fireEvent("resumed", {
        debugSession: that
      });
    }

    function _onDebuggerScriptParsed(message) {

      // skip resources that do not have url
      if (!message.params || !message.params.url || message.params.url.length === 0) {
        return;
      }
      var resource = message.params;
      resource.id = message.params.scriptId;
      delete resource.scriptId; //scriptId has been replaced by id property
      that.resources.push(resource);

      _resolveBreakpointsForResource(resource);

      _debugSessionManager.setModelProperty(that.id, "resources", that.resources);
      _debugSessionManager.fireEvent("resourceLoaded", {
        resource: resource
      });
    }

    function _onBreakpointResolved(message) {
      var i = 0;
      i++;
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
          _logger.logError("NodeJsDebugSession channel [" + that.channel + "]: Failed to process request [" + request.method + "], details:\n" +
            error.stack);
        } else {
          _logger.logError("NodeJsDebugSession channel [" + that.channel + "]: Failed to process request, details:\n" + error.stack);
        }

        return (request ? request.promise.reject(error) : Q.reject(error));
      }
      if (_logger.isDebug()) {
        // handle response of successfull post requests
        _logger.logInfo("NodeJsDebugSession channel [" + that.channel + "]: Process request [" + (request ? request.message : "null") +
          "], response [" + (message ? message.method : "null") + "]");
      }

      if (request) {
        return request.promise.resolve(message);
      } else {
        if (message && message.method) {
          // check for performance reasons
          if (_logger.isDebug()) {
            _logger.logInfo("NodeJsDebugSessionManager: Handle event: '" + message.method + "', message: '" + message + "'");
          }

          //handle events
          switch (message.method) {
            case "Debugger.scriptParsed":
              _onDebuggerScriptParsed(message);
              break;
            case "Debugger.paused":
              _onDebuggerPaused(message);
              break;
            case "Debugger.resumed":
              _onDebuggerResumed();
              break;
            case "Debugger.breakpointResolved":
              _onBreakpointResolved(message);
            default:
          }
        }
      }
    }

    //////////////////////////////////////////////////////////////////////////////////////////////
    // Public facade
    // Public methods delegate to private methods in order to allow for reuse from private methods,
    // otherwise the this context gets lost.
    //////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * Opens a channel on the underlying websocket communication (passed to the constructor)
     * and enables the node.js debugger interface.
     * Note: This method must not be called by external clients.
     */
    this.connect = function connect() {
      return _messageBus.newChannel(this.channel, _onMessageBusCallback).then(function(channel) {
        _messageChannel = channel;
        return channel.subscribe().then(function() {
          return Q.all([
            _invokeMethod("Page.enable", "/debug/nodejs/command/" + that.id, {}),
            _invokeMethod("Debugger.enable", "/debug/nodejs/command/" + that.id, {}),
            _invokeMethod("Runtime.enable", "/debug/nodejs/command/" + that.id, {})
          ]).then(function() {
            // update connected status before the resource tree gets loaded as this may require to resolve breakpoints
            // and this in turn requires the debugger to be in state connected
            _debugSessionManager.setModelProperty(that.id, "connected", true);

            return _invokeMethod("Page.getResourceTree", "/debug/nodejs/command/" + that.id, {});
          });
        });
      });
    };

    /**
     * Detaches this debug session from the debugee and performs required cleanup, e.g. removing existing breakpoints,
     * resuming the debugee if in suspended state.
     * This method may be called on an already disconnected session.
     * Note: Clients must not call this method directly, instead they have to use NodeJsDebugSessionManager.disconnectDebugSession()
     * in order to ensure that required cleanup is performed.
     */
    this.disconnect = function disconnect() {
      if (!_messageChannel) {
        return new Q();
      }
      var promises = [];

      // resume application if suspended
      if (this.suspended) {
        promises.push(this.resume());
      }

      // remove all breakpoints that have been set for this session
      for (var i = 0; i < this.breakpoints.length; i++) {
        // remove breakpoint if enabled
        if (this.breakpoints[i].enabled === true) {
          promises.push(_internalRemoveBreakpoint(this.breakpoints[i]));
        }
      }

      // detach and unsubscribe from channel
      return Q.all(promises).then(function() {
        // detach is not a method of the debug protocol, therefore we must not use _invokeMethod
        var request = _messageQueue.pushRequest("/debug/nodejs/detach", Q.defer());
        var detachData = {
          id: request.id
        };
        return Q.all([
          _messageChannel.post("/debug/nodejs/detach/" + that.id, detachData, request.id),
          _messageChannel.unsubscribe()
        ]);
      }).fail(function(error) {
        // log and return ok
        _logger.logError("Failed to detach debug session [" + that.id + "], details:\n" + error.stack);
        return new Q();
      });
    };

    /**
     * Continues java script execution.
     */
    this.resume = function resume() {
      _ensureConnected();

      return _invokeMethod("Debugger.resume", "/debug/nodejs/command/" + this.id, {});
    };

    /**
     * Pauses java script execution.
     */
    this.suspend = function suspend() {
      _ensureConnected();

      return _invokeMethod("Debugger.pause", "/debug/nodejs/command/" + this.id, {});
    };

    this.stepOver = function stepOver() {
      _ensureConnected();

      return _invokeMethod("Debugger.stepOver", "/debug/nodejs/command/" + this.id, {});
    };

    this.stepInto = function stepInto() {
      _ensureConnected();

      return _invokeMethod("Debugger.stepInto", "/debug/nodejs/command/" + this.id, {});
    };

    this.stepOut = function stepOut() {
      _ensureConnected();

      return _invokeMethod("Debugger.stepOut", "/debug/nodejs/command/" + this.id, {});
    };

    /**
     * Sets the breakpoint at the given location.
     * <p>
     * Resolves the breakpoint if it already exists.
     * @param {string} filePath the workspace file path the breakpoints belong to.
     * @param {integer} lineNumber the line number of the breakpoint within the file, 0-based.
     */
    this.setBreakpoint = function setBreakpoint(filePath, lineNumber) {
      _ensureConnected();

      var resource = this.getResourceByFilePath(filePath);

      if (resource) {
        var breakpoint;
        var idx = _indexOfBreakpointByLocation(filePath, lineNumber);

        if (idx === -1) {
          breakpoint = {
            enabled: true,
            filePath: filePath,
            lineNumber: lineNumber
          };
        } else {
          // breakpooint must not exist, but be robust
          breakpoint = this.breakpoints[idx];
          if (breakpoint.enabled === true) {
            _logger.logInfo("setBreakpoint: Breakpoint at location [" + filePath + "].[" + lineNumber + "] already exists - skip.");
            return Q.resolve(breakpoint);
          } else {
            _logger.logInfo("setBreakpoint: Breakpoint at location [" + filePath + "].[" + lineNumber + "] already exists but disabled - reaply.");
          }
        }
        return _internalSetBreakpoint(breakpoint, resource, true);
      }
      return new Q();
    };

    /**
     * Removes the breakpoint at the given location.
     * <p>
     * Ignore if the breakpoint does not exist.
     * @param {string} filePath the workspace file path the breakpoints belong to.
     * @param {integer} lineNumber the line number of the breakpoint within the file, 0-based.
     */
    this.removeBreakpoint = function removeBreakpoint(filePath, lineNumber) {
      _ensureConnected();

      var idx = _indexOfBreakpointByLocation(filePath, lineNumber);
      var breakpoint;

      if (idx !== -1) {
        breakpoint = this.breakpoints[idx];
        // remove breakpoint in either case
        this.breakpoints.splice(idx, 1);
        _debugSessionManager.setModelProperty(this.id, "breakpoints", this.breakpoints);
        return _internalRemoveBreakpoint(breakpoint);
      } else {
        // breakpooint must not exist - be robust and ignore
        _logger.logInfo("removeBreakpoint: Breakpoint at location [" + filePath + "].[" + lineNumber + "] does not exist - ignore.");
      }
      return Q.resolve(breakpoint);
    };

    /**
     * Enables the breakpoint at the given location.
     * <p>
     * The breakpoint will be added if it does not exist.
     * @param {string} filePath the workspace file path the breakpoints belong to.
     * @param {integer} lineNumber the line number of the breakpoint within the file, 0-based.
     */
    this.enableBreakpoint = function enableBreakpoint(filePath, lineNumber) {
      _ensureConnected();

      var resource = this.getResourceByFilePath(filePath);

      if (resource) {
        var idx = _indexOfBreakpointByLocation(filePath, lineNumber);
        if (idx !== -1) {
          if (!this.breakpoints[idx].enabled) {
            return _internalSetBreakpoint(this.breakpoints[idx], resource, false);
          } else {
            _logger.logInfo("enableBreakpoint: Breakpoint at location [" + filePath + "].[" + lineNumber + "] already enabled, skip.");
          }
          return Q.resolve(this.breakpoints[idx]);
        } else {
          // breakpoint does not exist - be robust and add missing breakpoint
          _logger.logInfo("enableBreakpoint: " + "Breakpoint at location [" + filePath + "].[" + lineNumber + "] does not exist - add it.");
          return this.setBreakpoint(filePath, lineNumber);
        }
      }
      return new Q();
    };

    /**
     * Disables the breakpoint at the given location.
     * <p>
     * Ignore if the breakpoint does not exist.
     * @param {string} filePath the workspace file path the breakpoints belong to.
     * @param {integer} lineNumber the line number of the breakpoint within the file, 0-based.
     */
    this.disableBreakpoint = function disableBreakpoint(filePath, lineNumber) {
      _ensureConnected();

      var resource = this.getResourceByFilePath(filePath);

      if (resource) {
        var idx = _indexOfBreakpointByLocation(filePath, lineNumber);
        var breakpoint;

        if (idx !== -1) {
          breakpoint = this.breakpoints[idx];
          if (breakpoint.enabled) {
            // change state to disabled in either case
            _debugSessionManager.setModelProperty(this.id, "breakpoints/" + idx + "/enabled", false);
            return _internalRemoveBreakpoint(breakpoint);
          } else {
            _logger.logInfo("disableBreakpoint: Breakpoint at location [" + filePath + "].[" + lineNumber + "] already disabled - ignore.");
          }
        } else {
          _logger.logInfo("disableBreakpoint: Breakpoint at location [" + filePath + "].[" + lineNumber + "] does not exist - add local.");
          breakpoint = {
            enabled: false,
            filePath: filePath,
            lineNumber: lineNumber,
            resourceId: resource.id
          };
          this.breakpoints.push(breakpoint);
          _debugSessionManager.setModelProperty(this.id, "breakpoints", this.breakpoints);
        }
        return Q.resolve(breakpoint);
      }
      return new Q();
    };

    /**
     * Removes all breakpoints defined for the given file.
     *
     * @param {string} filePath the workspace file path the breakpoints belong to.
     * @param {integer} lineNumber the line number of the breakpoint within the file, 0-based.
     */
    this.removeBreakpointsForFile = function removeBreakpointsForFile(filePath) {
      _ensureConnected();

      var breakpoints = [];
      var promises = [];

      // Note: The model is updated by method _removeBreakpoint
      for (var i = 0; i < this.breakpoints.length; i++) {
        if (this.breakpoints[i].filePath === filePath) {
          breakpoints.push(this.breakpoints[i]);
          promises.push(this.removeBreakpoint(breakpoints[i].filePath, breakpoints[i].lineNumber));
        }
      }
      // asynchronously resolve all breakpoints
      return Q.all(promises).then(function() {
        return Q.resolve(breakpoints);
      });
    };

    /**
     * Updates the breakpoints for the given file according to the breakpoint location diff information.
     *
     * @param {string} filePath The file the breakpoints belong to.
     * @param {Object} breakpointLocationDiff The diff object contains the new locations for all breakpoints that have changed.<br>
     * JSON object definition:
     * {
     *   "id": "DiffDetails",
     *   "type": "array",
     *   "items": { "$ref": "DiffEntry" }
     *   "description": "Array of diff entries containing information about old and new location for each breakpoint (0-based)."
     * }
     * {
     *   "id": "DiffEntry",
     *   "type": "object",
     *   "properties": [
     *     { "name": "oldValue", "type": "integer", "description": "Old value." },
     *     { "name": "newValue", "type": "integer", "description": "New value." },
     *   ],
     *   "description": "Breakpoint defined by its location (source code location)."
     * }
     * @return The breakpoints that have been defined for the given file.
     */
    this.updateBreakpointLocations = function updateBreakpointLocations(filePath, breakpointLocationDiff) {
      _ensureConnected();

      var breakpoints = this.getBreakpointsByFilePath(filePath);

      for (var i = 0; i < breakpointLocationDiff.length; i++) {
        for (var j = 0; j < breakpoints.length; j++) {
          if (breakpoints[j].lineNumber === breakpointLocationDiff[i].oldValue) {
            _debugSessionManager.setModelProperty(this.id, "breakpoints/" + j + "/lineNumber", breakpointLocationDiff[i].newValue);
            break;
          }
        }
      }
      return breakpoints;
    };

    /**
     * Returns the resource object with the given workspace file path or undefined if not found.
     * @param {string} filePath The file the breakpoints belong to.
     */
    this.getResourceByFilePath = function getResourceByFilePath(filePath) {
      _ensureConnected();

      if (filePath) {

        for (var i = 0; i < this.resources.length; i++) {

          // use existing method for best matches for breakpoints
          var remoteUrl = this.getResourceResolver().getUrlMapping(filePath);

          // TODO return resource even if the url is not in the parsed resources??
          if (remoteUrl && this.resources[i].url === remoteUrl) {
            // if this matches, return immediately
            return this.resources[i];
          }

          // TODO temporary fallback for xsjs
          var matchesXsJs = this.getResourceResolver().findBestMatchesXsJs(this.resources[i].url, [{
            filePath: filePath
          }]);
          // if there are matches, the resource is valid
          if (matchesXsJs && (matchesXsJs.length > 0)) {
            return this.resources[i];
          }

          // Fallback if project name and remote root are not available
          var matchesFallback = this.getResourceResolver().findBestMatchesFallback(this.resources[i].url, [{
            filePath: filePath
          }]);
          if (matchesFallback && (matchesFallback.length > 0)) {

            return this.resources[i];
          }

        }
      }
      return null;
    };

    this.getSourceDocumentProvider = function getSourceDocumentProvider() {
      return _sourceDocumentProvider;
    };

    this.getResourceResolver = function getResourceResolver() {
      return _resourceResolver;
    };

    /**
     * Returns the script source code for a given script id.
     * The script id is sent from the node debugger by the "scriptParsed" event.
     * See _onDebuggerScriptParsed(message).
     */
    this.getSourceCodeForId = function getSourceCodeForId(id) {

      var sourceCode = Q.defer();

      _invokeGetSourceCodeForScriptId(id).then(function(result) {
        sourceCode.resolve(result.scriptSource);
      }).fail(function(error) {
        sourceCode.reject(error);
      });

      return sourceCode.promise;
    };

    this.getBreakpointsByFilePath = function getBreakpointsByFilePath(filePath) {
      _ensureConnected();

      var result = [];
      if (filePath) {
        for (var i = 0; i < this.breakpoints.length; i++) {
          if (this.breakpoints[i].filePath === filePath) {
            result.push(this.breakpoints[i]);
          }
        }
      }
      return result;
    };

    this.getBreakpointByLocation = function getBreakpointByLocation(filePath, lineNumber) {
      _ensureConnected();

      var idx = _indexOfBreakpointByLocation(filePath, lineNumber);

      if (idx !== -1) {
        return this.breakpoints[idx];
      }
    };

    this.indexOfBreakpointByLocation = function indexOfBreakpointByLocation(filePath, lineNumber) {
      _ensureConnected();

      return _indexOfBreakpointByLocation(filePath, lineNumber);
    };

    this.isConnected = function isConnected() {
      return this.connected;
    };

    this.getDiffEntryByOldValue = function getDiffEntryByOldValue(diff, oldValue) {
      for (var i = 0; i < diff.length; i++) {
        if (diff[i].oldValue === oldValue) {
          return diff[i];
        }
      }
    };

    /**
     * Returns the properties for the given scope that belongs to the given stackFrame.
     */
    this.getPropertiesForScope = function getPropertiesForScope(scope) {
      var msg;
      var modelId = _debugSessionManager.getModelResolver().getModelIdForScope(scope);
      var uri = _debugSessionManager.getModelResolver().getUriForObject(scope);

      if (!modelId) {
        msg = "Scope does not exist in this debug session context [" + scope + "]";
        _logger.logError(msg);
        return Q.reject(msg);
      }
      if (!uri) {
        msg = "Scope does not exist in this debug session context [" + scope + "]";
        _logger.logError(msg);
        return Q.reject(msg);
      }

      var payload = {
        params: {
          objectId: scope.object.objectId,
          ownProperties: false,
          accessorPropertiesOnly: false
        }
      };
      return _invokeMethod("Runtime.getProperties", "/debug/nodejs/command/" + that.id, payload).then(function(message) {
        if (message.result) {
          //sort and set as 'properties' reference on scope object
          try {
            _debugSessionManager.setModelPropertyByUri(uri + "/properties", _sortProperties(message.result.result));
          } catch (ex) {
            _logger.logError("Failed to set properties for scope [" + uri + "], details: " + ex);
            return Q.reject(ex);
          }
        }
        return Q.resolve(scope);
      }).fail(function(error) {
        _logger.logError("Failed to read properties for scope [" + uri + "], details:\n" + error.stack);
        return Q.reject(error);
      });
    };

    /**
     *
     * @param {string} uri The uri refering to the given object. The path is relative to this debug session and
     * starts with the 'threads' relation.
     */
    this.getPropertiesForObject = function getPropertiesForObject(object, uri) {
      var msg;
      if (!object || !object.value || !object.value.hasOwnProperty("objectId")) {
        msg = "Invalid parameter object [" + object + "]";
        _logger.logError(msg);
        return Q.reject(msg);
      }
      if (!uri) {
        msg = "Invalid parameter uri [" + uri + "]";
        _logger.logError(msg);
        return Q.reject(msg);
      }

      // own properties including prototypes are exposed via relation 'properties'
      var payloadOwnProperties = {
        params: {
          objectId: object.value.objectId,
          ownProperties: true,
          accessorPropertiesOnly: false
        }
      };
      // TODO: node inspector is also retrieving the object's accessor properties - expose via relation 'accessors'
      // var payloadAccessorPropterties = {
      //   params: {
      //     objectId: object.value.objectId,
      //     ownProperties: false,
      //     accessorPropertiesOnly: true
      //   }
      // };
      return Q.all([
        _invokeMethod("Runtime.getProperties", "/debug/nodejs/command/" + this.id, payloadOwnProperties)
//        _invokeMethod("Runtime.getProperties", "/debug/nodejs/command/" + this.id, payloadAccessorPropterties)
      ]).spread(function(
        messageOwnProperties, messageAccessorProperties) {
        try {
          if (messageOwnProperties.result) {
            // for (var i = 0; i < messageOwnProperties.length; i++) {
            //   messageOwnProperties[i].id = messageOwnProperties[i].name;
            // }
            //sort and set as 'properties' reference on parent object
            _debugSessionManager.setModelPropertyByUri(uri + "/properties", _sortProperties(messageOwnProperties.result.result, object));
          }
          // if (messageAccessorProperties.result) {
          //   //sort and set as 'properties' reference on parent object
          //   _debugSessionManager.setModelPropertyByUri(uri + "/accessors", _sortProperties(messageAccessorProperties.result.result));
          // }
          return Q.resolve(object);
        } catch (ex) {
          _logger.logError("Failed to set properties for object [" + uri + "], details: " + ex);
          return Q.reject(ex);
        }
      }).fail(function(error) {
        _logger.logError("Failed to read properties for object [" + uri + "], details:\n" + error.stack);
        return Q.reject(error);
      });
    };

    /////////////////////////////////////
    // model data
    /////////////////////////////////////
    this.id = sessionId;
    this.name = _getReadableName(debugSessionDefinition, sessionId);
    this.channel = sessionChannel;
    this.connected = false;
    this.suspended = false;
    /**
     * {
     *   "id": "NodeJsBreakpoint",
     *   "type": "object",
     *   "properties": [
     *     { "name": "id", "type": "string", "description": "Id as returned by the node.js runtime." }
     *     { "name": "resourceId", "type": "string", "description": "Id of the associated resource as returned by the node.js runtime." },
     *     { "name": "lineNumber", "type": "integer", "description": "Line number in the file (0-based)." }
     *     { "name": "filePath", "type": "string", "description": "Fully qualified path of the resource within the designtime project" },
     *     { "name": "enabled", "type": "boolean", "description": "Distinguishes whether the breakpoint is enabled or disabled." },
     *   ],
     *   "description": "Breakpoint defined by its location (source code location)."
     * }
     */
    this.breakpoints = [];

    /**
     * {
     *     "id": "NodeJsThread",
     *     "type": "object",
     *     "description": "A thread is a sequential flow of execution in a debug session. A thread contains stack frames.
     *          Stack frames are only available when the thread is suspended, and are returned in top-down order.
     *          Note: For node.js there is always only one static thread.",
     *     "properties": [
     *          { "name": "stackFrames", "type": "array", "items": { "$ref": "NodeJsStackFrame" }, "description": "Call stack the virtual machine stopped on." },
     *          { "name": "reason", "type": "string", "enum": [ "XHR", "DOM", "EventListener", "exception", "assert", "CSPViolation", "debugCommand", "promiseRejection", "AsyncOperation", "other" ], "description": "Pause reason." },
     *          { "name": "data", "type": "object", "optional": true, "description": "Object containing break-specific auxiliary properties." },
     *          { "name": "hitBreakpoints", "type": "array", "optional": true, "items": { "type": "string" }, "description": "Hit breakpoints IDs", "hidden": true },
     *          { "name": "asyncStackTrace", "$ref": "StackTrace", "optional": true, "description": "Async stack trace, if any.", "hidden": true }
     *     ]
     * }
     * {
     *	   See also http://chromedevtools.github.io/debugger-protocol-viewer/Debugger/#type-CallFrame
     *     "id": "NodeJsStackFrame",
     *     "type": "object",
     *     "description": "Stack entry for console errors and assertions.",
     *     "properties": [
     *         { "name": "id", "type": "string", "description": "Call frame identifier. This identifier is only valid while the virtual machine is paused." },
     *         { "name": "functionName", "type": "string", "description": "Name of the JavaScript function called on this call frame." },
     *         { "name": "location", "$ref": "NodeJsLocation", "description": "Location in the source code."},
     *         { "name": "functionLocation", "$ref": "Location", "description": "Location in the source code."},
     *         { "name": "scopes", "type": "array", "items": { "$ref": "NodeJsScope" }, "description": "Scope chain of this call frame"},
     *         { "name": "this", "$ref": "NodeJsRemoteObject", "description": "<code>this</code> object for this call frame."},
     *         { "name": "returnValue", "$ref": "NodeJsRemoteObject", "optional": true, "description": "The value being returned, if the function is at return point."},
     *     ]
     * }
     * {
     *	   See also http://chromedevtools.github.io/debugger-protocol-viewer/Debugger/#type-Location
     *     "id": "NodeJsLocation",
     *     "type": "object",
     *     "description": "Location in the source code.",
     *     "properties": [
     *         { "name": "resourceId", "type": "string", "description": "Identifier of the script parsed." },
     *         { "name": "resource", "$ref": "NodeJsResource", "description": "A reference to the parsed resource object." },
     *         { "name": "lineNumber", "type": "integer", "description": "JavaScript resource line number." },
     *         { "name": "columnNumber", "type": "integer", "description": "JavaScript resource column number." }
     *     ]
     * }
     * {
     *	   See also http://chromedevtools.github.io/debugger-protocol-viewer/Debugger/#type-Scope
     *     "id": "NodeJsScope",
     *     "type": "object",
     *     "description": "Scope description.",
     *     "properties": [
     *         { "name": "type", "type": "string", "description": "Scope type. Allowed values: global, local, with, closure, catch, block, script." },
     *         { "name": "object", "$ref": "NodeJsRemoteObject", "description": "Object representing the scope. For global and with scopes it represents the actual object; for the rest of the scopes, it is artificial transient object enumerating scope variables as its properties." },
     *         { "name": "properties", "type": "array", "items": { "$ref": "NodeJsPropertyDescriptor" }, "description": "Scope properties."},
     *     ]
     * }
     * {
     *	   See also http://chromedevtools.github.io/debugger-protocol-viewer/Runtime/#type-RemoteObject
     *     "id": "NodeJsRemoteObject",
     *     "type": "object",
     *     "description": "Mirror object referencing original JavaScript object.",
     *     "properties": [
     *         { "name": "type", "type": "string", "description": "Object type. Allowed values: object, function, undefined, string, number, boolean, symbol." },
     *         { "name": "value", "type": "any", "description": "Remote object value in case of primitive values or JSON values (if it was requested), or description string if the value can not be JSON-stringified (like NaN, Infinity, -Infinity, -0)." },
     *         { "name": "description", "type": "string", "description": "String representation of the object." },
     *         { "name": "objectId", "type": "string", "description": "Unique object identifier (for non-primitive values)." },
     *         { "name": "properties", "type": "array", "items": { "$ref": "NodeJsPropertyDescriptor" }, "description": "Object properties."},
     *         { "name": "accessors", "type": "array", "items": { "$ref": "NodeJsPropertyDescriptor" }, "description": "Object property accessors."},
     *     ]
     * }
     * {
     *	   See also http://chromedevtools.github.io/debugger-protocol-viewer/Runtime/#type-PropertyDescriptor
     *     "id": "NodeJsPropertyDescriptor",
     *     "type": "object",
     *     "description": "Mirror object referencing original JavaScript object.",
     *     "properties": [
     *         { "name": "name", "type": "string", "description": "Property name or symbol description." },
     *         { "name": "value", "$ref": "NodeJsRemoteObject", "description": "The value associated with the property." },
     *         { "name": "writable", "type": "boolean", "description": "True if the value associated with the property may be changed (data descriptors only)." },
     *         { "name": "symbol", "$ref": "NodeJsRemoteObject", "optional": true, "description": "Property symbol object, if the property is of the symbol type." },
     *     ]
     * }
     */
    this.threads = [{
      getParent: function getParent() {
        return that;
      },
      id: "0",
      suspended: false,
      stackFrames: []
    }];
    /**
     * {
     *	   See also http://chromedevtools.github.io/debugger-protocol-viewer/Debugger/#event-scriptParsed
     *     "id": "NodeJsResource",
     *     "type": "object",
     *     "description": "The JavaScript resource that has been loaded by the node.js runtime.
     *      An event 'Debugger.scriptParsed' is fired whenever the virtual machine parses script. For each loaded script the below data is returned
     *      This event is also fired for all known and uncollected resources upon enabling debugger.
     *      NOTE: some properties are optional."
     *     "properties": [
     *       { "name": "id", "type": "string", "description": "Identifier of the JavaScript resource." },
     *       { "name": "url", "type": "string", "description": "URL or name of the script parsed (if any)." },
     *       { "name": "startLine", "type": "integer", "description": "Line offset of the script within the resource with given URL (for script tags)." },
     *       { "name": "startColumn", "type": "integer", "description": "Column offset of the script within the resource with given URL." },
     *       { "name": "endLine", "type": "integer", "description": "Last line of the script." },
     *       { "name": "endColumn", "type": "integer", "description": "Length of the last line of the script." },
     *       { "name": "isContentScript", "type": "boolean", "optional": true, "description": "Determines whether this script is a user extension script." },
     *       { "name": "isInternalScript", "type": "boolean", "optional": true, "description": "Determines whether this script is an internal script.", "hidden": true },
     *       { "name": "sourceMapURL", "type": "string", "optional": true, "description": "URL of source map associated with script (if any)." },
     *       { "name": "hasSourceURL", "type": "boolean", "optional": true, "description": "True, if this script has sourceURL.", "hidden": true }
     *   ],
     * }
     */
    this.resources = [];
  };

  return NodeJsDebugSession;
});
