/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

define([],
    function() {
        var SCHEMA_PRIVILEGE = {
            text: "ALL PRIVILEGES|ALTER|DEBUG|DELETE|DROP|EXECUTE|INDEX|INSERT|SELECT|REFERENCES|TRIGGER|UPDATE",
            category: "sql.schema.privilege"
        };

        // available in db
        // var SYSTEM_PRIVILEGE = {
        //     text: "AUDIT ADMIN|CREDENTIAL ADMIN|DATA ADMIN|INIFILE ADMIN|LOG ADMIN|MONITOR ADMIN|OPTIMIZER ADMIN|RESOURCE ADMIN|SCENARIO ADMIN|SERVICE ADMIN|BACKUP ADMIN|LICENSE ADMIN|ROLE ADMIN|SAVEPOINT ADMIN|SESSION ADMIN|STRUCTUREDPRIVILEGE ADMIN|TRACE ADMIN|TRUST ADMIN|USER ADMIN|VERSION ADMIN|",
        //     category: "sql.system.privilege"
        // };        

        var DATA_TYPE = {
            DATETIME: {
                text: "DATE|TIME|SECONDDATE|TIMESTAMP",
                category: "sql.datatype.datetime"
            },
            NUMERIC: {
                text: "TINYINT|SMALLINT|INTEGER|BIGINT|SMALLDECIMAL|DECIMAL|REAL|DOUBLE|INT",
                category: "sql.datatype.numeric"
            },
            CHARACTER_STRING: {
                text: "VARCHAR|NVARCHAR|ALPHANUM|SHORTTEXT|CHAR|STRING",
                category: "sql.datatype.character"
            },
            BINARY: {
                text: "VARBINARY|BINARY",
                category: "sql.datatype.binary"
            },
            LARGE_OBJECT: {
                text: "BLOB|CLOB|NCLOB|TEXT",
                category: "sql.datatype.lob"
            }
        };

        var _parseContants = function(oConstant) {
            var aKeywords = [];
            var aTexts = oConstant.text.split("|");
            var sCategory = oConstant.category;
            var i = 0;
            for (i = 0; i < aTexts.length; i++) {
                var oEntry = {};
                oEntry.text = aTexts[i];
                oEntry.category = sCategory;
                aKeywords.push(oEntry);
            }
            return aKeywords;
        };

        return {
            _aDataTypes: null,

            _aSchemaPrivileges: null,

            getDataTypes: function() {
                if (!this._aDataTypes || this._aDataTypes.length === 0) {
                    this._aDataTypes = _parseContants(DATA_TYPE.DATETIME)
                        .concat(_parseContants(DATA_TYPE.NUMERIC))
                        .concat(_parseContants(DATA_TYPE.CHARACTER_STRING))
                        .concat(_parseContants(DATA_TYPE.BINARY))
                        .concat(_parseContants(DATA_TYPE.LARGE_OBJECT));
                }
                return this._aDataTypes;
            },

            getSchemaPrivileges: function() {
                if (!this._aSchemaPrivileges || this._aSchemaPrivileges.length === 0) {
                    this._aSchemaPrivileges = _parseContants(SCHEMA_PRIVILEGE);
                }
                return this._aSchemaPrivileges;
            }
        };
    });