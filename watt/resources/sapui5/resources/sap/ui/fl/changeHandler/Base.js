/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2014-2015 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/fl/Utils","jquery.sap.global"],function(U,$){"use strict";var B=function(){};B.prototype._getProperty=function(c,n){if(c){if(c.getMetadata){var m=c.getMetadata();var p=m.getProperties();if(p){var P=p[n];if(P){return P;}}}}};B.prototype.changeProperty=function(c,n,v){var p=this._getProperty(c,n);if(p){c.setProperty(n,v);}};B.prototype.clearProperty=function(c,n){var p=this._getProperty(c,n);if(p){c.setProperty(n,p.defaultValue);}};B.prototype.addAggregation=function(c,n,o,i){if(c){if(c.getMetadata){var m=c.getMetadata();var a=m.getAllAggregations();if(a){var A=a[n];if(A){if(A.multiple){var I=i||a.length||0;c.insertAggregation(n,o,I);}else{c[A._sMutator](o);}}}}}};B.prototype.setTextInChange=function(c,k,t,T){if(!c.texts){c.texts={};}if(!c.texts[k]){c.texts[k]={};}c.texts[k].value=t;c.texts[k].type=T;};return B;},true);
