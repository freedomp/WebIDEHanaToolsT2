/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
jQuery.sap.declare("sap.apf.utils.serializationMediator");
sap.apf.utils.SerializationMediator=function(i){this.savePath=function(a,b,c){var e;i.startFilterHandler.serialize().done(d);function d(s){e={filterIdHandler:i.filterIdHandler.serialize(),startFilterHandler:s};if(typeof a==='string'&&typeof b==='function'){i.coreApi.savePath(a,b,e);}else if(typeof a==='string'&&typeof b==='string'&&typeof c==='function'){i.coreApi.savePath(a,b,c,e);}}};this.openPath=function(p,c,n){var C=function(r,e,m){if(r&&r.path&&r.path.SerializedAnalysisPath&&r.path.SerializedAnalysisPath.filterIdHandler){i.filterIdHandler.deserialize(r.path.SerializedAnalysisPath.filterIdHandler);delete r.path.SerializedAnalysisPath.filterIdHandler;}if(r&&r.path&&r.path.SerializedAnalysisPath&&r.path.SerializedAnalysisPath.startFilterHandler){i.startFilterHandler.deserialize(r.path.SerializedAnalysisPath.startFilterHandler);delete r.path.SerializedAnalysisPath.startFilterHandler;}c(r,e,m);};i.coreApi.openPath(p,C,n);};this.deletePath=function(p,c){i.coreApi.deletePath(p,c);};this.readPaths=function(c){i.coreApi.readPaths(c);};};
