/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */
sap.ui.define(['jquery.sap.global','sap/m/LinkRenderer'],function(q,L){"use strict";var S={};S.render=function(r,c){var R=true;if(c.getIgnoreLinkRendering()){var o=c._getInnerControl();if(o){r.write("<div ");r.writeControlData(c);r.writeClasses();r.write(">");r.renderControl(o);r.write("</div>");R=false;}}if(R){L.render.call("",r,c);}};return S;},true);
