define([], function () {

	"use strict";

	return {
		init: function () {
		},

		convertConfigurationToDisplayFormat: function (configFromConcrete) {
			if (!configFromConcrete) return configFromConcrete;
			var display = {rules: {}};
			var rules = configFromConcrete.concreteDefConfig.rules;
			for(var key in rules){
				if (rules.hasOwnProperty(key)) {
					var value = rules[key];
					var enabled = (value === 2 ? true: false);
					display.rules[key] = {"enable": enabled};
				}
			}
			return Q(display);
		},

		convertConfigurationToConcreteFormat: function (configFromDisplay) {
			if (!configFromDisplay) return configFromDisplay;
			var concrete = { concreteDefConfig: {rules: {}}};
			for(var key in configFromDisplay.rules){
				if (configFromDisplay.rules.hasOwnProperty(key)) {
					var enable = configFromDisplay.rules[key].enable;
					concrete.concreteDefConfig.rules[key] = enable ? 2 : 0;
				}
			}
			return Q(concrete);
		},

		mergeConfigurations: function (defaultConfigWithCustom, customConfiguration) {
			return Q(_.merge(_.cloneDeep(defaultConfigWithCustom), customConfiguration));
		},

		getDiffConfigurationToStore: function (def, proj, modified) {
			return Q(_.omit(modified, function(value,key) {
				return _.isEqual(def[key], value) ;
			}));
		},

		getDefaultConfiguration: function (sPath) {
			if (!sPath) {
				return  {
					"concreteDefConfig": {
						"env" : {"browser" : false},
						"rules" : {
							"brace-style" : 0,
							"camelcase" : 2
						}
					}
				};

			} else {

				return {
					"concreteDefConfig": {
						"env" : {"browser" : false},
						"rules" : {
							"brace-style" : 0,
							"camelcase" : 2,
							"customRule" : 2
						}
					}
				};
			}
		}
	};
});