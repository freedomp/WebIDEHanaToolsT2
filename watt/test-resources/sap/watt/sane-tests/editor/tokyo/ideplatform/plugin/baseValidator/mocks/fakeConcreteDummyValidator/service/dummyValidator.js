define([], function() {

	"use strict";
	
	return {
	    
        getIssuesSynchronously: function(sSource, oConfig, sFullPath) {
            return [];
        },
        
        getPathToImplementationModule: function() {
           return "";
        },

		getConfiguration: function (filter, def, proj) {
			var merged = _.merge(_.cloneDeep(def), proj);
			return Q(_.omit(merged.concreteDefConfig.rules, function(value,key) {
				return !_.isEqual(merged.concreteDefConfig.rules[key], filter) ;
			}));
		},
        getDefaultConfiguration: function (sPath) {
            if (!sPath) {
                return {
                    "concreteDefConfig": {
                        "env": {"browser": false},
                        "rules": {
                            "brace-style": 0,
                            "camelcase": 2
                        }
                    }
                };

            } else {

                return {
                    "concreteDefConfig": {
                        "env": {"browser": false},
                        "rules": {
                            "brace-style": 0,
                            "camelcase": 2,
                            "customRule": 2
                        }
                    }
                };
            }
        }
	};
});