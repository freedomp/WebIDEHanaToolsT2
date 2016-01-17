/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */
sap.ui.define(['./VoAggregation','./library'],function(V,l){"use strict";var P=V.extend("sap.ui.vbm.Pies",{metadata:{library:"sap.ui.vbm",properties:{posChangeable:{type:"boolean",group:"Misc",defaultValue:true},scaleChangeable:{type:"boolean",group:"Misc",defaultValue:true}},defaultAggregation:"items",aggregations:{items:{type:"sap.ui.vbm.Pie",multiple:true,singularName:"item"}},events:{click:{},contextMenu:{},drop:{}}}});P.prototype.getBindInfo=function(){var b=V.prototype.getBindInfo.apply(this,arguments);var t=this.getTemplateBindingInfo();b.P=(t)?t.hasOwnProperty("position"):true;b.S=(t)?t.hasOwnProperty("scale"):true;return b;};P.prototype.getTemplateObject=function(){var t=V.prototype.getTemplateObject.apply(this,arguments);var b=this.mBindInfo=this.getBindInfo();var v=(b.hasTemplate)?this.getBindingInfo("items").template:null;t["type"]="{00100000-2012-0004-B001-383477EA1DEB}";if(b.P){t["pos.bind"]=t.id+".P";}else{t.pos=v.getPosition();}if(b.S){t["scale.bind"]=t.id+".S";}else{t.scale=v.getScale();}t["series.bind"]=t.id+".Series";t["text.bind"]=t.id+".Series.T";t["value.bind"]=t.id+".Series.V";return t;};P.prototype.getTypeObject=function(){var t=V.prototype.getTypeObject.apply(this,arguments);var b=this.mBindInfo;if(b.P){t.A.push({"changeable":this.getPosChangeable().toString(),"name":"P","alias":"P","type":"vector"});}if(b.S){t.A.push({"changeable":this.getScaleChangeable().toString(),"name":"S","alias":"S","type":"vector"});}t.N={"name":"Series","A":[{"name":"V","alias":"V","type":"float"},{"name":"T","alias":"T","type":"string"}]};return t;};P.prototype.getActionArray=function(){var a=V.prototype.getActionArray.apply(this,arguments);var i=this.getId();if(this.mEventRegistry["click"]||this.isEventRegistered("click")){a.push({"id":i+"1","name":"click","refScene":"MainScene","refVO":i,"refEvent":"Click","AddActionProperty":[{"name":"pos"}]});}if(this.mEventRegistry["contextMenu"]||this.isEventRegistered("contextMenu")){a.push({"id":i+"2","name":"contextMenu","refScene":"MainScene","refVO":i,"refEvent":"ContextMenu"});}if(this.mEventRegistry["drop"]||this.isEventRegistered("drop")){a.push({"id":i+"3","name":"drop","refScene":"MainScene","refVO":i,"refEvent":"Drop"});}return a;};P.prototype.handleEvent=function(e){var s=e.Action.name;var f="fire"+s[0].toUpperCase()+s.slice(1);var a;if((a=this.findInstance(e.Action.instance))){if(a.mEventRegistry[s]){if(s=="contextMenu"){a.mClickPos=[e.Action.Params.Param[0]['#'],e.Action.Params.Param[1]['#']];jQuery.sap.require("sap.ui.unified.Menu");if(this.oParent.mVBIContext.m_Menus){this.oParent.mVBIContext.m_Menus.deleteMenu("DynContextMenu");}var m=new sap.ui.unified.Menu();m.vbi_data={};m.vbi_data.menuRef="CTM";m.vbi_data.VBIName="DynContextMenu";a.fireContextMenu({data:e,menu:m});}else if(s=="handleMoved"){a[f]({data:e});}else{a[f]({data:e});}}}this[f]({data:e});};return P;});