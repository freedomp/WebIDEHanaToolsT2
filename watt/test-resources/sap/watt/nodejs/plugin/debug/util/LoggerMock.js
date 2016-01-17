define(function() {

	"use strict";

	var LoggerMock = function LoggerMock() {
		this.log = {
			errorExpected : false,
			isDebug : true,
			message : undefined,
			info : function info(msg, topic) {
				this.message = msg;
				window.console.log("(" + topic + ") " + msg);
				return Q();
			},
			error : function error(msg, topic) {
				this.message = msg;
				if (this.errorExpected === true) {
					//expected error
					window.console.log("(" + topic + ") " + msg);
					return Q();
				}
				window.console.error("(" + topic + ") " + msg);
				return Q.reject(msg);
			}
		};
		this.isDebug = function isDebug() {
			return this.log.isDebug;
		};
		this.logInfo = function logInfo(message) {
			this.log.info(message, ["system"]).done();
		};
		this.logError = function logError(message) {
			this.log.error(message, ["system"]).done();
		};
	};

	return LoggerMock;
});
