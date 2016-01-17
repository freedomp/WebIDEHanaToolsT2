/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP SE. All rights reserved
 */
jQuery.sap.require("sap.apf.modeler.ui.utils.textPoolHelper");sap.ui.controller("sap.apf.modeler.ui.controller.configuration",{onInit:function(){this.getView().addStyleClass("sapUiSizeCompact");this.oViewData=this.getView().getViewData();this.oApplicationHandler=this.oViewData.oApplicationHandler;this.oConfigurationHandler=this.oViewData.oConfigurationHandler;this.oTextPool=this.oConfigurationHandler.getTextPool();this.oConfigurationEditor=this.oViewData.oConfigurationEditor;this.getText=this.oViewData.getText;this.params=this.oViewData.oParams;this._setDisplayText();this.setDetailData();var m=[];m.push(this.byId("idConfigTitle"));this._setMandatoryFields(m);},_setDisplayText:function(){this.byId("idConfigurationBasicData").setTitle(this.getText("configurationData"));this.byId("idConfigTitleLabel").setText(this.getText("configTitle"));this.byId("idConfigTitleLabel").setRequired(true);this.byId("idConfigTitle").setPlaceholder(this.getText("newConfiguration"));this.byId("idConfigurationIdLabel").setText(this.getText("configurationId"));this.byId("idSemanticObjectLabel").setText(this.getText("semanticObject"));this.byId("idNoOfCategoriesLabel").setText(this.getText("noOfCategories"));this.byId("idNoOfStepsLabel").setText(this.getText("noOfSteps"));},setDetailData:function(){if(this.params&&this.params.arguments&&this.params.arguments.configId){var e=this.oConfigurationHandler.getConfiguration(this.params.arguments.configId);}if(e){this.byId("idConfigTitle").setValue(e.AnalyticalConfigurationName);if(e.AnalyticalConfiguration.indexOf(sap.apf.modeler.ui.utils.CONSTANTS.configurationObjectTypes.ISNEWCONFIG)===-1){this.byId("idConfigurationId").setValue(e.AnalyticalConfiguration);}var n=this.oConfigurationEditor.getCategories().length;var a=this.oConfigurationEditor.getSteps().length;this.byId("idNoOfCategories").setValue(n);this.byId("idNoOfSteps").setValue(a);var b=this.oApplicationHandler.getApplication(this.params.arguments.appId);if(b!==undefined){this.byId("idSemanticObject").setValue(b.SemanticObject);}}else{var c=this.oApplicationHandler.getApplication(this.params.arguments.appId);if(c){this.byId("idSemanticObject").setValue(c.SemanticObject);}}},handleChangeDetailValue:function(){var s=this;var c={};var C=this.byId("idConfigTitle").getValue().trim();var a={AnalyticalConfigurationName:C};if(this.oConfigurationEditor){this.oConfigurationEditor.setIsUnsaved();}var t;var o=this.oConfigurationHandler.getConfiguration(this.params.arguments.configId);if(C!==""&&C!==undefined){if(o!==undefined){this.oConfigurationHandler.setConfiguration(a,this.params.arguments.configId);this.oConfigurationHandler.loadConfiguration(this.params.arguments.configId,function(b){var T=sap.apf.modeler.ui.utils.TranslationFormatMap.APPLICATION_TITLE;var A=s.oTextPool.setText(C,T);b.setApplicationTitle(A);c.name=C;var d=s.getText("configuration")+": "+C;if(C){s.oViewData.updateSelectedNode(c);s.oViewData.updateTitleAndBreadCrumb(d);}});}else{t=this.oConfigurationHandler.setConfiguration(a);this.oConfigurationHandler.loadConfiguration(t,function(b){var T=sap.apf.modeler.ui.utils.TranslationFormatMap.APPLICATION_TITLE;var A=s.oTextPool.setText(C,T);b.setApplicationTitle(A);var d={appId:s.params.arguments.appId,configId:t};c.name=C;var e=s.getText("configuration")+": "+C;c.id=o===undefined?a.AnalyticalConfiguration:undefined;if(C){s.oViewData.updateSelectedNode(c,d);s.oViewData.updateTitleAndBreadCrumb(e);}});}}},_setMandatoryFields:function(f){this.mandatoryFields=this.mandatoryFields||[];for(var i=0;i<f.length;i++){f[i].isMandatory=true;this.mandatoryFields.push(f[i]);}},_getMandatoryFields:function(){return this.mandatoryFields;},_setValidationState:function(){var m=this._getMandatoryFields();for(var i=0;i<m.length;i++){if(m[i].isMandatory===true){this.isValidState=(m[i].getValue().trim()!=="")?true:false;if(this.isValidState===false){break;}}}},getValidationState:function(){this._setValidationState();var i=(this.isValidState!==undefined)?this.isValidState:true;return i;}});