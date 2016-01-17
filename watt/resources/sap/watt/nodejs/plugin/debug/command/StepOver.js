define([], function() {
	"use strict";
	return {
		execute: function execute() {
			return this.context.service.nodeJsDebugProcessor.stepOver();
		},
		isEnabled: function isEnabled() {
			return this.context.service.nodeJsDebugProcessor.canStepOver().then(function(value) {
				return value;
			});
		}
	};
});
