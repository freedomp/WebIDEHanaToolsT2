/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

/*
 * SQL parser consumer interface
 */
/*global define*/
define(function(require) {
	"use strict";

	var reserved,
		Utils = require("./parserutils"),
		Parser = require("./parser"),
		modules = [];

	// load modules
	modules.push(require("./analyzer"));
	modules.push(require("./expression"));
	modules.push(require("./select"));
	modules.push(require("./insert"));
	modules.push(require("./update"));
	modules.push(require("./create"));
	modules.push(require("./delete"));
	modules.push(require("./drop"));
	modules.push(require("./set"));
	modules.push(require("./load"));

	reserved = {
		defaultConfig: {
			// TODO: remove dummy config once stmt is implemented
			"commit": {},
			"comment": {},
			"grant": {},
			"import": {},
			"truncate": {}
		},
		init: function(parser) {
			// TODO: remove dummy stmt definition once stmt is implemented
			parser.stmt("COMMIT");
			parser.stmt("COMMENT");
			parser.stmt("GRANT");
			parser.stmt("IMPORT");
			parser.stmt("TRUNCATE");
			// TODO: remove reserved from here words once implemened
			parser.symbol("BEFORE");
			parser.symbol("BEGIN");
			parser.symbol("BOTH");
			parser.symbol("CHAR");
			parser.symbol("CONDITION");
			parser.symbol("CONNECT");
			parser.symbol("CUBE");
			parser.symbol("CURRVAL");
			parser.symbol("CURSOR");
			parser.symbol("DECLARE");
			parser.symbol("ELSE");
			parser.symbol("ELSEIF");
			parser.symbol("END");
			parser.symbol("EXCEPTION");
			parser.symbol("EXEC");
			parser.symbol("FOR");
			parser.symbol("IF");
			parser.symbol("INOUT");
			parser.symbol("LEADING");
			parser.symbol("LOOP");
			parser.symbol("MINUS");
			parser.symbol("NATURAL");
			parser.symbol("NCHAR");
			parser.symbol("NEXTVAL");
			parser.symbol("OUT");
			parser.symbol("PRIOR");
			parser.symbol("RETURN");
			parser.symbol("RETURNS");
			parser.symbol("REVERSE");
			parser.symbol("ROLLUP");
			parser.symbol("ROWID");
			parser.symbol("SESSION_USER");
			parser.symbol("SQL");
			parser.symbol("START");
			parser.symbol("SYSUUID");
			parser.symbol("TABLESAMPLE");
			parser.symbol("TRAILING");
			parser.symbol("USING");
			parser.symbol("UTCTIMESTAMP");
			parser.symbol("WHEN");
			parser.symbol("WHILE");
		}
	};
	modules.push(reserved);

	function makeConfig(config) {
		return Parser.makeConfig(modules, config);
	}

	function makeParse(config) {
		var parser;

		function parse() {
			return parser.parse.apply(parser, arguments);
		}

		if (!config) {
			config = makeConfig();
		}
		parser = new Parser(modules, config);
		return parse;
	}

	return {
		makeParse: makeParse,
		makeConfig: makeConfig,
		Utils: Utils
	};

});