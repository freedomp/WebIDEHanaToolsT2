// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
(function(){"use strict";sap.ui.getCore().loadLibrary("sap.m");jQuery.sap.require("sap.ui.core.IconPool");jQuery.sap.require("sap.ui.thirdparty.datajs");jQuery.sap.require("sap.ushell.components.tiles.utils");sap.ui.controller("sap.ushell.components.tiles.applauncherdynamic.DynamicTile",{timer:null,oDataRequest:null,onInit:function(){var v=this.getView(),V=v.getViewData(),t=V.chip,c=sap.ushell.components.tiles.utils.getConfiguration(t,t.configurationUi.isEnabled(),false),m,k,K,a=this,N=c.navigation_target_url,s;s=t.url.getApplicationSystem();if(s){N+=((N.indexOf("?")<0)?"?":"&")+"sap-system="+s;}this.navigationTargetUrl=N;m=new sap.ui.model.json.JSONModel({config:c,data:sap.ushell.components.tiles.utils.getDataToDisplay(c,{number:(t.configurationUi.isEnabled()?1234:"...")}),nav:{navigation_target_url:(t.configurationUi&&t.configurationUi.isEnabled()?"":N)},search:{display_highlight_terms:[]}});v.setModel(m);var T=this.getView().getTileControl();this.getView().addContent(T);if(t.types){t.types.attachSetType(function(d){if(d==='link'){a.getView().removeAllContent();var l=a.getView().getLinkControl();a.getView().addContent(l);}else{a.getView().removeAllContent();var T=a.getView().getTileControl();a.getView().addContent(T);}});}if(t.search){k=v.getModel().getProperty("/config/display_search_keywords");K=jQuery.grep(k.split(/[, ]+/),function(n,i){return n&&n!=="";});t.search.setKeywords(K);t.search.attachHighlight(function(h){v.getModel().setProperty("/search/display_highlight_terms",h);});}if(t.preview){t.preview.setTargetUrl(N);t.preview.setPreviewIcon(c.display_icon_url);t.preview.setPreviewTitle(c.display_title_text);}if(t.refresh){t.refresh.attachRefresh(this.refreshHandler.bind(null,this));}if(t.visible){t.visible.attachVisible(this.visibleHandler.bind(this));}if(t.configurationUi.isEnabled()){t.configurationUi.setUiProvider(function(){var C=sap.ushell.components.tiles.utils.getConfigurationUi(v,"sap.ushell.components.tiles.applauncherdynamic.Configuration");t.configurationUi.attachCancel(a.onCancelConfiguration.bind(null,C));t.configurationUi.attachSave(a.onSaveConfiguration.bind(null,C));return C;});this.getView().getContent()[0].setTooltip(sap.ushell.components.tiles.utils.getResourceBundleModel().getResourceBundle().getText("edit_configuration.tooltip"));}else{if(!t.preview||!t.preview.isEnabled()){if(!s){sap.ushell.Container.addRemoteSystemForServiceUrl(c.service_url);}this.onUpdateDynamicData();}}if(t.actions){var A=c.actions,e;if(A){e=A.slice();}else{e=[];}var b=sap.ushell.components.tiles.utils.getTileSettingsAction(m,this.onSaveRuntimeSettings.bind(this));e.push(b);t.actions.setActionsProvider(function(){return e;});}},stopRequests:function(){if(this.timer){clearTimeout(this.timer);}if(this.oDataRequest){try{this.oDataRequest.abort();}catch(e){jQuery.sap.log.warning(e.name,e.message);}}},onExit:function(){this.stopRequests();},onPress:function(){var v=this.getView(),V=v.getViewData(),m=v.getModel(),t=m.getProperty("/nav/navigation_target_url"),T=V.chip;if(T.configurationUi.isEnabled()){T.configurationUi.display();}else if(t){if(t[0]==='#'){hasher.setHash(t);}else{window.open(t,'_blank');}}},onUpdateDynamicData:function(){var v=this.getView(),c=v.getModel().getProperty("/config"),n=c.service_refresh_interval;if(!n){n=0;}else if(n<10){jQuery.sap.log.warning("Refresh Interval "+n+" seconds for service URL "+c.service_url+" is less than 10 seconds, which is not supported. "+"Increased to 10 seconds automatically.",null,"sap.ushell.components.tiles.applauncherdynamic.DynamicTile.controller");n=10;}if(c.service_url){this.loadData(n);}},extractData:function(d){var n,k=["results","icon","title","number","numberUnit","info","infoState","infoStatus","targetParams","subtitle","stateArrow","numberState","numberDigits","numberFactor"];if(typeof d==="object"&&Object.keys(d).length===1){n=Object.keys(d)[0];if(jQuery.inArray(n,k)===-1){return d[n];}}return d;},onSaveRuntimeSettings:function(s){var v=s.getModel(),t=this.getView().getViewData().chip,c=this.getView().getModel().getProperty("/config");c.display_title_text=v.getProperty('/title');c.display_subtitle_text=v.getProperty('/subtitle');c.display_info_text=v.getProperty('/info');c.display_search_keywords=v.getProperty('/keywords');var a=t.bag.getBag('tileProperties');a.setText('display_title_text',c.display_title_text);a.setText('display_subtitle_text',c.display_subtitle_text);a.setText('display_info_text',c.display_info_text);a.setText('display_search_keywords',c.display_search_keywords);function l(e){jQuery.sap.log.error(e,null,"sap.ushell.components.tiles.applauncherdynamic.DynamicTile.controller");}a.save(function(){jQuery.sap.log.debug("property bag 'tileProperties' saved successfully");this.getView().getModel().setProperty("/config",c);this.getView().getModel().setProperty('/data/display_title_text',c.display_title_text);this.getView().getModel().setProperty('/data/display_subtitle_text',c.display_subtitle_text);this.getView().getModel().setProperty('/data/display_info_text',c.display_info_text);this.getView().getModel().refresh();}.bind(this),l);},onSaveConfiguration:function(c){var d=jQuery.Deferred(),m=c.getModel(),t=m.getProperty("/tileModel"),T=c.getViewData().chip,a=sap.ushell.components.tiles.utils.tileActionsRows2TileActionsArray(m.getProperty("/config/tile_actions_rows")),b={display_icon_url:m.getProperty("/config/display_icon_url"),display_number_unit:m.getProperty("/config/display_number_unit"),service_url:m.getProperty("/config/service_url"),service_refresh_interval:m.getProperty("/config/service_refresh_interval"),navigation_use_semantic_object:m.getProperty("/config/navigation_use_semantic_object"),navigation_target_url:m.getProperty("/config/navigation_target_url"),navigation_semantic_object:jQuery.trim(m.getProperty("/config/navigation_semantic_object"))||"",navigation_semantic_action:jQuery.trim(m.getProperty("/config/navigation_semantic_action"))||"",navigation_semantic_parameters:jQuery.trim(m.getProperty("/config/navigation_semantic_parameters")),display_search_keywords:m.getProperty("/config/display_search_keywords")};var r=sap.ushell.components.tiles.utils.checkInputOnSaveConfig(c);if(r){d.reject("mandatory_fields_missing");return d.promise();}if(b.navigation_use_semantic_object){b.navigation_target_url=sap.ushell.components.tiles.utils.getSemanticNavigationUrl(b);m.setProperty("/config/navigation_target_url",b.navigation_target_url);}var e=T.bag.getBag('tileProperties');e.setText('display_title_text',m.getProperty("/config/display_title_text"));e.setText('display_subtitle_text',m.getProperty("/config/display_subtitle_text"));e.setText('display_info_text',m.getProperty("/config/display_info_text"));e.setText('display_search_keywords',b.display_search_keywords);var f=T.bag.getBag('tileNavigationActions');sap.ushell.components.tiles.utils.populateTileNavigationActionsBag(f,a);function l(E,o){jQuery.sap.log.error(E,null,"sap.ushell.components.tiles.applauncherdynamic.DynamicTile.controller");d.reject(E,o);}T.writeConfiguration.setParameterValues({tileConfiguration:JSON.stringify(b)},function(){var C=sap.ushell.components.tiles.utils.getConfiguration(T,false,false),o=sap.ushell.components.tiles.utils.getConfiguration(T,true,false),m=new sap.ui.model.json.JSONModel({config:C,tileModel:t});c.setModel(m);t.setData({data:o,nav:{navigation_target_url:""}},false);if(T.preview){T.preview.setTargetUrl(C.navigation_target_url);T.preview.setPreviewIcon(C.display_icon_url);T.preview.setPreviewTitle(C.display_title_text);}e.save(function(){jQuery.sap.log.debug("property bag 'tileProperties' saved successfully");if(T.title){T.title.setTitle(b.display_title_text,function(){d.resolve();},l);}else{d.resolve();}},l);f.save(function(){jQuery.sap.log.debug("property bag 'navigationProperties' saved successfully");},l);},l);return d.promise();},successHandleFn:function(r){var c=this.getView().getModel().getProperty("/config");this.oDataRequest=undefined;var d=r,D;if(typeof r==="object"){var u=jQuery.sap.getUriParameters(c.service_url).get("$inlinecount");if(u&&u==="allpages"){d={number:r.__count};}else{d=this.extractData(d);}}else if(typeof r==="string"){d={number:r};}D=sap.ushell.components.tiles.utils.getDataToDisplay(c,d);this.getView().getModel().setProperty("/data",D);this.getView().getModel().setProperty("/nav/navigation_target_url",sap.ushell.components.tiles.utils.addParamsToUrl(this.navigationTargetUrl,D));},errorHandlerFn:function(m){var c=this.getView().getModel().getProperty("/config");this.oDataRequest=undefined;var M=m&&m.message?m.message:m,r=sap.ushell.components.tiles.utils.getResourceBundleModel().getResourceBundle();if(m.response){M+=" - "+m.response.statusCode+" "+m.response.statusText;}jQuery.sap.log.error("Failed to update data via service "+c.service_url+": "+M,null,"sap.ushell.components.tiles.applauncherdynamic.DynamicTile");this.getView().getModel().setProperty("/data",sap.ushell.components.tiles.utils.getDataToDisplay(c,{number:"???",info:r.getText("dynamic_data.error"),infoState:"Critical"}));},onCancelConfiguration:function(c,s,e){var v=c.getViewData(),m=c.getModel(),t=m.getProperty("/tileModel"),T=v.chip,C=sap.ushell.components.tiles.utils.getConfiguration(T,false,false);c.getModel().setData({config:C,tileModel:t},false);},loadData:function(n){var d=this.getView(),c=d.getModel().getProperty("/config"),u=c.service_url,t=this;var T=this.getView().getViewData().chip;if(!u){return;}if(/;o=([;\/?]|$)/.test(u)){u=T.url.addSystemToServiceUrl(u);}if(n>0){jQuery.sap.log.info("Wait "+n+" seconds before calling "+c.service_url+" again",null,"sap.ushell.components.tiles.applauncherdynamic.DynamicTile.controller");this.timer=setTimeout(t.loadData.bind(t,n,false),(n*1000));}if(T.visible.isVisible()&&!t.oDataRequest){t.oDataRequest=OData.read({requestUri:u,headers:{"Cache-Control":"no-cache, no-store, must-revalidate","Pragma":"no-cache","Expires":"0"}},this.successHandleFn.bind(this),this.errorHandlerFn.bind(this));}},refreshHandler:function(d){var t=d.getView().getViewData().chip;if(!t.configurationUi.isEnabled()){d.loadData(0);}else{d.stopRequests();}},visibleHandler:function(i){if(i){this.refreshHandler(this);}}});}());
