/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
jQuery.sap.declare("sap.apf.core.odataRequest");jQuery.sap.require("sap.ui.thirdparty.datajs");jQuery.sap.require("sap.apf.core.utils.checkForTimeout");
sap.apf.core.odataRequestWrapper=function(m,r,s,e,b){function a(d,f){var M=sap.apf.core.utils.checkForTimeout(f);var E={};if(M){E.messageObject=M;e(E);}else{s(d,f);}}function c(E){var M=sap.apf.core.utils.checkForTimeout(E);if(M){E.messageObject=M;}e(E);}OData.request(r,a,c,b);};
