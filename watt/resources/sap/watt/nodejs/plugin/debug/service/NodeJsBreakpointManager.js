define([], function() {
	"use strict";

	/**
	 * Constructor.
	 *
	 * @param {Object} the logger used to write system log messages that are displayed in the console log.
	 */
	var NodeJsBreakpointManager = function NodeJsBreakpointManager(logger) {
		var _logger = logger;
		/**
		 * {
		 *   "id": "Breakpoint",
		 *   "type": "object",
		 *   "properties": [
		 *     { "name": "filePath", "type": "string", "description": "Fully qualified path of the resource within the designtime project" },
		 *     { "name": "lineNumber", "type": "integer", "description": "Line number in the file (0-based)." },
		 *     { "name": "enabled", "type": "boolean", "description": "Distinguishes whether the breakpoint is enabled or disabled." },
		 *   ],
		 *   "description": "Breakpoint defined by its location (source code location)."
		 * }
		 */
		var _data = {
			breakpoints: []
		};

		var _model = new sap.ui.model.json.JSONModel(_data);
		_model.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);

		/**
		 * Registered listeners listening for breakpoint changes, e.g. add, remove, change
		 */
		var _listeners = [];

		/**
		 * Notifies all registered listeners that the given breakpoint has changed. The property 'delta' holds an array of properties
		 * with the former state.
		 * {
		 *   "id": "Event",
		 *   "type": "object",
		 *   "properties": [
		 *     { "name": "id", "type": "string", "description": "The operation that has been executed on the breakpoint - either 'add', 'remove' or 'change'." },
		 *     { "name": "breakpoint", "$ref": "Breakpoint", "description": "The breakpoint that has been either added, removed or changed." },
		 *     { "name": "delta", "type": "object", "description": "An array of properties that have been changed containing the former value.
		 *      The property 'delta' is only available if type === 'change'." }
		 *   ],
		 *   "description": "Event fired whenever a breakpoint has been either added, removed or changed."
		 * }
		 */
		function _fireEvent(eventId, breakpoint, delta) {
			breakpoint = jQuery.extend({}, breakpoint);
			var event = {
				id: eventId,
				breakpoint: breakpoint,
				delta: delta
			};

			// clone breakpoint data in order to make sure that the origin data cannot be changed

			for (var i = 0; i < _listeners.length; i++) {
				_listeners[i].listener.call(_listeners[i].context, event);
			}
		}

		function _indexOfBreakpointByLocation(filePath, lineNumber) {
			if (filePath && lineNumber >= 0) {
				for (var i = 0; i < _data.breakpoints.length; i++) {
					if (_data.breakpoints[i] && _data.breakpoints[i].filePath === filePath && _data.breakpoints[i].lineNumber === lineNumber) {
						return i;
					}
				}
			}
			return -1;
		}

		function _removeBreakpointByIdx(idx) {
			if (idx !== -1) {
				var breakpoint = _data.breakpoints[idx];
				_data.breakpoints.splice(idx, 1);
				_model.setProperty("/breakpoints", _data.breakpoints);
				_fireEvent("remove", breakpoint);
			}
		}

		function _removeBreakpoint(filePath, lineNumber) {
			var idx = _indexOfBreakpointByLocation(filePath, lineNumber);
			if (idx !== -1) {
				_removeBreakpointByIdx(idx);
			}
		}

		function _updateBreakpointLocationByIdx(idx, newLineNumber) {
			var oldLineNumber = _data.breakpoints[idx].lineNumber;
			if (oldLineNumber !== newLineNumber) {
				var newBreakpointIdx = _indexOfBreakpointByLocation(_data.breakpoints[idx].filePath, newLineNumber);
				if (newBreakpointIdx !== -1) {
					// a breakpoint at the new location already exists - delete the given breakpoint instead updating it
					_removeBreakpointByIdx(idx);
				} else {
					_model.setProperty("/breakpoints/" + idx + "/lineNumber", newLineNumber);
					_fireEvent("change", _data.breakpoints[idx], {
						key: "lineNumber",
						value: oldLineNumber
					});
				}
			}
		}

		this.getFileName = function getFileName(filePath) {
			if (filePath && filePath.length >= 0) {
				var fileName = filePath || "";
				var idx = filePath.lastIndexOf("/");
				if (idx > 0) {
						fileName = filePath.substr(idx + 1);
				}
				return fileName;
			}
		};

		this.canHandleFile = function canHandleFile(filePath) {
			return (filePath && filePath.match(/\.(js|xsjs|xsjslib)$/) !== null);
		};

		this.addBreakpoint = function addBreakpoint(filePath, lineNumber) {
			var idx = _indexOfBreakpointByLocation(filePath, lineNumber);
			if (idx === -1) {
				var breakpoint = {
					enabled: true,
					filePath: filePath,
					lineNumber: lineNumber
				};
				_data.breakpoints.push(breakpoint);
				_model.setProperty("/breakpoints", _data.breakpoints);
				_fireEvent("add", breakpoint);
			} else {
				// breakpoint must not exist - be robust and fix state
				_logger.logError("addBreakpoint: Breakpoint at location [" + filePath + "].[" + lineNumber + "] already exists.");
				if (!_data.breakpoints[idx].enabled) {
					this.enableBreakpoint(filePath, lineNumber);
				}
			}
		};

		this.removeBreakpoint = function removeBreakpoint(filePath, lineNumber) {
			return _removeBreakpoint(filePath, lineNumber);
		};

		this.removeBreakpointsForFile = function removeBreakpointsForFile(filePath) {
			var breakpoints = [];
			var i;
			// first collect the breakpoints and remove later on in order to avoid concurrent change modification issues
			for (i = 0; i < _data.breakpoints.length; i++) {
				if (_data.breakpoints[i].filePath === filePath) {
					breakpoints.push(_data.breakpoints[i]);
				}
			}
			for (i = 0; i < breakpoints.length; i++) {
				_removeBreakpoint(breakpoints[i].filePath, breakpoints[i].lineNumber);
			}
		};

		this.removeAllBreakpoints = function removeAllBreakpoints() {
			var result = _data.breakpoints.length > 0;
			_data.breakpoints.length = 0;
			_model.setProperty("/", _data.breakpoints);
			return result;
		};

		this.enableBreakpoint = function enableBreakpoint(filePath, lineNumber) {
			var idx = _indexOfBreakpointByLocation(filePath, lineNumber);
			if (idx !== -1) {
				if (_data.breakpoints[idx].enabled) {
					_logger.logError("enableBreakpoint: Breakpoint at location [" + filePath + "].[" + lineNumber + "] already enabled, reapply.");
					return;
				}
				_model.setProperty("/breakpoints/" + idx + "/enabled", true);
				_fireEvent("change", _data.breakpoints[idx], {
					key: "enabled",
					value: false
				});
			} else {
				// breakpooint shall exist - be robust and fix state
				_logger.logError("enableBreakpoint: Breakpoint at location [" + filePath + "].[" + lineNumber + "] does not exist.");
				this.addBreakpoint(filePath, lineNumber);
			}
		};

		this.disableBreakpoint = function disableBreakpoint(filePath, lineNumber) {
			var idx = _indexOfBreakpointByLocation(filePath, lineNumber);
			if (idx !== -1) {
				if (!_data.breakpoints[idx].enabled) {
					_logger.logError("disableBreakpoint: Breakpoint at location [" + filePath + "].[" + lineNumber + "] already disabled, reapply.");
					return;
				}
				_model.setProperty("/breakpoints/" + idx + "/enabled", false);
				_fireEvent("change", _data.breakpoints[idx], {
					key: "enabled",
					value: true
				});
			} else {
				_logger.logError("disableBreakpoint: Breakpoint at location [" + filePath + "].[" + lineNumber + "] does not exist - skip.");
			}
		};

		this.updateBreakpointLocation = function updateBreakpointLocation(filePath, oldLineNumber, newLineNumber) {
			var idx = _indexOfBreakpointByLocation(filePath, oldLineNumber);
			if (idx !== -1) {
				_updateBreakpointLocationByIdx(idx, newLineNumber);
			}
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
			// sort in ascending or descending order in order to avoid that update operations
			// interfere with existing breakpoints, e.g. the new location of a breakpoint
			// must not clash with the location of a breakpoint that has not been updated at that
			// point in time
			breakpointLocationDiff.sort(function(a, b) {
				if (a.newValue < a.oldValue) {
					// sort in ascending order
					return a.oldValue - b.oldValue;
				} else {
					// sort in descending order
					return b.oldValue - a.oldValue;
				}
			});

			var breakpoints = this.getBreakpointsByFilePath(filePath);
			for (var i = 0; i < breakpointLocationDiff.length; i++) {
				for (var j = 0; j < breakpoints.length; j++) {
					if (breakpoints[j].lineNumber === breakpointLocationDiff[i].oldValue) {
						this.updateBreakpointLocation(filePath, breakpointLocationDiff[i].oldValue, breakpointLocationDiff[i].newValue);
						break;
					}
				}
			}
		};

		this.getAllBreakpoints = function getAllBreakpoints() {
			return _data.breakpoints;
		};

		this.getBreakpointsByFilePath = function getBreakpointsByFilePath(filePath) {
			var result = [];
			if (filePath) {
				for (var i = 0; i < _data.breakpoints.length; i++) {
					if (_data.breakpoints[i].filePath === filePath) {
						result.push(_data.breakpoints[i]);
					}
				}
			}
			return result;
		};

		this.getBreakpointByLocation = function getBreakpointByLocation(filePath, lineNumber) {
			var idx = _indexOfBreakpointByLocation(filePath, lineNumber);
			if (idx !== -1) {
				return _data.breakpoints[idx];
			}
		};

		this.indexOfBreakpointByLocation = function indexOfBreakpointByLocation(filePath, lineNumber) {
			return _indexOfBreakpointByLocation(filePath, lineNumber);
		};

		this.addBreakpointChangedListener = function addBreakpointChangedListener(listener, context) {
			if (typeof listener !== "function") {
				throw new Error("Invalid event listener: " + listener);
			}
			_listeners.push({
				context: context,
				listener: listener
			});
		};

		this.removeBreakpointChangedListener = function removeBreakpointChangedListener(listener) {
			if (typeof listener !== "function") {
				throw new Error("Invalid event listener: " + listener);
			}
			for (var i = 0; i < _listeners.length; i++) {
				if (_listeners[i] === listener) {
					_listeners.splice(i, 1);
					break;
				}
			}
		};

		this.getJsonModel = function getJsonModel() {
			return _model;
		};
	};

	return NodeJsBreakpointManager;
});
