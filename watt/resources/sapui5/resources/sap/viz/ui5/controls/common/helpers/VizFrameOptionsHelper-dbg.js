/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

sap.ui.define(function() {
	"use strict";

	var VizFrameOptionsHelper = {};
	
	VizFrameOptionsHelper.decorateFiori = function(options, feeds, isCreated) {
	    VizFrameOptionsHelper._processCategoryTicker(options, feeds, isCreated);
	}
	
	VizFrameOptionsHelper.decorateBullet = function(options, feeds) {
	    if (!feeds || feeds.length === 0) {
	        return;
	    }
	    jQuery.extend(true, options.properties, {plotArea:{}});
	    var plotArea = options.properties.plotArea;
	
	    if(plotArea.colorPalette ){
	        if(!plotArea.actualColor || plotArea.actualColor.length === 0){
	            plotArea.actualColor = [plotArea.colorPalette[0]];
	        }
	        if(!plotArea.additionalColor || plotArea.additionalColor.length === 0){
	            plotArea.additionalColor = [plotArea.colorPalette[1]];
	        }
	    }
	
	    var num = feeds.length;
	  
	    var bOldStyle = false;
	    var primaryNum = 0;
	    var otherNum = 0;
	    var bHasColor = 0;
	    for(var i = 0; !bOldStyle && i < num; ++i){
	        var id = feeds[i].getUid();
	        var values = feeds[i].getValues();
	        
	        if(values && values.length){
	            switch (id){
	                case 'color':
	                    bHasColor = true;
	                    break;
	                case 'primaryValues':
	                    bOldStyle = true;
	                    break;
	                case 'actualValues':
	                    primaryNum += values.length;
	                    break;
	                case 'additionalValues':  
	                case 'forecastValues':
	                    otherNum += values.length;
	                    break;
	                default:
	                    break;           
	            }
	        }                
	    }
	    
	    if(bOldStyle || (!bHasColor && primaryNum < 2) || otherNum ===0){
	        if(!plotArea.additionalColor){
	            plotArea.additionalColor = ["sapUiChartPaletteSequentialHue2Light1"];
	        }
	        if(!plotArea.forecastColor){
	            plotArea.forecastColor = ["sapUiChartPaletteSequentialNeutralLight3"];
	        }
	        if(!plotArea.actualColor){
	            plotArea.actualColor = ["sapUiChartPaletteSequentialHue1Light1",
	                                "sapUiChartPaletteQualitativeHue2",
	                               "sapUiChartPaletteQualitativeHue3",
	                               "sapUiChartPaletteQualitativeHue4",
	                                "sapUiChartPaletteQualitativeHue5",
	                                 "sapUiChartPaletteQualitativeHue6",
	                                "sapUiChartPaletteQualitativeHue7",
	                                "sapUiChartPaletteQualitativeHue8",
	                               "sapUiChartPaletteQualitativeHue9",
	                                "sapUiChartPaletteQualitativeHue10",
	                                "sapUiChartPaletteQualitativeHue11"];
	        }
	
	    }else{
	        if(!plotArea.additionalColor){
	            plotArea.additionalColor = ["sapUiChartPaletteSequentialHue1Light2",
	                                    "sapUiChartPaletteSequentialHue2Light2",
	                                    "sapUiChartPaletteSequentialHue3Light2",
	                                    "sapUiChartPaletteSequentialNeutralLight2"];
	        }
	        if(!plotArea.forecastColor){
	            plotArea.forecastColor =["sapUiChartPaletteSequentialHue1Light2",
	                                 "sapUiChartPaletteSequentialHue2Light2",
	                                 "sapUiChartPaletteSequentialHue3Light2",
	                                 "sapUiChartPaletteSequentialNeutralLight2"];
	        }
	        if(!plotArea.actualColor){
	            plotArea.actualColor = ["sapUiChartPaletteSequentialHue1",
	                                "sapUiChartPaletteSequentialHue2",
	                                "sapUiChartPaletteSequentialHue3",
	                                "sapUiChartPaletteSequentialNeutral"];
	        }
	    }
	    return options;
	}

	VizFrameOptionsHelper._processCategoryTicker = function(options, feeds, isCreated){
	    if (!feeds || feeds.length === 0) {
	        return;
	    }

	    var chartName = options.type;
	
	    jQuery.extend(true, options.properties, {categoryAxis:{axisTick:{}}});
	    var axis2TickProp
	    if(chartName === 'info/heatmap'){
	        jQuery.extend(true, options.properties, {categoryAxis2:{axisTick:{}}});
	        axis2TickProp =  options.properties.categoryAxis2.axisTick;
	    }
	    var axisTickProp = options.properties.categoryAxis.axisTick;
	    
	    if(axisTickProp.visible === true || axisTickProp.visible === false){
	        if(options.type !== 'info/heatmap'){
	            return;
	        }
	        if(axis2TickProp.visible === true || axis2TickProp.visible === false) {
	            return;
	        }
	    }
	
	    var len = feeds.length;
	    var tickVisible = true;
	    var i, id, values, j;
	
	
	    var measureNum = 0, barNum = 1, colorNum = 0, axisNum = 0, actualNum = 0,axis2Num = 0,
	        hasMNDColor = false, hasMNDCategory = false, valueAxis2Num = 0, valueAxis2BarNum = 0;
	    for( i = 0; i < len; ++i){
	        id = feeds[i].getUid();
	        values = feeds[i].getValues();
	        if((id === "primaryValues" || id === 'valueAxis') && values){
	            measureNum = values.length;
	        }else if(id === 'color' && values){
	            colorNum = values.length;
	            for(var j = 0; j < colorNum; ++j){
	                if(values[j] === "MeasureNamesDimension"){
	                    hasMNDColor = true;
	                }
	            }
	        } else if((id === 'axisLabels' || id === "categoryAxis") && values){
	            axisNum = values.length;
	            for(j = 0; j < axisNum; ++j){
	                if(values[j] === "MeasureNamesDimension"){
	                    hasMNDCategory = true;
	                }
	            }
	        } else if(id === 'actualValues' && values){
	            actualNum = values.length;
	        }else if(id === "valueAxis2" && values){
	            valueAxis2Num = values.length;
	            
	        } else if(id === 'categoryAxis2' && values){
	            axis2Num = values.length;
	        }
	    }
	    var shapeArr, num;
	    var plotAreaProp = options.properties.plotArea;
	    if( plotAreaProp && plotAreaProp.dataShape &&
	            plotAreaProp.dataShape.primaryAxis){
	        shapeArr = plotAreaProp.dataShape.primaryAxis;
	        num = Math.min(shapeArr.length, measureNum);
	        barNum = 0;
	        for(i = 0; i < num; ++i){
	            if(shapeArr[i] === 'bar'){
	                barNum++;
	            }
	        }
	    }
	    
	    if( plotAreaProp && plotAreaProp.dataShape &&
	            plotAreaProp.dataShape.secondaryAxis){
	        shapeArr = plotAreaProp.dataShape.secondaryAxis;
	        num = Math.min(shapeArr.length, measureNum);
	        valueAxis2BarNum = 0;
	        for(i = 0; i < num; ++i){
	            if(shapeArr[i] === 'bar'){
	                valueAxis2BarNum++;
	            }
	        }
	    }
	
	
	    if(chartName === 'info/column' || chartName ==='info/bar'){                   
	        if(!(colorNum > 1 || axisNum > 1 || (colorNum === 1 && !hasMNDColor) || 
	                (colorNum === 1 && hasMNDColor && measureNum > 1) || 
	                (!hasMNDCategory && !hasMNDColor && measureNum > 1 ))){
	            tickVisible = false;
	        }
	    }else if(chartName ===  'info/stacked_bar' || chartName === 'info/stacked_column' ||
	            chartName ===  "info/100_stacked_bar" ||    chartName === "info/100_stacked_column" ){
	        if(axisNum <= 1){
	            tickVisible = false;
	        }
	    }else if(chartName === "info/stacked_combination" || chartName ===  "info/horizontal_stacked_combination" ||
	            chartName ===  'info/dual_horizontal_stacked_combination' || chartName === "info/dual_stacked_combination"){
	        if(((barNum >= 0 && valueAxis2BarNum === 0) ||( barNum == 0  &&  valueAxis2BarNum  >= 0)) && axisNum <= 1){
	            tickVisible = false;
	        }	        
	     }else if( chartName ===  'info/combination'){
	       if(barNum === 1 && (colorNum === 0 || (colorNum === 1 && hasMNDColor ))){
	           tickVisible = false;
	       }
	     }else if(chartName ===  'info/bullet' || chartName === "info/vertical_bullet"){
	        if( axisNum <= 1 && colorNum === 0  && actualNum <= 1){
	            tickVisible = false;
	        }
	     }
	    
	     if(chartName === "info/heatmap"){
	         if( !(axisTickProp.visible === true || axisTickProp.visible === false)){
	             axisTickProp.visible = (axisNum > 1);
	         }  
	         if( !(axis2TickProp.visible === true || axis2TickProp.visible === false)){
	             axis2TickProp.visible = (axis2Num > 1);
	         }   
	     }else{
	         axisTickProp.visible = tickVisible;
	     }
	};

	return VizFrameOptionsHelper;
});
