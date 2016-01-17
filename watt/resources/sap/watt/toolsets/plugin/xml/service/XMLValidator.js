define(['sap/watt/lib/XMLDomParser/dom_parser'] , function(domParser) {

	"use strict";
	
	return {

		SEVIRITY_WARNING : "warning",
		SEVIRITY_ERROR : "error",
		SEVIRITY_FATAL_ERROR : "fatalError",

        init: function() {
	    },

        getCustomRulesContent: function(path) {
            return {};    
        },

        getIssues: function(sSource, oConfig, sFullPath) {
			var parser = new domParser.DomParser();
			parser.parseFromString(sSource);
			return this._convertParseError(parser, sFullPath);
        },

        getIssuesSynchronously: function(sSource, oConfig, sFullPath) {
            return this.getIssues(sSource, oConfig, sFullPath) ;
        },

        getConfiguration: function (aFilters, defConfig, customConfiguration) {
            return {};
        },
        
        getPathToImplementationModule: function() {
           return "sap/watt/toolsets/plugin/xml/service/XMLValidator";
        },

		getDefaultConfiguration : function(){
			return {};
		},


		_convertParseError : function (oParser, sFullPath) {
			var that  = this;
			var warn = this.SEVIRITY_WARNING, error = this.SEVIRITY_ERROR, fatal = this.SEVIRITY_FATAL_ERROR;

			var oResult = {
				"root": {},
				"issues": []
			};
			if (oParser && oParser.options && oParser.options.errors){
				var aErrors =  oParser.options.errors;
				if (aErrors.length){
					var oIssueBuilder = {};
					oIssueBuilder[warn] = function(oIssue) {
						if (oResult.root.severity !== error || oResult.root.severity !== fatal){
							oResult.root.severity = warn;
						}
						oIssue.severity = warn;
						return oIssue;
					};
					oIssueBuilder[error] = function(oIssue) {
						oResult.root.severity = error;
						oIssue.severity = error;
						return oIssue;

					};
					oIssueBuilder[fatal] = function(oIssue) {
						oIssueBuilder[error](oIssue);
					};

					aErrors.forEach(function(error){
						var oIssue = {
							category: "Syntax Error",
							checker:"",
							helpUrl: "",
							line: error.row,
							column: error.column,
							message: error.text,
							source: "",
							path: sFullPath
						};
						if (typeof oIssueBuilder[error.type.toLowerCase()] !== 'function'){
							that.context.service.log.error(that.context.service.xmlValidator.getProxyMetadata().getName(), "wrong severity value sent by dom parser: " + error.type, ["system"]).done();
							oResult.issues.push(oIssueBuilder[SEVIRITY_ERROR](oIssue));
						} else {
							oResult.issues.push(oIssueBuilder[error.type](oIssue));
						}
					});
				}
			}
			return oResult;
		}

	};
});