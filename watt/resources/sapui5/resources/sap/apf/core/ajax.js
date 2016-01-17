/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
jQuery.sap.declare("sap.apf.core.ajax");jQuery.sap.require("sap.apf.core.utils.checkForTimeout");
sap.apf.core.ajax=function(s){var a=jQuery.extend(true,{},s);var b=a.beforeSend;var S=a.success;var e=a.error;a.beforeSend=function(j,c){if(b){b(j,c);}};a.success=function(d,t,j){var m=sap.apf.core.utils.checkForTimeout(j);if(m){e(d,"error",undefined,m);}else{S(d,t,j);}};a.error=function(j,t,c){var m=sap.apf.core.utils.checkForTimeout(j);if(m){e(j,t,c,m);}else{e(j,t,c);}};return jQuery.ajax(a);};
