sap.ui.define(["sap/suite/ui/generic/template/lib/TemplateViewController","sap/m/Table"],function(B,T){"use strict";return B.extend("sap.suite.ui.generic.template.ObjectPage.view.Details",{onInit:function(){B.prototype.onInit.apply(this,arguments);this.triggerPrepareOnEnterKeyPress();var s=false;try{s=sap.ushell.Container.getService("URLParsing").isIntentUrl(document.URL)?true:false;}catch(e){jQuery.sap.log.error("Detail.controller: UShell service is not available.");}var a=new sap.ui.model.json.JSONModel({HasDetail:!this.getOwnerComponent().getIsLeaf(),HasShell:s});a.setDefaultBindingMode("OneWay");this.getView().setModel(a,"admin");},onPressDraftInfo:function(e){var c=this.getContext();var l=sap.ui.getCore().byId(e.getSource().getId()+"-lock");B.prototype.fnDraftPopover.call(this,this,c,this.oView,l);}});},true);
