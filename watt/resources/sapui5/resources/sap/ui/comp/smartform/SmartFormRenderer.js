/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */
sap.ui.define(['jquery.sap.global','sap/ui/layout/form/Form'],function(q,F){"use strict";var S={};S.render=function(r,c){var t=c._getCustomToolbar()||c._oToolbar;if(c.mProperties["expandable"]){r.write("<div");r.writeControlData(c);r.addClass("sapUiCompSmartForm");r.writeClasses();r.write(">");r.renderControl(c._oPanel);r.write("</div>");}else{r.write("<div");r.writeControlData(c);r.addClass("sapUiCompSmartForm");r.writeClasses();r.write(">");if(t){r.renderControl(t);}r.renderControl(c._oForm);r.write("</div>");}};return S;},true);
