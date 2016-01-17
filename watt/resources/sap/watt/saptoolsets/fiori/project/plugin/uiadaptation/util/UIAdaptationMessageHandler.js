define(function() {

	var MessageHandler = function(displayElement, origins, target, oController) {

		// Create IE + others compatible event handler
		var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
		var eventer = window[eventMethod];
		var messageEvent = (eventMethod === "attachEvent") ? "onmessage" : "message";

		var verifyOrigin = function(origin) {
			// TODO: the following "if" is a temporary fix for local installations, as preview server redirects to random port on localhost
			if (sap.watt.getEnv("server_type") === "java" || sap.watt.getEnv("server_type") === "local_hcproxy") {
				if (jQuery.sap.startsWith(origin.toLowerCase(), this.location.protocol + "//" + this.location.hostname)) { // "http://localhost:"
					return true;
				}
				return false;
			}
			for (var i = 0; i < origins.length; i++) {
				if (jQuery.sap.startsWith(origins[i].toLowerCase(), origin.toLowerCase())) {
					return true;
				}
			}

			return false;
		};

		var handleMessage = function(e) {
			e.stopImmediatePropagation();
			e.cancelBubble = true;

			if (origins && (origins instanceof Array) && verifyOrigin(e.origin)) {
				var data = e.data;
				if (data.action && data.action === "CREATE" && data.change) {
					//saves change to workspace
					oController.createChange(data.change).done();
				} else if (data === "RTA_STOPPED") {
					oController.onClose();
				} else if (data === "ADAPT_UI") {
					oController.onSwitchToAdaptUi().done();
				} else if (data === "STOP_ADAPT_UI") {
					oController.onSwitchToPreview();
				}
			}
		};

		// Listen to message from child window
		eventer(messageEvent, handleMessage, false);

		this.postMessage = function(oMessage) {
			if (displayElement && displayElement.contentWindow) {
				displayElement.contentWindow.postMessage(oMessage, target);
			}
		};

		this.detachHandler = function() {
			if (window.removeEventListener) {
				window.removeEventListener("message", handleMessage, false);
			} else {
				window.detachEvent("onmessage", handleMessage);
			}
		};
	};

	return MessageHandler;
});