(function(g){"use strict";jQuery.sap.declare('sap.ushell.renderers.fiori2.search.SearchLogger');var m=sap.ushell.renderers.fiori2.search.SearchLogger={};m.NavigationEvent=function(){this.init.apply(this,arguments);};m.NavigationEvent.prototype={init:function(p){this.sina=sap.ushell.Container.getService("Search").getSina();},_createUserHistoryEntry:function(t){function a(p){var n=p;for(var i=0,o=n.length;i<o;i++){var q=n[i];if(q.indexOf("sap-system")!==-1){var r=q.split("=");return{"System":r[1].slice(4,7),"Client":r[1].slice(8,-2)};}}}function b(H){return H.split("-")[0];}function c(H){return H.split("-")[1].split("&")[0];}function d(p){var n=p;var o=[];for(var i=0,q=n.length;i<q;i++){var r=n[i];if(r.indexOf("sap-system")!==-1){continue;}var v=r.split("=")[0];var w=r.split("=")[1];o.push({"Name":v,Value:w});}return o;}var u={"NavigationEventList":[{"SourceApplication":{"SemanticObjectType":"","Intent":"","ParameterList":[]}},{"TargetApplication":{"SemanticObjectType":"","Intent":"","ParameterList":[]}}]};var h=window.hasher.getHashAsArray();var s=b(h[0]);u.NavigationEventList[0].SourceApplication.SemanticObjectType=s;var e=c(h[0]);u.NavigationEventList[0].SourceApplication.Intent=e;var f=d(h[1].split("&"));u.NavigationEventList[0].SourceApplication.ParameterList=f;h=t.split("?");var j=b(h[0]).split("#")[1];u.NavigationEventList[1].TargetApplication.SemanticObjectType=j;var k=c(h[0]);u.NavigationEventList[1].TargetApplication.Intent=k;var l=d(h[1].split("&"));u.NavigationEventList[1].TargetApplication.ParameterList=l;var S=a(h[1].split("&"));u.NavigationEventList[1].TargetApplication=jQuery.extend(u.NavigationEventList[1].TargetApplication,S);return u;},addUserHistoryEntry:function(t){if(!t){return;}if(t.indexOf("#")===-1){return;}var s=this.sina.getSystem().getServices();if(s.PersonalizedSearch&&s.PersonalizedSearch.capabilities&&s.PersonalizedSearch.capabilities.SetUserStatus){var u=this._createUserHistoryEntry(t);this.sina.addUserHistoryEntry(u).done(function(d){}).fail(function(e){});}}};}(window));
