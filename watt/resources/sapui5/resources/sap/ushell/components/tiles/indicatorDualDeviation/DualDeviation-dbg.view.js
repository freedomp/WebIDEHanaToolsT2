// Copyright (c) 2009-2014 SAP SE, All Rights Reserved

(function () {
    "use strict";
    /*global jQuery, sap */
    /*jslint nomen: true */

    jQuery.sap.require("sap.ushell.components.tiles.indicatorTileUtils.smartBusinessUtil");
    jQuery.sap.require("sap.ui.model.analytics.odata4analytics");
    jQuery.sap.require("sap.ca.ui.model.format.NumberFormat");
    sap.ui.getCore().loadLibrary("sap.suite.ui.commons");

    sap.ui.jsview("tiles.indicatorDualDeviation.DualDeviation", {
        getControllerName: function () {
            return "tiles.indicatorDualDeviation.DualDeviation";
        },
        createContent: function (oController) {
            var that = this;
            this.setHeight('100%');
            this.setWidth('100%');
            /*var preview =*/ this.getViewData().chip.preview;
            var header = "Lorem ipsum";
            var subheader =  "Lorem ipsum";
            var titleObj = sap.ushell.components.tiles.indicatorTileUtils.util.getTileTitleSubtitle(this.getViewData().chip);
            if (titleObj.title && titleObj.subTitle){
                 header = titleObj.title;
                 subheader = titleObj.subTitle;
            }
            var deviationTileData = {
                    subheader : subheader,
                    header : header,
                    footerNum : "",
                    footerComp : "",
                    frameType:"TwoByOne",
                    state: sap.suite.ui.commons.LoadState.Loading,
                    scale: ""
//                    actual: { value: 120, color: sap.suite.ui.commons.InfoTileValueColor.Good},
//                    targetValue: 100,
//                    thresholds: [
//                                 { value: 0, color: sap.suite.ui.commons.InfoTileValueColor.Error },
//                                 { value: 50, color: sap.suite.ui.commons.InfoTileValueColor.Critical },
//                                 { value: 150, color: sap.suite.ui.commons.InfoTileValueColor.Critical },
//                                 { value: 200, color: sap.suite.ui.commons.InfoTileValueColor.Error }
//                                 ],
//                    showActualValue: true,
//                    showTargetValue: true
            };

            that.oNumericContent = new sap.suite.ui.commons.NumericContent({
                value: "{/value}",
                scale: "{/scale}",
                unit: "{/unit}",
                indicator: "{/indicator}",
                size: "{/size}",
                formatterValue: true,
                truncateValueTo: 6,
                valueColor: "{/valueColor}"
            });

            that.oNumericTile = new sap.suite.ui.commons.TileContent({
                unit: "{/unit}",
                size: "{/size}",
                footer: "{/footerNum}",
                content: that.oNumericContent
            });

            var oBCDataTmpl = new sap.suite.ui.commons.BulletChartData({
                value: "{value}",
                color: "{color}"
            });

            that.oBCTmpl = new sap.suite.ui.commons.BulletChart({
                size: sap.suite.ui.commons.InfoTileSize.Auto,
                scale: "{/scale}",
                actual: {
                    value: "{/actual/value}",
                    color: "{/actual/color}"
                },
                targetValue: "{/targetValue}",
                actualValueLabel: "{/actualValueLabel}",
                targetValueLabel: "{/targetValueLabel}",
                thresholds: {
                    template: oBCDataTmpl,
                    path: "/thresholds"
                },
                state: "{/state}",
                showActualValue: "{/showActualValue}",
                showTargetValue: "{/showTargetValue}"
            });

            var oNVConfS = new sap.suite.ui.commons.TileContent({
                unit : "{/unit}",
                size : "{/size}",
                footer : "{/footerNum}",
                content: that.oBCTmpl
            });

            that.oGenericTile = new sap.suite.ui.commons.GenericTile({
                subheader : "{/subheader}",
                frameType : "{/frameType}",
                size : "{/size}",
                header : "{/header}",
                tileContent : [that.oNumericTile,oNVConfS]
            });

            var oGenericTileModel = new sap.ui.model.json.JSONModel();
            oGenericTileModel.setData(deviationTileData);
            that.oGenericTile.setModel(oGenericTileModel);

            return that.oGenericTile;
        }
    });
}());
