define([], function() {
	"use strict";
	return {
		execute: function execute() {
			return this.context.service.nodeJsDebugProcessor.resume();
		},
		isAvailable: function isAvailable() {
			return this.context.service.nodeJsDebugProcessor.canResume().then(function(canResume) {
				return canResume;
			});
		},
		isEnabled: function isEnabled() {
			return true;
		}
	};
});
