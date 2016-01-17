/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

/*global define*/
/*eslint-disable quotes*/
define(function(require) {
	"use strict";

	var sqlparser = require("../parser/sqlparser"),
		client = require("./WorkerClient"),
		Completer,
		useHtmlTip = false,
		ParserUtils = sqlparser.Utils;

	function resolve(tok) {
		if (tok && tok.resolved) {
			return typeof tok.resolved === "boolean" ? tok : tok.resolved;
		} else {
			return tok;
		}
	}

	function getPathInTree(tokens, tree, pos) {
		var i, result, prev, next;

		if (Array.isArray(tree)) {
			for (i = 0; i < tree.length; i++) {
				result = getPathInTree(tokens, tree[i], pos);
				if (result) {
					break;
				}
			}
			return result;
		}

		if (!tree) {
			return result;
		}

		prev = tokens[(typeof tree.firstIndex === "number" ? tree.firstIndex : tree.index) - 1];
		next = tokens[(typeof tree.lastIndex === "number" ? tree.lastIndex : tree.index) + 1];
		if (pos < prev.toPos || pos > next.fromPos) {
			return result;
		}

		if (pos < tree.fromPos && tree.first) {
			// pos is supposed to be in the left branch
			result = getPathInTree(tokens, tree.first, pos);
		} else if (pos >= tree.toPos && tree.second) {
			// pos is supposed to be in the right branch
			result = getPathInTree(tokens, tree.second, pos);
		}

		if (result) {
			result.push(tree);
		} else {
			result = [tree];
		}
		return result;
	}

	function resolveColumns(tok) {
		var resolved;

		resolved = resolve(tok);
		if (resolved) {
			return resolve(resolved.columns);
		}
	}

	function quoteTok(tok) {
		if (typeof tok === "string") {
			return tok.toUpperCase() === tok ? tok : '"' + tok + '"';
		} else {
			if (tok.type === "qname") {
				return '"' + tok.identifier + '"';
			} else if (tok.type === "name") {
				return tok.identifier;
			} else {
				return tok.value;
			}
		}
	}

	function quoteName(result, tok, prevTok) {
		var prefix1, prefix0, aliasTok, prevId;

		if (!tok) {
			return "";
		}

		if (prevTok && prevTok.id === ".") {
			prevId = result.tokens[prevTok.index - 1];
			prefix1 = prevId ? prevId.identifier : undefined;
			prevId = result.tokens[prevTok.index - 2];
			prevId = prevId && prevId.id === "." ? result.tokens[prevTok.index - 3] : undefined;
			prefix0 = prevId ? prevId.identifier : undefined;
		}

		if (tok.alias) {
			aliasTok = tok.alias;
		}

		if (aliasTok) {
			if (!prefix0 && aliasTok.identifier === prefix1) {
				return "";
			} else {
				return quoteTok(aliasTok);
			}
		}

		if (tok.identifier) {
			if (prefix0) {
				if (tok.schema && tok.schema.identifier === prefix0 && tok.identifier === prefix1) {
					return "";
				}
			} else if (prefix1) {
				if (tok.schema) {
					return quoteTok(tok);
				} else if (tok.identifier === prefix1) {
					return "";
				}
			}
			return (tok.schema ? quoteTok(tok.schema) + "." : "") + quoteTok(tok);
		}
		return "";
	}

	function enc(str) {
		var map = {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			"'": "&quot;",
			"\"": "&#x27;",
			"/": "&#x2F"
		};
		if (!useHtmlTip || !str) {
			return str;
		}
		return str.replace(/&|<|>|'|"|\//gi, function(matched) {
			return map[matched];
		});
	}

	function renderTypeInfo(col) {
		var result = ": " + enc(col.dataType);
		if (col.length) {
			result += "(" + col.length + (col.scale ? ", " + col.scale : "") + ")";
		}
		return result;
	}

	function addErrorCompletion(completions, stmt) {
		if (stmt && stmt.messages) {
			completions.push({
				caption: "  --- incomplete statement has errors ---",
				snippet: "",
				score: 80
			});
		}
	}

	function addCompletionsForTables(src, mode, result, stmt, schema, callback) {
		var completions = [];
		client.searchObjects(mode.metadataSearchUrl, mode.currentDB, mode.currentSchema, ["TABLE", "VIEW"], "*", function(metadata) {
			var useSchema, obj, i = 0;

			if (!schema) {
				schema = {
					identifier: mode.currentSchema
				};
			}
			for (i = 0; i < metadata.length; i++) {
				obj = metadata[i];
				useSchema = mode.supportsQualifiedNames && obj.schema !== schema.identifier;
				completions.push({
					caption: quoteTok(obj.name) + (useSchema ? " (" + quoteTok(obj.schema) + ")" : ""),
					meta: obj.type.toLowerCase(),
					snippet: (useSchema ? quoteTok(obj.schema) + "." : "") + quoteTok(obj.name),
					score: useSchema ? 90 : 100
				});
			}
			callback(completions);
		});
	}

	function makeColumnCompletions(completions, result, tableTok, index, existing) {
		var i, qName, col, prefix, snippet, table, columns, score,
			prevTok = result.tokens[index - 1];

		existing = existing || {};

		table = resolve(tableTok);
		columns = resolveColumns(table);
		if (columns) {
			for (i = 0; i < columns.length; i++) {
				prefix = quoteName(result, tableTok, prevTok);
				qName = quoteName(result, tableTok);
				col = columns[i];
				snippet = prefix ? prefix + "." + quoteTok(col.identifier) : quoteTok(col.identifier);
				// rank existing columns lowest
				score = existing[snippet] ? 80 : 90;
				// matching prefix is ranked higher
				score += prefix ? 0 : 5;

				completions.push({
					caption: quoteTok(col.identifier) + renderTypeInfo(col) + " (" +
						(!qName && tableTok.arity === "statement" ? "--query--" : enc(qName)) + ")",
					meta: "column",
					snippet: snippet,
					score: score
				});
			}
		}

	}

	function addCompletionsForColumns(src, mode, result, stmt, index, excludeExisting, callback) {
		client.send("resolve", {
			resolvePos: stmt.fromPos,
			metadataUrl: mode.metadataUrl
		}, function(parseResult) {
			var i, keys, tok, col, prefix, snippet,
				completions = [],
				existing = {};

			if (parseResult.resolvedToken && parseResult.resolvedToken.scope) {
				if (excludeExisting && parseResult.resolvedToken.columns) {
					for (i = 0; i < parseResult.resolvedToken.columns.length; i++) {
						col = parseResult.resolvedToken.columns[i];
						if (col && col.identifier && col.table) {
							prefix = quoteName(result, col.table);
							snippet = prefix ? prefix + "." + quoteTok(col.identifier) : quoteTok(col.identifier);
							existing[snippet] = true;
						}
					}
				}

				keys = Object.getOwnPropertyNames(parseResult.resolvedToken.scope);
				for (i = 0; i < keys.length; i++) {
					tok = parseResult.resolvedToken.scope[keys[i]];
					makeColumnCompletions(completions, result, tok, index, existing);
				}
			}
			addErrorCompletion(completions, parseResult.resolvedToken);
			callback(completions);
		});
	}

	function addCompletionsForStmt(src, mode, result, stmt, pos, schema, callback) {
		var path, index, onTok,
			lastClause = stmt,
			tok = stmt;

		while (tok.id !== "(end)" && tok.id !== ";" && pos > tok.fromPos) {
			if (tok.arity === "clause" || tok.arity === "statement") {
				lastClause = tok;
			}
			tok = result.tokens[tok.index + 1];
		}
		if (tok.parent !== -1 && tok.parent !== stmt.index) {
			// substatement
			stmt = result.tokens[tok.parent];
			addCompletionsForStmt(src, mode, result, stmt, pos, schema, callback);

		} else {
			if (lastClause.id === "FROM") {
				path = getPathInTree(result.tokens, stmt.from, pos);
				if (path && path[0].id === "JOIN" && path[0].second) {
					// determine the beginning of ON
					index = typeof path[0].second.lastIndex === "number" ? path[0].second.lastIndex : path[0].second.index;
					onTok = result.tokens[index + 1];
					if (pos >= onTok.toPos) {
						addCompletionsForColumns(src, mode, result, path[0], tok.index, false, callback);
						return;
					}
				}
				addCompletionsForTables(src, mode, result, stmt, schema, callback);
			} else if (lastClause === stmt) {
				if (stmt.id === "SELECT") {
					addCompletionsForColumns(src, mode, result, stmt, tok.index, true, callback);
				} else if (stmt.kind === "table" || stmt.kind === "view") {
					addCompletionsForTables(src, mode, result, stmt, schema, callback);
				}
			} else {
				addCompletionsForColumns(src, mode, result, result.tokens[lastClause.parent], tok.index, false, callback);
			}
		}
	}

	function _getCompletions(src, mode, result, pos, callback) {
		var lastTok, i, stmt, schema;

		for (i = 0; i < result.statements.length; i++) {
			stmt = result.statements[i];
			lastTok = result.tokens[stmt.lastIndex];

			if (stmt.id === "SET" && !ParserUtils.hasErrors(stmt)) {
				if (stmt.kind === "schema" && stmt.identifier) {
					schema = {
						identifier: stmt.identifier.identifier
					};
				}
			}
			if (stmt.toPos <= pos) {
				if (i === result.statements.length - 1 || pos <= lastTok.fromPos) {
					addCompletionsForStmt(src, mode, result, stmt, pos, schema, callback);
				}
			}
		}

		return;
	}

	Completer = function(mode) {
		this.modes = [];
		if (mode) {
			this.enable(mode);
		}
	};

	Completer.prototype = {
		getCompletions: function(editor, session, pos, prefix, callback) {
			var posAsIndex, src, finish, mode;

			finish = function(results) {
				callback(null, results);
			};

			if (this.modes.indexOf(session.$modeId) >= 0) {
				src = session.getValue();
				posAsIndex = session.doc.positionToIndex(pos);
				mode = session.getMode();
				// call send the src with resolve since startAutocomplete might overtake the change listener in AceAdapter.js
				client.send("resolve", {
					src: src,
					metadataUrl: mode.metadataUrl
				}, function(parseResult) {
					_getCompletions(src, mode, parseResult, posAsIndex, finish);
				});
			}
		},
		doAutocomplete: function(editor /*, parseResult*/ ) {
			editor.execCommand("startAutocomplete");
		},
		enable: function(mode) {
			if (this.modes.indexOf(mode) < 0) {
				this.modes.push(mode);
			}
		}
	};

	return Completer;

});