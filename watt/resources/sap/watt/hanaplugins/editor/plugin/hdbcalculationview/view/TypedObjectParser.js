/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["../viewmodel/model"], function(model) {
    "use strict";
    var AggregationBehavior = model.AggregationBehavior;

    var startsWith = function(value, test) {
        if (!value || !test) return false;
        if (value.length < test.length) return false;
        if (value.substr(0, test.length) !== test) return false;
        return true;
    };

    var primitiveTypes = ["ALPHANUM", "BINTEXT", "BIGINT", "BLOB", "CLOB", "DATE", "DECIMAL", "DOUBLE", "FLOAT", "INTEGER", "NCLOB", "NVARCHAR",
        "REAL", "SECONDDATE", "SHORTTEXT", "SMALLDECIMAL", "SMALLINT", "ST_GEOMETRY", "ST_POINT", "TEXT", "TIME", "TIMESTAMP", "TINYINT", "VARBINARY", "VARCHAR"
    ];
    var primitiveTypesLength = {
        "ALPHANUM": {
            length: 127
        },
        "DECIMAL": {
            length: 34,
            scale: 34
        },
        "FLOAT": {
            length: 53
        },
        "NVARCHAR": {
            length: 5000
        },
        "SHORTTEXT": {
            length: 5000
        },
        "VARCHAR": {
            length: 5000
        },
        "VARBINARY": {
            length: 5000
        }
    };
    var datetimeTypes = {
        "DATE": null,
        "SECONDDATE": null,
        "TIME": null,
        "TIMESTAMP": null
    };
    var numericTypes = {
        "BIGINT": null,
        "DECIMAL": null,
        "DOUBLE": null,
        "FLOAT": null,
        "INTEGER": null,
        "REAL": null,
        "SMALLDECIMAL": null,
        "SMALLINT": null,
        "TINYINT": null
    };
    var characterStringTypes = {
        "ALPHANUM": null,
        "NVARCHAR": null,
        "SHORTTEXT": null,
        "VARCHAR": null
    };
    var binaryTypes = {
        "VARBINARY": null
    };
    var largeObjectTypes = {
        "BINTEXT": null,
        "BLOB": null,
        "CLOB": null,
        "NCLOB": null,
        "TEXT": null
    };

    /**
     * @class
     */
    var TypedObjectParser = function(objectType) {
        this._objectType = objectType;
        // type dependent messages (column, parameter, ...)
        this.MSG_OBJECT_INVALID = "msg_" + this._objectType + "_invalid";
        this.MSG_OBJECT_INVALID_NAME = "msg_" + this._objectType + "_invalid_name";
        this.MSG_OBJECT_ALREADY_EXISTS = "msg_" + this._objectType + "_already_exists";
        this.MSG_OBJECT_MISSING_COLON = "msg_" + this._objectType + "_missing_colon";
        this.MSG_OBJECT_EMPTY = "msg_" + this._objectType + "_empty";
        // independent messages
        this.MSG_OBJECT_INVALID_TYPE = "msg_object_invalid_type";
        this.MSG_OBJECT_MISSING_OPENING_BRACKET = "msg_object_missing_opening_bracket";
        this.MSG_OBJECT_INVALID_LENGTH = "msg_object_invalid_length";
        this.MSG_OBJECT_MISSING_CLOSING_BRACKET_OR_COMMA = "msg_object_missing_closing_bracket_or_comma";
        this.MSG_OBJECT_INVALID_SCALE = "msg_object_invalid_scale";
        this.MSG_OBJECT_MISSING_CLOSING_BRACKET = "msg_object_missing_closing_bracket";
        this.MSG_OBJECT_INVALID_END = "msg_object_invalid_end";
        this.MSG_OBJECT_UNKNOWN_DATA_TYPE = "msg_object_unknown_data_type";
        this.MSG_OBJECT_LENGTH_NOT_SUPPORTED = "msg_object_length_not_supported";
        this.MSG_OBJECT_SCALE_NOT_SUPPORTED = "msg_object_scale_not_supported";
        this.MSG_OBJECT_LENGTH_NOT_SPECIFIED = "msg_object_length_not_specified";
        this.MSG_OBJECT_MINIMUM_LENGTH_1 = "msg_object_minimum_length_1";
        this.MSG_OBJECT_MAX_LEN_EXCEEDED = "msg_object_maximum_length_exceeded";
        this.MSG_OBJECT_MAX_SCALE_EXCEEDED = "msg_object_maximum_scale_exceeded";

        this._messages = [
            this.MSG_OBJECT_INVALID_NAME,
            this.MSG_OBJECT_MISSING_COLON,
            this.MSG_OBJECT_INVALID_TYPE,
            this.MSG_OBJECT_MISSING_OPENING_BRACKET,
            this.MSG_OBJECT_INVALID_LENGTH,
            this.MSG_OBJECT_MISSING_CLOSING_BRACKET_OR_COMMA,
            this.MSG_OBJECT_INVALID_SCALE,
            this.MSG_OBJECT_MISSING_CLOSING_BRACKET,
            this.MSG_OBJECT_INVALID_END
        ];
    };

    TypedObjectParser.prototype = {

        _negativePatterns: [
            // invalid name
            /^\W/,
            // missing :
            /^\w+(?:[^\w:]|$)/,
            // invalid type
            /^\w+:\W/,
            // missing (
            /^\w+:\w+[^\w\(]/,
            // invalid length
            /^\w+:\w+\((?:\D|$)/,
            // missing ) or ,
            /^\w+:\w+\(\d+(?:[^\d\),]|$)/,
            // invalid scale
            /^\w+:\w+\(\d+,(?:\D|$)/,
            // missing )
            /^\w+:\w+\(\d+,\d+(?:[^\d\)]|$)/,
            // invalid end
            /^\w+:\w+\(\d+(?:,\d+)?\)./
        ],

        _pattern: /^(\w+):(\w+)(?:\((\d+)(?:,(\d+))?\))?$/,

        isPrimitiveType: function(typeName) {
            return primitiveTypes.indexOf(typeName) >= 0;
        },
        getPrimitiveTypeMaxLength: function(typeName) {
            var type = primitiveTypesLength[typeName];
            return type ? type.length : -1;
        },
        getPrimitiveTypeMaxScale: function(typeName) {
            var type = primitiveTypesLength[typeName];
            return type && type.scale ? type.scale : -1;
        },
        isNumericType: function(type) {
            return numericTypes.hasOwnProperty(type);
        },
        isCharacterStringType: function(type) {
            return characterStringTypes.hasOwnProperty(type);
        },
        isDateTimeType: function(type) {
            return datetimeTypes.hasOwnProperty(type);
        },
        getValidAggregationBehaviorFor: function(type) {
            if (this.isDateTimeType(type)) {
                return [AggregationBehavior.MIN, AggregationBehavior.MAX, AggregationBehavior.COUNT, AggregationBehavior.NONE];
            }
            if (this.isNumericType(type)) {
                return [AggregationBehavior.SUM, AggregationBehavior.MIN, AggregationBehavior.MAX, AggregationBehavior.COUNT, AggregationBehavior.NONE];
            }
            if (this.isCharacterStringType(type)) {
                return [AggregationBehavior.NONE, AggregationBehavior.MIN, AggregationBehavior.MAX, AggregationBehavior.COUNT];
            }
            // binary types, geospatial typs or large objects
            return [AggregationBehavior.NONE, AggregationBehavior.COUNT];
        },
        calculateAggregationBehavior: function(type, previous) {
            if (previous) {
                previous = previous.toLowerCase();
            }
            var aggregations = this.getValidAggregationBehaviorFor(type);
            if (previous && aggregations.indexOf(previous) >= 0) {
                return previous;
            } else {
                return aggregations[0];
            }
        },

        parse: function(value, existingObject) {
            if (!value) value = "";
            // remove all white-spaces from end and beginning as well as before and after special characters (),:
            value = value.trim().replace(/([\(\),:])\s+/g, '$1').replace(/\s+([\(\),:])/g, '$1');

            var result = {
                value: value,
                errorId: null,
                errorParams: [],
                errorMatch: "",
                objectAttributes: {},
                typeAttributes: {}
            };

            // test empty string
            if (result.value.length === 0) {
                result.errorId = this.MSG_OBJECT_EMPTY;
                return result;
            }

            // test negative patterns
            var components, i;
            for (i = 0; i < this._negativePatterns.length; i++) {
                components = this._negativePatterns[i].exec(result.value);
                if (components && components.length > 0) {
                    result.errorId = this._messages[i];
                    result.errorMatch = components[0];
                    return result;
                }
            }

            // apply pattern
            components = this._pattern.exec(result.value);
            if (!components || components.length !== 5) {
                result.errorId = this.MSG_OBJECT_INVALID;
                result.errorMatch = result.value;
                return result;
            }

            // validate type
            var name = components[1];
            var type = components[2].toUpperCase();
            var length = components[3] ? parseInt(components[3], 10) : undefined;
            var scale = components[4] ? parseInt(components[4], 10) : undefined;

            if (!this.isPrimitiveType(type)) {
                result.errorId = this.MSG_OBJECT_UNKNOWN_DATA_TYPE;
                result.errorParams.push(type);
                return result;
            }
            var maxLength = this.getPrimitiveTypeMaxLength(type);
            var maxScale = Math.min(this.getPrimitiveTypeMaxScale(type), length);
            if (typeof length === "number" && maxLength < 0) {
                result.errorId = this.MSG_OBJECT_LENGTH_NOT_SUPPORTED;
                result.errorParams.push(type);
                return result;
            }
            if (typeof scale === "number" && maxScale < 0) {
                result.errorId = this.MSG_OBJECT_SCALE_NOT_SUPPORTED;
                result.errorParams.push(type);
                return result;
            }
            if (typeof length === "undefined" && maxLength > 0) {
                result.errorId = this.MSG_OBJECT_LENGTH_NOT_SPECIFIED;
                result.errorParams.push(type);
                return result;
            }
            if (typeof scale === "undefined" && maxScale > 0) {
                // set default scale
                scale = 0;
            }
            if (length < 1) {
                result.errorId = this.MSG_OBJECT_MINIMUM_LENGTH_1;
                result.errorParams.push(type);
                return result;
            }
            if (maxLength > 0 && length > maxLength) {
                result.errorId = this.MSG_OBJECT_MAX_LEN_EXCEEDED;
                result.errorParams = result.errorParams.concat(type, maxLength);
                return result;
            }

            if (maxScale > 0 && scale > maxScale) {
                result.errorId = this.MSG_OBJECT_MAX_SCALE_EXCEEDED;
                result.errorParams = result.errorParams.concat(type, maxScale);
                return result;
            }
            result.objectAttributes.name = name;
            result.objectAttributes.aggregationBehavior = this.calculateAggregationBehavior(type, existingObject ? existingObject.aggregationBehavior : undefined);
            result.objectAttributes.label = existingObject ? existingObject.label : name;
            result.typeAttributes.primitiveType = type;
            result.typeAttributes.isDerived = false;
            if (typeof length !== "undefined" || existingObject && existingObject.hasOwnProperty("length") && typeof existingObject.length === "number") {
                result.typeAttributes.length = length;
            }
            if (typeof scale !== "undefined" || existingObject && existingObject.hasOwnProperty("scale") && typeof existingObject.scale === "number") {
                result.typeAttributes.scale = scale;
            }
            return result;
        },

        buildTypeSuggestions: function(value) {
            // defaults - no filter requested
            var prefix = "";
            var typeNamePrefix = null;
            var suffix = "";
            var items = [];
            var i;

            if (value) {
                // filter requested - we parser the following components
                // 1: column name followed by a colon (including white spaces between the tokens)
                // 2: type name
                // 3: waste - everything until we find either a digit or one of the following characters (,)
                // 4: remaining characters - starting with either a digit or one of the following characters (,)
                // the completions are composed of 1, the completion of 2 and 4
                // we skip 3 to allow for easy changing the type, e.g. it is sufficient to type 'SH ' after ':' in 
                // 'name: NVARCHAR(200)' which results in 'name: SH NVARCHAR(200)' and the suggested value of 'name: SHORTTEXT(200)'
                var components = /^(\s*\w+\s*:\s*)(\w*)([^\(\),\d]*)(.*$)/.exec(value);
                if (components && components.length === 5) {
                    prefix = components[1];
                    typeNamePrefix = components[2];
                    suffix = components[4];
                } else {
                    return items;
                }
            }

            for (i = 0; i < primitiveTypes.length; i++) {
                if (typeNamePrefix) {
                    if (!startsWith(primitiveTypes[i], typeNamePrefix)) {
                        continue;
                    }
                }
                items.push(prefix + primitiveTypes[i] + suffix);
            }
            return items;
        }

    };

    return TypedObjectParser;

});
