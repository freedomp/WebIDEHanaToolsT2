/*global define*/
define([
	"sap/watt/lib/XMLDomParser/dom_parser"
	, "../utils/customXmlParser"
	, "../reporter/syntaxReporter"
	, "../reporter/analysisReporter"
	, "../config/default"
], function(nativeParser, customParser, syntaxReporter, analysisReporter, defaultConfig) {
	"use strict";
	function createReport() { return { "root": {}, "issues": [] }; }
	return {
		init: function() {
			analysisReporter.init(this.context.service);
		},
		getIssues: function(sSource, oConfig, sFullPath) {
			var that = this;
			return Q(createReport()).then(function(report){
				// report syntax errors
				var parser = new nativeParser.DomParser();
				parser.parseFromString(sSource);
				var valid = syntaxReporter.report(parser, sFullPath, report, that.context);
				return valid?Q.resolve(report):Q.reject(report);
			}).then(function(report){
				// report custom errors
				var promise = analysisReporter.report(customParser.parseXML(sSource), sFullPath, report, oConfig.show);
				return promise.then(function(){
					return report;
				});
			}, function(report){
				return report;
			});
		},
		getIssuesSynchronously: function(sSource, oConfig, sFullPath) {
			return this.getIssues(sSource, oConfig, sFullPath);
		},
		getPathToImplementationModule: function() {
			return "fiori.webide.xml.analysis.plugin/src/main/service/XmlAnalysis";
		},
		/* is called on every lint process */
		getCustomRulesContent: function(/*path*/) {
			return {};
		},
		convertRulesToDisplayFormat: function(/*rules*/) {
			var result = [];
			/*{
				"ruleId": "new-cap",
				"severity": "info",
				"enable": "false",
				"category": "Stylistic Issue",
				"helpUrl": "http://eslint.org/docs/rules/new-cap"
			}*/
			return result;
		},
		convertRulesToConcreteFormat: function() {
			return [];
		},
		/* result is used in getIssues */
		/* is called on every lint process */
		getConfiguration: function(aFilters/*, defConfig, projConfig*/) {
			return {
				"show": aFilters,
				"rules": {}
			};
		},
		/* default configuration, is provided to the getConfiguration method */
		/* is called on plugin initial load */
		getDefaultConfiguration: function(/*customRulesPath*/) {
			return defaultConfig.xmlAnalysisConfig;
		}
	};
});