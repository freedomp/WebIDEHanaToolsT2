define(["../util/JSValidatorHelper", "sap/watt/lib/lodash/lodash", "../util/rulesSecurity"], function(jsValidatorHelper, _, securityUtil) {

	"use strict";
	
	return {
        FILE_TYPE : "file",
        FILE_EXTENTION : "js",
        CUSTOM_RULES_DEFAULTS: {
			    "enabled" : 0,
			    "severity":  "warning", 
			    "category": "Best Practice"
		        },
        
        init: function() {
            // Add helpUrl property to all rules  
	       var oRulesExt = jsValidatorHelper.getDefaultConfiguration().rulesExt;
	        
	       $.each( oRulesExt, function(ruleId) {
                if (!oRulesExt[ruleId].helpUrl) {
	                oRulesExt[ruleId].helpUrl =  "http://eslint.org/docs/rules/" + ruleId;  
                }
	        }); 
	    },
	    
        _mergeExists : function(def, src) {
            //omit all entries not exists in def
            var srcReduced = _.omit(src, function(value,key) { 
                return !_.has(def,key);
            });
            var clonedDef = _.cloneDeep(def);
            return _.merge(clonedDef, srcReduced);
        },

    	convertConfigurationToDisplayFormat: function(oConfig) {
		    var aResult = {};
            if (!oConfig.eslintConfig) {
                return aResult;
            }
	        var oRules = oConfig.eslintConfig.rules || {};
		    var oRulesExt = oConfig.rulesExt;
            $.each( oRules, function( ruleId, ruleValue ) {
                var oRule = {};
                oRule.ruleId = ruleId;
                oRule.severity = oRulesExt[ruleId].severity;
                if (typeof ruleValue === "number") {
                    if (ruleValue === 0) {
                        oRule.enable = false;
                    } else {
                        oRule.enable = true; 
                    }
                } else if (Array.isArray(ruleValue)) {
                     if (ruleValue[0] === 0) {
                        oRule.enable = false;
                    } else {
                        oRule.enable = true; 
                    }
                    oRule.additionalProperties = ruleValue.slice(1);
                }
                oRule.category = oRulesExt[ruleId].category;
                oRule.helpUrl = oRulesExt[ruleId].helpUrl;
                aResult[ruleId] = oRule;
            });
            var returnVal = {};
            returnVal.rules = aResult;
            returnVal.header = {};
            if (oConfig.eslintConfig.globals) {
                returnVal.header.globals =  oConfig.eslintConfig.globals;
            }
            if (oConfig.eslintConfig.env) {
                returnVal.header.env =  oConfig.eslintConfig.env;
            }
            return returnVal;
		},
		
    	_buildConfigurationTemplate: function(rules, globals, env, rulesExt)  {
    	    var result = {
                eslintConfig: {
                }
    	    };
            if (rules) {
                result.eslintConfig.rules = rules;
            }
            if (rulesExt) {
                result.rulesExt = rulesExt;
            }
            if (globals) {
                result.eslintConfig.globals = globals;
            }
            if (env) {
                result.eslintConfig.env = env;
            }
            return _.isEmpty(result.eslintConfig) && !result.rulesExt ? undefined : result;
    	},
    	convertConfigurationToConcreteFormat: function(aRules)  {
            var oRules = {};
            var oRulesExt = {};
            var aConfig = aRules || {};
            $.each( aConfig.rules || {}, function( index, oRule ) {
                oRules[oRule.ruleId] = {};
                if (!oRule.additionalProperties) {
                       if (oRule.enable === false) {
                        oRules[oRule.ruleId] = 0;   
                    } else {
                           oRules[oRule.ruleId] = 2; 
                    }
                } else {
                    oRules[oRule.ruleId] = [];
                    if (oRule.enable === false) {
                        oRules[oRule.ruleId][0] = 0;   
                    } else {
                        oRules[oRule.ruleId][0] = 2; 
                    }
                    oRules[oRule.ruleId] = oRules[oRule.ruleId].concat(oRule.additionalProperties);
                }
                oRulesExt[oRule.ruleId] = {};
                oRulesExt[oRule.ruleId].severity = oRule.severity;
                oRulesExt[oRule.ruleId].category = oRule.category;
                oRulesExt[oRule.ruleId].helpUrl = oRule.helpUrl;
            });
            var header = aConfig.header || {};
            return this._buildConfigurationTemplate(oRules, header.globals, header.env, oRulesExt);
        },
        
        mergeConfigurations: function(defaultConfigWithCustom, customConfiguration) {
            return _.merge(defaultConfigWithCustom || {}, customConfiguration || {});
        },
        
        _diffObjects : function(obj1, obj2) {
            if (!obj1 && obj2) {
                return {};
            }
            if (!obj2) {
                return obj1;
            }
            //omit all equal objects from obj1
            var result = _.omit(obj1, function(value,key) { 
                return _.isEqual(obj2[key], value) ;
            });
            return _.isEmpty(result) ? undefined : result;
        },
        
        _diffConfigurations : function(fullConfig1, fullConfig2) {
            //omit all equal objects from config1
            var config1 = fullConfig1.eslintConfig || {};
            var config2 = fullConfig2.eslintConfig || {};
            var rules = this._diffObjects(config1.rules, config2.rules);
            var env = this._diffObjects(config1.env, config2.env);
            var globals = this._diffObjects(config1.globals, config2.globals);
            var rulesExt = this._diffObjects(fullConfig1.rulesExt, fullConfig2.rulesExt);
            return this._buildConfigurationTemplate(rules, globals, env, rulesExt);
        },

        _reduceConfigurations : function(fullConfig1, fullConfig2) {
            var cloned1 = _.cloneDeep(fullConfig1 || {});
            var config1 = cloned1.eslintConfig || {};
            var config2 = fullConfig2.eslintConfig || {};
            var rules = _.omit(config1.rules, function(value,key) { 
                return !_.has(config2.rules,key);
            });
            var rulesExt = _.omit(cloned1.rulesExt, function(value,key) { 
                return !_.has(fullConfig2.rulesExt,key);
            });
            return this._buildConfigurationTemplate(rules, undefined, undefined, rulesExt);
        },

        getDiffConfigurationToStore: function(defaultConfigWithCustom, prevProjectConfig, customConfiguration) {
            var that = this;
            var reducedProjFromDef = that._reduceConfigurations(prevProjectConfig, defaultConfigWithCustom);
            var reducedModifiedFromProject = that._reduceConfigurations(customConfiguration, reducedProjFromDef);
            var diffModifiedFromProject =  _.merge(reducedProjFromDef, reducedModifiedFromProject);
            
            var diffModifiedFromDefault =  that._diffConfigurations(customConfiguration, defaultConfigWithCustom);
            return _.merge(diffModifiedFromDefault, diffModifiedFromProject);
        },
        
        getDefaultConfiguration: function(sPath) {
            var that = this;
            try{
                var defaultRules = _.cloneDeep(jsValidatorHelper.getDefaultConfiguration());
                if (sPath){
                    return that._setCustomeConfiguration(sPath)
                    .then(function(customRules){
                         if (customRules){
                            customRules = _.cloneDeep(customRules); // make a copy of the object
                            return that._mergeRules(customRules, defaultRules);     
                         } else {
                            return defaultRules;         
                        }
                    });
                 } else {
                    return Q(defaultRules);
                 }
             } catch (e){
                 that.context.service.log.error("javascript eslint - failed to get default rules", e.message).done();
                 return {};
             }
        },
        
        _mergeRules : function(oSource, oDestination){
            if(!oSource) {
                this.context.service.log.warn("javascript eslint - an element to be merged not supplied: ", JSON.stringify(oSource)).done();
                return oDestination;
            }
            if (!oDestination) {
                this.context.service.log.warning("javascript eslint - an element to be merged not supplied: ", JSON.stringify(oDestination)).done();
                return oSource;
            }
            return _.merge(oSource, oDestination);
        },
        
        _setCustomeConfiguration: function(path){
            var aRulesDocumentsToScanPromises = [], that = this;
            
            if (!path) {
                //if no path to custom rules was delivered, 
                //continuing the method will cause unhandled-Error at filesystem.documentProvider 
                return Q(); // return Q and not null baecause of automatic jsvalidator test. since this route in code is not wrapped in return/.then
            }
            return this.context.service.filesystem.documentProvider.getDocument(path)
            .then(function(oRulesFolder){
                    if (oRulesFolder){
                          //the folder was found
                          return oRulesFolder.getCurrentMetadata(true)
                          .then(function (aRules){
                              //get all the rules from the folder
                              jQuery.each(aRules, function(index,oRule){
                                if ( !oRule.folder ) {
                                    if (_.endsWith(oRule.name, that.FILE_EXTENTION)) {
                                        aRulesDocumentsToScanPromises.push(that.context.service.filesystem.documentProvider.getDocument(oRule.path));
                                    } else {
                                        that.context.service.log.warn(that.context.service.jsValidator.getProxyMetadata().getName(), " user defined RulesDirectory: found files other then " + that.FILE_EXTENTION + " in: " + path , [ "user" ]).done();
                                    }
                                }
                              });
                              return Q.all(aRulesDocumentsToScanPromises).then(function(aRulesDocumentsToScan) {
	                              if (aRulesDocumentsToScan.length>0) {
	                                return that._securityScan(aRulesDocumentsToScan).then(function(aRulesIDs){
	                                    return that._createCustomRulesStruct(aRulesIDs);
	                                });
	                              } else {
	                                  return null;
	                              }
                              });
                            });
                    } else {
                        //custom rules folder wasn't found
                        that.context.service.log.warn(that.context.service.jsValidator.getProxyMetadata().getName(), " user defined RulesDirectory " + path + " defined under project settings was not found", [ "user" ]).done();
                        return null;
                    }
                });
        },

        _securityScan : function(aRulesDocuments){
            var aRulesIDs = [];
            var that = this;
            var aContentPromises = [];
            _.each(aRulesDocuments, function(oRule){
              var rulePath = oRule.getEntity().getFullPath();
                aContentPromises.push( oRule.getContent().then(function(sContent){
                               return {
                                   content : sContent,
                                   document : oRule
                               };
                        })
                );
            });
            return Q.all(aContentPromises).then(function(aResults){
                _.each(aResults, function(rulesInfo){
                    var content = rulesInfo.content;
                    var oRule = rulesInfo.document;
                    if(securityUtil.scan(content)){
                        aRulesIDs.push(oRule.getTitle().replace(/\.js/, ""));
                    }
                });
                return aRulesIDs;
            });
        },
        
        _createCustomRulesStruct : function(aRules) {
            var that = this;
            return this.context.service.basevalidator.getRulesConfigurationTemplate()
            .then(function(oResult) {
                var rules = oResult.eslintConfig.rules;
                var rulesExt = oResult.rulesExt;
                jQuery.each(aRules, function(index,ruleId){
                    if (!(ruleId === "length")) {
                        rules[ruleId] = {};
                        rules[ruleId] = that.CUSTOM_RULES_DEFAULTS.enabled;
                        rulesExt[ruleId] = {};
                        rulesExt[ruleId].severity = that.CUSTOM_RULES_DEFAULTS.severity;
                        rulesExt[ruleId].category = that.CUSTOM_RULES_DEFAULTS.category;    
                    }
                });
                return oResult;
            });
        },
        
	    getUpdatedConfiguration: function(customConfigurationFile, customRulesDir) {
	        var that = this;
            if (customConfigurationFile) {
                return that.context.service.filesystem.documentProvider.getDocument(customConfigurationFile)
                .then(function(eslinrcfile){
                    if (eslinrcfile && eslinrcfile.getType() === that.FILE_TYPE) {
                        return eslinrcfile.getContent().then(function(sLocalConfig) {
                            var localConfig;
                            try {
                                localConfig = JSON.parse(sLocalConfig);
                            } catch(err) {
                                that.context.service.log.error(that.context.service.jsValidator.getProxyMetadata().getName(), 
                                " validator configuration file: " + customConfigurationFile + " has invalid JSON structure.", [ "user" ])
                                .done();
                                return {};
                            }
                            
                            var returnConfig = {
                                "eslintConfig" : {
                                    "env" : localConfig.env,
                                    "globals" : localConfig.globals,
                                    "rules" : localConfig.rules
                                },
                                "rulesExt" : localConfig.additionalRuleMetadata
                            };
                            _.forEach(returnConfig.rulesExt, function(ext) {
                                switch (ext.severity.toLowerCase()[0]) {
                                    case 'e': ext.severity = "error";
                                        break;
                                    case 'w': ext.severity = "warning";
                                        break;
                                    case 'i': ext.severity = "info";
                                        break;
                                }
                            });
                            return returnConfig;
                        });
                    }
                    that.context.service.log.error(that.context.service.jsValidator.getProxyMetadata().getName(), 
                    " validator configuration file: " + customConfigurationFile + " ,defined in project settings was not found", [ "user" ])
                    .done();
                });
	        }
	        return {};
	    }
	};
});