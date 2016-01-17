/*!
 * SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2013 SAP AG. All rights reserved
 */
jQuery.sap.declare("sap.suite.ui.commons.ProcessFlowConnectionLabel");jQuery.sap.require("sap.suite.ui.commons.library");jQuery.sap.require("sap.m.Button");sap.m.Button.extend("sap.suite.ui.commons.ProcessFlowConnectionLabel",{metadata:{library:"sap.suite.ui.commons",properties:{"priority":{type:"int",group:"Misc",defaultValue:0},"state":{type:"sap.suite.ui.commons.ProcessFlowConnectionLabelState",group:"Appearance",defaultValue:sap.suite.ui.commons.ProcessFlowConnectionLabelState.Neutral}}}});sap.suite.ui.commons.ProcessFlowConnectionLabel.prototype._bNavigationFocus=false;sap.suite.ui.commons.ProcessFlowConnectionLabel.prototype._bSelected=false;sap.suite.ui.commons.ProcessFlowConnectionLabel.prototype._bHighlighted=false;sap.suite.ui.commons.ProcessFlowNode.prototype._oResBundle=null;sap.suite.ui.commons.ProcessFlowConnectionLabel.prototype._bDimmed=false;
sap.suite.ui.commons.ProcessFlowConnectionLabel.prototype.init=function(){if(sap.m.Button.prototype.init){sap.m.Button.prototype.init.apply(this,arguments);}this.addStyleClass("sapSuiteUiCommonsProcessFlowConnectionLabel");if(!this._oResBundle){this._oResBundle=sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");}};
sap.suite.ui.commons.ProcessFlowConnectionLabel.prototype.onBeforeRendering=function(){this._configureStateClasses();this._setLabelWidth();this._setAriaDetails();};
sap.suite.ui.commons.ProcessFlowConnectionLabel.prototype._getNavigationFocus=function(){return this._bNavigationFocus;};
sap.suite.ui.commons.ProcessFlowConnectionLabel.prototype._setNavigationFocus=function(n){this._bNavigationFocus=n;};
sap.suite.ui.commons.ProcessFlowConnectionLabel.prototype._setSelected=function(s){this._bSelected=s;};
sap.suite.ui.commons.ProcessFlowConnectionLabel.prototype._getSelected=function(){return this._bSelected;};
sap.suite.ui.commons.ProcessFlowConnectionLabel.prototype._setHighlighted=function(h){this._bHighlighted=h;};
sap.suite.ui.commons.ProcessFlowConnectionLabel.prototype._getHighlighted=function(){return this._bHighlighted;};
sap.suite.ui.commons.ProcessFlowConnectionLabel.prototype._setDimmed=function(d){this._bDimmed=d;};
sap.suite.ui.commons.ProcessFlowConnectionLabel.prototype._getDimmed=function(){return this._bDimmed;};
sap.suite.ui.commons.ProcessFlowConnectionLabel.prototype.setWidth=function(){};
sap.suite.ui.commons.ProcessFlowConnectionLabel.prototype.setIconFirst=function(){};
sap.suite.ui.commons.ProcessFlowConnectionLabel.prototype._setLabelWidth=function(){if(this.getIcon()){if(this.getText()){this.setProperty("width","4.5rem",false);}else{this.setProperty("width","2rem",false);}}else{if(this.getText()&&this.getText().length>2){this.setProperty("width","4.5rem",false);}else{this.setProperty("width","2rem",false);}}};
sap.suite.ui.commons.ProcessFlowConnectionLabel.prototype._configureStateClasses=function(){switch(this.getState()){case sap.suite.ui.commons.ProcessFlowConnectionLabelState.Positive:this.addStyleClass("labelStatePositive");break;case sap.suite.ui.commons.ProcessFlowConnectionLabelState.Critical:this.addStyleClass("labelStateCritical");break;case sap.suite.ui.commons.ProcessFlowConnectionLabelState.Negative:this.addStyleClass("labelStateNegative");break;default:this.addStyleClass("labelStateNeutral");}if(this._getDimmed()){this.addStyleClass("labelDimmed");}else{this.removeStyleClass("labelDimmed");}if(this._getSelected()){this.addStyleClass("labelSelected");}else{this.removeStyleClass("labelSelected");}if(this._getHighlighted()){this.addStyleClass("labelHighlighted");}else{this.removeStyleClass("labelHighlighted");}};
sap.suite.ui.commons.ProcessFlowConnectionLabel.prototype._setAriaDetails=function(){var i=new sap.ui.core.InvisibleText();i.setText(this._oResBundle.getText('PF_CONNECTIONLABEL'));i.toStatic();var I=new sap.ui.core.InvisibleText();I.setText(this.getText());I.toStatic();if(this.getAriaLabelledBy().length===0){this.addAriaLabelledBy(i);this.addAriaLabelledBy(I);}};
