(function(){"use strict";jQuery.sap.declare('sap.ushell.renderers.fiori2.search.SemanticObjectsHandler');var m=sap.ushell.renderers.fiori2.search.SemanticObjectsHandler={};m.SemanticObject=function(){this.init.apply(this,arguments);};m.SemanticObject.prototype={init:function(p){this.type=p.type;this.action=p.action;this.key=p.key;},getSemanticLinks:function(){var t=this;return m.getSemanticObjectsMetadata().then(function(a){var r={};var b=a[t.type];for(var i=0;i<b.Links.results.length;++i){var l=b.Links.results[i];if(l.id.indexOf(t.type+"-displayFactSheet~")>=0){if(t.action!=="displayFactSheet"){if(!r.displayFactSheet){r.displayFactSheet=[];r.displayFactSheet.push({link:l.id+'?'+t.key,text:l.text,shortText:sap.ushell.resources.i18n.getText("action_display")});}}}else if(l.id.indexOf(t.type+"-change~")>=0){if(!r.change){r.change=[];r.change.push({link:l.id+'?'+t.key,text:l.text,shortText:sap.ushell.resources.i18n.getText("action_change")});}}else if(l.id.indexOf(t.type+"-display~")>=0){if(!r.display){r.display=[];r.display.push({link:l.id+'?'+t.key,text:l.text,shortText:sap.ushell.resources.i18n.getText("action_display")});}}else if(l.id.indexOf(t.type+"-manage~")>=0){if(!r.manage){r.manage=[];r.manage.push({link:l.id+'?'+t.key,text:l.text,shortText:sap.ushell.resources.i18n.getText("action_manage")});}}else if(l.id.indexOf(t.type+"-approve~")>=0){if(!r.approve){r.approve=[];r.approve.push({link:l.id+'?'+t.key,text:l.text,shortText:sap.ushell.resources.i18n.getText("action_approve")});}}else{if(!r.other){r.other=[];}r.other.push({link:l.id+'?'+t.key,text:l.text});}}return r;});}};m.createSemanticObjectFromLink=function(l){var i=l.indexOf('-');if(i<0){throw'Error when parsing link, missing \'-\' delimiter in \''+l+'\'';}var t=l.slice(0,i);l=l.slice(i+1);i=l.indexOf('?');if(i<0){throw'Error when parsing link, missing \'?\' delimiter in \''+l+'\'';}var a=l.slice(0,i);var k=l.slice(i+1);return new m.SemanticObject({type:t,action:a,key:k});};m.semanticObjectsMetadataDeferred=null;m.metaDataUrl='/sap/opu/odata/UI2/INTEROP/SemanticObjects?$expand=Links&$format=json';m.getSemanticObjectsMetadata=function(){if(m.semanticObjectsMetadataDeferred){return m.semanticObjectsMetadataDeferred;}m.semanticObjectsMetadataDeferred=new jQuery.Deferred();var j=new sap.ui.model.json.JSONModel();j.loadData(m.metaDataUrl);j.attachRequestCompleted(function(){var r={};var t=this.getData().d.results;for(var i=0;i<t.length;++i){var a=t[i];r[a.id]=a;}m.semanticObjectsMetadataDeferred.resolve(r);});return m.semanticObjectsMetadataDeferred;};m.linkDetermination=function(a){return m.getSemanticObjectsMetadata().then(function(b){var r={},l=a;var c=l.indexOf("-");if(c<0){throw"Error when parsing link, missing \'-\' delimiter in \'"+l+"\'";}var s=l.slice(0,c);l=l.slice(c+1);c=l.indexOf("?");if(c<0){throw"Error when parsing link, missing \'?\' delimiter in \'"+l+"\'";}var d=l.slice(0,c);var k=l.slice(c+1);if(d==="displayFactSheet"){r.mainLink=a;return r;}var t=b[s];var f={},A="";for(var i=0;i<t.Links.results.length;++i){l=t.Links.results[i];if(l.id.indexOf("-"+d+"~")>=0){A=a;}if(l.id.indexOf(s+"-displayFactSheet~")>=0){f.link=l.id+"?"+k;f.text=sap.ushell.resources.i18n.getText("show_related_objects");}}if(A){r.mainLink=A;if(f.link){r.relatedLink=f;}}else{if(f.link){r.mainLink=f.link;}}return r;});};m.test=function(){var s=m.createSemanticObjectFromLink('SalesOrder-displayFactSheet?SalesOrder=0000027');s.getSemanticLinks().done(function(l){for(var i=0;i<l.length;++i){var a=l[i];}});s.getSemanticLinks().done(function(l){for(var i=0;i<l.length;++i){var a=l[i];}});};})();
