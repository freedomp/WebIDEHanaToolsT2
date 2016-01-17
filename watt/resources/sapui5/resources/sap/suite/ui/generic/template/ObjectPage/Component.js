jQuery.sap.require("sap.suite.ui.generic.template.library");jQuery.sap.require("sap.suite.ui.generic.template.lib.TemplateComponent");jQuery.sap.require("sap.suite.ui.generic.template.js.AnnotationHelper");jQuery.sap.require("sap.ui.core.format.DateFormat");jQuery.sap.require("sap.m.MessageToast");jQuery.sap.declare("sap.suite.ui.generic.template.ObjectPage.Component");sap.suite.ui.generic.template.lib.TemplateComponent.extend("sap.suite.ui.generic.template.ObjectPage.Component",{metadata:{library:"sap.suite.ui.generic.template",properties:{"templateName":{"type":"string","defaultValue":"sap.suite.ui.generic.template.ObjectPage.view.Details"},"attachmentSupport":"boolean","showRelatedApps":"boolean"},"manifest":"json"},updateBindingContext:function(){"use strict";sap.suite.ui.generic.template.lib.TemplateComponent.prototype.updateBindingContext.apply(this,arguments);var t=this;var b=this.getBindingContext();if(b){this.getModel().getMetaModel().loaded().then(function(){var u=t.getModel("ui");u.setProperty("/draftStatus",'');var a=b.getObject();if(a){var d=t.getAppComponent().getTransactionController().getDraftController();var D=d.getDraftContext();var I=D.hasDraft(b)&&!a.IsActiveEntity;var h=a.HasActiveEntity;if(t.getCreateMode()){u.setProperty("/createMode",true);u.setProperty("/editable",true);u.setProperty("/enabled",true);}else{if(I){if(h){u.setProperty("/createMode",false);u.setProperty("/editable",true);u.setProperty("/enabled",true);}else{u.setProperty("/createMode",true);u.setProperty("/editable",true);u.setProperty("/enabled",true);}}else{u.setProperty("/createMode",false);u.setProperty("/editable",false);if(a.hasOwnProperty("HasDraftEntity")&&a.HasDraftEntity&&D.hasSiblingEntity(t.getEntitySet())){u.setProperty("/enabled",false);t.getModel().read(b.getPath(),{urlParameters:{'$expand':"SiblingEntity,DraftAdministrativeData"},success:function(r){var s={};if(r.hasOwnProperty("SiblingEntity")){s=t.getModel().getContext("/"+t.getModel().getKey(r.SiblingEntity));}if(s){var S=s.getObject();if(S&&S.hasOwnProperty("IsActiveEntity")&&S.IsActiveEntity===false){var R=t.getModel("i18n").getResourceBundle();var m=t.getModel();var M=m.getMetaModel();var o=M.getODataEntitySet(t.getEntitySet());var c=M.getODataEntityType(o.entityType);var T="";var p;if(c["com.sap.vocabularies.Common.v1.Label"]){T=c["com.sap.vocabularies.Common.v1.Label"].String;if(T===""){p=c["com.sap.vocabularies.Common.v1.Label"].Path;if(p){T=a[p];}}}if(c["com.sap.vocabularies.UI.v1.HeaderInfo"]&&c["com.sap.vocabularies.UI.v1.HeaderInfo"].TypeName){if(T===""){T=c["com.sap.vocabularies.UI.v1.HeaderInfo"].TypeName.String;}if(T===""){p=c["com.sap.vocabularies.UI.v1.HeaderInfo"].TypeName.Path;if(p){T=a[p];}}}var O="";var e=c["com.sap.vocabularies.Common.v1.SemanticKey"];for(var i in e){var P=e[i];if(O===""){O=a[P.PropertyPath];}else{O=O+"-"+a[P.PropertyPath];}}var C="-";if(r.DraftAdministrativeData!==null&&r.DraftAdministrativeData.LastChangeDateTime!==null){var f=sap.ui.core.format.DateFormat.getDateTimeInstance({pattern:"MMMM d, yyyy HH:mm",style:"long"});C=f.format(r.DraftAdministrativeData.LastChangeDateTime);}var g=[T,O,C];var j=R.getText("DRAFT_FOUND_RESUME",g);var k=new sap.m.Dialog({title:R.getText("WARNING"),type:'Message',state:'Warning',content:new sap.m.Text({text:j}),buttons:[new sap.m.Button({text:R.getText("RESUME"),press:function(){k.close();t.getAppComponent().getNavigationController().navigateToContext(s,null,true);}}),new sap.m.Button({text:R.getText("DISCARD"),press:function(){k.close();u.setProperty("/enabled",true);var v=t.getAggregation("rootControl");var l=v.getController();l.oBaseViewController.deleteEntity(true);var L=sap.ui.getCore().byId(v.getAggregation("content")[0].getAggregation("content")[0].getAggregation("headerTitle").getId()+"-lock");L.setVisible(false);a.HasDraftEntity=false;var n=t.getAppComponent().getNavigationController().getViews();for(var q in n){var w=n[q].getComponentInstance();if(w.setIsRefreshRequired){w.setIsRefreshRequired(true);}}}})],afterClose:function(){k.destroy();}});k.open();}}u.setProperty("/enabled",true);}});}else{u.setProperty("/enabled",true);}}}}});}},refreshBinding:function(){"use strict";sap.suite.ui.generic.template.lib.TemplateComponent.prototype.refreshBinding.apply(this,arguments);var v=this.getAggregation("rootControl");if(v instanceof sap.ui.core.mvc.XMLView){try{v.getContent()[0].getContent()[0].getSections().forEach(function(s){s.getSubSections().forEach(function(S){S.getBlocks().forEach(function(b){if(b instanceof sap.ui.comp.smarttable.SmartTable){b.rebindTable();}});});});}catch(e){jQuery.sap.log.error("Object Page could not rebind tables");}}}});