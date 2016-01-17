/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2014-2015 SAP SE. All rights reserved
 */
sap.ui.define(['jquery.sap.global','./Base'],function(q,B){"use strict";var U=function(){};U.prototype=q.sap.newObject(B.prototype);U.prototype.applyChange=function(c,C){if(C.setVisible){C.setVisible(true);}else{throw new Error("Provided control instance has no setVisible method");}};U.prototype.completeChangeContent=function(c,s){var C=c.getDefinition();if(!C.content){C.content={};}};return U;},true);
