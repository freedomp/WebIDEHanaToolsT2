/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */
sap.ui.define(['jquery.sap.global','sap/m/Label',"sap/m/VBox",'sap/ui/comp/library','sap/ui/core/Element','sap/ui/layout/form/FormElement','sap/ui/layout/ResponsiveFlowLayoutData','sap/ui/comp/smartfield/SmartLabel','sap/ui/comp/smartfield/SmartField','sap/ui/comp/smartfield/BindingUtil','sap/ui/comp/smartfield/Configuration','sap/ui/core/TooltipBase'],function(q,L,V,l,E,F,R,S,a,B,C,T){"use strict";var G=F.extend("sap.ui.comp.smartform.GroupElement",{metadata:{library:"sap.ui.comp",properties:{useHorizontalLayout:{type:"boolean",group:"Misc",defaultValue:null},horizontalLayoutGroupElementMinWidth:{type:"int",group:"Misc",defaultValue:null},elementForLabel:{type:"int",group:"Misc",defaultValue:0}},defaultAggregation:"elements",aggregations:{elements:{type:"sap.ui.core.Control",multiple:true,singularName:"element"}},events:{visibleChanged:{}}},_visibilityDerived:false});G.prototype.init=function(){F.prototype.init.apply(this,arguments);};G.prototype._getFieldRelevantForLabel=function(){var f=this.getFields();var e=[];var t=this;f.forEach(function(o){if(o instanceof V&&t.getUseHorizontalLayout()){e=e.concat(o.getItems());}else{e.push(o);}});e=e.filter(function(o){return!(o instanceof sap.m.Label);});var i=this.getElementForLabel();if(e.length>i&&(e[i]instanceof a)){return e[i];}return null;};G.prototype._createLabel=function(s){var o=null;var i=null;var b=new B();var f=this._getFieldRelevantForLabel();if(f){if(f.getShowLabel()){if(s){f.setTextLabel(s);}o=new S();if(s){o.setText(s);}o.setLabelFor(f);}}else{i=this.getBindingInfo("label");o=new L();if(s){o.setText(s);}else if(i){o.bindProperty("text",b.toBinding(i));}}return o;};G.prototype.updateLabelOfFormElement=function(i,s){var t=null,c=false;var r=this._getFieldRelevantForLabel();var o=this._getLabel();if(o){if(r&&(!(o instanceof S))){o=this._createLabel(o.getText());c=true;}}else{o=this._createLabel();c=true;}if(o){if(s&&i&&(o instanceof S)){if(s===r){o.updateLabelFor(i);}else{o.updateAriaLabeledBy(i);}}var b=this._getFieldRelevantForLabel();if(o instanceof S){if(b&&b.setTextLabel){if(b.getTextLabel()){o.setText(b.getTextLabel());}}}t=this.getTooltip();if(t){if(o instanceof S){if(b&&b.setTooltipLabel){b.setTooltipLabel(t.getText());}}}else{o.setTooltip(t);}}if(c){this.setLabel(o);}};G.prototype.setLabel=function(o){var O,b=o;var i;if(typeof o==="string"){O=this._getLabel();if(O&&O instanceof S){O.setText(o);b=O;var s=this._getFieldRelevantForLabel();if(s&&s.getTextLabel&&!s.getTextLabel()){s.setTextLabel(o);}}else{b=new L({text:o});}}if(this.getUseHorizontalLayout()){if(this.getFields()[0]instanceof V){i=this.getFields()[0].getItems();i.some(function(I){if(I instanceof L){O=I;return true;}});if(O){O=b;}else{this.getFields()[0].insertItem(b,0);}return this;}}F.prototype.setLabel.apply(this,[b]);};G.prototype.setTooltip=function(t){var o=t;if(typeof t==="string"){o=new T({text:t});}F.prototype.setTooltip.apply(this,[o]);};G.prototype._getLabel=function(){var e=null,i=null,r=false;var o=F.prototype.getLabel.apply(this);if(!o){e=this.getElements();if(e&&e.length>0&&e[0]instanceof V){i=e[0].getItems();i.some(function(I){r=false;if(I instanceof L){o=I;r=true;}return r;});}}return o;};G.prototype.getLabelText=function(){var s="";var o=this._getLabel();if(o){s=o.getText();}return s;};G.prototype.setEditMode=function(e){var b=this.getElements();var i=[];b.forEach(function(o){if(o instanceof V){i=o.getItems();i.forEach(function(I){if(I instanceof a){if(!(I.data("editable")===false)){I.setContextEditable(e);}}});}else if(o instanceof a){if(!(o.data("editable")===false)){o.setContextEditable(e);}}});return this;};G.prototype._getVisibilityOfFields=function(f,I){var r=false;var i=0,b=0,o=null;if(f&&f.length){b=f.length;for(i=0;i<b;i++){o=f[i];if(o){if(I&&o instanceof S){continue;}if(o instanceof V){r=this._getVisibilityOfFields(o.getItems(),true);}else{r=o.getVisible();}}if(r){break;}}}return r;};G.prototype._updateFormElementVisibility=function(){var A=this.getVisible();var v=false,f=null;if(A===false&&this._visibilityDerived===false){return;}f=this.getFields();if(f&&f.length){v=this._getVisibilityOfFields(f);}if(A!==v){this._visibilityDerived=true;F.prototype.setProperty.apply(this,['visible',v]);this.fireVisibleChanged({visible:v});if(this.getParent()){this.getParent()._updateLineBreaks();}}};G.prototype._updateFormElementEditable=function(e){var o=this._getLabel();if(o&&o instanceof S){o.bindRequiredPropertyToSmartField();}};G.prototype._updateLayout=function(){var t=this;var m,v=null;var f=[];var e=[];if(this.getUseHorizontalLayout()){e=this.getFields();e.forEach(function(b){if(b instanceof V){f=f.concat(b.getItems());}else{f.push(b);}});f=f.filter(function(b){return!(b instanceof sap.m.Label);});}else{f=this.getFields();}var o=this._getLabel();if(this.getUseHorizontalLayout()){this.removeAllFields();if(f.length>0){v=new V({"items":[].concat(f)});v.addStyleClass("sapUiCompGroupElementVBox");this.addField(v);}if(o){F.prototype.setLabel.apply(this,[new sap.m.Label()]);F.prototype.destroyLabel.apply(this);v.insertItem(o,0);}m=this.getHorizontalLayoutGroupElementMinWidth();if(m){this.setLayoutData(new R({minWidth:m}));}}else{this.removeAllFields();f.forEach(function(b){t.addField(b);});}};G.prototype.setProperty=function(p,v){F.prototype.setProperty.apply(this,[p,v]);if(p==='visible'){this._visibilityDerived=false;this._updateFormElementVisibility();}};G.prototype.setVisible=function(v){this._visibilityDerived=false;F.prototype.setProperty.apply(this,['visible',v]);this._updateFormElementVisibility();};G.prototype.setUseHorizontalLayout=function(v){this.setProperty("useHorizontalLayout",v);this._updateLayout();};G.prototype.setHorizontalLayoutGroupElementMinWidth=function(n){this.setProperty("horizontalLayoutGroupElementMinWidth",n);this._updateLayout();};G.prototype.getFormElement=function(){return this;};G.prototype.addElement=function(e){var t=this;if(e.getEditable){if(!e.getEditable()){e.data("editable",false);}}if(e.attachVisibleChanged){e.attachVisibleChanged(function(o){t._updateFormElementVisibility();});}if(e.attachContextEditableChanged){e.attachContextEditableChanged(function(o){t._updateFormElementEditable(o);});}if(e.attachInnerControlsCreated){e.attachInnerControlsCreated(function(o){t._updateFormElementLabel(o);});}this.addField(e);this.updateLabelOfFormElement();this._updateLayout();};G.prototype._updateFormElementLabel=function(e){var f=this.getFields();if(f[0]instanceof V){f=f[0].getItems();if(f[0]instanceof L){f.splice(0,1);}}this.updateLabelOfFormElement(e.getParameters(),e.oSource);};G.prototype.addCustomData=function(c){F.prototype.addCustomData.apply(this,arguments);var e=this.getFields();e.forEach(function(o){if(o instanceof a){o.addCustomData(c.clone());}});return this;};G.prototype.insertElement=function(e,i){this.insertField(e,i);return this;};G.prototype.getElements=function(){return this.getFields();};G.prototype.removeElement=function(e){return this.removeField(e);};G.prototype.removeAllElements=function(){return this.removeAllFields();};G.prototype.removeAggregation=function(A,o){if(A==="elements"){return this.removeField(o);}else{return E.prototype.removeAggregation.apply(this,arguments);}};G.prototype.removeAllAggregation=function(A){if(A==="elements"){return this.removeAllElements();}else{return E.prototype.removeAllAggregation.apply(this,arguments);}};G.prototype.getVisibleBasedOnElements=function(){var i=true;var e=this.getElements();if(e&&e.length>0){i=e.some(function(o){return o.getVisible();});}return i;};return G;},true);
