/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2014-2015 SAP SE. All rights reserved
 */
sap.ui.define(['jquery.sap.global','./Base'],function(q,B){"use strict";var H=function(){};H.prototype=q.sap.newObject(B.prototype);H.prototype.applyChange=function(c,C){if(C.setVisible){C.setVisible(false);}else{throw new Error("Provided control instance has no setVisible method");}};H.prototype.completeChangeContent=function(c,s){var C=c.getDefinition();if(!C.content){C.content={};}};return H;},true);
