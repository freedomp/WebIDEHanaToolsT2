/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */
sap.ui.define(['jquery.sap.global','sap/ui/fl/changeHandler/Base'],function(q,B){"use strict";var R=function(){};R.prototype=q.sap.newObject(B.prototype);R.prototype.applyChange=function(c,g){var i=null;if(g.getParent){i=g.getParent();if(i){if(i.removeFormContainer){i.removeFormContainer(g);}}}else{throw new Error("no Group control provided for removing the group");}};R.prototype.completeChangeContent=function(c,s){var C=c.getDefinition();if(!C.content){C.content={};}};return R;},true);
