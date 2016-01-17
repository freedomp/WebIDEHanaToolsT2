jQuery.sap.require("sap.ushell.components.tiles.indicatorTileUtils.smartBusinessUtil");
jQuery.sap.require("sap.ui.model.analytics.odata4analytics");
jQuery.sap.require("sap.ui.core.mvc.Controller");
sap.ui.core.mvc.Controller.extend("sap.ushell.components.tiles.generic", {

    onAfterRendering : function () {

        var that = this;
        this.firstTimeVisible = false;
        this.oKpiTileView = this.getView();
        this.oViewData = this.oKpiTileView.getViewData();
        if (!sap.ushell.components.tiles.utils) {
            jQuery.sap.require("sap.ushell.components.tiles.utils");
        }
        this.oResourceBundle = sap.ushell.components.tiles.utils.getResourceBundleModel().getResourceBundle();
        this.oTileApi = this.oViewData.chip; // instance specific CHIP API
        if (this.oTileApi.visible) {
            this.oTileApi.visible.attachVisible(this.visibleHandler.bind(this));
        }
        this.system = this.oTileApi.url.getApplicationSystem();
        this.oKpiTileView.oGenericTile.setState(sap.suite.ui.commons.LoadState.Loading);

        this.getChipConfiguration( function(){
            if (that.oTileApi.preview.isEnabled()) {
                that.doDummyProcess();
            } else {

                that.oKpiTileView.oGenericTile.attachPress(function(){
                    sap.ushell.components.tiles.indicatorTileUtils.util.abortPendingODataCalls(that.queryServiceUriODataReadRef);
                    sap.ushell.components.tiles.indicatorTileUtils.cache.setKpivalueById(that.oConfig.TILE_PROPERTIES.id, null);
                    window.location.hash = sap.ushell.components.tiles.indicatorTileUtils.util.getNavigationTarget(that.oConfig,that.system);
                });
                that.fetchEvaluation(that.oConfig,  function(){
                    that.DEFINITION_DATA = that.oConfig;
                    if (that.KPI_VALUE_REQUIRED){
                        that.fetchKpiValue( function(kpiValue,sThresholdObject){
                            this.KPIVALUE = kpiValue;
                            that.doProcess(kpiValue,sThresholdObject);
                        },that.logError);
                    } else {
                        that.doProcess();
                    }
                });
            }
        });

    },

    getChipConfiguration : function(callback){

        var that = this;
        try {
            sap.ushell.components.tiles.indicatorTileUtils.util.getParsedChip(
                    that.oTileApi.configuration.getParameterValueAsString("tileConfiguration"), function(config){
                        that.oConfig = config;
                        var title = sap.ushell.components.tiles.indicatorTileUtils.util.getChipTitle(that.oConfig);
                        var subtitle = sap.ushell.components.tiles.indicatorTileUtils.util.getChipSubTitle(that.oConfig);
                        if (that.oTileApi.search) {
                            that.oTileApi.search.setKeywords([title, subtitle]);
                        }
                        if (that.oTileApi.preview) {
                            that.oTileApi.preview.setTargetUrl(sap.ushell.components.tiles.indicatorTileUtils.util.getNavigationTarget(that.oConfig,that.system));
                        }
                        callback.call();
                    });
        } catch(e) {
            that.logError(e.message);
        }
    },

    fetchEvaluation : function(chipConfig,callback){
        var that = this;
        var sPlatform = this.oConfig.TILE_PROPERTIES.sb_metadata || "HANA";
        if (Number(that.oTileApi.configuration.getParameterValueAsString("isSufficient"))){
            sap.ushell.components.tiles.indicatorTileUtils.cache.setEvaluationById(that.oConfig.TILE_PROPERTIES.id,that.oConfig);
            that.DEFINITION_DATA = chipConfig;
            that._updateTileModel(this.DEFINITION_DATA);
            if (that.oTileApi.visible.isVisible() && !that.firstTimeVisible){
                that.firstTimeVisible = true;
                var evaluationData = sap.ushell.components.tiles.indicatorTileUtils.cache.getEvaluationById(that.oConfig.TILE_PROPERTIES.id);
                if (evaluationData) {
                    that.oConfig.EVALUATION_FILTERS = evaluationData.EVALUATION_FILTERS;
                    callback.call(evaluationData);

                } else {
                    try {
                        sap.ushell.components.tiles.indicatorTileUtils.util.getFilterFromRunTimeService(that.oConfig,that.oTileApi,function(filter){
                            that.oConfig.EVALUATION_FILTERS = filter;
                            if (sPlatform.toUpperCase() === "HANA") {
                                that.parse_sapclient();
                            }
                            sap.ushell.components.tiles.indicatorTileUtils.cache.setEvaluationById(that.oConfig.TILE_PROPERTIES.id,that.oConfig);
                            callback.call(filter);
                        });

                    } catch(e) {
                        that.logError("no evaluation data");
                    }
                }
            } else {
                try {
                    var evaluationData = sap.ushell.components.tiles.indicatorTileUtils.cache.getEvaluationById(that.oConfig.TILE_PROPERTIES.id);
                    if (evaluationData) {
                        that.oConfig.EVALUATION_FILTERS = evaluationData.EVALUATION_FILTERS;
                        callback.call(evaluationData);

                    } else {
                        sap.ushell.components.tiles.indicatorTileUtils.util.getFilterFromRunTimeService(that.oConfig,that.oTileApi,function(filter){
                            that.oConfig.EVALUATION_FILTERS = filter;
                            if (sPlatform.toUpperCase() === "HANA") {
                                that.parse_sapclient();
                            }
                            sap.ushell.components.tiles.indicatorTileUtils.cache.setEvaluationById(that.oConfig.TILE_PROPERTIES.id,that.oConfig);
                            callback.call(filter);
                        });
                    }

                } catch(e) {
                    that.logError("no evaluation data");
                }
            }
        } else {
            try {
                var evaluationData = sap.ushell.components.tiles.indicatorTileUtils.cache.getEvaluationById(that.oConfig.TILE_PROPERTIES.id);
                if (evaluationData) {
                    that.oConfig.EVALUATION_FILTERS = evaluationData.EVALUATION_FILTERS;
                    callback.call(evaluationData);

                } else {
                    sap.ushell.components.tiles.indicatorTileUtils.util.getFilterFromRunTimeService(that.oConfig,that.oTileApi,function(filter){
                        that.oConfig.EVALUATION_FILTERS = filter;
                        if (sPlatform.toUpperCase() === "HANA") {
                            that.parse_sapclient();
                        }
                        sap.ushell.components.tiles.indicatorTileUtils.cache.setEvaluationById(that.oConfig.TILE_PROPERTIES.id,that.oConfig);
                        callback.call(filter);
                    });
                }

            } catch(e) {
                that.logError("no evaluation data");
            }
        }

    },
    fetchKpiValue : function(callback , fnError){
        var that = this;
        var kpiValue = 0;
//      var targetValue = 0;
//      var criticalHighValue = 0;
//      var criticalLowValue = 0;
//      var warningHighValue = 0;
//      var warningLowValue = 0;
//      var trendValue = 0;
        try {
            var sUri = this.DEFINITION_DATA.EVALUATION.ODATA_URL;
            var sEntitySet = this.DEFINITION_DATA.EVALUATION.ODATA_ENTITYSET;
            var sThresholdObject = this.setThresholdValues();
            var sMeasure = sThresholdObject.fullyFormedMeasure;
            var cachedValue = sap.ushell.components.tiles.indicatorTileUtils.cache.getKpivalueById(that.oConfig.TILE_PROPERTIES.id);
            if (!cachedValue){
                var variantData = sap.ushell.components.tiles.indicatorTileUtils.util.prepareFilterStructure(
                        this.DEFINITION_DATA.EVALUATION_FILTERS,this.DEFINITION_DATA.ADDITIONAL_FILTERS);
                var oQuery = sap.ushell.components.tiles.indicatorTileUtils.util.prepareQueryServiceUri(
                        that.oTileApi.url.addSystemToServiceUrl(sUri), sEntitySet, sMeasure, null, variantData);
                if (oQuery) {
                    this.QUERY_SERVICE_MODEL = oQuery.model;
                    this.queryUriForKpiValue = oQuery.uri;
                    this.queryServiceUriODataReadRef = this.QUERY_SERVICE_MODEL.read(oQuery.uri, null, null, true, function(data) {
                        if (data && data.results && data.results.length && data.results[0][that.DEFINITION_DATA.EVALUATION.COLUMN_NAME] != null) {
                            kpiValue = data.results[0][that.DEFINITION_DATA.EVALUATION.COLUMN_NAME];
                            var writeData = {};
                            if (oQuery.unit[0]){
                                that._updateTileModel({
                                    unit : data.results[0][oQuery.unit[0].name]
                                });
                                writeData.unit = oQuery.unit[0];
                                writeData.unit.name = oQuery.unit[0].name;
                            }
                            if (that.oConfig.TILE_PROPERTIES.frameType == "TwoByOne"){
                                if (sap.ushell.components.tiles.indicatorTileUtils.cache.getKpivalueById(that.oConfig.TILE_PROPERTIES.id)){
                                    writeData = sap.ushell.components.tiles.indicatorTileUtils.cache.getKpivalueById(that.oConfig.TILE_PROPERTIES.id);
                                }
                                writeData.numericData = data;
                            } else {
                                writeData.data = data;
                            }

                            sap.ushell.components.tiles.indicatorTileUtils.cache.setKpivalueById(that.oConfig.TILE_PROPERTIES.id, writeData);
                            if (that.DEFINITION_DATA.EVALUATION.VALUES_SOURCE == "MEASURE"){
                                sThresholdObject.criticalHighValue = data.results[0][sThresholdObject.sCriticalHigh];
                                sThresholdObject.criticalLowValue = data.results[0][sThresholdObject.sCriticalLow];
                                sThresholdObject.warningHighValue = data.results[0][sThresholdObject.sWarningHigh];
                                sThresholdObject.warningLowValue = data.results[0][sThresholdObject.sWarningLow];
                                sThresholdObject.targetValue = data.results[0][sThresholdObject.sTarget];
                                sThresholdObject.trendValue = data.results[0][sThresholdObject.sTrend];
                            } else if (that.DEFINITION_DATA.EVALUATION.VALUES_SOURCE == "RELATIVE"){
                                sThresholdObject.targetValue = Number(data.results[0][sThresholdObject.sTarget]);
                                sThresholdObject.criticalHighValue = sThresholdObject.targetValue * sThresholdObject.criticalHighValue / 100;
                                sThresholdObject.criticalLowValue = sThresholdObject.targetValue * sThresholdObject.criticalLowValue / 100;
                                sThresholdObject.warningHighValue = sThresholdObject.targetValue * sThresholdObject.warningHighValue / 100;
                                sThresholdObject.warningLowValue = sThresholdObject.targetValue * sThresholdObject.warningLowValue / 100;
                                sThresholdObject.trendValue = Number(data.results[0][sThresholdObject.sTrend]);
                            }
                            callback.call(that, kpiValue,sThresholdObject );
                        } else {
                            that.setNoData();
                        }
                    },function(eObject) {
                        if (eObject && eObject.response) {
                            jQuery.sap.log.error(eObject.message + " : " + eObject.request.requestUri);
                            fnError.call(that,eObject);
                        }
                    });
                } else {
                    that.logError("Error Preparing Query Service URI");
                }
            } else {
                if (that.DEFINITION_DATA.TILE_PROPERTIES.frameType == sap.suite.ui.commons.FrameType.OneByOne){
                    if (cachedValue.data.results && cachedValue.data.results.length && cachedValue.data.results[0][that.DEFINITION_DATA.EVALUATION.COLUMN_NAME] != null){
                        kpiValue = cachedValue.data.results[0][that.DEFINITION_DATA.EVALUATION.COLUMN_NAME];
                        if (cachedValue.unit){
                            that._updateTileModel({
                                unit : cachedValue.data.results[0][cachedValue.unit.name]
                            });
                        }
                        if (that.DEFINITION_DATA.EVALUATION.VALUES_SOURCE == "MEASURE"){
                            sThresholdObject.criticalHighValue = cachedValue.data.results[0][sThresholdObject.sCriticalHigh];
                            sThresholdObject.criticalLowValue = cachedValue.data.results[0][sThresholdObject.sCriticalLow];
                            sThresholdObject.warningHighValue = cachedValue.data.results[0][sThresholdObject.sWarningHigh];
                            sThresholdObject.warningLowValue = cachedValue.data.results[0][sThresholdObject.sWarningLow];
                            sThresholdObject.targetValue = cachedValue.data.results[0][sThresholdObject.sTarget];
                            sThresholdObject.trendValue = cachedValue.data.results[0][sThresholdObject.sTrend];
                        } else if (that.DEFINITION_DATA.EVALUATION.VALUES_SOURCE == "RELATIVE"){
                            sThresholdObject.targetValue = Number(cachedValue.data.results[0][sThresholdObject.sTarget]);
                            sThresholdObject.criticalHighValue = sThresholdObject.targetValue * sThresholdObject.criticalHighValue / 100;
                            sThresholdObject.criticalLowValue = sThresholdObject.targetValue * sThresholdObject.criticalLowValue / 100;
                            sThresholdObject.warningHighValue = sThresholdObject.targetValue * sThresholdObject.warningHighValue / 100;
                            sThresholdObject.warningLowValue = sThresholdObject.targetValue * sThresholdObject.warningLowValue / 100;
                            sThresholdObject.trendValue = Number(cachedValue.data.results[0][sThresholdObject.sTrend]);
                        }
                        callback.call(that, kpiValue, sThresholdObject);
                    } else {
                        that.setNoData();
                    }
                } else {
                    if (cachedValue.numericData && cachedValue.numericData.results && cachedValue.numericData.results.length && cachedValue.numericData.results[0][that.DEFINITION_DATA.EVALUATION.COLUMN_NAME] != null) {
                        kpiValue = cachedValue.numericData.results[0][that.DEFINITION_DATA.EVALUATION.COLUMN_NAME];
                        if (cachedValue.unit){
                            that._updateTileModel({
                                unit : cachedValue.numericData.results[0][cachedValue.unit.name]
                            });
                        }
                        if (that.DEFINITION_DATA.EVALUATION.VALUES_SOURCE == "MEASURE"){
                            sThresholdObject.criticalHighValue = cachedValue.numericData.results[0][sThresholdObject.sCriticalHigh];
                            sThresholdObject.criticalLowValue = cachedValue.numericData.results[0][sThresholdObject.sCriticalLow];
                            sThresholdObject.warningHighValue = cachedValue.numericData.results[0][sThresholdObject.sWarningHigh];
                            sThresholdObject.warningLowValue = cachedValue.numericData.results[0][sThresholdObject.sWarningLow];
                            sThresholdObject.targetValue = cachedValue.numericData.results[0][sThresholdObject.sTarget];
                            sThresholdObject.trendValue = cachedValue.numericData.results[0][sThresholdObject.sTrend];
                        } else if (that.DEFINITION_DATA.EVALUATION.VALUES_SOURCE == "RELATIVE"){
                            sThresholdObject.targetValue = Number(cachedValue.numericData.results[0][sThresholdObject.sTarget]);
                            sThresholdObject.criticalHighValue = sThresholdObject.targetValue * sThresholdObject.criticalHighValue / 100;
                            sThresholdObject.criticalLowValue = sThresholdObject.targetValue * sThresholdObject.criticalLowValue / 100;
                            sThresholdObject.warningHighValue = sThresholdObject.targetValue * sThresholdObject.warningHighValue / 100;
                            sThresholdObject.warningLowValue = sThresholdObject.targetValue * sThresholdObject.warningLowValue / 100;
                            sThresholdObject.trendValue = Number(cachedValue.numericData.results[0][sThresholdObject.sTrend]);
                        }
                        callback.call(that, kpiValue,sThresholdObject);
                    } else {
                        that.setNoData();
                    }
                }
            }
        }catch(e) {
            that.logError(e);
        }

    },

    _setLocalModelToTile : function() {
        if (!this.getTile().getModel()) {
            this.getTile().setModel(new sap.ui.model.json.JSONModel({}));
        }
    },

    getTile : function() {
        return this.oKpiTileView.oGenericTile;
    },

    _updateTileModel : function(newData) {
        var modelData  = this.getTile().getModel().getData();
        jQuery.extend(modelData,newData);
        this.getTile().getModel().setData(modelData);
    },

    isACurrencyMeasure : function(measure) {
        var sUri = this.DEFINITION_DATA.EVALUATION.ODATA_URL;
        var entitySet = this.DEFINITION_DATA.EVALUATION.ODATA_ENTITYSET;
        return sap.ushell.components.tiles.indicatorTileUtils.util.getFormattingMetadata(this.oTileApi.url.addSystemToServiceUrl(sUri), entitySet, measure)._hasCurrency;
    },

    autoFormatter: function(n, isACurrencyMeasure) {
        isACurrencyMeasure = isACurrencyMeasure || false;
        if (!n) {
            return "";
        }
        return sap.ushell.components.tiles.indicatorTileUtils.util.getLocaleFormattedValue(
                Number(n),
                this.oConfig.EVALUATION.SCALING,
                this.oConfig.EVALUATION.DECIMAL_PRECISION,
                isACurrencyMeasure
        );
    },

    setToolTip : function(applyColor,calculatedValueForScaling,tileType){

        var that = this;
        var oControl;
        var sThresholdObject = this.setThresholdValues();
        var measure = this.oConfig.EVALUATION.COLUMN_NAME;
        var isACurrencyMeasure = this.isACurrencyMeasure(measure);
        if (tileType == "CONT" || tileType == "COMP"){
            if (this.oKpiTileView.getContent()[0].getTileContent().length){
                //var oControl = this.oKpiTileView.oGenericTile.getTileContent()[0].getContent();
                oControl = that.oKpiTileView.getContent()[0].getTileContent()[0].getContent();
                var m1,m2,m3,v1,v2,v3,c1,c2,c3;
                if (calculatedValueForScaling && calculatedValueForScaling[0]){
                    m1 = calculatedValueForScaling[0].title;
                    v1 = this.autoFormatter(calculatedValueForScaling[0].value, isACurrencyMeasure);
                    c1 = sap.ushell.components.tiles.indicatorTileUtils.util.getSemanticColorName(calculatedValueForScaling[0].color);
                }
                if (calculatedValueForScaling && calculatedValueForScaling[1]){
                    m2 = calculatedValueForScaling[1].title;
                    v2 = this.autoFormatter(calculatedValueForScaling[1].value, isACurrencyMeasure);
                    c2 = sap.ushell.components.tiles.indicatorTileUtils.util.getSemanticColorName(calculatedValueForScaling[1].color);
                }
                if (calculatedValueForScaling && calculatedValueForScaling[2]){
                    m3 = calculatedValueForScaling[2].title;
                    v3 = this.autoFormatter(calculatedValueForScaling[2].value, isACurrencyMeasure);
                    c3 = sap.ushell.components.tiles.indicatorTileUtils.util.getSemanticColorName(calculatedValueForScaling[2].color);
                }
                var valueObj = {
                        measure: this.oConfig.EVALUATION.COLUMN_NAME,
                        m1 : m1,
                        v1 : v1,
                        c1 : c1,
                        m2 : m2,
                        v2 : v2,
                        c2 : c2,
                        m3 : m3,
                        v3 : v3,
                        c3 : c3
                };
                sap.ushell.components.tiles.indicatorTileUtils.util.setTooltipInTile(oControl,tileType,valueObj);

            }

        } else {

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
            var valueObj = {
                    status : status,
                    actual : this.autoFormatter(calculatedValueForScaling, isACurrencyMeasure),
                    target : this.autoFormatter(sThresholdObject.targetValue, isACurrencyMeasure),
                    cH : this.autoFormatter(sThresholdObject.criticalHighValue, isACurrencyMeasure),
                    wH : this.autoFormatter(sThresholdObject.warningHighValue, isACurrencyMeasure),
                    wL : this.autoFormatter(sThresholdObject.warningLowValue, isACurrencyMeasure),
                    cL : this.autoFormatter(sThresholdObject.criticalLowValue, isACurrencyMeasure)
            };
            //var oControl = that.oKpiTileView.oGenericTile.getTileContent()[0].getContent();
            var oControl = that.oKpiTileView.getContent()[0].getTileContent()[0].getContent();
            sap.ushell.components.tiles.indicatorTileUtils.util.setTooltipInTile(oControl,tileType,valueObj);
//          if(parseFloat(calculatedValueForScaling)!=0 && !calculatedValueForScaling){
//          this.logError("no data");
//          }
        }
    },

    getTrendColor : function(sThresholdObj){
        var that = this,
        warningLowValue,
        criticalLowValue,
        warningHighValue,
        criticalHighValue;
        try {
            var improvementDirection = this.DEFINITION_DATA.EVALUATION.GOAL_TYPE;
            /*var evalValue =*/ this.DEFINITION_DATA.EVALUATION_VALUES;
            var returnColor = sap.suite.ui.commons.InfoTileValueColor.Neutral;
            if (improvementDirection === "MI") {
                if (sThresholdObj.criticalHighValue && sThresholdObj.warningHighValue) {
                    criticalHighValue = Number(sThresholdObj.criticalHighValue);
                    warningHighValue = Number(sThresholdObj.warningHighValue);
                    if (this.CALCULATED_KPI_VALUE < warningHighValue) {
                        returnColor = sap.suite.ui.commons.InfoTileValueColor.Good;
                    } else if (this.CALCULATED_KPI_VALUE <= criticalHighValue) {
                        returnColor = sap.suite.ui.commons.InfoTileValueColor.Critical;
                    } else {
                        returnColor = sap.suite.ui.commons.InfoTileValueColor.Error;
                    }
                }
            } else if (improvementDirection === "MA") {
                if (sThresholdObj.criticalLowValue && sThresholdObj.warningLowValue) {
                    criticalLowValue = Number(sThresholdObj.criticalLowValue);
                    warningLowValue = Number(sThresholdObj.warningLowValue);
                    if (this.CALCULATED_KPI_VALUE < criticalLowValue) {
                        returnColor = sap.suite.ui.commons.InfoTileValueColor.Error;
                    } else if (this.CALCULATED_KPI_VALUE <= warningLowValue) {
                        returnColor = sap.suite.ui.commons.InfoTileValueColor.Critical;
                    } else {
                        returnColor = sap.suite.ui.commons.InfoTileValueColor.Good;
                    }
                }
            } else {
                if (sThresholdObj.warningLowValue && sThresholdObj.warningHighValue && sThresholdObj.criticalLowValue && sThresholdObj.criticalHighValue) {
                    criticalHighValue = Number(sThresholdObj.criticalHighValue);
                    warningHighValue = Number(sThresholdObj.warningHighValue);
                    warningLowValue = Number(sThresholdObj.warningLowValue);
                    criticalLowValue = Number(sThresholdObj.criticalLowValue);
                    if (this.CALCULATED_KPI_VALUE < criticalLowValue || this.CALCULATED_KPI_VALUE > criticalHighValue) {
                        returnColor = sap.suite.ui.commons.InfoTileValueColor.Error;
                    } else if ((this.CALCULATED_KPI_VALUE >= criticalLowValue && this.CALCULATED_KPI_VALUE <= warningLowValue) ||
                            (this.CALCULATED_KPI_VALUE >= warningHighValue && this.CALCULATED_KPI_VALUE <= criticalHighValue)
                    ) {
                        returnColor = sap.suite.ui.commons.InfoTileValueColor.Critical;
                    } else {
                        returnColor = sap.suite.ui.commons.InfoTileValueColor.Good;
                    }
                }
            }
            return returnColor;
        } catch(e) {
            that.logError(e);
        }
    },

    getTrendIndicator : function(trendValue) {
        var that = this;
        trendValue = Number(trendValue);
        try {
            var trendIndicator = sap.suite.ui.commons.DeviationIndicator.None;
            if (trendValue > this.CALCULATED_KPI_VALUE){
                trendIndicator = sap.suite.ui.commons.DeviationIndicator.Down;
            } else if (trendValue < this.CALCULATED_KPI_VALUE){
                trendIndicator = sap.suite.ui.commons.DeviationIndicator.Up;
            }
            return trendIndicator;
        } catch(e) {
            that.logError(e);
        }
    },


    setThresholdValues : function(){
        var that = this;
        try {
            var oThresholdObject = {};
            oThresholdObject.fullyFormedMeasure = this.DEFINITION_DATA.EVALUATION.COLUMN_NAME;
            if (this.DEFINITION_DATA.EVALUATION.VALUES_SOURCE == "MEASURE"){
                var cacheData = sap.ushell.components.tiles.indicatorTileUtils.cache.getKpivalueById(that.oConfig.TILE_PROPERTIES.id);
                switch (this.DEFINITION_DATA.EVALUATION.GOAL_TYPE){
                case "MI" :
                    oThresholdObject.sWarningHigh =  sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "WH", "MEASURE");
                    oThresholdObject.sCriticalHigh =  sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "CH", "MEASURE");
                    oThresholdObject.sTarget =  sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "TA", "MEASURE");
                    oThresholdObject.sTrend =  sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "TC", "MEASURE");
                    oThresholdObject.fullyFormedMeasure += that.formSelectStatement(oThresholdObject);
                    if (cacheData && cacheData.data && cacheData.data.results && cacheData.data.results.length){
                        oThresholdObject.trendValue = Number(cacheData.data.results[0][oThresholdObject.sTrend]);
                        oThresholdObject.targetValue = Number(cacheData.data.results[0][oThresholdObject.sTarget]);
                        oThresholdObject.criticalHighValue =  Number(cacheData.data.results[0][oThresholdObject.sCriticalHigh]);
                        oThresholdObject.warningHighValue = Number(cacheData.data.results[0][oThresholdObject.sWarningHigh]);
                    }
                    break;
                case "MA" :
                    oThresholdObject.sWarningLow =  sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "WL", "MEASURE");
                    oThresholdObject.sCriticalLow =  sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "CL", "MEASURE");
                    oThresholdObject.sTarget =  sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "TA", "MEASURE");
                    oThresholdObject.sTrend =  sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "TC", "MEASURE");
                    oThresholdObject.fullyFormedMeasure += that.formSelectStatement(oThresholdObject);
                    if (cacheData && cacheData.data && cacheData.data.results && cacheData.data.results.length){
                        oThresholdObject.criticalLowValue = Number(cacheData.data.results[0][oThresholdObject.sCriticalLow]);
                        oThresholdObject.warningLowValue = Number(cacheData.data.results[0][oThresholdObject.sWarningLow]);
                        oThresholdObject.trendValue = Number(cacheData.data.results[0][oThresholdObject.sTrend]);
                        oThresholdObject.targetValue = Number(cacheData.data.results[0][oThresholdObject.sTarget]);
                    }
                    break;
                case "RA" :
                    oThresholdObject.sWarningHigh =  sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "WH", "MEASURE");
                    oThresholdObject.sCriticalHigh =  sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "CH", "MEASURE");
                    oThresholdObject.sTarget =  sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "TA", "MEASURE");
                    oThresholdObject.sTrend =  sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "TC", "MEASURE");
                    oThresholdObject.sWarningLow =  sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "WL", "MEASURE");
                    oThresholdObject.sCriticalLow =  sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "CL", "MEASURE");
                    oThresholdObject.fullyFormedMeasure += that.formSelectStatement(oThresholdObject);
                    if (cacheData && cacheData.data && cacheData.data.results && cacheData.data.results.length){
                        oThresholdObject.criticalLowValue = Number(cacheData.data.results[0][oThresholdObject.sCriticalLow]);
                        oThresholdObject.warningLowValue = Number(cacheData.data.results[0][oThresholdObject.sWarningLow]);
                        oThresholdObject.trendValue = Number(cacheData.data.results[0][oThresholdObject.sTrend]);
                        oThresholdObject.targetValue = Number(cacheData.data.results[0][oThresholdObject.sTarget]);
                        oThresholdObject.criticalHighValue =  Number(cacheData.data.results[0][oThresholdObject.sCriticalHigh]);
                        oThresholdObject.warningHighValue = Number(cacheData.data.results[0][oThresholdObject.sWarningHigh]);
                    }
                    break;
                }
            } else if (this.DEFINITION_DATA.EVALUATION.VALUES_SOURCE == "RELATIVE"){
                oThresholdObject.sTarget = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "TA", "MEASURE");
                oThresholdObject.sTrend =  sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "TC", "MEASURE");
                oThresholdObject.fullyFormedMeasure += that.formSelectStatement(oThresholdObject);
                oThresholdObject.criticalHighValue = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "CH", "FIXED");
                oThresholdObject.criticalLowValue = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "CL", "FIXED");
                oThresholdObject.warningHighValue = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "WH", "FIXED");
                oThresholdObject.warningLowValue = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "WL", "FIXED");
            } else {
                oThresholdObject.criticalHighValue = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "CH", "FIXED");
                oThresholdObject.criticalLowValue = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "CL", "FIXED");
                oThresholdObject.warningHighValue = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "WH", "FIXED");
                oThresholdObject.warningLowValue = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "WL", "FIXED");
                oThresholdObject.targetValue = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "TA", "FIXED");
                oThresholdObject.trendValue = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "TC", "FIXED");
            }
            return oThresholdObject;
        } catch(e) {
            that.logError(e);
        }
    },

    formSelectStatement : function(object) {
        var tmpArray = Object.keys(object);
        var sFormedMeasure = "";
        for (var i = 0; i < tmpArray.length; i++) {
            if ((object[tmpArray[i]] !== undefined) && (object.fullyFormedMeasure)) {
                sFormedMeasure = sFormedMeasure + "," + object[tmpArray[i]];
            }
        }
        return sFormedMeasure;
    },

    parse_sapclient : function() {
        var i, SAP_CLIENT, reserved_placeholder, filters, filter; //, HANA_USER_CLIENT;
        //var HANA_USER_CLIENT = "ERR_parsing_sapclient";
        SAP_CLIENT = "P_SAPClient";
        reserved_placeholder = "$$$";
        filters = this.oConfig.EVALUATION_FILTERS;

        /* expected syntax
         *  evaluationData
         *	|-- FILTERS
         *	|   |-- results[]
         *	|   	|-- NAME
         *	|   	|-- VALUE_1
         */

        if (filters.constructor !== Array) {
            return;
        }

        if (filters.length < 1) {
            return;
        }
        for (i in filters) {
            filter = filters[i];
            if (filter["NAME"] === SAP_CLIENT && filter["VALUE_1"] === reserved_placeholder) {
                break;
            }
            filter = null;
        }
        if (filter) {
            jQuery.when(sap.ushell.components.tiles.indicatorTileUtils.util.getHanaClient()).done(function (client) {
                filter["VALUE_1"] = client;
            });

        }
    },

    setTextInTile : function(){

        var that = this;
        var titleObj = sap.ushell.components.tiles.indicatorTileUtils.util.getTileTitleSubtitle(this.oTileApi);
        this._updateTileModel({

            header : titleObj.title || sap.ushell.components.tiles.indicatorTileUtils.util.getChipTitle(that.oConfig ),
            subheader : titleObj.subTitle || sap.ushell.components.tiles.indicatorTileUtils.util.getChipSubTitle(that.oConfig )
        });
    },

    logError : function(err){
        this._updateTileModel({
            value : "",
            scale : "",
            unit: ""
        });
        if (this.getView().getViewData().deferredObj){
            this.getView().getViewData().deferredObj.reject();
        } else {
            this.oKpiTileView.oGenericTile.setState(sap.suite.ui.commons.LoadState.Failed);
        }
    },
    setNoData : function(){
        var viewData = this.getView().getViewData();
        if (viewData.parentController) {
            viewData.parentController.setNoData();
            if (viewData.deferredObj) {
                viewData.deferredObj.resolve();
            }
        } else {
            try {
                this._updateTileModel({
                    value : "",
                    scale : "",
                    unit: "",
                    footerNum : this.oResourceBundle.getText("sb.noDataAvailable"),
                    footerComp : this.oResourceBundle.getText("sb.noDataAvailable") // in case of comparison( and mm) tiles 

                });
                this.oKpiTileView.oGenericTile.setState(sap.suite.ui.commons.LoadState.Loaded);
            } catch(e){
                //do nothing 
            }
        }
    },
    refreshHandler : function () {    	
        var that = this;
        var cacheData = {};
        if (this.firstTimeVisible){
            if (Number(this.oTileApi.configuration.getParameterValueAsString("isSufficient"))){
                if (this.KPI_VALUE_REQUIRED){
                    var sThresholdObject = this.setThresholdValues();
                    cacheData = sap.ushell.components.tiles.indicatorTileUtils.cache.getKpivalueById(that.oConfig.TILE_PROPERTIES.id);
                    if (that.DEFINITION_DATA.EVALUATION.VALUES_SOURCE == "MEASURE"){
                        sThresholdObject.criticalHighValue = cacheData.data.results[0][sThresholdObject.sCriticalHigh];
                        sThresholdObject.criticalLowValue = cacheData.data.results[0][sThresholdObject.sCriticalLow];
                        sThresholdObject.warningHighValue = cacheData.data.results[0][sThresholdObject.sWarningHigh];
                        sThresholdObject.warningLowValue = cacheData.data.results[0][sThresholdObject.sWarningLow];
                        sThresholdObject.targetValue = cacheData.data.results[0][sThresholdObject.sTarget];
                        sThresholdObject.trendValue = cacheData.data.results[0][sThresholdObject.sTrend];
                    } else if (that.DEFINITION_DATA.EVALUATION.VALUES_SOURCE == "RELATIVE"){
                        sThresholdObject.targetValue = Number(cacheData.data.results[0][sThresholdObject.sTarget]);
                        sThresholdObject.criticalHighValue = sThresholdObject.targetValue * sThresholdObject.criticalHighValue / 100;
                        sThresholdObject.criticalLowValue = sThresholdObject.targetValue * sThresholdObject.criticalLowValue / 100;
                        sThresholdObject.warningHighValue = sThresholdObject.targetValue * sThresholdObject.warningHighValue / 100;
                        sThresholdObject.warningLowValue = sThresholdObject.targetValue * sThresholdObject.warningLowValue / 100;
                        sThresholdObject.trendValue = Number(cacheData.data.results[0][sThresholdObject.sTrend]);
                    }
                    this.doProcess(this.KPIVALUE,sThresholdObject);

                } else {
                    this.doProcess();
                }
            } else {
                this.fetchEvaluation(this.oConfig, function(){
                    if (this.KPI_VALUE_REQUIRED){
                        var sThresholdObject = this.setThresholdValues();
                        cacheData = sap.ushell.components.tiles.indicatorTileUtils.cache.getKpivalueById(that.oConfig.TILE_PROPERTIES.id);
                        if (that.DEFINITION_DATA.EVALUATION.VALUES_SOURCE == "MEASURE"){
                            sThresholdObject.criticalHighValue = cacheData.data.results[0][sThresholdObject.sCriticalHigh];
                            sThresholdObject.criticalLowValue = cacheData.data.results[0][sThresholdObject.sCriticalLow];
                            sThresholdObject.warningHighValue = cacheData.data.results[0][sThresholdObject.sWarningHigh];
                            sThresholdObject.warningLowValue = cacheData.data.results[0][sThresholdObject.sWarningLow];
                            sThresholdObject.targetValue = cacheData.data.results[0][sThresholdObject.sTarget];
                            sThresholdObject.trendValue = cacheData.data.results[0][sThresholdObject.sTrend];
                        } else if (that.DEFINITION_DATA.EVALUATION.VALUES_SOURCE == "RELATIVE"){
                            sThresholdObject.targetValue = Number(cacheData.data.results[0][sThresholdObject.sTarget]);
                            sThresholdObject.criticalHighValue = sThresholdObject.targetValue * sThresholdObject.criticalHighValue / 100;
                            sThresholdObject.criticalLowValue = sThresholdObject.targetValue * sThresholdObject.criticalLowValue / 100;
                            sThresholdObject.warningHighValue = sThresholdObject.targetValue * sThresholdObject.warningHighValue / 100;
                            sThresholdObject.warningLowValue = sThresholdObject.targetValue * sThresholdObject.warningLowValue / 100;
                            sThresholdObject.trendValue = Number(cacheData.data.results[0][sThresholdObject.sTrend]);
                        }
                        this.doProcess(this.KPIVALUE,sThresholdObject);
                    } else {
                        this.doProcess();
                    }
                });
            }
        }

    },

    visibleHandler : function (isVisible) {
        if (!isVisible) {
            //this.firstTimeVisible = false;
            sap.ushell.components.tiles.indicatorTileUtils.util.abortPendingODataCalls(this.queryServiceUriODataReadRef);
            sap.ushell.components.tiles.indicatorTileUtils.util.abortPendingODataCalls(this.trendChartODataReadRef);
            sap.ushell.components.tiles.indicatorTileUtils.util.abortPendingODataCalls(this.comparisionChartODataRef);
        }
        if (isVisible) {
            this.refreshHandler(this);
        }
    },
    _getEvaluationThresholdMeasures : function(){
        var thresholdMeasuresArray = [];
        thresholdMeasuresArray.push(this.oConfig.EVALUATION.COLUMN_NAME);
        if (this.oConfig.EVALUATION.VALUES_SOURCE === "MEASURE") {
            var thresholdObjArray = this.oConfig.EVALUATION_VALUES;
            if (thresholdObjArray && thresholdObjArray.length) {
                for (var i = 0; i < thresholdObjArray.length; i++) {
                    if ((thresholdObjArray[i]).COLUMN_NAME && !((thresholdObjArray[i]).FIXED)) {
                        thresholdMeasuresArray.push((thresholdObjArray[i]).COLUMN_NAME);
                    }
                }
            }
        }
        return thresholdMeasuresArray;
    },
    onExit : function(){
        sap.ushell.components.tiles.indicatorTileUtils.util.abortPendingODataCalls(this.queryServiceUriODataReadRef);
        sap.ushell.components.tiles.indicatorTileUtils.util.abortPendingODataCalls(this.trendChartODataReadRef);
        sap.ushell.components.tiles.indicatorTileUtils.util.abortPendingODataCalls(this.comparisionChartODataRef);
    }

});
