/*eslint-disable no-eq-null,eqeqeq,max-params*/
define(function() {

    "use strict";
    var securityToken;
    /*
     * Generate security Token
     */
    var getSecurityToken = function() {
        $.ajax({
            url: "/sap/hana/xs/dt/base/server/csrf.xsjs",
            timeout: 60000,
            type: "HEAD",
            headers: {
                "X-CSRF-Token": "Fetch"
            },
            success: function(data, textStatus, jqXHR) {
                if (jqXHR.getResponseHeader("x-sap-login-page")) {
                    return;
                }
                securityToken = jqXHR.getResponseHeader("X-CSRF-Token"); // save securityToken globally
            },
            error: function(jqXHR) {
                return jqXHR.statusText;
            }
        });
    };

    var searchService = {
        search: function(searchStr, searchMode, maxResult, isFullNameSearch, isSynonymSearch, isCaseInsensitiveSearch, onComplete, onError, context, schemaName, runtimeContextParam) {
            var runtimeContext = {"mode":[{"main":"RT"}],"type":[{"main":"TABLE"},{"main":"VIEW"},{"main":"SYNONYM"},{"main":"CDS_ENTITY"}]};
            if (runtimeContextParam != null) {
                runtimeContext = runtimeContextParam;
            }
            if (schemaName != null) {
                runtimeContext.schema = schemaName;
            }
            //var designtimeContext = {"mode":[{"main":"DT"}],"type":[{"main":"VIEW","sub":"ATTRIBUTEVIEW"},{"main":"VIEW","sub":"ANALYTICVIEW"},{"main":"VIEW","sub":"CALCULATIONVIEW"}]};
            var defaultMetadataContext = new Array(/*designtimeContext, */runtimeContext);

            if (context) {
                defaultMetadataContext = context;
            }
            var oSapBackPack = {
                "metadataNamePart": searchStr,
                "metadataStringSearchMode": searchMode,
                "maxResultsNumber": maxResult,
                "isFullNameSearch": isFullNameSearch,
                "isSynonymSearch": isSynonymSearch,
                "isCaseInsensitiveSearch": isCaseInsensitiveSearch,
                "metadataSort": ["ALPHABET_OBJECT_NAME", "ALPHABET_SCHEMA_NAMESPACE"],
                "metadataContext": defaultMetadataContext
            };
            var strSapBackPack = JSON.stringify(oSapBackPack);
            var strheaderContenttType = "application/json";
            try {
                getSecurityToken(); // generate token
                $.ajax({
                    url: "/sap/hana/xs/dt/base/metadata/search_result",
                    timeout: 60000,
                    type: "GET",
                    headers: {
                        "SapBackPack": strSapBackPack,
                        "Content-Type": strheaderContenttType,
                        "X-CSRF-Token": securityToken
                    },
                    success: onComplete,
                    error: onError
                });
            }catch (e) {
                if (onError !== undefined) {
                    onError();
                }
            }
        }
    };

    var metadataDetails = {

        // info from wolfgang pfeiffer - this url can be used to retrieve the cds data:
        // /sap/hana/xs/dt/base/metadataexpand=DATA&namespace=playground.wpdat.SQLTest.CDSTest&objectName=playground.wpdat.
        // SQLTest.CDSTest::CDSTest.CDS_TEST1&mainMode=DT&subMode=ACTIVE&mainType=CDS_ENTITY

        getDetails: function(namespace, name, mainMode, subMode, mainType, subType, onComplete, onError) {
            var ampersand = "&";
            var serviceURI = "/sap/hana/xs/dt/base/metadata";
            var details = "expand=DATA";
            var restURL = serviceURI + "?" + details;
            if (mainMode === "RT") {
                restURL = restURL + ampersand + "schema=" + namespace;
            } else if (mainMode === "DT") {
                restURL = restURL + ampersand + "namespace=" + namespace;
            }
            restURL = restURL + ampersand + "objectName=" + name; //append object name to URI
            restURL = restURL + ampersand + "mainMode=" + mainMode; //append object type to URI
            restURL = restURL + ampersand + "mainType=" + mainType; //append main type to URI

            //append sub mode and sub type for DT objects
            if (mainMode === "DT") {
                restURL = restURL + ampersand + "subMode=" + subMode + ampersand + "subType=" + subType;
            }
            try {
                getSecurityToken(); // generate token
                $.ajax({
                    url: restURL,
                    timeout: 60000,
                    type: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-Token": securityToken
                    },
                    success: onComplete,
                    error: onError
                });
            }catch(e) {
                if (onError !== undefined) {
                    onError();
                }
            }
        }
    };

    return {
        searchService: searchService,
        metadataDetails: metadataDetails
    };

});