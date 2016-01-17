(function(){"use strict";jQuery.sap.require('sap.ushell.renderers.fiori2.search.SearchHelper');var S=sap.ushell.renderers.fiori2.search.SearchHelper;jQuery.sap.require('sap.ushell.renderers.fiori2.search.suggestions.InA1SuggestionProvider');var I=sap.ushell.renderers.fiori2.search.suggestions.InA1SuggestionProvider;jQuery.sap.require('sap.ushell.renderers.fiori2.search.suggestions.InA2SuggestionProvider');var a=sap.ushell.renderers.fiori2.search.suggestions.InA2SuggestionProvider;jQuery.sap.require('sap.ushell.renderers.fiori2.search.suggestions.DataSourceSuggestionProvider');var D=sap.ushell.renderers.fiori2.search.suggestions.DataSourceSuggestionProvider;jQuery.sap.require('sap.ushell.renderers.fiori2.search.suggestions.AppSuggestionProvider');var A=sap.ushell.renderers.fiori2.search.suggestions.AppSuggestionProvider;jQuery.sap.declare('sap.ushell.renderers.fiori2.search.suggestions.SuggestionHandler');var s=sap.ushell.renderers.fiori2.search.suggestions;s.SuggestionHandler=function(){this.init.apply(this,arguments);};s.SuggestionHandler.prototype={init:function(p){var t=this;t.model=p.model;t.sina=t.model.sina;t.suggestionProviders=[];t.inA1SuggestionProvider=new I({model:t.model,sina:t.sina,suggestionQuery:t.model.suggestionQuery});t.suggestionProviders.push(t.inA1SuggestionProvider);t.inA2SuggestionProvider=new a({model:t.model,sina:t.sina,suggestionQuery:t.model.suggestionQuery});t.suggestionProviders.push(t.inA2SuggestionProvider);t.dataSourceSuggestionProvider=new D({model:t.model,sina:t.sina});t.suggestionProviders.push(t.dataSourceSuggestionProvider);t.appSuggestionProvider=new A({model:t.model});t.suggestionProviders.push(t.appSuggestionProvider);t.doSuggestionInternal=S.delayedExecution(t.doSuggestionInternal,400);},abortSuggestions:function(c){if(c===undefined||c===true){this.model.setProperty("/suggestions",[]);}if(this.clearSuggestionTimer){clearTimeout(this.clearSuggestionTimer);this.clearSuggestionTimer=null;}this.doSuggestionInternal.abort();this.getSuggestionProviders().done(function(b){for(var i=0;i<b.length;++i){var d=b[i];d.abortSuggestions();}});},supportsScopeTypes:function(b){for(var i=0;i<b.rawServerInfo.Services.length;++i){var c=b.rawServerInfo.Services[i];if(c.Service==='Suggestions2'){for(var j=0;j<c.Capabilities.length;++j){var d=c.Capabilities[j];if(d.Capability==='ScopeTypes'){return true;}}}}return false;},getSuggestionProviders:function(){var t=this;if(t.suggestionProvidersDeferred){return t.suggestionProvidersDeferred;}t.suggestionProvidersDeferred=t.sina.sinaSystem().getServerInfo().then(function(b){if(!b.rawServerInfo){return[t.appSuggestionProvider];}if(t.supportsScopeTypes(b)){t.model.suggestionQuery.setOptions(['SynchronousRun','SuggestObjectData','SuggestDataSources','SuggestSearchHistory']);return[t.appSuggestionProvider,t.inA2SuggestionProvider];}else{t.model.suggestionQuery.setOptions(['SynchronousRun','SuggestObjectData']);return[t.appSuggestionProvider,t.dataSourceSuggestionProvider,t.inA1SuggestionProvider];}},function(){return jQuery.when([t.appSuggestionProvider]);});return t.suggestionProvidersDeferred;},isSuggestionPopupVisible:function(){return jQuery('.searchBOSuggestion').filter(':visible').length>0;},doSuggestion:function(){var t=this;if(this.isSuggestionPopupVisible()){this.abortSuggestions(false);this.clearSuggestionTimer=setTimeout(function(){t.clearSuggestionTimer=null;t.model.setProperty("/suggestions",[]);},1000);}else{this.abortSuggestions();}this.doSuggestionInternal();},doSuggestionInternal:function(){var t=this;var b=t.model.getProperty("/searchBoxTerm");if(b.length===0){return;}if(b.trim()==='*'){return;}t.model.analytics.logCustomEvent('FLP: Search','Suggestion',[t.model.getProperty('/searchBoxTerm'),t.model.getProperty('/dataSource').key]);t.getSuggestionProviders().done(function(c){var f=true;var p=c.length;for(var i=0;i<c.length;++i){var d=c[i];d.getSuggestions().done(function(r){p--;if(p>0&&r.length===0){return;}if(t.clearSuggestionTimer){clearTimeout(t.clearSuggestionTimer);t.clearSuggestionTimer=null;}t.insertSuggestions(r,f);f=false;});}});},insertSuggestions:function(i,f){var s=this.model.getProperty('/suggestions');if(f){s=[];}var g=this._groupByPosition(i);for(var p in g){var b=g[p];this._insertSuggestions(s,b);}this.model.setProperty('/suggestions',s);},_groupByPosition:function(s){var g={};for(var i=0;i<s.length;++i){var b=s[i];var c=g[b.position];if(!c){c=[];g[b.position]=c;}c.push(b);}return g;},_insertSuggestions:function(s,i){if(i.length<=0){return;}var b=i[0];var c=0;for(;c<s.length;++c){var d=s[c];if(d.position>b.position){break;}}var e=[c,0];e.push.apply(e,i);s.splice.apply(s,e);}};})();