/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */
sap.ui.define(['jquery.sap.global','sap/ui/comp/library','sap/ui/core/Element'],function(q,l,E){"use strict";var S=E.extend("sap.ui.comp.smartfilterbar.SelectOption",{metadata:{library:"sap.ui.comp",properties:{sign:{type:"string",group:"Misc",defaultValue:'I'},operator:{type:"string",group:"Misc",defaultValue:'EQ'},low:{type:"string",group:"Misc",defaultValue:null},high:{type:"string",group:"Misc",defaultValue:null}}}});S.SIGN={I:"I",include:"I",E:"E",exclude:"E"};S.OPERATOR={EQ:"EQ",NE:"NE",CP:"CP",GT:"GT",GE:"GE",LT:"LT",LE:"LE",NP:"NP",BT:"BT",NB:"NB"};return S;},true);
