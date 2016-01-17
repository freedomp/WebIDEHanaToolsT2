(function() {
  "use strict";
  sap.ui.controller("sap.xs.nodejs.debug.view.NodeJsDebug", {

    _DEBUG_SESSIONS_MODEL_NAME: "debugSessions>",

    _debugPart: undefined,
    _context: undefined,
    _i18n: undefined,
    _debugSessionManager: undefined,
    _modelResolver: undefined,
    _breakpointManager: undefined,
    _logger: undefined,
    _controllerModel: undefined,
    _keyBindingSuspend: "",
    _keyBindingResume: "",
    _keyBindingStepOver: "",
    _keyBindingStepInto: "",
    _keyBindingStepOut: "",
    _expandedVariableNodeUris: [],
    _variableTreeScrollPositions: {},
    _debugSession: undefined,
    _stackFrame: undefined,
    _variableTreeNodeExpanded: false,

    clear: function clear() {},

    /**
     * Uses canvas.measureText to compute and return the width of the given text of given font in pixels.
     *
     * @param {string} text The text to be rendered.
     * @param {string} font The css font descriptor that text is to be rendered with (e.g. "bold 14px verdana").
     *
     * @see http://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
     */
    _getTextWidth: function _getTextWidth(text, font) {
      // re-use canvas object for better performance
      var canvas = _getTextWidth.canvas || (_getTextWidth.canvas = document.createElement("canvas"));
      var context = canvas.getContext("2d");
      context.font = font;
      var metrics = context.measureText(text);
      return metrics.width;
    },

    _getUiLocationString: function _getUiLocationString(filePath, lineNumber) {
      return this._breakpointManager.getFileName(filePath) + ":" + (lineNumber + 1);
    },

    _configure: function _configure(logger, debugPart, debugSessionManager, breakpointManager) {
      this._logger = logger;
      this._debugPart = debugPart;
      this._context = debugPart.context;
      this._breakpointManager = breakpointManager;
      this._debugSessionManager = debugSessionManager;
      this._modelResolver = debugSessionManager.getModelResolver();
      this._i18n = this._context.i18n;

      // register listeners
      this._debugSessionManager.addSuspendResumeListener(this._onDebuggerSuspendResume, this);
      this._breakpointManager.addBreakpointChangedListener(this._onBreakpointChanged, this);

      // controller model
      var data = {
        message: "",
        messageType: undefined
      };
      this._controllerModel = new sap.ui.model.json.JSONModel(data);
      this._controllerModel.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);
      this.getView().setModel(this._controllerModel, "controller");

      this._context.service.messageBus.attachEvent("connectionClosed", this._onWebSocketClosed, this);
      var that = this;

      // get the platform specific key bindings and update the button tooltips accordingly
      Q.all([
        this._context.service.command.getCommand("sap.xs.nodejs.debug.suspend"),
        this._context.service.command.getCommand("sap.xs.nodejs.debug.resume"),
        this._context.service.command.getCommand("sap.xs.nodejs.debug.stepOver"),
        this._context.service.command.getCommand("sap.xs.nodejs.debug.stepInto"),
        this._context.service.command.getCommand("sap.xs.nodejs.debug.stepOut")
      ]).spread(function(commandSuspend, commandResume, commandStepOver, commandStepInto, commandStepOut) {
        that._keyBindingSuspend = commandSuspend.getKeyBindingAsText();
        that._keyBindingResume = commandResume.getKeyBindingAsText();
        that._keyBindingStepOver = commandStepOver.getKeyBindingAsText();
        that._keyBindingStepInto = commandStepInto.getKeyBindingAsText();
        that._keyBindingStepOut = commandStepOut.getKeyBindingAsText();

        sap.ui.getCore().byId("NodeJsSuspendResumeButton").setTooltip(that._i18n.getText( //
          that._debugSession && that._debugSession.suspended ? "debugPane_resume_xtol" : "debugPane_suspend_xtol", //
          [that._debugSession && that._debugSession.suspended ? that._keyBindingResume : that._keyBindingSuspend]
        ));
        sap.ui.getCore().byId("NodeJsStepOverButton").setTooltip(that._i18n.getText("debugPane_stepOver_xtol", [that._keyBindingStepOver]));
        sap.ui.getCore().byId("NodeJsStepIntoButton").setTooltip(that._i18n.getText("debugPane_stepInto_xtol", [that._keyBindingStepInto]));
        sap.ui.getCore().byId("NodeJsStepOutButton").setTooltip(that._i18n.getText("debugPane_stepOut_xtol", [that._keyBindingStepOut]));
      }).done();
    },

    /**
     * Fired whenever the debugger execution changes from suspend to resume and vice versa.
     */
    _onDebuggerSuspendResume: function _onDebuggerSuspendResume(event) {
      var debugSession = event.params.debugSession;
      var callStackTable = sap.ui.getCore().byId("NodeJsCallStackTable");

      // set the active debug session
      this._setDebugSession(debugSession);

      if (event.id === "suspended") {
        if (debugSession.threads.length > 0 && debugSession.threads[0].stackFrames.length > 0) {
          // fire stackFrame selection change
          callStackTable.setSelectedIndex(0);
        }

        this._notifyAboutDebugEvent(this._i18n.getText("debugPane_suspended_xmsg", [debugSession.name]), false);
      } else {
        // resumed
        // fire stackFrame selection change
        callStackTable.setSelectedIndex(-1);
      }
    },

    _getContainerWidth: function _getContainerWidth() {
      var breakpointComposite = sap.ui.getCore().byId("NodeJsBreakpointComposite");
      // breakpointComposite.getDomRef() is null in test runs
      return breakpointComposite.getDomRef() ? breakpointComposite.getDomRef().scrollWidth : 0;
    },

    /**
     * Called by the breakpoint manager whenever a breakpoint has been either
     * added, removed or changed.
     * This handler calculates the column widths of the breakpoint table columns.
     */
    _onBreakpointChanged: function _onBreakpointChanged(event) {
      if (event.id === "add" || event.id === "remove") {
        var breakpointTable = sap.ui.getCore().byId("NodeJsBreakpointTable");

        // set width of first column only the first time - it has static width
        if (!breakpointTable.getColumns()[0].getWidth()) {
          var checkboxColWidth = this._getTextWidth("XX", "11pt arial") + 8;
          breakpointTable.getColumns()[0].setWidth(Math.round(checkboxColWidth) + "px");
        }

        var locationColWidth = 0;
        var breakpoints = this._breakpointManager.getJsonModel().getProperty("/breakpoints");

        // calculate the max column width for the location column
        for (var i = 0; i < breakpoints.length; i++) {
          // 16px padding
          var width = this._getTextWidth(this._getUiLocationString(breakpoints[i].filePath, breakpoints[i].lineNumber), "11pt arial") + 8;
          locationColWidth = Math.max(locationColWidth, width);
        }
        // ensure that there is some space left for the statement column
        var containerWidth = this._getContainerWidth();
        var maxWidth = containerWidth - containerWidth / 3 - parseInt(breakpointTable.getColumns()[0].getWidth());
        if (maxWidth > 0) {
          locationColWidth = Math.min(locationColWidth, maxWidth);
          locationColWidth = Math.round(locationColWidth) + "px";

          if (breakpointTable.getColumns()[1].getWidth() !== locationColWidth) {
            breakpointTable.getColumns()[1].setWidth(locationColWidth);
          }
        }
      }
    },

    _notifyAboutDebugEvent: function _notifyAboutDebugEvent(message, showInlineNotification) {
      var that = this;
      var title = that._i18n.getText("debugPane_xtit");

      // in test runs title is null
      if (title) {
        var messageFull = title + ": " + message;

        // if we have focus, show the message right away
        if (document.hasFocus()) {
          if (showInlineNotification) {
            that._context.service.usernotification.liteInfo(messageFull).done();
          }
          return;
        }

        // no focus right now: show message if we get focus
        var focusListener = function() {
          window.removeEventListener("focus", focusListener);
          that._context.service.usernotification.liteInfo(messageFull).done();
        };
        window.addEventListener("focus", focusListener);

        // additionally show a notification if supported
        if (window.Notification) {
          Notification.requestPermission(function(permission) {
            var notification = new Notification(title, {
              body: message
            });
            notification.onclick = function() {
              window.focus();
            };
            setTimeout(function() {
              notification.close();
            }, 15 * 1000);
          });
        }
      }
    },

    _onWebSocketClosed: function _onWebSocketClosed(event) {
      this._debugSessionManager.disconnect();
      // show status message if the main websocket instance has been disconnected
      this._setErrorMessage("The websocket connection has been closed.");
    },

    /**
     *	ResumeSuspend button press event.
     */
    _onPressResumeSuspendSession: function _onPressResumeSuspendSession() {
      if (this._debugSession) {
        if (this._debugSession.suspended) {
          this.resume().done();
        } else {
          this.suspend().done();
        }
      }
    },

    /**
     *	StepInto button press event.
     */
    _onPressStepInto: function _onPressStepInto() {
      this.stepInto().done();
    },

    /**
     *	StepOver button press event.
     */
    _onPressStepOver: function _onPressStepOver() {
      this.stepOver().done();
    },

    /**
     *	StepOut button press event.
     */
    _onPressStepOut: function _onPressStepOut() {
      this.stepOut().done();
    },

    /**
     *	Attach button press event launching the attach dialog in order to let the user select the debug target.
     */
    _onPressAttach: function _onPressAttach() {
      var that = this;

      var attachView = sap.ui.view({
        type: sap.ui.core.mvc.ViewType.JS,
        viewName: "sap.xs.nodejs.debug.view.NodeJsDebugAttach",
        viewData: {
          context: that._context,
          selectedProject: that._debugPart._getSelectedProject()
        }
      });
      attachView.getController().openViewInDialog().then(function(connectionData) {
        if (connectionData) {
          // attach debugger
          that.attach(connectionData).done();
        }
        // else: cancelled
      });
    },

    _onPressDetach: function _onPressDetach() {
      this.detach().done();
    },

    // breakpoint section
    _onBreakpointEnablementChange: function _onBreakpointEnablementChange(event) {
      var checkBox = event.getSource();
      var bindingContext = checkBox.getBindingContext("breakpoints");
      var path = bindingContext.getPath();
      var breakpoint = bindingContext.getModel().getProperty(path);

      if (breakpoint) {
        if (event.getParameters().checked) {
          this._breakpointManager.enableBreakpoint(breakpoint.filePath, breakpoint.lineNumber);
        } else {
          this._breakpointManager.disableBreakpoint(breakpoint.filePath, breakpoint.lineNumber);
        }
      }
    },

    /**
     * Double click on some breakpoint table entry will navigate to the breakpoint location.
     * The editor will position to the corresponding breakpoint line.
     */
    _onBreakpointDblClick: function _onBreakpointDblClick(event) {
      var rowContext = event.getParameters().rowContext;
      var breakpoint = rowContext ? rowContext.getModel().getProperty(rowContext.getPath()) : null;

      if (breakpoint) {
        this._openDefaultEditor(breakpoint.filePath, breakpoint.lineNumber);
      }
    },

    _openDefaultEditor: function _openDefaultEditor(filePath, lineNumber) {
      var that = this;

      // breakpoints can only be set on workspace files
      this._context.service.document.getDocumentByPath(filePath).then(function(document) {
        if (document) {
          that._context.service.editor.getDefaultEditor(document).then(function(editorDelegate) {
            if (editorDelegate) {
              that._context.service.content.open(document, editorDelegate.service).then(function() {
                //scroll to line
                editorDelegate.service.getUI5Editor().then(function(editor) {
                  if (editor) {
                    editor.oEditor.scrollToLine(lineNumber, true, true);
                  }
                });
              });
            }
          }).fail(function(error) {
            // this happens as long as the node_modules are not synced to the project
            that._logger.logInfo("Could not open file " + filePath + " from workspace");
            that._logger.logInfo(error.message);
          });
        }
      });
    },

    _onStackFrameSelectionChange: function _onStackFrameSelectionChange(event) {
      var rowContext = event.getParameters().rowContext;
      var stackFrame = rowContext ? rowContext.getModel().getProperty(rowContext.getPath()) : null;

      this._setStackFrame(stackFrame);
      // update editor and execution line according to selected stack frame
      this._debugPart._onDebuggerStackFrameChange(stackFrame);
    },

    /**
     * Sets the currently active debug session. Passing <code>null</code> allows to reset the currently active session.
     */
    _setDebugSession: function _setDebugSession(debugSession) {
      if (debugSession !== this._debugSession) {
        this._debugSession = debugSession;

        if (!debugSession) {
          this._setStackFrame(null);
        }
        var stackFrameComposite = sap.ui.getCore().byId("NodeJsCallStackComposite");
        stackFrameComposite.bindObject(debugSession ? this._DEBUG_SESSIONS_MODEL_NAME + this._modelResolver.getModelPathForObject(debugSession.threads[0]) : "");

        var headerComposite = sap.ui.getCore().byId("NodeJsHeaderComposite");
        headerComposite.bindObject(debugSession ? this._DEBUG_SESSIONS_MODEL_NAME + this._modelResolver.getModelPathForObject(debugSession) : "");
      }
    },

    /**
     * Returns the current active debug session.
     */
    _getDebugSession: function _getDebugSession() {
        return this._debugSession;
    },

    /**
     * Sets the current stack frame index within the stackFrames array of the current thread within the current debug session.
     * Passing <code>-1</code> clears the current stack frame.
     */
    _setStackFrame: function _setStackFrame(stackFrame) {
      if (stackFrame !== this._stackFrame) {
        // store scroll position on resume - needs to be called before the new stackFrame is set
        this._storeVariableTreeScrollPosition();

        this._stackFrame = stackFrame;

        var variableComposite = sap.ui.getCore().byId("NodeJsVariableComposite");
        variableComposite.bindObject(stackFrame ? this._DEBUG_SESSIONS_MODEL_NAME + this._modelResolver.getModelPathForObject(stackFrame) : "");

        // properties are cached as long as the debug session is paused
        // at the point in time the debugsession is resumed the entire callstack is discarded
        var localScope = this._getLocalScope(stackFrame);
        if (localScope && !localScope.properties) {
          // the local scope is always shown in expanded state
          var that = this;
          this._debugSession.getPropertiesForScope(localScope).then(function() {
            // variable tree does not use data binding as using a relative binding context did not work
            that._updateVariableTree(stackFrame);
          }).done();
        } else {
          this._updateVariableTree(stackFrame);
        }
      }
    },

    _getLocalScope: function _getLocalScope(stackFrame) {
      if (stackFrame) {
        for (var i = 0; i < stackFrame.scopes.length; i++) {
          if (stackFrame.scopes[i].type === "local") {
            return stackFrame.scopes[i];
          }
        }
      }
    },

    _isScopeReference: function _isScopeReference(uri) {
      return (uri.indexOf("/scopes/") !== -1 && uri.indexOf("/properties/") === -1);
    },

    _addUri: function _addUri(uri, uris) {
      if (!uri) {
        return;
      }

      for (var i = 0; i < uris.length; i++) {
        if (uris[i] === uri) {
          return;
        }
      }
      uris.push(uri);
      uris.sort();
    },

    _removeUri: function _removeUri(uri, uris) {
      if (!uri) {
        return;
      }
      var newUris = [];
      for (var i = 0; i < uris.length; i++) {
        // the collapsed node and all its children need to be removed
        if (!jQuery.sap.startsWith(uris[i], uri)) {
          newUris.push(uris[i]);
        }
      }
      return newUris;
    },

    _onVariableTreeNodeExpanded: function _onVariableTreeNodeExpanded(event) {
      var uri = event.getSource().data("uri");

      if (event.getParameters().opened === true && event.getSource()) {
        var that = this;
        var node = event.getSource();
        var object = this._modelResolver.getModelPropertyByUri(uri);

        if (object) {
          // when restoring state we are assuming that the list of expanded nodes is sorted in ascending order
          this._addUri(uri, this._expandedVariableNodeUris);
          this._variableTreeNodeExpanded = true;

          // properties are cached as long as the debug session is paused
          // at the point in time the debug session is resumed the entire callstack is discarded
          if (!object.properties) {
            if (this._isScopeReference(uri)) {
              // read the scope's properties from remote
              this._debugSession.getPropertiesForScope(object).then(function(scope) {
                that._addPropertyNodes(node, scope, uri);
              }).fail(function() {
                that._setErrorMessage("Failed to read properties from node.js runtime for the selected node");
              });
            } else {
              // read the oject's properties from remote
              this._debugSession.getPropertiesForObject(object, uri).then(function(theObject) {
                that._addPropertyNodes(node, theObject, uri);
              }).fail(function() {
                that._setErrorMessage("Failed to read properties from node.js runtime for the selected node");
              });
            }
          } else if (node.getNodes() && node.getNodes().length === 0) {
            that._addPropertyNodes(node, object, uri);
          }
        }
      } else {
        this._expandedVariableNodeUris = this._removeUri(uri, this._expandedVariableNodeUris);
      }
    },

    /**
     * @param {string} uri the URI represents the unique stable identifier to the corresponding object.
     * Might be undefined in case the property is of scalar type.
     */
    _addPropertyNode: function _addPropertyNode(parentNode, property, uri, path) {
      var bindingPath = this._DEBUG_SESSIONS_MODEL_NAME + path;
      var isScalarType = ["number", "boolean", "string"].indexOf(property.value.type) >= 0;

      var node = new sap.ui.commons.TreeNode({
        text: {
          parts: [{
            path: bindingPath + "/name"
          }, {
            path: bindingPath + "/value/type"
          }, {
            path: bindingPath + "/value/value"
          }, {
            path: bindingPath + "/value/description"
          }, {
            path: bindingPath + "/value/symbol"
          }],
          formatter: function(name, type, value, description, symbol) {
            var label = name + ": ";
            if (type === "object") {
              label += description;
            } else if (type === "function") {
              if (description) {
                var idx = description.indexOf("\n") + 1;
                if (idx > 0) {
                  label += description.substring(0, idx - 1);
                } else {
                  label += description;
                }
              } else {
                label += "\"\"";
              }
            } else if (type === "undefined") {
              label += "undefined";
            } else if (["number", "boolean"].indexOf(type) >= 0) {
              label += value;
            } else if (type === "string") {
              label = label + "\"" + value + "\"";
            } else if (type === "symbol") {
              label += symbol;
            } else {
              label += "null";
            }
            return label;
          }
        },
        expanded: false,
        //length and prototypes are not displayed for arrays, thus do not show expander for empty arrays
        hasExpander: !isScalarType && property.value && property.value.hasOwnProperty("objectId") && property.value.description !== "Array[0]",
        toggleOpenState: [this._onVariableTreeNodeExpanded, this]
      });

      parentNode.addNode(node);

      if (!isScalarType) {
        // store some context data for nodes representing node objects
        node.data("uri", uri);

        // add child nodes recursively
        if (this._debugSessionManager.getJsonModel().getProperty(path + "/properties")) {
          var object = this._debugSessionManager.getJsonModel().getProperty(path);
          this._addPropertyNodes(node, object, uri, path);
        }
      }
    },

    _addPropertyNodes: function _addPropertyNodes(parentNode, parentObject, parentUri, parentPath) {
      var path;
      var uri;

      if (parentObject.properties) {
        path = (parentPath || this._modelResolver.convertUriToModelPath(parentUri)) + "/properties/";
        uri = parentUri + "/properties/";

        for (var i = 0; i < parentObject.properties.length; i++) {
          var property = parentObject.properties[i];
          var propertyPath = path + i;
          var propertyUri = uri + this._modelResolver.getModelIdForProperty(property);

          // create the child node representing a object or scalar type
          this._addPropertyNode(parentNode, property, propertyUri, propertyPath);
        }
      }
    },

    _addScopeNode: function _addScopeNode(tree, scope) {
      var path = this._modelResolver.getModelPathForObject(scope);
      var uri = this._modelResolver.getUriForObject(scope);

      if (["local", "closure", "global"].indexOf(scope.type) >= 0) {
        var bindingPath = this._DEBUG_SESSIONS_MODEL_NAME + path;
        var node = new sap.ui.commons.TreeNode({
          text: {
            path: bindingPath + "/type",
            formatter: function(type) {
              switch (type) {
                case "local":
                  return "Local";
                case "closure":
                  return "Closure";
                case "global":
                  return "Global";
                default:
                  return "";
              }
            }
          },
          expanded: scope.type === "local",
          hasExpander: true,
          toggleOpenState: [this._onVariableTreeNodeExpanded, this]
        });
        // store some context data
        node.data("uri", uri);

        tree.addNode(node);
        this._addPropertyNodes(node, scope, uri, path);
      }
    },

    _addScopeNodes: function _addScopeNodes(tree, stackFrame) {
      for (var i = 0; i < stackFrame.scopes.length; i++) {
        this._addScopeNode(tree, stackFrame.scopes[i]);
      }
    },

    _getNodeByUri: function _getNodeByUri(nodes, uri) {
      if (!uri) {
        return;
      }

      var result;
      var nodeUri;
      var nodeChildren;

      for (var i = 0; i < nodes.length; i++) {
        nodeUri = nodes[i].data("uri");
        if (nodeUri) {
          if (uri === nodeUri) {
            result = nodes[i];
            break;
          } else {
            nodeChildren = nodes[i].getNodes();
            if (nodeChildren.length > 0) {
              result = this._getNodeByUri(nodeChildren, uri);
              if (result) {
                break;
              }
            }
          }
        }
      }
      return result;
    },

    _isAncestorUri: function _isAncestorUri(ancestorUri, childUri, isParent) {
      if (ancestorUri && childUri) {
        var ancestorSegments = ancestorUri.split("/");
        var childSegments = childUri.split("/");
        if ((!isParent && ancestorSegments.length < childSegments.length) || (isParent && childSegments.length - ancestorSegments.length < 2)) {
          for (var i = 0; i < ancestorSegments.length; i++) {
            if (ancestorSegments[i] !== childSegments[i]) {
              return false;
            }
          }
          return true;
        }
      }
      return false;
    },

    /**
     * Updates the model according to the expanded state of the variable tree in order to ensure that the entire
     * model data is available.
     */
    _restoreModelFromExpandedVariableState: function _restoreModelFromExpandedVariableState() {
      var that = this;
      var stackFrameUri = this._modelResolver.getUriForObject(this._stackFrame);
      var resolvedUris = [];

      if (stackFrameUri) {
        // keep variable tree state when switching between stack frames - add all URIs belonging to other stack frames
        for (var i = 0; i < this._expandedVariableNodeUris.length; i++) {
          if (this._expandedVariableNodeUris[i] && !jQuery.sap.startsWith(this._expandedVariableNodeUris[i], stackFrameUri)) {
            this._addUri(this._expandedVariableNodeUris[i], resolvedUris);
          }
        }

        // expanded variables node URIs are sorted in ascending order parent, children,..
        return this._readPropertiesForSiblingsRecursive(stackFrameUri, this._expandedVariableNodeUris, resolvedUris).then(function() {
          // remove all URIs that could not be resolved
          if (that._expandedVariableNodeUris.length !== resolvedUris.length) {
            that._expandedVariableNodeUris = resolvedUris;
          }
        });
      }
    },

    _restoreTreeFromExpandedVariableState: function _restoreTreeFromExpandedVariableState(tree) {
      for (var i = 0; i < this._expandedVariableNodeUris.length; i++) {
        // expand the node
        var node = this._getNodeByUri(tree.getNodes(), this._expandedVariableNodeUris[i]);
        if (node) {
          node.setExpanded(true);
        }
      }
    },

    _restoreVariableTreeScrollPosition: function _restoreVariableTreeScrollPosition() {
      var that = this;
      var stackFrameUri = this._modelResolver.getUriForObject(this._stackFrame);

      if (stackFrameUri) {
        var scrollPosition = this._variableTreeScrollPositions[stackFrameUri];
        if (scrollPosition) {
          var container = window.document.getElementById("NodeJsVariableTree-TreeCont");
          if (container) {
            container.scrollTop = scrollPosition.top;
            container.scrollLeft = scrollPosition.left;
          }
        }
      }
    },

    _storeVariableTreeScrollPosition: function _storeVariableTreeScrollPosition() {
      if (this._stackFrame) {
        var stackFrameUri = this._debugSessionManager.getModelResolver().getUriForObject(this._stackFrame);
        if (stackFrameUri) {
          var container = window.document.getElementById("NodeJsVariableTree-TreeCont");
          if (container) {
            this._variableTreeScrollPositions[stackFrameUri] = {
              top: container.scrollTop,
              left: container.scrollLeft
            };
          }
        }
      }
    },

    /**
     * Queries the given array <code>uris</code> for entries that exist in the debugSession model layer
     * and represent siblings of some ancestor defined by the given <code>ancestorUri</code>.
     * @param {string} ancestorUri The URI represents the common ancestor.
     * @param {string[]} uris The array contains all URIs that may represent siblings.
     * The entries may represent siblings, that may not exist in the model at that point in time.
     * @return The siblings that exisit in the model. Each entry is represented by
     * its URI and object, e.g.
     * {
     *  uri: "/debugSessions/sessionid/threads/0/stackFrames/frame0/scopes/scope:0:0",
     *  object: scopeObject
     + }
     */
    _getExistingSiblings: function _getExistingSiblings(ancestorUri, uris) {
      var siblings = [];
      var resolved = {};
      var child;
      var uri;
      var object;

      for (var i = 0; i < uris.length; i++) {
        if (childUri && jQuery.sap.startsWith(uris[i] + "/", childUri + "/")) {
          continue;
        }

        if (this._isAncestorUri(ancestorUri, uris[i], false)) {
          // uris[i] represents some descendant of parentUri
          var childUri = ancestorUri;
          var segments = uris[i].split("/");

          // check for existing siblings
          for (var j = ancestorUri.split("/").length; j < segments.length; j++) {
            childUri += "/" + segments[j];
            if (!resolved.hasOwnProperty(childUri)) {
              child = this._modelResolver.getModelPropertyByUri(childUri);
              if (child) {
                resolved[childUri] = child;
                if (!(child instanceof Array)) {
                  object = child;
                  uri = childUri;
                }
              } else {
                break;
              }
            }
          }
          if (object) {
            // make sure the entry or some ancestor is not already contained
            siblings.push({
              object: object,
              uri: uri
            });
            object = null;
            uri = null;
          }
        }
      }
      return siblings;
    },

    /**
     * Recursively reads the properties from the node.js debugee for the siblings of the given ancestor.
     * The properties are read for all descendants defined in the given array <code>uris</code>.
     * Reading properties of siblings is done in parallel while reading the properties of corresponding
     * children is synchronized.
     */
    _readPropertiesForSiblingsRecursive: function _readPropertiesForSiblingsRecursive(ancestorUri, allUris, resolvedUris) {
      var promises = [];
      var siblings = this._getExistingSiblings(ancestorUri, allUris);

      // reading the properties for each sibling can be done in parallel
      for (var i = 0; i < siblings.length; i++) {
        if (!siblings[i].object.properties) {
          promises.push(this._readPropertiesForObjectRecursive(siblings[i].object, siblings[i].uri, allUris, resolvedUris));
        } else {
          this._addUri(siblings[i].uri, resolvedUris);
          promises.push(this._readPropertiesForSiblingsRecursive(siblings[i].uri, allUris, resolvedUris));
        }
      }
      return Q.all(promises);
    },

    /**
     * Recursively reads the properties from the node.js debugee for the given object.
     * The properties are read for all descendants defined by the given array <code>uris</code>.
     */
    _readPropertiesForObjectRecursive: function _readPropertiesForObjectRecursive(object, uri, uris, resolvedUris) {
      var that = this;

      if (this._isScopeReference(uri)) {
        // read the scope's properties from remote
        return this._debugSession.getPropertiesForScope(object).then(function() {
          that._addUri(uri, resolvedUris);
          return that._readPropertiesForSiblingsRecursive(uri, uris, resolvedUris);
        }).fail(function() {
          // object not in scope - skip entire subtree
          if (this._logger.isDebug()) {
            this._logger.logInfo("Variable could not be resolved [" + uri + "]");
          }
        });
      } else {
        // read the oject's properties from node.js debugee
        return this._debugSession.getPropertiesForObject(object, uri).then(function() {
          that._addUri(uri, resolvedUris);
          return that._readPropertiesForSiblingsRecursive(uri, uris, resolvedUris);
        }).fail(function() {
          // object not in scope - skip entire subtree
          if (this._logger.isDebug()) {
            this._logger.logInfo("Variable could not be resolved [" + uri + "]");
          }
        });
      }
    },

    // TODO try to use tree node factory in order to return proper node templates
    // This did not work in the first try as lazy loading of stackframe variables triggered
    // a reload of the entire tree content and not a delta reload for the corresponding subtree
    // @see http://jsbin.com/yafici/2/edit?html,js,output for a potential solution
    _updateVariableTree: function _updateVariableTree(stackFrame) {
      var that = this;
      var i;
      var tree = sap.ui.getCore().byId("NodeJsVariableTree");
      tree.removeAllNodes();

      if (stackFrame && stackFrame.scopes) {
        // load missing scope and property data into model
        this._restoreModelFromExpandedVariableState().fin(function() {
          // update tree
          that._addScopeNodes(tree, stackFrame);
          // restore the expanded nodes after model and tree have been updated
          that._restoreTreeFromExpandedVariableState(tree);
        });
      }
    },

    _createBreakpointSorter: function _createBreakpointSorter() {
      var sorter = new sap.ui.model.Sorter("breakpoints>", false);
      var that = this;

      sorter.fnCompare = function(a, b) {
        var result = 0;
        if (a && b) {
          var fileNameA = a.filePath ? that._breakpointManager.getFileName(a.filePath) : "";
          var fileNameB = b.filePath ? that._breakpointManager.getFileName(b.filePath) : "";

          result = fileNameA.localeCompare(fileNameB);
          if (result === 0) {
            if (a.lineNumber < b.lineNumber) {
              result = -1;
            } else if (a.lineNumber > b.lineNumber) {
              result = 1;
            }
          }
        }
        return result;
      };
      return sorter;
    },

    _setMessage: function _setMessage(type, msg) {
      if (!type || type === "error" || type === "warning" || type === "info") {
        this._controllerModel.setProperty("/messageType", type);

        if (typeof msg === "string") {
          this._controllerModel.setProperty("/message", msg);
        } else if (msg && msg.message) {
          // handling error objects
          this._controllerModel.setProperty("/message", msg.message);
        } else {
          this._controllerModel.setProperty("/message", "");
        }
      } else {
        throw new Error("Illegal argument 'message type'");
      }
    },

    _setErrorMessage: function _setErrorMessage(msg) {
      this._setMessage("error", msg);
    },

    _setWarningMessage: function _setWarningMessage(msg) {
      this._setMessage("warning", msg);
    },

    _setInfoMessage: function _setInfoMessage(msg) {
      this._setMessage("info", msg);
    },

    _clearMessage: function _clearMessage() {
      this._setMessage();
    },

    getSelectedStackFrame: function getSelectedStackFrame() {
      return this._stackFrame;
    },

    attach: function attach(attachData) {
      var that = this;
      return this._context.service.progress.startTask().then(function(progressId) {
        try {
          if (!that._debugSessionManager.isConnected()) {
            return that._debugSessionManager.connect().then(function() {
              return that._debugSessionManager.connectDebugSession(attachData).then(function(debugSession) {
                that._clearMessage();
                that._setDebugSession(debugSession);
                that._notifyAboutDebugEvent(that._i18n.getText("debugPane_attached_xmsg", [debugSession.name]), true);
              });
            }).fail(function(error) {
              that._logger.logError("Failed to attach debugger");
              that._setErrorMessage(error);
            }).fin(function() {
              that._context.service.progress.stopTask(progressId).done();
            });
          } else {
            return that._debugSessionManager.connectDebugSession(attachData).then(function(debugSession) {
              that._clearMessage();
              that._setDebugSession(debugSession);
              that._notifyAboutDebugEvent(that._i18n.getText("debugPane_attached_xmsg", [debugSession.name]), true);
            }).fail(function(error) {
              that._logger.logError("Failed to attach debugger");
              that._setErrorMessage(error);
            }).fin(function() {
              that._context.service.progress.stopTask(progressId).done();
            });
          }
        } catch (error) {
          that._logger.logError("Failed to attach debugger - " + error);
          that._setErrorMessage(error);
          that._context.service.progress.stopTask(progressId).done();
        }
      });
    },

    detach: function detach() {
      var that = this;

      if (this._debugSession) {
        var debugSession = this._debugSession;
        this._setDebugSession(null);
        return this._debugPart.context.service.progress.startTask().then(function(progressId) {
          // detach debugger from current session
          return that._debugSessionManager.disconnectDebugSession(debugSession).fail(function(error) {
            that._logger.logError("Failed to detach debugger");
            that._setErrorMessage(error);
          }).fin(function() {
            that._debugPart.context.service.progress.stopTask(progressId).done();
            that._notifyAboutDebugEvent(that._i18n.getText("debugPane_detached_xmsg", [debugSession.name]), true);
          });
        });
      }
    },

    /**
     * Distinguishes whether the active debug session has been suspended or not.
     */
    isSuspended: function isSuspended() {
      return this._debugSession ? this._debugSession.suspended : false;
    },

    /**
     * Distinguishes whether there is a active debug session or not.
     */
    isConnected: function isConnected() {
      return this._debugSession ? this._debugSession.connected : false;
    },

    stepOver: function stepOver() {
      if (this._debugSession) {
        var that = this;
        return this._context.service.progress.startTask().then(function(progressId) {
          return that._debugSession.stepOver().fail(function(error) {
            that._logger.logError("Failed to execute 'step over' debugger action");
            that._setErrorMessage(error);
          }).fin(function() {
            that._context.service.progress.stopTask(progressId).done();
          });
        });
      }
    },

    stepInto: function stepInto() {
      if (this._debugSession) {
        var that = this;
        return this._context.service.progress.startTask().then(function(progressId) {
          return that._debugSession.stepInto().fail(function(error) {
            that._logger.logError("Failed to execute 'step into' debugger action");
            that._setErrorMessage(error);
          }).fin(function() {
            that._context.service.progress.stopTask(progressId).done();
          });
        });
      }
    },

    stepOut: function stepOut() {
      if (this._debugSession) {
        var that = this;
        return this._context.service.progress.startTask().then(function(progressId) {
          return that._debugSession.stepOut().fail(function(error) {
            that._logger.logError("Failed to execute 'step out' debugger action");
            that._setErrorMessage(error);
          }).fin(function() {
            that._context.service.progress.stopTask(progressId).done();
          });
        });
      }
      return Q.resolve();
    },

    resume: function resume() {
      var that = this;
      if (this._debugSession) {
        if (this._debugSession.suspended) {
          return this._context.service.progress.startTask().then(function(progressId) {
            // continue debug session
            return that._debugSession.resume().fail(function(error) {
              that._logger.logError("Failed to execute 'resume' debugger action");
              that._setErrorMessage(error);
            }).fin(function() {
              that._context.service.progress.stopTask(progressId).done();
            });
          });
        }
      }
    },

    suspend: function suspend() {
      var that = this;
      if (this._debugSession) {
        if (!this._debugSession.suspended) {
          return this._context.service.progress.startTask().then(function(progressId) {
            // pause debug session
            return that._debugSession.suspend().fail(function(error) {
              that._logger.logError("Failed to execute 'suspend' debugger action");
              that._setErrorMessage(error);
            }).fin(function() {
              that._context.service.progress.stopTask(progressId).done();
            });
          });
        }
      }
    }
  });
}());
