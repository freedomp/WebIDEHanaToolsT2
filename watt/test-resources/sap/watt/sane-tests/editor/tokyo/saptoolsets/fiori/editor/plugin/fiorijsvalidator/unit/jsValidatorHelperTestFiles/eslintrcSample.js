define([], function() {
	"use strict";
	return {
		"additionalRuleMetadata": {
			"no-new": {
				"help": "http://eslint.org/docs/rules/no-new",
				"category": "BestPractice",
				"priority": "major",
				"severity": "w"
			},
			"sap-no-global-variable": {
				"help": "https://wiki.wdf.sap.corp/wiki/display/fiorisuite/sap-no-global-variable",
				"category": "PossibleError",
				"priority": "critical",
				"severity": "e"
			}
		},
		"rules": {
			"no-new": 1,
			"sap-no-global-variable": 2
		}
	};
});
