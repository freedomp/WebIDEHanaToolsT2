/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */
sap.ui.define(['sap/ui/fl/Utils','jquery.sap.global','sap/ui/fl/changeHandler/Base'],function(U,q,B){"use strict";var R=function(){};R.prototype=q.sap.newObject(B.prototype);R.prototype.applyChange=function(c,C){var o=c.getDefinition();if(o.texts&&o.texts.fieldLabel&&o.texts.fieldLabel.value){if(!C){throw new Error("no Control provided for renaming");}if(typeof C.setLabel==='function'){C.setLabel(o.texts.fieldLabel.value);}else if(typeof C.setTitle==='function'){C.setTitle(o.texts.fieldLabel.value);}else{throw new Error('Control does not support "renameField" change');}}else{U.log.error("Change does not contain sufficient information to be applied: ["+o.layer+"]"+o.namespace+"/"+o.fileName+"."+o.fileType);}};R.prototype.completeChangeContent=function(c,s){var C=c.getDefinition();if(s.fieldLabel){this.setTextInChange(C,"fieldLabel",s.fieldLabel,"XFLD");}else{throw new Error("oSpecificChangeInfo.fieldLabel attribute required");}};return R;},true);
