/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */
sap.ui.define(['jquery.sap.global','sap/m/CheckBox','sap/m/FlexBox','sap/ui/comp/library','./Input','sap/ui/core/Control','sap/m/Button'],function(q,C,F,l,I,a,B){"use strict";var b=a.extend("sap.ui.comp.smartform.flexibility.FieldListNode",{metadata:{library:"sap.ui.comp",properties:{label:{type:"string",group:"Misc",defaultValue:null},isVisible:{type:"boolean",group:"Misc",defaultValue:null},isSelected:{type:"boolean",group:"Misc",defaultValue:null}},aggregations:{nodes:{type:"sap.ui.comp.smartform.flexibility.FieldListNode",multiple:true,singularName:"node"},layout:{type:"sap.ui.core.Control",multiple:false}},events:{selected:{parameters:{target:{type:"sap.ui.comp.smartform.flexibility.FieldListNode"}}},labelChanged:{parameters:{target:{type:"sap.ui.comp.smartform.flexibility.FieldListNode"}}},nodeHidden:{parameters:{target:{type:"sap.ui.comp.smartform.flexibility.FieldListNode"}}}}}});b.prototype.init=function(){this._textResources=sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp");this._oLayout=new F({direction:sap.m.FlexDirection.Row,justifyContent:sap.m.FlexJustifyContent.SpaceBetween});this._oLabelInputField=new I(this.getId()+'-Input');this._oLabelInputField.addStyleClass("sapUiCompFieldListNodeLabelInputField");this._oLabelInputField.setValue(this.getLabel());this._oLabelInputField.setEditable(false);this._oLabelInputField.attachChange(this._onLabelChanged.bind(this));this._oLabelInputField.attachSelectedByKeyboard(this._onLabelSelectedByKeyboard.bind(this));this._oLabelInputField.setLayoutData(new sap.m.FlexItemData({}));this._oLayout.addItem(this._oLabelInputField);this._oDeleteButton=new B(this.getId()+'_Button');this._oDeleteButton.setType("Transparent");this._oDeleteButton.setIcon("sap-icon://decline");this._oDeleteButton.setIconDensityAware(false);this._oDeleteButton.setTooltip(this._textResources.getText("FORM_PERS_VIS_CHECKBOX_TOOLTIP"));this._oDeleteButton.attachPress(this._hideNode.bind(this));this._oDeleteButton.setLayoutData(new sap.m.FlexItemData({}));this._oLayout.addItem(this._oDeleteButton);this.setLayout(this._oLayout);};b.prototype.setLabel=function(L){this._oLabelInputField.setValue(L);this.setProperty("label",L);};b.prototype.setIsVisible=function(i){if(this.getModel()){this.getModel().setData(this.getModel().getData());}this.setProperty("isVisible",i);this.setVisible(i);};b.prototype.setIsSelected=function(i){if(!i){this._oLabelInputField.setEditable(false);}this.setProperty("isSelected",i);};b.prototype._hideNode=function(e){this.setIsVisible(false);this._fireNodeHiddenAndDelegateToParent(this);};b.prototype._onLabelChanged=function(e){var L;L=this._oLabelInputField.getValue();if(L!==this.getLabel()){this.setProperty("label",L);}this._oLabelInputField.setEditable(false);this._fireLabelChangedAndDelegateToParent(this);};b.prototype._onLabelSelectedByKeyboard=function(e){this._oLabelInputField.setEditable(true);this._fireSelectedAndDelegateToParent(this);};b.prototype.onAfterRendering=function(){this.registerToDOMEvents();};b.prototype.onBeforeRendering=function(){this.deregisterToDOMEvents();};b.prototype.registerToDOMEvents=function(){q("#"+this.getId()).on('click',q.proxy(this._handleClick,this));};b.prototype.deregisterToDOMEvents=function(){q("#"+this.getId()).off('click');};b.prototype._handleClick=function(e){var t,s;t=e.target||e.srcElement;if(t){s=sap.ui.getCore().byId(t.id);if(!(s instanceof b)){if(t.parentElement){s=sap.ui.getCore().byId(t.parentElement.id);}}}if((s===this._oLabelInputField)&&this.getIsSelected()){this._oLabelInputField.setEditable(true);}if(s===this||s===this._oLabelInputField){this._fireSelectedAndDelegateToParent(this);}};b.prototype._fireSelectedAndDelegateToParent=c('fireSelected','_fireSelectedAndDelegateToParent');b.prototype._fireLabelChangedAndDelegateToParent=c('fireLabelChanged','_fireLabelChangedAndDelegateToParent');b.prototype._fireNodeHiddenAndDelegateToParent=c('fireNodeHidden','_fireNodeHiddenAndDelegateToParent');function c(f,s){return function(o){var p;if(!(o instanceof b)){return;}this[f]({target:o});p=this.getParent();if(p&&p instanceof b){p[s](o);}};}return b;},true);
