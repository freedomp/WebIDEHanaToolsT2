/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

/*global define, ace, XMLHttpRequest, setTimeout */
/*eslint-disable no-constant-condition, quotes*/
define(function(require) {
	"use strict";

	var aceConfig, oop, EventEmitter, Range, AceWorkerClient, bundle, AceAdapter,
		Util = require("./Util"),
		client = require("./WorkerClient"),
		TokenTooltip = require("./TokenTooltip"),
		Completer = require("./Completer"),
		modes = {};

	function getBundle() {
		var url = "parser/messages.properties",
			request = new XMLHttpRequest();

		function createBundle(text) {
			var i, m, line, properties, lines;

			lines = text.split(/(?:^|\r\n|\r|\n)[ \t\f]*/);
			properties = {
				getText: function(key, args) {
					var txt = this[key];

					args = Array.isArray(args) ? args : [];
					if (txt) {
						return txt.replace(/\{(\d*)\}/g, function(a, b) {
							return args[parseInt(b, 10)];
						});
					} else {
						return key;
					}
				}
			};
			for (i = 0; i < lines.length; i++) {
				line = lines[i];
				// ignore empty lines
				if (line === "" || line.charAt(0) === "#" || line.charAt(0) === "!") {
					continue;
				}

				m = line.match(/(\w*)\s*=\s*(.*)/);
				if (m.length === 3) {
					properties[m[1]] = m[2];
				}
			}
			bundle = properties;
		}

		function received() {
			if (request.status === 200) {
				createBundle(request.responseText);
			}
		}

		request.onload = received;
		request.open("GET", Util.getLocation(url));
		request.setRequestHeader("Content-Type", "text/plain");
		request.send();
	}

	function extendMode(module, enableMarkers, editor, completer) {
		var snippetId, ExtendedSqlMode, extendedModeId,
			BaseSqlMode = module.Mode;

		extendedModeId = BaseSqlMode.prototype.$id + "extended";
		ExtendedSqlMode = modes[extendedModeId];

		if (!ExtendedSqlMode) {
			ExtendedSqlMode = function() {
				module.Mode.apply(this, arguments);
			};
			oop.inherits(ExtendedSqlMode, BaseSqlMode);
			oop.implement(ExtendedSqlMode.prototype, EventEmitter);

			ExtendedSqlMode.prototype.createWorker = function(session) {
				var worker = new AceWorkerClient(client);
				worker.attachToSession(session);

				if (completer) {
					worker.on("show-completions", function() {
						editor.execCommand("startAutocomplete");
					});
				}

				if (enableMarkers) {
					worker.on("annotate", function(annotations, emitter) {
						var i, msg, oldMarkers;

						oldMarkers = Object.keys(session.getMarkers(true));
						for (i = 0; i < oldMarkers.length; i++) {
							session.removeMarker(oldMarkers[i]);
						}
						if (annotations.length > 0) {
							emitter.markers = [];
						}
						for (i = 0; i < annotations.length; i++) {
							msg = annotations[i];
							msg.markerId = session.addMarker(new Range(msg.row, msg.column, msg.toRow, msg.toColumn), "error", null, true);
						}
						session.setAnnotations(annotations);
					});

					worker.on("terminate", function() {
						session.clearAnnotations();
					});
				}

				return worker;
			};

			ExtendedSqlMode.prototype.$id = extendedModeId;

			ExtendedSqlMode.prototype.setCurrentSchema = function(schema, db, parserConfig) {
				this.currentSchema = schema;
				this.currentDB = db;
				this.parserConfig = parserConfig;
				this._signal("schema-change", {
					currentSchema: schema,
					currentDB: db,
					parserConfig: parserConfig,
					data: {}
				});
			};
			modes[extendedModeId] = ExtendedSqlMode;

			snippetId = extendedModeId.replace("mode", "snippets");
			ace.define(snippetId, ["require", "exports", "module"], function(require, exports /*, module*/ ) {
				exports.snippetText =
					"snippet crtable\n\
	create table ${1:name} (\n\
		${2:<columns>}\n\
	);\n\
snippet crview\n\
	create view ${1:name} as select ${3:<columns>} from ${2:<table>};\n\
snippet col\n\
	${1:name} ${2:type} ${4:not null}\n\
snippet vcol\n\
	${1:name} varchar(${2:size}) ${4:not null}\n\
snippet ncol\n\
	${1:name} nvarchar(${2:size}) ${4:not null}\n\
snippet icol\n\
	${1:name} int ${4:not null}\n\
snippet dcol\n\
	${1:name} date ${4:not null}\n\
snippet deccol\n\
	${1:name} decimal(${2:precision}, ${3:scale}) ${5:not null}\n\
snippet addcol\n\
	alter table ${1:<table>} add (${2:column} ${3:type});\n\
snippet selfrom\n\
	select ${2:<columns>} from ${1:<table>}\n\
snippet ldtable\n\
	load table ${1:<table>} from '${2:<file_path>}' string delimited by '''' delimited by ',' skip 1;\n\
";
				exports.scope = extendedModeId.split("/").pop();
			});
		}
		return ExtendedSqlMode;
	}

	aceConfig = ace.require("ace/config");
	oop = ace.require("ace/lib/oop");
	Range = ace.require("ace/range").Range;
	EventEmitter = ace.require("ace/lib/event_emitter").EventEmitter;
	getBundle();

	AceWorkerClient = function(workerClient) {
		var that = this;
		this.$client = workerClient;
		this.changeListenerFn = function() {
			return that.changeListener.apply(that, arguments);
		};
		this.annotateFn = function() {
			return that.annotate.apply(that, arguments);
		};
		this.setSourceFn = function() {
			return that.setSource.apply(that, arguments);
		};
	};

	AceWorkerClient.prototype = {

		terminate: function() {
			this._signal("terminate", {});
			this.deltaQueue = null;
			this.session.removeEventListener("change", this.changeListenerFn);
			this.session = null;
		},

		setSource: function(cb) {
			var value = this.session.getValue(),
				mode = this.session.getMode(),
				that = this;

			this.$client.send("setSource", {
				src: value,
				prefix: mode.sqlPrefix,
				currentSchema: mode.currentSchema,
				currentDB: mode.currentDB,
				parserConfig: mode.parserConfig,
				metadataUrl: mode.metadataUrl,
				metadataUseHttpPost: mode.metadataUseHttpPost
			}, function(result) {
				if (cb) {
					cb(result);
				}
				that.annotateFn(result);
			});
		},

		annotate: function(data) {
			var i, fromPos, toPos, msg, doc, type, annotations = [];

			if (data && data.messages) {
				doc = this.session.getDocument();
				for (i = 0; i < data.messages.length; i++) {
					msg = data.messages[i];
					fromPos = doc.indexToPosition(msg.fromPos);
					toPos = doc.indexToPosition(msg.toPos);
					type = msg.type.toLowerCase();
					annotations.push({
						row: fromPos.row,
						column: fromPos.column,
						text: msg.type + ": " + bundle.getText(msg.code, msg.params),
						type: type === "semanticerror" ? "error" : type,
						toRow: toPos.row,
						toColumn: toPos.column
					});
				}
				this._signal("annotate", annotations);
			}
		},

		attachToSession: function(session) {
			if (this.session) {
				this.terminate();
			}

			this.session = session;
			this.$client.onReady(this.setSourceFn);
			session.on("change", this.changeListenerFn);
			session.getMode().on("schema-change", this.changeListenerFn);
		},

		changeListener: function(e) {
			var cmd = e.data || e,
				that = this;

			if (!this.deltaQueue) {
				this.deltaQueue = [cmd];
				setTimeout(function() {
					that.$sendDeltaQueue();
				}, 0);
			} else {
				this.deltaQueue.push(cmd);
			}
		},

		$sendDeltaQueue: function() {
			var lastCmd,
				lastLine,
				that = this,
				triggerCompleter = false,
				q = this.deltaQueue;

			if (!q) {
				return;
			}
			this.deltaQueue = null;
			lastCmd = q[q.length - 1] || {};
			if (lastCmd.action === "insert" && lastCmd.lines) {
				lastLine = lastCmd.lines[lastCmd.lines.length - 1];
			} else if (lastCmd.action === "insertText") {
				lastLine = lastCmd.text;
			}
			if (lastLine && lastLine.charAt(lastLine.length - 1) === ".") {
				triggerCompleter = true;
			}
			this.setSource(function(result) {
				if (triggerCompleter) {
					that._signal("show-completions", result);
				}
			});
		}
	};
	oop.implement(AceWorkerClient.prototype, EventEmitter);

	AceAdapter = function(el, config) {
		client.start(config);
		this.element = el || "input";
		this.conf = {};
		if (config) {
			this.configure(config);
		}
	};
	AceAdapter.prototype = {
		configure: function(args) {
			var that = this;

			if (!this.editor) {
				this.editor = ace.edit(this.element);
			}
			if (typeof args !== "object") {
				args = {};
			}

			this.editor.setTheme(args.theme || "ace/theme/monokai");
			this.editor.setOptions(args.options || {
				enableBasicAutocompletion: true,
				enableSnippets: true,
				enableLiveAutocompletion: false
			});

			if (args.enableCompleter) {
				this.completer = new Completer();
				ace.require("ace/ext/language_tools").addCompleter({
					getCompletions: function() {
						return Completer.prototype.getCompletions.apply(that.completer, arguments);
					}
				});
			}
			this.conf.enableMarkers = args.enableMarkers;
			this.conf.enableTooltip = args.enableTooltip;
			this.conf.supportsQualifiedNames = args.supportsQualifiedNames;
			this.conf.metadataUrl = args.metadataUrl;
			this.conf.metadataSearchUrl = args.metadataSearchUrl;
			this.conf.metadataUseHttpPost = args.metadataUseHttpPost;

			return this.editor;
		},
		attach: function(args) {
			var baseModeId, session,
				that = this;

			if (!args) {
				args = {};
			}
			args.currentSchema = args.currentSchema || this._currentSchema;
			args.currentDB = args.currentDB || this._currentDB;
			args.parserConfig = args.parserConfig || this._parserConfig;
			this.attachArgs = args;
			delete this._currentSchema; // no longer needed once attached
			delete this._currentDB; // no longer needed once attached
			delete this._parserConfig; // no longer needed once attached

			args.metadataUrl = args.metadataUrl || this.conf.metadataUrl;
			args.metadataSearchUrl = args.metadataSearchUrl || this.conf.metadataSearchUrl;
			args.metadataUseHttpPost = args.metadataUseHttpPost || this.conf.metadataUseHttpPost;

			baseModeId = args.mode || "ace/mode/hanasql";
			session = this.editor.getSession();
			if (this.conf.enableTooltip) {
				/* eslint-disable no-new*/
				new TokenTooltip(this.editor, client, {
					prefix: args.prefix,
					metadataUrl: args.metadataUrl,
					metadataUseHttpPost: args.metadataUseHttpPost
				});
				/* eslint-enable no-new*/
			}

			aceConfig.loadModule(["mode", baseModeId], function(module) {
				var mode, Mode;

				Mode = extendMode(module, that.conf.enableMarkers, that.editor, that.completer);
				mode = new Mode();
				mode.sqlPrefix = args.prefix;
				mode.currentSchema = args.currentSchema;
				mode.currentDB = args.currentDB;
				mode.parserConfig = args.parserConfig;
				mode.metadataUrl = args.metadataUrl;
				mode.metadataSearchUrl = args.metadataSearchUrl;
				mode.metadataUseHttpPost = args.metadataUseHttpPost;
				mode.supportsQualifiedNames = that.conf.supportsQualifiedNames;
				session.setMode(mode);
				if (that.completer) {
					that.completer.enable(mode.$id);
				}
			});
		},
		terminateWorker: function() {
			client.stop();
		},
		setCurrentSchema: function(currentSchema, currentDB, parserConfig) {
			var mode = this.editor.getSession().getMode();
			if (typeof mode.setCurrentSchema === "function") {
				mode.setCurrentSchema(currentSchema, currentDB, parserConfig);
			} else if (this.attachArgs) {
				this.attachArgs.currentSchema = currentSchema;
				this.attachArgs.currentDB = currentDB;
				this.attachArgs.parserConfig = parserConfig;
			} else {
				this._currentSchema = currentSchema;
				this._currentDB = currentDB;
				this.parserConfig = parserConfig;
			}
		}
	};

	return AceAdapter;
});