/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
jQuery.sap.declare('sap.apf.ui.utils.facetFilterListHandler');jQuery.sap.require('sap.apf.ui.utils.facetFilterValueFormatter');
sap.apf.ui.utils.FacetFilterListHandler=function(c,u,C,f){"use strict";function _(){var m=c.createMessageObject({code:"6010",aParameters:[c.getTextNotHtmlEncoded(C.getLabel())]});c.putMessage(m);}this.getFacetFilterListData=function(){var s,F,a,m,b;var o=jQuery.Deferred();var d=C.getValues();d.then(function(e){if(e===null||e.length===0){_();o.reject([]);}else{s=C.getAliasNameIfExistsElsePropertyName()||C.getPropertyName();C.getMetadata().then(function(p){F={oCoreApi:c,oUiApi:u,aFilterValues:e,oPropertyMetadata:p,sSelectProperty:s};a=new sap.apf.ui.utils.FacetFilterValueFormatter();b=a.getFormattedFFData(F);m=f.getFFListDataFromFilterValues(b,s);o.resolve(m);});}},function(e){_();o.reject([]);});return o.promise();};this.getSelectedFFValues=function(){var F=jQuery.Deferred();var a=C.getSelectedValues();a.then(function(s){F.resolve(s);},function(e){_();F.resolve([]);});return F.promise();};this.setSelectedFFValues=function(F){C.setSelectedValues(F);};};
