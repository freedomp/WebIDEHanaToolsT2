/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

/*global requirejs, onmessage:true, importScripts, postMessage, performance, self, System */
/* exported onmessage */
(function() {
	"use strict";

	var cons = typeof console !== "undefined" ? console : undefined,
		Util = {},
		loader,
		index,
		parentPath,
		levels = ["error", "warn", "info", "log"],
		debugMode,
		maxLevel;

	debugMode = /[&?](sap-ide-debug[&=]|sap-ide-debug$)+/i.test(self.location.search);
	maxLevel = debugMode ? "log" : "error";

	Util.makeLog = function(prefix) {
		var log = function(msg, severity) {
			var e;

			if (cons) {
				severity = severity || "log";
				if (msg instanceof Error) {
					e = msg;
					msg = e.message;
					severity = "error";
				}
				if (levels.indexOf(severity) <= levels.indexOf(maxLevel)) {
					msg = prefix ? prefix + ": " + msg : msg;
					cons[severity](msg);
					if (e) {
						cons.error(e);
					}
				}
			}
		};
		return log;
	};

	var consoleLog, handler, initialSetSourceReq,
		perf = typeof performance !== "undefined" ? performance : Date;

	handler = {
		src: "",
		prefix: undefined,
		currentSchema: undefined,
		currentDB: undefined,
		parserConfig: {},
		sequences: {},

		_checkSetSequence: function(data) {
			var lastSeq = this.sequences[data.msgType];
			if (typeof lastSeq === "number" && data.sequence < lastSeq) {
				return "discarded - outdated";
			} else {
				this.sequences[data.msgType] = data.sequence;
				return undefined;
			}
		},
		_checkInitialized: function(data, callback) {
			if (typeof this._parse !== "function") {
				this._send("response", {}, data);
				callback("ignored - not yet initialized");
				return false;
			}
			return true;
		},
		_send: function(type, args, req) {
			var resp;

			function stripFunctions(result) {
				var i, keys,
					response = {};
				keys = Object.keys(result);
				for (i = 0; i < keys.length; i++) {
					if (typeof result[keys[i]] !== "function") {
						response[keys[i]] = result[keys[i]];
					}
				}
				return response;
			}

			resp = {
				msgType: type,
				data: stripFunctions(args) || {},
				sequence: req.sequence
			};
			if (req.msgType) {
				resp.reqType = req.msgType;
			}
			postMessage(resp);
		},
		setSource: function(data, callback) {
			var configChanged = false,
				args = data.args || {},
				that = this;

			if (args.parserConfig) {
				configChanged = true;
				this._makeParse(args.parserConfig);
			}
			if (this.src !== args.src ||
				this.prefix !== args.prefix ||
				this.currentSchema !== args.currentSchema ||
				this.currentDB !== args.currentDB ||
				configChanged ||
				!this.result) {
				// src has changed, build a new result
				this.src = args.src;
				this.prefix = args.prefix;
				this.currentSchema = args.currentSchema;
				this.currentDB = args.currentDB;
				// -1 forces resolve all
				this._parse(args).resolve(-1, function(result) {
					var msg = handler._checkSetSequence(data);

					if (!msg) {
						// remember result and send response only if no new request has been received meanwhile
						that.result = result;
						that._send("response", result, data);
					}
					callback(msg);
				});
			} else {
				callback("discard not changed");
			}
		},
		// resolve only, prev. setSource required
		resolve: function(data, callback) {
			var args = data.args || {},
				that = this;

			args.currentSchema = this.currentSchema;
			args.currentDB = this.currentDB;
			if (this.result) {
				this.result.resolve(args.resolvePos, function(result) {
					var msg = handler._checkSetSequence(data);

					if (!msg) {
						// send the response only if no new request has been received meanwhile
						that._send("response", result, data);
					}
					callback(msg);
				});
			} else {
				callback("parse result not available");
			}
		},
		// parse w/o resolver
		parse: function(data, callback) {
			var args = data.args || {},
				that = this;

			that._send("response", this._parse(args), data);
			callback();
		}
	};

	// captures the last setSource request until the worker is ready
	function initialOnMessage(e) {
		if (e && e.data && e.data.msgType === "setSource") {
			initialSetSourceReq = e;
		}
	}

	function onMessage(e) {
		var msg, t1, t2, cb;

		function makeCallback(data) {
			return function callback(message) {
				t2 = perf.now();
				consoleLog(data.msgType + " #" + data.sequence + " " + (message || "processed") + " in: " + (t2 - t1) + "ms\n");
			};
		}

		t1 = perf.now();
		try {
			if (typeof e.data !== "object") {
				msg = "ignored - empty";
				return;
			}

			if (typeof e.data.msgType === "string" && e.data.msgType.charAt(0) !== '_' && typeof handler[e.data.msgType] === "function") {
				msg = handler._checkSetSequence(e.data);
				if (msg) {
					return;
				}
				cb = makeCallback(e.data);
				if (handler._checkInitialized(e.data, cb)) {
					handler[e.data.msgType].call(handler, e.data, cb);
				}
			} else {
				msg = "ignored - unknown";
			}
		} catch (err) {
			consoleLog(err);
			msg = "processing error";
		} finally {
			if (msg) {
				t2 = perf.now();
				if (e.data.msgType) {
					msg = e.data.msgType + " #" + e.data.sequence + " " + msg;
				} else {
					msg = JSON.stringify(e.data, undefined, 2) + " " + msg;
				}
				consoleLog(msg + " in: " + (t2 - t1) + "ms\n");
			}
		}
	}

	consoleLog = Util.makeLog("sqlparser.worker");
	onmessage = initialOnMessage;

	importScripts(self.location.hash.substr(1));
	parentPath = self.location.pathname;
	// Firefox strangely includes hash and search in pathname in case of WebWorker
	index = parentPath.lastIndexOf("#");
	if (index > 0) {
		parentPath = parentPath.substr(0, index);
	}
	index = parentPath.lastIndexOf("?");
	if (index > 0) {
		parentPath = parentPath.substr(0, index);
	}
	// move up
	parentPath = parentPath.substr(0, parentPath.lastIndexOf("/"));
	parentPath = parentPath.substr(0, parentPath.lastIndexOf("/"));
	if (typeof System === "undefined") {
		requirejs.config({
			baseUrl: parentPath
		});
		loader = requirejs;
	} else {
		System.defaultJSExtensions = true;
		System.config({
			baseURL: parentPath
		});
		// emulate requirejs
		loader = function(names, callback) {
			var i, modules = [];

			function importFn(name) {
				return System.import(System.defaultJSExtensions ? name : name + ".js");
			}

			function loaded(module) {
				modules.push(module);
				i = i + 1;
				if (i < names.length) {
					importFn(names[i]).then(loaded);
				} else {
					callback.apply(null, modules);
				}
			}

			if (typeof names === "string") {
				names = [names];
			}
			if (!names || names.length === 0) {
				callback.apply(null, modules);
				return;
			}
			i = 0;
			importFn(names[i]).then(loaded);
		};
	}

	loader(["parser/sqlparser", "tool-support/Resolver"], function(sqlparser, Resolver) {
		var makeParse = sqlparser.makeParse,
			makeConfig = sqlparser.makeConfig,
			resolver = new Resolver(),
			resolverFn = function() {
				return resolver.resolve.apply(resolver, arguments);
			};

		handler._makeParse = function(config) {
			if (!config || typeof config !== "object") {
				config = {};
			}
			config.recover = true;
			config.resolver = resolverFn;
			this._parse = makeParse(makeConfig(config));
		};
		// start with default config
		handler._makeParse();
		onmessage = onMessage;
		handler._send("ready", {}, {
			sequence: -0x20000000000000 /* Number.MIN_SAFE_INTEGER */
		});
		if (initialSetSourceReq) {
			onMessage(initialSetSourceReq);
		}
	});
}());