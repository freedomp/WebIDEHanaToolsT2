define([], function() {
	"use strict";
	return {
		execute: function execute() {
			return this.context.service.nodeJsDebugProcessor.suspend();
		},
		isAvailable: function isAvailable() {
			return Q.spread([
		                 this.context.service.nodeJsDebugProcessor.isConnected(),
		                 this.context.service.nodeJsDebugProcessor.canResume()], function(isConnected, canResume) {
				return isConnected && !canResume;
			});
		},
		isEnabled: function isEnabled() {
			return this.context.service.nodeJsDebugProcessor.canSuspend().then(function(canSuspend) {
				return canSuspend;
			});
		}
	};
});