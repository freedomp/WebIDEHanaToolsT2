// Copyright (c) 2009-2014 SAP SE, All Rights Reserved

//Comparison Tile
(function () {
    "use strict";
    /*global jQuery, sap */
    /*jslint nomen: true */

    jQuery.sap.require("sap.ushell.components.tiles.indicatorTileUtils.smartBusinessUtil");
    jQuery.sap.require("sap.ui.model.analytics.odata4analytics");
    jQuery.sap.require("sap.ca.ui.model.format.NumberFormat");
    sap.ui.getCore().loadLibrary("sap.suite.ui.commons");

    sap.ui.jsview("tiles.indicatorcomparison.ComparisonTile", {
        getControllerName: function () {
            return "tiles.indicatorcomparison.ComparisonTile";
        },
        createContent: function (oController) {
            this.setHeight('100%');
            this.setWidth('100%');

            var that = this;
            that.tileData;

            that.oGenericTileData = {
//                    subheader : "Lorem Ipsum SubHeader",
//                    header : "Lorem Ipsum Header",
//                    value: 8888,
//                    size: sap.suite.ui.commons.InfoTileSize.Auto,
//                    frameType:"OneByOne",
//                    state: sap.suite.ui.commons.LoadState.Loading,
//                    valueColor:sap.suite.ui.commons.InfoTileValueColor.Error,
//                    indicator: sap.suite.ui.commons.DeviationIndicator.None,
//                    title : "US Profit Margin",
//                    footer : "Current Quarter",
//                    description: "Maximum deviation",
//                    data: [
//                           { title: "Americas", value: 10, color: "Neutral" },
//                           { title: "EMEA", value: 50, color: "Neutral" },
//                           { title: "APAC", value: -20, color: "Neutral" }
//                           ],
            };

            that.oCmprsDataTmpl = new sap.suite.ui.commons.ComparisonData({
                title : "{title}",
                value : "{value}",
                color : "{color}",
                displayValue : "{displayValue}"
            });

            that.oCmprsChrtTmpl = new sap.suite.ui.commons.ComparisonChart(
                    {
                        size : "{/size}",
                        scale : "{/scale}",
                        data : {
                            template : that.oCmprsDataTmpl,
                            path : "/data"
                        }
                    });

            that.oComparisonTile = new sap.suite.ui.commons.TileContent({
                unit : "{/unit}",
                size : "{/size}",
                footer : "{/footerComp}",
                content : that.oCmprsChrtTmpl
            });


            that.oGenericTile = new sap.suite.ui.commons.GenericTile({
                subheader : "{/subheader}",
                frameType : "{/frameType}",
                size : "{/size}",
                header : "{/header}",
                tileContent : [that.oComparisonTile]//that.oComparisonTile]
            });


            that.oGenericTileModel = new sap.ui.model.json.JSONModel();
            that.oGenericTileModel.setData(that.oGenericTileData);
            that.oGenericTile.setModel(that.oGenericTileModel);

            return that.oGenericTile;


        }
    });
}());
