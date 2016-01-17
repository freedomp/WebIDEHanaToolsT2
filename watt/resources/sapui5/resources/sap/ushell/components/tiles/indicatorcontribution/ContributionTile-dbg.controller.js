jQuery.sap.require("sap.ushell.components.tiles.generic");
(function () {
    "use strict";
    sap.ushell.components.tiles.generic.extend("tiles.indicatorcontribution.ContributionTile", {
        onInit :  function(){
            this.KPI_VALUE_REQUIRED = false;
        },

        doProcess : function(){
            var that = this;
            this.DEFINITION_DATA = this.oConfig;
            this._updateTileModel(this.DEFINITION_DATA);
            this.setTextInTile();
            this.fetchChartData(function(kpiValue){
                this.CALCULATED_KPI_VALUE = kpiValue;
                this._updateTileModel({
                    data : this.CALCULATED_KPI_VALUE
                });
                if (that.oConfig.TILE_PROPERTIES.frameType == sap.suite.ui.commons.FrameType.TwoByOne) {
                    that.oKpiTileView.oGenericTile.setFrameType(sap.suite.ui.commons.FrameType.TwoByOne);
                    that.oKpiTileView.oGenericTile.removeAllTileContent();
                    that.getView().getViewData().parentController._updateTileModel(this.getTile().getModel().getData());
                    that.getView().getViewData().deferredObj.resolve();
                } else {
                    that.oKpiTileView.oGenericTile.setFrameType(sap.suite.ui.commons.FrameType.OneByOne);
                    that.oKpiTileView.oGenericTile.removeAllTileContent();
                    that.oKpiTileView.oGenericTile.addTileContent(that.oKpiTileView.oComparisonTile);
                    var navTarget = sap.ushell.components.tiles.indicatorTileUtils.util.getNavigationTarget(that.oConfig,that.system);
                    that.oKpiTileView.oGenericTile.$().wrap("<a href ='" + navTarget + "'/>");
                    this.oKpiTileView.oGenericTile.setState(sap.suite.ui.commons.LoadState.Loaded);
                }

                this.setToolTip(null,this.CALCULATED_KPI_VALUE,"CONT");
            }, this.logError);

        },


        fetchChartData : function(fnSuccess, fnError){

            var that = this;

            try {
                /* Preparing arguments for the prepareQueryServiceUri function */
                var sUri = this.oConfig.EVALUATION.ODATA_URL;
                var entitySet = this.oConfig.EVALUATION.ODATA_ENTITYSET;
                /*var sThresholdObject =*/ that.setThresholdValues();
                if (this.oConfig.TILE_PROPERTIES.semanticMeasure){
                    /*
                     * Semantic Measure Inclusion (for Future use)
                     * var measure = [];
                     * measure.push(this.oConfig.EVALUATION.COLUMN_NAME);
                     * measure.push(this.oConfig.TILE_PROPERTIES.semanticMeasure);
                     * */
                    var measure = this.oConfig.EVALUATION.COLUMN_NAME + "," + this.oConfig.TILE_PROPERTIES.semanticMeasure;
                } else {
                    var measure = this.oConfig.EVALUATION.COLUMN_NAME;
                }
                var unitProperty = null;
                var dimension = this.oConfig.TILE_PROPERTIES.dimension;
                /*var data =*/ this.oConfig.EVALUATION_VALUES;
                var cachedValue = sap.ushell.components.tiles.indicatorTileUtils.cache.getKpivalueById(that.oConfig.TILE_PROPERTIES.id);
                if (!cachedValue) {
                    var variants = sap.ushell.components.tiles.indicatorTileUtils.util.prepareFilterStructure(this.oConfig.EVALUATION_FILTERS,this.oConfig.ADDITIONAL_FILTERS);
                    var orderByObject = {};
                    orderByObject["0"] = measure + ",asc";
                    orderByObject["1"] = measure + ",desc";
                    orderByObject["2"] = dimension + ",asc";
                    orderByObject["3"] = dimension + ",desc";
                    var orderByElement = orderByObject[this.oConfig.TILE_PROPERTIES.sortOrder || "0"].split(",");
                    var finalQuery = sap.ushell.components.tiles.indicatorTileUtils.util.prepareQueryServiceUri(that.oTileApi.url.addSystemToServiceUrl(sUri), entitySet, measure, dimension, variants, 3);
                    if (this.oConfig.TILE_PROPERTIES.semanticMeasure) {
                        finalQuery.uri += "&$top=3&$orderby=" + orderByElement[0] + " " + orderByElement[2];
                    } else {
                        finalQuery.uri += "&$top=3&$orderby=" + orderByElement[0] + " " + orderByElement[1];
                    }

                    this.comparisionChartODataRef = finalQuery.model.read(finalQuery.uri, null, null, true, function(data) {
                        var writeData = {};
                        if (data && data.results && data.results.length) {
                            if (finalQuery.unit[0]) {
                                that._updateTileModel({
                                    unit : data.results[0][finalQuery.unit[0].name]
                                });
                                unitProperty = finalQuery.unit[0].name;
                                writeData.unit = finalQuery.unit[0];
                                writeData.unit.name = finalQuery.unit[0].name;
                            }
                            dimension = sap.ushell.components.tiles.indicatorTileUtils.util.findTextPropertyForDimension(that.oTileApi.url.addSystemToServiceUrl(sUri), entitySet, dimension);
                            writeData.dimension = dimension;
                            that.oConfig.TILE_PROPERTIES.FINALVALUE = data;
                            that.oConfig.TILE_PROPERTIES.FINALVALUE = that._processDataForComparisonChart(that.oConfig.TILE_PROPERTIES.FINALVALUE,measure.split(",")[0],dimension, unitProperty);
                            if (sap.ushell.components.tiles.indicatorTileUtils.cache.getKpivalueById(that.oConfig.TILE_PROPERTIES.id)){
                                writeData = sap.ushell.components.tiles.indicatorTileUtils.cache.getKpivalueById(that.oConfig.TILE_PROPERTIES.id);
                                writeData.data = data;
                            } else {
                                writeData.data = data;
                            }
                            sap.ushell.components.tiles.indicatorTileUtils.cache.setKpivalueById(that.oConfig.TILE_PROPERTIES.id, writeData);
                            fnSuccess.call(that,that.oConfig.TILE_PROPERTIES.FINALVALUE);
                        } else if (data.results.length == 0) {
                            that.oConfig.TILE_PROPERTIES.FINALVALUE = data;
                            if (sap.ushell.components.tiles.indicatorTileUtils.cache.getKpivalueById(that.oConfig.TILE_PROPERTIES.id)){
                                writeData = sap.ushell.components.tiles.indicatorTileUtils.cache.getKpivalueById(that.oConfig.TILE_PROPERTIES.id);
                                writeData.data = data;
                            } else {
                                writeData.data = data;
                            }
                            sap.ushell.components.tiles.indicatorTileUtils.cache.setKpivalueById(that.oConfig.TILE_PROPERTIES.id, writeData);
                            fnSuccess.call(that,that.oConfig.TILE_PROPERTIES.FINALVALUE);
                            that.setNoData();
                        } else {
                            that.setNoData();
                        }
                    },function(eObject) {
                        if (eObject && eObject.response) {
                            jQuery.sap.log.error(eObject.message + " : " + eObject.request.requestUri);
                            fnError.call(that, eObject);
                        }
                    });
                } else {
                    if (cachedValue.data && cachedValue.data.results && cachedValue.data.results.length) {
                        if (cachedValue.unit){
                            that._updateTileModel({
                                unit : cachedValue.data.results[0][cachedValue.unit.name]
                            });
                            unitProperty = cachedValue.unit.name;
                        }
                        dimension = cachedValue.dimension;
                        that.oConfig.TILE_PROPERTIES.FINALVALUE = cachedValue.data;
                        that.oConfig.TILE_PROPERTIES.FINALVALUE = that._processDataForComparisonChart(that.oConfig.TILE_PROPERTIES.FINALVALUE,measure.split(",")[0],dimension, unitProperty);
                        fnSuccess.call(that,that.oConfig.TILE_PROPERTIES.FINALVALUE);
                    } else if (cachedValue.data.results.length == 0){
                        that.oConfig.TILE_PROPERTIES.FINALVALUE = cachedValue.data;
                        fnSuccess.call(that,that.oConfig.TILE_PROPERTIES.FINALVALUE);
                        that.setNoData();
                    } else {
                        that.setNoData();
                    }
                }
            } catch(e) {
                fnError.call(that,e);
            }
        },

        _processDataForComparisonChart : function(data,measure,dimension, unitProperty){
            var semanticColor = this.oConfig.TILE_PROPERTIES.semanticColorContribution;
            var finalOutput = [];
            var tempVar;
            var unitValue;
            for (var i = 0; i < data.results.length; i++) {
                var eachData = data.results[i];
                var temp = {};
                try {
                    temp.title = eachData[dimension].toString();
                } catch(e) {
                    temp.title = "";
                }

                temp.value = Number(eachData[measure]);
                var calculatedValueForScaling = Number(eachData[measure]);
                if (this.oConfig.EVALUATION.SCALING == -2) {
                    calculatedValueForScaling *= 100;
                }
                var c = this.isACurrencyMeasure(measure);
                unitValue = eachData[unitProperty];
                tempVar = sap.ushell.components.tiles.indicatorTileUtils.util.getLocaleFormattedValue(calculatedValueForScaling,this.oConfig.EVALUATION.SCALING,this.oConfig.EVALUATION.DECIMAL_PRECISION, c, unitValue);
                if (this.oConfig.EVALUATION.SCALING == -2) {
                    tempVar += " %";
                }
                temp.displayValue = tempVar.toString();

                if (typeof semanticColor === 'undefined'){
                    temp.color = "Neutral";
                } else {
                    temp.color = semanticColor;
                    /*   if(this.oConfig.EVALUATION.GOAL_TYPE === "MA"){
                        if(temp.value > eachData[semanticMeasure]){
                            temp.color= "Good";
                        }
                        else {
                            temp.color= "Error";
                        }
                    }
                    else if(this.oConfig.EVALUATION.GOAL_TYPE === "MI"){
                        if(temp.value < eachData[semanticMeasure]){
                            temp.color= "Good";
                        }
                        else {
                            temp.color= "Error";
                        }
                    }
                    else {
                        temp.color= "Neutral";
                    }*/
                }
                finalOutput.push(temp);
            }
            return finalOutput;
        },

        doDummyProcess : function(){
            var that = this;
            that.setTextInTile();
            that._updateTileModel({
                value: 8888,
                size: sap.suite.ui.commons.InfoTileSize.Auto,
                frameType: sap.suite.ui.commons.FrameType.OneByOne,
                state: sap.suite.ui.commons.LoadState.Loading,
                valueColor:sap.suite.ui.commons.InfoTileValueColor.Error,
                indicator: sap.suite.ui.commons.DeviationIndicator.None,
                title : "US Profit Margin",
                footer : "Current Quarter",
                description: "Maximum deviation",
                data: [
                       { title: "Americas", value: 10, color: "Neutral" },
                       { title: "EMEA", value: 50, color: "Neutral" },
                       { title: "APAC", value: -20, color: "Neutral" }
                       ]

            });
            this.oKpiTileView.oGenericTile.setState(sap.suite.ui.commons.LoadState.Loaded);
        }


    });
}());
