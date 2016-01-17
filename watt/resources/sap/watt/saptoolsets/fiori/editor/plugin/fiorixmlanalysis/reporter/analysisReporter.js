/*global define*/
define([
		"../utils/XPathUtils"
		, "../rules/severity"
		// add new rules here to loaded them automaticly
		// comment / uncomment a line to deactivate/activate the rule
		, "../rules/XML_ICON_ACCESSIBILITY"
		, "../rules/XML_ICON_BUTTON_ACCESSIBILITY"
		, "../rules/XML_IMAGE_ACCESSIBILITY"
		, "../rules/XML_TITLE_ACCESSIBILITY"
		, "../rules/XML_PAGE_ACCESSIBILITY"
		, "../rules/XML_TABLE_ACCESSIBILITY"
		, "../rules/DG_XML_FOOTER_BUTTON_TEXT_ICON"
		, "../rules/DG_XML_LIST_BASE_SHOW_NO_DATA"
		, "../rules/DG_XML_NO_DUPLICATE_ICONS"
		//, "../rules/DG_MULTIPLE_OBJECT_IDENTIFIER"
		//, "../rules/DG_MULTIPLE_OBJECT_NUMBER"
		, "../rules/DG_XML_NO_SINGLE_TAB"
		//, "../rules/DG_XML_FIRST_OBJECT_IDENTIFIER"
		//, "../rules/DG_XML_USAGE_OBJECT_IDENTIFIER"
		, "../rules/XML_DIALOG_IN_VIEW"
		, "../rules/XML_UPLOAD_IN_VIEW"
		, "../rules/XML_COMMONS_USAGE"
		, "../rules/XML_FORM_USAGE"
		, "../rules/XML_LAYOUT_USAGE"
		, "../rules/XML_MISSING_STABLE_ID"
		, "../rules/XML_DEPRECATION"
		, "../rules/XML_METADATA_MEDIA_SRC_WITHOUT_FORMATTER"
	], function(xPath, severity) {
	"use strict";

	// define the number of parameters in the define method, that are no rule files
	var countNonRuleParameter = 2,
		rules = Object.create(null);

	function addRule(rule){
		//console.log("register rule: " + rule.id);
		rules[rule.id] = rule;
	}

	//load all rules
	for (var n = countNonRuleParameter, countArgs = arguments.length; n < countArgs; n++){
		var arg = arguments[n];
		if(arg) {
			addRule(arg);
		}
	}

	return {
		id: "analysisReporter",
		init: function(serviceProvider) {
			rules.XML_DEPRECATION.setServiceProvider(serviceProvider);
		},
		report: function(xml, path, report, userFilters){
			//console.log(this.id + ": " + (report.root.severity ? "error" : "ok"));
			return this.reportAnalysisErrors(xml, path, report, userFilters, this.setRootSeverity, this.reportError);
		},
		reportAnalysisErrors: function(xml, path, report, userFilters, updateSeverity, errorReporter){
			// remember functions because 'this' is not the same as in the loop
			// iterate over rules
			var aPromises = [];
			for(var key in rules) { 
				var rule = rules[key],
					nodes,
					violations;
				// check user visibility settings
				if(userFilters.indexOf(severity.get(rule.id)) >= 0){
					// execute specific xPath on xml
					nodes = xPath.exec(rule.path, xml);
					// validate the intresting nodes
					violations = rule.validate(report, path, nodes);
					// some checks return a promise, some don't
					if(!violations.then){ // check if result is a promise
						aPromises.push(Q({
							id: rule.id,
							category: rule.category,
							errorMsg: rule.errorMsg,
							violations: violations
						}));
					}else{
						aPromises.push(violations);
					}
				}
			}
			
			return Q.all(aPromises).then(function(aResults){
				for(var j = 0 ; j < aResults.length ; j++){
					var result = aResults[j];
					var ruleSeverity = severity.get(result.id);
					// report the violations
					if(result.violations && result.violations.length > 0){
						// update root severity
						updateSeverity(report, ruleSeverity);
						// report each violation
						for(var i = 0; i < result.violations.length; i++){
							var node = result.violations[i];
							errorReporter(report, {
								id: result.id,
								category: result.category,
								checker: "Fiori XML Analysis", // TODO: use value from i18n file
								helpUrl: "https://github.wdf.sap.corp/fiori-code-quality/documentation/blob/master/analysis-plugin/" + result.id + ".md",
								line: node.position.line.start,
								column: node.position.column.start,
								message: (node.message || result.errorMsg || ""),
								path: path,
								severity: ruleSeverity,
								source: node.outerHTML
							});
							// message: rule.category + "(" + rule.id + "): " + (rule.errorMsg || ""),
						}
					}
				}
			});
		},
		reportError: function(report, error){
			if(report && report.issues){
				report.issues.push(error);
			}
		},
		setRootSeverity: function(report, ruleSeverity){
			if(ruleSeverity){
				switch(ruleSeverity){/*
					case "info":
						// leave if severity is set
						if(report.root.severity){ return; }
						break;
					case "warning":
						// leave if severity is set & is not info
						if(report.root.severity && report.root.severity !== "info"){ return; }
						break;*/
					case "error":
						// leave is severity is set & not info or warning
						if(report.root.severity && report.root.severity !== "info" && report.root.severity !== "warning"){ return; }
						break;
					default:
						return; // leave
				}
				report.root.severity = ruleSeverity;
			}
		}
	};
});
