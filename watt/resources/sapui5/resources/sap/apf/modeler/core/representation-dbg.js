/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP SE. All rights reserved
 */
/*global sap, jQuery*/

jQuery.sap.declare("sap.apf.modeler.core.representation");

(function () {
    'use strict';

    /**
     * @private
     * @memberOf sap.apf.modeler.core
     * @name sap.apf.modeler.core.Representation
     * @class A proxy object for representations providing editor methods on configuration objects.
     * @param {String} representationId - identifier.
     * @param {Object} inject - Injection of required APF object references, constructors and functions.
     * @param {sap.apf.core.utils.MessageHandler} inject.instance.messageHandler - MessageHandler instance
     * @param {Object} inject.constructor - Injected constructors
     * @param {sap.apf.core.utils.Hashtable} inject.constructor.hashtable - Hashtable constructor
     * @param {Object} dataFromCopy - Optional parameter to set the internal state of the new instance during a copy operation 
     * @constructor
     */
    sap.apf.modeler.core.Representation = function (representationId, inject, dataFromCopy) {
        var representationTypeId,
            alternateRepresentationTypeId,
            width,
            dimensions,
            measures,
            leftUpperCornerTextKey,
            rightUpperCornerTextKey,
            leftLowerCornerTextKey,
            rightLowerCornerTextKey,
            orderByProperties,
            topN;

        if(!dataFromCopy){
            width = {};	
            dimensions = new inject.constructor.elementContainer("dimension", undefined, inject);
            measures = new inject.constructor.elementContainer("measure", undefined, inject);
            orderByProperties = new inject.constructor.elementContainer("orderBy", undefined, inject);
        }else{
	    	representationTypeId = dataFromCopy.representationTypeId;
	        alternateRepresentationTypeId = dataFromCopy.alternateRepresentationTypeId;
	        width = dataFromCopy.width;
	        dimensions = dataFromCopy.dimensions;
	        measures = dataFromCopy.measures;
	        leftUpperCornerTextKey = dataFromCopy.leftUpperCornerTextKey;
	        rightUpperCornerTextKey = dataFromCopy.rightUpperCornerTextKey;
	        leftLowerCornerTextKey = dataFromCopy.leftLowerCornerTextKey;
	        rightLowerCornerTextKey = dataFromCopy.rightLowerCornerTextKey;
	        orderByProperties = dataFromCopy.orderByProperties;
	        topN =  dataFromCopy.topN;	
        }

        /**
         * @private
         * @name sap.apf.modeler.core.Representation#getId
         * @function
         * @description Return the immutable id.
         * @returns {String}
         */
        this.getId = function () {
            return representationId;
        };

        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.Representation#setRepresentationType
         * @description Mandatory member representationType
         * @param {String} - Representation type Id
         */
        this.setRepresentationType = function (typeId) {
            representationTypeId = typeId;
        };

        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.Representation#getRepresentationType
         * @description Mandatory member representationType
         * @returns {String} typeId
         */
        this.getRepresentationType = function () {
            return representationTypeId;
        };

        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.Representation#setAlternateRepresentationType
         * @description Optional property of a representation.
         * @param {String} typeId
         */
        this.setAlternateRepresentationType = function (typeId) {
            alternateRepresentationTypeId = typeId;
        };

        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.Representation#getAlternateRepresentationType
         * @returns {String} typeId
         */
        this.getAlternateRepresentationType = function () {
            return alternateRepresentationTypeId;
        };

        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.Representation#getDimensions
         * @description Return a list ID's of parameter objects describing dimensions of a representation.
         *      Each parameter object has a method getId() which returns the propertyName.
         * @returns {String[]} - an array of ID's
         */
        this.getDimensions = function () {
            var list = [];
            dimensions.getElements().forEach(function (obj) {
                list.push(obj.propertyName);
            });
            return list;
        };

        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.Representation#addDimension
         * @description Create and add a parameter object describing a dimension.
         *      Each stored parameter object has a method getId() which returns the given propertyName.
         *      WHEN calling twice on the same propertyName (without removing it) THEN the second call will be ignored and null returned.
         * @param {String} propertyName - OData property name
         * @param {String} [textLabelKey] - Optional property of the identified dimension parameter.
         * @returns {String} - An id which is the given propertyName
         */
        this.addDimension = function (propertyName, textLabelKey) {
            var obj;
            if (dimensions.getElement(propertyName)) { // when exists
                return null;
            }
            obj = {
                propertyName: propertyName,
                textLabelKey: textLabelKey
            };
            return dimensions.createElementWithProposedId(obj, propertyName).getId();
        };

        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.Representation#removeDimension
         * @description Remove the parameter object that is identified by the given OData property name.
         * @param {String} propertyName
         */
        this.removeDimension = function (propertyName) {
            dimensions.removeElement(propertyName);
        };

        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.Representation#setDimensionKind
         * @description Set the kind of the dimension for a given representationType. The representationType defines the supported kinds.
         * @param {String} propertyName - OData property name
         * @param {String} kind - A kind of dimension.
         */
        this.setDimensionKind = function (propertyName, kind) {
            var object = dimensions.getElement(propertyName);
            if (object) {
                object.kind = kind;
            }
        };
        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.Representation#getDimensionKind
         * @description Return the kind of dimension.
         *      The property is optional, and the default value undefined.
         * @param {String} propertyName - OData property name
         * @returns {String|undefined} - A kind of dimension.
         */
        this.getDimensionKind = function (propertyName) {
            var object = dimensions.getElement(propertyName);
            if (object) {
                return object.kind;
            }
            return undefined;
        };

        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.Representation#setDimensionTextLabelKey
         * @description Set the text key of the parameter object identified by the propertyName. This property of the parameter object is optional.
         * @param {String} propertyName - OData property name
         * @param {String} textLabelKey - A text id/key (GUID).
         */
        this.setDimensionTextLabelKey = function (propertyName, textLabelKey) {
            var object = dimensions.getElement(propertyName);
            if (object) {
                object.textLabelKey = textLabelKey;
            }
        };
        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.Representation#getDimensionTextLabelKey
         * @description Return the text key of the identified parameter object.
         *      Return undefined if there is no object defined for the given propertyName.
         * @param {String} propertyName - OData property name
         * @returns {String|undefined} - A text id/key (GUID).
         */
        this.getDimensionTextLabelKey = function (propertyName) {
            var object = dimensions.getElement(propertyName);
            if (object) {
                return object.textLabelKey;
            }
            return undefined;
        };

        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.Representation#getMeasures
         * @description Return a list of parameter objects describing measures of a representation.
         *      Each parameter object has a method getId() which returns the propertyName.
         * @returns {String[]} - list of ids which are propertyNames
         */
        this.getMeasures = function () {
            var list = [];
            measures.getElements().forEach(function (obj) {
                list.push(obj.propertyName);
            });
            return list;
        };

        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.Representation#addMeasure
         * @description Add a parameter object describing a measure.
         *      WHEN calling twice on the same propertyName (without removing it) THEN the second call will be ignored and nul returned.
         * @param {String} propertyName
         */
        this.addMeasure = function (propertyName) {
            var obj;
            if (measures.getElement(propertyName)) {
                return null;
            }
            obj = {
                propertyName: propertyName
            };
            return measures.createElementWithProposedId(obj, propertyName).getId();
        };

        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.Representation#removeMeasure
         * @description Remove the measure which is identified by its OData property name.
         * @param {String} propertyName
         */
        this.removeMeasure = measures.removeElement;

        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.Representation#setMeasureTextLabelKey
         * @description Set the text key of the parameter object. This part of the parameter object is optional.
         * @param {String} propertyName - OData property name
         * @param {String} textLabelKey - A text id/key (GUID).
         */
        this.setMeasureTextLabelKey = function (propertyName, textLabelKey) {
            var object = measures.getElement(propertyName);
            if (object) {
                object.textLabelKey = textLabelKey;
            }
        };
        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.Representation#getMeasureTextLabelKey
         * @description Return the text key of the parameter object.
         *      Return undefined if there is no object defined for the given propertyName.
         * @param {String} propertyName - OData property name
         * @returns {String|undefined} - A text id/key (GUID).
         */
        this.getMeasureTextLabelKey = function (propertyName) {
            var object = measures.getElement(propertyName);
            if (object) {
                return object.textLabelKey;
            }
            return undefined;
        };

        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.Representation#setMeasureKind
         * @description Set the kind of the measure for a given representationType. The representationType defines the supported kinds.
         * @param {String} propertyName - OData property name
         * @param {String} kind - A kind of measure.
         */
        this.setMeasureKind = function (propertyName, kind) {
            var object = measures.getElement(propertyName);
            if (object) {
                object.kind = kind;
            }
        };
        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.Representation#getMeasureKind
         * @description Return the kind of measure.
         *      The property is optional, and the default value undefined.
         * @param {String} propertyName - OData property name
         * @returns {String|undefined} - A kind of measure.
         */
        this.getMeasureKind = function (propertyName) {
            var object = measures.getElement(propertyName);
            if (object) {
                return object.kind;
            }
            return undefined;
        };

        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.Representation#setWidthProperty
         * @description Add a width property to the representation.
         *      The width is optional and used for table representations specifying the width of table columns.
         * @param {String} propertyName
         * @param {Object} propertyValue
         */
        this.setWidthProperty = function (propertyName, propertyValue) {
            width[propertyName] = propertyValue;
        };

        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.Representation#getWidthProperties
         * @description Return a width object literal containing all width properties of a representation.
         *      The width object is optional and used for table representations specifying the width of table columns.
         * @return {Object|undefined}
         */
        this.getWidthProperties = function () {
            return width;
        };

        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.Representation#setLeftUpperCornerTextKey
         * @description Optional member.
         *          When the value is null or undefined the corner text will be omitted from the serialized configuration object.
         *          The initial value is set to undefined.
         * @param {String|null} textKey
         */
        this.setLeftUpperCornerTextKey = function (textKey) {
            leftUpperCornerTextKey = textKey;
        };

        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.Representation#getLeftUpperCornerTextKey
         * @description Get optional member.
         * @returns {String|undefined|null} Return a textKey (GUID). Returns undefined when initial, null or undefined when set to null or undefined.
         */
        this.getLeftUpperCornerTextKey = function () {
            return leftUpperCornerTextKey;
        };

        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.Representation#setRightUpperCornerTextKey
         * @description Optional member
         * @param {String|null} textKey
         */
        this.setRightUpperCornerTextKey = function (textKey) {
            rightUpperCornerTextKey = textKey;
        };

        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.Representation#getRightUpperCornerTextKey
         * @description Optional member
         * @returns {String} typeId
         */
        this.getRightUpperCornerTextKey = function () {
            return rightUpperCornerTextKey;
        };

        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.Representation#setLeftLowerCornerTextKey
         * @description Optional member
         * @param {String|null} textKey
         */
        this.setLeftLowerCornerTextKey = function (textKey) {
            leftLowerCornerTextKey = textKey;
        };

        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.Representation#getLeftLowerCornerTextKey
         * @description Optional member
         * @returns {String} typeId
         */
        this.getLeftLowerCornerTextKey = function () {
            return leftLowerCornerTextKey;
        };

        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.Representation#setRightLowerCornerTextKey
         * @description Optional member
         * @param {String|null} textKey
         */
        this.setRightLowerCornerTextKey = function (textKey) {
            rightLowerCornerTextKey = textKey;
        };

        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.Representation#getRightLowerCornerTextKey
         * @description Optional member
         * @returns {String} typeId
         */
        this.getRightLowerCornerTextKey = function () {
            return rightLowerCornerTextKey;
        };

        
        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.Representation#setTopN
         * @description Sets the value for the request option top
         * @param {number} top
         */
        this.setTopN = function(top) {
        	topN = top;
        };
        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.Representation#getTopN
         * @description gets the value for top n
         * @param {number} counter
         */
         this.getTopN = function() {
        	 return topN;
         };
        
        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.Representation#addOrderbySpec
         * @description Add a specification describing the ordering of a property in OData.
         *      Can be used to update an existing specification identified by the property name.
         *      The specification is optional.
         * @param {String} propertyName
         * @param {boolean} propertyName - when ascending == true then the "asc" will be omitted in the OData URI.
         *      Otherwise "desc" will be rendering in the URI.
         */
        this.addOrderbySpec = function (propertyName, ascending) {
            var obj;
            obj = orderByProperties.getElement(propertyName);
            if (obj) {
                obj.ascending = ascending;
                return obj;
            }
            obj = {
                property: propertyName,
                ascending: ascending
            };
            return orderByProperties.createElementWithProposedId(obj, propertyName).getId();
        };

        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.Representation#removeOrderbySpec
         * @description Remove the order specification that is identified by the given OData property name.
         * @param {String} propertyName
         */
        this.removeOrderbySpec = function (propertyName) {
            orderByProperties.removeElement(propertyName);
        };

        /**
         * @private
         * @function
         * @name sap.apf.modeler.core.Representation#getMeasures
         * @description Return a list of parameter objects describing measures of a representation.
         *      Each parameter object has a method getId() which returns the propertyName.
         * @returns {String[]} - list of ids which are propertyNames
         */
        this.getOrderbySpecifications = function () {
            var list = [];
            orderByProperties.getElements().forEach(function (obj) {
                list.push({
                    property: obj.property,
                    ascending: obj.ascending
                });
            });//forEach
            return list;
        };
        
        /**
         * @private
         * @name sap.apf.modeler.core.Representation#copy
         * @function
         * @description Execute a deep copy of the representation and its referenced objects
         * @param {String} newIdForCopy - New Id for the copied instance
         * @returns {Object} sap.apf.modeler.core.Representation# - New representation object being a copy of this object
         */
        this.copy = function( newIdForCopy ){
        	var dataForCopy = {
        			representationTypeId : representationTypeId,
                    alternateRepresentationTypeId : alternateRepresentationTypeId,
                    width : width,
                    dimensions : dimensions,
                    measures : measures,
                    leftUpperCornerTextKey : leftUpperCornerTextKey,
                    rightUpperCornerTextKey : rightUpperCornerTextKey,
                    leftLowerCornerTextKey : leftLowerCornerTextKey,
                    rightLowerCornerTextKey : rightLowerCornerTextKey,
                    orderByProperties : orderByProperties,
                    topN : topN 
                    };
        	
        	var dataFromCopy = sap.apf.modeler.core.ConfigurationObjects.deepDataCopy( dataForCopy );
        	return new sap.apf.modeler.core.Representation( (newIdForCopy || this.getId()), inject, dataFromCopy);
        };
    };
}());