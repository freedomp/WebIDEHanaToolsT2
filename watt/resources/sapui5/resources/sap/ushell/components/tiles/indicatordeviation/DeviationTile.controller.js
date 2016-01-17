(function(){"use strict";jQuery.sap.require("sap.ushell.components.tiles.generic");sap.ushell.components.tiles.generic.extend("tiles.indicatordeviation.DeviationTile",{onInit:function(){this.KPI_VALUE_REQUIRED=true;},doProcess:function(k,t){var a=this;var f,b;var d=Number(k);var e=this.setThresholdValues();if(this.oConfig.EVALUATION.SCALING==-2){d*=100;}var c=this.isACurrencyMeasure(this.oConfig.EVALUATION.COLUMN_NAME);b=sap.ushell.components.tiles.indicatorTileUtils.util.getLocaleFormattedValue(Number(d),this.oConfig.EVALUATION.SCALING,this.oConfig.EVALUATION.DECIMAL_PRECISION,c,this.CURRENCY_CODE);this.CALCULATED_KPI_VALUE=Number(k);var g={};var h=this.getThresholdsObjAndColor(e).returnColor;var i={value:Number(k),color:h};g.actualValueLabel=b.toString();g.actual=i;g.thresholds=[];g.thresholds=this.getThresholdsObjAndColor(e).arrObj;var j=this.DEFINITION_DATA.EVALUATION_VALUES;if(this.DEFINITION_DATA.EVALUATION.VALUES_SOURCE=="MEASURE"){var l=Number(e.targetValue);if(this.oConfig.EVALUATION.SCALING==-2){l*=100;}c=this.isACurrencyMeasure(this.oConfig.EVALUATION.COLUMN_NAME);f=sap.ushell.components.tiles.indicatorTileUtils.util.getLocaleFormattedValue(l,this.oConfig.EVALUATION.SCALING,this.oConfig.EVALUATION.DECIMAL_PRECISION,c,this.CURRENCY_CODE);g.targetValue=Number(e.targetValue);g.targetValueLabel=f.toString();}else{for(var m=0;m<j.length;m++){if(j[m].TYPE==="TA"){var l=Number(j[m].FIXED);if(this.oConfig.EVALUATION.SCALING==-2){l*=100;}c=this.isACurrencyMeasure(this.oConfig.EVALUATION.COLUMN_NAME);f=sap.ushell.components.tiles.indicatorTileUtils.util.getLocaleFormattedValue(l,this.oConfig.EVALUATION.SCALING,this.oConfig.EVALUATION.DECIMAL_PRECISION,c,this.CURRENCY_CODE);g.targetValue=Number(j[m].FIXED);g.targetValueLabel=f.toString();}}}if(this.oConfig.EVALUATION.SCALING==-2){g.scale="%";}this._updateTileModel(g);if(this.DEFINITION_DATA.TILE_PROPERTIES.frameType==sap.suite.ui.commons.FrameType.TwoByOne){a.getView().getViewData().parentController._updateTileModel(this.getTile().getModel().getData());a.getView().getViewData().deferredObj.resolve();}else{var n=sap.ushell.components.tiles.indicatorTileUtils.util.getNavigationTarget(a.oConfig,a.system);a.oKpiTileView.oGenericTile.$().wrap("<a href ='"+n+"'/>");this.oKpiTileView.oGenericTile.setState(sap.suite.ui.commons.LoadState.Loaded);}this.setToolTip(h,d,"DT");},getThresholdsObjAndColor:function(t){try{var T={};T.arrObj=[];T.returnColor=sap.suite.ui.commons.InfoTileValueColor.Neutral;var i=this.DEFINITION_DATA.EVALUATION.GOAL_TYPE;var w,c,a,b;if(i==="MI"){a=Number(t.criticalHighValue)||0;b=Number(t.warningHighValue)||0;if(a&&b){a=window.parseFloat(a);b=window.parseFloat(b);T.arrObj.push({value:a,color:sap.suite.ui.commons.InfoTileValueColor.Error});T.arrObj.push({value:b,color:sap.suite.ui.commons.InfoTileValueColor.Critical});if(this.CALCULATED_KPI_VALUE<b){T.returnColor=sap.suite.ui.commons.InfoTileValueColor.Good;}else if(this.CALCULATED_KPI_VALUE<=a){T.returnColor=sap.suite.ui.commons.InfoTileValueColor.Critical;}else{T.returnColor=sap.suite.ui.commons.InfoTileValueColor.Error;}}}else if(i==="MA"){c=Number(t.criticalLowValue)||0;w=Number(t.warningLowValue)||0;if(c&&w){c=window.parseFloat(c);w=window.parseFloat(w);T.arrObj.push({value:c,color:sap.suite.ui.commons.InfoTileValueColor.Error});T.arrObj.push({value:w,color:sap.suite.ui.commons.InfoTileValueColor.Critical});if(this.CALCULATED_KPI_VALUE<c){T.returnColor=sap.suite.ui.commons.InfoTileValueColor.Error;}else if(this.CALCULATED_KPI_VALUE<=w){T.returnColor=sap.suite.ui.commons.InfoTileValueColor.Critical;}else{T.returnColor=sap.suite.ui.commons.InfoTileValueColor.Good;}}}else{a=Number(t.criticalHighValue)||0;b=Number(t.warningHighValue)||0;c=Number(t.criticalLowValue)||0;w=Number(t.warningLowValue)||0;if(w&&b&&c&&c){a=window.parseFloat(a);b=window.parseFloat(b);w=window.parseFloat(w);c=window.parseFloat(c);T.arrObj.push({value:a,color:sap.suite.ui.commons.InfoTileValueColor.Error});T.arrObj.push({value:b,color:sap.suite.ui.commons.InfoTileValueColor.Critical});T.arrObj.push({value:w,color:sap.suite.ui.commons.InfoTileValueColor.Critical});T.arrObj.push({value:c,color:sap.suite.ui.commons.InfoTileValueColor.Error});if(this.CALCULATED_KPI_VALUE<c||this.CALCULATED_KPI_VALUE>a){T.returnColor=sap.suite.ui.commons.InfoTileValueColor.Error;}else if((this.CALCULATED_KPI_VALUE>=c&&this.CALCULATED_KPI_VALUE<=w)||(this.CALCULATED_KPI_VALUE>=b&&this.CALCULATED_KPI_VALUE<=a)){T.returnColor=sap.suite.ui.commons.InfoTileValueColor.Critical;}else{T.returnColor=sap.suite.ui.commons.InfoTileValueColor.Good;}}}return T;}catch(e){this.logError(e);}},doDummyProcess:function(){var t=this;this.setTextInTile();t._updateTileModel({actual:{value:120,color:sap.suite.ui.commons.InfoTileValueColor.Good},targetValue:100,thresholds:[{value:0,color:sap.suite.ui.commons.InfoTileValueColor.Error},{value:50,color:sap.suite.ui.commons.InfoTileValueColor.Critical},{value:150,color:sap.suite.ui.commons.InfoTileValueColor.Critical},{value:200,color:sap.suite.ui.commons.InfoTileValueColor.Error}],showActualValue:true,showTargetValue:true});this.oKpiTileView.oGenericTile.setState(sap.suite.ui.commons.LoadState.Loaded);}});}());
