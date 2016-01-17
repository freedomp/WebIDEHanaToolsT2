define([], function() {
	"use strict";
	return {
		execute: function execute() {
			return this.context.service.nodeJsDebugProcessor.stepInto();
		},
		isEnabled: function isEnabled() {
			return this.context.service.nodeJsDebugProcessor.canStepInto().then(function(value) {
				return value;
			});
		}
	};
});
