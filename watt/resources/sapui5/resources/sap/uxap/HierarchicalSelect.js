/*!
 * SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright
		2009-2015 SAP SE. All rights reserved
 */
sap.ui.define(['jquery.sap.global','sap/m/Select','./library'],function(q,S,l){"use strict";var H=S.extend("sap.uxap.HierarchicalSelect",{metadata:{library:"sap.uxap",properties:{upperCase:{type:"boolean",group:"Appearance",defaultValue:false}}}});H.POPOVER_MIN_WIDTH_REM=11;H.prototype.onAfterRenderingPicker=function(){S.prototype.onAfterRenderingPicker.call(this);var i=this.getItems()||[];i.forEach(function(I){var c=(I.data("secondLevel")===true)?"sapUxAPHierarchicalSelectSecondLevel":"sapUxAPHierarchicalSelectFirstLevel";I.$().addClass(c);},this);};H.prototype.setUpperCase=function(v,s){this.setProperty("upperCase",v,s);this.toggleStyleClass("sapUxAPHierarchicalSelectUpperCase",v);var p=this.getAggregation("picker");if(p){p.toggleStyleClass("sapMSltPickerFirstLevelUpperCase",v);if(!s){p.invalidate();}}return this;};H.prototype.onsapenter=S.prototype.onsapspace;["onsapup","onsappageup","onsappagedown","onsaphome","onsapend"].forEach(function(n){H.prototype[n]=function(e){S.prototype[n].call(this,e);e.stopPropagation();};});H.prototype._createDialog=function(){var d=S.prototype._createDialog.call(this);d.getCustomHeader().addStyleClass("sapUxAPHierarchicalSelect");return d;};H.prototype._decoratePopover=function(p){S.prototype._decoratePopover.call(this,p);p._adaptPositionParams=function(){this._marginTop=0;this._marginLeft=0;this._marginRight=0;this._marginBottom=0;this._arrowOffset=0;this._offsets=["0 0","0 0","0 0","0 0"];this._myPositions=["end bottom","end center","end top","begin center"];this._atPositions=["end top","end center","end bottom","begin center"];};if(sap.ui.Device.system.tablet||sap.ui.Device.system.desktop){var r=q.position.scrollbarWidth();if(r>0){p.setOffsetX(r);}}};H.prototype._onAfterRenderingPopover=function(){S.prototype._onAfterRenderingPopover.call(this);if(sap.ui.Device.system.tablet||sap.ui.Device.system.desktop){var p=this.getPicker(),m=p.getDomRef().style.minWidth;if(q.sap.endsWith(m,"rem")){m=m.substring(0,m.length-3);var M=parseFloat(m);if(M<H.POPOVER_MIN_WIDTH_REM){p._setMinWidth(H.POPOVER_MIN_WIDTH_REM+"rem");}}}};return H;});
