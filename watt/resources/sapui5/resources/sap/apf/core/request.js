/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
jQuery.sap.declare('sap.apf.core.request');jQuery.sap.require('sap.apf.utils.utils');jQuery.sap.require('sap.apf.core.utils.filter');jQuery.sap.require('sap.apf.core.utils.filterTerm');jQuery.sap.require('sap.ui.thirdparty.datajs');jQuery.sap.require("sap.apf.core.utils.filterSimplify");(function(){'use strict';sap.apf.core.Request=function(I,c){var m=I.messageHandler;var C=I.coreApi;var s=c.service;var a=c.selectProperties;var u=C.getUriGenerator();var M;if(s===undefined){M=m.createMessageObject({code:'5015',aParameters:[c.id]});m.putMessage(M);}var o=C.getMetadata(s);var U=o.getUriComponents(c.entityType);var e,b;if(U){e=U.entitySet;b=U.navigationProperty;}m.check(e!==undefined,'Invalid request configuration: An entityset does not exist under the service '+c.entityType);m.check(b!==undefined,'Invalid request configuration: A usable navigation does not exist for the service '+c.entityType);this.type=c.type;this.sendGetInBatch=function(F,h,R){var i;var p=r(F);var j;var k;g(F);if(F&&F.getProperties){j=F.reduceToProperty(o.getFilterableProperties(e));i=(I.manifests&&I.manifests.manifest)||{};if(C.getStartParameterFacade().isFilterReductionActive()||(i["sap.apf"]&&i["sap.apf"].activateFilterReduction)){k=new sap.apf.core.utils.FilterReduction();j=k.filterReduction(m,j);}}d(R);var P=R&&R.paging;var S=R&&R.orderby;var l=u.buildUri(m,e,a,j,p,S,P,undefined,f,b);var n={method:'POST',headers:{'x-csrf-token':C.getXsrfToken(s)},requestUri:u.getAbsolutePath(s)+'$batch',data:{__batchRequests:[{requestUri:l,method:'GET',headers:{'Accept-Language':sap.ui.getCore().getConfiguration().getLanguage(),'x-csrf-token':C.getXsrfToken(s)}}]}};var q=function(t,v){var w={};var x='';if(t&&t.__batchResponses&&t.__batchResponses[0].data){w.data=t.__batchResponses[0].data.results;w.metadata=C.getEntityTypeMetadata(c.service,c.entityType);if(t.__batchResponses[0].data.__count){w.count=parseInt(t.__batchResponses[0].data.__count,10);}}else if(t&&t.__batchResponses[0]&&t.__batchResponses[0].response&&t.__batchResponses[0].message){x=v.requestUri;var y=t.__batchResponses[0].message;var z=t.__batchResponses[0].response.body;var H=t.__batchResponses[0].response.statusCode;w=m.createMessageObject({code:'5001',aParameters:[H,y,z,x]});}else{x=v.requestUri||l;w=m.createMessageObject({code:'5001',aParameters:['unknown','unknown error','unknown error',x]});}h(w,false);};var E=function(t){var v='unknown error';var w='unknown error';var x=l;if(t.message!==undefined){v=t.message;}var H='unknown';if(t.response&&t.response.statusCode){H=t.response.statusCode;w=t.response.statusText||'';x=t.response.requestUri||l;}if(t.messageObject&&t.messageObject.type==='messageObject'){h(t.messageObject);}else{h(m.createMessageObject({code:'5001',aParameters:[H,v,w,x]}));}};C.odataRequest(n,q,E,OData.batchHandler);};function f(p,v){var h="'";var E=o.getPropertyMetadata(e,p);if(E&&E.dataType){return sap.apf.utils.formatValue(v,E.dataType.type);}if(typeof v==='number'){return v;}return h+sap.apf.utils.escapeOdata(v)+h;}function d(R){var p,i;if(!R){return;}p=Object.getOwnPropertyNames(R);for(i=0;i<p.length;i++){if(p[i]!=='orderby'&&p[i]!=='paging'){m.putMessage(m.createMessageObject({code:'5032',aParameters:[e,p[i]]}));}}}function g(F){var h=o.getFilterableProperties(e);var R='';var E=o.getEntityTypeAnnotations(e);var i;if(E.requiresFilter!==undefined&&E.requiresFilter==='true'){if(E.requiredProperties!==undefined){R=E.requiredProperties;}}if(R===''){return;}if(jQuery.inArray(R,h)===-1){i=m.createMessageObject({code:'5006',aParameters:[e,R]});m.putMessage(i);}var p=F.getProperties();if(jQuery.inArray(R,p)===-1){i=m.createMessageObject({code:'5005',aParameters:[e,R]});m.putMessage(i);}}function r(F){var p={};var P;var n;var t;var i;var h;P=o.getParameterEntitySetKeyProperties(e);if(P!==undefined){n=P.length;}else{n=0;}if(n>0){for(i=0;i<n;i++){if(F&&F instanceof sap.apf.core.utils.Filter){t=F.getFilterTermsForProperty(P[i].name);h=t[t.length-1];}if(h instanceof sap.apf.core.utils.FilterTerm){j(i,h.getValue());}else if(P[i].defaultValue){j(i,P[i].defaultValue);}else{m.putMessage(m.createMessageObject({code:'5016',aParameters:[P[i].name]}));}}}return p;function j(k,v){var l;if(P[k].dataType.type==='Edm.String'){p[P[k].name]=(jQuery.sap.encodeURL("'"+sap.apf.utils.escapeOdata(v)+"'"));}else if(P[k].dataType.type){l=sap.apf.utils.formatValue(v,P[k].dataType.type);if(typeof l==='string'){p[P[k].name]=jQuery.sap.encodeURL(l);}else{p[P[k].name]=l;}}else if(typeof v==='string'){p[P[k].name]=jQuery.sap.encodeURL(sap.apf.utils.escapeOdata(v));}else{p[P[k].name]=v;}}}};}());
