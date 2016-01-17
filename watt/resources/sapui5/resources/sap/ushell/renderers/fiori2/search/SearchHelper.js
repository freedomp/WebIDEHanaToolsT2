(function(){"use strict";jQuery.sap.declare('sap.ushell.renderers.fiori2.search.SearchHelper');var m=sap.ushell.renderers.fiori2.search.SearchHelper={};jQuery.sap.require('jquery.sap.storage');m.Tester=function(){this.init.apply(this,arguments);};m.Tester.prototype={init:function(s){s=s||"*";s=s.replace(/([.+?^=!:${}()|\[\]\/\\])/g,"\\$1");this.aSearchTerms=this.tokenizeSearchTerms(s);for(var j=0;j<this.aSearchTerms.length;++j){this.aSearchTerms[j]=this.aSearchTerms[j].replace(/\*/g,"[^\\s]*");var i=this.aSearchTerms[j].match(/[\u3400-\u9faf]/)!==null?true:false;if(i){this.aSearchTerms[j]=new RegExp(this.aSearchTerms[j],'gi');}else{this.aSearchTerms[j]=new RegExp('(?:^|\\s)'+this.aSearchTerms[j],'gi');}}},test:function(t){var r={bMatch:false,sHighlightedText:''};if(!t){return r;}this.initializeBoldArray(t);this.globalBold=false;var R;var M=false;var a;for(var j=0;j<this.aSearchTerms.length;++j){R=this.aSearchTerms[j];if(R.toString()==='/(?:^|\\s)[^\\s]*/gi'||R.toString()==='/[^\\s]*/gi'){continue;}M=false;var l=-1;while((a=R.exec(t))!==null){M=true;if(R.lastIndex===l){break;}l=R.lastIndex;var s=this.indexOfFirstNoneWhiteSpaceChar(t,a.index);if(s<0){continue;}this.markBoldArray(s,R.lastIndex);}if(M===false){return r;}}r.bMatch=true;r.sHighlightedText=this.render(t);return r;},indexOfFirstNoneWhiteSpaceChar:function(t,s){t=t.substring(s);var a=/[^\s]/.exec(t);if(!a){return-1;}return a.index+s;},tokenizeSearchTerms:function(t){var a=t.split(" ");var n=[];$.each(a,function(i,b){b=$.trim(b);if(b.length>0&&b!=='.*'){n.push(b);}});return n;},initializeBoldArray:function(t){this.bold=new Array(t.length);for(var i=0;i<this.bold.length;++i){this.bold[i]=false;}},markBoldArray:function(n,a){for(var i=n;i<a;i++){this.bold[i]=true;this.globalBold=true;}},render:function(o){if(!this.globalBold){return o;}var b=false;var r=[];var s=0;var i;for(i=0;i<o.length;++i){if((!b&&this.bold[i])||(b&&!this.bold[i])){r.push(o.substring(s,i));if(b){r.push("</b>");}else{r.push("<b>");}b=!b;s=i;}}r.push(o.substring(s,i));if(b){r.push("</b>");}return r.join("");}};m.delayedExecution=function(o,d){var t=null;var a=function(){var b=arguments;var c=this;if(t){window.clearTimeout(t);}t=window.setTimeout(function(){t=null;o.apply(c,b);},d);};a.abort=function(){if(t){window.clearTimeout(t);}};return a;};m.refuseOutdatedRequests=function(o,r){var l=0;var d=function(){var a=arguments;var t=this;var b=++l;var c=new jQuery.Deferred();o.apply(t,a).done(function(){if(b!==l){return;}c.resolve.apply(c,arguments);}).fail(function(){if(b!==l){return;}c.reject.apply(c,arguments);});return c;};d.abort=function(){++l;};if(r){m.outdatedRequestAdministration.registerDecorator(r,d);}return d;};m.abortRequests=function(r){var d=m.outdatedRequestAdministration.getDecorators(r);for(var i=0;i<d.length;++i){var a=d[i];a.abort();}};m.outdatedRequestAdministration={decoratorMap:{},registerDecorator:function(r,d){var a=this.decoratorMap[r];if(!a){a=[];this.decoratorMap[r]=a;}a.push(d);},getDecorators:function(r){var d=this.decoratorMap[r];if(!d){d=[];}return d;}};m.boldTagUnescaper=function(d){var i=d.innerHTML;while(i.indexOf('&lt;b&gt;')+i.indexOf('&lt;/b&gt;')>=-1){i=i.replace('&lt;b&gt;','<b>');i=i.replace('&lt;/b&gt;','</b>');}while(i.indexOf('&lt;i&gt;')+i.indexOf('&lt;/i&gt;')>=-1){i=i.replace('&lt;i&gt;','<i>');i=i.replace('&lt;/i&gt;','</i>');}d.innerHTML=i;};m.boldTagUnescaperByText=function(d){var a=$(d);var s=a.text().replace(/<b>/gi,'').replace(/<\/b>/gi,'');if(s.indexOf('<')===-1){a.html(a.text());}};m.forwardEllipsis4Whyfound=function(d){var a=$(d);var p=a.html().indexOf("<b>");if(p>2&&d.offsetWidth<d.scrollWidth){var e="..."+a.html().substring(p);a.html(e);}};m.hasher={hash:null,setHash:function(h){if(decodeURIComponent(window.location.hash)!==decodeURIComponent(h)){try{window.location.hash=h;}catch(e){this.showUrlUpdateError(e);}}this.hash=h;},hasChanged:function(){if(decodeURIComponent(this.hash)!==decodeURIComponent(window.location.hash)){return true;}return false;},showUrlUpdateError:function(e){if(this.urlError){return;}this.urlError=true;jQuery.sap.require("sap.m.MessageBox");var a=sap.ushell.resources.i18n.getText('searchUrlErrorMessage',e.toString());sap.m.MessageBox.alert(a,{title:sap.ushell.resources.i18n.getText('searchUrlErrorTitle'),icon:sap.m.MessageBox.Icon.ERROR});}};m.loadFilterButtonStatus=function(){if(jQuery.sap.storage&&jQuery.sap.storage.isSupported()){var f=jQuery.sap.storage.get("showSearchFacets");if(!f){return false;}else{return true;}}else{return false;}};m.saveFilterButtonStatus=function(a){if(jQuery.sap.storage.isSupported()){jQuery.sap.storage.put("showSearchFacets",a);}};m.idMap={};m.subscribeOnlyOnce=function(i,e,c,s){if(m.idMap[i]){m.idMap[i].unsubscribe();}var w=function(){c.apply(s);sap.ui.getCore().getEventBus().unsubscribe(e,w,s);};sap.ui.getCore().getEventBus().subscribe(e,w,s);m.idMap[i]={unsubscribe:function(){sap.ui.getCore().getEventBus().unsubscribe(e,w,s);}};};m.SearchFocusHandler=function(){this.init.apply(this,arguments);};m.SearchFocusHandler.prototype={init:function(s){this.oSearchView=s;},get2BeFocusedControlDomRef:function(){if(!this.oModel){this.oModel=this.oSearchView.getModel();}var i=0;var c=null;var a=null;var s=this.oModel.getSkip();if(this.oModel.getProperty('/boCount')>0&&this.oModel.getProperty('/appCount')>0){i=(s>0)?(s+1):0;c=this.oSearchView.resultList.getItems()[i];if(c&&c.getDomRef){a=c.getDomRef();}}else if(this.oModel.getProperty('/boCount')>0){i=(s>0)?s:0;c=this.oSearchView.resultList.getItems()[i];if(c&&c.getDomRef){a=c.getDomRef();}}else if(this.oModel.getProperty('/appCount')>0){var t=this.oSearchView.appSearchResult;i=(s>0)?(Math.floor((s+1)/t.getTilesPerRow())*t.getTilesPerRow()-1):0;c=t.getTiles()[i];if(c&&c.getDomRef){a=window.$(c.getDomRef()).closest(".sapUshellSearchTileWrapper")[0];}}return a;},setFocus:function(){var t=this;var r=10;var d=function(){t.focusSetter=null;var c=t.get2BeFocusedControlDomRef();if(!c||sap.ui.getCore().getUIDirty()||sap.ui.getCore().byId('loadingDialog').isOpen()||jQuery('.sapUshellSearchTileContainerDirty').length>0||jQuery('.sapMBusyDialog').length>0){if(--r){t.focusSetter=setTimeout(d,100);}return;}c.focus();var a=sap.ui.getCore().byId(c.getAttribute('id'));if(a&&a.getContent&&a.getContent()[0]){var b=a.getContent()[0];if(b.showDetails){b.showDetails();}}t.oSearchView.resultList.collectListItemsForNavigation();};if(this.focusSetter){clearTimeout(this.focusSetter);this.focusSetter=null;}d();}};})();