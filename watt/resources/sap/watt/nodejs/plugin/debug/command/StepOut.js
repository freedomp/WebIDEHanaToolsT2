define([], function() {
	"use strict";
	return {
		execute: function execute() {
			return this.context.service.nodeJsDebugProcessor.stepOut();
		},
		isEnabled: function isEnabled() {
			return this.context.service.nodeJsDebugProcessor.canStepOut().then(function(value) {
				return value;
			});
		}
	};
});
