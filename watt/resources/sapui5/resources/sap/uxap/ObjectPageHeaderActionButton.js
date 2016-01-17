/*!
 * SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright
		2009-2015 SAP SE. All rights reserved
 */
sap.ui.define(['sap/m/Button','./library'],function(B,l){"use strict";var O=B.extend("sap.uxap.ObjectPageHeaderActionButton",{metadata:{library:"sap.uxap",properties:{hideText:{type:"boolean",defaultValue:true},hideIcon:{type:"boolean",defaultValue:false}}}});O.prototype.applySettings=function(s,S){if(B.prototype.applySettings){B.prototype.applySettings.call(this,s,S);}this.toggleStyleClass("sapUxAPObjectPageHeaderActionButtonHideText",this.getHideText());this.toggleStyleClass("sapUxAPObjectPageHeaderActionButtonHideIcon",this.getHideIcon());};O.prototype.setHideText=function(v,i){this.toggleStyleClass("sapUxAPObjectPageHeaderActionButtonHideText",v);return this.setProperty("hideText",v,i);};O.prototype.setHideIcon=function(v,i){this.toggleStyleClass("sapUxAPObjectPageHeaderActionButtonHideIcon",v);return this.setProperty("hideIcon",v,i);};return O;});
