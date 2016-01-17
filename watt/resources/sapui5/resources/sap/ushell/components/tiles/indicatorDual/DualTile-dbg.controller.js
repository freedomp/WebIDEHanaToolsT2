//jQuery.sap.require("sap.ushell.components.tiles.generic");


(function () {
    /* global $ */
    "use strict";
    sap.ui.controller("tiles.indicatorDual.DualTile", {

        onAfterRendering : function(){

            var that = this;
            this.oKpiTileView = this.getView();
            this.oResourceBundle = sap.ushell.components.tiles.utils.getResourceBundleModel().getResourceBundle();
            this.viewData = {};
            that.viewData = this.oKpiTileView.getViewData();

            this.deferred_left = new jQuery.Deferred();
            this.deferred_right = new jQuery.Deferred();

            $.when(this.deferred_left,this.deferred_right).done(function(){
                that.setTextInTile();
                that.oKpiTileView.oGenericTile.setState(sap.suite.ui.commons.LoadState.Loaded);
                var navTarget = sap.ushell.components.tiles.indicatorTileUtils.util.getNavigationTarget(that.oKpiTileView.oConfig,that.system);
                that.oKpiTileView.oGenericTile.$().wrap("<a href ='" + navTarget + "'/>");

            }).fail(function(){

                that.oKpiTileView.oGenericTile.setState(sap.suite.ui.commons.LoadState.Failed);

            });

            that.tileType = that.oKpiTileView.oConfig.TILE_PROPERTIES.tileType;
            this.oTileApi = that.viewData.chip; // instance specific CHIP API
            if (this.oTileApi.preview.isEnabled()){
                this.doDummyProcess();
            } else {
                this.doProcess();
            }
        },
        setNoData : function(){
            try {
                this._updateTileModel({
                    value : "",
                    scale : "",
                    unit : "",
                    footerNum : this.oResourceBundle.getText("sb.noDataAvailable"),
                    footerComp : this.oResourceBundle.getText("sb.noDataAvailable") // in case of comparison( and mm) tiles
                });
                this.oKpiTileView.oGenericTile.setState(sap.suite.ui.commons.LoadState.Loaded);
            }catch(e){
                //do nothing
            }
        },
        doProcess : function(){

            var that = this;
            var oStaticArea = sap.ui.getCore().getUIArea(sap.ui.getCore().getStaticAreaRef());
            var leftView,rightView;

            this.system = this.oTileApi.url.getApplicationSystem();
            this.oKpiTileView.oGenericTile.setState(sap.suite.ui.commons.LoadState.Loading);
            var tileType = that.tileType.split("-")[1];
            try {
                var viewName;

                viewName = "tiles.indicatornumeric.NumericTile";
                leftView = that._getView(viewName,this.deferred_left);
                oStaticArea.addContent(leftView);

                switch (tileType){
                case "CM":
                    viewName = "tiles.indicatorcomparison.ComparisonTile";
                    rightView = that._getView(viewName,this.deferred_right);
                    oStaticArea.addContent(rightView);
                    break;

                case "CT":
                    viewName = "tiles.indicatorcontribution.ContributionTile";
                    rightView = that._getView(viewName,this.deferred_right);
                    oStaticArea.addContent(rightView);
                    break;

                case "AT":
                    viewName = "tiles.indicatordeviation.DeviationTile";
                    rightView = that._getView(viewName,this.deferred_right);
                    oStaticArea.addContent(rightView);
                    break;

                case "TT":
                    viewName = "tiles.indicatorArea.AreaChartTile";
                    rightView = that._getView(viewName,this.deferred_right);
                    oStaticArea.addContent(rightView);
                    break;

                }
            } catch(e) {
                this.logError(e);
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

        _updateTileModel : function(newData) {
            var modelData  = this.getTile().getModel().getData();
            jQuery.extend(modelData,newData);
            this.getTile().getModel().setData(modelData);
        },
        getTile : function() {
            return this.oKpiTileView.oGenericTile;
        },

        _getView : function(viewName,deferredObj){
            var viewData = this.oKpiTileView.getViewData();
            var view = sap.ui.view({
                type: sap.ui.core.mvc.ViewType.JS,
                viewName: viewName,
                viewData: jQuery.extend(true, {}, viewData, {parentController : this}, {deferredObj : deferredObj})
            });
            return view;
        },

        logError : function(err){
            this._updateTileModel({
                value : "",
                scale : "",
                unit: ""
            });
            if (this.getView().getViewData().deferredObj) {
                this.getView().getViewData().deferredObj.reject();
            }
        },

        doDummyProcess : function(){

            var that = this;
            try {
                that.setTextInTile();

                switch (that.tileType){
                case "DT-CM":
                    that._updateTileModel({
                        value: 1,
                        size: sap.suite.ui.commons.InfoTileSize.Auto,
                        frameType: sap.suite.ui.commons.FrameType.TwoByOne,
                        state: sap.suite.ui.commons.LoadState.Loading,
                        valueColor:sap.suite.ui.commons.InfoTileValueColor.Good,
                        indicator: sap.suite.ui.commons.DeviationIndicator.None,
                        title : "Liquidity Structure",
                        footer : "Current Quarter",
                        description: "Apr 1st 2013 (B$)",
                        data: [
                               { title: "Measure 1", value: 1, color: "Good"},
                               { title: "Measure 2", value: 2, color: "Good" },
                               { title: "Measure 3", value: 3, color: "Good" }
                               ]
                    });

                    break;

                case "DT-AT":
                    that._updateTileModel({
                        valueColor: "Good",
                        value : 100,
                        frameType: sap.suite.ui.commons.FrameType.TwoByOne,
                        unit: "USD",
                        actual: { value: 120, color: sap.suite.ui.commons.InfoTileValueColor.Good},
                        targetValue: 100,
                        thresholds: [
                                     { value: 0, color: sap.suite.ui.commons.InfoTileValueColor.Error },
                                     { value: 50, color: sap.suite.ui.commons.InfoTileValueColor.Critical },
                                     { value: 150, color: sap.suite.ui.commons.InfoTileValueColor.Critical },
                                     { value: 200, color: sap.suite.ui.commons.InfoTileValueColor.Error }
                                     ],
                                     showActualValue: true,
                                     showTargetValue: true
                    });

                    break;

                case "DT-CT":
                    that._updateTileModel({
                        value: 8888,
                        size: sap.suite.ui.commons.InfoTileSize.Auto,
                        frameType:sap.suite.ui.commons.FrameType.TwoByOne,
                        state: sap.suite.ui.commons.LoadState.Loading,
                        valueColor:sap.suite.ui.commons.InfoTileValueColor.Error,
                        indicator: sap.suite.ui.commons.DeviationIndicator.None,
                        title : "US Profit Margin",
                        footer : "Current Quarter",
                        description: "Maximum deviation",
                        data: [
                               { title: "Americas", value: 10, color: "Neutral",displayValue:"" },
                               { title: "EMEA", value: 50, color: "Neutral" ,displayValue:""},
                               { title: "APAC", value: -20, color: "Neutral" ,displayValue:""}
                               ]
                    });
                    break;

                case "DT-TT":
                    this._updateTileModel({

                        value: 8888,
                        size: sap.suite.ui.commons.InfoTileSize.Auto,
                        frameType:sap.suite.ui.commons.FrameType.TwoByOne,
                        state: sap.suite.ui.commons.LoadState.Loading,
                        valueColor:sap.suite.ui.commons.InfoTileValueColor.Error,
                        indicator: sap.suite.ui.commons.DeviationIndicator.None,
                        title : "Liquidity Structure",
                        footer : "Current Quarter",
                        description: "Apr 1st 2013 (B$)",

                        width: "100%",
                        height: "100%",
                        chart: {
                            color:"Good",
                            data: [
                                   {day: 0, balance: 0},
                                   {day: 30, balance: 20},
                                   {day: 60, balance: 20},
                                   {day: 100, balance: 80}
                                   ]
                        },
                        target: {
                            color:"Error",
                            data: [
                                   {day: 0, balance: 0},
                                   {day: 30, balance: 30},
                                   {day: 60, balance: 40},
                                   {day: 100, balance: 90}
                                   ]
                        },
                        maxThreshold: {
                            color: "Good",
                            data: [
                                   {day: 0, balance: 0},
                                   {day: 30, balance: 40},
                                   {day: 60, balance: 50},
                                   {day: 100, balance: 100}
                                   ]
                        },
                        innerMaxThreshold: {
                            color: "Error",
                            data: [
                                   ]
                        },
                        innerMinThreshold: {
                            color: "Neutral",
                            data: [
                                   ]
                        },
                        minThreshold: {
                            color: "Error",
                            data: [
                                   {day: 0, balance: 0},
                                   {day: 30, balance: 20},
                                   {day: 60, balance: 30},
                                   {day: 100, balance: 70}
                                   ]
                        },
                        minXValue: 0,
                        maxXValue: 100,
                        minYValue: 0,
                        maxYValue: 100,
                        firstXLabel: { label: "June 123", color: "Error"   },
                        lastXLabel: { label: "June 30", color: "Error" },
                        firstYLabel: { label: "0M", color: "Good" },
                        lastYLabel: { label: "80M", color: "Critical" },
                        minLabel: { },
                        maxLabel: { }
                    });
                    break;

                }
                //that.oKpiTileView.getViewData().deferredObj.resolve();

            } catch(e) {
                //that.oKpiTileView.getViewData().deferredObj.reject();

            }

        }

    });
}());
