/*!
 * SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright
		2009-2015 SAP SE. All rights reserved
 */
sap.ui.define(['sap/ui/core/Control','./library'],function(C,l){"use strict";var O=C.extend("sap.uxap.ObjectPageHeaderContent",{metadata:{library:"sap.uxap",properties:{contentDesign:{type:"sap.uxap.ObjectPageHeaderDesign",group:"Misc",defaultValue:sap.uxap.ObjectPageHeaderDesign.Light}},aggregations:{content:{type:"sap.ui.core.Control",multiple:true,singularName:"content"}}}});O.prototype._getLayoutDataForControl=function(c){var L=c.getLayoutData();if(!L){return;}else if(L instanceof sap.uxap.ObjectPageHeaderLayoutData){return L;}else if(L.getMetadata().getName()=="sap.ui.core.VariantLayoutData"){var a=L.getMultipleLayoutData();for(var i=0;i<a.length;i++){var o=a[i];if(o instanceof sap.uxap.ObjectPageHeaderLayoutData){return o;}}}};return O;});
