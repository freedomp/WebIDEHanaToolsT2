/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */
sap.ui.define(['jquery.sap.global'],function(q){"use strict";var F={};F.render=function(r,c){r.write("<div");r.writeControlData(c);r.addClass("sapUiCompFieldList");r.writeClasses();r.write(">");F.renderNodes(r,c);r.write("</div>");};F.renderNodes=function(r,c){var n,l,i;n=c.getNodes();l=n.length;for(i=0;i<l;i++){r.renderControl(n[i]);}};return F;},true);
