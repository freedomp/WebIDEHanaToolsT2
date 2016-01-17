/*eslint-disable no-eq-null,eqeqeq,camelcase,max-params,quotes,complexity,max-statements,curly,max-len,
 no-empty,no-proto,no-redeclare,radix,no-undef,no-console,valid-jsdoc,no-constant-condition,no-wrap-func*/
define(
    ["hanaddl/CdsDdlPadFileResolver","hanaddl/BaseCdsDdlParser","hanaddl/DdlErrorRecoveryHook", "require"
    ], //dependencies
    function (CdsDdlPadFileResolver,BaseCdsDdlParser,DdlErrorRecoveryHook, require) {
        "use strict";

        var CdsDdlParserResolver, CdsDdlParserResolver2, CdsDdlParserResolver3, CdsDdlParserResolver4, CdsDdlParserResolver5;

        function VersionsFactory() {
        }
        VersionsFactory.version1 = "1";
        VersionsFactory.version2 = "2";
        VersionsFactory.version3 = "3";
        VersionsFactory.version4 = "4";
        VersionsFactory.version5 = "5";
        VersionsFactory.versionLast = VersionsFactory.version5;
        VersionsFactory.prototype.createPadFileResolver = function(version, padFilePath) {
            if (VersionsFactory.version1 === version || VersionsFactory.version2 === version
            		|| VersionsFactory.version3 === version || VersionsFactory.version4 === version
                    || VersionsFactory.version5 === version) {
                return new CdsDdlPadFileResolver(version, padFilePath);
            }
            throw new Error("Version '" + version + "' of DDL Parser not supported by client. Please update your IDE.");
        };
        VersionsFactory.prototype.createParser = function(version,byteCode,scanner,access) {
            var ddlParser = null;
            try {
                if (VersionsFactory.version1 === version) {
                    if (!CdsDdlParserResolver) {
                        CdsDdlParserResolver = require("hanaddl/hanav1/CdsDdlParserResolver");
                    }
                    ddlParser = new CdsDdlParserResolver(byteCode,scanner);
                    ddlParser.setSemanticCodeCompletionRepositoryAccess(access);
                    return ddlParser;
                }else if (VersionsFactory.version2 === version) {
                    if (!CdsDdlParserResolver2) {
                        CdsDdlParserResolver2 = require("hanaddl/hanav2/CdsDdlParserResolver");
                    }
                    ddlParser = new CdsDdlParserResolver2(byteCode,scanner);
                    ddlParser.setSemanticCodeCompletionRepositoryAccess(access);
                    return ddlParser;
                }else if (VersionsFactory.version3 === version) {
                    if (!CdsDdlParserResolver3) {
                        CdsDdlParserResolver3 = require("hanaddl/hanav3/CdsDdlParserResolver");
                    }
                    ddlParser = new CdsDdlParserResolver3(byteCode,scanner);
                    ddlParser.setSemanticCodeCompletionRepositoryAccess(access);
                    return ddlParser;
                }else if (VersionsFactory.version4 === version) {
                    if (!CdsDdlParserResolver4) {
                        CdsDdlParserResolver4 = require("hanaddl/hanav4/CdsDdlParserResolver");
                    }
                    ddlParser = new CdsDdlParserResolver4(byteCode,scanner);
                    ddlParser.setSemanticCodeCompletionRepositoryAccess(access);
                    return ddlParser;
                }else if (VersionsFactory.version5 === version) {
                    if (!CdsDdlParserResolver5) {
                        CdsDdlParserResolver5 = require("hanaddl/hanav5/CdsDdlParserResolver");
                    }
                    ddlParser = new CdsDdlParserResolver5(byteCode,scanner);
                    ddlParser.setSemanticCodeCompletionRepositoryAccess(access);
                    return ddlParser;
                }
                throw new Error();
            }
            finally{
                this.setErrorRecoveryHook(ddlParser);
            }
        };
        VersionsFactory.prototype.setErrorRecoveryHook = function(ddlParser) {
            if (ddlParser == null) {
                return;
            }
            ddlParser.setErrorRecoveryHook(new DdlErrorRecoveryHook(ddlParser));
        };
        return VersionsFactory;
    }
);