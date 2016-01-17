/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

/*
 * Parser module for update statement
 */
/*global define*/
/*eslint-disable no-constant-condition, quotes*/
define(function(require) {
	"use strict";

	var Parser = require("./parser"),
		defaultConfig = {
			"update": {} // enabled the update statement, detailed, statement specific config. can be stored inside
		};

	/*
	 * Parses a column definition in update statement
	 */
	Parser.prototype.parseUpdateItem = function() {
		var result = this.parseObjectRef({
			pathType: "table",
			aliasType: "explicit"
		});
		return result;
	};

	Parser.prototype.parseSetList = function() {
		var tok = this.token,
			result = [],
			col;
		while (true) {
			col = this.parseExpression(0, false, {
				pathType: "column"
			});
			if (!col) {
				break;
			} else {
				result.push(col);
			}
			if (this.nextToken.id !== ",") {
				break;
			}
			this.advance(",");
		}
		if (result.length === 0) {
			this.error(tok, "no_columns");
		}
		return result;
	};

	function init(parser) {
		var updateStmt, assignmentOp;

		updateStmt = parser.stmt("UPDATE", function() {
			var oldScope = parser.scope;

			parser.scope = Object.create(oldScope);
			this.scope = parser.scope;
			this.table = parser.parseUpdateItem();
			parser.parseClauses(this, ["SET", "FROM", "WHERE"], {
				"SET": true
			});
			parser.scope = oldScope;
			return this;
		});

		updateStmt.clause("SET", function(stmt) {
			stmt.set = parser.parseSetList(0);
			return stmt.set;
		});

		updateStmt.clause("FROM", function(stmt) {
			stmt.from = parser.makeParseList(parser.parseFromItem, "no_tables")();
			return stmt.from;
		});

		updateStmt.clause("WHERE", function(stmt) {
			stmt.where = parser.parseCondition();
			return stmt.where;
		});

		assignmentOp = updateStmt.symbol("=", 67);
		assignmentOp.led = function(left) {
			this.first = left;
			this.arity = "infix";
			this.second = parser.parseExpression(0, false, {
				pathType: "column",
				callType: "function"
			});
			return this;
		};

	}

	return {
		init: init,
		defaultConfig: defaultConfig
	};

});