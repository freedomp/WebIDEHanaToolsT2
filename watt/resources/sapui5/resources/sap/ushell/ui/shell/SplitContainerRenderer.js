/*!
 * ${copyright}
 */
sap.ui.define(['jquery.sap.global'],function(q){"use strict";var S={};S.render=function(r,c){var i=c.getId();var v=c.getOrientation()===sap.ui.core.Orientation.Vertical;r.write("<div");r.writeControlData(c);r.addClass("sapUshellSpltCont");r.addClass("sapUshellSpltCont"+(v?"V":"H"));if(sap.ui.getCore().getConfiguration().getAnimation()){r.addClass("sapUshellSpltContAnim");}if(!c.getShowSecondaryContent()){r.addClass("sapUshellSpltContPaneHidden");}r.writeClasses();r.write(">");var s=i+"-pane";var w=c.getShowSecondaryContent()?c.getSecondaryContentSize():"0";r.write("<aside id='",s,"' style='width:",w,"'");r.addClass("sapUshellSpltContPane");if(!c.getShowSecondaryContent()){r.addClass("sapUshellSplitContSecondClosed");}r.writeClasses();r.write(">");this.renderContent(r,s,c.getSecondaryContent(),c._bRootContent);r.write("</aside>");var C=i+"-canvas";r.write("<section id='",C,"' class='sapUshellSpltContCanvas'>");var a=c.getAggregation('subHeaders');this.renderContent(r,C,c.getContent(),c._bRootContent,a);r.write("</section>");r.write("</div>");};S.renderContent=function(r,i,c,R,s){if(R){this.renderRootContent(r,i,c,s);}else{this.renderSecondaryContent(r,i,c);}};S.renderRootContent=function(r,i,c,s){r.write("<div id='",i,"cntnt' class='sapUshellSpltContCntnt'");r.writeAttribute("data-sap-ui-root-content","true");r.write(">");if(s&&s.length){r.write("<div id='",i,"subHeaders'>");s.forEach(function(o,a){r.renderControl(o);});r.write("</div>");}if(c&&c.length){r.write("<div id='",i,"rootContent' class='sapUshellSpltContainerContentWrapper'>");c.forEach(function(C,a){r.renderControl(C);});r.write("</div>");}r.write("</div>");};S.renderSecondaryContent=function(r,I,c){r.write("<div id='",I,"secondaryContent' class='sapUshellSpltContCntnt'>");for(var i=0;i<c.length;i++){r.renderControl(c[i]);}r.write("</div>");};return S;},true);
