/*!
 * SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2013 SAP AG. All rights reserved
 */
jQuery.sap.declare("sap.suite.ui.commons.FacetOverview");jQuery.sap.require("sap.suite.ui.commons.library");jQuery.sap.require("sap.ui.core.Control");sap.ui.core.Control.extend("sap.suite.ui.commons.FacetOverview",{metadata:{deprecated:true,library:"sap.suite.ui.commons",properties:{"title":{type:"string",group:"Misc",defaultValue:null},"quantity":{type:"int",group:"Misc",defaultValue:-1},"width":{type:"sap.ui.core.CSSSize",group:"Misc",defaultValue:'auto'},"height":{type:"sap.ui.core.CSSSize",group:"Misc",defaultValue:'10rem',deprecated:true},"rowSpan":{type:"int",group:"Misc",defaultValue:1,deprecated:true},"heightType":{type:"sap.suite.ui.commons.FacetOverviewHeight",group:"Misc",defaultValue:sap.suite.ui.commons.FacetOverviewHeight.None}},aggregations:{"content":{type:"sap.ui.core.Control",multiple:false}},events:{"press":{},"heightChange":{}}}});sap.suite.ui.commons.FacetOverview.M_EVENTS={'press':'press','heightChange':'heightChange'};jQuery.sap.require("sap.ui.core.IconPool");
sap.suite.ui.commons.FacetOverview.prototype.init=function(){var t=this;this._rb=sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");if(jQuery.device.is.desktop){this._oHoverIcon=sap.ui.core.IconPool.createControlByURI({id:this.getId()+"-hover-icon-img",src:"sap-icon://slim-arrow-right"});}else{sap.ui.Device.orientation.attachHandler(function(e){t._updateTitleMaxWidth(e);});}this._oNoDataLabel=new sap.m.Label(this.getId()+"-no-content",{text:this._rb.getText("FACETOVERVIEW_NO_ITEMS_TEXT")});};
sap.suite.ui.commons.FacetOverview.prototype.exit=function(){var t=this;if(this._oHoverIcon){this._oHoverIcon.destroy();}sap.ui.core.ResizeHandler.deregister(this._sTitleResizeHandlerId);sap.ui.Device.orientation.detachHandler(function(){t._updateTitleMaxWidth();});this._oNoDataLabel.destroy();};
sap.suite.ui.commons.FacetOverview.prototype._updateTitleMaxWidth=function(e){this._handleTitleResize();};
sap.suite.ui.commons.FacetOverview.prototype._handleTitleResize=function(){var t=jQuery.sap.byId(this.getId()+"-title").width();if(this._iTitleWidth!=t){var T=t-jQuery.sap.byId(this.getId()+"-qty").outerWidth()-15;jQuery.sap.byId(this.getId()+"-title-text").css("max-width",T);this._iTitleWidth=t;}};
sap.suite.ui.commons.FacetOverview.prototype.onAfterRendering=function(){if(jQuery.device.is.desktop){if(this._sTitleResizeHandlerId){sap.ui.core.ResizeHandler.deregister(this._sTitleResizeHandlerId);}var t=jQuery.sap.domById(this.getId()+"-title");this._sTitleResizeHandlerId=sap.ui.core.ResizeHandler.register(t,jQuery.proxy(this._handleTitleResize,this));}this._handleTitleResize();if(jQuery.device.is.desktop){var a=this;this.$()[0].addEventListener("focusin",function(e){a.$().find("[data-tabindex]").attr("tabindex",function(){return this.getAttribute("data-tabindex");});},true);this.onsapfocusleave();}};
sap.suite.ui.commons.FacetOverview.prototype.onclick=function(e){if(e.srcControl.getMetadata().getName()!="sap.m.Link"){this.firePress({id:this.getId()});}};
sap.suite.ui.commons.FacetOverview.prototype.onkeydown=function(e){if(e.which==jQuery.sap.KeyCodes.ENTER){this.onclick(e);}};
sap.suite.ui.commons.FacetOverview.prototype.onsapfocusleave=function(e){if(jQuery.device.is.desktop){this.$().find("[data-tabindex]").removeAttr("data-tabindex");this.$().find("[tabindex]").attr("data-tabindex",function(){return this.getAttribute("tabindex");}).attr("tabindex","-1");}};
sap.suite.ui.commons.FacetOverview.prototype.onsaptouchstart=function(e){if(this.hasListeners("press")){if(e.srcControl.getMetadata().getName()!="sap.m.Link"){this.addStyleClass("sapSuiteFovSelected");}}};
sap.suite.ui.commons.FacetOverview.prototype.onsaptouchend=function(e){if(this.hasListeners("press")){this.removeStyleClass("sapSuiteFovSelected");}};
sap.suite.ui.commons.FacetOverview.prototype.ontouchmove=function(e){if(this.hasListeners("press")){this.removeStyleClass("sapSuiteFovSelected");}};
sap.suite.ui.commons.FacetOverview.prototype.ontouchstart=function(e){if(this.hasListeners("press")){if(e.srcControl.getMetadata().getName()!="sap.m.Link"){this.addStyleClass("sapSuiteFovSelected");}}};
sap.suite.ui.commons.FacetOverview.prototype.ontouchend=function(e){if(this.hasListeners("press")){this.removeStyleClass("sapSuiteFovSelected");}};
sap.suite.ui.commons.FacetOverview.prototype.ontouchmove=function(e){if(this.hasStyleClass("sapSuiteFovSelected")){this.removeStyleClass("sapSuiteFovSelected");}};
sap.suite.ui.commons.FacetOverview.prototype.getHeight=function(){switch(this.getHeightType()){case sap.suite.ui.commons.FacetOverviewHeight.XS:return"4rem";case sap.suite.ui.commons.FacetOverviewHeight.S:return"6rem";case sap.suite.ui.commons.FacetOverviewHeight.M:return"10rem";case sap.suite.ui.commons.FacetOverviewHeight.L:return"14rem";case sap.suite.ui.commons.FacetOverviewHeight.XL:return"21rem";case sap.suite.ui.commons.FacetOverviewHeight.XXL:return"32rem";case sap.suite.ui.commons.FacetOverviewHeight.Auto:return"auto";case sap.suite.ui.commons.FacetOverviewHeight.None:default:return this.getProperty("height");}};
sap.suite.ui.commons.FacetOverview.prototype.setHeight=function(h){this.setProperty("height",h);this.fireHeightChange();return this;};
sap.suite.ui.commons.FacetOverview.prototype.setHeightType=function(e){this.setProperty("heightType",e);this.fireHeightChange();return this;};
