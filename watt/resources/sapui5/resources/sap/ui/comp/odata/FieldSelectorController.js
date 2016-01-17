/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */
sap.ui.define(["jquery.sap.global","./FieldSelectorModelConverter"],function(q,M){"use strict";var F=function(){this._oModelConverter=null;this._oFields={};this._aIgnoredFields=[];};F.prototype.init=function(o,e,i,b,I){if(!o){q.sap.log.error("oModel has to be set otherwise nothing will be displayed");}this._oModelConverter=new M(o);if(!e){e=this._oModelConverter.getAllEntityTypeNames();}if(!i){i=[];}var c=this._oModelConverter.getConvertedModel(e,i);if(b&&I){var f=this._updateFieldLabelsAndDetermineFieldsNotBoundToODataService(c,b,I);this._addFieldsNotBoundToODataService(c,f);}this._sortFields(c);};F.prototype._updateFieldLabelsAndDetermineFieldsNotBoundToODataService=function(c,b,i){var t=this;q.each(c,function(k,d){q.each(d,function(a,D){if(D.entityName&&D.name){if(k!==D.entityName){var m=t.getMetaDataAnalyzer();var p=m._getNameOfPropertyUsingComplexType(k,D.entityName);if(p){var o=b[k+"/"+p+"/"+D.name];if(o){o.isBoundToODataService=true;var s=o.label;if(s&&(s!==D.fieldLabel)){D.fieldLabel=s;}if(i){delete i[o.id];}}}else{q.sap.log.error("FieldSelector: Property of complex type "+D.name+" not found on entityType "+k);}}else{var o=b[D.entityName+'/'+D.name];if(o){o.isBoundToODataService=true;var s=o.label;if(s&&(s!==D.fieldLabel)){D.fieldLabel=s;}if(i){delete i[o.id];}}}}});});this._removeFieldsFromList(i,b,this._oModelConverter.invisibleFields);var f=[];q.each(i,function(k,o){f.push(o);});return f;};F.prototype._removeFieldsFromList=function(f,b,m){var t=this;if(!f||!m){return;}q.each(m,function(k,o){q.each(o,function(i,a){if(a.entityName&&a.name){if(k!==a.entityName){var c=t.getMetaDataAnalyzer();var p=c._getNameOfPropertyUsingComplexType(k,a.entityName);if(p){var d=b[k+"/"+p+"/"+a.name];if(d){delete f[a.id];}}else{q.sap.log.error("FieldSelector: Property of complex type "+a.name+" not found on entityType "+k);}}else{var d=b[a.entityName+'/'+a.name];if(d){delete f[a.id];}}}});});};F.prototype._addFieldsNotBoundToODataService=function(c,f){var e=function(C,E){if(!c[E.key]){c[E.key]=[];}c[E.key].push(C);};var a=function(o){o.isBoundToODataService=false;var C={id:o.id,fieldLabel:o.label};var E=this._oModelConverter.getEntityTypes();E.forEach(e.bind(null,C));};f.forEach(a.bind(this));};F.prototype._sortFields=function(c){var t=this;q.each(c,function(k,v){t._oFields[k]=v;t.sortFieldsForEntity.call(t,k);});};F.prototype.sortFieldsForEntity=function(e){this._oFields[e]=this._oFields[e].sort(function(a,b){if(a.fieldLabel>b.fieldLabel){return 1;}if(a.fieldLabel<b.fieldLabel){return-1;}return 0;});};F.prototype.getFields=function(){return this._oFields;};F.prototype.getEntityTypes=function(){return this._oModelConverter.getEntityTypes();};F.prototype.getMetaDataAnalyzer=function(){return this._oModelConverter.getMetaDataAnalyzer();};F.prototype.getMaxEntitySetSize=function(){var m=0;if(this._oFields){q.each(this._oFields,function(k,v){if(v&&v.length){if(v.length>m){m=v.length;}}});}return m;};F.prototype.destroy=function(){if(this._oModelConverter){this._oModelConverter.destroy();}this._oModelConverter=null;this._oFields=null;};return F;},true);
