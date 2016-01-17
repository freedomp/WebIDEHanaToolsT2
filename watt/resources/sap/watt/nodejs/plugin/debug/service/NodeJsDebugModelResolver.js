define(function() {
  "use strict";

  /**
   * Resolves URI's, ID's or JSON model paths (array index based) to objects and back.
   * Capable converting URIs to JSON model paths (array index based) and back.
   */
  var NodeJsDebugModelResolver = function NodeJsDebugModelResolver(logger, model) {
    if (!logger) {
      throw new Error("Log service missing");
    }
    if (!model) {
      throw new Error("Model missing");
    }
    var _logger = logger;
    var _model = model;
    var _modelRoot = model.getProperty("/");
    var that = this;

    function _instanceOf(object) {
      if (!object) {
        return;
      }
      if (object.hasOwnProperty("threads")) {
        return "debugSession";
      }
      if (object.hasOwnProperty("stackFrames")) {
        return "thread";
      }
      if (object.hasOwnProperty("scopes") && object.hasOwnProperty("functionName")) {
        return "stackFrame";
      }
      if (object.hasOwnProperty("type") && object.getParent() && object.getParent().hasOwnProperty("scopes")) {
        return "scope";
      }
      if (object.hasOwnProperty("name") && object.hasOwnProperty("configurable") && object.hasOwnProperty("enumerable")) {
        return "property";
      }
    }

    function _getModelInfoByUri(uri) {
      var segments = uri.split("/");
      var property;
      var path;
      var idx;

      // must start with '/'
      if (!segments || segments.length < 2) {
        return;
      }

      for (var i = 1; i < segments.length; i++) {
        switch (segments[i]) {
          case "debugSessions":
            path = "/debugSessions";
            if (segments.length > ++i) {
              idx = that.indexOfDebugSessionById(segments[i]);
              path += "/" + idx;
            }
            property = _model.getProperty(path);
            break;
          case "threads":
            path += "/threads";
            if (segments.length > ++i) {
              idx = that.indexOfThreadById(property, segments[i]);
              path += "/" + idx;
            }
            property = _model.getProperty(path);
            break;
          case "stackFrames":
            path += "/stackFrames";
            if (segments.length > ++i) {
              idx = that.indexOfStackFrameById(property, segments[i]);
              path += "/" + idx;
            }
            property = _model.getProperty(path);
            break;
          case "scopes":
            path += "/scopes";
            if (segments.length > ++i) {
              idx = that.indexOfScopeById(property, segments[i]);
              path += "/" + idx;
            }
            property = _model.getProperty(path);
            break;
          case "properties":
            path += "/properties";
            if (segments.length > ++i) {
              idx = that.indexOfPropertyById(property, segments[i]);
              path += "/" + idx;
            }
            property = _model.getProperty(path);
            break;

            // TODO: node inspector is also retrieving the object's accessor properties - expose via relation 'accessors'
            // case "accessors":
            //   path += "/accessors";
            //   if (segments.length > ++i) {
            //     idx = that.indexOfPropertyById(property, segments[i]);
            //     path += "/" + idx;
            //   }
            //   property = _model.getProperty(path);
            //   break;
          default:
            logger.logError("Invalid URI [" + uri + "]");
            return {
              property: undefined,
              path: undefined
            };
        }
        if (!property && i < segments.length) {
          if (logger.isDebug()) {
            logger.logInfo("Failed to resolve URI [" + uri + "], resolved path [" + path + "]");
          }
          path = undefined;
          break;
        }
      }
      return {
        property: property,
        path: path
      };
    }

    this.indexOfDebugSessionById = function indexOfDebugSessionById(id) {
      for (var i = 0; i < _modelRoot.debugSessions.length; i++) {
        if (_modelRoot.debugSessions[i].id === id) {
          return i;
        }
      }
      return -1;
    };

    this.indexOfThreadById = function indexOfThreadById(debugSession, id) {
      if (debugSession) {
        for (var i = 0; i < debugSession.threads.length; i++) {
          if (debugSession.threads[i].id === id) {
            return i;
          }
        }
      }
      return -1;
    };

    this.indexOfStackFrameById = function indexOfStackFrameById(thread, id) {
      if (thread) {
        for (var i = 0; i < thread.stackFrames.length; i++) {
          if (thread.stackFrames[i].id === id) {
            return i;
          }
        }
      }
      return -1;
    };

    this.indexOfScopeById = function indexOfScopeById(stackFrame, id) {
      if (stackFrame) {
        for (var i = 0; i < stackFrame.scopes.length; i++) {
          if (this.getModelIdForScope(stackFrame.scopes[i]) === id) {
            return i;
          }
        }
      }
      return -1;
    };

    this.indexOfPropertyById = function indexOfPropertyById(parent, id) {
      for (var i = 0; i < parent.properties.length; i++) {
        var property = parent.properties[i];
        // might be of type scope or property
        if (this.getModelIdForProperty(property) === id) {
          return i;
        }
      }
      return -1;
    };

    this.convertUriToModelPath = function convertUriToModelPath(uri) {
      var info = _getModelInfoByUri(uri);
      if (info) {
        return info.path;
      }
    };

    /**
     * Returns the value as stored in the underlying model for property 'path' of the given the debug session.
     *
     * @returns {object} the property value or undefined if the property was not found
     */
    this.getModelPropertyByPath = function getModelPropertyByPath(path) {
      return _model.getProperty(path);
    };

    this.getModelPropertyByUri = function getModelPropertyByUri(uri) {
      var info = _getModelInfoByUri(uri);
      if (info) {
        return info.property;
      }
    };

    /**
     * Calculates the URI for the given object.
     * Note: This does currently only work for debug session, thread, stack frame, scope.
     * A exception is thrown otherwise.
     * TODO would be nice to generically calculate the path of some object
     * Need getParent() relationship and id property for each model entity.
     */
    this.getUriForObject = function getUriForObject(object) {
      if (!object) {
        return;
      }
      switch (_instanceOf(object)) {
        case "debugSession":
          return "/debugSessions/" + object.id;
        case "thread":
          if (object.getParent()) {
            return "/debugSessions/" + object.getParent().id + "/threads/" + object.id;
          }
          _logger.logError("Invalid thread object - has association 'stackFrames' but some invalid parent relation [" + object + "]");
          break;
        case "stackFrame":
          if (object.getParent() && object.getParent().getParent()) {
            return "/debugSessions/" + object.getParent().getParent().id + "/threads/" + object.getParent().id + "/stackFrames/" + object.id;
          }
          _logger.logError("Invalid stackFrame object - has association 'scopes' but some invalid parent relation [" + object + "]");
          break;
        case "scope":
          if (object.getParent() && object.getParent().getParent() && object.getParent().getParent().getParent()) {
            return "/debugSessions/" + object.getParent().getParent().getParent().id + "/threads/" + object.getParent().getParent().id + "/stackFrames/" + object.getParent().id + "/scopes/" + this.getModelIdForScope(object);
          }
          _logger.logError("Invalid scope object - scope has property 'type' and parent has 'scopes' association, but some invalid parent relation [" + object + "]");
          break;
        case "property":
          // calculating URI from property objects currently not supported, getParent relation required
        default:
          _logger.logError("Object type not supported - only type 'DebugSession', 'Thread', 'StackFrame' and 'Scope' are supported. Object [" + object + "]");
      }
    };

    this.getModelPathForObject = function getModelPathForObject(object) {
      var uri = this.getUriForObject(object);
      if (uri) {
        return this.convertUriToModelPath(uri);
      }
    };

    this.getModelIdForScope = function getModelIdForScope(scope) {
      if (scope.type === "local" || scope.type === "global") {
        return scope.type;
      }
      // for closures we append the objcectId as there may be multiple scopes of type closure
      return "closure_" + scope.object.objectId;
    };

    this.getModelIdForProperty = function getModelIdForProperty(property) {
      if (property) {
        return property.name;
      }
    };

    this.getModel = function getModel() {
      return _model;
    };
  };

  return NodeJsDebugModelResolver;
});
