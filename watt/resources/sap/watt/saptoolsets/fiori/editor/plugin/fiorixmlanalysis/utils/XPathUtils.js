/*global define*/
define([
	"../../../../../../lib/jqueryxpathplugin/jqueryXpath"
], function() {
	"use strict";
	var ns = {
		"core": 		"sap.ui.core",
		"commons":		"sap.ui.commons",
		"form": 		"sap.ui.commons.form",
		"layout":		"sap.ui.commons.layout",
		"uilayout":		"sap.ui.layout",
		"layoutform":	"sap.ui.layout.form",
		"ns":			"sap.m",
		"ui":			"sap.ca.ui",
		"mvc":			"sap.ui.core.mvc",
		"navpopover":	"sap.ui.comp.navpopover",
		"sfield":		"sap.ui.comp.smartfield",
		"sform":		"sap.ui.comp.smartform",
		"stable":		"sap.ui.comp.smarttable",
		"svariants":	"sap.ui.comp.smartvariants",
		"sfilter":		"sap.ui.comp.smartfilterbar",
		"html": 		"http://www.w3.org/1999/xhtml"
	};

	function nsResolver(prefix) {
		return ns[prefix] || null;
	}

	return {
		exec: function(xPath, xmlDoc){
			return $.xpath(xmlDoc, xPath, nsResolver);
		}
	};
});