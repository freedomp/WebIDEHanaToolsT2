/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */
sap.ui.define(['jquery.sap.global'],function(q){"use strict";var D={};D.render=function(r,c){r.write("<div");r.writeControlData(c);r.writeClasses();r.write(">");var C=c.getContent();r.renderControl(C);r.write("</div>");};return D;},true);
