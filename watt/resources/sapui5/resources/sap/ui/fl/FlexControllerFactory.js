/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2014-2015 SAP SE. All rights reserved
 */
sap.ui.define(["jquery.sap.global","sap/ui/fl/FlexController","sap/ui/fl/Utils"],function(q,F,U){"use strict";var a={};a._instanceCache={};a.create=function(c){var f=a._instanceCache[c];if(!f){f=new F(c);a._instanceCache[c]=f;}return f;};a.createForControl=function(c){var C=U.getComponentClassName(c);return a.create(C);};return a;},true);
