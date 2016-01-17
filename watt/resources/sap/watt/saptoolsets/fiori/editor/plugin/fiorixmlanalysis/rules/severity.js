/*global define*/
define(["../config/default"], function(defaultConfig) {
    "use strict";
    return {
        get: function(ruleId){
            switch (defaultConfig.xmlAnalysisConfig.rules[ruleId]){
                case 2:
                    return "error";
                case 1:
                    return "warning";
                case 0:
                    return "info";
            }
        }
    };
});
