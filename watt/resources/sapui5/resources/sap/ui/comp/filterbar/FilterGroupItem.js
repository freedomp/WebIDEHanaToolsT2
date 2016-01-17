/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */
sap.ui.define(['jquery.sap.global','sap/m/Label','./FilterItem','sap/ui/comp/library','sap/ui/core/TooltipBase'],function(q,L,F,l,T){"use strict";var a=F.extend("sap.ui.comp.filterbar.FilterGroupItem",{metadata:{library:"sap.ui.comp",properties:{groupTitle:{type:"string",group:"Misc",defaultValue:null},groupName:{type:"string",group:"Misc",defaultValue:null},visibleInAdvancedArea:{type:"boolean",group:"Misc",defaultValue:false}}}});a.prototype.init=function(){this.setVisibleInAdvancedArea(false);};a.prototype.setGroupTitle=function(v){this.setProperty("groupTitle",v);this.fireChange({propertyName:"groupTitle"});};a.prototype.setVisibleInAdvancedArea=function(v){this.setVisibleInFilterBar(v);};a.prototype.getVisibleInAdvancedArea=function(){return this.getVisibleInFilterBar();};a.prototype.destroy=function(){F.prototype.destroy.apply(this,arguments);};return a;},true);
