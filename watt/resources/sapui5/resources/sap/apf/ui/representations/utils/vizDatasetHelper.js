/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP SE. All rights reserved
 */
jQuery.sap.declare("sap.apf.ui.representations.utils.vizDatasetHelper");jQuery.sap.require("sap.apf.core.constants");
sap.apf.ui.representations.utils.VizDatasetHelper=function(i){var g=function(k){var n;var s=sap.apf.core.constants.representationMetadata.kind;if(!i){if(k===s.LEGEND){n=2;}else if(k===s.XAXIS||k===s.SECTORCOLOR){n=1;}}else{if(k===s.REGIONCOLOR){n=1;}else if(k===s.REGIONSHAPE){n=2;}}return n;};this.getDataset=function(p){this.parameter=p;var d=[];var m=[];this.parameter.dimensions.forEach(function(a,b){if(a.kind!==undefined){d[b]={name:a.name,value:'{'+a.value+'}',axis:g(a.kind)};}else{d[b]={name:a.name,value:'{'+a.value+'}',axis:b===0?1:2};}});this.parameter.measures.forEach(function(a,b){var A;if(i){A=sap.apf.ui.utils.CONSTANTS.axisTypes.GROUP;}else{A=sap.apf.ui.utils.CONSTANTS.axisTypes.AXIS;}if(a.kind!==undefined){m[b]={name:a.name,value:'{'+a.value+'}'};var s=sap.apf.core.constants.representationMetadata.kind;switch(a.kind){case s.XAXIS:m[b][A]=1;break;case s.YAXIS:if(!i){m[b][A]=1;}else{m[b][A]=2;}break;case s.SECTORSIZE:m[b][A]=1;break;case s.BUBBLEWIDTH:m[b][A]=3;break;case s.BUBBLEHEIGHT:m[b][A]=4;break;default:break;}}else{m[b]={name:a.name,value:'{'+a.value+'}'};m[b][A]=b+1;}});var f={dimensions:d,measures:m,data:{path:"/data"}};return f;};};
