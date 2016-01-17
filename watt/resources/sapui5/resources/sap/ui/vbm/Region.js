/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */
sap.ui.define(['sap/ui/core/Element','./library'],function(E,l){"use strict";var R=E.extend("sap.ui.vbm.Region",{metadata:{library:"sap.ui.vbm",properties:{color:{type:"sap.ui.core.CSSColor",group:"Appearance",defaultValue:null},code:{type:"string",group:"Misc",defaultValue:null},select:{type:"boolean",group:"Misc",defaultValue:false}},events:{click:{parameters:{code:{type:"string"}}},contextMenu:{parameters:{code:{type:"string"}}}}}});return R;});
