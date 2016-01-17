"use strict";
define({
	_getSchemas: function(oMetadata) {
		return oMetadata && oMetadata.dataServices && oMetadata.dataServices.schema;
	},

	_getSchema: function(oMetadata, sNamespace) {
		var aSchemas = this._getSchemas(oMetadata) || [];
		var oSchema;

		for (var i = 0, len = aSchemas.length; i < len; i++) {
			oSchema = aSchemas[i];
			if (oSchema.namespace === sNamespace) {
				return oSchema;
			}
		}
	},

	_getEntitySets: function(oMetadata) {
		var aResult = [];
		var aSchemas = this._getSchemas(oMetadata) || [];
		var aEntityContainers, oEntityContainers;

		for (var i = 0, iLen = aSchemas.length; i < iLen; i++) {
			aEntityContainers = aSchemas[i].entityContainer || [];
			for (var j = 0, jLen = aEntityContainers.length; j < jLen; j++) {
				oEntityContainers = aEntityContainers[j];
				if (oEntityContainers.entitySet) {
					aResult = aResult.concat(oEntityContainers.entitySet);
				}
			}
		}
		return aResult;
	},

	_getEntityTypes: function(oMetadata, sNamespace) {
		var aResult = [];
		var aSchemas = this._getSchemas(oMetadata) || [];
		var oSchema;

		for (var i = 0, len = aSchemas.length; i < len; i++) {
			oSchema = aSchemas[i];
			if (oSchema.namespace === sNamespace && oSchema.entityType) {
				aResult = aResult.concat(oSchema.entityType);
			}
		}
		return aResult;
	},

	_extractNamespace: function(sName) {
		sName = sName || "";
		return sName.substring(0, sName.lastIndexOf("."));
	},

	_getAssociationSet: function(oMetadata, sName) {
		var sNamespace = this._extractNamespace(sName);
		var oSchema = this._getSchema(oMetadata, sNamespace) || {};
		var aEntityContainers = oSchema.entityContainer || [];
		var aAssociationSets, oAssociationSet;

		for (var i = 0, iLen = aEntityContainers.length; i < iLen; i++) {
			aAssociationSets = aEntityContainers[i].associationSet || [];
			for (var j = 0, jLen = aAssociationSets.length; j < jLen; j++) {
				oAssociationSet = aAssociationSets[j];
				if (oAssociationSet.association === sName) {
					return oAssociationSet;
				}
			}
		}
	},

	_getAssociation: function(oMetadata, sName) {
		var sNamespace = this._extractNamespace(sName);
		var sLocalName = sName.split(sNamespace + ".")[1];
		var oSchema = this._getSchema(oMetadata, sNamespace) || {};
		var aAssociations = oSchema.association || [];
		var oAssociation;

		for (var i = 0, len = aAssociations.length; i < len; i++) {
			oAssociation = oSchema.association[i];
			if (oAssociation.name === sLocalName) {
				return oAssociation;
			}
		}
	},

	/**
	 * Returns service metadata object
	 * @param sUri
	 * @param sClient
	 * @returns service metadata object.
	 */
	getMetadata: function(sUri, sClient) {
		var deferred = Q.defer();
		var mHeaders = {};
		if (sClient) {
			mHeaders['sap-client'] = sClient;
		}
		var oModel = new sap.ui.model.odata.ODataModel(sUri, true, null, null, mHeaders, false, false, true);
		oModel.attachMetadataLoaded(function(oEvent) {
			deferred.resolve(oEvent.getSource().getServiceMetadata());
		});
		oModel.attachMetadataFailed(function(oEvent) {
			if (oEvent.getParameters() && oEvent.getParameters().getParameters) {
				deferred.reject(oEvent.getParameters().getParameters());
			} else {
				deferred.reject(oEvent.getParameters());
			}
		});
		return deferred.promise;
	},

	/**
	 * Returns result of validation of the service
	 * @param vDocument in WATT that needs to be vaidated for it content containing metadata
	 * @returns result of metadata validation.
	 */
	getMetadataFromWorkspace: function(vDocument) {
		var that = this;

		if (!this._index) {
			this._index = 0;
		}

		return Q(typeof vDocument === "string" ? this.context.service.filesystem.documentProvider.getDocument(vDocument) : vDocument)
			.then(function(oMetadataDocument) {
				return oMetadataDocument.getContent().then(function(sMetadata) {
					return that.validateMetadata(sMetadata);
				});
			});
	},

	/**
	 * Create a mock service to test for metadaata validity
	 * @param sMetadata - metadata file content
	 * @returns metadata or error.
	 */
	validateMetadata: function(sMetadata) {
		jQuery.sap.require("sap.ui.core.util.MockServer");

		var that = this;
		var sUrl = "/SERVICEFROMMETADATA" + this._index+++"/";
		var oMock = new sap.ui.core.util.MockServer({
			rootUri: sUrl,
			requests: [{
				method: "GET",
				path: new RegExp("\\$metadata"),
				response: function(oXhr) {
					oXhr.respond(200, {
						"Content-Type": "application/xml;charset=utf-8"
					}, sMetadata);
				}
			}]
		});

		oMock.start();
		return that.getMetadata(sUrl).fin(function() {
			sap.ui.core.util.MockServer.destroyAll();
		});
	},

	/**
	 * Returns the required EntityType of the EntitySet
	 * @param oMetadata metadata object
	 * @param oEntitySet
	 * @returns the required EntityType
	 */
	getEntityType: function(oMetadata, oEntitySet) {
		var sNamespace = this._extractNamespace(oEntitySet.entityType);
		var aEntities = this._getEntityTypes(oMetadata, sNamespace);
		var oEntity;

		for (var j = 0, len = aEntities.length; j < len; j++) {
			oEntity = aEntities[j];
			if (oEntitySet.entityType === sNamespace + "." + oEntity.name) {
				return oEntity;
			}
		}
	},

	/**
	 * @param oMetadata metadata object
	 * @returns get addressable entitySets
	 */
	getAddressableEntitySets: function(oMetadata) {
		var aResult = [];
		var aSchemas = this._getSchemas(oMetadata) || [];
		var aEntityContainer, aEntitySets, oEntitySet, aExtensions, oExtension;

		for (var i = 0, iLen = aSchemas.length; i < iLen; i++) {
			aEntityContainer = aSchemas[i].entityContainer || [];
			for (var j = 0, jLen = aEntityContainer.length; j < jLen; j++) {
				aEntitySets = aEntityContainer[j].entitySet || [];
				for (var k = 0, kLen = aEntitySets.length; k < kLen; k++) {
					oEntitySet = aEntitySets[k];
					aResult.push(oEntitySet);
					aExtensions = oEntitySet.extensions || [];
					for (var l = 0, lLen = aExtensions.length; l < lLen; l++) {
						oExtension = aExtensions[l];
						if (oExtension.name === "addressable" && oExtension.value === "false") {
							aResult.pop();
							//break; //TODO: check me
						}
					}
				}
			}
		}
		return aResult;
	},

	/**
	 * @param oMetadata metadata object
	 * @returns get all entitySets
	 */
	getEntitySets: function(oMetadata) {
		return this._getEntitySets(oMetadata);
	},

	/**
	 * @param oMetadata metadata object
	 * @param sEntitySetName name of entityset
	 * @returns EntitySet object
	 */
	getEntitySet: function(oMetadata, sEntitySetName) {
		var aEntitySets = this._getEntitySets(oMetadata) || [];
		var oEntitySet;

		for (var i = 0, len = aEntitySets.length; i < len; i++) {
			oEntitySet = aEntitySets[i];
			if (oEntitySet.name === sEntitySetName) {
				return oEntitySet;
			}
		}
	},

	/**
	 * @param oMetadata metadata object
	 * @param oEntitySet
	 * @param bFlatten
	 * @returns property list of the entity type of the given entity set
	 */
	getProperties: function(oMetadata, oEntitySet, bFlatten) {
		var oEntityType = this.getEntityType(oMetadata, oEntitySet) || {};
		var sNamespace = this._extractNamespace(oEntitySet.entityType);
		var aProperties = jQuery.extend(true, [], oEntityType.property);
		var oProperty, oSchema, aComplexTypes, oComplexType, aComplexTypeProperties;

		bFlatten = bFlatten === undefined ? true : bFlatten === true;
		for (var i = 0; i < aProperties.length; i++) {
			oProperty = aProperties[i];
			// check if property is a complex type property 
			if (oProperty.type.indexOf(sNamespace) !== -1) {
				if (bFlatten) {
					aProperties.splice(i, 1);
				}
				oSchema = this._getSchema(oMetadata, sNamespace) || {};
				aComplexTypes = oSchema.complexType || [];
				for (var j = 0, jLen = aComplexTypes.length; j < jLen; j++) {
					oComplexType = aComplexTypes[j];
					if (oProperty.type.toLowerCase().indexOf(oComplexType.name.toLowerCase()) !== -1) {
						aComplexTypeProperties = jQuery.extend(true, [], oComplexType.property);
						if (bFlatten) {
							for (var k = 0, kLen = aComplexTypeProperties.length; k < kLen; k++) {
								aComplexTypeProperties[k].name = oProperty.name + "/" + aComplexTypeProperties[k].name;
							}
							aProperties = aProperties.concat(aComplexTypeProperties);
						} else {
							oProperty.properties = aComplexTypeProperties;
						}
						break;
					}
				}
			}
		}
		return aProperties;
	},

	/**
	 * @param oMetadata metadata object
	 * @param oEntitySet
	 * @returns object containing the navigation name and target entityset
	 */
	getNavigations: function(oMetadata, oEntitySet) {
		var aResult = [];
		var oEntityType = this.getEntityType(oMetadata, oEntitySet) || {};
		var aNavigations = oEntityType.navigationProperty || [];
		var oNavigation, oAssociationSet;

		for (var i = 0, len = aNavigations.length; i < len; i++) {
			oNavigation = aNavigations[i];
			oAssociationSet = this._getAssociationSet(oMetadata, oNavigation.relationship);
			if (oAssociationSet) {
				var sEntitySetName = oAssociationSet.end[0].entitySet;
				if (sEntitySetName !== oEntitySet.name) {
					aResult.push({
						targetEntitySetName: sEntitySetName,
						name: oNavigation.name
					});
				} else {
					aResult.push({
						targetEntitySetName: oAssociationSet.end[1].entitySet,
						name: oNavigation.name
					});
				}
			}
		}
		return aResult;
	},

	/**
	 * @param oMetadata metadata object
	 * @param oEntitySet
	 * @param sMultiplicity
	 * @returns object containing the navigation name and target entityset of the given entity set and multiplicity
	 */
	getNavigationsForMultiplicity: function(oMetadata, oEntitySet, sMultiplicity) {
		var aResult = [];
		var oEntityType = this.getEntityType(oMetadata, oEntitySet) || {};
		var aNavigations = oEntityType.navigationProperty || [];
		var sEntitySet, oNavigation, oAssociationSet, oAssociation;

		for (var i = 0, len = aNavigations.length; i < len; i++) {
			oNavigation = aNavigations[i];
			oAssociationSet = this._getAssociationSet(oMetadata, oNavigation.relationship);
			oAssociation = this._getAssociation(oMetadata, oNavigation.relationship);
			if (oAssociationSet && oAssociation) {
				if (oAssociationSet.end[0].entitySet !== oEntitySet.name) {
					sEntitySet = oAssociationSet.end[0].entitySet;
				} else {
					sEntitySet = oAssociationSet.end[1].entitySet;
				}
				if (oAssociation.end[0].type === oEntitySet.entityType) {
					if (oAssociation.end[1].multiplicity === sMultiplicity) {
						aResult.push({
							targetEntitySetName: sEntitySet,
							name: oNavigation.name
						});
					}
				} else {
					if (oAssociation.end[0].multiplicity === sMultiplicity) {
						aResult.push({
							targetEntitySetName: sEntitySet,
							name: oNavigation.name
						});
					}
				}
			}
		}
		return aResult;
	},

	/**
	 * Returns count of the given service url and entity set.
	 * @param sUrl - relative service url with destination name
	 * @param sEntitySet - the name of the entity set
	 * @param sClient - sap-client - optional
	 * @returns count - the number of entities in the given entity set..
	 */
	getEntitySetCount: function(sUrl, sEntitySet, sClient) {
		var deferred = Q.defer();
		var mHeaders = {};

		if (sClient) {
			mHeaders['sap-client'] = sClient;
		}

		var oModel = new sap.ui.model.odata.ODataModel(sUrl, true, null, null, mHeaders, false, false, true);

		oModel.read(sEntitySet + "/$count", null, null, true, function(oData, oResponse) {
			deferred.resolve(oResponse.body);
		}, function(oError) {
			deferred.reject(oError);
		});

		return deferred.promise;
	}
});
