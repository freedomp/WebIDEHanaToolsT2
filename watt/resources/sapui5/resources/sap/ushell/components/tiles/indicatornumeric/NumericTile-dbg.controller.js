(function () {
    "use strict";
    jQuery.sap.require("sap.ushell.components.tiles.generic");
    sap.ushell.components.tiles.generic.extend("tiles.indicatornumeric.NumericTile", {

        onInit :  function(){
            this.KPI_VALUE_REQUIRED = true;
        },

        doProcess : function(kpiValue,sThresholdObject){

            var that = this;
            this.CALCULATED_KPI_VALUE = kpiValue;
            /*var evalValue =*/ this.DEFINITION_DATA.EVALUATION_VALUES;
            var applyColor = this.getTrendColor(sThresholdObject);
            var trendIndicator = this.getTrendIndicator(sThresholdObject.trendValue);
            var oScaledValue = "";
            var calculatedValueForScaling = this.CALCULATED_KPI_VALUE;
            if (this.oConfig.EVALUATION.SCALING == -2){
                calculatedValueForScaling *= 100;
                this.getView().oNVConfContS.setFormatterValue(false);
            }
            var c = this.isACurrencyMeasure(this.oConfig.EVALUATION.COLUMN_NAME);
            oScaledValue = sap.ushell.components.tiles.indicatorTileUtils.util.getLocaleFormattedValue(Number(calculatedValueForScaling),this.oConfig.EVALUATION.SCALING,this.oConfig.EVALUATION.DECIMAL_PRECISION, c, this.CURRENCY_CODE);
            if (this.oConfig.EVALUATION.SCALING == -2) {
                this._updateTileModel({
                    scale : "%"
                });
            }
            this._updateTileModel({
                value : oScaledValue.toString(),
                valueColor : applyColor,
                indicator : trendIndicator
            });
            if (that.oConfig.TILE_PROPERTIES.frameType == sap.suite.ui.commons.FrameType.OneByOne){
                var navTarget = sap.ushell.components.tiles.indicatorTileUtils.util.getNavigationTarget(that.oConfig,that.system);
                that.oKpiTileView.oGenericTile.$().wrap("<a href ='" + navTarget + "'/>");
                this.oKpiTileView.oGenericTile.setState(sap.suite.ui.commons.LoadState.Loaded);
                this.setToolTip(applyColor,calculatedValueForScaling,"NT");

            } else {
                that.getView().getViewData().parentController._updateTileModel(this.getTile().getModel().getData());
                that.getView().getViewData().deferredObj.resolve();
            }
            this.setToolTip(applyColor,calculatedValueForScaling,"NT");

        },
        doDummyProcess : function(){

            var that = this;
            this.setTextInTile();
            that._updateTileModel({
                value : "10.34",
                scale : "M",
                valueColor : sap.suite.ui.commons.InfoTileValueColor.Neutral,
                indicator : sap.suite.ui.commons.DeviationIndicator.None
            });
            this.oKpiTileView.oGenericTile.setState(sap.suite.ui.commons.LoadState.Loaded);

        }

    });
}());
