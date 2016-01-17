define(function() {
	return {

		/**
		 * Gets the meta model binding context path for a entityType/entityset/navigation/property in the meta model.
		 *
		 * @param {object} vElement can be either the entityType name or a smartDoc object of the entitySet/navigation/property.
		 * @param {object} oMetaModel the meta model object.
		 *
		 * @return {string} binding context path
		 */
		getBindingContext: function(vElement, oMetaModel) {
			if (typeof vElement === "string") {
				//is EntityType
				return this._getBindingContextForEntityType(vElement, oMetaModel);
			} else if (vElement.multiplicity) {
				//is navigation property
				return this._getBindingContextForNavigation(vElement.parent().entityType, vElement.name, oMetaModel);
			} else if (vElement.parent().elements) {
				//is property
				return this._getBindingContextForProperty(vElement.parent().entityType, vElement.name, oMetaModel);
			} else if (vElement.parent().entities) {
				//is EntitySet
				return this._getBindingContextForEntitySet(vElement.name, oMetaModel);
			}
		},

		_getBindingContextForEntityType: function(sEntityTypeName, oMetaModel) {
			var aSchemas = oMetaModel.getObject("/dataServices/schema");
			for (var i = 0; i < aSchemas.length; i++) {
			    var sSchemaPrefix = aSchemas[i].namespace + ".";
				var sSearch = "/dataServices/schema/" + i + "/entityType";
				var aEntityTypes = oMetaModel.getObject(sSearch);
				for (var j = 0; j < aEntityTypes.length; j++) {
					if (aEntityTypes[j].name === sEntityTypeName || sSchemaPrefix + aEntityTypes[j].name === sEntityTypeName) {
						return sSearch + "/" + j;
					}
				}
			}
		},

		_getBindingContextForEntitySet: function(sEntitySetName, oMetaModel) {
			var aSchemas = oMetaModel.getObject("/dataServices/schema");
			for (var i = 0; i < aSchemas.length; i++) {
				var sSearchEntityContainer = "/dataServices/schema/" + i + "/entityContainer";
				var aContainers = oMetaModel.getObject(sSearchEntityContainer);
				for (var j = 0; j < aContainers.length; j++) {
					var sSearchEntitySet = "/dataServices/schema/" + i + "/entityContainer/" + j + "/entitySet";
					var aEntitySets = oMetaModel.getObject(sSearchEntitySet);
					for (var k = 0; k < aEntitySets.length; k++) {
						if (aEntitySets[k].name === sEntitySetName) {
							return sSearchEntitySet + "/" + k;
						}
					}
				}
			}
		},

		_getBindingContextForProperty: function(sEntityTypeName, sPropertyName, oMetaModel) {
			var sEntityType = this._getBindingContextForEntityType(sEntityTypeName, oMetaModel);
			if (sEntityType) {
				var sSearchProperty = sEntityType + "/property";
				var aProperties = oMetaModel.getObject(sSearchProperty);
				for (var i = 0; i < aProperties.length; i++) {
				    if (aProperties[i].name === sPropertyName) {
							return sSearchProperty + "/" + i;
						}
				}
			}
		},

		_getBindingContextForNavigation: function(sEntityTypeName, sNavigationName, oMetaModel) {
			var sEntityType = this._getBindingContextForEntityType(sEntityTypeName, oMetaModel);
			if (sEntityType) {
				var sSearchNavigationProperty = sEntityType + "/navigationProperty";
				var aNavigations = oMetaModel.getObject(sSearchNavigationProperty);
				for (var i = 0; i < aNavigations.length; i++) {
				    if (aNavigations[i].name === sNavigationName) {
							return sSearchNavigationProperty + "/" + i;
						}
				} 
			}
		}
	};
});