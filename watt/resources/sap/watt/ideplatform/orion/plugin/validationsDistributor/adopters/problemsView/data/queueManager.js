define([], function () {

	var queueManager = function () {
		this.qHandleServerRequest = [];
	};

	queueManager.prototype.addRequest = function (oRequest) {
		this.qHandleServerRequest.push(oRequest);
	};

	queueManager.prototype.dequeueRequest = function () {
		if (this.qHandleServerRequest.length !== 0) {
			var oFirstRequest = this.qHandleServerRequest.shift();
			return oFirstRequest;
		}
	};

	queueManager.prototype.getSizeOfQueue = function () {
		return this.qHandleServerRequest.length;
	};

	return queueManager;
});