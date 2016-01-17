/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */
sap.ui.define(['jquery.sap.global'],function(q){"use strict";var F={};F.render=function(r,c){r.write("<div");r.writeControlData(c);r.addClass("sapUiCompFieldListNode");if(!c.getIsVisible()){r.addClass("sapUiCompFieldListNodeIsHidden");}else{r.addClass("sapUiCompFieldListNodeIsVisible");}if(c.getIsSelected()){r.addClass("sapUiCompFieldListNodeIsSelected");}r.writeClasses();r.write(">");F.renderLayout(r,c);F.renderChildren(r,c);r.write("</div>");};F.renderLayout=function(r,c){r.renderControl(c._oLayout);};F.renderChildren=function(r,c){var l,i,C;C=c.getNodes();l=C.length;r.write('<div class="sapUiCompFieldListNodeBorder">');for(i=0;i<l;i++){r.renderControl(C[i]);}r.write("</div>");};return F;},true);
