/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

define(["sap/hana/cst/common/remote/Request"],

    function(request) {

        "use strict";

        /*
         * Search service provider
         */
        var searchService = {
            searchNew: function(searchStr, searchMode, maxResult, isFullNameSearch, isSynonymSearch, isCaseInsensitiveSearch, onComplete, onError, context) {
                var runtimeContext = {
                    "mode": [{
                        "main": "RT"
                    }],
                    "type": [{
                        "main": "TABLE"
                    }, {
                        "main": "VIEW"
                    }, {
                        "main": "FUNCTION"
                    }, {
                        "main": "PROCEDURE"
                    }]
                };
                var designtimeContext = {
                    "mode": [{
                        "main": "DT"
                    }],
                    "type": [{
                        "main": "VIEW",
                        "sub": "ATTRIBUTEVIEW"
                    }, {
                        "main": "VIEW",
                        "sub": "ANALYTICVIEW"
                    }, {
                        "main": "VIEW",
                        "sub": "CALCULATIONVIEW"
                    }, {
                        "main": "FUNCTION",
                        "sub": "HDBSCALARFUNCTION"
                    }, {
                        "main": "FUNCTION",
                        "sub": "HDBTABLEFUNCTION"
                    }, {
                        "main": "PROCEDURE",
                        "sub": "PROCEDURE"
                    }, {
                        "main": "PROCEDURE",
                        "sub": "HDBPROCEDURE"
                    }]
                };
                var defaultMetadataContext = new Array(designtimeContext, runtimeContext);

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
                request.send("/sap/hana/xs/dt/base/metadata/search_result", "GET", {
                    headers: {
                        "SapBackPack": strSapBackPack,
                        "Content-Type": strheaderContenttType
                    }
                }).then(onComplete, onError).done();
            }
        };

        var MetadataDetails = {

                getDetailsNew : function (name, hdiService, onComplete, onError){

                    var BASE_REST_URL = "/metadataapi/";
                    hdiService = hdiService.replace("/","%2F");
                    var restURL = BASE_REST_URL+"hdiservices/" + hdiService + "/dbobjects/"+name;

                     request.send(restURL, "GET", {
                        headers: {
                            "Content-Type": "application/json"
                        }
                    }).then(onComplete, onError).done();

                }

        };

        return {
            searchService: searchService,
            MetadataDetails: MetadataDetails
        };
    });