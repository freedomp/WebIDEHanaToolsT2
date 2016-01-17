define(function() {
	"use strict";

	var NodeJsDebugProcessor = function NodeJsDebugProcessor() {

		this.stepOver = function stepOver() {
			return this.context.service.nodeJsDebug.getDebugController().then(function(controller) {
				if (controller) {
					controller.stepOver();
				}
			}).done();
		};

		this.stepInto = function stepInto() {
			return this.context.service.nodeJsDebug.getDebugController().then(function(controller) {
				if (controller) {
					controller.stepInto();
				}
			}).done();
		};

		this.stepOut = function stepOut() {
			return this.context.service.nodeJsDebug.getDebugController().then(function(controller) {
				if (controller) {
					controller.stepOut();
				}
			}).done();
		};

		this.suspend = function suspend() {
			return this.context.service.nodeJsDebug.getDebugController().then(function(controller) {
				if (controller) {
					controller.suspend();
				}
			}).done();
		};

		this.resume = function resume() {
			return this.context.service.nodeJsDebug.getDebugController().then(function(controller) {
				if (controller) {
					controller.resume();
				}
			}).done();
		};

		this.isConnected = function isConnected() {
			return this.context.service.nodeJsDebug.getDebugController().then(function(controller) {
				if (controller) {
					return controller.isConnected();
				}
				return false;
			});
		};

		this.canStepOver = function canStepOver() {
			return this.context.service.nodeJsDebug.getDebugController().then(function(controller) {
				if (controller) {
					return controller.isSuspended();
				}
				return false;
			});
		};
		
		this.canStepInto = function canStepInto() {
			return this.context.service.nodeJsDebug.getDebugController().then(function(controller) {
				if (controller) {
					return controller.isSuspended();
				}
				return false;
			});
		};

		this.canStepOut = function canStepOut() {
			return this.context.service.nodeJsDebug.getDebugController().then(function(controller) {
				if (controller) {
					return controller.isSuspended();
				}
				return false;
			});
		};

		this.canResume = function canResume() {
			return this.context.service.nodeJsDebug.getDebugController().then(function(controller) {
				if (controller) {
					return controller.isSuspended();
				}
				return false;
			});
		};

		this.canSuspend = function canSuspend() {
			return this.context.service.nodeJsDebug.getDebugController().then(function(controller) {
				if (controller) {
					return controller.isConnected() && !controller.isSuspended();
				}
				return false;
			});
		};
	};

	return NodeJsDebugProcessor;
});