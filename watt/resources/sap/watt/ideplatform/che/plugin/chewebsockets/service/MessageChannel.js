define(function() {
	"use strict";

	var MessageChannel = function(channelName, onMessage, messageBus) {
		if (!channelName) {
			return Q.reject("Invalid channel: " + channelName);
		}
		if (typeof (onMessage) !== "function") {
			return Q.reject("Invalid message callback: " + onMessage);
		}

		// const state
		this._channelName = channelName;
		this._onMessage = onMessage;
		this._messageBus = messageBus;

		// changing state
		this._promisesByMessageUUID = {};
		this._clientContextForMessageUUID = {};
	};

	MessageChannel.prototype._newUUID = function() {
		return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
			var r = Math.random() * 16 | 0,
				v = c === "x" ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	};

	MessageChannel.prototype._buildSubscriptionMessage = function(channelName, messageType) {
		return {
			body: JSON.stringify({
				channel: channelName
			}),
			headers: [{
				name: "x-everrest-websocket-message-type",
				value: messageType
			}],
			method: "POST",
			uuid: this._newUUID()
		};
	};

	MessageChannel.prototype._buildMessage = function(endpoint, body) {
		return {
			path: endpoint,
			body: (typeof (body) === "string") ? body : JSON.stringify(body),
			headers: [{
				name: "Content-type",
				value: "application/json"
			}],
			method: "POST",
			uuid: this._newUUID()
		};
	};

	MessageChannel.prototype._send = function(object, socket) {
		var message = JSON.stringify(object);
		this._messageBus._logInfo(">>> " + message);
		socket.send(message);
	};

	MessageChannel.prototype._onChannelMessage = function(payload) {
		this._onMessage.call(this, payload);
	};

	MessageChannel.prototype._isErrorResponse = function(data) {
		if (Array.isArray(data.headers)) {
			for (var i = 0; i < data.headers.length; i++) {
				var header = data.headers[i];
				if (header.name === "JAXRS-Body-Provided" && header.value === "Error-Message") {
					return true;
				}
			}
		}
		return false;
	};

	MessageChannel.prototype._onResponse = function(data, payload) {
		var promise = this._promisesByMessageUUID[data.uuid];
		if (promise) {
			delete this._promisesByMessageUUID[data.uuid];
			if (this._isErrorResponse(data)) {
				promise.reject(payload);
			} else {
				promise.resolve(payload);
			}
			return true;
		}
		else if (this._clientContextForMessageUUID[data.uuid]) {
			var context = this._clientContextForMessageUUID[data.uuid];
			if (this._isErrorResponse(data)) {
				this._onMessage.call(this, null, new Error(payload), context);
			} else {
				this._onMessage.call(this, payload, null, context);
			}
			return true;
		}
		return false; // wasn't for this channel
	};

	MessageChannel.prototype.subscribe = function() {
		var that = this;

		return this._messageBus._withOpenSocket().then(function(socket) {
			var deferred = Q.defer();

			var message = that._buildSubscriptionMessage(that._channelName, "subscribe-channel");
			that._promisesByMessageUUID[message.uuid] = deferred;
			that._clientContextForMessageUUID[message.uuid] = {};

			that._send(message, socket);

			return deferred.promise;
		});
	};

	MessageChannel.prototype.unsubscribe = function() {
		var channel = this;

		// To save server resources, we try to transfer the unsubscription message,
		// unless this means opening up a new socket.
		return this._messageBus._maybeWithSocket().then(function(maybeSocket) {
			if (maybeSocket) { // socket still open
				var deferred = Q.defer();

				var message = channel._buildSubscriptionMessage(channel._channelName, "unsubscribe-channel");
				channel._promisesByMessageUUID[message.uuid] = deferred;

				channel._send(message, maybeSocket);

				return deferred.promise["finally"](function() {
					// Don't unregister ourselves before the server responded: there may be
					// other requests still in the queue that clients expect to be delivered.
					channel._unregister();
				});
			} else {
				// socket gone already, unregister right away
				channel._unregister();
				return Q.resolve();
			}
		});
	};

	MessageChannel.prototype._unregister = function() {
		this._messageBus._unregisterChannel(this._channelName);
		this._clientContextForMessageUUID = {};
		this._promisesByMessageUUID = {};
	};

	MessageChannel.prototype.post = function(endpoint, payload, context) {
		var that = this;
		if (typeof (endpoint) !== "string" || endpoint.indexOf("/") !== 0) {
			return Q.reject("Invalid endpoint: " + endpoint);
		}
		if (!this._messageBus._isKnownChannel(this._channelName)) {
			return Q.reject("Unknown channel: " + this._channelName);
		}
		return this._messageBus._withOpenSocket().then(function(socket) {
			var deferred = Q.defer();
			var message = that._buildMessage(endpoint, payload);
			that._promisesByMessageUUID[message.uuid] = deferred;
			that._clientContextForMessageUUID[message.uuid] = context || {};

			that._send(message, socket);

			return deferred.promise;
		});
	};

	MessageChannel.prototype.getName = function() {
		return this._channelName;
	};

	return MessageChannel;

});
