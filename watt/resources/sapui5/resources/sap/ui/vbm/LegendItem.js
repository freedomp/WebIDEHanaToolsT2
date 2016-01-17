/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */
sap.ui.define(['sap/ui/core/Element','./library'],function(E,l){"use strict";var L=E.extend("sap.ui.vbm.LegendItem",{metadata:{library:"sap.ui.vbm",properties:{color:{type:"string",group:"Misc",defaultValue:''},image:{type:"string",group:"Misc",defaultValue:null},text:{type:"string",group:"Misc",defaultValue:null}},events:{click:{parameters:{data:{type:"object"}}}}}});L.prototype.getDataElement=function(){var e={};var c,i,t,a;if((c=this.getColor())){e.C=c;}if((i=this.getImage())){e.I=i;}if((t=this.getText())){e.T=t;}if((a=this.getTooltip())){e.TT=a;}return e;};return L;});
