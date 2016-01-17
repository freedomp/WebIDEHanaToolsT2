/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */
sap.ui.define(['jquery.sap.global','sap/ui/fl/changeHandler/Base'],function(q,B){"use strict";var R=function(){};R.prototype=q.sap.newObject(B.prototype);R.prototype.applyChange=function(c,f){if(f.getParent){var g=f.getParent();if(g.removeGroupElement){g.removeGroupElement(f);}}else{throw new Error("no GroupElement control provided for removing the field");}};R.prototype.completeChangeContent=function(c,s){var C=c.getDefinition();if(!C.content){C.content={};}};return R;},true);
