/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */
sap.ui.define(['jquery.sap.global'],function(q){"use strict";var V={};V.render=function(r,c){r.write("<div ");r.writeControlData(c);r.addClass("sapUiCompVarMngmt");r.writeClasses();r.write(">");r.renderControl(c.oVariantLayout);r.write("</div>");};return V;},true);
