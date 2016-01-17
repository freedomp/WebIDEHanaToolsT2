// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
(function(g){"use strict";jQuery.sap.require("sap.ushell.renderers.fiori2.search.controls.SearchResultListItem");jQuery.sap.require("sap.ushell.renderers.fiori2.search.controls.SearchLayout");jQuery.sap.require("sap.m.BusyDialog");jQuery.sap.require("sap.ushell.renderers.fiori2.search.controls.SearchResultListItemFooter");jQuery.sap.require("sap.ushell.renderers.fiori2.search.controls.SearchResultListContainer");jQuery.sap.require("sap.ushell.renderers.fiori2.search.controls.SearchNoResultScreen");jQuery.sap.require("sap.ushell.renderers.fiori2.search.controls.SearchFacetFilter");jQuery.sap.require("sap.ushell.renderers.fiori2.search.controls.DivContainer");jQuery.sap.require("sap.ushell.renderers.fiori2.search.controls.SearchTilesContainer");jQuery.sap.require("sap.ushell.renderers.fiori2.search.controls.SearchResultList");jQuery.sap.require('sap.ushell.renderers.fiori2.search.SearchHelper');jQuery.sap.require('sap.ushell.renderers.fiori2.search.controls.SearchFilterBar');var S=sap.ushell.renderers.fiori2.search.controls.SearchLayout;var a=sap.ushell.renderers.fiori2.search.controls.SearchResultListItem;var b=sap.ushell.renderers.fiori2.search.controls.SearchResultListItemFooter;var c=sap.ushell.renderers.fiori2.search.controls.SearchResultListContainer;var d=sap.ushell.renderers.fiori2.search.controls.SearchResultList;var e=sap.ushell.renderers.fiori2.search.controls.SearchNoResultScreen;var s=sap.ushell.renderers.fiori2.search.SearchHelper;sap.ui.jsview("sap.ushell.renderers.fiori2.search.container.Search",{createContent:function(C){var t=this;var m=t.assembleMainResultList();var f=new sap.ushell.renderers.fiori2.search.controls.SearchFilterBar({visible:{parts:[{path:'/facetVisibility'},{path:'/filterConditions'}],formatter:function(h,i){if(!h&&i.length>0){return true;}else{return false;}}}});t.tabStrips=t.assembleTabStrips();t.appSearchResult=t.assembleAppSearch();var r=new c({topList:t.appSearchResult,bottomList:m,tabStrips:t.tabStrips,filterBar:f,noResultScreen:new e({searchBoxTerm:'{/lastSearchTerm}',visible:{parts:[{path:'/count'},{path:'/isBusy'}],formatter:function(h,i){return h===0&&!i;}}})});t.searchLayout=new S({resultListContainer:r,busyIndicator:new sap.m.BusyDialog(),isBusy:'{/isBusy}',showFacets:'{/facetVisibility}',vertical:false,facets:new sap.ushell.renderers.fiori2.search.controls.SearchFacetFilter()});t.searchContainer=new sap.ushell.renderers.fiori2.search.controls.DivContainer({content:t.searchLayout,cssClass:'sapUshellSearchContainer'});t.oFocusHandler=new s.SearchFocusHandler(t);return t.searchContainer;},assembleTabStrips:function(){var t=this;var f=function(h,j){var k=h.getItems();for(var i=0;i<k.length;++i){var l=k[i];var m=l.getKey()||l.getId();if(m===j){return l.getBindingContext().getObject();}}return null;};var h=new sap.m.IconTabBar({upperCase:true,expandable:false,visible:{parts:[{path:'/facetVisibility'},{path:'/count'}],formatter:function(i,j){return!i&&j>0;}},selectedKey:{path:'/tabStrips/selected/key',mode:sap.ui.model.BindingMode.OneWay},select:function(i){var j;if(i.getParameter){j=i.getParameter('selectedKey');}if(!j){j=h.getSelectedKey();}var k=f(h,j);t.getModel().setDataSource(k);}});h.addStyleClass('searchTabStrips');h.bindAggregation('items','/tabStrips/strips',function(i,C){return new sap.m.IconTabFilter({text:'{label}',key:"{key}",content:null});});return h;},assembleMainResultList:function(){var t=this;t.resultList=new d({mode:sap.m.ListMode.None,growing:true,threshold:2,inset:false,showUnread:true,width:"auto",showNoData:false,visible:'{/resultsVisibility}'});t.resultList.setGrowingThreshold(2000);t.resultList.bindAggregation("items","/results",function(p,D){return t.assembleListItem(D);});return t.resultList;},assembleAppSearch:function(){var t=this;var f=new sap.ushell.renderers.fiori2.search.controls.SearchTilesContainer({maxRows:99999,totalLength:'{/appCount}',visible:'{/appsVisibility}',highlightTerms:'{/lastSearchTerm}',showMore:function(){var m=t.getModel();var n=m.getSkip()+m.getTop();m.setSkip(n,false);var h=10*f.getTilesPerRow();m.setTop(h);}});f.bindAggregation('tiles','/appResults',function(i,C){var h=C.getObject().tile;var v=sap.ushell.Container.getService('LaunchPage').getCatalogTileView(h);if(h.getTitle){v.usageAnalyticsTitle=h.getTitle();}else{v.usageAnalyticsTitle='app';}return v;});f.addStyleClass('sapUshellSearchTileResultList');sap.ui.getCore().getEventBus().subscribe('searchLayoutChanged',function(){f.delayedRerender();},this);return f;},assembleTitleItem:function(D){var i=new sap.m.CustomListItem();var t=new sap.m.Label({text:"{title}"});t.addStyleClass('bucketTitle');i.addStyleClass('bucketTitleContainer');i.addContent(new sap.m.HBox({items:[t]}));return i;},assembleFooterItem:function(D){var t=this;t.footerItem=new b({text:"{i18n>showMore}",showMore:function(){var C=t.getModel();var n=C.getSkip()+10;C.setSkip(n);}});var l=new sap.m.CustomListItem({content:t.footerItem});l.addStyleClass('sapUshellSearchResultListFooter');return l;},assembleAppContainerResultListItem:function(D,p){var t=this;var f=new sap.ushell.renderers.fiori2.search.controls.SearchTilesContainer({maxRows:sap.ui.Device.system.phone?2:1,totalLength:'{/appCount}',highlightTerms:'{/lastSearchTerm}',enableKeyHandler:false,showMore:function(){var m=t.getModel();m.setDataSource(m.appDataSource);}});f.bindAggregation('tiles','tiles',function(i,C){var h=C.getObject().tile;var v=sap.ushell.Container.getService('LaunchPage').getCatalogTileView(h);if(h.getTitle){v.usageAnalyticsTitle=h.getTitle();}else{v.usageAnalyticsTitle='app';}return v;});var l=new sap.m.CustomListItem({content:f});l.addStyleClass('sapUshellSearchResultListItem');l.addStyleClass('sapUshellSearchResultListItemApps');sap.ui.getCore().getEventBus().subscribe('searchLayoutChanged',function(){f.delayedRerender();},this);return l;},assembleResultListItem:function(D,p){var i=new a({title:"{$$Name$$}",titleUrl:"{uri}",type:"{dataSourceName}",imageUrl:"{imageUrl}",data:D});var l=new sap.m.CustomListItem({content:i});l.addStyleClass('sapUshellSearchResultListItem');return l;},assembleListItem:function(D){var t=this;var o=D.getObject();if(o.type==='title'){return t.assembleTitleItem(o);}else if(o.type==='footer'){return t.assembleFooterItem(o);}else if(o.type==='appcontainer'){return t.assembleAppContainerResultListItem(o,D.getPath());}else{return t.assembleResultListItem(o,D.getPath());}},onAllSearchStarted:function(){if(this.oTilesContainer){this.oTilesContainer.resetGrowing();}window.focusTrap=false;},onAllSearchFinished:function(){this.oFocusHandler.setFocus();},onNormalSearchFinished:function(){sap.ui.getCore().getEventBus().publish("closeCurtain");},onAppSearchFinished:function(f,h,r){},setAppView:function(A){var t=this;t.oAppView=A;if(t.oTilesContainer){t.oTilesContainer.setAppView(A);}},getControllerName:function(){return"sap.ushell.renderers.fiori2.search.container.Search";}});}(window));