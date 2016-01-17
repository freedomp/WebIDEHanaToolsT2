/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

/*
 * Parser module for set statement
 */
/*global define*/
/*jshint -W024 */
/*eslint-disable no-constant-condition, quotes*/
define(function() {
	"use strict";

	var defaultConfig = {
		"set": {}, // enabled the delete statement, detailed, statement specific config. can be stored inside
		"unset": {}
	};

	function init(parser) {

		function parseSetHistorySession(tok) {
			tok.kind = "history session";
			parser.advance("SESSION");
			parser.advance("TO");
			if (parser.advanceIf("NOW")) {
				tok.when = parser.token;
			} else if (parser.advanceIf("COMMIT")) {
				parser.advance("ID");
				if (parser.parseInteger()) {
					tok.when = parser.token;
				}
			} else {
				parser.advance("UTCTIMESTAMP");
				if (typeof parser.parseString() === "string") {
					tok.when = parser.token;
				}
			}
			return tok;
		}

		function parseSetSchema(tok) {
			tok.kind = "schema";
			if (parser.parseIdentifier("schema")) {
				tok.identifier = parser.token;
				parser.currentSchema = parser.makeGlobalObject(tok.identifier);
			}
			return tok;
		}

		function parseSetSession(tok) {
			tok.kind = "session";
			if (typeof parser.parseString() === "string") {
				tok.key = parser.token;
			}
			parser.advance("=");
			if (typeof parser.parseString() === "string") {
				tok.value = parser.token;
			}
			return tok;
		}

		function parseSetSystemLicense(tok) {
			tok.kind = "system license";
			parser.advance("LICENSE");
			if (typeof parser.parseString() === "string") {
				tok.key = parser.token;
			}
			return tok;
		}

		function parseSetTransaction(tok) {
			tok.kind = "transaction";
			// TODO
			return tok;
		}

		parser.stmt("SET", function() {
			var tok = this;

			parser.advanceCase({
				"HISTORY": parseSetHistorySession,
				"SCHEMA": parseSetSchema,
				"SESSION": parseSetSession,
				"SYSTEM": parseSetSystemLicense,
				"TRANSACTION": parseSetTransaction
			}, tok).
			else(function() {
				parseSetSession(tok);
			});
			return tok;
		});

		parser.stmt("UNSET", function() {
			var tok = this;

			parser.advanceIf("SESSION");
			tok.kind = "session";
			if (typeof parser.parseString() === "string") {
				tok.key = parser.token;
			}
			return tok;
		});

	}

	return {
		init: init,
		defaultConfig: defaultConfig
	};

});