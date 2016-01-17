define(function() {
	"use strict";

	/**
	 * Constructor.
	 */
	var MessageQueue = function MessageQueue() {
		var _currentId = 0;
		var _requests = {};

		this.createRequest = function createRequest(method, promise) {
			return {
				id: ++_currentId,
				method: method,
				promise: promise,
				context: {}
			};
		};

		this.pushRequest = function pushRequest(method, promise) {
			var request = this.createRequest(method, promise);
			_requests[request.id] = request;
			return request;
		};

		this.getRequests = function getRequests() {
			return _requests;
		};

		this.getRequest = function getRequest(id) {
			return _requests[id];
		};

		this.removeRequest = function removeRequest(id) {
			if (_requests[id]) {
				delete _requests[id];
			}
		};
	};
	return MessageQueue;
});