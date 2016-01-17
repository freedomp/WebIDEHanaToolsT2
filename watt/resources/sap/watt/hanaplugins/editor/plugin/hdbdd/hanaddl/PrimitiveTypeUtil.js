/*eslint-disable no-eq-null,eqeqeq,camelcase,max-params,quotes,complexity,max-statements,curly,max-len,no-empty,no-proto,no-redeclare,radix,no-undef,no-console,valid-jsdoc,no-constant-condition*/
define(["require"], // dependencies
    function (require) {
        /*global console*/
        var Console = null;
        if (typeof console !== "undefined") {
            Console = console;
        } else {
            Console = {
                log: function () {
                }
            };
        }
        function PrimitiveTypeUtil() {
        }

        PrimitiveTypeUtil.BOOLEAN = "Boolean";
        PrimitiveTypeUtil.getPrimitiveTypeNames = function (withParameters) {
            try {
                var versionsFactory = require("hanaddl/VersionsFactory");
                var version = parseInt(versionsFactory.versionLast);
                return PrimitiveTypeUtil.getPrimitiveTypeNamesForVersion(version, withParameters);
            } catch (e) {
                Console.log(e.stack);
                return [];
            }
        };
        PrimitiveTypeUtil.getPrimitiveTypeNamesForVersion = function (version, withParameters) {
            var result = [];
            if (version >= 1) {
                if (withParameters) {
                    result.push("String(len)");
                } else {
                    result.push("String");
                }
                result.push("LargeString");
                if (withParameters) {
                    result.push("Binary(len)");
                } else {
                    result.push("Binary");
                }
                result.push("LargeBinary");
                result.push("Integer");
                result.push("Integer64");
                if (withParameters) {
                    result.push("Decimal(precision, scale)");
                } else {
                    result.push("Decimal");
                }
                result.push("DecimalFloat");
                result.push("BinaryFloat");
                result.push("LocalDate");
                result.push("LocalTime");
                result.push("UTCDateTime");
                result.push("UTCTimestamp");
            }
            if (version >= 2) {
                result.push(PrimitiveTypeUtil.BOOLEAN);
            }
            if (version >= 3) {
                if (withParameters) {
                    result.push("hana.ALPHANUM(len)");
                } else {
                    result.push("hana.ALPHANUM");
                }
                result.push("hana.SMALLINT");
                result.push("hana.TINYINT");
                result.push("hana.SMALLDECIMAL");
                result.push("hana.REAL");
                if (withParameters) {
                    result.push("hana.CHAR(len)");
                } else {
                    result.push("hana.CHAR");
                }
                if (withParameters) {
                    result.push("hana.NCHAR(len)");
                } else {
                    result.push("hana.NCHAR");
                }
                if (withParameters) {
                    result.push("hana.VARCHAR(len)");
                } else {
                    result.push("hana.VARCHAR");
                }
                result.push("hana.CLOB");
                if (withParameters) {
                    result.push("hana.BINARY(len)");
                } else {
                    result.push("hana.BINARY");
                }
                result.push("hana.ST_POINT");
                result.push("hana.ST_GEOMETRY");
            }
            return result;
        };
        return PrimitiveTypeUtil;
    });