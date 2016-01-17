/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

/*
 * Resolves names of DB objects and performs semantic analysis.
 */
/*global define*/
define(function(require) {
	"use strict";

	var Parser = require("./parser"),
		DataTypes = require("./types"),
		Functions = require("./functions"),
		Analyzer,
		cons = typeof console !== "undefined" ? console : undefined,
		defaultConfig = {
			resolver: undefined
		};

	function matchKind(tok, obj) {
		if (tok.id === "*" || !tok.kind) {
			return true;
		}
		if (tok.kind === "table" && (obj.kind === "tableFunction" || obj.kind === "query")) {
			return true;
		}
		if (tok.kind === obj.kind) {
			return true;
		}
		return false;
	}

	function missingOrHasErrors(tok) {
		if (typeof tok !== "object") {
			return true;
		}
		if (tok.messages) {
			return tok.messages.firstError >= 0 || tok.messages.firstSemanticError >= 0;
		} else {
			return false;
		}
	}

	function clone(obj) {
		var keys, i, result;
		if (typeof obj !== "object") {
			return obj;
		}
		keys = Object.keys(obj);
		result = {};
		for (i = 0; i < keys.length; i++) {
			result[keys[i]] = obj[keys[i]];
		}
		return result;
	}

	function getTokenIndex(tokens, pos) {
		var i, token;

		if (pos >= 0) {
			for (i = 0; i < tokens.length; i++) {
				token = tokens[i];
				if (token.fromPos <= pos && token.toPos > pos) {
					return i;
				}
			}
		}
		return -1;
	}

	function checkAndDetermineOperatorType(analyzer, opr, dataType) {
		var first = analyzer.resolve(opr.first),
			second = analyzer.resolve(opr.second);

		opr.resolved = {
			resolved: true
		};
		opr.resolved.dataType = dataType;

		if (first && DataTypes.convert(first.dataType, dataType) !== dataType) {
			analyzer.semanticError(opr.first, "invalid_datatype_1_operator_2_expected_3", first.dataType, opr.id, dataType);
		}
		if (second && DataTypes.convert(second.dataType, dataType) !== dataType) {
			analyzer.semanticError(opr.second, "invalid_datatype_1_operator_2_expected_3", second.dataType, opr.id, dataType);
		}
	}

	function init(parser) {
		var config = parser.config;

		function makeCallback() {

			return function(ctx, result, args) {
				var analyzer = new Analyzer(config, ctx, result, args);

				// add resolve function to the result to allow clients to trigger the analyzer
				result.resolve = function() {
					var done, pos;

					try {
						if (arguments.length === 1) {
							if (typeof arguments[0] === "function") {
								done = arguments[0];
							} else {
								pos = arguments[0];
							}
						} else {
							pos = arguments[0];
							done = arguments[1];
						}

						analyzer.analyze(pos, done);
					} catch (e) {
						if (cons) {
							cons.error(e);
						}
						if (done) {
							done(result);
						}
					}
				};
			};
		}

		parser.addCallback(makeCallback());
	}

	Analyzer = function(config, ctx, result, args) {
		this.config = config;
		this.globalScope = ctx.globalScope;
		this.globalScopeHistory = ctx.globalScopeHistory;
		this.result = result;
		this.args = args;
		this.currentSchema = this.globalScopeHistory[Parser.makeGlobalID({
			kind: "schema",
			identifier: args.currentSchema || ""
		})];
		this.result.semanticErrors = 0;
	};

	/*
	 * token code, params
	 */
	Analyzer.prototype.semanticError = function() {
		if (!this.config.messages) {
			return undefined;
		}

		Parser.makeError(this.result, "SemanticError", arguments);
		this.result.semanticErrors++;
	};

	Analyzer.prototype.resolve = function(tok) {
		var resolved,
			obj = tok;

		if (!obj) {
			return undefined;
		}

		if (!obj.resolved) {
			while (!obj.resolved && obj.definition) {
				obj = obj.definition;
			}

			if (obj.arity !== "statement" && (!obj.resolved || !matchKind(tok, obj))) {
				return undefined;
			}
		}

		resolved = typeof obj.resolved === "object" ? obj.resolved : obj;

		if (Array.isArray(resolved.columns) && !resolved.columns.resolved) {
			resolved.columns.resolved = true;
		}

		if (!tok.resolved) {
			obj = tok;
			while (obj && !obj.resolved) {
				obj.resolved = resolved === obj ? true : resolved;
				obj = obj.definition;
			}
		}
		return resolved;
	};

	Analyzer.prototype.resolveAsteriskInAllTables = function(column, scope) {
		var dbTable, i, result, columns, keys, table;

		keys = Object.keys(scope);
		result = [];
		for (i = 0; i < keys.length; i++) {
			table = scope[keys[i]];
			dbTable = this.resolve(table);
			if (!dbTable || !dbTable.columns || !dbTable.columns.resolved) {
				// unresolved table
				continue;
			}
			columns = typeof dbTable.columns.resolved === "boolean" ? dbTable.columns : dbTable.columns.resolved;

			Array.prototype.push.apply(result, columns);
		}

		if (result.length > 0) {
			if (column.definition) {
				this.semanticError(column, "ambigous_col_definition_0_1_2", Parser.artifact(column.table), Parser.artifact(table));
			} else {
				result.resolved = true;
				column.definition = result;
				this.resolve(column);
			}
			return result;
		} else {
			return undefined;
		}
	};

	Analyzer.prototype.resolveColumnInTable = function(column, table) {
		var dbTable, i, result, resolved, columns;

		dbTable = this.resolve(table);
		if (!dbTable || !dbTable.columns || !dbTable.columns.resolved) {
			// unresolved table
			return result;
		}
		columns = typeof dbTable.columns.resolved === "boolean" ? dbTable.columns : dbTable.columns.resolved;

		if (column.id === "*") {
			result = columns;
		} else {
			for (i = 0; i < columns.length; i++) {
				resolved = this.resolve(columns[i]);
				if (resolved && column.identifier === resolved.identifier) {
					result = columns[i];
					break;
				}
			}
		}
		if (result) {
			if (column.definition) {
				this.semanticError(column, "ambigous_col_definition_0_1_2", Parser.artifact(column.table), Parser.artifact(table));
			} else {
				column.definition = result;
				column.table = table;
				this.resolve(column);
			}
		}
		return result;
	};

	Analyzer.prototype.resolveColumnInFunctionCall = function(column, fnCall, parent) {
		var fn, i, resolved, result;

		this.analyzeExpression(fnCall, parent);
		fn = this.resolve(fnCall.first);
		if (fn && fn.parameters) {
			for (i = 0; i < fn.parameters.length; i++) {
				resolved = this.resolve(fn.parameters[i]);
				if (resolved && column.identifier === resolved.identifier) {
					result = fn.parameters[i];
					break;
				}
			}
		}
		if (result) {
			column.definition = result;
			this.resolve(column);
		}
		return result;
	};

	Analyzer.prototype.resolveColumnInScope = function(column, parent) {
		var i, keys, result, resolvedCol, parentScope, table,
			scope = parent && parent.scope ? parent.scope : Object.create(null);

		if (column.resolved) {
			return column.resolved;
		}
		if (column.identifier || column.id === "*") {
			if (column.table) {
				result = this.resolveColumnInTable(column, column.table);
				if (!result && !this.inBlock) { // disable unresolved columns messages in SQL script until we can resolve variables
					this.semanticError(column, "unresolved_col_0");
				}
			} else if (column[column.prefix] && column[column.prefix].id === "(") {
				result = this.resolveColumnInFunctionCall(column, column[column.prefix], parent);
				if (!result && !this.inBlock) { // disable unresolved columns messages in SQL script until we can resolve variables
					this.semanticError(column, "unresolved_col_0");
				}
			} else {
				if (column.id === "*") {
					result = this.resolveAsteriskInAllTables(column, scope);
				} else {
					parentScope = scope;
					while (parentScope && !result) {
						keys = Object.keys(parentScope);
						for (i = 0; i < keys.length; i++) {
							table = parentScope[keys[i]];
							if (!table.isAlias) {
								result = this.resolveColumnInTable(column, table) || result;
							}
						}
						parentScope = Object.getPrototypeOf(parentScope);
					}
				}
				if (!result && !this.inBlock) { // disable unresolved columns messages in SQL script until we can resolve variables
					this.semanticError(column, "unresolved_col_0");
				}
			}
		} else {
			this.analyzeExpression(column, parent);
			resolvedCol = this.resolve(column);
			if (!missingOrHasErrors(column) && resolvedCol) {
				result = {
					identifier: column.alias || column.identifier,
					kind: "column",
					resolved: true,
					dataType: resolvedCol.dataType
				};

				if (Array.isArray(resolvedCol.dataType)) {
					if (resolvedCol.dataType.length !== 1) {
						this.semanticError(column, "expected_scalar_typed_expression");
						result = undefined;
					} else {
						result.dataType = this.resolve(resolvedCol.dataType[0]).dataType;
						column.resolved = result;
					}
				} else if (typeof resolvedCol.dataType !== "string") {
					this.semanticError(column, "expected_scalar_typed_expression");
					result = undefined;
				} else {
					column.resolved = result;
				}
			}
		}
		return result;
	};

	Analyzer.prototype.resolveUndefinedTable = function(token, scope) {
		var obj, definition, id, lookup;

		if (token.type !== "undefined_name") {
			return;
		}

		lookup = {
			identifier: token.identifier,
			kind: token.kind
		};
		if (!token.schema) {
			lookup.schema = token.currentSchema;
		}
		id = Parser.makeID(lookup);
		definition = scope[id];

		if (!definition) {
			this.semanticError(token, "undefined_name_0");
		} else {
			obj = this.resolve(definition);
			if (obj && (!token.schema || token.schema.identifier === obj.schema) &&
				token.identifier === obj.identifier && token.kind === obj.kind) {
				Parser.resolveUndefinedName(token, definition);
				scope[id] = definition;
			} else {
				this.semanticError(token, "undefined_name_0");
			}
		}
	};

	Analyzer.prototype.addObjectsToResolve = function(toResolve, token) {
		var keys, i, table, stmt,
			definition = token,
			kind = token.kind;

		if (token.type) {
			if (token.identifier && !token.definition) {
				stmt = this.result.tokens[token.parent];
				if (stmt) {
					this.addObjectsToResolve(toResolve, stmt);
				}
				return;
			}
			while (definition.definition) {
				definition = definition.definition;
			}
		}

		if (definition.type) {
			// token
			if (definition.scope) {
				keys = Object.keys(definition.scope);
				for (i = 0; i < keys.length; i++) {
					table = definition.scope[keys[i]];
					while (table.definition) {
						table = table.definition;
					}
					this.addObjectsToResolve(toResolve, table);
				}
			}
		} else {
			// DB object
			if (kind) {
				kind = kind === "view" ? "table" : kind;
				if (!toResolve.hasOwnProperty(kind)) {
					toResolve[kind] = [];
				}
				if (toResolve[kind].indexOf(definition) < 0) {
					toResolve[kind].push(definition);
				}
			}
		}
	};

	Analyzer.prototype.prepareResolve = function() {
		var i, keys, obj,
			toResolve = {};

		keys = Object.keys(this.globalScope);
		for (i = 0; i < keys.length; i++) {
			obj = this.globalScope[keys[i]];
			if (obj.kind !== "function" || obj.schema || !Functions.getBuiltIn(obj.identifier)) {
				this.addObjectsToResolve(toResolve, obj);
			}
		}

		keys = Object.keys(this.globalScopeHistory);
		for (i = 0; i < keys.length; i++) {
			obj = this.globalScopeHistory[keys[i]];
			if (obj.kind !== "function" || obj.schema || !Functions.getBuiltIn(obj.identifier)) {
				this.addObjectsToResolve(toResolve, obj);
			}
		}
		return toResolve;
	};

	Analyzer.prototype.postResolve = function(toResolve) {
		var i, obj, gid, globalObj, lookup, keys, kind, j;

		keys = Object.keys(toResolve);
		for (j = 0; j < keys.length; j++) {
			kind = keys[j];
			if (kind === "schema") {
				continue;
			}
			for (i = 0; i < toResolve[kind].length; i++) {
				obj = toResolve[kind][i];
				if (!obj.resolved) {
					if (!obj.schema) {
						lookup = {
							kind: obj.kind,
							identifier: obj.identifier,
							schema: obj.currentSchema || this.currentSchema
						};
						gid = Parser.makeGlobalID(lookup);
						globalObj = this.globalScope[gid];
						if (globalObj && globalObj.arity !== "statement") {
							globalObj = this.resolve(globalObj);
						}
						if (globalObj && globalObj.arity !== "statement") {
							obj.definition = globalObj;
						}
						continue;
					}

					if (obj.schema === this.currentSchema.identifier) {
						lookup = {
							kind: obj.kind,
							identifier: obj.identifier
						};
						gid = Parser.makeGlobalID(lookup);
						globalObj = this.globalScope[gid];
						if (globalObj && globalObj.arity !== "statement") {
							globalObj = this.resolve(globalObj);
						}
						if (globalObj && globalObj.arity !== "statement") {
							obj.definition = globalObj;
						}
						continue;
					}
				}
			}
		}
	};

	Analyzer.prototype.analyzeAssignment = function(opr, parent) {
		this.analyzeExpression(opr.first, parent);
		this.analyzeExpression(opr.second, parent);

		if (missingOrHasErrors(opr.first) || missingOrHasErrors(opr.second)) {
			return;
		}
	};

	Analyzer.prototype.analyzeCallParameters = function(params, parent, maxNumber) {
		var i, resolvedParam, resolved = [];

		if (!missingOrHasErrors(params)) {
			if (isNaN(maxNumber)) {
				maxNumber = params.length;
			} else {
				maxNumber = Math.min(params.length, maxNumber);
			}
			for (i = 0; i < maxNumber; i++) {
				this.analyzeExpression(params[i].value, parent);
				resolvedParam = this.resolve(params[i].value);
				resolved.push({
					name: params[i].name,
					value: resolvedParam
				});
			}
		}
		if (params) {
			params.resolved = resolved;
		}
	};

	Analyzer.prototype.analyzeCall = function(opr, parent) {
		var firstParam, formalParameters, resolvedFn, definition, actualParameters, i, noOfMandatoryParameters;

		if (missingOrHasErrors(opr.first)) {
			return;
		}

		definition = opr.first.definition;
		if (definition && definition.arity !== "statement" && !definition.schema) {
			formalParameters = Functions.analyzeBuiltIn(this, definition, opr.second, parent);
		} else {
			this.analyzeCallParameters(opr.second, parent);
		}
		this.analyzeExpression(opr.first, parent);
		resolvedFn = this.resolve(opr.first);

		// we do not have metadata about view parameters yet
		if (resolvedFn && resolvedFn.mainType !== "VIEW") {
			if (!formalParameters) {
				formalParameters = resolvedFn.parameters || [];
			}
			actualParameters = opr.second && opr.second.resolved ? opr.second.resolved : [];

			firstParam = 0;
			while (formalParameters.length > firstParam && formalParameters[firstParam].parameterType === "RETURN") {
				firstParam++;
			}
			noOfMandatoryParameters = 0;
			for (i = firstParam; i < formalParameters.length; i++) {
				if (!formalParameters[i].hasDefaultValue && !formalParameters[i].defaultValue) {
					noOfMandatoryParameters++;
				}
			}
			if (actualParameters.length < noOfMandatoryParameters ||
				/* for built-in functions with optional parameters (hasOptionalParameters) formalParameters does only include mandatory parameters */
				!resolvedFn.hasOptionalParameters && actualParameters.length > formalParameters.length - firstParam) {
				this.semanticError(opr, "expected_number_of_arguments");
			}
			opr.resolved = {
				resolved: true
			};
			if (formalParameters) {
				if (firstParam === 1) {
					// exactly one return param, determine dataType
					opr.resolved.dataType = formalParameters[0].dataType;
				}
			}
		}
	};

	Analyzer.prototype.analyzeOperator = function(opr, parent) {
		var lastIndex, lastExpr;

		this.analyzeExpression(opr.first, parent);
		this.analyzeExpression(opr.second, parent);

		if (missingOrHasErrors(opr.first) || opr.arity === "infix" && missingOrHasErrors(opr.second)) {
			return;
		}
		switch (opr.id) {
			case "+":
			case "-":
			case "*":
			case "/":
				checkAndDetermineOperatorType(this, opr, "DECIMAL");
				break;
			case "||":
				checkAndDetermineOperatorType(this, opr, "CHAR");
				break;
			case "BETWEEN":
			case "IN":
			case "EXISTS":
			case "LIKE":
			case "IS":
			case "=":
			case "!=":
			case "<>":
			case "<":
			case ">":
			case "<=":
			case ">=":
				opr.resolved = {
					resolved: true
				};
				opr.resolved.dataType = "BOOLEAN";
				break;
			case "CASE":
				lastIndex = opr.first ? opr.first.length - 1 : -1;
				if (lastIndex >= 0 && opr.first[lastIndex][1]) {
					lastExpr = this.resolve(opr.first[lastIndex][1]);
					if (lastExpr) {
						opr.resolved = {
							resolved: true
						};
						opr.resolved.dataType = lastExpr.dataType;
					}
				}
				break;
			case "NOT":
			case "AND":
			case "OR":
				checkAndDetermineOperatorType(this, opr, "BOOLEAN");
				break;
			case "JOIN":
				this.analyzeExpression(opr.on, parent);
				break;
		}
	};

	Analyzer.prototype.analyzeExpression = function(expr, parent) {
		var i;

		if (!expr) {
			return;
		}

		// tuple
		if (Array.isArray(expr)) {
			for (i = 0; i < expr.length; i++) {
				this.analyzeExpression(expr[i], parent);
			}
		} else if (expr.kind === "column") {
			this.resolveColumnInScope(expr, parent);
		} else if (expr.type === "operator") {
			if (expr.assignment) {
				this.analyzeAssignment(expr, parent);
			}
			if (expr.id === "(") {
				this.analyzeCall(expr, parent);
			} else {
				this.analyzeOperator(expr, parent);
			}
		} else if (expr.arity === "statement") {
			this.analyzeStatement(expr, parent);
			if (expr.columns) {
				expr.dataType = expr.columns.resolved;
			}
		} else if (expr.identifier) {
			if (!this.resolve(expr)) {
				switch (expr.kind) {
					case "table":
						this.semanticError(expr, "unresolved_table_0");
						break;
					case "procedure":
						this.semanticError(expr, "unresolved_procedure_0");
						break;
					case "tableFunction":
					case "function":
						this.semanticError(expr, "unresolved_function_0");
						break;
					case "tableType":
						this.semanticError(expr, "unresolved_tabletype_0");
						break;
				}
			}
		} else if (expr.id === "(literal)") {
			expr.resolved = {
				resolved: true
			};
			if (typeof expr.number === "number") {
				expr.resolved.dataType = expr.value.indexOf(".") < 0 ? "INT" : "DECIMAL";
			} else {
				expr.resolved.dataType = "CHAR";
			}
		}
	};

	Analyzer.prototype.analyzeDeclaration = function( /*decl*/ ) {

	};

	Analyzer.prototype.analyzeDeclarations = function(stmtOrBlock) {
		var i;

		if (stmtOrBlock && stmtOrBlock.declarations) {
			for (i = 0; i < stmtOrBlock.declarations.length; i++) {
				this.analyzeDeclaration(stmtOrBlock.declarations[i]);
			}
		}
	};

	Analyzer.prototype.analyzeParameterDeclarations = function(stmt) {
		var i, param, columns, resolvedType;

		if (stmt && stmt.parameters) {
			for (i = 0; i < stmt.parameters.length; i++) {
				param = stmt.parameters[i];
				this.analyzeExpression(param.dataType);
				resolvedType = this.resolve(param.dataType);
				if (param.parameterType === "RETURN" && resolvedType && resolvedType.kind === "tableType") {
					columns = resolvedType.columns;
				}
			}
			if (!stmt.columns && columns) {
				stmt.columns = columns;
			}
		}
	};

	Analyzer.prototype.analyzeBlock = function(block) {
		var oldInBlock = this.inBlock;

		this.inBlock = true;
		this.analyzeDeclarations(block);
		this.analyzeStatements(block);
		this.inBlock = oldInBlock;
	};

	Analyzer.prototype.analyzeScope = function(stmt) {
		var that = this;

		function analyze(sc) {
			var i, token,
				keys = sc ? Object.keys(sc) : [];

			for (i = 0; i < keys.length; i++) {
				token = sc[keys[i]];
				if (token.type === "undefined_name") {
					that.resolveUndefinedTable(token, sc);
				}
			}
		}
		analyze(stmt.scope);
	};

	Analyzer.prototype.analyzeColumnList = function(list, definition) {
		var j, col, resolvedCol, a;

		if (list && !list.resolved) {
			if (definition) {
				a = [];
				for (j = 0; j < definition.columns.resolved.length; j++) {
					col = list[j];
					resolvedCol = definition.columns.resolved[j];
					if (resolvedCol && col) {
						// overwrite the identifier in case of columns with alias
						resolvedCol = clone(resolvedCol);
						resolvedCol.identifier = col.identifier;
						col.resolved = resolvedCol;
						a.push(resolvedCol);
					}
				}
				a.resolved = true;
				list.resolved = a;
			}
			while (j < list.length) {
				this.semanticError(list[j++], "unresolved_col_0");
			}
		}
	};

	Analyzer.prototype.analyzeWithItems = function(stmt) {
		var i, item;

		if (!Array.isArray(stmt.items)) {
			return;
		}
		for (i = 0; i < stmt.items.length; i++) {
			item = stmt.items[i];
			this.analyzeStatement(item.definition, stmt);
			this.analyzeColumnList(item.columns, item.definition);
			item.resolved = true;
		}
	};

	Analyzer.prototype.analyzeStatement = function(stmt, parent) {
		var a, i, col, keys, obj, resolvedCol, resolvedId, stmtSchema, hasOrderBy = false;

		function analyzeOrderBy(analyzer, statement) {
			var j;

			// order by scope includes current stmt columns try to resolve them first
			if (Array.isArray(statement.orderBy)) {
				for (j = 0; j < statement.orderBy.length; j++) {
					if (statement.orderBy[j].kind === "column") {
						analyzer.resolveColumnInTable(statement.orderBy[j], statement);
					}
				}
			}
			analyzer.analyzeExpression(statement.orderBy, statement);
		}

		switch (stmt.id) {
			case "BEGIN":
				this.analyzeBlock(stmt);
				break;
			case "CALL":
				this.analyzeExpression(stmt.target);
				break;
			case "DROP":
				resolvedId = stmt.identifier ? stmt.identifier.definition : undefined;
				if (resolvedId) {
					// do not analyze preceding CREATE stmts again
					if (resolvedId.arity !== "statement") {
						this.analyzeExpression(stmt.identifier);
					}
					if (resolvedId.resolved || resolvedId.arity === "statement") {
						// check/mark DB object as dropped
						if (resolvedId.dropped) {
							this.semanticError(stmt.identifier, "object_does_not_exists");
						} else {
							resolvedId.dropped = true;
							if (resolvedId.resolved) {
								resolvedId.resolved = false;
							}
						}
						if (stmt.kind === "schema" && stmt.option === "CASCADE") {
							keys = Object.keys(this.globalScopeHistory);
							for (i = 0; i < keys.length; i++) {
								obj = this.globalScopeHistory[keys[i]];
								stmtSchema = obj.schema || obj.currentSchema || this.currentSchema.identifier;
								if (obj.kind !== "schema" && stmtSchema === stmt.identifier.identifier) {
									obj.dropped = true;
									if (obj.resolved) {
										obj.resolved = false;
									}
								}
							}
						}
					} else {
						// unresolved object already reported after analyzing the identifier
					}
				}
				break;
			case "DELETE":
				this.analyzeExpression(stmt.from);
				break;
			case "LOOP":
				this.analyzeBlock(stmt);
				break;
			case "LOAD":
				this.analyzeExpression(stmt.table);
				break;
			case "FOR":
				this.analyzeExpression(stmt.cursor, stmt);
				this.analyzeExpression(stmt.from, stmt);
				this.analyzeExpression(stmt.to, stmt);
				this.analyzeBlock(stmt.do);
				break;
			case "IF":
				this.analyzeExpression(stmt.condition, stmt);
				this.analyzeBlock(stmt.then);
				for (i = 0; i < stmt.elseif.length; i++) {
					this.analyzeExpression(stmt.elseif[i].condition, stmt);
					this.analyzeBlock(stmt.elseif[i].block);
				}
				this.analyzeBlock(stmt.else);
				break;
			case "WHILE":
				this.analyzeExpression(stmt.condition, stmt);
				this.analyzeBlock(stmt.do);
				break;
			case "DO":
				this.analyzeBlock(stmt.block);
				break;
			case "RETURN":
				this.analyzeExpression(stmt.expression, parent);
				break;
			case "ALTER":
			case "CREATE":
				resolvedId = stmt.identifier ? stmt.identifier.previousDefinition : undefined;
				stmtSchema = stmt.schema || (resolvedId ? (resolvedId.currentSchema || this.currentSchema.identifier) : this.currentSchema.identifier);
				stmtSchema = stmtSchema.identifier || stmtSchema;
				if (resolvedId && resolvedId.resolved && !resolvedId.dropped && resolvedId.schema === stmtSchema) {
					this.semanticError(stmt.identifier, "object_of_type_1_already_exists", resolvedId.kind);
				}
				if (stmt.kind === "procedure" || stmt.kind === "function" || stmt.kind === "tableFunction") {
					this.analyzeParameterDeclarations(stmt);
					this.analyzeDeclarations(stmt); // global declarations
					this.analyzeBlock(stmt.block);
				}
				if ((stmt.kind === "table" || stmt.kind === "view") && stmt.as) {
					this.analyzeExpression(stmt.as.subquery);
					this.analyzeColumnList(stmt.columns, this.resolve(stmt.as.subquery));
				}
				if (stmt.kind === "table" && stmt.like) {
					this.analyzeExpression(stmt.like.table);
					if (stmt.like.table && stmt.like.table.resolved) {
						stmt.columns = stmt.like.table.resolved.columns;
					}
				}
				break;
			case "SELECT":
			case "WITH":
				this.analyzeWithItems(stmt);
				this.analyzeExpression(stmt.from, stmt);
				this.analyzeExpression(stmt.where, stmt);
				this.analyzeExpression(stmt.groupBy, stmt);
				this.analyzeExpression(stmt.having, stmt);
				// deferred analysis of order by since columns need to be resolved already
				hasOrderBy = true;
				if (stmt.setOperator && stmt.setOperator.second) {
					this.analyzeExpression(stmt.setOperator.second, parent);
				}
				break;
			default:
				if (stmt.assignment) {
					this.analyzeExpression(stmt, parent);
					break;
				}
		}

		if (stmt.scope) {
			this.analyzeScope(stmt);
		}
		if (Array.isArray(stmt.columns) && !stmt.columns.resolved) {
			a = [];
			for (i = 0; i < stmt.columns.length; i++) {
				col = stmt.columns[i];
				resolvedCol = this.resolveColumnInScope(col, stmt);
				if (resolvedCol && col.alias) {
					// overwrite the identifier in case of columns with alias
					resolvedCol = clone(resolvedCol);
					resolvedCol.identifier = typeof col.alias === "string" ? col.alias : col.alias.identifier;
				}
				if (Array.isArray(resolvedCol)) {
					// flatten the resolved columns array in case of col.id === "*"
					Array.prototype.push.apply(a, resolvedCol);
				} else if (resolvedCol) {
					a.push(resolvedCol);
				}
			}
			a.resolved = true;
			stmt.columns.resolved = a;
			stmt.resolved = true;
			if (hasOrderBy) {
				analyzeOrderBy(this, stmt);
			}
		}
	};

	Analyzer.prototype.analyzeStatements = function(stmtsOrBlock) {
		var i, block,
			stmts = stmtsOrBlock;

		if (!stmtsOrBlock) {
			return;
		}
		if (!Array.isArray(stmtsOrBlock)) {
			stmts = stmtsOrBlock.statements;
			block = stmtsOrBlock;
		}
		if (!Array.isArray(stmts)) {
			return;
		}
		for (i = 0; i < stmts.length; i++) {
			this.analyzeStatement(stmts[i], block);
		}
	};

	Analyzer.prototype.analyze = function(pos, done) {
		var index, toResolve,
			that = this;

		function callDone() {
			if (done) {
				done(that.result);
			}
		}

		function callResolve(idx) {
			if (idx >= 0) {
				that.result.resolvedToken = that.result.tokens[idx];
			}
			callDone();
		}

		this.result.resolvedToken = undefined;
		if (pos >= 0) {
			// specific token requested
			index = getTokenIndex(this.result.tokens, pos);
			this.result.indexOfRequestedToken = index;
			if (index < 0) {
				if (done) {
					done(this.result);
				}
				return;
			}
		}

		if (!this.resolved) {
			if (this.config.resolver) {
				toResolve = this.prepareResolve();
				this.config.resolver(toResolve, function() {
					that.postResolve(toResolve);
					that.resolved = true;
					that.analyzeStatements(that.result.statements);
					callResolve(index);
				}, this.args);
			} else {
				callDone();
			}
		} else {
			callResolve(index);
		}

	};

	return {
		defaultConfig: defaultConfig,
		init: init
	};

});