sap.ui.define(['sap/m/ToolbarRenderer','sap/ui/core/Renderer'],function(T,R){"use strict";var A=R.extend(T);A.renderBarContent=function(r,t){if(t._bHasButtonsBar){r.renderControl(t._oArrowLeft);r.write("<div");r.writeAttributeEscaped("id",t.getId()+"-scrollContainer");var o=sap.uxap.i18nModel.getResourceBundle();r.writeAttributeEscaped("aria-label",o.getText("ANCHOR_BAR_LABEL"));r.addClass("sapUxAPAnchorBarScrollContainer");r.writeClasses();r.write(">");r.write("<div");r.writeAttributeEscaped("id",t.getId()+"-scroll");r.write(">");T.renderBarContent.apply(this,arguments);r.write("</div>");r.write("</div>");r.renderControl(t._oArrowRight);}sap.m.BarInPageEnabler.addChildClassTo(t._oSelect,t);r.renderControl(t._oSelect);};return A;},true);