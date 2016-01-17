sap.ui.define(['sap/uxap/ObjectPageConfigurationMode'],function(O){"use strict";var C=sap.ui.core.UIComponent.extend("sap.uxap.component.Component",{metadata:{},init:function(){this._oModel=null;this._oViewConfig={viewData:{component:this}};switch(this.oComponentData.mode){case O.JsonURL:this._oModel=new sap.ui.model.json.JSONModel(this.oComponentData.jsonConfigurationURL);this._oViewConfig.viewName="sap.uxap.component.ObjectPageLayoutUXDrivenFactory";this._oViewConfig.type=sap.ui.core.mvc.ViewType.XML;break;case O.JsonModel:this._oViewConfig.viewName="sap.uxap.component.ObjectPageLayoutUXDrivenFactory";this._oViewConfig.type=sap.ui.core.mvc.ViewType.XML;break;default:jQuery.sap.log.error("UxAPComponent :: missing bootstrap information. Expecting one of the following: JsonURL, JsonModel and FacetsAnnotation");}sap.ui.core.UIComponent.prototype.init.call(this);},createContent:function(){var c;this._oView=sap.ui.view(this._oViewConfig);if(this._oModel){c=this._oView.getController();if(c&&c.connectToComponent){c.connectToComponent(this._oModel);}this._oView.setModel(this._oModel,"objectPageLayoutMetadata");}return this._oView;},propagateProperties:function(n){if(this.oComponentData.mode===O.JsonModel){var c=this._oView.getController();if(c&&c.connectToComponent){c.connectToComponent(this.getModel("objectPageLayoutMetadata"));}}return sap.ui.core.UIComponent.prototype.propagateProperties.apply(this,arguments);},destroy:function(){if(this._oView){this._oView.destroy();this._oView=null;}if(this._oModel){this._oModel.destroy();this._oModel=null;}if(sap.ui.core.UIComponent.prototype.destroy){sap.ui.core.UIComponent.prototype.destroy.call(this);}}});return C;});