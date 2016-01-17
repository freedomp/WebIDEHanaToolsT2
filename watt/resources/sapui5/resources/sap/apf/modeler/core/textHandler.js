/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP SE. All rights reserved
 */
jQuery.sap.declare("sap.apf.modeler.core.textHandler");(function(){'use strict';sap.apf.modeler.core.TextHandler=function(){var b,B;this.getMessageText=function(r,p){return this.getText(r,p);};this.getText=function(r,p){var t;t=B.getText(r,p);if(t!==r){return t;}return b.getText(r,p);};function i(){var u;var I=sap.ui.getCore().getConfiguration().getOriginInfo();var m=jQuery.sap.getModulePath("sap.apf");u=m+'/modeler/resources/i18n/texts.properties';B=jQuery.sap.resources({url:u,includeInfo:I});u=m+'/resources/i18n/apfUi.properties';b=jQuery.sap.resources({url:u,includeInfo:I});}i();};}());
