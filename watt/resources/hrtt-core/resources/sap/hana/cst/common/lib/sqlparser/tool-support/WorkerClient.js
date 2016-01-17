/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

/*global define, performance, Worker, XMLHttpRequest */
/*eslint-disable no-constant-condition, quotes, max-depth*/
define(function(require) {
	"use strict";

	var workerUrl, worker, t0, t1, t2, exports,
		currentCallbacks, sequences, sequence, ready, readyListeners, loaderUrl,
		Util = require("./Util"),
		consoleLog = Util.makeLog("sqlparser.Client"),
		perf = typeof performance !== "undefined" ? performance : Date;

	function searchObjects(searchUrl, currentDB, currentSchema, types, searchStr, callback) {
		var query, typesStr,
			request = new XMLHttpRequest();

		function received() {
			var response, i, msg, dbobjects;

			try {
				if (typeof request.responseText === "string" && request.responseText.charAt(0) !== "<") {
					response = JSON.parse(request.responseText);
				}
				if (response && Array.isArray(response.dbobjects) && response.dbobjects.length > 0) {
					dbobjects = response.dbobjects;
					msg = "objects found for search string: " + searchStr;
					for (i = 0; i < dbobjects.length; i++) {
						msg += (i > 0 ? ", " : " ") + dbobjects[0].type + " " + (dbobjects[0].schema ? dbobjects[0].schema + "." : "") + dbobjects[0].objectName;
					}
					consoleLog(msg);
				} else {
					consoleLog("no object found for search string: " + searchStr, "warn");
				}
			} catch (e) {
				consoleLog(e);
			} finally {
				if (!dbobjects) {
					dbobjects = [];
				}
				if (callback) {
					callback(dbobjects);
				}
			}
		}

		function error() {
			consoleLog("error searching objects");
			if (callback) {
				callback();
			}

		}

		function abort() {
			consoleLog("object search aborted");
			if (callback) {
				callback();
			}
		}

		query = "?";
		query += "db=";
		query += encodeURIComponent(currentDB || "");
		query += "&schema=";
		query += encodeURIComponent(currentSchema || "");
		query += "&name=";
		query += encodeURIComponent(searchStr || "");
		query += "&type=";
		if (Array.isArray(types)) {
			typesStr = types.map(encodeURIComponent).join(",");
		}
		query += typesStr;
		request.onload = received;
		request.onerror = error;
		request.onabort = abort;
		request.open("GET", searchUrl + query);
		request.setRequestHeader("Content-Type", "application/json");
		request.send();
	}

	function readyReceived() {
		var i;

		if (!ready) {
			ready = true;
			for (i = 0; i < readyListeners.length; i++) {
				readyListeners[i]();
			}
			readyListeners = [];
		}
	}

	function onReady(listener) {
		if (ready) {
			listener();
		} else {
			readyListeners.push(listener);
		}
	}

	function startWorker() {

		worker.onmessage = function(e) {
			var tx, msg, cb, lastSequence;

			t2 = perf.now();
			tx = t1;
			try {
				if (typeof e.data !== "object") {
					msg = "ignored - empty message";
					return;
				}

				switch (e.data.msgType) {
					case "ready":
						msg = "received";
						tx = t0;
						readyReceived();
						break;
					case "response":
						lastSequence = sequences[e.data.reqType];
						if (typeof lastSequence === "number" && e.data.sequence === lastSequence) {
							msg = "received";
							cb = currentCallbacks[e.data.reqType];
							delete currentCallbacks[e.data.reqType];
							delete sequences[e.data.reqType];
							if (cb) {
								cb(e.data.data);
							} else {
								msg += " no callback";
							}
						} else {
							msg = "discarded - outdated";
						}
						break;
					default:
						msg = "ignored - unknown";
				}
			} catch (err) {
				consoleLog(err);
				msg = "processing error";
			} finally {
				consoleLog((e.data.reqType ? e.data.reqType + " - " : "") + e.data.msgType + " #" + e.data.sequence + " " + msg + " in: " + (t2 - tx) +
					"ms\n");
			}
		};
	}

	function send(command, args, callback) {
		var msg,
			lastSequence = sequences[command];

		if (currentCallbacks[command]) {
			consoleLog("discarding request " + command + " " + lastSequence);
		}
		sequence++;
		if (typeof args !== "object") {
			args = {
				src: args
			};
		}
		currentCallbacks[command] = callback;
		sequences[command] = sequence;
		t1 = perf.now();
		msg = {
			msgType: command,
			args: args,
			sequence: sequence
		};
		consoleLog("sending request " + command + " " + sequence);
		worker.postMessage(msg);
	}

	function parse(args, callback) {
		return send("parse", args, callback);
	}

	function start(config) {
		if (worker) {
			// already started
			return;
		}
		if (config && config.moduleLoaderUrl && config.moduleLoaderUrl.match(/^\/[a-zA-Z0-9-/._~/!/$&'/(/)/*/+/,;/=/:@%]+$/)) {
			loaderUrl = config.moduleLoaderUrl;
		} else {
			loaderUrl = "/sap/watt/lib/requirejs/require.js";
		}
		currentCallbacks = {};
		sequences = {};
		sequence = -0x20000000000000; // Number.MIN_SAFE_INTEGER,
		ready = false;
		readyListeners = [];
		if (Worker) {
			t0 = perf.now();
			workerUrl = Util.getLocation("tool-support/SQLParserWorker.js");
			workerUrl += (Util.isDebugMode() ? "?sap-ide-debug" : "") + "#" + loaderUrl;
			worker = new Worker(workerUrl);
			//sequence++; // first sequence number is reserved for the Ready response
			startWorker();
		} else {
			consoleLog("No Web Worker support!");
		}
	}

	function stop() {
		if (worker) {
			worker.terminate();
			worker = undefined;
			currentCallbacks = {};
			sequences = {};
			sequence = -0x20000000000000; // Number.MIN_SAFE_INTEGER,
			ready = false;
			readyListeners = undefined;
			loaderUrl = undefined;
		}
	}

	exports = {};
	exports.start = start;
	exports.stop = stop;
	exports.parse = parse;
	exports.send = send;
	exports.onReady = onReady;
	exports.searchObjects = searchObjects;
	return exports;
});