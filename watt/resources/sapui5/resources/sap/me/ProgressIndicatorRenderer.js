/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(['jquery.sap.global'],function(q){"use strict";var P={};P.render=function(r,p){var u=new q.sap.Version(sap.ui.getCore().getConfiguration().getCompatibilityVersion("sapMeProgressIndicator"));if(u.compareTo("1.16")>=0){q.sap.log.error("The sap.me.ProgressIndicator control is not supported as of SAPUI5 version 1.16. Please us sap.m.ProgressIndicator instead.");return;}var a=r;var w=p.getWidth();var b=p.getPercentValue();var c;var d;if(!p.getVisible()){return;}if(b>100){c=(10000/b)+'%';}else{c='100%';}a.write('<DIV');a.writeControlData(p);a.writeAttribute('tabIndex','0');if(p.getWidth()&&p.getWidth()!=''){a.writeAttribute('style','width:'+w+';');}if(p.getTooltip_AsString()){a.writeAttributeEscaped('title',p.getDisplayValue()+'- '+p.getTooltip_AsString());}else{a.writeAttributeEscaped('title',p.getDisplayValue());}a.addClass('sapUIMeProgInd');a.writeClasses();a.write('>');a.write('<DIV');a.writeAttribute('id',p.getId()+'-box');if(p.getWidth()&&p.getWidth()!=''){a.writeAttribute('style','width:'+c+';');}a.addClass('sapUIMeProgIndBorder');a.writeClasses();a.write('>');a.write('<DIV');a.writeAttribute('id',p.getId()+'-bar');a.writeAttribute('onselectstart',"return false");a.writeAttribute('style','width:'+p.getPercentValue()+'%;');var B=p.getBarColor();a.addClass("sapUIMeProgIndBar");if(B!=""){a.addClass("sapUIMeProgIndBar"+q.sap.encodeHTML(B));}a.writeClasses();a.write('>');a.write('<DIV');a.writeAttribute('id',p.getId()+'-end');if(b>100){a.addClass('sapUIMeProgIndEnd');}else{a.addClass('sapUIMeProgIndEndHidden');}a.writeClasses();a.writeAttribute('style','position: relative; left:'+c);a.write('>');a.write('</DIV>');a.write('<SPAN');a.addClass('sapUIMeProgIndFont');a.writeClasses();a.write('>');if(p.getShowValue()&&p.getShowValue()==true){if(p.getDisplayValue()&&p.getDisplayValue()!=''){a.writeEscaped(p.getDisplayValue());}}a.write('</SPAN>');a.write('</DIV>');a.write('</DIV>');a.write('</DIV>');};return P;},true);