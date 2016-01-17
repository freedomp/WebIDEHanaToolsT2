/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
jQuery.sap.declare("sap.apf.core.metadataFacade");jQuery.sap.require("sap.apf.utils.utils");
sap.apf.core.MetadataFacade=function(I,a){this.type="metadataFacade";var m=I.metadataProperty;var M=I.messageHandler;var o=I.metadataFactory;var p;var P;var b={};this.getAllProperties=function(c){if(p){c(p);}else{var d=g();var e;p=[];for(var i=0;i<d.length;i++){e=o.getMetadata(d[i]);p=p.concat(e.getAllProperties());}p=sap.apf.utils.eliminateDuplicatesInArray(M,p);c(p);}};this.getAllParameterEntitySetKeyProperties=function(c){if(P){c(P);}else{var d=g();var e;P=[];for(var i=0;i<d.length;i++){e=o.getMetadata(d[i]);P=P.concat(e.getParameterEntitySetKeyPropertiesForService());}P=sap.apf.utils.eliminateDuplicatesInArray(M,P);c(P);}};this.getProperty=function(n,c){if(b[n]){c(b[n]);}else{var d=g();var e;var f;for(var i=0;i<d.length;i++){f=o.getMetadata(d[i]);e=f.getAttributes(n);if(e.name){if(f.getParameterEntitySetKeyPropertiesForService().indexOf(n)>-1){e.isParameterEntitySetKeyProperty=true;}if(f.getAllKeys().indexOf(n)>-1){e.isKey=true;}break;}}for(var h in e){if(h==="dataType"){for(var j in e.dataType){e[j]=e.dataType[j];}}}var k=new m(e);b[n]=k;c(b[n]);}};function g(){if(typeof a==="string"){return[a];}else{return o.getServiceDocuments();}}};
