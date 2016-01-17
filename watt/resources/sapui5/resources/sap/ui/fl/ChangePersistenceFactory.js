/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2014-2015 SAP SE. All rights reserved
 */
sap.ui.define(["jquery.sap.global","sap/ui/fl/ChangePersistence","sap/ui/fl/Utils"],function(q,C,U){"use strict";var a={};a._instanceCache={};a.getChangePersistenceForComponent=function(c){var o;if(!a._instanceCache[c]){o=new C(c);a._instanceCache[c]=o;}return a._instanceCache[c];};a.getChangePersistenceForControl=function(c){var s;s=this._getComponentClassNameForControl(c);return a.getChangePersistenceForComponent(s);};a._getComponentClassNameForControl=function(c){return U.getComponentClassName(c);};return a;},true);
