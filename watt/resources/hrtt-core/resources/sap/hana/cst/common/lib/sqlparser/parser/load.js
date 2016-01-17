/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

/*
 * Parser module for load statement
 */
/*global define*/
/*jshint -W024 */
/*eslint-disable no-constant-condition, quotes*/
define(function() {
	"use strict";

	var defaultConfig = {
		"load": {}
	};

	function init(parser) {

		parser.stmt("LOAD", function() {
			if (parser.config.load.csv) {
				parser.advance("TABLE");
				this.kind = "table";
			}
			this.table = parser.parseObjectRef("table");
			if (parser.config.load.csv) {
				parser.advance("FROM");
				if (parser.parseString()) {
					this.from = parser.token;
				}
				parser.skipRemaining();
			} else {
				if (parser.advanceIf("HISTORY")) {
					this.historyTable = true;
				}
				if (parser.advanceIf("ALL")) {
					this.loadType = "all";
				} else if (parser.advanceIf("DELTA")) {
					this.loadType = "delta";
				} else {
					this.columns = parser.parseColumnsList(this.table);
				}
			}
			return this;
		});
	}

	return {
		init: init,
		defaultConfig: defaultConfig
	};

});