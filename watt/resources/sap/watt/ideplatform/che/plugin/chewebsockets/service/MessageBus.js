define(["./MessageChannel"], function(MessageChannel) {
	"use strict";

	var instance = null;

	var WS_STATE_OPEN = 1;

	// The time to wait for a new websocket connection. Be generous here to honor network latency.
	var WS_OPEN_TIMEOUT = 10 * 1000; // ms

	var MessageBus = function() {
		if (!instance) {
			instance = this;
			instance._log = null;
			instance._config = null;
			instance._socket = null;
			instance._messageChannelsForName = {};
		}
		return instance;
	};

	MessageBus.prototype._logInfo = function(message) {
		this._log.info("MessageBus", message, ["system"]).done();
	};

	MessageBus.prototype._logError = function(message) {
		this._log.error("MessageBus", message, ["system"]).done();
	};

	MessageBus.prototype._isSocketOpen = function(socket) {
		return socket !== null && socket.readyState === WS_STATE_OPEN;
	};

	MessageBus.prototype._createWebsocket = function(url, onMessage) {
		var that = this;
		try {
			var deferredOnOpen = Q.defer();
			var timeout = null;
			var ws = new WebSocket(url);
			ws.onopen = function() {
				if (timeout) {
					clearTimeout(timeout);
					timeout = null;
				}
				that._logInfo("WebSocket '" + url + "' opened");
				deferredOnOpen.resolve(ws);
			};
			ws.onclose = function(event) {
				if (timeout) {
					clearTimeout(timeout);
					timeout = null;
				}
				if (!deferredOnOpen.promise.isFulfilled()) { // closed right after opening
					var message = that.context.i18n.getText(
								"socketNotAvailable_withReason", [url, (event.code + " " + event.reason)]);
					that._logError(message);
					deferredOnOpen.reject(new Error(message));
				} else {
					that._logInfo("WebSocket '" + url + "' closed: " + event.code + " " + event.reason);
					that.context.event.fireConnectionClosed({
						code: event.code,
						reason: event.reason
					}).done();
				}
			};
			ws.onmessage = function(message) {
				that._logInfo("<<< " + message.data);
				onMessage.call(that, message);
			};
			timeout = setTimeout(function() {
				// may happen for unresponsive servers, or local reverse proxy
				var message = that.context.i18n.getText("socketNotAvailable", [url]);
				that._logError(message);
				deferredOnOpen.reject(new Error(message));
				that._socket = null;
			}, WS_OPEN_TIMEOUT);
			this._socket = ws;
			return deferredOnOpen.promise;
		} catch (e) {
			this._logError(e);
			return Q.reject(e);
		}
	};

	MessageBus.prototype._parseResponseBody = function(body) {
		if (!body) {
			return {};
		}
		if (typeof (body) === "string") {
			try {
				return JSON.parse(body);
			} catch (e) { // SyntaxError, not a JSON object
			}
		}
		return body;
	};

	MessageBus.prototype._handleMessage = function(message) {
		var messageHandled = false;
		var data = JSON.parse(message.data);
		var payload = this._parseResponseBody(data.body);
		if (data.uuid) {
			for (var key in this._messageChannelsForName) {
				if (this._messageChannelsForName.hasOwnProperty(key)) {
					var channel = this._messageChannelsForName[key];
					if (channel._onResponse.call(channel, data, payload)) {
						messageHandled = true;
						break;
					}
				}
			}
		}

		if (Array.isArray(data.headers)) {
			for (var i = 0; i < data.headers.length; i++) {
				if (data.headers[i].name === "x-everrest-websocket-channel") {
					var channelName = data.headers[i].value;
					var channel = this._messageChannelsForName[channelName];
					if (channel) {
						channel._onChannelMessage.call(channel, payload);
						messageHandled = true;
						break;
					}
				}
			}
		}

		if (!messageHandled) {
			this._logError("No channel among " + Object.keys(this._messageChannelsForName) + " handled message: " + message.data);
		}
	};

	MessageBus.prototype._maybeWithSocket = function() {
		if (this._isSocketOpen(this._socket)) {
			return Q.resolve(this._socket);
		}
		return Q.resolve();
	};

	MessageBus.prototype._withOpenSocket = function() {
		if (this._isSocketOpen(this._socket)) {
			return Q.resolve(this._socket);
		}

		var that = this;
		return this.config.getSettings().then(function(settings) {
			var url = settings.socketURL;
			return that._createWebsocket(url, that._handleMessage);
		});
	};

	MessageBus.prototype._hardClose = function(code, reason) {
		if (this._socket !== null) {
			this._socket.close(code, reason);
			this._socket = null;
		}
	};

	MessageBus.prototype.init = function() {
		instance._log = this.context.service.log;
		instance.config = this.context.service.messageBus.config;
	};

	MessageBus.prototype.onSettingsChanged = function(event) {
		if (event.params.newValue.socketURL !== event.params.oldValue.socketURL) {
			this._hardClose(1000, "Preference change");
		}
	};

	MessageBus.prototype.newChannel = function(channelName, onMessage) {
		var channel = new MessageChannel(channelName, onMessage, this);
		this._messageChannelsForName[channelName] = channel;
		return Q.resolve(channel);
	};

	MessageBus.prototype._unregisterChannel = function(channelName) {
		delete this._messageChannelsForName[channelName];
	};

	MessageBus.prototype._isKnownChannel = function(channelName) {
		return !!this._messageChannelsForName[channelName];
	};

	return MessageBus;


});
