define([], function(){

	var schemaMap = {};

	return {

		getSubSchemasByVersion : function(oSubSchema, sVersion, subSchemaKey){
			// go through all oneOf attributes and choose the one that fits to the version
			var that = this;
			this._handleOneOf(oSubSchema, sVersion);
			this.handleDefinitionsProperty(oSubSchema);
			this._handleAllOf(oSubSchema);
			this.handleRefsInProperties(oSubSchema);
			this._adjustToEnviornment(oSubSchema, subSchemaKey);
		},

		handleRefsInProperties : function(oSubSchema){
			var oDefinitions = oSubSchema.definitions;
			var that = this;
			_.each(oSubSchema.properties, function(oProperty){
				if (_.isObject(oProperty)){
					that._replaceRefDefintionWithSchema(oProperty, oDefinitions);
				}
			});
		},

		_handleOneOf : function(oSubSchema, sVersion){
			if (_.isObject(oSubSchema) && oSubSchema.hasOwnProperty("oneOf")) {
				var aSubSchemas = oSubSchema["oneOf"];
				var oSchemaForVersion = this._getSubSchema(aSubSchemas, sVersion);
				if(oSchemaForVersion){
					delete oSubSchema["oneOf"];
					_.merge(oSubSchema, oSchemaForVersion);
				}
			}
		},

		_handleAllOf : function(oSubSchema){
			var oDefinitions = oSubSchema.definitions;
			var that = this;
			_.each(oSubSchema.properties, function(oProperty){
				if (_.isObject(oProperty) && oProperty.hasOwnProperty("allOf")) {
					var aSubSchemas = oProperty["allOf"];
					for(var ii=0; ii < aSubSchemas.length; ii++){
						var oSubPropertySchema = aSubSchemas[ii];
						that._replaceRefDefintionWithSchema(oSubPropertySchema, oDefinitions);
						_.merge(oProperty, oSubPropertySchema);
					}
					delete oProperty["allOf"];
				}
			});
		},

		_getDefintionAttributeName : function(sDefinitionPath){
			//"#/definitions/deviceType" > "deviceType"
			var aParts = sDefinitionPath.split("/");
			return aParts[aParts.length-1];
		},

		_hasRecursiveRefrences : function(oDefinitionToMerge, sRefPath){
			var that = this;
			var foundRecursiveRef = false;
			_.each(oDefinitionToMerge, function(val, key){
				if(_.isObject(val)){
					foundRecursiveRef = that._hasRecursiveRefrences(val, sRefPath);
				}else if(key === "$ref"){
					foundRecursiveRef = (val === sRefPath);
				}
				if(foundRecursiveRef){
					return false; //can exist loop
				}
			});
			return foundRecursiveRef;
		},

		_replaceRefDefintionWithSchema : function(oProperty, oDefinitions){
			var that = this;
			_.each(oProperty, function(val, key){
				if(_.isObject(val)){
					that._replaceRefDefintionWithSchema(val, oDefinitions);
				}else if(key === "$ref"){
					var sRefPath = oProperty["$ref"];
					var defintionsToReplace = that._getDefintionAttributeName(sRefPath);
					if(defintionsToReplace !== undefined){
						var oDefinitionToMerge = oDefinitions[defintionsToReplace];
						if(!that._hasRecursiveRefrences(oDefinitionToMerge, sRefPath)){
							_.merge(oProperty, oDefinitionToMerge);
							delete oProperty["$ref"];
						}

					}
				}
			});
		},

		//handle $ref in properties of subSchema- for example "$ref": "#/definitions/id_def"
		handleDefinitionsProperty : function(oSubSchema){
			var oDefinitions = oSubSchema.definitions;
			var that = this;
			if(_.isObject(oDefinitions)){
				_.each(oDefinitions, function(val){
					that._replaceRefDefintionWithSchema(val, oDefinitions);
				});
			}
		},

		_getDefinitionByName : function(oDefinitions, sKey){
			return oDefinitions[sKey];
		},

		_adjustToEnviornment : function(oSchema, key){
			/* for internal users, we want to force "ach" and "resources" as mandatory fields */
			if(key === "sap.app"){
				// in internal mode, values are slightly different for sap.app property
				if(sap.watt.getEnv("internal") === true	&& oSchema && oSchema.required){
					var aExtraRequiredParams = ["ach", "resources"];
					_.each(aExtraRequiredParams, function(val){
						oSchema.required.push(val);
					});
				}
			}
			/* until nested recursive definitions issue will be solved, we need to allow sap.ui.generic.app to have validations on the "pages" property in 5 levels at least */
			if(key === "sap.ui.generic.app"){
				var NUM_OF_LEVELS = 5;
				var pageDefinition = this._getDefinitionByName(oSchema.definitions, "page");
				var oPropertyToReplaceRefWith = oSchema.properties.pages.items;
				if(pageDefinition && oPropertyToReplaceRefWith){
					for(var ii=0; ii < NUM_OF_LEVELS; ii++){
						_.merge(oPropertyToReplaceRefWith, pageDefinition);
						delete oPropertyToReplaceRefWith["$ref"];
						oPropertyToReplaceRefWith = oPropertyToReplaceRefWith.properties.pages.items;
					}
					// clean NUM_OF_LEVELS+1 $ref
					delete oPropertyToReplaceRefWith["$ref"];
				}
			}

		},

		_getEnumVersion : function(oSubSchema){
			if(oSubSchema && oSubSchema.properties && oSubSchema.properties._version !== undefined && _.isArray(oSubSchema.properties._version.enum)){
				return oSubSchema.properties._version.enum[0];
			}

		},

		_getSubSchema : function(aSubSchemas, sVersion){
			if(aSubSchemas.length === 1){
				return aSubSchemas[0];
			}else if(aSubSchemas.length > 1){
				var that = this;
				var subSchemasLength = aSubSchemas.length;
				for(var ii=0; ii < subSchemasLength; ii++){
					var val = aSubSchemas[ii];
					if(that._getEnumVersion(val) === sVersion){
						return aSubSchemas[ii];
					}
				}
				// if we reached here, we need to return the default, which is the newest sub schema. Currently we assume it's the last one
				return aSubSchemas[subSchemasLength - 1];
			}
		}


	};




});
