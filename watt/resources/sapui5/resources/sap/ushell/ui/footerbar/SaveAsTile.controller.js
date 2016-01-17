sap.ui.controller("sap.ushell.ui.footerbar.SaveAsTile",{onExit:function(){var v=this.getView();var t=v.getTileView();t.destroy();},onInit:function(){var a=sap.ushell.services.AppConfiguration.getMetadata();this.oPageBuilderService=sap.ushell.Container.getService("LaunchPage");this.oView=this.getView();this.appData=this.oView.viewData.appData||{};if(!jQuery.isEmptyObject(this.appData)){this.oModel=new sap.ui.model.json.JSONModel({showGroupSelection:this.appData.showGroupSelection===false?false:true,title:this.appData.title||'',subtitle:this.appData.subtitle||'',numberValue:'',info:this.appData.info||'',icon:this.appData.icon||a.icon,numberUnit:this.appData.numberUnit,keywords:this.appData.keywords||'',groups:[]});this.oView.setModel(this.oModel);}},calcTileDataFromServiceUrl:function(s){var t=this;OData.read({requestUri:s},function(r){if(typeof r==="string"){r={number:r};}t.oModel.setProperty('/numberValue',r.number);var k=["infoState","stateArrow","numberState","numberDigits","numberFactor","numberUnit"];for(var i=0;i<k.length;i++){var a=k[i];if(r[a]){t.oModel.setProperty('/'+a,r[a]);}}},function(e){window.console.log(e);},{read:function(r){r.data=JSON.parse(r.body).d;}});},loadPersonalizedGroups:function(){var g=this.oPageBuilderService.getGroups(),t=this,d=jQuery.Deferred();g.done(function(G){var p=t.loadGroupsFromArray(G);p.done(function(a){d.resolve(a);});});return d;},loadGroupsFromArray:function(g){var t=this,d=jQuery.Deferred(),m=t.oView.getModel();this.oPageBuilderService.getDefaultGroup().done(function(D){g=g.filter(function(a){return(!t.oPageBuilderService.isGroupLocked(a)&&t.oPageBuilderService.isGroupVisible(a));}).map(function(a){return{title:(a===D&&t.getLocalizedText("my_group"))||t.oPageBuilderService.getGroupTitle(a),object:a};});m.setProperty('/groups',g);m.setProperty("/groups/length",g.length);d.resolve();});return d;},getLocalizedText:function(m,p){return p?sap.ushell.resources.i18n.getText(m,p):sap.ushell.resources.i18n.getText(m);}});
