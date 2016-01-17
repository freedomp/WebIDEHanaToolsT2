/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["../base/modelbase",
        "../base/common"
    ], // relative path ../../analytics... doesn't work here
    function(modelbase, common) {
        "use strict";

        var AbstractModelClass = modelbase.AbstractModelClass;
        var AttributeMissingException = modelbase.AttributeMissingException;
        var InvalidAttributeException = modelbase.InvalidAttributeException;
        var Util = common.Util;

        var NameSpace = {
            CALCULATION: "http://www.sap.com/ndb/BiModelCalculation.ecore",
            ACCESSCONTROL: "http://www.sap.com/ndb/SQLCoreModelAccessControl.ecore",
            PRIVILEGE: "http://www.sap.com/ndb/BiModelPrivilege.ecore",
            VARIABLE: "http://www.sap.com/ndb/BiModelVariable.ecore",
            DATAFOUNDATION: "http://www.sap.com/ndb/BiModelDataFoundation.ecore",
            DIMENSION: "http://www.sap.com/ndb/BiModelDimension.ecore"
        };

        /**
         * @modelClass ValueFilter
         * @property {string}   operator  @enum ValueFilterOperator
         * @property {boolean}  including
         * @property {type}     xsi:type
         * @property {String}   value
         * @property {String}   lowValue
         * @property {String}   highValue
         */
        var ValueFilter = AbstractModelClass.extend("ValueFilter", {

            $features: {
                containments: {
                    "operands": {
                        isMany: true
                    }
                }
            },

            $init: function() {
                if (!this.type) {
                    throw new AttributeMissingException(this, "type")
                }
                if (!this.operator) {
                    throw new AttributeMissingException(this, "operator")
                }

                //check combinations
                switch (this.type) {
                    case ValueFilterType.SINGLE_VALUE_FILTER:
                        if (this.hasOwnProperty("lowValue")) {
                            delete this.lowValue;
                        }
                        if (this.hasOwnProperty("highValue")) {
                            delete this.highValue;
                        }
                        if (!this.hasOwnProperty("value") && this.operator !== ValueFilterOperator.IS_NULL) {
                            throw new AttributeMissingException(this, "value")
                        }
                        break;
                    case ValueFilterType.LIST_VALUE_FILTER:
                        if (this.hasOwnProperty("lowValue")) {
                            delete this.lowValue;
                        }
                        if (this.hasOwnProperty("highValue")) {
                            delete this.highValue;
                        }
                        if (this.hasOwnProperty("value")) {
                            delete this.value;
                        }
                        //existance of operands can only be checked later
                        break;
                    case ValueFilterType.RANGE_VALUE_FILTER:
                        if (!this.hasOwnProperty("lowValue")) {
                            throw new AttributeMissingException(this, "lowValue")
                        }
                        if (!this.hasOwnProperty("highValue")) {
                            throw new AttributeMissingException(this, "highValue")
                        }
                        if (this.hasOwnProperty("value")) {
                            delete this.value;
                        }
                        break;
                    default:
                        throw new InvalidAttributeException(this, "type", this.type);
                }
            },

            //Merge not required
            createOperand: function(attributes, skippedNodes) {
                var operand = new ValueFilterOperand(attributes, skippedNodes);
                this.operands.add(operand);
                return operand;
            }
        });

        /** 
         * helper methods for parsing the attributes of ValueFilter
         */
        var getValueFilterAttributeMappingParsing = function(reader) {
            var parsingMapper = function(value) {
                return reader.removePrefix(NameSpace.ACCESSCONTROL, value);
            };
            return {
                type: Util.createXsiSelector("type", parsingMapper),
                operator: "{operator}",
                including: "{including}",
                value: "{value}",
                lowValue: "{lowValue}",
                highValue: "{highValue}"
            };
        };

        var getValueFilterAttributeMappingWriting = function(writer) {
            var writingMapper = function(value) {
                return writer.addPrefix(NameSpace.ACCESSCONTROL, value);
            };
            return {
                type: Util.createXsiSelector("type", writingMapper),
                operator: "{operator}",
                including: "{including}",
                value: "{value}",
                lowValue: "{lowValue}",
                highValue: "{highValue}"
            };
        };

        /**
         * @modelClass - ValueFilterOperand
         * @property {String}   value
         */
        var ValueFilterOperand = AbstractModelClass.extend("ValueFilterOperand", {

            $init: function() {
                if (!this.value) {
                    throw new AttributeMissingException(this, "value")
                }
            }
        });

        /** 
         * @enum {string} ValueFilterOperator
         */
        var ValueFilterOperator = {
            EQUAL: "EQ",
            LESS_THAN: "LT",
            LESS_EQUAL: "LE",
            GREATER_THAN: "GT",
            GREATER_EQUAL: "GE",
            BETWEEN: "BT",
            IN: "IN",
            CONTAINS_PATTERN: "CP",
            IS_NULL: "NL"
        };

        /** 
         * @enum {string} ValueFilterType
         */
        var ValueFilterType = {
            SINGLE_VALUE_FILTER: "SingleValueFilter",
            LIST_VALUE_FILTER: "ListValueFilter",
            RANGE_VALUE_FILTER: "RangeValueFilter"
        };

        /************************************* parsing ********************************/

        /** 
         * common base method for parsing descriptions
         */
        var parseDescriptions = function(reader, attributes, moveDown) {
            if (!attributes) {
                attributes = {};
            }
            if (moveDown) {
                reader.moveDown();
            }
            if (reader.tryMoveToIntermediate("descriptions")) {
                attributes.haveDescriptionsTag = true;
                reader.buildAttributes({
                    label: "{defaultDescription}"
                }, attributes);
                // I066990: descriptions can have comment 
                if (reader.tryMoveDown()) {
                    if (reader.tryMoveToIntermediate("comment")) {
                        reader.buildAttributes({
                            comment: "{text}"
                        }, attributes);       
                    }  
                    reader.moveUp();
                } 
                reader.skipChildren();
                reader.next();
            }
            if (moveDown) {
                reader.moveUp();
            }
            //console.log(attributes.label);
            return attributes;
        };

        /** 
         * common base method for parsing descriptions
         */
        var parseValueFilter = function(reader) {
            var valueFilterSkippedNodes = reader.skippedNodes;
            var valueFilterAttributeMapping = getValueFilterAttributeMappingParsing(reader);
            var valueFilterAttributes = reader.buildAttributes(valueFilterAttributeMapping);
            //since operator is mandatory and not unsettable in EMF: no operator is serialized in the XML <=> value of operator = 'EQ'
            if (!valueFilterAttributes.operator) {
                valueFilterAttributes.operator = ValueFilterOperator.EQUAL;
            }
            var valueFilter = new ValueFilter(valueFilterAttributes, valueFilterSkippedNodes);
            parseOperands(reader, valueFilter);
            return valueFilter;
        };

        var parseOperands = function(reader, valueFilter) {
            if (valueFilter.operator !== ValueFilterOperator.IN) {
                return;
            }
            if (reader.tryMoveDown()) {
                while (reader.tryMoveTo("operands")) {
                    var operandSkippedNodes = reader.skippedNodes;
                    var operandAttributes = reader.buildAttributes({
                        value: "{value}"
                    });
                    valueFilter.createOperand(operandAttributes, operandSkippedNodes);
                    reader.next();
                }
                reader.moveUp();
            }
        };

        /************************************* rendering ********************************/

        var renderValueFilter = function(valueFilter, parent, writer, elementName) {
            var attributeMapping = getValueFilterAttributeMappingWriting(writer);
            //since operator is mandatory and not unsettable in EMF: no operator is serialized in the XML <=> value of operator = 'EQ'
            if (valueFilter.operator && valueFilter.operator === ValueFilterOperator.EQUAL) {
                delete attributeMapping.operator;
            }
            var valueFilterElement = writer.writeElement(valueFilter, parent, elementName, attributeMapping);
            valueFilter.operands.foreach(function(operand) {
                writer.writeElement(operand, valueFilterElement, "operands", {
                    value: "{value}"
                });
            });
            return valueFilterElement;
        };

        return {
            NameSpace: NameSpace,
            ValueFilter: ValueFilter,
            ValueFilterOperand: ValueFilterOperand,
            ValueFilterOperator: ValueFilterOperator,
            ValueFilterType: ValueFilterType,
            //parsing    
            parseDescriptions: parseDescriptions,
            parseValueFilter: parseValueFilter,
            // rendering
            renderValueFilter: renderValueFilter
        };

    });
