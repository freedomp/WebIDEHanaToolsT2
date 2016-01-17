/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

/*
 * Parser module for SQL expressions
 */
/*global define*/
define(function() {
	"use strict";

	var defaultConfig = {
		"expression": {} // enabled the select statement, detailed, statement specific config. can be stored inside
	};

	function init(parser) {

		function parseExpressionOrSubquery() {
			return parser.parseExpression(0, true);
		}

		function comparison(id) {

			var symbol = parser.infix(id, 67, function(left) {
				var peek = parser.peek();

				this.first = left;
				if (peek && peek.value === "(") {
					if (parser.nextToken.id === "ALL") { // ALL is a reserved word
						this.predicate = "ALL";
					} else if (parser.nextToken.identifier === "ANY") {
						this.predicate = "ANY";
					} else if (parser.nextToken.identifier === "SOME") {
						this.predicate = "SOME";
					}
				}
				if (this.predicate) {
					parser.advance();
					parser.advance("(");
					this.second = parser.makeParseList(parseExpressionOrSubquery, "expected_expression_or_subquery")();
					parser.advance(")");
				} else {
					this.second = parser.parseExpression(67);
				}
				return this;
			}, true);

			return symbol;
		}

		// scalar variable assignment
		parser.infix(":=", 20, function(left) {
			this.assignment = true;
			this.first = left;
			this.second = parser.parseExpression(20);
			return this;
		});

		// table variable assignment
		parser.infix("=", 20, function(left) {
			this.assignment = true;
			this.first = left;
			this.second = parseExpressionOrSubquery();
			return this;
		});

		// NULL belongs to IS [NOT] NULL, set lbp accordingly
		// NULL is also the constant for the NULL value
		parser.constant("NULL", "NULL", 67);
		parser.symbol("FALSE");
		parser.symbol("TRUE");
		parser.symbol("UNKNOWN");

		// OR is not a reserved word
		parser.infix("OR", 64, function(left) {
			this.first = left;
			this.type = "operator";
			this.second = parser.parseCondition(64);
			return this;
		});

		// AND is not a reserved word
		parser.infix("AND", 65, function(left) {
			this.first = left;
			this.type = "operator";
			this.second = parser.parseCondition(65);
			return this;
		});

		parser.prefix("NOT", function() {
			this.type = "operator";
			if (parser.nextToken.id === "NOT") {
				parser.error(parser.nextToken, "invalid_double_negation");
				parser.advance();
			}
			this.first = parser.parseCondition(66);
			return this;
		});
		// NOT in case of infix operators like IN, LIKE
		// delegate to the operator
		parser.infix("NOT", 67, function(left, rbp) {
			var tok;

			if (rbp < parser.nextToken.lbp && parser.nextToken.led) {
				parser.advance();
				tok = parser.token.led(left, rbp);
			} else {
				parser.error(parser.token, "expected_operator");
			}
			return tok;
		});

		comparison("=", 67);
		comparison("!=", 67);
		comparison("<>", 67);
		comparison("<", 67);
		comparison(">", 67);
		comparison("<=", 67);
		comparison(">=", 67);

		parser.infix("LIKE", 67, function(left) {
			this.first = left;
			this.type = "operator";
			if (parser.prevToken.id === "NOT") {
				this.inverse = true;
			}
			this.second = {};
			this.second.pattern = parser.parseExpression(67);
			if (parser.advanceIf("ESCAPE")) {
				this.second.escape = parser.parseExpression(67);
			}
			return this;
		});

		parser.reservedSymbolTable.IN = parser.infix("IN", 67, function(left) {
			this.first = left;
			this.type = "operator";
			if (parser.prevToken.id === "NOT") {
				this.inverse = true;
			}
			parser.advance("(");
			this.second = parser.makeParseList(parseExpressionOrSubquery, "expected_expression_or_subquery")();
			parser.advance(")");
			return this;
		});

		parser.reservedSymbolTable.IS = parser.suffix("IS", 67, function(left) {
			this.first = left;
			this.type = "operator";
			if (parser.nextToken.id === "NOT") {
				parser.advance();
				this.inverse = true;
			}
			parser.advance("NULL");
			return this;
		});

		// NOT EXISTS requires to set lbp accordingly
		parser.operator("EXISTS", 67);
		parser.prefix("EXISTS", function() {
			this.type = "operator";
			parser.advance('(');
			this.first = parseExpressionOrSubquery();
			parser.advance(')');
			return this;
		});

		parser.infix("BETWEEN", 67, function(left) {
			this.first = left;
			this.type = "operator";
			if (parser.prevToken.id === "NOT") {
				parser.advance();
				this.inverse = true;
			}
			this.second = {};
			this.second.low = parser.parseExpression(67);
			if (parser.nextToken.id === "AND") {
				parser.advance();
				this.second.high = parser.parseExpression(67);
			} else {
				parser.error(parser.nextToken, "expected_1_found_0", "AND");
			}
			return this;
		});

		parser.infix("||", 68);

		parser.infix("+", 69);
		parser.prefix("+");
		parser.infix("-", 69);
		parser.prefix("-");

		parser.infix("*", 70);
		parser.infix("/", 70);

		parser.infix("..", 60);

		// parser.infix("(", 80) defined in parser.js
		parser.prefix("(", function() {
			var a, e, result = parseExpressionOrSubquery();
			// expression lists like in WHERE (1,1+2) IN (...)
			if (result && parser.pathConfig.expressionList) {
				a = [];
				e = result;
				while (e) {
					a.push(e);
					if (parser.advanceIf(",")) {
						e = parseExpressionOrSubquery();
					} else {
						break;
					}
				}
				if (a.length > 1) {
					result = a;
				}
			}

			if (parser.advance(")") && parser.pathConfig.aliasType === "explicit") {
				parser.parseAlias(result);
			}
			return result;
		});

		parser.prefix("NEW", function() {
			this.type = "operator";
			this.first = parser.parseExpression(79);
			return this;
		});

		parser.reservedSymbolTable.CASE = parser.prefix("CASE", function() {
			var whenThen,
				mandatoryWhen = true,
				useCondition = true;

			this.type = "operator";
			this.first = [];
			if (parser.nextToken.id !== "WHEN") {
				whenThen = [];
				whenThen[0] = parser.parseExpression(67);
				this.first.push(whenThen);
				useCondition = false;
			}
			while (parser.nextToken.id === "WHEN" || mandatoryWhen) {
				mandatoryWhen = false;
				whenThen = [];
				if (parser.advance("WHEN")) {
					if (useCondition) {
						whenThen[0] = parser.parseCondition();
					} else {
						whenThen[0] = parser.parseExpression(67);
					}
					if (parser.advance("THEN")) {
						whenThen[1] = parser.parseExpression(67);
					}
					this.first.push(whenThen);
				}
			}
			whenThen = [];
			if (parser.advanceIf("ELSE")) {
				whenThen[1] = parser.parseExpression(67);
				this.first.push(whenThen);
			}
			parser.advance("END");

			return this;
		});
	}

	return {
		init: init,
		defaultConfig: defaultConfig
	};

});