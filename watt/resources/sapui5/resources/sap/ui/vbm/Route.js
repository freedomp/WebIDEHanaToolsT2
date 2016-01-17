/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */
sap.ui.define(['./VoBase','./library'],function(V,l){"use strict";var R=V.extend("sap.ui.vbm.Route",{metadata:{library:"sap.ui.vbm",properties:{position:{type:"string",group:"Misc",defaultValue:null},color:{type:"string",group:"Misc",defaultValue:'RGB(0;0;0)'},start:{type:"string",group:"Misc",defaultValue:'0'},end:{type:"string",group:"Misc",defaultValue:'0'},linewidth:{type:"string",group:"Misc",defaultValue:'5'},dotcolor:{type:"string",group:"Misc",defaultValue:'RGB(0;0;0)'},dotbordercolor:{type:"string",group:"Misc",defaultValue:'RGB(0;0;0)'},colorBorder:{type:"string",group:"Misc"},lineDash:{type:"string",group:"Misc"},dotwidth:{type:"string",group:"Misc",defaultValue:'0'},routetype:{type:"sap.ui.vbm.RouteType",group:"Misc",defaultValue:'Straight'}},aggregations:{dragSource:{type:"sap.ui.vbm.DragSource",multiple:true,singularName:"dragSource"},dropTarget:{type:"sap.ui.vbm.DropTarget",multiple:true,singularName:"dropTarget"}},events:{}}});R.prototype.openContextMenu=function(m){this.oParent.openContextMenu("Route",this,m);};R.prototype.getDataElement=function(){var e=V.prototype.getDataElement.apply(this,arguments);var b=this.oParent.mBindInfo;if(b.P){if(this.getRoutetype()=='Geodesic'){var p=this.getPosition().split(";");var a=p.length;var g=p.slice(0,3);var c=p.slice(a-3,a);var r=calcGeodesicRoute(g,c);e.P=g[0]+';'+g[1]+';0.0;'+r+c[0]+';'+c[1]+';0.0';}else{e.P=this.getPosition();}}if(b.C){e.C=this.getColor();}if(b.ST){e.ST=this.getStart();}if(b.ED){e.ED=this.getEnd();}if(b.LW){e.LW=this.getLinewidth();}if(b.DC){e.DC=this.getDotcolor();}if(b.DBC){e.DBC=this.getDotbordercolor();}if(b.CB){var d=this.getColorBorder();if(d!=undefined&&d!=""){e.CB=d;}}if(b.LD){var f=this.getLineDash();if(f!=undefined&&f!=""){e.LD=f;}}if(b.DW){e.DW=this.getDotwidth();}if(b.DS||b.DT){e.N=this.getDragDropDefs();}return e;};R.prototype.handleChangedData=function(e){if(e.P){this.setPosition(e.P);}};return R;});
function cross(a,b){var c=new Array(4);c[1]=a[2]*b[3]-a[3]*b[2];c[2]=a[3]*b[1]-a[1]*b[3];c[3]=a[1]*b[2]-a[2]*b[1];return c;}
function dot(a,b){var c=0;c=a[1]*b[1]+a[2]*b[2]+a[3]*b[3];return c;}
function radians(d){return d*Math.PI/180;}
function degrees(r){return r*180/Math.PI;}
function calcGeodesicRoute(g,a){var x=new Array(4);var b=new Array(4);var u=new Array(4);var c=new Array(4);var v=new Array(4);x[1]=Math.cos(radians(g[1]))*Math.cos(radians(g[0]));x[2]=Math.cos(radians(g[1]))*Math.sin(radians(g[0]));x[3]=Math.sin(radians(g[1]));b[1]=Math.cos(radians(a[1]))*Math.cos(radians(a[0]));b[2]=Math.cos(radians(a[1]))*Math.sin(radians(a[0]));b[3]=Math.sin(radians(a[1]));u=cross(x,b);var l=Math.sqrt(dot(u,u));c[1]=u[1]/l;c[2]=u[2]/l;c[3]=u[3]/l;v=cross(c,x);var f=new Array(101);var d=new Array(201);for(var i=0;i<=100;i++){f[i]=new Array(4);d[i]=new Array(4);}var e=Math.acos(dot(x,b));var r="";for(var i=0;i<=100;i++){var t=i/100*e;f[i][0]=0;f[i][1]=Math.cos(t)*x[1]+Math.sin(t)*v[1];f[i][2]=Math.cos(t)*x[2]+Math.sin(t)*v[2];f[i][3]=Math.cos(t)*x[3]+Math.sin(t)*v[3];d[i][0]=0;d[i][1]=degrees(Math.atan2(f[i][2],f[i][1]));d[i][2]=degrees(Math.asin(f[i][3]));r+=d[i][1]+';'+d[i][2]+'; 0 '+';';}return r;}
