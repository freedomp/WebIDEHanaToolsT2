jQuery.sap.declare("sap.ushell.components.tiles.indicatorTileUtils.smartBusinessUtil");


/* this is poor coding according to eslint and other general programming rules, (ever heard of use strict?)*/
/*eslint-disable no-cond-assign*/
/*eslint-disable no-nested-ternary*/
/*eslint-disable no-unused-vars*/
/*eslint-disable no-undef*/  /* likely indicates error */
/*eslint-disable no-inner-declarations*/

sap = sap || {};
sap.ushell = sap.ushell || {};
sap.ushell.components = sap.ushell.components || {};
sap.ushell.components.tiles.indicatorTileUtils = sap.ushell.components.tiles.indicatorTileUtils || {};
sap.ushell.components.tiles.indicatorTileUtils.util = sap.ushell.components.tiles.indicatorTileUtils.util || {};

sap.ushell.components.tiles.indicatorTileUtils.util = (function(global, $) {
    var fetchAuthToken = function() {
        var obj = {};
        $.ajax({
            type: "GET",
            async : false,
            dataType : "json",
            url: "/sap/hba/apps/kpi/s/logic/__token.xsjs",
            headers: {
                "X-CSRF-Token": "Fetch"
            },
            success: function( data, status, xhr ) {
                obj.userName = data.userName;
                obj.token = xhr.getResponseHeader("X-CSRF-Token");
            },
            error: function() {
                $.sap.log.error("Error Fetching AUTH TOKEN");
            }
        });
        return obj;
    };

    var getArray = function(stringArray) {
        var retArray = [];
        for (var itr = 0; itr < stringArray.length; itr++) {
            retArray.push(JSON.parse(stringArray[itr]));
        }
        return retArray;
    };

    "use strict";
    var cache = {};
    return {
        getAuthToken : function() {
            return fetchAuthToken().token;
        },
        getHanaUser : function() {
            return authObject.userName;
        },
        getEdmType : function(sUri, propertyName) {
            var oDataModel = null;
            if (sUri instanceof sap.ui.model.odata.ODataModel) {
                oDataModel = sUri;
            } else  {
                oDataModel = this.getODataModelByServiceUri(sUri);
            }
            if (oDataModel && oDataModel.getServiceMetadata()) {
                var serviceMetaData = oDataModel.getServiceMetadata();
                var entitySets = serviceMetaData.dataServices.schema[0].entityType;
                if (entitySets) {
                    for (var i = 0; i < entitySets.length; i++) {
                        var entity = entitySets[i];
                        var properties = entity.property;
                        for (var j = 0; j < properties.length; j++) {
                            var property = properties[j];
                            if (property.name == propertyName) {
                                return property.type;
                            }
                        }
                    }
                }
            }
            return null;
        },

        getODataModelByServiceUri : function(sServiceUri) {
            sServiceUri = this.addSystemToServiceUrl(sServiceUri);
            if (!cache[sServiceUri]) {
                var oModel = new sap.ui.model.odata.ODataModel(sServiceUri,true);
                cache[sServiceUri] = oModel;
            }
            return cache[sServiceUri];
        },

        addSystemToServiceUrl : function(url, system) {
            jQuery.sap.log.info("Hana Adapter --> Add System to Service Url");
            if (sap.ushell && sap.ushell.Container) {
                if (system) {
                    url = sap.ushell.Container.getService("URLParsing").addSystemToServiceUrl(url, system);
                } else {
                    url = sap.ushell.Container.getService("URLParsing").addSystemToServiceUrl(url);
                }
            }
            return url;
        },

        getMantissaLength : function(num){
            var sNum = num.toString();
            var initPos = 0;
            if (num < 0){
                initPos = 1;
            }
            return (sNum.indexOf('.') === -1 ) ? (num < 0 ? sNum.length - 1 : sNum.length) :
                sNum.substring(initPos, sNum.indexOf('.')).length;
        },

        getLocaleFormattedValue : function(num, oScale, oDecimal, isACurrencyMeasure, currencyCode){
            jQuery.sap.require("sap.ui.core.format.NumberFormat");
            isACurrencyMeasure = isACurrencyMeasure || false;
            currencyCode = currencyCode || null;
            if (isACurrencyMeasure) {
                return sap.ui.core.format.NumberFormat.getCurrencyInstance({style:"short", showMeasure: false}).format(num, currencyCode);
            }
            //var locale = new sap.ui.core.Locale(sap.ui.getCore().getConfiguration().getLanguage());
            var sD = 2;
            var oFormatOptions = {
                    style : "short"
            };
            var fNum;
            if (!(oDecimal == -1 || oDecimal == null)){
                oFormatOptions.shortDecimals = Number(oDecimal);
                oFormatOptions.minFractionDigits = Number(oDecimal);
                oFormatOptions.maxFractionDigits = Number(oDecimal);
            }
            var valFormatter = sap.ui.core.format.NumberFormat.getInstance(oFormatOptions);
            if (oScale == -2) {
                if (num > 9999) {
                    fNum = "????";
                } else if (num < 0.001) {
                    fNum = "0";
                } else {
                    if (num.toString().indexOf('.') != -1) {
                        fNum = Number(num).toFixed(4 - num.toString().indexOf('.'));
                    } else {
                        fNum = Number(num);
                    }
                    fNum = valFormatter.format(fNum);
                }
            } else if (oDecimal == -1 || oDecimal == null) {
                var mantissaLength  = this.getMantissaLength(num);
                if (!(mantissaLength % 3)) {
                    sD = 1;
                }
                if (mantissaLength % 3 === 1){
                    sD = 3;
                }
                if (mantissaLength % 3 === 2){
                    sD = 2;
                }
                if (Math.abs(num) % Math.pow(10, mantissaLength - 1) == 0) {
                    sD = 0;
                } else if ((Math.abs(num) % Math.pow(10, mantissaLength - 1)) < 6 * Math.pow(10, mantissaLength - 4)) {
                    sD = 0;
                }
                valFormatter = sap.ui.core.format.NumberFormat.getInstance({ style: "short" , shortDecimals:sD});
                fNum = valFormatter.format(num);
            } else {
                fNum = valFormatter.format(num);
            }
            return fNum;
        },

        getPlatform : function(sPlatform){
            return (jQuery.sap.getUriParameters().get("sb_metadata") || sPlatform || "HANA").toUpperCase();
        },

        getRunTimeUri : function(sPlatform){
            //if (this.getPlatform(sPlatform) == "HANA")
            if (sPlatform.toUpperCase() == "HANA") {
                return "/sap/hba/r/sb/core/odata/runtime/SMART_BUSINESS.xsodata";
            }
            return "/sap/opu/odata/SSB/SMART_BUSINESS_RUNTIME_SRV";
        },

        getTileTitleSubtitle: function(oChipApi){
            var titleObj = {};
            if (oChipApi.bag && oChipApi.bag.getBagIds() && oChipApi.bag.getBagIds().length){
                titleObj.title = oChipApi.bag.getBag("sb_tileProperties").getText("title") ||
                oChipApi.bag.getBag("sb_tileProperties").getProperty("title") ||
                oChipApi.preview.getTitle();
                titleObj.subTitle = oChipApi.bag.getBag("sb_tileProperties").getText("description") ||
                oChipApi.bag.getBag("sb_tileProperties").getProperty("description") ||
                oChipApi.preview.getDescription();
            } else {
                titleObj.title = oChipApi.preview.getTitle();
                titleObj.subTitle = oChipApi.preview.getDescription();
            }
            return titleObj;
        },

        getModelerRuntimeServiceModel : function() {
            return this.getODataModelByServiceUri("/sap/hba/apps/kpi/s/odata/smart_business_runtime_services.xsodata");
        },
        getSapFontErrorCode : function() {
            return String.fromCharCode(0xe0b1);
        },
        getSapFontBusyCode : function() {
            return String.fromCharCode(0xe1f2);
        },
        prepareFilterStructure : function(filter,addFilters){
            var variantData = [];
            if (addFilters){
                filter = filter.concat(addFilters);

            }

            for (var itr = 0; itr < filter.length; itr++){
                var pushObj = {};
                pushObj.comparator = filter[itr].OPERATOR;
                pushObj.filterPropertyName = filter[itr].NAME;

                if (filter[itr].ID) {
                    pushObj.id = filter[itr].ID;
                }

                pushObj.type = filter[itr].TYPE;
                pushObj.value = filter[itr].VALUE_1;
                pushObj.valueTo = filter[itr].VALUE_2;
                variantData.push(pushObj);
            }

            return variantData;
        },


        getODataModelByServiceUriFromChipAPI : function(sServiceUri,oTileApi) {
            sServiceUri = oTileApi.url.addSystemToServiceUrl(sServiceUri); 
            if (!cache[sServiceUri]) {
                var oModel = new sap.ui.model.odata.ODataModel(sServiceUri,true);
                cache[sServiceUri] = oModel;
            }
            return cache[sServiceUri];
        },

        getFilterFromRunTimeService: function(oConfig,oTileApi,fnS,fnE){
            var sPlatform = oConfig.TILE_PROPERTIES.sb_metadata;
            var KPI_RUNTIME_ODATA_MODEL =  this.getODataModelByServiceUriFromChipAPI(this.getRunTimeUri(sPlatform),oTileApi);
            var filterValue = "ID eq '#EVALUATIONID'".replace("#EVALUATIONID",oConfig.EVALUATION.ID);
            var kpiEvaluationFilterODataReadRef = KPI_RUNTIME_ODATA_MODEL.read("/EVALUATION_FILTERS", null, {"$filter" : filterValue}, true, function(data) {
                var filters = [];
                if (data.results.length){
                    filters = data.results;
                }
                fnS.call(this,filters);
            },fnE);
            return kpiEvaluationFilterODataReadRef;
        },

        findTextPropertyForDimension : function(sUri, entitySet, dimension) {
            try {
                var o4a = this._getOData4AnalyticsObject(sUri);
                var queryResult = o4a.findQueryResultByName(entitySet);
                var oDimension = queryResult.findDimensionByName(dimension);
                if (oDimension.getTextProperty()){
                    return oDimension.getTextProperty().name;
                } else {
                    return dimension;
                }
            } catch(e) {
                $.sap.log.error("Error Fetching Text Property for " + dimension + " : " + e.toString());
            }
        },

        getEvalValueMeasureName : function(oConfig, type, retType){
            var evalValue = oConfig.EVALUATION_VALUES;
            for (var i = 0; i < evalValue.length; i++){
                if (evalValue[i].TYPE == type) {
                    if (retType === "FIXED") {
                        return evalValue[i].FIXED;
                    } else {
                        return evalValue[i].COLUMN_NAME;
                    }
                }
            }
        },
        /**
         * get coded colorName
         */
        getSemanticColorName : function(applyColor){
            var status = "";
            if (applyColor == "Error") {
                status = "sb.error";
            }
            if (applyColor == "Neutral") {
                status = "sb.neutral";
            }
            if (applyColor == "Critical") {
                status = "sb.critical";
            }
            if (applyColor == "Good") {
                status = "sb.good";
            }
            return status;
        },
        /**
         * sets tooltip for tile
         * @param
         */
        setTooltipInTile: function(oControl, tileType ,valueObj){
            var toolTip = "";
            var oResourceBundle = sap.ushell.components.tiles.utils.getResourceBundleModel().getResourceBundle();
            if (tileType == "NT" || tileType == "DT"){
                if (valueObj.status) {
                    toolTip += oResourceBundle.getText("sb.status") + ": " + oResourceBundle.getText(valueObj.status) + "\n";
                }
                if (valueObj.actual) {
                    toolTip += oResourceBundle.getText("sb.actual") + ": " + valueObj.actual + "\n";
                }
                if (valueObj.target) {
                    toolTip += oResourceBundle.getText("sb.target") + ": " + valueObj.target + "\n";
                }
                if (valueObj.cH) {
                    toolTip += oResourceBundle.getText("sb.ch") + ": " + valueObj.cH + "\n";
                }
                if (valueObj.wH) {
                    toolTip += oResourceBundle.getText("sb.wh") + ": " + valueObj.wH + "\n";
                }
                if (valueObj.wL) {
                    toolTip += oResourceBundle.getText("sb.wl") + ": " + valueObj.wL + "\n";
                }
                if (valueObj.cL) {
                    toolTip += oResourceBundle.getText("sb.cl") + ": " + valueObj.cL + "\n";
                }
            }
            if (tileType == "CONT" || tileType == "COMP"){
                if (valueObj.measure && tileType == "CONT") {
                    toolTip += oResourceBundle.getText("sb.topn") + ": " + valueObj.measure + "\n";
                }
                if (valueObj.m1 && ((valueObj.v1 == undefined || valueObj.v1 == null) ? false : valueObj.v1.toString()) && valueObj.c1) {
                    toolTip += valueObj.m1 + ": " + valueObj.v1 + " " + oResourceBundle.getText(valueObj.c1) + "\n";
                }
                if (valueObj.m2 && ((valueObj.v2 == undefined || valueObj.v2 == null) ? false : valueObj.v2.toString()) && valueObj.c2) {
                    toolTip += valueObj.m2 + ": " + valueObj.v2 + " " + oResourceBundle.getText(valueObj.c2) + "\n";
                }
                if (valueObj.m3 && ((valueObj.v3 == undefined || valueObj.v3 == null) ? false : valueObj.v3.toString()) && valueObj.c3) {
                    toolTip += valueObj.m3 + ": " + valueObj.v3 + " " + oResourceBundle.getText(valueObj.c3) + "\n";
                }
            }
            oControl.setTooltip(toolTip);
        },
        /**
         * Read and initialize configuration object from given JSON string. Used by all indicator tiles.
         *
         * @param {string} sConfig
         *   Configuration string in JSON format
         * @returns {object}
         *   Returns parsed configuration object
         */
        _getFormattedTileProperties:function(tileProperties){
            tileProperties = tileProperties || {};
            var properties = ["sb_metadata","sb_navigation","sb_catalog"];
            var isPlatformPresent = false;
            for (var i = 0; !isPlatformPresent && i < properties.length; i++){
                isPlatformPresent = isPlatformPresent || jQuery.sap.getUriParameters().get(properties[i]) || tileProperties[properties[i]];
            }
            tileProperties.sb_metadata = (jQuery.sap.getUriParameters().get("sb_metadata") || tileProperties.sb_metadata || "HANA").toLowerCase();
            tileProperties.sb_navigation = (jQuery.sap.getUriParameters().get("sb_navigation") || tileProperties.sb_navigation || "abap").toLowerCase();
            tileProperties.sb_catalog = (jQuery.sap.getUriParameters().get("sb_catalog") || tileProperties.sb_catalog || "HANA").toLowerCase();
            tileProperties.isPlatformInfoPresent = isPlatformPresent;
            return tileProperties;
        },
        getParsedChip : function(sConfig, callback){
            var parsedChipConfig = {};
            var chipJson = JSON.parse(sConfig);
            var evaluationId = JSON.parse(chipJson.TILE_PROPERTIES).evaluationId || "";
            var that = this;
            if (chipJson.TAGS) {
                parsedChipConfig["TAGS"] = JSON.parse(chipJson.TAGS);
            }
            if (chipJson.ADDITIONAL_FILTERS) {
                parsedChipConfig["ADDITIONAL_FILTERS"] = JSON.parse(chipJson.ADDITIONAL_FILTERS);
            }
            if (chipJson.ADDITIONAL_APP_PARAMETERS) {
                parsedChipConfig["ADDITIONAL_APP_PARAMETERS"] = JSON.parse(chipJson.ADDITIONAL_APP_PARAMETERS);
            }

            parsedChipConfig.TILE_PROPERTIES = this._getFormattedTileProperties(JSON.parse(chipJson.TILE_PROPERTIES));

            var sPlatform = parsedChipConfig.TILE_PROPERTIES.sb_metadata;

            if (chipJson.EVALUATION_FILTERS) {
                parsedChipConfig["EVALUATION_FILTERS"] = JSON.parse(chipJson.EVALUATION_FILTERS);
                if (chipJson.EVALUATION_VALUES){
                    parsedChipConfig["EVALUATION_VALUES"] = JSON.parse(chipJson.EVALUATION_VALUES);
                    if (chipJson.EVALUATION){
                        parsedChipConfig.EVALUATION = JSON.parse(chipJson.EVALUATION);
                        callback(parsedChipConfig);
                    } else  {
                        that.getEvaluationDetailsFromRunTimeService("/EVALUATIONS",sPlatform, evaluationId, function(filters){
                            parsedChipConfig.EVALUATION = filters;
                            callback(parsedChipConfig);
                        });
                    }
                } else {
                    that.getEvaluationDetailsFromRunTimeService("/EVALUATION_VALUES", sPlatform,evaluationId, function(filters){
                        parsedChipConfig["EVALUATION_VALUES"] = filters;
                        if (chipJson.EVALUATION){
                            parsedChipConfig.EVALUATION = JSON.parse(chipJson.EVALUATION);
                            callback(parsedChipConfig);
                        } else {
                            that.getEvaluationDetailsFromRunTimeService("/EVALUATIONS", sPlatform,evaluationId, function(filters){
                                parsedChipConfig.EVALUATION = filters;
                                callback(parsedChipConfig);
                            });
                        }
                    });
                }
            } else {
                that.getEvaluationDetailsFromRunTimeService("/EVALUATION_FILTERS",sPlatform, evaluationId, function(filters){
                    parsedChipConfig["EVALUATION_FILTERS"] = filters;
                    if (chipJson.EVALUATION_VALUES){
                        parsedChipConfig["EVALUATION_VALUES"] = JSON.parse(chipJson.EVALUATION_VALUES);
                        if (chipJson.EVALUATION){
                            parsedChipConfig.EVALUATION = JSON.parse(chipJson.EVALUATION);
                            callback(parsedChipConfig);
                        } else {
                            that.getEvaluationDetailsFromRunTimeService("/EVALUATIONS", sPlatform,evaluationId, function(filters){
                                parsedChipConfig.EVALUATION = filters;
                                callback(parsedChipConfig);
                            });
                        }
                    } else {
                        that.getEvaluationDetailsFromRunTimeService("/EVALUATION_VALUES",sPlatform, evaluationId, function(filters){
                            parsedChipConfig["EVALUATION_VALUES"] = filters;
                            if (chipJson.EVALUATION){
                                parsedChipConfig.EVALUATION = JSON.parse(chipJson.EVALUATION);
                                callback(parsedChipConfig);
                            } else {
                                that.getEvaluationDetailsFromRunTimeService("/EVALUATIONS", sPlatform,evaluationId, function(filters){
                                    parsedChipConfig.EVALUATION = filters;
                                    callback(parsedChipConfig);
                                });
                            }
                        });
                    }
                });
            }

        },

        /**
         * Read entity set name and evaluation id and return the appropriate call results.
         *
         * @param {string} oEntitySet
         *   Entity set name
         * @param {string} oId
         *   Evaluation Id
         * @returns {object}
         *   Returns call results
         */

        getEvaluationDetailsFromRunTimeService: function(oEntitySet,sPlatform, oId, callback){
            var KPI_RUNTIME_ODATA_MODEL =  this.getODataModelByServiceUri(this.getRunTimeUri(sPlatform));
            var filterValue = "ID eq '#EVALUATIONID'".replace("#EVALUATIONID",oId);
            var kpiEvaluationFilterODataReadRef = KPI_RUNTIME_ODATA_MODEL.read(oEntitySet, null, {"$filter" : filterValue}, true, function(data) {
                var filters = [];
                if (data.results.length){
                    filters = data.results;
                }
                callback.call(this,filters);
            });
        },

        /**
         * Read and create external target Nav Hash
         *
         * @param {JSON} jConfig
         *  configuration object for CHIP
         * @return {string}
         *  Returns navigation hash
         */

        getNavigationTarget: function(jConfig,system){
            var fgetService = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService;
            var oCrossAppNavigator = fgetService && fgetService("CrossApplicationNavigation");
            var each;
            var param = {};
            param["evaluationId"] = jConfig.EVALUATION.ID;
            param["chipId"] = jConfig.TILE_PROPERTIES.id;
            if (system) {
                param["sap-system"] = system;
            }

            param["tileType"] = jConfig.TILE_PROPERTIES.tileType;

            if (jConfig.TILE_PROPERTIES.dimension) {
                param["dimension"] = jConfig.TILE_PROPERTIES.dimension;
            }
            if (jConfig.TILE_PROPERTIES.storyId) {
                param["storyId"] = jConfig.TILE_PROPERTIES.storyId;
            }
            if (jConfig.TILE_PROPERTIES.apfConfId) {
                param["sap-apf-configuration-id"] = jConfig.TILE_PROPERTIES.apfConfId;
            }
            if (jConfig.TILE_PROPERTIES.isPlatformInfoPresent){
                param["sb_metadata"] = jConfig.TILE_PROPERTIES.sb_metadata;
                param["sb_navigation"] = jConfig.TILE_PROPERTIES.sb_navigation;
                param["sb_catalog"] = jConfig.TILE_PROPERTIES.sb_catalog;
            }
            if (jConfig.ADDITIONAL_APP_PARAMETERS){
                for (each in jConfig.ADDITIONAL_APP_PARAMETERS){
                    if (jConfig.ADDITIONAL_APP_PARAMETERS.hasOwnProperty(each)){
                        if (jConfig.ADDITIONAL_APP_PARAMETERS[each].constructor == Array){
                            var addApp = jConfig.ADDITIONAL_APP_PARAMETERS[each];
                            for (var i = 0; i < addApp.length; i++) {
                                param[each] = addApp[i];
                            }
                        } else {
                            param[each] = jConfig.ADDITIONAL_APP_PARAMETERS[each];
                        }
                    }
                }
            }
            var toOurApp = oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
                target: {
                    semanticObject: jConfig.TILE_PROPERTIES.semanticObject,
                    action: jConfig.TILE_PROPERTIES.semanticAction
                },
                params: param
            }) || "";
            if (jConfig.ADDITIONAL_FILTERS){
                var addFilter = jConfig.ADDITIONAL_FILTERS;
                var addFilterString = "&";
                for (var j = 0; j < addFilter.length; j++){
                    if (addFilter[j].OPERATOR === "EQ") {
                        addFilterString = addFilterString + "/" + addFilter[j].NAME + "=" + addFilter[j].VALUE_1;
                    }
                }
                toOurApp += addFilterString;
            }
            return toOurApp;
        },

        /**
         * Read chipConfig object and return appropriate title
         *
         * @param {JSON} CHIP config
         *  configuration object for CHIP
         * @return {string}
         *  returns title for tile
         */
        getChipTitle: function(jConfig){
            var title = "";
            if (jConfig){
                var chipIndicator = jConfig.EVALUATION || {};
                title = chipIndicator.INDICATOR_TITLE || "";
            }
            return title;
        },

        getstringifyTileConfig: function(jConfig){
            var sConfig = {};
            sConfig.EVALUATION = JSON.stringify(jConfig.EVALUATION);
            sConfig.EVALUATION_FILTERS = JSON.stringify(jConfig.EVALUATION_FILTERS);
            sConfig.EVALUATION_VALUES = JSON.stringify(jConfig.EVALUATION_VALUES);
            sConfig.TILE_PROPERTIES = JSON.stringify(jConfig.TILE_PROPERTIES);
            return JSON.stringify(sConfig);
        },
        /**
         * Read chipConfig object and return appropriate subTitle
         *
         * @param {JSON} CHIP config
         *  configuration object for CHIP
         * @return {string}
         *  returns subtitle for tile
         */

        getChipSubTitle: function(jConfig){
            var sTitle = "";
            if (jConfig){
                var chipEvaluation = jConfig.EVALUATION || {};
                sTitle = chipEvaluation.TITLE || "";
            }
            return sTitle;
        },
        getFormattingMetadata: function(sUri, entitySet, propertyName) {
            var formattingMetadata = {};
            formattingMetadata._hasCurrency = false;
            formattingMetadata._hasSapText = false;

            var modelReferenceBy = null;
            if (sUri instanceof sap.ui.model.odata.ODataModel) {
                modelReferenceBy = sap.ui.model.analytics.odata4analytics.Model.ReferenceByModel(sUri);
            } else {
                var tempModel = this.getODataModelByServiceUri(sUri);
                modelReferenceBy = sap.ui.model.analytics.odata4analytics.Model.ReferenceByModel(tempModel);
            }
            var O4A = new sap.ui.model.analytics.odata4analytics.Model(modelReferenceBy);
            var queryResult = O4A.findQueryResultByName(entitySet);

            var measures = queryResult.getAllMeasures();

            if (measures[propertyName] ) {

                var sapTextPropertyName = (measures[propertyName]._oTextProperty && measures[propertyName]._oTextProperty.name) ?
                        measures[propertyName]._oTextProperty.name : "";

                        if (sapTextPropertyName != "") {
                            formattingMetadata._hasSapText = true;
                            formattingMetadata._sapTextColumn = sapTextPropertyName;
                        } else if (measures[propertyName].hasOwnProperty("_oUnitProperty")){
                            var extensions = measures[propertyName]._oUnitProperty.extensions;
                            for (var i = 0; i < measures[propertyName]._oUnitProperty.extensions.length; i++) {
                                if (extensions[i].name === "semantics" && extensions[i].value === "currency-code") {
                                    formattingMetadata._hasCurrency = true;
                                    formattingMetadata._currencyColumn =  measures[propertyName]._oUnitProperty.name;
                                }
                            }
                        }
            }

            return formattingMetadata;
        },
        /**
         * Returns fully formed oData Query URI using oData4Analytics Library
         *
         * @param {string} sUri
         *   oData entry URI
         * @param {string} entitySet
         *   entitySet in oDataURI for query
         * @param {string} measure
         *   aggregation of value on column name measure
         * @param {string} dimension
         *   aggregation of value on column name group by dimension
         * @param {JSON} variants
         *   $filter parameter in oData URI
         * @param {string} orderByElements
         *   orderBy either asc or desc
         * @param {string} top
         *   how many top values to select
         * @returns {string}
         *   Returns fully formed oData URI
         */

        prepareQueryServiceUri : function(sUri, entitySet, measure, dimension, variants, orderByElements, top) {
            function _replaceSingleQuoteWithDoubleSingleQuote(str) {
                return str.replace(/'/g,"''");
            }
            var tmpDimension = null;
            try {
                var modelReferenceBy = null;
                if (sUri instanceof sap.ui.model.odata.ODataModel) {
                    modelReferenceBy = sap.ui.model.analytics.odata4analytics.Model.ReferenceByModel(sUri);
                } else {
                    var tempModel = this.getODataModelByServiceUri(sUri);
                    modelReferenceBy = sap.ui.model.analytics.odata4analytics.Model.ReferenceByModel(tempModel);
                }
                var O4A = new sap.ui.model.analytics.odata4analytics.Model(modelReferenceBy);
                var oQueryResult = O4A.findQueryResultByName(entitySet);
                var oQueryResultRequest = new sap.ui.model.analytics.odata4analytics.QueryResultRequest(oQueryResult);
                if (measure) {
                    oQueryResultRequest.setMeasures(measure.split(","));
                    oQueryResultRequest.includeMeasureRawFormattedValueUnit(null, true, true, true);
                }
                if (dimension) {
                    if (typeof dimension == "string") {
                        tmpDimension = dimension;
                        tmpDimension = tmpDimension.split(",");
                    }

                    for (var i = 0; i < tmpDimension.length; i++) {
                        oQueryResultRequest.addToAggregationLevel([tmpDimension[i]]);
                        var tmp = oQueryResult.getAllDimensions();
                        if (tmp[tmpDimension[i]].getTextProperty() != null) {
                            oQueryResultRequest.includeDimensionKeyTextAttributes([tmpDimension[i]], true, true, null);
                        }
                    }
//                  oQueryResultRequest.setAggregationLevel(dimension.split(","));
//                  oQueryResultRequest.includeDimensionKeyTextAttributes(null, true, false, null);
                }

                if (variants && variants.length) {
                    var filterVariants = [];
                    var inputParamsVariants = [];
                    for (var i = 0, l = variants.length; i < l; i++) {
                        var each = variants[i];
                        if (each.type === "PA") {
                            inputParamsVariants.push(each);
                        } else if (each.type === "FI") {
                            filterVariants.push(each);
                        }
                    }
                    function changeToYYYYMMDDHHMMSS(odate){
                        var dateStr = odate.toJSON();
                        var lastChar = dateStr.charAt(dateStr.length - 1).toUpperCase();
                        if (lastChar.charCodeAt(0) >= 65 && lastChar.charCodeAt(0) <= 90) {
                            dateStr = dateStr.slice(0, -1);
                        }
                        return dateStr;
                    }
                    function _processODataDateTime(junkValue) {
                        if (junkValue) {
                            try {
                                if (junkValue == +junkValue) {
                                    junkValue = window.parseInt(junkValue);
                                }
                                var date = new Date(junkValue);
                                var time = date.getTime();
                                if (isNaN(time)) {
                                    return junkValue;
                                } else {
                                    return changeToYYYYMMDDHHMMSS(date);
                                }
                            }catch(e) {

                            }
                        }
                        return junkValue;
                    }
                    if (filterVariants.length) {
                        var oFilterExpression = oQueryResultRequest.getFilterExpression();
                        for (var i = 0, l = filterVariants.length; i < l; i++) {
                            var each = filterVariants[i];
                            if (this.getEdmType(sUri,each.filterPropertyName) == "Edm.DateTime") {
                                each.value = _processODataDateTime(each.value);
                                each.valueTo = _processODataDateTime(each.valueTo);
                            }
                            if (each.comparator == sap.ui.model.FilterOperator.BT) {
                                oFilterExpression.addCondition(each.filterPropertyName,each.comparator,_replaceSingleQuoteWithDoubleSingleQuote(each.value),each.valueTo);
                            } else {
                                var multipleFilterValueArray = each.value.split(",");
                                for (var j = 0, k = multipleFilterValueArray.length; j < k; j++) {
                                    oFilterExpression.addCondition(each.filterPropertyName,each.comparator,_replaceSingleQuoteWithDoubleSingleQuote(multipleFilterValueArray[j].replace(/\^\|/g,",")),null);
                                }
                            }

                        }
                    }
                    if (inputParamsVariants.length) {
                        if (oQueryResult.getParameterization()) {
                            var oParamRequest = new sap.ui.model.analytics.odata4analytics.ParameterizationRequest(oQueryResult.getParameterization());
                            var paramererizationObj = oQueryResult.getParameterization();
                            var eachInputParam, findParameter, fromVal,toVal,toValParam;
                            for (var y = 0, z = inputParamsVariants.length; y < z; y++) {
                                eachInputParam = inputParamsVariants[y];
                                findParameter = paramererizationObj.findParameterByName(eachInputParam.filterPropertyName);
                                if (findParameter.isIntervalBoundary() === true && findParameter.isLowerIntervalBoundary() === true){
                                    //peerInterval = findParameter.getPeerIntervalBoundaryParameter();
                                    toValParam = findParameter.getPeerIntervalBoundaryParameter();
                                    for (var i = 0, l = inputParamsVariants.length; i < l; i++) {
                                        if (inputParamsVariants[i].filterPropertyName === toValParam.getName()) {
                                            toVal = _replaceSingleQuoteWithDoubleSingleQuote(inputParamsVariants[i].value);
                                            break;
                                        }
                                    }
                                    fromVal = _replaceSingleQuoteWithDoubleSingleQuote(eachInputParam.value);
                                    if (toVal) {
                                        oParamRequest.setParameterValue(eachInputParam.filterPropertyName,fromVal,toVal);

                                    }
                                } else if (findParameter.isIntervalBoundary() === true && findParameter.isLowerIntervalBoundary() === false) {
                                    // Do nothing for upper Boundary
                                    jQuery.sap.log.info("Future development");
                                } else {
                                    oParamRequest.setParameterValue(eachInputParam.filterPropertyName,_replaceSingleQuoteWithDoubleSingleQuote(eachInputParam.value));
                                }
                            }
                            oQueryResultRequest.setParameterizationRequest(oParamRequest);
                        }
                    }
                }
                var finalUri = oQueryResultRequest.getURIToQueryResultEntries();

                if (orderByElements && orderByElements.length) {
                    //finalUri = finalUri+"&$orderby="+orderByElements.join(",");
                    finalUri = finalUri + "&$orderby=";
                    for (var y = 0, z = orderByElements.length; y < z; y++) {
                        var order = orderByElements[y].sortOrder || "asc";
                        if (order) {
                            finalUri += orderByElements[y].element + " " + order + ",";
                        }
                    }
                    finalUri = finalUri.slice(0,finalUri.length - 1);
                }

                if (top) {
                    finalUri = finalUri + "&$top=" + top;
                }

                var oMeasureNames = oQueryResult.getAllMeasures();
                var unit = [];
                for (var i = 0; i < measure.split(",").length; i++) {
                    unit.push(oMeasureNames[measure.split(",")[i]].getUnitProperty());
                }


                return {
                    uri : finalUri,
                    model : O4A.getODataModel(),
                    unit : unit
                };
            } catch(e) {
                $.sap.log.error("Error Preparing Query Service Uri using OData4Analytics Library : " + e.toString());
                if (arguments.length) {
                    $.sap.log.error("Arguments Passed to this function");
                    $.sap.log.error(arguments[0] + "," + arguments[1] + "," + arguments[2] + "," + arguments[3]);
                } else {
                    $.sap.log.error("NO Arguments passed to this function");
                }
                return null;
            }
        },
        _getOData4AnalyticsObject  : function(sUri) {
            var oModel = null;
            if (sUri instanceof sap.ui.model.odata.ODataModel) {
                oModel = sUri;
            } else if (typeof sUri == "string") {
                oModel = this.getODataModelByServiceUri(sUri);
            } else {
                throw new Error("Invalid Input to Create ODataModel Object : " + sUri);
            }
            var O4A = new sap.ui.model.analytics.odata4analytics.Model(sap.ui.model.analytics.odata4analytics.Model.ReferenceByModel(oModel));
            return O4A;
        },
        getAllEntitySet : function(sUri) {
            var entitySets = [];
            try {
                var o4a = this._getOData4AnalyticsObject(sUri);
                entitySets = o4a.getAllQueryResultNames();
            } catch(e) {
                $.sap.log.error("Error fetching Enity Set : " + e.toString());
            }
            return entitySets;

        },
        getAllMeasures : function(sUri, entitySet) {
            var measures = [];
            try {
                var o4a = this._getOData4AnalyticsObject(sUri);
                var queryResult = o4a.findQueryResultByName(entitySet);
                measures = queryResult.getAllMeasureNames();
            } catch(e) {
                $.sap.log.error("Error Fetching All Measures : " + e.toString());
            }
            return measures;
        },
        getAllMeasuresWithLabelText : function(sUri, entitySet) {
            var measures = [];
            try {
                var o4a = this._getOData4AnalyticsObject(sUri);
                var queryResult = o4a.findQueryResultByName(entitySet);
                var measureNames = queryResult.getAllMeasureNames();
                for (var i = 0; i < measureNames.length; i++) {
                    var each = measureNames[i];
                    global.oMeasure = queryResult.findMeasureByName(each);
                    measures.push({
                        key : each,
                        value : oMeasure.getLabelText()  // omeasure? global, likely a bug?
                    });
                }
            } catch(e) {
                $.sap.log.error("Error Fetching All Measures : " + e.toString());
            }
            return measures;
        },
        getAllDimensions : function(sUri, entitySet) {
            function intersectionOfArray(array1, array2) {
                var ai = 0, bi = 0;
                var result = [];
                while ( ai < array1.length && bi < array2.length ) {
                    if      (array1[ai] < array2[bi] ){
                        ai++;
                    } else if (array1[ai] > array2[bi] ){
                        bi++;
                    } else { /* they're equal */
                        result.push(array1[ai]);
                        ai++;
                        bi++;
                    }
                }
                return result;
            }
            var dimensions = [];
            var aFilterablePropertyNames = [];
            try {
                var o4a = this._getOData4AnalyticsObject(sUri);
                var queryResult = o4a.findQueryResultByName(entitySet);
                var entityType = queryResult.getEntityType();
                aFilterablePropertyNames = entityType.getFilterablePropertyNames();
                dimensions = queryResult.getAllDimensionNames();
                if (aFilterablePropertyNames && aFilterablePropertyNames.length) {
                    dimensions = intersectionOfArray(aFilterablePropertyNames.sort(),dimensions.sort());
                }
            } catch(e) {
                $.sap.log.error("Error Fetching All Dimesions : " + e.toString());
            }
            return dimensions;
        },
        getAllDimensionsWithLabelText : function(sUri, entitySet) {
            var dimensions = [];
            try {
                var o4a = this._getOData4AnalyticsObject(sUri);
                var queryResult = o4a.findQueryResultByName(entitySet);
                var dimensionNames = queryResult.getAllDimensionNames();
                for (var i = 0; i < dimensionNames.length; i++) {
                    var each = dimensionNames[i];
                    var oDimension = queryResult.findDimensionByName(each);
                    var textProperty = null;
                    if (oDimension.getTextProperty() != null) {
                        textProperty = oDimension.getTextProperty().name;
                    }
                    dimensions.push({
                        key : each,
                        value : oDimension.getLabelText(),
                        textProperty: textProperty
                    });
                }
            } catch(e) {
                $.sap.log.error("Error Fetching All Dimesions : " + e.toString());
            }
            return dimensions;
        },
        getAllInputParams : function(sUri, entitySet) {
            var inputParams = [];
            try {
                var o4a = this._getOData4AnalyticsObject(sUri);
                var queryResult = o4a.findQueryResultByName(entitySet);
                if (queryResult.getParameterization()) {
                    var oParams = queryResult.getParameterization();
                    inputParams = oParams.getAllParameterNames();
                }
            } catch(e) {
                $.sap.log.error("Error Fetching Input Params : " + e.toString());
            }
            return inputParams;
        },
        getAllInputParamsWithFlag : function(sUri, entitySet) {
            var inputParams = [];
            try {
                var o4a = this._getOData4AnalyticsObject(sUri);
                var queryResult = o4a.findQueryResultByName(entitySet);
                if (queryResult.getParameterization()) {
                    var oParams = queryResult.getParameterization();
                    var inputParamsArray = oParams.getAllParameterNames();
                    for (var i = 0; i < inputParamsArray.length; i++) {
                        var each = inputParamsArray[i];
                        var paramObject  = oParams.findParameterByName(each);
                        inputParams.push({
                            name : each,
                            optional : paramObject.isOptional()
                        });
                    }
                }
            } catch(e) {
                $.sap.log.error("Error Fetching Input Params : " + e.toString());
            }
            return inputParams;
        },

        formatOdataObjectToString : function (value){
            if (value && value.constructor == Object){
                if (value.__edmType == "Edm.Time"){
                    var milliseconds = value.ms;
                    var seconds = Math.floor((milliseconds / 1000) % 60);
                    var minutes = Math.floor((milliseconds / 60000) % 60);
                    var hours   = Math.floor((milliseconds / 3600000) % 24);
                    return hours + "H" + minutes + "M" + seconds + "S";
                }
            }
            return value;
        },
        generateCombinations:function (array){
            function getPerfectBinary(maxLength,str){
                while (str.length < maxLength){
                    str = '0' + str;
                }
                return str;
            }
            var max = Math.pow(2,array.length);
            var resultArray = [];
            var index = 0;

            while (max > 1){
                var str = (max - 1).toString(2);
                str = getPerfectBinary(array.length,str);
                resultArray[index] = [];
                for (var i = 0; i < str.length; i++){
                    if (Number(str[i])) {
                        resultArray[index].push(array[i]);
                    }
                }
                max--;
                index++;
            }
            return resultArray;
        },

        logError : function(err,oControl){
            if (err == "no data" && oControl){
                var oResourceBundle = sap.ushell.components.tiles.utils.getResourceBundleModel().getResourceBundle();
                oControl.setFailedText(oResourceBundle.getText("sb.noData"));
            }
            jQuery.sap.log.error(err.toString());
        },

        numberOfLeadingZeros : function(num) {
            num = String(num);
            var count = 0;
            var decimal_index = num.indexOf('.');
            if (decimal_index == -1) {
                return 0;
            }
            if (Number(num.split('.')[0]) != 0) {
                return 0;
            }
            var i = decimal_index + 1;
            while (num[i++] == '0') {
                ++count;
            }
            return count;
        },

        formatValue : function (val,scaleFactor,MAX_LEN) {
            MAX_LEN = MAX_LEN || 3;
            var unit = {3: "K", 6: "M", 9: "B", 12: "T", 0: ""};
            unit["-3"] = "m";
            unit["-6"] = "u";
            unit["-9"] = "n";
            unit["-12"] = "t";
            unit["-2"] = "%";
            var temp,pre,suff;
            temp = Number(val).toPrecision(MAX_LEN);
            var zeroes = this.numberOfLeadingZeros(temp);
            if (zeroes > 0 && scaleFactor < 0){
                pre = temp * Math.pow(10,zeroes + MAX_LEN);
                suff = -(zeroes + MAX_LEN);
            } else {
                pre = Number(temp.split("e")[0]);
                suff = Number(temp.split("e")[1]) || 0;
            }
            if (!val && val != 0) {
                return {value:"",unitPrefix:""};
            }
            if (scaleFactor >= 0) {
                if (suff % 3 != 0){
                    if (suff % 3 == 2){
                        if (suff + 1 == scaleFactor){
                            suff = suff + 1;
                            pre = pre / 10;
                        } else {
                            suff = suff - 2;
                            pre = pre * 100;
                        }
                    } else {
                        if (suff + 2 == scaleFactor){
                            suff = suff + 2;
                            pre = pre / 100;
                        } else {
                            suff--;
                            pre = pre * 10;
                        }
                    }
                } else if (suff == 15) {
                    pre = pre * 1000;
                    suff = 12;
                }
            } else { // for negative scale factor and suff
                if (scaleFactor == "-2"){
                    var x = this.formatValue((val * 100), 0);
                } else if (suff >= 0 && val < 10 && scaleFactor == "-3") {
                    pre = val * Math.pow(10,3);
                    suff = -3;
                } else if (suff >= 0) {
                    return this.formatValue(val, 0);
                } else {
                    suff = Math.abs(suff);
                    scaleFactor = Math.abs(scaleFactor);
                    if (scaleFactor > suff){
                        pre = pre / (Math.pow(10, suff % 3));
                        suff = suff - (suff % 3);
                    } else {
                        var diff = suff - scaleFactor;
                        pre = pre / (Math.pow(10,diff));
                        suff  = suff - diff;
                    }
                    suff = 0 - suff;
                }

            }
            // ending of neg scale factor
            pre += "";
            if (scaleFactor == "-2"){
                var valstr = (x.unitPrefix == "") ? Number(x.value + "").toFixed(4 - (x.value + "").indexOf('.')) : Number(x.value + "").toFixed(3 - (x.value + "").indexOf('.'));
                return {value: Number(valstr), unitPrefix: (x.unitPrefix) + unit[-2]};
            }
            pre = Number(pre).toFixed(4 - pre.indexOf('.'));
            return {value:Number(pre),unitPrefix:unit[suff]};
        },
        getHanaClient : function(){
            var sessionClient;
            var deferred = sap.ushell.components.tiles.indicatorTileUtils.util.HANA_CLIENT_DEFERRED || jQuery.Deferred();
            var cacheHanaClient = sap.ushell.components.tiles.indicatorTileUtils.cache.getCacheHanaClient();
            if (cacheHanaClient != undefined) {
                sessionClient = cacheHanaClient;
                sap.ushell.components.tiles.indicatorTileUtils.util.HANA_CLIENT_DEFERRED.resolve(sessionClient);
            } else if (sap.ushell.components.tiles.indicatorTileUtils.util.HANA_CLIENT_DEFERRED) {
                return sap.ushell.components.tiles.indicatorTileUtils.util.HANA_CLIENT_DEFERRED.promise();
            } else {
                sap.ushell.components.tiles.indicatorTileUtils.util.HANA_CLIENT_DEFERRED = deferred;
                jQuery.ajax({
                    type: "GET",
                    async: false,
                    dataType: "json",
                    url: "/sap/hba/r/sb/core/logic/GetSessionClient.xsjs",
                    success: function(d, s, x) {
                        sessionClient = d.sessionClient;
                        sap.ushell.components.tiles.indicatorTileUtils.cache.setCacheHanaClient(sessionClient);
                        sap.ushell.components.tiles.indicatorTileUtils.util.HANA_CLIENT_DEFERRED.resolve(sessionClient);
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        jQuery.sap.log.error(jqXHR.responseText);
                        jQuery.sap.log.error("session client call failed");
                        sap.ushell.components.tiles.indicatorTileUtils.cache.setCacheHanaClient(null);
                        sap.ushell.components.tiles.indicatorTileUtils.util.HANA_CLIENT_DEFERRED.reject();
                    }
                });
            }
            return sap.ushell.components.tiles.indicatorTileUtils.util.HANA_CLIENT_DEFERRED.promise();
            //return sessionClient;
        },        
        abortPendingODataCalls : function(oDataCallRef){
            try {
                if (oDataCallRef) {
                    oDataCallRef.abort();
                }
            } catch(e) {
                this.logError(e);
            }
        }
    };

})(window, jQuery);

sap.ushell.components.tiles.indicatorTileUtils.cache = (function() {
	var BIGMAP = {};
	var KPIVALUE = {};
	var sessionContext = "HANA_CLIENT";
	return {
		getCacheHanaClient : function(){
//			if(BIGMAP[sessionContext]){
//			return BIGMAP[sessionContext];
//			}
//			return null;
			return BIGMAP[sessionContext];
		},
		setCacheHanaClient : function(data){
			BIGMAP[sessionContext] = data;
		},
		getEvaluationById : function(key) {
			return this.getEvaluationByChipId(key);
		},
		getEvaluationByChipId : function(key) {
			if (BIGMAP[key]) {
				return BIGMAP[key];
			}
			return null;
		},
		setEvaluationById : function(key, data) {
			BIGMAP[key] = data;
		},
		getKpivalueById : function(key){
			if (KPIVALUE[key]) {
				return KPIVALUE[key];
			}
			return null;
		},
		setKpivalueById : function(key, data) {
			KPIVALUE[key]  = data;
		}
	};
})();
