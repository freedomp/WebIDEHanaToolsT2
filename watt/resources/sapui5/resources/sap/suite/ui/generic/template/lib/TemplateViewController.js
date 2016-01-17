sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/generic/template/BaseViewController","sap/ui/generic/template/ViewUtil","sap/m/Table","sap/suite/ui/generic/template/ListReport/nav/NavigationHandler","sap/suite/ui/generic/template/library"],function(m,B,V,T,N){"use strict";return m.extend("sap.suite.ui.generic.template.lib.TemplateViewController",{metadata:{library:"sap.suite.ui.generic.template"},onInit:function(){this.oBaseViewController=new B();this.oBaseViewController.onInit({showMessages:function(){var u=this.getView().getModel("ui");if(u){return u.getProperty("/editable")?false:true;}else{return true;}}});this.oBaseViewController.connectToView(this.getView());var c=this.getComponent();this._resourceBundle=c.getModel("i18n").getResourceBundle();if(typeof c.bindComponent==='function'){c.bindComponent();}},onShowMessages:function(e){var b=e.getSource();this.showMessagePopover(b,true);},showMessagePopover:function(b,t){return this.oBaseViewController.showMessagePopover(b,t);},handleSuccess:function(r,p){return this.oBaseViewController.handleSuccess(r,p);},handleError:function(e,p){return this.oBaseViewController.handleError(e,p);},getContext:function(){return this.oBaseViewController.getContext();},getComponent:function(){return this.oBaseViewController.getComponent();},getComponentContainer:function(){return this.oBaseViewController.getComponentContainer();},getTransactionController:function(){return this.oBaseViewController.getTransactionController();},getNavigationController:function(){return this.oBaseViewController.getNavigationController();},getDraftContext:function(){return this.oBaseViewController.getDraftContext();},onBack:function(){return this.goBack();},goBack:function(){window.history.back();},onEdit:function(){var t=this;var e=false;var c;var E=t.getComponent().getEntitySet();if(t.getDraftContext().isDraftEnabled(E)&&t.getDraftContext().isDraftRoot(E)){if(t.getDraftContext().hasDraftAdministrativeData(E)){var d=t.getContext().getProperty("DraftAdministrativeData");if(d&&!d.DraftIsProcessedByMe&&!d.InProcessByUser){e=true;c=d.CreatedByUser;}}else{var b=t.getComponent().getBindingContext();var M=t.getComponent().getModel();M.read(b.getPath(),{urlParameters:{"$expand":"SiblingEntity,DraftAdministrativeData"},success:function(r){if(r.DraftAdministrativeData&&!r.DraftAdministrativeData.DraftIsProcessedByMe&&!r.DraftAdministrativeData.InProcessByUser){e=true;c=r.DraftAdministrativeData.CreatedByUser;t.expiredLockDialog(c);}}});return;}}if(e){t.expiredLockDialog(c);}else{t.oBaseViewController.editEntity().then(function(C){var D;if(t.getDraftContext().hasDraft(C)){t._setRootPageToDirty();D=C&&C.context||C;}if(D){t.getNavigationController().navigateToContext(D,undefined,true);}else{var u=t.getView().getModel("ui");u.setProperty("/editable",true);}});}},expiredLockDialog:function(c){var t=this;var a=[c];var d=t._resourceBundle.getText("DRAFT_LOCK_EXPIRED",a);var D=new sap.m.Dialog({title:t._resourceBundle.getText("WARNING"),type:"Message",state:"Warning",content:new sap.m.Text({text:d}),buttons:[new sap.m.Button({text:t._resourceBundle.getText("EDIT"),press:function(){D.close();t.oBaseViewController.editEntity().then(function(C){var o;if(t.getDraftContext().hasDraft(C)){o=C&&C.context||C;}if(o){t.getNavigationController().navigateToContext(o,undefined,true);}else{var u=t.getView().getModel("ui");u.setProperty("/editable",true);}});}}),new sap.m.Button({text:t._resourceBundle.getText("CANCEL"),press:function(){D.close();}})],afterClose:function(){D.destroy();}});D.open();},fnDraftPopover:function(c,b,v,t){if(!c._oPopover){c._oPopover=sap.ui.xmlfragment("sap.suite.ui.generic.template.fragments.DraftAdminDataPopover",c);v.addDependent(c._oPopover);}else{c._oPopover.unbindElement();}var a=new sap.ui.model.json.JSONModel({IsActiveEntity:b.getProperty("IsActiveEntity"),HasDraftEntity:b.getProperty("HasDraftEntity")});c._oPopover.setModel(a,"admin");c._oPopover.bindElement({path:b.getPath()+'/DraftAdministrativeData'});if(c._oPopover.getBindingContext()!==undefined&&c._oPopover.getBindingContext()!==null){c._oPopover.openBy(t);}else{c._oPopover.getObjectBinding().attachDataReceived(jQuery.proxy(function(){c._oPopover.openBy(t);},this));c._oPopover.getObjectBinding().getModel().attachBatchRequestFailed(jQuery.proxy(function(){c._oPopover.openBy(t);},this));}var p=sap.ui.getCore().byId(c._oPopover.getAggregation("_internalHeader").getAggregation("contentRight")[0].getId());p.attachPress(function(e){e.getSource().getParent().getParent().close();});},formatText:function(){var a=Array.prototype.slice.call(arguments,1);var k=arguments[0];if(!k){return'';}var b=this.getView().getModel("i18n").getResourceBundle();if(a.length>0&&(a[0]===null||a[0]===undefined||a[0]==="")){if(a.length>2&&(a[1]===null||a[1]===undefined||a[1]==="")){return a[2];}else{return"";}}else{return b.getText(k,a[0]);}},formatDraftLockText:function(I,H,L){return this.formatDraftLockTextGeneric(I,H,L,this);},formatDraftLockTextGeneric:function(I,H,L,c){var b=c.getView().getModel("i18n").getResourceBundle();if(!I){return b.getText("DRAFT_OBJECT");}else if(H){if(L!==''){return b.getText("LOCKED_OBJECT");}else{return b.getText("UNSAVED_CHANGES");}}else{return"";}},onDiscardDraft:function(e){var c=e.getSource().getCustomData();var t=this;var C=t.getContext();var E=C.getObject();var p;var P;if(c&&c.length&&c[0]){p=c[0].getValue();}else{p=sap.m.PlacementType.Top;}if(E.hasOwnProperty("HasActiveEntity")&&!C.getProperty("IsActiveEntity")&&!C.getProperty("HasActiveEntity")){P=this._resourceBundle.getText("CANCEL_AND_DISCARD");}else{P=this._resourceBundle.getText("DISCARD_EDIT");}var o=new sap.m.Popover({placement:p,showHeader:false,content:new sap.m.VBox({items:[new sap.m.Text({text:P,width:'16rem'}),new sap.m.Button({text:this._resourceBundle.getText("DISCARD"),width:'100%',press:function(){var d=function(a){t.oBaseViewController.deleteEntity().then(function(){t._setRootPageToDirty();if(a&&a.getObject()&&a.getObject().IsActiveEntity){t.getNavigationController().navigateToContext(a,undefined,true);}else{t.goBack();}});};var M=t.getView().getModel();if(E.hasOwnProperty("HasActiveEntity")&&E.HasActiveEntity&&E.hasOwnProperty("SiblingEntity")){M.read(C.getPath()+"/SiblingEntity",{success:function(r){var C=M.getContext("/"+M.getKey(r));d(C);}});}else{d();}}})]})});o.addStyleClass("sapUiContentPadding");o.openBy(e.getSource());},onDelete:function(e){var c=e.getSource().getCustomData();var p;var t=this;if(c&&c.length&&c[0]){p=c[0].getValue();}else{p=sap.m.PlacementType.Top;}var P=new sap.m.ResponsivePopover({placement:p,showHeader:false,content:new sap.m.VBox({items:[new sap.m.Label({text:this._resourceBundle.getText("DELETE_QUESTION")}),new sap.m.Button({text:this._resourceBundle.getText("DELETE"),width:'100%',press:function(){t.oBaseViewController.deleteEntity().then(function(){t._setOthersToDirty();t.goBack();});}})]})});P.addStyleClass("sapUiContentPadding");P.openBy(e.getSource());},onRelatedApps:function(e){var t=this;t.oButton=e.getSource();t.oMetaModel=t.getComponent().getModel().getMetaModel();t.oContext=t.getContext();t.oParsedUrl=sap.ushell.Container.getService("URLParsing").parseShellHash(document.location.hash);var l=sap.ushell.Container.getService("CrossApplicationNavigation").getSemanticObjectLinks(t.oParsedUrl.semanticObject);l.done(function(L){var E=t.oContext.getObject();var s=E.__metadata.type;var d=t.oMetaModel.getODataEntityType(s);var S=d["com.sap.vocabularies.Common.v1.SemanticKey"];var p={};if(S&&S.length>0){for(var j in S){var a=S[j].PropertyPath;if(!p[a]){p[a]=[];p[a].push(E[a]);}}}else{for(var k in d.key.propertyRef){var o=d.key.propertyRef[k].name;if(!p[o]){p[o]=[];p[o].push(E[o]);}}}var b=[];var c=t.oParsedUrl.semanticObject+"-"+t.oParsedUrl.action;for(var i in L){var f=L[i];if(f.intent.indexOf(c)<0){b.push(f);}}var A=new sap.m.ActionSheet({placement:sap.m.PlacementType.Bottom,showCancelButton:false});if(b.length>0){for(var n in b){var g=b[n];var h=new sap.m.Button({text:g.text});h.attachPress(t.onPressLinkedApps,t);h.addCustomData(new sap.ui.core.CustomData({key:"linkData",value:{"oParam":p,"oLinkforNav":g}}));A.addButton(h);}}else{var q=new sap.m.Button({text:sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("LIST_NO_DATA"),enabled:false});A.addButton(q);}A.openBy(t.oButton);});},onPressLinkedApps:function(e){var b=e.getSource();var l=b.getCustomData()[0].getValue();var s=l.oLinkforNav.intent;var S=s.substring(1,s.indexOf("-"));var p=(s.indexOf("~")>-1)?s.indexOf("~"):s.length;var a=s.substring(s.indexOf("-")+1,p);var n={target:{semanticObject:S,action:a},params:l.oParam};this.oCrossAppNavService=sap.ushell.Container.getService("CrossApplicationNavigation").toExternal(n);},showMessagesButton:function(M){if(M&&M.length&&M.length>0){return true;}else{return false;}},showMessagesButtonText:function(M){return M&&M.length||'';},onActivate:function(){var t=this;this.oBaseViewController.activateDraftEntity().then(function(r){sap.m.MessageToast.show(t._resourceBundle.getText("OBJECT_SAVED"));if(r&&r.context){t._setRootPageToDirty();t.getNavigationController().navigateToContext(r.context,undefined,true);}});},onSave:function(){var t=this;this.oBaseViewController.saveEntity().then(function(c){var n=t.getNavigationController();var u=t.getView().getModel("ui");u.setProperty("/editable",false);if(t.getComponent().getCreateMode()){if(c){n.navigateToContext(c,undefined,true);}setTimeout(function(){sap.m.MessageToast.show(this._resourceBundle.getText("OBJECT_CREATED"));},10);}else{sap.m.MessageToast.show(this._resourceBundle.getText("OBJECT_SAVED"));}});},onCallActionFromList:function(e,s){var o,i;if(e){var t=e.getSource().getParent().getParent().getTable();var c=this._getSelectedContext(t);var C=this._getCustomData(e);var n=new N(this);if(C.Type==="com.sap.vocabularies.UI.v1.DataFieldForAction"){this._callAction(e,C,c,"",t);}else if(n){var S=c.getObject();delete S.__metadata;if(s){var a=this.oSmartFilterBar.getDataSuiteFormat()||"{}";S=this._filterObjectsFromJSON(S);o=n.mixAttributesAndSelectionVariant(S,a).toJSONString();i={selectionVariant:this.oSmartFilterBar.getDataSuiteFormat(),tableVariantID:this.oSmartTable.getCurrentVariantId()};}else{jQuery.extend(S,this.getContext().getObject());o=this._filterObjectsFromJSON(S);o=JSON.stringify(o);i={};}var f=jQuery.proxy(this._handleError,this);n.navigate(C.SemanticObject,C.Action,o,i,f);}}},onCallAction:function(e){var c=this._getCustomData(e);var C=this.getContext();if(C&&c.Type==="com.sap.vocabularies.UI.v1.DataFieldForAction"){this._callAction(e,c,C,this.getComponent().getNavigationProperty(),"");}},onCancel:function(){var u=this.getView().getModel("ui");u.setProperty("/editable",false);u.setProperty("/enabled",true);this.getView().getModel().resetChanges();if(this.getComponent().getCreateMode()){this.goBack();}},triggerPrepareOnEnterKeyPress:function(){var d=this.getDraftContext();if(d.isDraftEnabled(this.getComponent().getEntitySet())){var t=this;this.getView().attachBrowserEvent("keyup",function(b){if(b.keyCode===13&&t.getView().getModel("ui").getProperty("/editable")){var c=t.getContext();if(c&&d.hasDraftPreparationAction(c)){t.getTransactionController().getDraftController().saveAndPrepareDraftEntity(c,{binding:t.getComponentContainer().getElementBinding()}).then(function(r){t.oBaseViewController.handleSuccess(r);t._setOthersToDirty();},function(e){t.oBaseViewController.handleError(e);});}}});}},onBeforeRebindTable:function(e){var b=e.getParameter("bindingParams");b.parameters=b.parameters||{};var s=e.getSource();this.oBaseViewController.getTableQueryParameters(s.getEntitySet(),b);var S=b.parameters.select&&b.parameters.select.split(',')||[];var E=b.parameters&&b.parameters.expand&&b.parameters.expand.split(',')||[];var a=s.getEntitySet();for(var i=0;i<S.length;i++){if(S[i].indexOf("/")!==-1){var p=S[i].split("/");p.pop();var n=p.join("/");if(E.indexOf(n)===-1){E.push(n);}}}if(this.getDraftContext().isDraftEnabled(a)&&this.getDraftContext().isDraftRoot(a)){if(this.getTransactionController().getDraftController().getDraftContext().hasDraftAdministrativeData(a)){if(S&&S.length>0){if(S.indexOf("DraftAdministrativeData")===-1){b.parameters.select=b.parameters.select+',DraftAdministrativeData';}}if(E.indexOf("DraftAdministrativeData")===-1){E.push("DraftAdministrativeData");}}}if(E.length>0){b.parameters.expand=E.join(",");}var c=s.getCustomData();var C={};for(var k=0;k<c.length;k++){C[c[k].getKey()]=c[k].getValue();}var t=s.getTable();var v=s.fetchVariant();var d=true;for(var f in v){if(v.hasOwnProperty(f)){d=false;}}if(d&&t instanceof T&&C.TemplateSortOrder){var g=C.TemplateSortOrder.split(', ');for(var j=0;j<g.length;j++){var h=g[j].split(' ');if(h.length>1){b.sorter.push(new sap.ui.model.Sorter(h[0],h[1]==="true"));}else{b.sorter.push(new sap.ui.model.Sorter(h[0]));}}}},onListNavigate:function(e){e.getSource().detachPress("onListNavigate");var r=this.oBaseViewController.navigateFromListItem(e.getSource());e.getSource().attachPress("onListNavigate");return r;},navigateFromListItem:function(i,t){return this.oBaseViewController.navigateFromListItem(i,t);},addEntry:function(e){var t=this;var o=V.getParentTable(e.getSource());return this.oBaseViewController.addEntry(o).then(function(){t._setMeToDirty();});},onSearch:function(e){var t=V.getParentTable(e.getSource());return this.oBaseViewController.searchOnTable(t,e.getParameter("query"));},onChange:function(e){var t=this;var p=e.getSource().getBindingPath("value");if(this.getDraftContext().hasDraft(this.getContext())){var u=this.getView().getModel("ui");if(u){var M=this.getView().getModel();M.attachEventOnce("requestSent",function(){u.setProperty("/draftStatus",t._resourceBundle.getText("DRAFT_SAVING"));});var r;var R=function(){u.setProperty("/draftStatus",t._resourceBundle.getText("DRAFT_SAVED"));M.detachEvent("requestCompleted",R);M.detachEvent("requestFailed",r);};r=function(){u.setProperty("/draftStatus",t._resourceBundle.getText("DRAFT_NOT_SAVED"));M.detachEvent("requestCompleted",R);M.detachEvent("requestFailed",r);};M.attachRequestCompleted(R);M.attachRequestFailed(r);}}return this.oBaseViewController.modifyEntity(p,e.getSource());},onContactDetails:function(e){if(!this.oPopover){this.oPopover=e.getSource().getParent().getParent().getParent().getParent().getParent().getAggregation("items")[1];}this.oPopover.bindElement(e.getSource().getBindingContext().getPath());this.oPopover.openBy(e.getSource());},_setEnabledOfExportToExcel:function(t,e){var c=t.length;for(var n=c-1;n>=0;--n){if(t[n].getIcon()==="sap-icon://excel-attachment"){t[n].setProperty("enabled",e);break;}}return this;},_setRootPageToDirty:function(){var v=this.getNavigationController().getViews();if(v&&v.root){var i=v.root.getComponentInstance();if(i&&typeof i.setIsRefreshRequired==='function'){i.setIsRefreshRequired(true);}}},_setMeToDirty:function(){var v=this.getNavigationController().getViews();var M=this.getComponent().getId();for(var s in v){var i=v[s].getComponentInstance();if(i){if(i.getId()===M){if(typeof i.setIsRefreshRequired==='function'){i.setIsRefreshRequired(true);}return;}}}},_setOthersToDirty:function(){var v=this.getNavigationController().getViews();var M=this.getComponent().getId();for(var s in v){var i=v[s].getComponentInstance();if(i){if(i.getId()===M){continue;}if(typeof i.setIsRefreshRequired==='function'){i.setIsRefreshRequired(true);}}}},_getCustomData:function(e){var c=e.getSource().getCustomData();var C={};for(var i=0;i<c.length;i++){C[c[i].getKey()]=c[i].getValue();}return C;},_checkActionCustomData:function(c){if(!c.Action){throw"Template Error: Function Import Name not found in custom data";}if(!c.Label){c.Label=c.Action;}},_getSelectedContext:function(t){var s=[];if(t instanceof T){s=t.getSelectedContexts();}else{var I=t.getSelectedIndices();for(var i=0;i<I.length;i++){s.push(t.getContextByIndex(I[i]));}}var S=null;var b=new sap.ui.model.resource.ResourceModel({bundleName:"sap/suite/ui/generic/template/ListReport/i18n/i18n"}).getResourceBundle();var c=!!this.getView().$().closest(".sapUiSizeCompact").length;if((!s||s.length===0)){sap.m.MessageBox.error(b.getText("NO_ITEM_SELECTED"),{styleClass:c?"sapUiSizeCompact":""});return undefined;}else if(s.length>1){sap.m.MessageBox.error(b.getText("MULTIPLE_ITEMS_SELECTED"),{styleClass:c?"sapUiSizeCompact":""});return undefined;}else{S=s[0];}return S;},_filterObjectsFromJSON:function(j){var f={};for(var p in j){var a=j[p];if(jQuery.type(a)!=="object"){f[p]=a;}}return f;},_handleError:function(e){if(e instanceof Error){e.showMessageBox();}},_callAction:function(e,c,C,n,s){this._checkActionCustomData(c);return this.oBaseViewController.callAction({functionImportPath:c.Action,context:C,sourceControl:s,label:c.Label,navigationProperty:n});},_getTableFromContent:function(c){var t=null;if(c&&c.length>0){for(var i=0;i<c.length;i++){var C=c[i];if(C instanceof sap.m.Table||C instanceof sap.ui.comp.smarttable.SmartTable){t=C;return t;}else{try{t=this._getTableFromContent(C.getContent());if(t){return t;}}catch(e){continue;}}}}return t;}});},true);