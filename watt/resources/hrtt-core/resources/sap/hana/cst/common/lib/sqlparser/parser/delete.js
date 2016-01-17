/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

/*
 * Parser module for delete statement
 */
/*global define*/
/*eslint-disable no-constant-condition, quotes*/
define(function() {
	"use strict";

	var defaultConfig = {
		"delete": {} // enabled the delete statement, detailed, statement specific config. can be stored inside
	};

	function init(parser) {
		var deleteStmt;

		deleteStmt = parser.stmt("DELETE", function() {
			var oldScope = parser.scope;

			parser.scope = Object.create(oldScope);
			this.scope = parser.scope;
			if (parser.nextToken.id === "HISTORY") {
				parser.advance("HISTORY");
				this.history = true;
			}

			parser.parseClauses(this, ["FROM", "WHERE"], {
				"FROM": true
			});
			parser.scope = oldScope;
			return this;
		});
		parser.symbol("HISTORY");
		deleteStmt.clause("FROM", function(stmt) {
			stmt.from = parser.parseObjectRef({
				pathType: "table",
				aliasType: "explicit",
				definition: true
			});
			return stmt.from;
		});

		deleteStmt.clause("WHERE", function(stmt) {
			stmt.where = parser.parseCondition();
			return stmt.where;
		});

	}

	return {
		init: init,
		defaultConfig: defaultConfig
	};

});