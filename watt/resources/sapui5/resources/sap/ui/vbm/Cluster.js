/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */
sap.ui.define(['jquery.sap.global','./library','sap/ui/core/Control','sap/ui/core/IconPool'],function(q,l,C,I){"use strict";var b=C.extend("sap.ui.vbm.Cluster",{metadata:{library:"sap.ui.vbm",properties:{color:{type:"sap.ui.core.CSSColor",group:"Misc",defaultValue:null},icon:{type:"string",group:"Misc",defaultValue:null},text:{type:"string",group:"Misc",defaultValue:null},type:{type:"sap.ui.vbm.SemanticType",group:"Behavior",defaultValue:sap.ui.vbm.SemanticType.None}}}});q.sap.require("sap.ui.core.IconPool");q.sap.require("sap.ui.core.theming.Parameters");b.prototype.exit=function(){};b.prototype.init=function(){};b.prototype.onAfterRendering=function(){if(this.$oldContent.length>0){this.$().append(this.$oldContent);}var a=this.getColor();var t=this.getType();if(a&&t==sap.ui.vbm.SemanticType.None){var d=this.getId()+"-"+"backgroundcircle";var e=d+"-"+"innercircle";var f=document.getElementById(d);var i=document.getElementById(e);var c=q(f).css("border-bottom-color");var r=b.prototype.string2rgba(c);r="rgba("+r[0]+","+r[1]+","+r[2]+","+0.5+")";q(f).css("border-color",r);q(i).css("border-color",r);}};b.prototype.onBeforeRendering=function(){this.$oldContent=sap.ui.core.RenderManager.findPreservedContent(this.getId());};b.prototype.setColor=function(c){this.setProperty("color",c);};b.prototype.setIcon=function(i){this.setProperty("icon",i);};b.prototype.setText=function(t){this.setProperty("text",t);};b.prototype.string2rgba=function(a){var c;if((c=/^rgb\(([\d]+)[,;]\s*([\d]+)[,;]\s*([\d]+)\)/.exec(a))){return[+c[1],+c[2],+c[3],1.0,0];}else{return[94,105,110];}};return b;});