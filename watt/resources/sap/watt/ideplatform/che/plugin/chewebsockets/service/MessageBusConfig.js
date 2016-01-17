define(function () {
	"use strict";

	var _shortUUID = function() {
		// generates a 5-char UUID
		return ("00000" + (Math.random() * Math.pow(36, 5) << 0).toString(36)).slice(-5);
	};

	var _clientUUID = _shortUUID();

	var _getDefaultSocketURL = function() {
		var scheme = window.location.protocol === "https:" ? "wss://" : "ws://";
		var urlBase = sap.watt.getEnv("che_server") || "/che/";
		return scheme + window.location.host + urlBase + "ws/" + _clientUUID;
	};

	var _getEnvironmentSocketURL = function() {
		var url = sap.watt.getEnv("che_websocket_url", null);
		if (url) {
			return url += _clientUUID;
		}
	};

	return {

		_ping: function(url) {
			var deferred = Q.defer();
			var timeout = null;
			try {
				var ws = new WebSocket(url);
				ws.onopen = function() {
					if (timeout) {
						clearTimeout(timeout);
						timeout = null;
					}
					ws.close();
					deferred.resolve();
				};
				ws.onclose = function(event) {
					if (timeout) {
						clearTimeout(timeout);
						timeout = null;
					}
					deferred.reject(new Error(event.code + " " + event.reason)); // closed right after opening
				};
				timeout = setTimeout(function() {
					// may happen for unresponsive servers, or local reverse proxy
					deferred.reject(new Error(url + " timed out"));
				}, 2000);
			} catch (e) {
				deferred.reject(e);
			}
			return deferred.promise;
		},

		getSettings : function() {
			var url = _getEnvironmentSocketURL() || _getDefaultSocketURL();
			return Q({ socketURL: url });
		}

	};

});
