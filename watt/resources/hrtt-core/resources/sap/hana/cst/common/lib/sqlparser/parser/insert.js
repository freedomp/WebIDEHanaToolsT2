/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

/*
 * Parser module for insert statement
 */
/*global define*/
/*eslint-disable no-constant-condition, quotes*/
define(function(require) {
	"use strict";

	var Parser = require("./parser"),
		defaultConfig = {
			"insert": {}, // enabled the insert statement, detailed, statement specific config. can be stored inside
			"upsert": {},
			"replace": {}
		};

	/*
	 * Parses a value definition in insert statement
	 */
	Parser.prototype.parseValueItem = function() {
		var tok;
		tok = this.parseExpression(0, false, {
			pathType: "column",
			callType: "function"
		});
		return tok;
	};

	/*
	 * Parses a list of values
	 */
	Parser.prototype.parseValuesList = function() {
		var tok = this.token,
			result = [],
			col;
		if (this.nextToken.id === "(") {
			this.advance("(");
		}
		while (true) {
			col = this.parseValueItem();
			if (!col) {
				break;
			} else {
				result.push(col);
			}
			if (this.nextToken.id !== ",") {
				this.advance(")");
				break;
			}
			this.advance(",");
		}
		if (result.length === 0) {
			this.error(tok, "no_values");
		}
		return result;
	};

	function init(parser) {
		var insertStmt,
			upsertStmt,
			replaceStmt;

		function parseClauseTable(stmt) {
			stmt.table = parser.parseObjectRef("table");
			var columns = parser.parseColumnsList(stmt.table);
			if (columns.length > 0) {
				stmt.columns = columns;
			}
			return stmt.table;
		}

		function parseValueClause(stmt) {
			stmt.values = parser.parseValuesList();
			return stmt.values;
		}

		function parseValueClauseWithOption(stmt) {
			stmt.values = parser.parseValuesList();

			if (parser.advanceIf("WHERE")) {
				var where = parser.parseExpression(0, false, {
					pathType: "column",
					callType: "function"
				}, true);
				if (where) {
					stmt.where = where;
				}
			} else if (parser.advanceIf("WITH")) {
				parser.advance("PRIMARY");
				parser.advance("KEY");
				stmt.withPrimaryKey = true;
			}

			return stmt.values;
		}

		insertStmt = parser.stmt("INSERT", function() {
			parser.parseClauses(this, ["INTO"], {
				"INTO": true
			});
			if (parser.nextToken.id === "SELECT") {
				this.values = parser.parseExpression(0, true);
			} else {
				parser.parseClauses(this, ["VALUES"]);
			}
			return this;
		});

		upsertStmt = parser.stmt("UPSERT", function() {
			parseClauseTable(this);
			if (parser.nextToken.id === "SELECT") {
				this.values = parser.parseExpression(0, true);
			} else {
				parser.parseClauses(this, ["VALUES"]);
			}
			return this;
		});

		replaceStmt = parser.stmt("REPLACE", function() {
			parseClauseTable(this);
			if (parser.nextToken.id === "SELECT") {
				this.values = parser.parseExpression(0, true);
			} else {
				parser.parseClauses(this, ["VALUES"]);
			}
			return this;
		});

		insertStmt.clause("INTO", parseClauseTable);
		insertStmt.clause("VALUES", parseValueClause);
		upsertStmt.clause("VALUES", parseValueClauseWithOption);
		replaceStmt.clause("VALUES", parseValueClauseWithOption);

	}

	return {
		init: init,
		defaultConfig: defaultConfig
	};

});