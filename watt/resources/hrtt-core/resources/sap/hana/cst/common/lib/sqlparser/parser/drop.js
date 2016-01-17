/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

/*
 * Parser module for drop statement
 */
/*global define*/
/*jshint -W024 */
/*eslint-disable no-constant-condition, quotes*/
define(function() {
	"use strict";

	var defaultConfig = {
		"drop": {} // enabled the delete statement, detailed, statement specific config. can be stored inside
	};

	function init(parser) {

		function parseDropObject(tok, kind) {
			var id;

			tok.kind = kind || parser.token.value.toLowerCase();
			id = parser.parseObjectRef({
				pathType: tok.kind,
				globalObject: tok
			});
			if (!id) {
				return tok;
			}
			tok.identifier = id;
			if (id.schema) {
				tok.schema = id.schema;
			}
			parser.undefine(tok);
			return tok;
		}

		function parseDropUnqualifiedObject(tok, kind, simple) {
			var id;

			tok.kind = kind || parser.token.value.toLowerCase();
			if (simple) {
				id = parser.parseSimpleIdentifier(tok.kind);
			} else {
				id = parser.parseIdentifier(tok.kind);
			}
			if (!id) {
				return tok;
			}
			tok.identifier = parser.token;
			return tok;
		}

		function parseDropOption(tok) {
			if (parser.advanceIf("CASCADE")) {
				tok.option = "CASCADE";
			} else {
				// default
				parser.advanceIf("RESTRICT");
				tok.option = "RESTRICT";
			}
		}

		function parseDropObjectWithOption(tok, kind) {
			parseDropObject(tok, kind);
			parseDropOption(tok);
			return tok;
		}

		function parseDropSchema(tok, kind) {
			var i, keys, obj, objSchema;

			parseDropObjectWithOption(tok, kind);
			if (tok.option === "CASCADE") {
				keys = Object.keys(parser.globalScope);
				for (i = 0; i < keys.length; i++) {
					obj = parser.globalScope[keys[i]];
					objSchema = obj.schema || obj.currentSchema;
					if (objSchema === tok.identifier.identifier) {
						parser.undefine(keys[i]);
					}
				}
			}
			return tok;
		}

		function parseDropStorage(tok) {
			parser.advance("STORAGE");
			tok.kind = "extended storage";
			parseDropOption(tok);
			return tok;
		}

		function parseDropAuditPolicy(tok) {
			parser.advance("POLICY");
			parseDropUnqualifiedObject(tok, "audit policy");
			return tok;
		}

		function parseDropCredential(tok) {
			tok.kind = "credential";
			parser.advance("FOR");
			if (parser.advanceIf("USER")) {
				if (parser.parseSimpleIdentifier("user")) {
					tok.user = parser.token;
				}
			}
			parser.advance("COMPONENT");
			if (typeof parser.parseString() === "string") {
				tok.component = parser.token;
			}
			parser.advance("PURPOSE");
			if (typeof parser.parseString() === "string") {
				tok.purpose = parser.token;
			}
			parser.advance("TYPE");
			if (typeof parser.parseString() === "string") {
				tok.type = parser.token;
			}
			return tok;
		}

		function parseDropFulltextIndex(tok) {
			parser.advance("INDEX");
			return parseDropObject(tok, "fulltext index");
		}

		function parseStatisticsType(tok) {
			if (parser.advanceIf("HISTOGRAM")) {
				tok.option = "HISTOGRAM";
			} else if (parser.advanceIf("SIMPLE")) {
				tok.option = "SIMPLE";
			} else if (parser.advanceIf("ALL")) {
				tok.option = "ALL";
			} else {
				parser.error(parser.nextToken, '0_not_supported');
			}
		}

		function parseDropStatistics(tok) {
			var table, columns;

			if (parser.advanceIf("ON")) {
				tok.kind = "statistics";
				table = parser.parseObjectRef("table");
				if (table) {
					tok.on = table;
					columns = parser.parseColumnsList(table);
					if (columns.length > 0) {
						tok.columns = columns;
					}
				}

				if (parser.advanceIf("TYPE")) {
					parseStatisticsType(tok);
				} else {
					tok.option = "ALL";
				}
			} else {
				parseDropUnqualifiedObject(tok, "statistics");
			}
			return tok;
		}

		function parseDropRemoteSource(tok) {
			parser.advance("SOURCE");
			parseDropUnqualifiedObject(tok, "remote source");
			parseDropOption(tok);
			return tok;
		}

		function parseDropRole(tok) {
			parseDropUnqualifiedObject(tok, "role");
			return tok;
		}

		function parseDropUser(tok) {
			parseDropUnqualifiedObject(tok, "user", true);
			parseDropOption(tok);
			return tok;
		}

		function parseDropSamlProvider(tok) {
			parser.advance("PROVIDER");
			parseDropUnqualifiedObject(tok, "saml provider", true);
			return tok;
		}

		function parseDropSynonym(tok) {
			if (parser.advanceIf("SYNONYM")) {
				tok.isPublic = true;
			} else {
				tok.isPublic = false;
			}
			return parseDropObjectWithOption(tok);
		}

		parser.stmt("DROP", function() {
			var tok = parser.token;

			parser.advanceCase({
				"AUDIT": parseDropAuditPolicy,
				"CREDENTIAL": parseDropCredential,
				"EXTENDED": parseDropStorage,
				"FULLTEXT": parseDropFulltextIndex,
				"FUNCTION": parseDropObjectWithOption,
				"INDEX": parseDropObject,
				"PROCEDURE": parseDropObjectWithOption,
				"PUBLIC": parseDropSynonym,
				"REMOTE": parseDropRemoteSource,
				"ROLE": parseDropRole,
				"SAML": parseDropSamlProvider,
				"SCHEMA": parseDropSchema,
				"SEQUENCE": parseDropObjectWithOption,
				"STATISTICS": parseDropStatistics,
				"SYNONYM": parseDropSynonym,
				"TABLE": parseDropObjectWithOption,
				"TYPE": parseDropObjectWithOption,
				"TRIGGER": parseDropObjectWithOption,
				"USER": parseDropUser,
				"VIEW": parseDropObjectWithOption
			}, tok).
			else(function() {
				parser.error(parser.nextToken, "0_not_supported");
			});
			return this;
		});

	}

	return {
		init: init,
		defaultConfig: defaultConfig
	};

});