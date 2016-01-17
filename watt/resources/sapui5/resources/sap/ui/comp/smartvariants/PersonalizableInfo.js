/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */
sap.ui.define(['jquery.sap.global','sap/ui/comp/library','sap/ui/core/Element'],function(q,l,E){"use strict";var P=E.extend("sap.ui.comp.smartvariants.PersonalizableInfo",{metadata:{library:"sap.ui.comp",properties:{type:{type:"string",group:"Misc",defaultValue:null},dataSource:{type:"string",group:"Misc",defaultValue:null},keyName:{type:"string",group:"Misc",defaultValue:null}},associations:{control:{type:"sap.ui.core.Control",multiple:false}}}});P.prototype.addControl=function(c){this.addAssociation("control",c,true);};return P;},true);
