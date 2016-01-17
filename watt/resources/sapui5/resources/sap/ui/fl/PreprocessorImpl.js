/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2014-2015 SAP SE. All rights reserved
 */
sap.ui.define(['jquery.sap.global','sap/ui/core/Component','sap/ui/fl/FlexControllerFactory','sap/ui/fl/Utils'],function(q,C,F,U){'use strict';var a=function(){};a.process=function(v){return Promise.resolve().then(function(){var c=U.getComponentClassName(v);if(!c||c.length===0){var e="no component name found for "+v.getId();q.sap.log.info(e);throw new Error(e);}else{var f=F.create(c);return f.processView(v);}}).then(function(){q.sap.log.debug("flex processing view "+v.getId()+" finished");return v;})["catch"](function(e){var E="view "+v.getId()+": "+e;q.sap.log.info(E);return v;});};return a;},true);
