/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

/**
 * SQL parser core
 *
 * Main principles of the parser are derived from the paper on "Top Down Operator Precedence"
 * by Douglas Crockford:
 *
 */
/*eslint-disable no-constant-condition, quotes, max-statements, max-depth, complexity*/
/*global define*/
/*jshint white: false */
define(function(require) {
	"use strict";

	var defaultConfig, init, msgPrototype, Parser, Result,
		tokenize = require("./tokens"),
		Utils = require("./parserutils"),
		Functions = require("./functions"),
		DataTypes = require("./types"),
		expandable = {
			"table": true,
			"tableType": true,
			"procedure": true,
			"function": true,
			"tableFunction": true
		},
		scopePrefixMap = {
			"table": "(T)",
			"tableType": "(T)",
			"procedure": "(P)",
			"function": "(F)",
			"tableFunction": "(T)",
			"view": "(T)"
		};

	defaultConfig = {
		messages: true,
		recover: false
	};

	msgPrototype = {
		toString: function() {
			var i, formatted = this.code;

			if (this.params) {
				for (i = 0; i < this.params.length; i++) {
					formatted += " " + i + ":" + Parser.artifact(this.params[i]);
				}
			}
			formatted = this.type + ": (" + this.fromPos + "," + this.toPos + ") " + formatted;
			return formatted;
		}
	};

	function quote(str) {
		str = typeof str === "string" ? str : str.identifier;
		return '"' + str + '"';
	}

	/*
	 * concatenates token values to calculate the implicit alias name for expressions
	 */
	function appendTokenValue(sourceTok, targetTok) {
		if (targetTok) {
			if (sourceTok.identifier) {
				targetTok.value += sourceTok.identifier;
			} else if (sourceTok.type === "variable") {
				targetTok.value += sourceTok.value.toUpperCase();
			} else if (sourceTok.type === "name") {
				targetTok.value += sourceTok.value.toUpperCase();
			} else if (sourceTok.type === "literal" && isNaN(sourceTok.number)) {
				targetTok.value += "'" + sourceTok.value + "'";
			} else {
				targetTok.value += sourceTok.value;
			}
			targetTok.toPos = sourceTok.toPos;
			if (targetTok.fromPos < 0) {
				targetTok.fromPos = sourceTok.fromPos;
			}
		}
	}

	/*
	 *
	 */
	function mergeConfig(target, source) {
		var keys, key, i, value;

		if (typeof source === "object") {
			keys = Object.keys(source);
			for (i = 0; i < keys.length; i++) {
				key = keys[i];
				value = source[key];
				target[key] = value;
			}
		}
	}

	/*
	 * Promise like object returned by advanceCase
	 */
	Result = function(parser, success, value) {
		this.parser = parser;
		this.success = success;
		this.value = value;
	};
	Result.prototype = {
		then: function(fn) {
			if (this.success && typeof fn === "function") {
				fn.call(this.parser, this.value);
			}
			return this;
		},
		"else": function(fn) {
			if (!this.success && typeof fn === "function") {
				fn.call(this.parser);
			}
			return this;
		}
	};

	/*
	 * Creates a new parser using the modules specified and based on the given config.
	 */
	Parser = function(modules, config) {
		var i;

		if (!config) {
			config = Parser.makeConfig();
		}
		this.config = config;
		this.callbacks = [];

		// contains reserved names and separators like ';' or ','
		this.reservedSymbolTable = Object.create(null);
		// contains special symbols like '(end)', '(name)'
		this.specialSymbolTable = this.symbolTable = Object.create(this.reservedSymbolTable);
		// contains operators '+', 'AND', logical operators are not reserved names in SQL
		this.operatorSymbolTable = Object.create(this.specialSymbolTable);
		this.logicalOperatorSymbolTable = Object.create(this.operatorSymbolTable);
		// most statements are not reserved names
		this.stmtSymbolTable = Object.create(this.specialSymbolTable);

		init(this);
		if (Array.isArray(modules)) {
			for (i = 0; i < modules.length; i++) {
				modules[i].init(this);
			}
		}
	};

	/*
	 * Returns either value or number depending on the token id.
	 */
	Parser.artifact = function(tok) {
		if (typeof tok !== "object") {
			return tok;
		}
		if (tok.id === '(number)') {
			return tok.number;
		}
		if (tok.identifier) {
			return tok.identifier.identifier || tok.identifier;
		}
		return tok.value;
	};

	/*
	 * Creates a unique ID for the given token to be used in global scope.
	 */
	Parser.makeGlobalID = function(tok, currentSchema) {
		var prefix = scopePrefixMap[tok.kind] || "";
		return Parser.makeID(tok, undefined, prefix, currentSchema);
	};

	/*
	 * Creates a unique ID for the given token to be used in scope.
	 */
	Parser.makeID = function(tok, alias, prefix, currentSchema) {
		var schema, database;

		// DDL statement
		if (typeof tok.identifier === "object") {
			tok = tok.identifier;
		}

		prefix = prefix || "";
		// alias
		if (alias) {
			return quote(alias);
		}
		// subquery
		if (tok.arity === "statement") {
			return "$" + tok.fromPos;
		}
		// database
		if (tok.kind === "database") {
			return "%" + quote(tok);
		}
		// schema
		if (tok.kind === "schema") {
			database = tok.database && typeof tok.database.identifier !== "undefined" ? tok.database.identifier : tok.database;
			return "." + (database ? quote(database) + "." : "") + quote(tok);
		}
		// variable
		if (tok.kind === "variable") {
			return ":" + quote(tok);
		}
		// DB object
		schema = typeof tok.schema !== "undefined" ? tok.schema : currentSchema;
		database = schema && typeof schema.database !== "undefined" ? schema.database : database;
		database = database && typeof database.identifier !== "undefined" ? database.identifier : database;
		schema = schema && typeof schema.identifier !== "undefined" ? schema.identifier : schema;
		return prefix + (database ? quote(database) + "." : "") + (schema ? quote(schema) + "." : "") + quote(tok);
	};

	/*
	 * Creates a new configuration object that inherits from defaultConfig,
	 * merges-in defaultConfig from each of the modules and finally adds
	 * user config if specified
	 */
	Parser.makeConfig = function(modules, userConfig) {
		var i, result, moduleDefaultConfig;

		result = Object.create(defaultConfig);
		if (Array.isArray(modules)) {
			for (i = 0; i < modules.length; i++) {
				if (typeof modules[i].defaultConfig === "function") {
					moduleDefaultConfig = modules[i].defaultConfig();
				} else {
					moduleDefaultConfig = modules[i].defaultConfig;
				}
				mergeConfig(result, moduleDefaultConfig);
			}
		}
		result = Object.create(result);
		mergeConfig(result, userConfig);
		return result;
	};

	/*
	 * token code, params
	 */
	Parser.makeError = function(result, type, args) {
		var err, tok, code, params, parent, index, msgInfo, msgInfoKey,
			fromPos = 0,
			toPos = 0;

		function createMessage() {
			var msg = Object.create(msgPrototype);
			msg.type = arguments[0];
			msg.code = arguments[1];
			msg.fromPos = arguments[2];
			msg.toPos = arguments[3];
			msg.params = arguments[4];
			return msg;
		}

		code = "unknown";
		params = [];
		if (args.length > 0) {
			tok = args[0];
			params.push(Parser.artifact(tok));
		}
		if (args.length > 1) {
			code = args[1];
		}
		if (args.length > 2) {
			Array.prototype.push.apply(params, Array.prototype.slice.call(args, 2));
		}
		if (tok) {
			fromPos = result.tokens[tok.firstIndex] || tok;
			fromPos = fromPos.fromPos;
			toPos = result.tokens[tok.lastIndex] || tok;
			toPos = toPos.toPos;
		}
		err = createMessage(type, code, fromPos, toPos, params);
		index = result.messages.length;
		result.messages.push(err);

		if (tok) {
			msgInfo = tok.messages;
			msgInfoKey = "first" + type;
			if (!msgInfo) {
				msgInfo = tok.messages = Object.create(null);
				msgInfo[msgInfoKey] = 0;
			}
			msgInfo[msgInfoKey] = Math.min(index, msgInfo[msgInfoKey]);

			parent = result.tokens[tok.parent] || tok;
			while (parent) {
				msgInfo = parent.messages;
				if (!msgInfo) {
					msgInfo = parent.messages = Object.create(null);
					msgInfo[msgInfoKey] = 0;
				}
				msgInfo[msgInfoKey] = Math.min(index, msgInfo[msgInfoKey]);
				parent = result.tokens[parent.parent];
			}
		}
		return err;
	};

	/*
	 * token, code, params
	 */
	Parser.prototype.warn = function() {
		if (!this.config.messages) {
			return undefined;
		}

		Parser.makeError(this.result, "Warning", arguments);
		this.result.warnings++;
	};

	/*
	 * token code, params
	 */
	Parser.prototype.info = function() {
		if (!this.config.messages) {
			return undefined;
		}

		Parser.makeError(this.result, "Info", arguments);
		this.result.infos++;
	};

	/*
	 * token code, params
	 */
	Parser.prototype.error = function() {
		var message;

		if (!this.config.messages) {
			return undefined;
		}

		message = Parser.makeError(this.result, "Error", arguments);
		this.errors++;
		if (!this.config.recover) {
			throw message;
		}
	};

	/*
	 * Peek ahead to a future lexter token.
	 */
	Parser.prototype.peek = function(distance) {
		var found, index = 0;

		distance = distance || 0;
		while (index <= distance) {
			found = this.lookahead[index];
			if (!found) {
				found = this.lookahead[index] = this.lexer.token();
			}
			index += 1;
		}
		return found;
	};

	/*
	 * Helper to determine symbol for a given name
	 */
	Parser.prototype.findSymbolForName = function(identifier) {
		var sym, nextTok, nextSym, maxbp;

		sym = this.symbolTable[identifier];
		if (!sym) {
			sym = this.operatorSymbolTable[identifier];
			if (!sym) {
				sym = this.symbolTable["(name)"];
			} else if (!this.reservedSymbolTable[identifier]) {
				// name or prefix operator, e.g. NOT, check for adjacent operator which has less bp than '('
				nextTok = this.peek();
				if (nextTok) {
					switch (nextTok.type) {
						case "name":
							nextSym = this.operatorSymbolTable[nextTok.identifier];
							maxbp = sym.led ? sym.lbp : 80;
							break;
						case "operator":
							nextSym = this.operatorSymbolTable[nextTok.value];
							maxbp = nextTok.value === "?" ? 0 : 80;
							break;
					}
				}
				if (nextSym && !nextSym.nud && nextSym.lbp < maxbp) {
					sym = this.symbolTable["(name)"];
				}
			}
		}
		return sym;
	};

	/*
	 * Creates a parser tokens based on the given lexerToken (provided by lexer, see token.js).
	 */
	Parser.prototype.makeToken = function(lexerToken, prevToken, noLexerErrors) {
		var type, value, sym, tok, from, to, errorMsg;

		from = typeof lexerToken.fromPos === "number" ? lexerToken.fromPos : 0;
		to = typeof lexerToken.toPos === "number" ? lexerToken.toPos : 0;
		type = lexerToken.type;
		value = lexerToken.value;
		switch (type) {
			case "name":
				sym = this.findSymbolForName(lexerToken.identifier);
				break;
			case "qname":
				sym = this.symbolTable["(name)"];
				break;
			case "varref":
				if (value.charAt(1) === ":" && prevToken && prevToken.identifier && prevToken.toPos === from) {
					sym = this.symbolTable["(attribute)"];
				} else {
					sym = this.symbolTable["(name)"];
				}
				break;
			case "operator":
				sym = this.operatorSymbolTable[value];
				if (!sym) {
					sym = this.symbolTable["(error)"];
					errorMsg = "unknown_operator";
				}
				break;
			case "string":
			case "number":
				sym = this.symbolTable["(literal)"];
				type = "literal";
				break;
			case "(error)":
				sym = this.symbolTable["(error)"];
				errorMsg = lexerToken.msg;
				break;
			default:
				sym = this.symbolTable[type];
		}
		if (!sym) {
			sym = this.symbolTable["(error)"];
			errorMsg = "unknown_symbol";
		}
		tok = Object.create(sym);
		tok.id = sym.id; // copy the id value although it is inherited from symbol because inherited properties will get lost during serialization
		tok.fromPos = from;
		tok.toPos = to;
		if (typeof value !== "undefined") {
			tok.value = value;
		}
		tok.type = type;
		if (sym.id === "(name)" && type !== "varref") {
			tok.identifier = lexerToken.identifier;
		}
		if (tok.type === "varref") {
			tok.variable = tok.value.substr(1).toUpperCase();
		}
		if (lexerToken.type === "number") {
			tok.number = lexerToken.number;
		}
		if (errorMsg && !noLexerErrors) {
			this.error(tok, errorMsg);
		}
		return tok;
	};

	/*
	 * skips tokens until id is nextToken, ar reserved word is found or
	 * a separator token ',' or ';' is reached
	 */
	Parser.prototype.skipTo = function(id, noLexerErrors) {
		var nextId;

		if (this.nextToken.id === id || this.nextToken.type === "name" && this.nextToken.identifier === id) {
			return true;
		}

		if (!Utils.hasErrors(this.nextToken)) {
			this.error(this.nextToken, 'expected_1_found_0', id);
		}

		// next token does not match, start skipping tokens
		do {
			nextId = this.nextToken.id;

			if (nextId === ";" || (id === ")" || !this.reservedSymbolTable[id]) && this.reservedSymbolTable[nextId]) {
				return false; // stop skipping, separator found
			}

			this.prevToken = this.token;
			this.token = this.nextToken;

			if (this.token.id === "(end)") {
				// end reached, do not advance further
				if (id && id !== "(end)") {
					this.error(this.nextToken, 'unexpected_end');
				}
				return false;
			}

			// get next token while skipping errors
			do {
				this.nextToken = this.makeToken(this.lookahead.shift() || this.lexer.token(), this.token, noLexerErrors) || this.symbolTable['(end)'];
				this.nextToken.index = this.tokens.length;
				this.nextToken.parent = this.parentIndex;
				this.tokens.push(this.nextToken);
			}
			while (this.nextToken.id === "(error)" && this.nextToken.id !== "(end)");

			if (this.nextToken.id === "(end)") {
				this.nextToken.parent = -1;
			}
			if (this.nextToken.id === id || this.nextToken.type === "name" && this.nextToken.identifier === id) {
				break;
			}
		}
		while (true);

		return true;
	};

	/*
	 * Moves the parser to the next token in case it matches on of the properties in the given cases object.
	 */
	Parser.prototype.advanceCase = function(cases) {
		var callback, args, result;

		if (cases.hasOwnProperty(this.nextToken.id)) {
			callback = cases[this.nextToken.id];
		} else if (this.nextToken.type === "name" && cases.hasOwnProperty(this.nextToken.identifier)) {
			callback = cases[this.nextToken.identifier];
		}
		if (callback) {
			this.advance();
			if (arguments.length > 1) {
				args = Array.prototype.slice.call(arguments, 1);
			}
			result = new Result(this, true);
			result.value = callback.apply(this, args);
		} else {
			result = new Result(this, false);
		}

		return result;
	};

	/*
	 * Moves the parser to the next token in case it is the expected name.
	 * Returns the found token value or false otherwise.
	 */
	Parser.prototype.advanceIf = function(id) {

		if (this.nextToken.id === id || this.nextToken.type === "name" && this.nextToken.identifier === id) {
			if (!Utils.hasErrors(this.nextToken)) {
				return this.advance();
			}
		}

		return false;
	};

	/*
	 * Moves the parser to the next token.
	 * Expected token can be specified optionally.
	 */
	Parser.prototype.advance = function(id, noLexerErrors) {

		if (id && !this.skipTo(id, noLexerErrors)) {
			return false;
		}

		this.prevToken = this.token;
		this.token = this.nextToken;

		if (this.token.id === "(end)") {
			// end reached, do not advance further
			if (id && id !== "(end)") {
				this.error(this.nextToken, 'unexpected_end');
			}
			return false;
		}

		// get next token while skipping errors
		do {
			this.nextToken = this.makeToken(this.lookahead.shift() || this.lexer.token(), this.token, noLexerErrors) || this.symbolTable['(end)'];
			this.nextToken.index = this.tokens.length;
			this.nextToken.parent = this.parentIndex;
			this.tokens.push(this.nextToken);
		}
		while (this.nextToken.id === "(error)" && this.nextToken.id !== "(end)");
		if (this.nextToken.id === "(end)") {
			this.nextToken.parent = -1;
		}

		appendTokenValue(this.token, this.pathConfig.aliasName);
		return true;
	};

	Parser.prototype.makeGlobalObject = function(tok, inScopeHistoryOnly) {
		var details, definition, gid;

		gid = Parser.makeGlobalID(tok, this.currentSchema);
		if (!inScopeHistoryOnly) {
			definition = this.globalScope[gid];
		}
		if (!definition) {
			definition = this.globalScopeHistory[gid];
		}

		if (!definition) {
			definition = Object.create(null);
			this.globalScopeHistory[gid] = definition;
			definition.identifier = tok.identifier;
			definition.kind = tok.kind;

			details = expandable[definition.kind];
			if (details) {
				definition.expand = details;
			}
			if (tok.schema) {
				definition.schema = tok.schema.identifier;
			} else if (tok.kind !== "schema" && this.currentSchema.identifier) {
				definition.currentSchema = this.currentSchema.identifier.identifier || this.currentSchema.identifier;
			}
		}
		if (!inScopeHistoryOnly) {
			this.globalScope[gid] = definition;
		}
		return definition;
	};

	/*
	 * Removes a name from global scope
	 */
	Parser.prototype.undefine = function(tok) {
		var definition, gid;

		if (typeof tok === "string") {
			delete this.globalScope[tok];
		} else {
			gid = Parser.makeGlobalID(tok, this.currentSchema);
			definition = this.globalScope[gid];
			if (definition) {
				delete this.globalScope[gid];
				tok.identifier.definition = definition;
			} else {
				tok.identifier.definition = this.makeGlobalObject(tok.identifier, true);
			}
		}
	};

	/*
	 * Registers a name in current scope (e.g. the (alias) name of a table in the scope of the current statement)
	 */
	Parser.prototype.define = function(tok, alias, scope) {
		var definition, id, aliasId, aliasDefinition, isGlobalScope;

		scope = scope || this.scope;
		isGlobalScope = scope === this.globalScope;
		// CREATE defines in global scope
		if (tok.id === "(" && tok.arity === "infix") {
			// function, procedure or column view call
			tok = tok.first;
		}
		if ((!tok.identifier && tok.type !== "varref" && tok.arity !== "statement") || tok.definition) {
			return;
		}

		id = isGlobalScope ? Parser.makeGlobalID(tok, this.currentSchema) : Parser.makeID(tok, alias);
		// do not check inherited scope since alias might already be defined in parent scope
		if (Object.hasOwnProperty.call(scope, id)) {
			definition = scope[id];
		}

		// isAlias is set in case of WITH item
		if (definition && definition.aliasDefinition) {
			aliasDefinition = definition.aliasDefinition;
		} else {
			aliasId = alias ? Parser.makeID(tok) : id;
			aliasDefinition = scope[aliasId];
			aliasDefinition = aliasDefinition && aliasDefinition.isAlias ? aliasDefinition : undefined;
		}
		if (aliasDefinition) {
			tok.definition = aliasDefinition;
		}

		// remember currentSchema
		if (tok.id === "CREATE" && this.currentSchema.identifier) {
			tok.currentSchema = this.currentSchema.identifier.identifier || this.currentSchema.identifier;
		}

		if (!definition) {
			if (isGlobalScope && tok.id === "CREATE" && tok.identifier && !tok.identifier.definition) {
				// create and link a global object to allow analyzer to check for existing objects	
				tok.identifier.previousDefinition = this.makeGlobalObject(tok.identifier, true);
			}
			scope[id] = tok;
		} else {
			// undefined name found, i.e. the has been used already in the current scope but has not been defined yet
			if (definition.type === "undefined_name") {
				// do not create DB objects for subqueries or already defined identifiers (e.g. with item)
				if (tok.identifier && !tok.definition) {
					tok.definition = this.makeGlobalObject(tok);
				}
				Parser.resolveUndefinedName(definition, tok);
				scope[id] = tok;
			} else {
				if (isGlobalScope && tok.id === "CREATE" && definition.id !== "CREATE" && tok.identifier && !tok.identifier.definition) {
					// link CREATE with previous definition to allow analyzer to check for existing objects
					tok.identifier.previousDefinition = definition;
					scope[id] = tok;
				} else {
					this.error(tok, "1_already_defined", id);
				}
			}
		}
	};

	Parser.resolveUndefinedName = function(tok, definition) {
		var i;
		if (tok.references) {
			for (i = 0; i < tok.references.length; i++) {
				if (!tok.references[i].definition) {
					tok.references[i].definition = definition;
				}
			}
		}
		tok.defined = true;
	};

	Parser.prototype.makeUndefinedName = function(obj) {
		var unresolved, id, aliasDefinition;

		id = Parser.makeID(obj);
		if (Object.hasOwnProperty.call(this.scope, id)) {
			unresolved = this.scope[id];
		}
		aliasDefinition = this.scope[id];
		aliasDefinition = aliasDefinition && aliasDefinition.isAlias ? aliasDefinition : undefined;

		if (!unresolved || aliasDefinition) {
			unresolved = this.scope[id] = Object.create(null);
			unresolved.type = "undefined_name";
			unresolved.references = [];
			unresolved.identifier = obj.identifier;
			unresolved.fromPos = obj.fromPos;
			unresolved.toPos = obj.toPos;
			unresolved.currentSchema = this.currentSchema.identifier.identifier || this.currentSchema.identifier;
			if (obj.schema) {
				unresolved.schema = obj.schema;
			}
			if (obj.kind) {
				unresolved.kind = obj.kind;
			}
			if (aliasDefinition) {
				unresolved.aliasDefinition = aliasDefinition;
			}
		}
		return unresolved;
	};

	/*
	 * Determines the definition of the given identifier, i.e. links names with corresponding entry in the global scope.
	 */
	Parser.prototype.setDefinition = function(tok) {
		var definition,
			obj = tok;

		if (tok.kind === "function" && tok.id === "(") {
			return this.setDefinition(tok.first);
		}

		if (tok.kind === "column") {
			obj = tok.table;
		}

		if (obj && !obj.definition) {
			if (obj === tok) {
				// path denotes a DB object
				if (!this.pathConfig.globalObject || (this.pathConfig.globalObject.id !== "CREATE" && this.pathConfig.globalObject.id !== "DROP")) {
					definition = this.makeGlobalObject(obj);
				}
			} else {
				// path denotes a column, link the table with the yet to defined name in scope
				definition = this.makeUndefinedName(obj, true);
			}
			if (definition) {
				if (definition.type === "undefined_name") {
					definition.references.push(obj);
				} else {
					obj.definition = definition;
				}
			}
			return definition;
		} else {
			return obj ? obj.definition : undefined;
		}
	};

	/*
	 * Closes a path by linking path segments.
	 * Links names with global symbols (setDefinition).
	 */
	Parser.prototype.closePath = function(pathType) {
		var i, j, max, kind, segment, lastSegment, alias, len, prefixKind,
			parser = this;

		function determinePathType() {
			if (parser.pathConfig.pathType) {
				if (parser.pathConfig.pathType === "column") {
					return ["column", "table", "schema", "database"];
				} else if (parser.pathConfig.pathType === "schema") {
					return ["schema", "database"];
				} else if (Array.isArray(parser.pathConfig.pathType)) {
					return parser.pathConfig.pathType;
				} else {
					return [parser.pathConfig.pathType, "schema", "database"];
				}
			} else {
				return [];
			}
		}

		if (this.token.id !== ".") {
			// complete path

			if (parser.token.identifier && parser.nextToken.id === "(" && parser.pathConfig.callType) {
				// the path terminates with a (, i.e. it is a call
				kind = [parser.pathConfig.callType, "schema", "database"];
			} else {
				kind = pathType || determinePathType();
			}

			max = kind.length;
			j = 0;
			i = len = this.pathSegments.length;
			while (i > 0) {
				i--;
				segment = this.pathSegments[i];
				if (i < max) {
					if (!segment.kind && segment.type !== "varref") {
						segment.kind = kind[j];
					}
					j++;
					// link to previous path segment
					if (i > 0) {
						prefixKind = this.pathSegments[i - 1].kind || kind[j];
						segment[prefixKind] = this.pathSegments[i - 1];
						segment.prefix = prefixKind;
					}
				}
			}
			lastSegment = this.pathSegments[len - 1];

			if (this.pathConfig.definition && parser.nextToken.id === "(") {
				// calls can be defined after parsing the closing bracket only
				this.pathSegments = [];
				return;
			}

			if (this.pathConfig.aliasType === "explicit") {
				this.parseAlias(lastSegment);
				alias = lastSegment.alias;
			}
			if (this.pathConfig.definition) {
				this.define(lastSegment, alias);
			}
			this.setDefinition(lastSegment);
		}
		this.pathSegments = [];
	};

	/*
	 * Parses a condition expression.
	 */
	Parser.prototype.parseCondition = function(rbp) {
		var oldOperators,
			expr,
			pathConfig = {
				pathType: "column",
				callType: "function",
				expressionList: true
			};

		oldOperators = this.operatorSymbolTable;
		this.operatorSymbolTable = this.logicalOperatorSymbolTable;

		rbp = typeof rbp === "undefined" ? 60 : rbp;
		expr = this.parseExpression(rbp, false, pathConfig);

		this.operatorSymbolTable = oldOperators;
		return expr;
	};

	Parser.prototype.parseInfix = function(rbp, left) {
		var opr, result = left;

		if (Utils.hasErrors(this.nextToken)) {
			return result;
		}

		while (result && rbp < this.nextToken.lbp && this.nextToken.id !== "AS") {
			this.advance();
			if (this.token.led) {
				opr = this.token.led(result, rbp);
			}
			if (opr) {
				result = opr;
			} else {
				this.error(this.token, "expected_operator");
			}
		}
		return result;
	};

	/*
	 * Parses an expression, e.g. column name, function call or path expression (t.COL)
	 * initial - true in case a statement is expected
	 * pathConfig {
	 *   pathType {table|column} - expected path names
	 *   callType {function|procedure} - expected call type
	 *   aliasType {implicit|explicit|both} - supported alias names
	 * }
	 */
	Parser.prototype.parseExpression = function(rbp, initial, pathConfig) {
		var left, hasAlias, oldPathConfig,
			parser = this;

		if (Utils.hasErrors(this.nextToken)) {
			return undefined;
		}

		function determinePathConfig() {
			if (typeof pathConfig === "string") {
				parser.pathConfig = {
					pathType: pathConfig
				};
			} else {
				parser.pathConfig = pathConfig;
			}
			if (pathConfig.aliasType === "implicit" || pathConfig.aliasType === "both" || oldPathConfig.aliasName) {
				parser.pathConfig.aliasName = parser.makeToken({
					type: "name",
					value: "",
					identifier: "",
					fromPos: -1,
					toPos: -1
				});
			}
		}

		function postProcessPath() {
			if (oldPathConfig.aliasName) {
				appendTokenValue(parser.pathConfig.aliasName, oldPathConfig.aliasName);
			}
			if (left) {
				hasAlias = !!left.alias;
				if (!hasAlias && (pathConfig.aliasType === "explicit" || pathConfig.aliasType === "both")) {
					hasAlias = parser.parseAlias(left);
				}
				if (!hasAlias && (pathConfig.aliasType === "implicit" || pathConfig.aliasType === "both")) {
					// do not check for parser.pathConfig.aliasType since aliasType is not inherited from parent
					parser.buildImplicitAlias(left);
				}
				if (parser.pathConfig.definition && left.id === "(") {
					// calls can be defined after parsing the closing bracket only
					parser.define(left.first, left.alias);
					parser.setDefinition(left.first);
				}
			}
		}

		if (pathConfig) {
			oldPathConfig = parser.pathConfig;
			determinePathConfig();
		}

		if (this.nextToken.id === '(end)') {
			this.error(this.token, 'unexpected_end');
		} else if (initial === true && this.nextToken.fud) {
			// statement
			left = this.nextToken.fud(rbp);
		} else if (this.nextToken.nud) {
			this.advance();
			left = this.token.nud(rbp);
			left = this.parseInfix(rbp, left);
		} else {
			this.error(this.nextToken, 'expected_identifier');
			if (!this.reservedSymbolTable[this.nextToken.id] && this.nextToken.id !== ";") {
				this.advance(); // skip unexpected infix operator
			}
		}

		if (pathConfig) {
			postProcessPath();
			this.pathConfig = oldPathConfig;
		}
		return left;
	};

	/*
	 * Parses an optional indentifier
	 */
	Parser.prototype.parseOptionalIdentifier = function(kind) {
		if (this.nextToken.identifier) {
			this.advance();
			if (kind) {
				this.token.kind = kind;
			}
			return this.token.value;
		}
	};

	/*
	 * Parses an identifier
	 */
	Parser.prototype.parseIdentifier = function(kind) {
		var i = this.parseOptionalIdentifier(kind);
		if (!i) {
			this.error(this.nextToken, 'expected_identifier');
			this.advance();
		}
		return i;
	};

	/*
	 * Parses an optional simple identifier
	 */
	Parser.prototype.parseOptionalSimpleIdentifier = function(kind) {
		if (this.nextToken.identifier && this.nextToken.id === "(name)") {
			this.advance();
			if (kind) {
				this.token.kind = kind;
			}
			return this.token.value;
		}
	};

	/*
	 * Parses a simple identifier
	 */
	Parser.prototype.parseSimpleIdentifier = function(kind) {
		var i = this.parseOptionalSimpleIdentifier(kind);
		if (!i) {
			this.error(this.nextToken, 'expected_simple_identifier');
			this.advance();
		}
		return i;
	};

	/*
	 * Parses an optional string
	 */
	Parser.prototype.parseOptionalString = function() {

		if (this.nextToken.id === "(literal)" && typeof this.nextToken.value === "string") {
			this.advance();
			return this.token.value;
		}
		return undefined;
	};

	/*
	 * Parses a string
	 */
	Parser.prototype.parseString = function() {
		var value = this.parseOptionalString();
		if (typeof value === "string") {
			return value;
		} else {
			this.error(this.nextToken, "expected_string");
			return undefined;
		}
	};

	/*
	 * Parses an optional number
	 */
	Parser.prototype.parseOptionalNumber = function(signed, integer) {
		var sign, number;

		if (this.nextToken.id === "+" || this.nextToken.id === "-") {
			if (signed) {
				this.advance();
				sign = this.token;
			} else {
				return undefined;
			}
		}

		number = this.nextToken.number;
		if (this.nextToken.id === "(literal)" && typeof number === "number" && isFinite(number)) {
			if (integer && Math.floor(number) !== number) {
				return undefined;
			}
			this.advance();
			if (sign) {
				this.token.sign = sign;
				number = (sign.id === '-' ? -1 : 1) * number;
			}
			return number;
		}
		return undefined;
	};

	/*
	 * Parses an optional integer
	 */
	Parser.prototype.parseOptionalInteger = function(signed) {
		return this.parseOptionalNumber(signed, true);
	};

	/*
	 * Parses an integer
	 */
	Parser.prototype.parseInteger = function(signed, varrefAllowed, varrefNoColon) {
		var number = this.parseOptionalInteger(signed);

		if (typeof number === "number") {
			return number;
		}
		if (varrefAllowed) {
			if (this.parseOptionalVariableReference(varrefNoColon)) {
				return this.token;
			}
		}
		if (signed) {
			this.error(this.nextToken, "expected_integer");
		} else {
			this.error(this.nextToken, "expected_unsigned_integer");
		}
		return undefined;
	};

	/*
	 * Parses an optional identifier or asterisk
	 */
	Parser.prototype.parseOptionalIdentifierOrAsterisk = function(asteriskNotAllowed, kind) {
		var peek0;

		if (!asteriskNotAllowed && this.nextToken.id === "*") {
			this.advance("*");
			return this.token.value;
		}
		if (this.nextToken.id === "CURRVAL") {
			peek0 = this.peek();
			if (!peek0 || peek0.value !== ".") {
				this.advance("CURRVAL");
				return this.token.value;
			}
		}
		if (this.nextToken.id === "NEXTVAL") {
			peek0 = this.peek();
			if (!peek0 || peek0.value !== ".") {
				this.advance("NEXTVAL");
				return this.token.value;
			}
		}
		return this.parseOptionalIdentifier(kind);
	};

	/*
	 * Parses an identifier or asterisk
	 */
	Parser.prototype.parseIdentifierOrAsterisk = function(asteriskNotAllowed, kind) {
		var i = this.parseOptionalIdentifierOrAsterisk(asteriskNotAllowed, kind);
		if (!i) {
			this.error(this.nextToken, asteriskNotAllowed ? 'expected_identifier' : 'expected_identifier_or_asterisk');
			return undefined;
		}

	};

	/*
	 * Parses a statement including semi-colon
	 */
	Parser.prototype.parseStatement = function(excludeSemicolon) {
		var v;

		this.symbolTable = this.specialSymbolTable;
		v = this.parseExpression(0, true, {
			pathType: "variable",
			callType: "function"
		});
		this.symbolTable = this.stmtSymbolTable;
		if (!excludeSemicolon && this.nextToken.id !== "(end)") {
			this.advance(";");
		}
		if (!v || (v.arity !== "statement" && !v.assignment)) {
			return undefined;
		}
		v.lastIndex = this.token.index;
		return v;
	};

	/*
	 * Parses a statement list until (end) token
	 */
	Parser.prototype.parseStatements = function() {
		var a = [],
			s;

		while (true) {
			if (this.nextToken.id === "}" || this.nextToken.id === "END" || this.nextToken.id === "(end)" || this.nextToken.id === "ELSEIF" ||
				this
				.nextToken.id === "ELSE") {
				break;
			}
			s = this.parseStatement();
			if (s) {
				a.push(s);
			}
		}
		return a;
	};

	/*
	 * Parses clauses till end of statement has been reached
	 */
	Parser.prototype.parseClauses = function(stmt, allClauses, mandatory) {
		var i = 0,
			nextClause,
			isMandatory,
			max = allClauses ? allClauses.length : 0;

		do {
			nextClause = allClauses[i++];
			isMandatory = mandatory && mandatory[nextClause];
			if (!isMandatory) {
				// skip optional clause if it does not match or has errors
				if (this.nextToken.id !== nextClause || Utils.hasErrors(this.nextToken)) {
					continue;
				}
			} else {
				this.skipTo(nextClause);
			}
			if (this.nextToken.cud) {
				this.nextToken.cud(stmt);
			}
		} while (i < max);
	};

	/*
	 * Define a symbol like select or operator (.)
	 */
	Parser.prototype.symbol = function(id, bp, symbolTable) {
		var s;

		symbolTable = symbolTable || this.reservedSymbolTable;
		s = symbolTable[id];
		bp = bp || 0;
		if (s) {
			// inherit form the original token to be able re-define tokens in different contexts
			// e.g. FROM in SELECT and UPDATE
			s = Object.create(s);
			if (bp >= s.lbp) {
				s.lbp = bp;
			}
		} else {
			s = Object.create(null);
			s.id = s.value = id;
			s.lbp = bp;
		}
		symbolTable[id] = s;
		return s;
	};

	Parser.prototype.operator = function(id, bp, isLogicalOperator) {
		return this.symbol(id, bp, isLogicalOperator ? this.logicalOperatorSymbolTable : this.operatorSymbolTable);
	};

	/*
	 * Define infix of operator like plus between operand
	 */
	Parser.prototype.infix = function(id, bp, led, isLogicalOperator) {
		var s = this.operator(id, bp, isLogicalOperator),
			parser = this;

		s.led = function(left, rbp) {
			var first, second,
				result = this;

			this.arity = "infix";
			if (typeof led === 'function') {
				result = led.call(this, left, rbp);
			} else {
				this.first = left;
				this.second = parser.parseExpression(bp);
			}
			// calculate span
			if (typeof this.firstIndex !== "number") {
				first = this.first || this;
				this.firstIndex = typeof first.firstIndex === "number" ? first.firstIndex : first.index;
			}
			if (typeof this.lastIndex !== "number") {
				second = this.second || this;
				this.lastIndex = typeof first.lastIndex === "number" ? second.lastIndex : second.index;
			}
			return result;
		};
		return s;
	};

	/*
	 * Define a prefix operator i.e. NOT
	 */
	Parser.prototype.prefix = function(id, nud) {
		var s = this.operator(id, 0),
			parser = this;

		s.nud = function() {
			var first,
				result = this;

			this.arity = "prefix";
			if (typeof nud === 'function') {
				result = nud.call(this);
			} else {
				this.first = parser.parseExpression(70);
			}
			// calculate span
			if (typeof this.lastIndex !== "number") {
				first = this.first || this;
				this.lastIndex = typeof first.lastIndex === "number" ? first.lastIndex : first.index;
			}
			return result;
		};
		return s;
	};

	/*
	 * Define a suffix of operator like IS NULL
	 */
	Parser.prototype.suffix = function(id, bp, led) {
		var s = this.operator(id, bp);

		s.led = function(left) {
			var first,
				result = this;

			this.arity = "suffix";
			if (typeof led === 'function') {
				result = led.call(this, left);
			} else {
				this.first = left;
			}
			// calculate span
			if (typeof this.firstIndex !== "number") {
				first = this.first || this;
				this.firstIndex = typeof first.firstIndex === "number" ? first.firstIndex : first.index;
			}
			return result;
		};
		return s;
	};

	/*
	 * Skip remaining tokens till end of statement w/o reporting an error
	 */
	Parser.prototype.skipRemaining = function(id, noLexerErrors) {
		id = id || ";";
		// default - skip tokens till stmt end;
		while (this.nextToken.id !== id && this.nextToken.id !== "(end)") {
			this.advance(undefined, noLexerErrors);
		}
	};

	/*
	 * define a statement
	 */
	Parser.prototype.stmt = function(s, fud, parentSymbolTable) {
		var x, parser = this;

		if (this.config[s.toLowerCase()]) {
			x = this.symbol(s, 0, this.stmtSymbolTable);
			x.symbolTable = Object.create(parentSymbolTable || this.symbolTable);
			x.fud = function(rbp) {
				var lastTokenIndex = parser.tokens.length - 1,
					prevStmt = parser.parentIndex,
					oldSymbols = parser.symbolTable,
					result = this;

				parser.symbolTable = x.symbolTable;
				if (x.id === parser.nextToken.id) {
					parser.parentIndex = lastTokenIndex;
					parser.advance();
				} else {
					// already advanced in case of subquery expression
					parser.parentIndex = lastTokenIndex - 1;
				}

				this.arity = "statement";
				if (typeof fud === "function") {
					result = fud.call(this, rbp);
				} else {
					parser.skipRemaining();
				}
				if (this.scope && parser.scope !== this.scope) {
					parser.resolveUndefinedNamesInScope(this.scope, parser.scope, true);
				}
				parser.symbolTable = oldSymbols;
				parser.parentIndex = prevStmt;
				return result;
			};
			/*
			 * defines a symbol in the scope of the statement
			 */
			x.symbol = function(sym, bp) {
				return parser.symbol(sym, bp, this.symbolTable);
			};
			/*
			 * define a clause in the scope of the statement
			 * cud ("clause null denotation") is called when a clause is expected
			 */
			x.clause = function(sym, cud) {
				var c;
				// all clauses are reserved symbols
				parser.symbol(sym);
				// register .cud in local symbol table to allow for different implementations per statement
				c = this.symbol(sym);
				c.cud = function(stmt) {
					var oldSymbols = parser.symbolTable,
						result = this;

					if (this.fud) {
						parser.symbolTable = this.symbolTable;
					}
					parser.advance();
					this.arity = "clause";
					if (typeof cud === "function") {
						result = cud.call(this, stmt);
					}
					parser.symbolTable = oldSymbols;
					return result;
				};
				return c;
			};
		}
		return x;
	};

	Parser.prototype.constant = function(name, dataType, bp) {
		var c = this.symbol(name, bp);
		if (dataType) {
			c.dataType = dataType;
		}
		c.nud = function() {
			return this;
		};
		return c;
	};

	/*
	 * Parses a comma spearated list of arbitrary items using the specified parser method.
	 */
	Parser.prototype.makeParseList = function(parseItemMethod, noItemsMessage) {
		var parser = this;

		return function() {
			var i = 0,
				args,
				tok = parser.token,
				items = [],
				item;

			while (true) {
				args = [i];
				args = Array.prototype.concat.apply(args, arguments);
				item = parseItemMethod.apply(parser, args);
				if (!item) {
					break;
				} else {
					items.push(item);
				}
				i++;
				if (parser.nextToken.id !== ",") {
					break;
				}
				parser.advance(",");
			}
			if (noItemsMessage && items.length === 0) {
				parser.error(tok, noItemsMessage);
			}
			return items;
		};
	};

	/*
	 * Parses an optional alias starting with AS
	 */
	Parser.prototype.parseAlias = function(tok) {
		var peek0, peek1, v0, v1,
			isTimeTravel = false,
			found = false;

		if (this.nextToken.id === "AS") {
			peek0 = this.peek(0);
			v0 = peek0 && typeof peek0.value === "string" ? peek0.value.toUpperCase() : "";
			peek1 = this.peek(1);
			v1 = peek1 && typeof peek1.value === "string" ? peek1.value.toUpperCase() : "";
			if (v0 === "OF" && (v1 === "COMMIT" || v1 === "UTCTIMESTAMP")) {
				isTimeTravel = true;
			}
		}

		if (!isTimeTravel && this.advanceIf("AS")) {
			if (this.parseIdentifier()) {
				found = true;
			}
		} else {
			if (this.parseOptionalIdentifier()) {
				found = true;
			}
		}
		if (tok && found) {
			tok.alias = this.token;
			tok.lastIndex = typeof tok.lastIndex === "number" ? Math.max(tok.lastIndex, tok.alias.index) : tok.alias.index;
			return true;
		} else {
			return false;
		}
	};

	/*
	 * Parses an optional alias starting with AS
	 */
	Parser.prototype.buildImplicitAlias = function(tok) {
		if (tok.id === "*") {
			return;
		}

		if (tok.identifier && tok.kind !== "functionresult") {
			if (tok.prefix) {
				// add alias for qualified name
				tok.alias = tok.identifier;
			}
			return;
		}
		// implicit alias for experssions or subqueries
		tok.alias = this.pathConfig.aliasName.value;
	};

	/*
	 * Parses an object reference
	 */
	Parser.prototype.parseObjectRef = function(pathConfig) {
		var id, startTok;

		startTok = this.nextToken;
		if (this.nextToken.id !== "(") {
			id = this.parseExpression(80, false, pathConfig);
		}

		if (!id || !id.identifier) {
			this.error(id || startTok, "expected_path_or_identifier");
		}
		return id;
	};

	/*
	 * Parses an object reference
	 */
	Parser.prototype.parseColumnRef = function() {
		return this.parseObjectRef("column");
	};

	/*
	 * Parses an identifier as column name
	 */
	Parser.prototype.parseColumnName = function(i, table, order) {
		var tok;
		if (this.parseIdentifier("column")) {
			tok = this.token;
			if (table) {
				tok.table = table;
				tok.prefix = "table";
			}
			this.setDefinition(tok);
			if (order) {
				if (this.advanceIf("ASC")) {
					tok.order = "asc";
				} else if (this.advanceIf("DESC")) {
					tok.order = "desc";
				} else {
					tok.order = "default";
				}
			}
		}
		return tok;
	};

	/*
	 * Parses a column definition in select statement
	 */
	Parser.prototype.parseSelectItem = function() {
		// do not allow predicates and comparision operators (bp <= 67) in column definition
		return this.parseExpression(67, false, {
			pathType: "column",
			callType: "function",
			aliasType: "both"
		});
	};

	/*
	 * Parses a variable reference
	 */
	Parser.prototype.parseOptionalVariableReference = function(colonIsOptional) {
		var tok;
		if (this.nextToken.type === "varref") {
			this.advance();
			tok = this.token;
		} else if (colonIsOptional && this.nextToken.identifier && this.nextToken.id === "(name)") {
			this.advance();
			tok = this.token;
			// convert token to varref
			tok.variable = tok.value.toUpperCase();
			tok.type = "varref";
			delete tok.identifier;
			this.warn(tok, "expected_varref_found_identifier_use_1", ":" + tok.value);
		}

		return tok;
	};

	/*
	 * Parses an identifier as variable name
	 */
	Parser.prototype.parseVariableName = function() {
		var tok;
		if (this.parseIdentifier("variable")) {
			tok = this.token;
			this.setDefinition(tok);
		}
		return tok;
	};

	/*
	 * Parses a list of columns
	 */
	Parser.prototype.parseColumnsList = function(table, order) {
		var list;
		if (this.advanceIf("(")) {
			list = this.makeParseList(this.parseColumnName, "no_columns")(table, order);
			this.advance(")");
		} else {
			list = [];
		}
		return list;
	};

	/*
	 * Parse optional data type
	 */
	Parser.prototype.parseOptionalDataType = function() {
		var typeName, typeDesc;
		if (this.nextToken.id === "CHAR") {
			typeName = "CHAR";

		} else if (this.nextToken.id === "(name)") {
			typeName = this.nextToken.identifier;
		}
		typeDesc = DataTypes.get(typeName);
		if (typeDesc) {
			this.advance();
			this.token.kind = "dataType";
			return typeDesc;
		}
	};

	/*
	 * Parse mandatory data type
	 */
	Parser.prototype.parseDataType = function(tok, context, supportsTableType, supportsColumnStoreDT, supportsDDIC, isOptional) {
		var result = true,
			dt = this.parseOptionalDataType();

		if (dt) {
			if (dt.excludedFrom && dt.excludedFrom[context]) {
				this.error(this.token, '0_not_supported');
				result = false;
			} else {
				tok.dataType = dt.name;
				if (!isNaN(dt.maxLength) && this.advanceIf("(")) {
					if (this.parseInteger()) {
						tok.length = this.token.number;
					}
					if (!isNaN(dt.maxScale) && this.advanceIf(",") && this.parseInteger()) {
						tok.scale = this.token.number;
					}
					this.advance(")");
				}
				if (supportsColumnStoreDT) {
					if (this.parseOptionalColumnStoreDataType()) {
						tok.columnStoreDataType = this.token.value.toUpperCase();
					}
				}
				if (supportsDDIC) {
					if (this.parseOptionalDDICDataType()) {
						tok.ddicDataType = this.token.value.toUpperCase();
					}
				}
			}
		} else if (supportsTableType) {
			dt = this.parseObjectRef("tableType");
			if (dt) {
				tok.dataType = dt;
			}
		} else {
			if (!isOptional) {
				this.error(this.nextToken, 'expected_data_type');
				result = false;
			}
		}
		return result;
	};

	/*
	 * Parse optional column store data type
	 */
	Parser.prototype.parseOptionalColumnStoreDataType = function() {
		var typeName;

		if (this.nextToken.id === "(name)") {
			typeName = this.nextToken.identifier;
		}
		if (DataTypes.getColumnStoreDataType(typeName)) {
			this.advance();
			this.token.kind = "columnStoreDataType";
			return this.token.value.toUpperCase();
		}
	};

	/*
	 * Parse optional DDIC data type
	 */
	Parser.prototype.parseOptionalDDICDataType = function() {
		var typeName;

		if (this.nextToken.id === "(name)") {
			typeName = this.nextToken.identifier;
		}
		if (DataTypes.getDDICDataType(typeName) >= 0) {
			this.advance();
			this.token.kind = "ddicDataType";
			return this.token.value.toUpperCase();
		}
	};

	Parser.prototype.parseCallParameters = function(call) {
		var peek0, peek1, peek2, p, parseValue, result, pathType;

		result = [];
		while (this.nextToken.id !== ")") {
			p = Object.create(null);
			parseValue = true;

			peek0 = this.peek();
			if (this.nextToken.identifier) {
				peek1 = this.peek(1);
				peek2 = this.peek(2);
				if (peek0 && peek0.value === "=>") {
					this.parseIdentifier();
					p.name = this.token;
					this.advance("=>");
				} else if (peek0 && peek0.value === "." && peek1 && (peek1.type === "name" || peek1.type === "qname") && peek2 && peek2.value ===
					"=>") {
					this.parseIdentifier();
					p.prefix = this.token.identifier; // placeholder or hint
					this.advance(".");
					this.parseIdentifier();
					p.name = this.token;
					this.advance("=>");
				}
			} else if (this.nextToken.id === "(literal)" && typeof this.nextToken.value === "string") {
				if (peek0 && peek0.value === "=") {
					this.parseString();
					p.name = this.token.value;
					this.advance("=");
					if (this.advanceIf("(")) {
						p.value = [];
						while (true) {
							this.parseString();
							p.value.push(this.token.value);
							if (this.nextToken.id !== ",") {
								break;
							}
							this.advance(",");
						}
						this.advance(")");
					} else {
						this.parseString();
						p.value = this.token.value;
					}
					parseValue = false;
				}
			}

			if (parseValue) {
				pathType = this.pathConfig.pathType;
				if (call.first.kind === "procedure") {
					pathType = "variable";
				}
				p.value = this.parseExpression(0, false, {
					callType: "function",
					pathType: pathType
				});
			}
			if (p.value) {
				result.push(p);
				if (p.value.id === "*") {
					this.error(p.value, "0_not_supported");
				}
			}

			if (this.nextToken.id !== ",") {
				break;
			}
			this.advance(",");
		}
		this.advance(")");

		return result;
	};

	/*
	 * Resolves undefined names in parent scope
	 */
	Parser.prototype.resolveUndefinedNamesInScope = function(scope, parentScope, doNotMoveUp) {
		var keys, key, i, j, scopeItem, parentScopeItem;

		keys = Object.keys(scope);
		for (i = 0; i < keys.length; i++) {
			key = keys[i];
			scopeItem = scope[key];
			if (scopeItem.type === "undefined_name") {
				if (Object.hasOwnProperty.call(parentScope, key)) {
					parentScopeItem = parentScope[key];
					if (parentScopeItem && parentScopeItem.type === "undefined_name") {
						for (j = 0; j < scopeItem.references.length; j++) {
							parentScopeItem.references.push(scopeItem.references[j]);
						}
					} else {
						Parser.resolveUndefinedName(scopeItem, parentScopeItem);
					}
					delete scope[key];
				} else if (!doNotMoveUp) {
					parentScope[key] = scopeItem;
					delete scope[key];
				}
			}
		}
	};

	/*
	 * Merges scope of given tokens into target
	 * targetScope, [sourceToken, ...]
	 */
	Parser.prototype.mergeScope = function() {
		var target, source, keys, key, i, j;

		if (arguments.length > 0) {
			target = arguments[0];
		}
		for (i = 1; i < arguments.length; i++) {
			if (arguments[i].scope && arguments[i].arity !== "statement") {
				// source has a scope, e.g. a joined table
				// do not merge the scope of subqueries
				source = arguments[i].scope;
				keys = Object.keys(source);
				for (j = 0; j < keys.length; j++) {
					key = keys[j];
					if (target[key]) {
						this.error(source[key], "1_already_defined", key);
					} else {
						target[key] = source[key];
					}
				}
			} else {
				// source is a (table) name
				source = arguments[i];
				key = Parser.makeID(source, source.alias);
				if (target[key]) {
					this.error(source, "1_already_defined", key);
				} else {
					target[key] = source;
				}
			}
		}
	};

	Parser.prototype.addCallback = function(func) {
		this.callbacks.push(func);
	};

	Parser.prototype.parse = function(args) {
		var i, result, lexerArgs = {},
			analyzerArgs = {};

		if (typeof args === "object") {
			lexerArgs.src = args.src;
			lexerArgs.prefix = args.prefix;
			lexerArgs.includeWS = args.includeWS;
			analyzerArgs = args;
		} else {
			lexerArgs.src = args;
		}
		if (!analyzerArgs.currentSchema) {
			analyzerArgs.currentSchema = "";
		}
		result = this.result = {
			messages: [],
			warnings: 0,
			infos: 0
		};
		this.lexer = tokenize(lexerArgs);
		this.prevToken = this.token = this.nextToken = this.makeToken({
			type: "(begin)",
			from: 0,
			to: 0,
			parent: -1
		});
		this.parentIndex = -1;
		this.result.tokens = this.tokens = [];
		this.lookahead = [];
		this.globalScope = Object.create(null);
		this.globalScopeHistory = Object.create(null);
		this.parentScope = null;
		this.scope = Object.create(this.parentScope);

		// create a dummy db object for the default schema and register it in globalScope
		this.currentSchema = this.makeGlobalObject({
			kind: "schema",
			identifier: analyzerArgs.currentSchema
		});

		this.pathSegments = [];
		this.pathConfig = {};
		this.symbolTable = this.stmtSymbolTable;
		this.advance();
		this.result.statements = this.parseStatements();
		this.advance("(end)");

		for (i = 0; i < this.callbacks.length; i++) {
			this.callbacks[i]({
				globalScope: this.globalScope,
				globalScopeHistory: this.globalScopeHistory
			}, result, analyzerArgs);
		}

		// clean-up memory
		this.result = this.lexer = this.tokens = this.lookahead = this.globalScope = this.globalScopeHistory = this.scope = this.pathSegments =
			null;

		return result;
	};

	/*
	 * Initialize the core parser instance
	 */
	init = function(parser) {
		parser.symbol("(begin)", 0, parser.specialSymbolTable);
		parser.symbol("(end)", 0, parser.specialSymbolTable);
		parser.symbol("(error)", 0, parser.specialSymbolTable);
		parser.symbol("(name)", 0, parser.specialSymbolTable).nud = function() {
			var pathTypes,
				asteriskNotAllowed = false,
				stopped = false,
				name = this;

			parser.pathSegments.push(name);
			if (name.type === "varref") {
				pathTypes = ["column", "table"];
				asteriskNotAllowed = true;
			}
			while (!stopped && parser.advanceIf(".")) {
				if (parser.parseOptionalIdentifierOrAsterisk(asteriskNotAllowed)) {
					if (parser.token.id === "*" || name.type === "varref") {
						// stop after parsing * or first name after varref 
						stopped = true;
					}
					name = parser.token;
					parser.pathSegments.push(name);
				} else {
					// incomplete/broken path, return the last '.'
					parser.error(parser.token, "unterminated_path");
					name = parser.token;
					break;
				}
			}

			parser.closePath(pathTypes);
			return name;
		};
		// handle cursor attributes like a suffix operator
		parser.symbol("(attribute)", 120, parser.specialSymbolTable).led = function(left) {
			this.first = left;
			return this;
		};
		parser.symbol("(literal)", 0, parser.specialSymbolTable).nud = function() {
			return this;
		};
		parser.symbol(";");
		parser.symbol("=>");
		parser.symbol("(");
		parser.symbol(")");
		parser.symbol(",");
		parser.symbol("."); // dot in path expressions
		parser.symbol("[");
		parser.symbol("]");
		parser.symbol("#"); // prefix table name in grouping sets

		parser.symbol("?").nud = function() {
			return this;
		};
		parser.symbol("AS"); // alias

		parser.constant("CURRENT_CONNECTION");
		parser.constant("CURRENT_DATE");
		parser.constant("CURRENT_SCHEMA");
		parser.constant("CURRENT_TIME");
		parser.constant("CURRENT_TIMESTAMP");
		parser.constant("CURRENT_USER");
		parser.constant("CURRENT_UTCDATE");
		parser.constant("CURRENT_UTCTIME");
		parser.constant("CURRENT_UTCTIMESTAMP");
		parser.constant("SESSION_USER");

		// function/procedure call
		parser.infix("(", 80, function(left) {
			var builtIn, prefix, method,
				result = this;

			this.first = left;
			if (!left.identifier) {
				parser.error(parser.prevToken, "expected_path_or_identifier");
			}
			builtIn = Functions.getBuiltIn(left.identifier);
			method = Functions.getMethod(left.identifier);
			if (!left.prefix && builtIn) {
				this.second = builtIn.parse(parser, this);
			} else if (left.prefix && method) {
				// path has been parsed as function name, need to change "kind"
				left.kind = "method";
				left.definition = {
					expand: true,
					kind: "method",
					identifier: left.identifier
				};
				if (left.prefix === "schema") {
					prefix = left.schema;
					delete left.schema;
					prefix.kind = left.prefix = "column";
					left.column = prefix;
					if (left.column.prefix === "database") {
						prefix = left.column.database;
						delete left.column.database;
						prefix.kind = left.column.prefix = "table";
						left.column.table = prefix;
					}
					parser.setDefinition(left.column);
				}
				this.second = method.parse(parser, this);
			} else {
				this.second = parser.parseCallParameters(this);
			}
			result.lastIndex = parser.token.index;

			// scalar functions can have multiple ouput parameters
			if (parser.advanceIf(".")) {
				parser.pathSegments.push(result);
				result.kind = "function";
				if (parser.parseIdentifier("functionresult")) {
					result = parser.token;
					parser.pathSegments.push(result);
				}
				parser.closePath();
			}
			return result;
		});

		parser.suffix("[", 90, function(left) {
			var result = left;

			if (left.identifier && left.kind === "variable" || left.type === "varref") {
				if (parser.parseInteger(false, true, true)) {
					result.arrayIndex = parser.token;
				}
				parser.advance("]");
			} else {
				parser.error(parser.prevToken, "expected_path_or_identifier");
			}
			return result;
		});

		// attribute list in plan operators
		parser.prefix("[", function() {
			var result = parser.makeParseList(parser.parseSelectItem, "no_columns")();

			parser.advance("]");
			return result;
		});
	};

	return Parser;

});