define(function() {

	var MessageHandler = function(displayElement, origins, target, oHandlers, context) {

		// Create IE + others compatible event handler
		var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
		var eventer = window[eventMethod];
		var messageEvent = (eventMethod === "attachEvent") ? "onmessage" : "message";
		var oContext = context;
		var handleMessage = function(e) {

			if (origins && (origins instanceof Array) && verifyOrigin(e.origin)) {
				var data = e.data;

				if (jQuery.sap.startsWith(data, "HOVER_")) {
					var value = data.replace("HOVER_", "");
					var parts = value.split(";");
					var viewId = parts[0];
					var controlId = parts[1];

					// manually select the relevant node, as we only have it's ID
					oHandlers.hover(viewId, controlId, "view");

				} else if (jQuery.sap.startsWith(data, "ELEMENT_")) {
					var value = data.replace("ELEMENT_", "");
					var parts = value.split(";");
					var viewId = parts[0];
					var controlId = parts[1];

					// manually select the relevant node, as we only have it's ID
					oHandlers.select(viewId, controlId, "view");

				} else if (jQuery.sap.startsWith(data, "CLEAR_TREE")) {
					oHandlers.clear();
				} else if (jQuery.sap.startsWith(data, "CONTEXT_MENU")) {
					oHandlers.clear();
					var value = data.replace("CONTEXT_MENU_", "");
					var parts = value.split(";");
					var viewId = parts[0];
					var controlId = parts[1];
					var pageX = parts[2];
					var pageY = parts[3];

					// add the relative location of the display element in the window to the click coordinates
					var clientRect = displayElement.getBoundingClientRect();
					pageX = parseInt(pageX, 10) + clientRect.left;
					pageY = parseInt(pageY, 10) + clientRect.top;

					// account for the Extensibility Pane offset (CSS and the like)
					var extOffset = $('#ExtensionPreviewContainer-content').offset();
					pageX = pageX + extOffset.left;
					pageY = pageY + extOffset.top;

					// manually select the relevant node, as we only have it's ID
					oHandlers.select(viewId, controlId, "view");
					oHandlers.contextMenu(pageX, pageY);

					//var coordinates = {};
					//coordinates.pageX = pageX;
					//coordinates.pageY = pageY;

				} else if (jQuery.sap.startsWith(data, "LOCK_UI")) {
					// toggle the button and mark the application UI, deselect node in outline
					oHandlers.clear();
					if (displayElement && displayElement.contentWindow) {
						displayElement.contentWindow.postMessage("LOCK_UI", target);
						oContext.service.usagemonitoring.report("extensibility", "switch_mode","switch_to_extensibility_mode").done();
					}
				} else if (jQuery.sap.startsWith(data, "UNLOCK_UI")) {
					// toggle the button and mark the application UI, deselect node in outline
					oHandlers.clear();
					if (displayElement && displayElement.contentWindow) {
						displayElement.contentWindow.postMessage("UNLOCK_UI", target);
						oContext.service.usagemonitoring.report("extensibility", "switch_mode","switch_to_preview_mode").done();

					}
				}
			}
		};

		// Listen to message from child window
		eventer(messageEvent, handleMessage, false);

		this.sendMessage = function(operation, viewId, controlId) {
			if (!controlId) {
				controlId = "";
			}

			if (displayElement && displayElement.contentWindow) {
				displayElement.contentWindow.postMessage(operation + viewId + ";" + controlId, target);
			}
		};

		this.detachHandler = function() {
			if (window.removeEventListener) {
				window.removeEventListener("message", handleMessage, false);
			} else {
				window.detachEvent("onmessage", handleMessage);
			}
		};

		var verifyOrigin = function(origin) {
			// TODO: the following "if" is a temporary fix for local installations, as preview server redirects to random port on localhost
			if (sap.watt.getEnv("server_type") === "java" || sap.watt.getEnv("server_type") === "local_hcproxy") {
				if (jQuery.sap.startsWith(origin.toLowerCase(), this.location.protocol + "//" + this.location.hostname)) {// "http://localhost:"
					return true;
				}
				return false;
			}
			for ( var i = 0; i < origins.length; i++) {
				if (jQuery.sap.startsWith(origins[i].toLowerCase(), origin.toLowerCase())) {
					return true;
				}
			}

			return false;
		};
	};

	return MessageHandler;
});