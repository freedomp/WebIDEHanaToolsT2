define([ //
"./MessageChannelMock" ], function(MessageChannelMock) {

	"use strict";

	var NodeJsDebugSessionMock = function NodeJsDebugSessionMock(mockData) {
		var that = this;

		this.id = mockData ? mockData.id : MessageChannelMock.SESSION_ID_1;
		this.name = mockData ? mockData.name : MessageChannelMock.PROJECT_PATH;
		this.channel = mockData ? mockData.channel : MessageChannelMock.SESSION_CHANNEL_1;
		this.connected = mockData ? mockData.connected : true;
		this.suspended = mockData ? mockData.suspended : false;
		this.breakpoints = mockData ? mockData.breakpoints : [];
		this.threads = mockData ? mockData.threads : [ {
			id : "0",
			suspended : false,
			stackFrames : [],
			getParent: function() {
				return that;
			}
		} ];
		this.resources = mockData ? mockData.resources : [];

		this._indexOfBreakpoint = function _indexOfBreakpoint(filePath, lineNumber) {
			for (var i = 0; i < this.breakpoints.length; i++) {
				if (this.breakpoints[i] && this.breakpoints[i].filePath === filePath && this.breakpoints[i].lineNumber === lineNumber) {
					return i;
				}
			}
		};

		this.connect = function connect() {
			this.connected = true;
			return Q.resolve();
		};

		this.disconnect = function disconnect() {
			this.connected = false;
			return Q.resolve();
		};

		this.isConnected = function isConnected() {
			return this.connected;
		};

		this.setBreakpoint = function setBreakpoint(filePath, lineNumber) {
			var breakpoint = {
				filePath : filePath,
				lineNumber : lineNumber,
				columnNumber : 0
			};
			this.breakpoints.push(breakpoint);
			return Q.resolve(breakpoint);
		};

		this.removeBreakpoint = function removeBreakpoint(filePath, lineNumber) {
			var idx = this._indexOfBreakpoint(filePath, lineNumber);
			if (idx !== -1) {
				var breakpoint = this.breakpoints[idx];
				this.breakpoints.splice(idx, 1);
				return Q.resolve(breakpoint);
			}
			return new Q();
		};

		this.enableBreakpoint = function enableBreakpoint(filePath, lineNumber) {
			var idx = this._indexOfBreakpoint(filePath, lineNumber);
			if (idx !== -1) {
				this.breakpoints[idx].enabled = true;
				return Q.resolve(this.breakpoints[idx]);
			}
			return new Q();
		};

		this.disableBreakpoint = function disableBreakpoint(filePath, lineNumber) {
			var idx = this._indexOfBreakpoint(filePath, lineNumber);
			if (idx !== -1) {
				this.breakpoints[idx].enabled = false;
				return Q.resolve(this.breakpoints[idx]);
			}
			return new Q();
		};

		this.getPropertiesForScope = function getPropertiesForScope(scope) {
			return Q.reject("Mock required for getPropertiesForScope [" + scope + "]");
		};

		this.getPropertiesForObject = function getPropertiesForObject(object, uri) {
			return Q.reject("Mock required for getPropertiesForScope [" + uri + "]");
		};
	};

	return NodeJsDebugSessionMock;
});
