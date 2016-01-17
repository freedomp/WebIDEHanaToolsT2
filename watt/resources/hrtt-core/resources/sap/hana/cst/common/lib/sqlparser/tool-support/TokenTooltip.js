/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

/*global define, ace, window, setTimeout, clearTimeout */
define(function() {
	"use strict";

	var oop = ace.require("ace/lib/oop"),
		event = ace.require("ace/lib/event"),
		Range = ace.require("ace/range").Range,
		Tooltip = ace.require("ace/tooltip").Tooltip,
		DefaultRenderer;

	function encode(str) {
		var map = {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			"'": "&quot;",
			"\"": "&#x27;",
			"/": "&#x2F;"
		};
		if (!str) {
			return str;
		}
		return str.replace(/&|<|>|'|"|\//gi, function(matched) {
			return map[matched];
		});
	}

	DefaultRenderer = function() {};

	DefaultRenderer.prototype = {

		resolve: function(tok) {
			if (tok && tok.resolved) {
				return typeof tok.resolved === "boolean" ? tok : tok.resolved;
			} else {
				return undefined;
			}
		},

		encode: function(str) {
			return encode(str);
		},

		renderDataType: function(col) {
			var result = "";

			col = this.resolve(col);
			if (col && col.dataType) {
				if (col.dataType.schema) {
					result += this.encode(col.dataType.schema.identifier || col.dataType.schema) + ".";
				}
				result += this.encode(col.dataType.identifier || col.dataType);
				if (col.length) {
					result += "(" + col.length + (col.scale ? ", " + col.scale : "") + ")";
				}
			}
			return result;
		},

		renderColumns: function(cols, kind) {
			var i, result = "",
				tmpl = "<tr><td>{0}</td><td>{1}</td><td>{2}</td></tr>";
			cols = this.resolve(cols);
			if (Array.isArray(cols)) {
				for (i = 0; i < cols.length; i++) {
					var rst;
					if (kind === "parameter") {
						rst = tmpl.replace('{0}', this.encode(cols[i].identifier)).replace('{1}', cols[i].parameterType).replace('{2}', this.renderDataType(
							cols[i]));
					} else {
						rst = tmpl.replace('{0}', this.encode(cols[i].identifier)).replace('{1}', this.renderDataType(cols[i])).replace('{2}', this.encode(
							cols[i].description ||
							''));
					}
					result += rst;
				}
			}
			return result || "<tr><td colspan=3> NO " + kind.toUpperCase() + "</td></tr>";
		},

		renderMainType: function(dbObj) {
			var result = "";
			if (dbObj && dbObj.mainType) {
				result += dbObj.mainType.charAt(0) + dbObj.mainType.substr(1).toLowerCase();
			}
			if (dbObj && dbObj.subType) {
				result += dbObj.subType.charAt(0) + dbObj.subType.substr(1).toLowerCase();
			}
			return this.encode(result);
		},

		renderToken: function(token, parent) {
			var dbObj,
				columns,
				resolvedTok,
				objDetails = "",
				tokenText = "",
				tmplColTbl = "<table class='columns'><tr><th>Column Name</th><th>Data Type</th><th>Comment</th></tr>{1}</table>",
				tmplProcFunc = "<table class='parameters'><tr><th>Parameter Name</th><th>Parameter Type</th><th>Data Type</th></tr>{1}</table>";

			resolvedTok = this.resolve(token);
			if (resolvedTok && resolvedTok.mainType) {
				dbObj = resolvedTok;
			}

			tokenText += '<div class="sqlparser-tokentooltip">';
			if (token.kind === "column") {
				dbObj = this.resolve(token.table);
				if (dbObj) {
					tokenText += "<strong>Column: </strong>";
					tokenText += this.encode(token.value) + "<br/>";
				}
				if (dbObj && dbObj.arity === "statement") {
					dbObj = "sub query";
				}
				if (Array.isArray(resolvedTok)) {
					objDetails += tmplColTbl.replace('{1}', this.renderColumns(resolvedTok, "column"));
				} else if (typeof resolvedTok === "object") {
					objDetails += "<strong>Data Type: </strong>" + this.renderDataType(resolvedTok) + "<br/>";
				}
			}

			if ((token.kind === "table" || token.kind === "view" || token.kind === "tableType") && resolvedTok) {
				objDetails += tmplColTbl.replace('{1}', this.renderColumns(resolvedTok.columns, "column"));
			}

			if ((token.kind === "procedure" || token.kind === "function" || token.kind === "tableFunction") && resolvedTok) {
				if (resolvedTok.parameters) {
					resolvedTok.parameters.resolved = true;
				}
				objDetails += tmplProcFunc.replace('{1}', this.renderColumns(resolvedTok.parameters, "parameter"));
			}

			if (token.id === "SELECT" || (token.arity === "statement" && token.id === "WITH")) {
				if (!Array.isArray(token.columns)) {
					if (parent && parent.id === "WITH") {
						columns = parent.columns;
					}
				} else {
					columns = token.columns;
				}
				objDetails += tmplColTbl.replace('{1}', this.renderColumns(this.resolve(columns), "column"));
			}

			if (dbObj) {
				if (dbObj.mainType) {
					tokenText += "<strong>" + this.renderMainType(dbObj) + ": </strong>";
				}
				if (dbObj.schema) {
					tokenText += this.encode(dbObj.schema.identifier || dbObj.schema) + ".";
				}
				tokenText += this.encode(dbObj.identifier || dbObj) + "<br/>";
			} else {
				if (token.arity !== "statement" && token.kind) {
					tokenText += "<strong>" + token.kind.charAt(0).toUpperCase() + token.kind.substr(1) + ": </strong>";
				}
				tokenText += this.encode(token.value) + "<br/>";
			}

			if (resolvedTok && resolvedTok.description) {
				tokenText += "<strong>Description: </strong><em>" + this.encode(resolvedTok.description) + "</em><br/>";
			}

			if (objDetails) {
				tokenText += objDetails;
			}
			tokenText += "</div>";
			return tokenText;
		}
	};

	function TokenTooltip(editor, client, config) {
		var that;

		this.editor = editor;
		this.workerClient = client;
		this.config = config || {};
		this.renderer = new DefaultRenderer();
		if (typeof config.createTokenTooltipRenderer === "function") {
			this.renderer = config.createTokenTooltipRenderer(this.renderer);
		}

		if (editor.tokenTooltip && typeof editor.tokenTooltip.destroy === "function") {
			editor.tokenTooltip.destroy();
		}
		Tooltip.call(this, editor.container);
		editor.tokenTooltip = that = this;

		this.update = this.update.bind(this);
		this.onMouseMove = this.onMouseMove.bind(this);
		this.onMouseOut = this.onMouseOut.bind(this);
		event.addListener(editor.renderer.scroller, "mousemove", this.onMouseMove);
		event.addListener(editor.renderer.content, "mouseout", this.onMouseOut);
		this.destroyFn = function() {
			that.destroy();
		};
		editor.on("changeSession", this.destroyFn);
	}

	oop.inherits(TokenTooltip, Tooltip);

	(function() {
		this.token = {};
		this.range = new Range();

		this.update = function(ctrlKey) {
			var r, canvasPos, offset, row, col, screenPos, session, docPos, docIndex, text,
				that = this;

			function getAnnotationText() {
				var annotations, markers, annotation, marker, i,
					annotationText = "";

				annotations = session.getAnnotations();
				markers = session.getMarkers(true);
				for (i = 0; i < annotations.length; i++) {
					annotation = annotations[i];
					marker = markers[annotation.markerId];
					if (marker && marker.range.insideStart(docPos.row, docPos.column)) {
						if (annotation.html) {
							annotationText += annotation.html;
						} else {
							annotationText += encode(annotation.text) + "\n";
						}
					}
				}
				return annotationText;
			}

			function resolved(data) {
				var token, tokenText, tokStart;

				token = data.resolvedToken;
				if (!token) {
					if (data.indexOfRequestedToken < 0) {
						session.removeMarker(that.marker);
						that.hide();
						return;
					} else {
						token = {
							value: "unresolved token",
							fromPos: -1,
							toPos: -1
						};
						tokenText = token.value;
					}
				} else {
					tokenText = that.renderer.renderToken(token, data.tokens[token.parent]);
				}

				if (that.tokenText !== tokenText) {
					that.setHtml(tokenText);
					that.width = that.getWidth();
					that.height = that.getHeight();
					that.tokenText = tokenText;
				}

				that.show(null, that.x, that.y);

				that.token = token;
				session.removeMarker(that.marker);
				tokStart = session.doc.indexToPosition(token.fromPos);
				that.range = new Range(tokStart.row, tokStart.column, tokStart.row, tokStart.column + token.toPos - token.fromPos);
				that.marker = session.addMarker(that.range, "ace_bracket", "text");
			}

			this.$timer = null;
			r = this.editor.renderer;
			if (this.lastT - (r.timeStamp || 0) > 1000) {
				r.rect = null;
				r.timeStamp = this.lastT;
				this.maxHeight = window.innerHeight;
				this.maxWidth = window.innerWidth;
			}

			canvasPos = r.rect || (r.rect = r.scroller.getBoundingClientRect());
			offset = (this.x + r.scrollLeft - canvasPos.left - r.$padding) / r.characterWidth;
			row = Math.floor((this.y + r.scrollTop - canvasPos.top) / r.lineHeight);
			col = Math.round(offset);

			screenPos = {
				row: row,
				column: col,
				side: offset - col > 0 ? 1 : -1
			};
			session = this.editor.session;
			docPos = session.screenToDocumentPosition(screenPos.row, screenPos.column);
			docIndex = session.doc.positionToIndex(docPos);

			var line = session.getLine(docPos.row);
			if (!line || line.length <= docPos.column) {
				session.removeMarker(that.marker);
				that.hide();
				return;
			}

			if (!ctrlKey) {
				text = getAnnotationText();
				if (text) {
					if (!that.isAnnotation || that.tokenText !== text) {
						that.setHtml(text);
						that.width = that.getWidth();
						that.height = that.getHeight();
						that.tokenText = text;
					}
					that.show(null, that.x, that.y);
					return;
				}
			}

			if (this.config.useCtrlKey && !ctrlKey) {
				session.removeMarker(that.marker);
				that.hide();
				return;
			}

			this.workerClient.send("resolve", {
				src: session.getValue(),
				prefix: this.config.prefix,
				metadataUrl: this.config.metadataUrl,
				resolvePos: docIndex
			}, resolved);
		};

		this.onMouseMove = function(e) {
			var that = this;

			this.x = e.clientX;
			this.y = e.clientY;
			if (this.isOpen) {
				this.lastT = e.timeStamp;
				this.setPosition(this.x, this.y);
			}
			if (!this.$timer) {
				this.$timer = setTimeout(function() {
					that.update(e.ctrlKey);
				}, 100);
			}
		};

		this.onMouseOut = function(e) {
			if (e && e.currentTarget.contains(e.relatedTarget)) {
				return;
			}
			this.hide();
			this.editor.session.removeMarker(this.marker);
			this.$timer = clearTimeout(this.$timer);
		};

		this.setPosition = function(x, y) {
			if (x + 10 + this.width > this.maxWidth) {
				x = Math.max(window.innerWidth - this.width - 10, 0);
			}
			if (y > window.innerHeight * 0.75 || y + 20 + this.height > this.maxHeight) {
				y = Math.max(y - this.height - 30, 0);
			}

			Tooltip.prototype.setPosition.call(this, x + 10, y + 20);
		};

		this.destroy = function() {
			this.onMouseOut();
			event.removeListener(this.editor.renderer.scroller, "mousemove", this.onMouseMove);
			event.removeListener(this.editor.renderer.content, "mouseout", this.onMouseOut);
			this.editor.off("changeSession", this.destroyFn);
			if (this.editor.tokenTooltip === this) {
				this.editor.tokenTooltip = null;
			}
		};

	}.call(TokenTooltip.prototype));

	return TokenTooltip;

});