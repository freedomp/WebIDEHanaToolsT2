(function(){"use strict";sap.m.List.extend('sap.ushell.renderers.fiori2.search.controls.SearchResultList',{renderer:'sap.m.ListRenderer',onAfterRenderingParent:sap.m.List.prototype.onAfterRendering,onAfterRendering:function(){var t=this;t.onAfterRenderingParent();t._prepareResizeHandler();t.collectListItemsForNavigation();},collectListItemsForNavigation:function(){var t=this;var m=t.getItems();if(m.length===0){return;}var d=function(){t._doCollectListItemsForNavigation();};for(var i=0;i<m.length;i++){var M=m[i];if(M.hasStyleClass("sapUshellSearchResultListItemApps")){var c=M.getContent();if(c.length>0){c[0].addEventDelegate({onAfterRendering:d});}}}t._doCollectListItemsForNavigation();},_doCollectListItemsForNavigation:function(){var t=this;var f=t.getDomRef();if(!f){return;}var I=t.getItemNavigation();if(!I){t._startItemNavigation();I=t.getItemNavigation();}if(!I){return;}t._bItemNavigationInvalidated=false;var r=f.getElementsByTagName("li");var d=[];for(var i=0;i<r.length;i++){var R=r[i];if($(R).hasClass("sapUshellSearchResultListItemApps")){var T=R.getElementsByClassName("sapUshellSearchTileWrapper");for(var j=0;j<T.length;j++){if($(T[j]).hasClass("sapUshellSearchShowMoreTile")){continue;}d.push(T[j]);}var s=$(R).find(".sapUshellSearchShowMoreTile button");if(s.length>0){d.push(s[0]);}}else if($(R).hasClass("sapUshellSearchResultListFooter")){var S=R.getElementsByClassName("sapUshellResultListMoreFooter");for(var k=0;k<S.length;k++){d.push(S[k]);}}else if($(R).hasClass("sapUshellSearchResultListItem")){d.push(R);}}if(d.length>0){I.setRootDomRef(d[0].parentElement);}I.setItemDomRefs(d);I.setCycling(false);},_prepareResizeHandler:function(){var t=this;t._previousWindowWidth=$(window).width();$(window).on("resize",function(){t._resizeHandler();});},_resizeHandler:function(){var t=this;if(t.resizeTimeoutID){window.clearTimeout(t.resizeTimeoutID);}t.resizeTimeoutID=window.setTimeout(function(){var p=767;var a=1150;var w=$(window).width();if(w<=p&&t._previousWindowWidth>p||w<=a&&(t._previousWindowWidth<=p||t._previousWindowWidth>a)||w>a&&t._previousWindowWidth<=a){t.rerender();}t._previousWindowWidth=w;},250);}});})();
