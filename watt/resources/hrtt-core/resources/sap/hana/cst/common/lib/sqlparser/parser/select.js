/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

/*
 * Parser module for select statement
 */
/*global define*/
/*eslint-disable no-constant-condition, quotes*/
/*jshint white: false */
define(function(require) {
	"use strict";

	var Parser = require("./parser"),
		defaultConfig = {
			"select": {}, // enabled the select statement, detailed, statement specific config. can be stored inside
			"with": {}
		};

	/*
	 * Parses a subquery | table name | or joined table
	 */
	Parser.prototype.parseFromItem = function() {
		var item,
			firstTok = this.nextToken,
			oldJoinAllowed = this.joinAllowed;

		this.joinAllowed = true;
		// table ref., JOIN, or subquery
		item = this.parseExpression(30, false, {
			pathType: "table",
			aliasType: "explicit",
			callType: "tableFunction", // table function or parametrized column views, e.g.: FROM "_SYS_BIC"."tst"(placeholder."$$p1$$"=>'2')
			definition: true
		});

		if (item && item.id === "SELECT") {
			// define subquery
			this.define(item, item.alias);
		}
		// identifiers must not be enclosed in brackets
		if (item && item.identifier && firstTok.id === "(") {
			this.error(firstTok, 'expected_path_or_identifier');
		}

		this.joinAllowed = oldJoinAllowed;
		return item;
	};

	Parser.prototype.parseWithItem = function() {
		var id, item, subquery;

		this.parseIdentifier("query");
		item = this.token;
		item.isAlias = true;
		item.columnNames = item.columns = this.parseColumnsList();
		this.advance("AS");
		this.advance("(");
		subquery = this.parseExpression(0, true);
		if (subquery && subquery.id === "SELECT") {
			item.definition = subquery;
			if (item.columns.length === 0) {
				// no columns list specified, take over columns from subquery, otherwise columns list is resolved in analyzer
				item.columns = subquery.columns;
			}
		} else {
			this.error(subquery || this.nextToken, 'expected_1_found_0', "SELECT");
		}
		id = Parser.makeID(item);
		this.scope[id] = item;
		this.advance(")");
		return item;
	};

	Parser.prototype.parseGroupByExpression = function() {
		var expr,
			parser = this;

		function parseExpression() {
			return parser.parseExpression(0, false, "column");
		}

		function parseGroupingExpression() {
			var result;

			if (parser.advanceIf("(")) {
				// grouping set expressionlist
				result = parser.makeParseList(parseExpression, "no_expression")();
				parser.advance(")");
			} else {
				result = parseExpression();
			}
			return result;
		}

		if (this.advanceIf("GROUPING")) {
			expr = this.token;
			this.advance("SETS");
		} else if (this.advanceIf("ROLLUP")) {
			expr = this.token;
		} else if (this.advanceIf("CUBE")) {
			expr = this.token;
		}

		if (expr) {
			expr.kind = "grouping set";
			// grouping set
			if (this.advanceIf("BEST")) {
				if (this.parseInteger(true)) {
					expr.best = this.token;
				}
			}
			if (this.advanceIf("LIMIT")) {
				this.parseInteger();
				expr.limit = this.token;
				if (this.advanceIf("OFFSET")) {
					this.parseInteger();
					expr.offset = this.token;
				}
			}
			if (this.advanceIf("WITH")) {
				if (this.advanceIf("SUBTOTAL")) {
					expr.with = "subtotal";
				} else if (this.advanceIf("BALANCE")) {
					expr.with = "balance";
				} else {
					this.advance("TOTAL");
					expr.with = "total";
				}
			}
			if (this.advanceIf("TEXT")) {
				this.advance("FILTER");
				// filterspec
				this.parseString();
				if (this.advanceIf("FILL")) {
					this.advance("UP");
					if (this.advanceIf("SORT")) {
						this.advance("MATCHES");
						this.advance("TO");
						this.advance("TOP");
					}
				}
			}
			if (this.advanceIf("STRUCTURED")) {
				this.advance("RESULT");
				if (this.advanceIf("WITH")) {
					this.advance("OVERVIEW");
				}
				if (this.advanceIf("PREFIX")) {
					// prefix table name
					this.advance("#");
					this.parseIdentifier();
				} else {
					this.advance("MULTIPLE");
					this.advance("RESULTSETS");
				}
			}

			if (this.advance("(")) {
				// grouping set expressionlist
				expr.expressions = this.makeParseList(parseGroupingExpression, "no_expression")();
				this.advance(")");
			} else {
				// skip grouping set details like BEST, LIMIT, ...
				this.advance();
			}
		} else {
			expr = this.parseExpression(79, false, {
				pathType: "column",
				callType: "function"
			});
		}
		return expr;
	};

	Parser.prototype.parseOrderByExpression = function() {
		var expr;

		expr = this.parseExpression(79, false, {
			pathType: "column",
			callType: "function"
		});
		if (expr) {
			// ASC, DESC, NULLS FIRST, NULLS LAST are not reserved words
			if (!this.advanceIf("ASC")) {
				if (this.advanceIf("DESC")) {
					expr.descending = true;
				}
			}
			if (this.advanceIf("NULLS")) {
				if (!this.advanceIf("FIRST")) {
					if (this.advanceIf("LAST")) {
						expr.nullsLast = true;
					} else {
						this.error(this.nextToken, "expected_first_or_last");
					}
				}
			}
		}
		return expr;
	};

	Parser.prototype.parseLimit = function(tok) {
		var limit;

		if (this.advanceIf("LIMIT")) {
			limit = this.parseInteger(false, true);
			// number or varref allowed
			if (typeof limit === "number" || typeof limit === "object") {
				tok.limit = limit;
				if (this.advanceIf("OFFSET")) {
					tok.offset = this.parseInteger(false, true);
				}
				return true;
			}
		}

		return false;
	};

	function init(parser) {
		var selectStmt,
			setOperators = [];

		function isSetOperator(tok) {
			return setOperators.indexOf(tok.id) >= 0;
		}

		function parseAs(tok) {
			// time travel
			if (!parser.advance("OF")) {
				return;
			}

			if (parser.advanceIf("COMMIT")) {
				if (parser.advance("ID") && parser.parseInteger()) {
					tok.timeTravel = parser.token;
				}
			} else {
				if (parser.advance("UTCTIMESTAMP") && typeof parser.parseString() === "string") {
					tok.timeTravel = parser.token;
				}
			}
		}

		function parseForUpdate(tok) {
			if (!parser.advance("UPDATE")) {
				return;
			}
			if (parser.advanceIf("OF")) {
				tok.forUpdate = parser.makeParseList(parser.parseColumnRef, "no_columns")();
			} else {
				tok.forUpdate = [];
			}
		}

		function makeOrderBy() {
			var s,
				id = "ORDER";

			s = parser.symbol(id, 26);
			s.led = function(left) {
				var orderBy;

				if (left.id !== "SELECT" && left.id !== "WITH") {
					return undefined;
				}

				parser.advance("BY");
				orderBy = parser.makeParseList(parser.parseOrderByExpression, "no_order_by_expression")();
				if (orderBy && orderBy.length > 0) {
					if (left.id === "OVER") {
						left.second.orderBy = orderBy;
					} else {
						left.orderBy = orderBy;
					}
				}

				if (left.id === "SELECT" || left.id === "WITH") {
					parser.parseLimit(left);
				}
				return left;
			};
			return s;
		}

		function setOperator(id, led) {
			var s;

			setOperators.push(id);

			s = parser.symbol(id, 30);
			s.led = function(left) {
				var first, second, stmt,
					tok = this;

				if (left.id !== "SELECT" && left.id !== "WITH" && !isSetOperator(left)) {
					return undefined;
				}
				tok.type = "operator";
				tok.arity = "infix";
				tok.first = left;

				if (typeof led === 'function') {
					led.call(tok, left);
				}

				second = parser.parseExpression(30, true, {
					pathType: "table"
				});

				if (second) {
					if (second.id === "SELECT" || isSetOperator(second)) {
						tok.second = second;
					} else {
						parser.error(second || tok, "expected_select_or_set_operator");
					}
				}

				if (typeof tok.firstIndex !== "number") {
					first = tok.first || tok;
					tok.firstIndex = typeof first.firstIndex === "number" ? first.firstIndex : first.index;
				}
				if (typeof tok.lastIndex !== "number") {
					second = tok.second || tok;
					tok.lastIndex = typeof second.lastIndex === "number" ? second.lastIndex : second.index;
				}

				if (!isSetOperator(parser.nextToken)) {
					// last set operator found, link operator tree to select statement
					while (tok.first.first) {
						tok = tok.first;
					}
					stmt = tok.first;
					stmt.setOperator = this;
					delete tok.first;
					return stmt;
				}

				return tok;
			};
			return s;
		}

		function join(id, led) {
			var s;

			s = parser.symbol(id, 40);
			s.led = function(left) {
				var oldScope, first, second, on,
					tok = this;

				if (!parser.joinAllowed) {
					return undefined;
				}

				if (typeof led === 'function') {
					tok = led.call(this, left);
				}
				tok.arity = "infix";
				tok.type = "operator";
				tok.joinType = tok.joinType || "INNER";
				tok.first = left;
				tok.second = parser.parseExpression(39, false, {
					pathType: "table",
					aliasType: "explicit",
					definition: true
				});

				if (tok.first && tok.first.id === "SELECT") {
					// define subquery
					parser.define(tok.first, tok.first.alias);
				}
				if (tok.second && tok.second.id === "SELECT") {
					// define subquery
					parser.define(tok.second, tok.second.alias);
				}

				if (tok.second && tok.joinType !== "CROSS") {
					parser.advance("ON");
					on = parser.token;
					oldScope = parser.scope;
					parser.scope = tok.scope = Object.create(parser.parentScope);
					parser.mergeScope(tok.scope, tok.first, tok.second);
					tok.on = parser.parseCondition();
					on = tok.on || on;
					parser.scope = oldScope;
				}

				// calculate span
				if (typeof tok.firstIndex !== "number") {
					first = tok.first || tok;
					tok.firstIndex = typeof first.firstIndex === "number" ? first.firstIndex : first.index;
				}
				if (typeof tok.lastIndex !== "number") {
					second = on || tok.second || tok;
					tok.lastIndex = typeof second.lastIndex === "number" ? second.lastIndex : second.index;
				}

				return tok;
			};
			return s;
		}

		// global symbols
		parser.symbol("ALL");
		parser.symbol("DISTINCT");
		// join types and set operators are registered via join/setOperator function
		parser.symbol("INTO");
		parser.symbol("FROM");
		parser.symbol("GROUP");
		parser.symbol("HAVING");
		parser.symbol("FROM");
		parser.symbol("LIMIT");
		parser.symbol("ON");
		parser.symbol("TOP");
		makeOrderBy();

		selectStmt = parser.stmt("SELECT", function() {
			var expr, tok, parent, isInBrackets, oldScope;

			tok = this;
			parent = parser.tokens[tok.parent];
			if (parent && parent.id === "WITH" && parent._expectOwnSelect) {
				// correct parent token and index
				tok = parent;
				parent = parser.tokens[tok.parent];
				delete tok._expectOwnSelect;
				parser.parentIndex = tok.index;
				parser.nextToken.parent = tok.index;
			}

			isInBrackets = parser.prevToken.id === "(";
			oldScope = parser.scope;
			tok.parentScope = parser.parentScope;

			parser.scope = tok.scope = parser.parentScope = Object.create(parser.parentScope);

			if (parser.advanceIf("TOP")) {
				tok.top = parser.parseInteger(false, true);
			}
			if (parser.advanceIf("DISTINCT")) {
				tok.distinct = true;
			} else {
				parser.advanceIf("ALL");
			}
			tok.columns = parser.makeParseList(parser.parseSelectItem, "no_columns")();
			parser.parseClauses(tok, ["INTO", "FROM", "WHERE", "GROUP", "HAVING"], {
				"FROM": true
			});
			if (!tok.from) {
				tok.from = [];
			}

			if (!parent || parent.id !== "SELECT" || isInBrackets) {
				// parse set operators/ORDER BY as operators since they might appear outside of bracket, e.g.:
				//   (select * from t) order by c;
				// instead of
				//   select * from t order by c;

				parser.parentScope = tok.parentScope || null;
				expr = parser.parseInfix(26, tok);
				if (expr && expr !== tok) {
					parser.error(expr, "expected_set_operator");
				}
				parser.parentScope = tok.scope;

				// parse order by
				if (parser.nextToken.id === "ORDER") {
					expr = parser.parseInfix(25, tok);
				} else {
					// limit is already parsed with ORDER BY, we have to parse it here only if no ORDER BY clause is present
					parser.parseLimit(tok);
				}
				// parse time travel (AS OF) or FOR UPDATE
				if (parser.advanceIf("AS")) {
					parseAs(tok);
				} else if (parser.advanceIf("FOR")) {
					parseForUpdate(tok);
				}
			}

			if (parent && tok.id !== "WITH" && parser.nextToken.id !== "(end)") {
				// repair parent index of following token in case we are in a subquery, join, or set operator
				parser.nextToken.parent = tok.parent;
			}

			if (tok.parentScope && tok.id !== "WITH") {
				parser.resolveUndefinedNamesInScope(tok.scope, tok.parentScope);
			}
			parser.scope = oldScope;
			parser.parentScope = tok.parentScope;
			delete tok.parentScope;
			return tok;
		});

		// register SELECT in symbolTable
		parser.symbolTable.SELECT = selectStmt;

		parser.stmt("WITH", function() {
			var tok,
				oldScope = parser.scope;

			// tok.scope will be set in SELECT
			parser.scope = parser.parentScope = Object.create(null);

			this.items = parser.makeParseList(parser.parseWithItem, "no_with_list_items")();

			// parse SELECT clause
			this._expectOwnSelect = true;
			tok = parser.nextToken;
			parser.parseExpression(0, true);
			if (this._expectOwnSelect) {
				parser.error(tok, "expected_select_clause");
			}

			parser.scope = oldScope;
			parser.parentScope = null;
			return this;
		});

		parser.operator("*", 0).nud = function() {
			parser.pathSegments.push(this);
			parser.closePath();
			return this;
		};

		join("JOIN");

		join("INNER", function() {
			var tok;

			parser.advance("JOIN");
			tok = parser.token;
			return tok;
		});

		join("LEFT", function() {
			var tok;

			parser.advanceIf("OUTER");
			parser.advance("JOIN");
			tok = parser.token;
			tok.joinType = "LEFT OUTER";
			return tok;
		});

		join("RIGHT", function() {
			var tok;

			parser.advanceIf("OUTER");
			parser.advance("JOIN");
			tok = parser.token;
			tok.joinType = "RIGHT OUTER";
			return tok;
		});

		join("FULL", function() {
			var tok;

			parser.advanceIf("OUTER");
			parser.advance("JOIN");
			tok = parser.token;
			tok.joinType = "FULL OUTER";
			return tok;
		});

		join("CROSS", function() {
			var tok;

			parser.advance("JOIN");
			tok = parser.token;
			tok.joinType = "CROSS";
			return tok;
		});

		setOperator("UNION", function() {
			var tok = parser.token;

			if (!parser.advanceIf("ALL")) {
				parser.advanceIf("DISTINCT");
				this.distinct = true;
			}
			return tok;
		});

		setOperator("INTERSECT", function() {
			var tok = parser.token;

			parser.advanceIf("DISTINCT");
			tok.distinct = true;
			return tok;
		});

		setOperator("EXCEPT", function() {
			var tok = parser.token;

			parser.advanceIf("DISTINCT");
			tok.distinct = true;
			return tok;
		});

		selectStmt.clause("INTO", function(stmt) {
			var parent = parser.tokens[stmt.parent];
			if (!parent || (parent.id !== "BEGIN" && parent.id !== "IF" && parent.id !== "FOR" && parent.id !== "LOOP" && parent.id !== "WHILE")) {
				parser.error(parser.token, 'select_into_not_supported_here');
			}
			stmt.into = parser.makeParseList(parser.parseVariableName, "no_variables")();
			return stmt.into;
		});

		selectStmt.clause("FROM", function(stmt) {
			var oldParentScope;

			oldParentScope = parser.parentScope;

			parser.parentScope = stmt.parentScope || null;
			stmt.from = parser.makeParseList(parser.parseFromItem, "no_tables")();

			parser.parentScope = oldParentScope;
			return stmt.from;
		});

		selectStmt.clause("WHERE", function(stmt) {
			var where = parser.parseCondition();
			if (where) {
				stmt.where = where;
			}
			return stmt.where;
		});

		selectStmt.clause("GROUP", function(stmt) {
			var groupBy;

			parser.advanceIf("BY");
			groupBy = parser.makeParseList(parser.parseGroupByExpression, "no_group_by_expression")();
			if (groupBy && groupBy.length > 0) {
				stmt.groupBy = groupBy;
			}
			return stmt.groupBy;
		});

		selectStmt.clause("HAVING", function(stmt) {
			var having;

			having = parser.parseCondition();
			if (having) {
				stmt.having = having;
			}
			return stmt.having;
		});

	}

	return {
		init: init,
		defaultConfig: defaultConfig
	};

});