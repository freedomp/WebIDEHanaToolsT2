/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */

jQuery.sap.declare("sap.apf.utils.serializationMediator");
/**
 * @private
 * @class Serialization Mediator gets, collects and distributes non-core objects for persistence operations (save, open and delete).
 * @param {object} oInject Object containing an instance of {@link sap.apf.utils.FilterIdHandler} and {@link sap.apf.core.Instance}
 * @param {object} oInject.filterIdHandler Instance of {@link sap.apf.utils.FilterIdHandler} 
 * @param {object} oInject.coreApi Instance of {@link sap.apf.core.Instance}
 * @returns {sap.apf.utils.SerializationMediator}
 */
sap.apf.utils.SerializationMediator = function(oInject){
    /**
     * @private
     * @function
     * @name sap.apf.utils.SerializationMediator#savePath
     * @description Saves or modifies the current path on server side under the provided name.
     * @param {string} [sPathId] If provided the path identified by the ID is modified with the current path.
     * If omitted the current path will be created as new saved path with a new ID.
     * @param {string} sName Name of the path to be saved
     * @param {function} fnCallback The first argument of the callback function is an object with property AnalysisPath and status.
     * The second argument is {sap.apf.core.EntityTypeMetadata}.
     * The third argument is undefined or {sap.apf.core.MessageObject} if a message occurred.
     * @returns undefined
     */
	this.savePath = function(arg1, arg2, arg3){
		var oExternalObjects;
		oInject.startFilterHandler.serialize().done(afterStartFilterHandlerSerialized);
		
		function afterStartFilterHandlerSerialized(serializedStartFilter){
			oExternalObjects = {
                filterIdHandler : oInject.filterIdHandler.serialize(),
                startFilterHandler : serializedStartFilter
			};			
			if (typeof arg1 === 'string' && typeof arg2 === 'function') {
				//case for create path
				oInject.coreApi.savePath(arg1, arg2, oExternalObjects);
			}else if (typeof arg1 === 'string' && typeof arg2 === 'string' && typeof arg3 === 'function'){
				//case for update path
				oInject.coreApi.savePath(arg1, arg2, arg3, oExternalObjects);
			}
		}
	};

    /**
     * @private
     * @function
     * @name sap.apf.utils.SerializationMediator#openPath
     * @description Opens a path, that has been stored on server side and replaces the current path.
     * @param {string} sPathId Identifies the analysis path to be opened
     * @param {function} fnCallback The first argument of the callback function is a JS object with property path, that holds the stored path and status. The second argument is {sap.apf.core.EntityTypeMetadata}. The third argument is undefined or {sap.apf.core.MessageObject} if a message occurred.
     * @param {number} [nActiveStep] Sets the active step.
     * @returns undefined
     */
	this.openPath = function(sPathId, fnCallback, nActiveStep){
		var fnCallbackFromCoreApi = function(oResponse, oEntityTypeMetadata, oMessageObjectForUI){
            if(oResponse && oResponse.path && oResponse.path.SerializedAnalysisPath && oResponse.path.SerializedAnalysisPath.filterIdHandler){
                oInject.filterIdHandler.deserialize(oResponse.path.SerializedAnalysisPath.filterIdHandler);
                delete oResponse.path.SerializedAnalysisPath.filterIdHandler;
            }
            if(oResponse && oResponse.path && oResponse.path.SerializedAnalysisPath && oResponse.path.SerializedAnalysisPath.startFilterHandler){
            	oInject.startFilterHandler.deserialize(oResponse.path.SerializedAnalysisPath.startFilterHandler);
            	delete oResponse.path.SerializedAnalysisPath.startFilterHandler;
            }
            fnCallback(oResponse, oEntityTypeMetadata, oMessageObjectForUI);
        };

        oInject.coreApi.openPath(sPathId, fnCallbackFromCoreApi, nActiveStep);
	};
    /**
     * @private
     * @function
     * @name sap.apf.utils.SerializationMediator#deletePath
     * @description Deletes the path with the given ID on server
     * @param {string} sPathId Identifies the analysis path to be deleted
     * @param {function} fnCallback The first argument of the callback function is a JS object, that holds the property status. The second argument is {sap.apf.core.EntityTypeMetadata}. The third argument is undefined or {sap.apf.core.MessageObject} if a message occurred.
     * @returns undefined
     */
	this.deletePath = function(sPathId, fnCallback){
		oInject.coreApi.deletePath(sPathId, fnCallback);
	};

	/**
	 * @private
	 * @function
	 * @name sap.apf.utils.SerializationMediator#readPaths
	 * @description Reads all stored paths from server
	 * @param {function} fnCallback This callback function is called after function readPaths has been executed.
	 * @param {function} fnCallback(oResponse, oEntitiyMetadata, oMessageObject)
	 * @returns undefined
	 */
	this.readPaths = function(fnCallback){
		oInject.coreApi.readPaths(fnCallback);
	};
};