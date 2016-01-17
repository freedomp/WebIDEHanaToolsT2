define([ //
  "sap/watt/common/plugin/platform/service/ui/AbstractPart", //
  "./NodeJsDebugSessionManager", //
  "./NodeJsBreakpointManager",
  "./NodeJsDebugResourceResolver",
  "../document/NodeJsDebugSourceFileDocument"
], function(AbstractPart, NodeJsDebugSessionManager, NodeJsBreakpointManager, NodeJsDebugResourceResolver, NodeJsDebugSourceDocument) {

  "use strict";

  var _breakpointManager;
  var _view;
  var _gutterClickListenerAdded;
  var _executionLineInfo;

  /**
   * Files monitored by this debug handler instance. Files will become monitored files when opening the corresponding editor.
   * {
   *   "items": { "type": "string" },
   * }
   */
  var _registeredFiles = {};
  var _currentFile;
  var _currentEditor;
  var _selectedProject;
  var _logger = {
    _log: undefined,
    _isDebug: undefined,

    _getUrlParam: function _getUrlParam(name, defaultValue) {
      var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
      if (!results) {
        return defaultValue;
      }
      return results[1] || defaultValue;
    },

    isDebug: function isDebug() {
      if (this._isDebug === undefined) {
        this._isDebug = this._getUrlParam("sap-ide-nodejs-debugmode") ? this._getUrlParam("sap-ide-nodejs-debugmode") === "true" : false;
      }
      return this._isDebug;
    },

    logInfo: function logInfo(message) {
      if (this.isDebug()) {
        this._log.info(message, ["system"]).done();
      }
    },

    logError: function logError(message) {
      //errors are always logged
      this._log.error(message, ["system"]).done();
    }
  };

  function _isEditorRegistered(filePath) {
    return (_registeredFiles.hasOwnProperty(filePath));
  }

  function _refreshEditorBreakpoints(breakpoints) {
    if (!_currentEditor || !_currentEditor.getSession()) {
      return;
    }
    var session = _currentEditor.getSession();
    var className;
    session.clearBreakpoints();
    if (breakpoints) {
      for (var i = 0; i < breakpoints.length; i++) {
        if (breakpoints[i].enabled) {
          className = "nodejs-breakpoint";
        } else {
          className = "nodejs-breakpoint-disabled";
        }
        session.setBreakpoint(breakpoints[i].lineNumber, className);
      }
    }
  }

  function _onEditorSessionChanged(delta) {
    if (!_currentEditor || !_currentEditor.getSession()) {
      return;
    }

    var session = _currentEditor.getSession();
    var range = delta.range,
      len,
      firstRow,
      i = 0,
      breakpointLocations = session.getBreakpoints(),
      newBreakpointLocations = [],
      breakpointLocationDiff = [],
      changed = false;

    if (delta.action === "insertText") {
      len = range.end.row - range.start.row;
      firstRow = range.start.column === 0 ? range.start.row : range.start.row + 1;
    } else if (delta.action === "insertLines") {
      len = range.end.row - range.start.row;
      firstRow = range.start.row;
    } else if (delta.action === "removeText") {
      len = range.start.row - range.end.row;
      firstRow = range.start.row;
    } else if (delta.action === "removeLines") {
      len = range.start.row - range.end.row;
      firstRow = range.start.row;
    }

    if (len > 0) {
      for (i = 0; i < breakpointLocations.length; i++) {
        if (breakpointLocations[i]) {
          if (i < firstRow) {
            newBreakpointLocations.push(i);
          } else {
            newBreakpointLocations.push(i + len);
            breakpointLocationDiff.push({
              oldValue: i,
              newValue: i + len
            });
            changed = true;
          }
        }
      }
    } else if (len < 0) {
      for (i = 0; i < breakpointLocations.length; i++) {
        if (breakpointLocations[i]) {
          if (i < firstRow) {
            newBreakpointLocations.push(i);
          } else if ((i < firstRow - len) && !newBreakpointLocations[firstRow]) {
            newBreakpointLocations.push(firstRow);
            breakpointLocationDiff.push({
              oldValue: i,
              newValue: firstRow
            });
            changed = true;
          } else {
            newBreakpointLocations.push(i + len);
            breakpointLocationDiff.push({
              oldValue: i,
              newValue: i + len
            });
            changed = true;
          }
        }
      }
    }

    if (changed) {
      _breakpointManager.updateBreakpointLocations(_currentFile, breakpointLocationDiff);
    }
  }

  function _registerEditor(editor, filePath) {
    if (editor && editor.getSession() && !_isEditorRegistered(filePath)) {
      _registeredFiles[filePath] = {
        sessionChangeListener: function(e) {
          _onEditorSessionChanged(e.data);
        },
        session: editor.getSession()
      };
      // register session change listener in order to recalculate breakpoint locations
      editor.getSession().on("change", _registeredFiles[filePath].sessionChangeListener);
    }
  }

  function _unregisterEditor(editor, filePath) {
    if (_isEditorRegistered(filePath)) {
      _registeredFiles[filePath].session.off("change", _registeredFiles[filePath].sessionChangeListener);
      delete _registeredFiles[filePath];
    }
  }

  function _updateBreakpointEditorContent(breakpoint) {
    if (breakpoint && _currentEditor && _currentEditor.getSession()) {
      var idx = _breakpointManager.indexOfBreakpointByLocation(breakpoint.filePath, breakpoint.lineNumber);
      if (idx !== -1) {
        // attach statement content to breakpoint
        _breakpointManager.getJsonModel().setProperty("/breakpoints/" + idx + "/statement", _currentEditor.getSession().getLine(breakpoint.lineNumber));
      }
    }
  }

  /**
   * Clears the execution line marker in the corresponding editor which may not match the current active editor.
   */
  function _clearExecutionLineMarker() {
    if (_executionLineInfo) {
      _executionLineInfo.editSession.removeMarker(_executionLineInfo.marker);
      _executionLineInfo = null;
    }
  }

  /**
   * Marks the current line of execution in the current active editor.
   * @param {number} lineNumber
   */
  function _setExecutionLineMarkerInCurrentEditor(lineNumber) {
    if (!_currentEditor || !_currentEditor.getSession()) {
      return;
    }

    if (_executionLineInfo && (_executionLineInfo.location.filePath !== _currentFile || _executionLineInfo.location.lineNumber !== lineNumber)) {
      _clearExecutionLineMarker();
    }
    if (!_executionLineInfo) {
      var Range = ace.require("ace/range").Range;
      var executionLineRange = new Range(lineNumber, 0, lineNumber, Infinity);

      _executionLineInfo = {
        location: {
          filePath: _currentFile,
          lineNumber: lineNumber
        },
        editSession: _currentEditor.getSession(),
        marker: _currentEditor.getSession().addMarker(executionLineRange, "nodejs-execution-line", "fullLine", false)
      };
    }
    //scroll to line
    _currentEditor.oEditor.scrollToLine(lineNumber, true, true);
  }

  function _markExecutionLine(stackFrame) {
    var url = stackFrame.location.resource.url;
    var resourceResolver = stackFrame.getParent().getParent().getResourceResolver();
    var resourcePath = resourceResolver.getResourceMapping(url);
    var that = this;

    // TODO temporary fallback for xsjs
    if (!resourcePath) {
      resourcePath = resourceResolver.getResourceMappingXsJs(url);
    }
    if (resourcePath) {
      if (_currentFile === resourcePath) {
        // mark execution line
        _setExecutionLineMarkerInCurrentEditor(stackFrame.location.lineNumber);
      } else {
        // if resource is remote only, reopen it with the read-only editor again
        if (resourceResolver.isFallback(resourcePath)) {
          _markExecutionLineInTemporarySourceEditor.call(that, stackFrame);
        }

        this.context.service.document.getDocumentByPath(resourcePath).then(function(document) {
          if (document) {
            that.context.service.editor.getDefaultEditor(document).then(function(defaultEditor) {
              that.context.service.content.open(document, defaultEditor.service);
            }).fail(function(error) {
              // this happens as long as the node_modules are not synced to the project
              _logger.logInfo("Could not open resource " + url + " from workspace, using remote source");
              _logger.logInfo(error.message);
              _markExecutionLineInTemporarySourceEditor.call(that, stackFrame);
            });
          } else {
            _logger.logInfo("Could not open resource " + url + " from workspace, using remote source");
            _markExecutionLineInTemporarySourceEditor.call(that, stackFrame);
          }
        }).fail(function(error) {
          _logger.logError("Could not open resource " + url + " from workspace, using remote source. Details: " + error.message);
        });
      }
    } else {
      _markExecutionLineInTemporarySourceEditor.call(this, stackFrame);
    }
  }

  function _markExecutionLineInTemporarySourceEditor(stackFrame) {
    if (!stackFrame.location.resource) {
      // the resource is undefined in case it has not been loaded by the debuggee - inform the user
      sap.ui.commons.MessageBox.alert("The selected resource has not been loaded by the running application - the editor cannot be opened.", null, "Information");
      return;
    }

    var document = stackFrame.getParent().getParent().getSourceDocumentProvider().getDocumentByKey({
      url: stackFrame.location.resource.url,
      id: stackFrame.location.resource.id
    });
    var that = this;

    if (document) {
      // check if editor is already open
      this.context.service.content.getCurrentDocument().then(function(currentDocument) {
        if (currentDocument && (currentDocument.getEntity().getFullPath() === document.getEntity().getFullPath())) {
          // editor already open - mark execution line
          _setExecutionLineMarkerInCurrentEditor(stackFrame.location.lineNumber);
        } else {
          // open editor and mark execution line
          that.context.service.editor.getDefaultEditor(document).then(function(defaultEditor) {
            that.context.service.content.open(document, defaultEditor.service).then(function() {
              // remember that remote source was opened
              stackFrame.getParent().getParent().getResourceResolver().addToFallbackList(stackFrame.location.resource.url);
            }).fail(function(error) {
              _logger.logError(error);
            });
          }).fail(function(error) {
            _logger.logError(error);
          });
        }
      });
    } else {
      _logger.logError("Document could not be retrieved from node js debuggee");
    }
  }

  function _onBreakpointChanged(event) {
    if (_currentFile !== event.breakpoint.filePath || !_currentEditor || !_currentEditor.getSession()) {
      return;
    }
    var session = _currentEditor.getSession();
    var idx;
    switch (event.id) {
      case "add":
        session.setBreakpoint(event.breakpoint.lineNumber, "nodejs-breakpoint");
        // read editor content of corresponding line and initialize breakpoint property 'statement'
        idx = _breakpointManager.indexOfBreakpointByLocation(event.breakpoint.filePath, event.breakpoint.lineNumber);
        if (idx !== -1) {
          _breakpointManager.getJsonModel().setProperty("/breakpoints/" + idx + "/statement", _currentEditor.getSession().getLine(event.breakpoint
            .lineNumber));
        }
        break;
      case "remove":
        session.clearBreakpoint(event.breakpoint.lineNumber);
        break;
      case "change":
        // currently only one delta is supported
        if (event.delta.key === "enabled") {
          // enablement state has changed
          if (event.breakpoint.enabled) {
            session.setBreakpoint(event.breakpoint.lineNumber, "nodejs-breakpoint");
          } else {
            session.setBreakpoint(event.breakpoint.lineNumber, "nodejs-breakpoint-disabled");
          }
        } else if (event.delta.key === "lineNumber") {
          // location has changed
          idx = _breakpointManager.indexOfBreakpointByLocation(event.breakpoint.filePath, event.breakpoint.lineNumber);
          if (idx !== -1) {
            // read editor content of corresponding line and initialize breakpoint property 'statement'
            _breakpointManager.getJsonModel().setProperty("/breakpoints/" + idx + "/statement", _currentEditor.getSession().getLine(event.breakpoint
              .lineNumber));
          }
          _currentEditor.getSession().clearBreakpoint(event.delta.value);
          if (event.breakpoint.enabled) {
            session.setBreakpoint(event.breakpoint.lineNumber, "nodejs-breakpoint");
          } else {
            session.setBreakpoint(event.breakpoint.lineNumber, "nodejs-breakpoint-disabled");
          }
        }
    }
  }

  function _toggleBreakpoint(filePath, lineNumber, editor) {
    var breakpoints = editor.getSession().getBreakpoints();
    if (breakpoints && breakpoints.length >= lineNumber && breakpoints[lineNumber]) {
      _breakpointManager.removeBreakpoint(filePath, lineNumber);
      editor.getSession().clearBreakpoint(lineNumber);
    } else {
      // immediately give user-feedback by setting the marker as the remote operation in connected state might need some time
      // the origin marker will be deleted in case the actual breakpoint location has changed
      _breakpointManager.addBreakpoint(filePath, lineNumber);
      editor.getSession().setBreakpoint(lineNumber, "nodejs-breakpoint");
    }
  }

  function _renderDebuggerMarker(filePath, editor) {
    // render breakpoints if necessary (editor reopened)
    _refreshEditorBreakpoints(_breakpointManager.getBreakpointsByFilePath(filePath));

    // render execution line marker
    if (this.getDebugController()) {
      var stackFrame = this.getDebugController().getSelectedStackFrame();
      if (stackFrame) {
        var location = stackFrame.location;
        var resourceResolver = stackFrame.getParent().getParent().getResourceResolver();
        var resourcePath = resourceResolver.getResourceMapping(location.resource.url);

        // TODO remove temporary fallback for xsjs
        if (!resourcePath) {
          resourcePath = resourceResolver.getResourceMappingXsJs(location.resource.url);
        }

        if (location.resource && resourcePath && (_currentFile === resourcePath)) {
          // select location
          _setExecutionLineMarkerInCurrentEditor(location.lineNumber);
        } else if (!resourcePath) {
          // fallback
          if (location.resource && _breakpointManager.getFileName(_currentFile) === _breakpointManager.getFileName(location.resource.url)) {
            // select location
            _setExecutionLineMarkerInCurrentEditor(location.lineNumber);
          }
        }
      }
    }
  }

  function _handleNodeJsGutterClick(event, filePath) {
    var oTarget = event.domEvent.target;
    var sClassName = oTarget.className;

    if (sClassName.indexOf("ace_fold-widget") < 0) {
      if (sClassName.indexOf("ace_gutter-cell") !== -1 && event.editor.isFocused()) {
        if (event.clientX <= 25 + oTarget.getBoundingClientRect().left) {
          event.stop();
          _toggleBreakpoint(filePath, event.getDocumentPosition().row, event.editor);
        }
      }
    }
  }

  /**
   * Fired whenever the debugger connection state changes - either if a debug session has been opened or closed
   * or if the entire websocket connection has been closed. In the later case the debugSession parameter is not defined.
   */
  function _onDebuggerConnectionStateChange(event) {
    if (event.id === "disconnected") {
      // TODO In case of the connection of a particular debug session has been closed only close temporary docments
      // belonging to this debug session.
      var contentService = this.context.service.content;
      // find temporary documents
      contentService.getDocuments().then(function(documents) {
        for (var i = 0; i < documents.length; i++) {
          var currentDocument = documents[i];
          if (NodeJsDebugSourceDocument.prototype.isPrototypeOf(currentDocument)) {
            // close editor
            contentService.close(currentDocument).fail(function(error) {
              _logger.logError(error);
            });
          }
        }
      });
    }
  }

  function _createView() {
    var debugSessionManager = new NodeJsDebugSessionManager(_logger, this.context.service.messageBus, _breakpointManager);
    debugSessionManager.addConnectDisconnectListener(_onDebuggerConnectionStateChange, this);

    var view = sap.ui.view({
      viewName: "sap.xs.nodejs.debug.view.NodeJsDebug",
      type: sap.ui.core.mvc.ViewType.JS,
      viewData: {
        logger: _logger,
        debugPart: this,
        debugSessionManager: debugSessionManager,
        breakpointManager: _breakpointManager
      }
    });
    view.setModel(_breakpointManager.getJsonModel(), "breakpoints");
    view.setModel(debugSessionManager.getJsonModel(), "debugSessions");
    this.context.i18n.applyTo(view); // set i18n model to view
    return view;
  }

  function _onApplicationLaunched(runner) {
    if (runner.params.debugUri) {
      // application launched in debug mode - attach debugger
      var that = this;
      var uri = new URI(runner.params.debugUri);
      var uriInfo = uri.scheme + "://" + uri.hostname + ":" + uri.port; // omit user info in logs
      if (_logger.isDebug()) {
        _logger.logInfo("Attaching: " + uriInfo);
      }
      var attachData = {
        debugURL: runner.params.debugUri,
        projectPath: runner.params.projectPath
      };

      this.setVisible(true).then(function() {
        that.getDebugController().attach(attachData).done();
      });
    } else if (this.getDebugController()) {
      // debugger might still be attached - detach debugger
      var controller = this.getDebugController();
      if (controller.isConnected() && controller._getDebugSession()) {
        var debugSession = controller._getDebugSession();
        if (debugSession.getResourceResolver().getProjectPath() === runner.params.projectPath) {
          controller.detach().done();
        }
      }
    }
  }

  return AbstractPart.extend("sap.xs.nodejs.debug.service.NodeJsDebugPart", {
    configure: function configure(config) {
      var that = this;
      return AbstractPart.prototype.configure.apply(this, arguments).then(function() {
        that.context.service.resource.includeStyles(config.styles).done();
        _logger._log = that.context.service.log;
        _breakpointManager = new NodeJsBreakpointManager(_logger);
        _breakpointManager.addBreakpointChangedListener(_onBreakpointChanged, that);
        that.context.service.nodejsLauncher.attachEvent("applicationRunning", function(runner) {
          _onApplicationLaunched.call(that, runner);
        }, that);
      });
    },

    getContent: function getContent() {
      if (!_view) {
        _view = _createView.call(this);
        return AbstractPart.prototype.getContent.apply(this, arguments).then(function() {
          return _view;
        });
      }
      return _view;
    },

    getDebugController: function getDebugController() {
      return (_view ? _view.getController() : undefined);
    },

    _onEditorRendered: function _onEditorRendered(event) {
      if (!_breakpointManager) {
        return;
      }
      var that = this;

      Q.all([event.source.getUI5Editor(), event.source.getCurrentFilePath()]).spread(function(ui5Editor, filePath) {
        if (_breakpointManager.canHandleFile(filePath)) {
          // listener for editor content changes
          if (!_isEditorRegistered(filePath)) {
            _registerEditor.call(that, ui5Editor.oEditor, filePath);
          }

          // singleton editor gutter layer for toggling breakpoints
          if (!_gutterClickListenerAdded) {
            ui5Editor.oEditor.on("gutterclick", function(clickEvent) {
              if (that.context.service.selection) {
                return that.context.service.selection.assertNotEmpty().then(function(selection) {
                  var document = selection[0].document;

                  if (_breakpointManager.canHandleFile(document.getEntity().getFullPath())) {
                    if (_currentFile !== document.getEntity().getFullPath()) {
                      _logger.logError("Clearing breakpoint, but no active file found");
                    } else {
                      _handleNodeJsGutterClick.call(that, clickEvent, document.getEntity().getFullPath());
                    }
                  }
                }).done();
              }
            });
            _gutterClickListenerAdded = true;
          }

          if (filePath !== _currentFile) {
            _currentFile = filePath;
            _currentEditor = ui5Editor;

            // render breakpoint and execution line marker
            _renderDebuggerMarker.call(that, filePath, ui5Editor);
          }
        }
      }).done();
    },

    _onTabClosed: function _onTabClosed(event) {
      var filePath = event.params.document.getEntity().getFullPath();
      if (_breakpointManager.canHandleFile(filePath)) {
        _unregisterEditor.call(this, event.params.editor, filePath);
      }

      if (_currentFile === filePath) {
        _currentFile = null;
        _executionLineInfo = null;
        _currentEditor = null;
      }
    },

    _onSetSelection: function _onSetSelection(event) {
      var selection = event.params.selection;
      if (Array.isArray(selection) && selection.length > 0 && selection[0].document) {
        selection[0].document.getProject().then(function(project) {
          _selectedProject = project.getEntity();
        }).done();
      }
    },

    /**
     * Called by the debug controller in case the selected stack frame has changed or the debug session
     * has been either resumed or suspended.<p>
     * The stackFrame will be null in case the current active debug session has been resumed.
     */
    _onDebuggerStackFrameChange: function _onDebuggerStackFrameChange(stackFrame) {
      if (stackFrame) {
        _markExecutionLine.call(this, stackFrame);
      } else {
        _clearExecutionLineMarker();
      }
    },

    _getSelectedProject: function _getSelectedProject() {
      return _selectedProject;
    }
  });
});
