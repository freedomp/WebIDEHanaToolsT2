/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */

jQuery.sap.declare("sap.apf.core.metadataFactory");

/**
 * @class This class creates and manages metadata and entity type metadata instances. 
 * The class assures that there is a single metadata instance per service root and
 * that there is a single entity type metadata instance per service root and and entity type.
 */
sap.apf.core.MetadataFactory = function (oInject) {
	/**
	 * @description Returns type of metadataFactory.
	 * @returns {String}
	 */
	this.type = "metadataFactory";

    var that = this;
    var oMessageHandler = oInject.messageHandler;
    var oConfigurationFactory = oInject.configurationFactory;
    var fnHashtable = oInject.hashtable;
	var fnMetadata = oInject.metadata;
	var fnEntityTypeMetadata = oInject.entityTypeMetadata;
    var fnMetadataFacade = oInject.metadataFacade;

	//delete properties from oInject, which are not necessary to be transferred to metadata instances 
	delete oInject.metadata;
	delete oInject.entityTypeMetadata;
    delete oInject.metadataFacade;
    delete oInject.metadataProperty;
    delete oInject.configurationFactory;
	
	var oMetadataInstances = new fnHashtable(oMessageHandler);

	// Public functions
	/**
	 * @description Returns metadata object that represents metadata corresponding to the service document.
	 * @param {string} sAbsolutePathToServiceDocument Path to the service document
	 * @returns {sap.apf.core.Metadata}
	 */
	this.getMetadata = function (sAbsolutePathToServiceDocument) {
		var metadataCandidate;
		if (oMetadataInstances.hasItem(sAbsolutePathToServiceDocument) === false) {
			metadataCandidate = new fnMetadata(oInject, sAbsolutePathToServiceDocument);
			if(!metadataCandidate.failed) {
				oMetadataInstances.setItem(sAbsolutePathToServiceDocument, {
					metadata : metadataCandidate
				});
			} else {
				return;
			}
		}
		return oMetadataInstances.getItem(sAbsolutePathToServiceDocument).metadata;
	};
	/**
	 * @description Returns metadata object that represents metadata corresponding to the service document and an entity type that belongs to the service.
	 * @param {string} sAbsolutePathToServiceDocument Absolute path to the service document
	 * @param {string} sEntityType Entity type
	 * @returns {sap.apf.core.EntityTypeMetadata}
	 */
	this.getEntityTypeMetadata = function (sAbsolutePathToServiceDocument, sEntityType) {
		var oEntityTypes;
		var oMetadata = this.getMetadata(sAbsolutePathToServiceDocument);

		oEntityTypes = oMetadataInstances.getItem(sAbsolutePathToServiceDocument).entityTypes;
		if (!oEntityTypes) {
			oEntityTypes = new fnHashtable(oMessageHandler);
			oMetadataInstances.getItem(sAbsolutePathToServiceDocument).entityTypes = oEntityTypes;
		}
		if (!oEntityTypes.getItem(sEntityType)) {
			oEntityTypes.setItem(sEntityType, new fnEntityTypeMetadata(oMessageHandler, sEntityType, oMetadata));
		}
		return oEntityTypes.getItem(sEntityType);
	};
	/**
	 * @description Returns instance of {sap.apf.core.MetadataFacade}
	 * @returns {sap.apf.core.MetadataFacade}
	 */
    this.getMetadataFacade = function (sAbsolutePathToServiceDocument) {
            return new fnMetadataFacade({
                messageHandler : oMessageHandler,
                metadataProperty : sap.apf.core.MetadataProperty,
                metadataFactory : that
            }, sAbsolutePathToServiceDocument);
    };
    /**
	 * @description Returns service documents
	 * @returns {Array}
	 */
    this.getServiceDocuments = function () {
        return oConfigurationFactory.getServiceDocuments();
    };
    
    /**
	 * @description Returns all entity sets of service
	 * @returns {Array}
	 */
    this.getEntitySets = function(sService) {
    	var oMetadata = this.getMetadata(sService);
    	return oMetadata.getEntitySets();
    };
};
