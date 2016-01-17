/*!
 * SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2013 SAP AG. All rights reserved
 */
jQuery.sap.declare("sap.suite.ui.commons.ProcessFlowConnectionRenderer");sap.suite.ui.commons.ProcessFlowConnectionRenderer={};
sap.suite.ui.commons.ProcessFlowConnectionRenderer.render=function(r,c){var a=c._traverseConnectionData();var z=c.getZoomLevel();var p=sap.suite.ui.commons.ProcessFlowConnectionRenderer;r.write("<div");r.writeAttribute("id",c.getId());r.writeAttribute("role","textbox");r.writeAttribute("aria-readonly",true);r.writeAttributeEscaped("aria-label",c._getAriaText(a));r.write(">");if(c._isHorizontalLine(a)){p._writeHorizontalLine(r,a,z,c);}else if(c._isVerticalLine(a)){p._writeVerticalLine(r,a,z,c._getShowLabels());}else{p._writeSpecialLine(r,a,z,c);}r.write("</div>");};
sap.suite.ui.commons.ProcessFlowConnectionRenderer._writeVerticalLine=function(r,c,z,s){r.write("<div");r.addClass("floatLeft");if(s){r.addClass("sapSuiteUiPFWithLabel");}switch(z){case sap.suite.ui.commons.ProcessFlowZoomLevel.One:r.addClass("boxZoom1Width");r.addClass("boxWideZoom1Height");break;case sap.suite.ui.commons.ProcessFlowZoomLevel.Three:r.addClass("boxZoom3Width");r.addClass("boxWideZoom3Height");break;case sap.suite.ui.commons.ProcessFlowZoomLevel.Four:r.addClass("boxZoom4Width");r.addClass("boxWideZoom4Height");break;default:r.addClass("boxZoom2Width");r.addClass("boxWideZoom2Height");}r.writeClasses();r.write(">");r.write("</div>");r.write("<div");r.addClass("floatLeft");r.addClass("boxMiddleBorderWidth");switch(z){case sap.suite.ui.commons.ProcessFlowZoomLevel.One:r.addClass("boxWideZoom1Height");break;case sap.suite.ui.commons.ProcessFlowZoomLevel.Three:r.addClass("boxWideZoom3Height");break;case sap.suite.ui.commons.ProcessFlowZoomLevel.Four:r.addClass("boxWideZoom4Height");break;default:r.addClass("boxWideZoom2Height");}r.addClass("borderLeft");if(c.top.type===sap.suite.ui.commons.ProcessFlowConnectionType.Planned){r.addClass("borderLeftTypePlanned");}else{r.addClass("borderLeftTypeNormal");}if(c.top.state===sap.suite.ui.commons.ProcessFlowConnectionState.Highlighted){r.addClass("borderLeftStateHighlighted");r.addClass("stateHighlighted");}else if(c.top.state===sap.suite.ui.commons.ProcessFlowConnectionState.Dimmed){r.addClass("borderLeftStateDimmed");}else if(c.top.state===sap.suite.ui.commons.ProcessFlowConnectionState.Selected){r.addClass("borderLeftStateSelected");r.addClass("stateSelected");}else{r.addClass("borderLeftStateRegular");r.addClass("stateRegular");}r.writeClasses();r.write(">");r.write("</div>");sap.suite.ui.commons.ProcessFlowConnectionRenderer._resetFloat(r);};
sap.suite.ui.commons.ProcessFlowConnectionRenderer._writeHorizontalLine=function(r,c,z,C){r.write("<div");r.addClass("boxWideWidth");switch(z){case sap.suite.ui.commons.ProcessFlowZoomLevel.One:r.addClass("boxTopZoom1Height");break;case sap.suite.ui.commons.ProcessFlowZoomLevel.Three:r.addClass("boxTopZoom3Height");break;case sap.suite.ui.commons.ProcessFlowZoomLevel.Four:r.addClass("boxTopZoom4Height");break;default:r.addClass("boxTopZoom2Height");}r.writeClasses();r.write(">");r.write("</div>");r.write("<div");if(c.arrow){r.addClass("parentPosition");if(C._getShowLabels()){r.addClass("sapSuiteUiPFWithLabel");}switch(z){case sap.suite.ui.commons.ProcessFlowZoomLevel.One:r.addClass("boxWideArrowZoom1Width");break;case sap.suite.ui.commons.ProcessFlowZoomLevel.Three:r.addClass("boxWideArrowZoom3Width");break;case sap.suite.ui.commons.ProcessFlowZoomLevel.Four:r.addClass("boxWideArrowZoom4Width");break;default:r.addClass("boxWideArrowZoom2Width");}}else{r.addClass("boxWideWidth");}r.addClass("boxMiddleBorderHeight");r.addClass("borderBottom");if(c.right.type===sap.suite.ui.commons.ProcessFlowConnectionType.Planned){r.addClass("borderBottomTypePlanned");}else{r.addClass("borderBottomTypeNormal");}if(c.right.state===sap.suite.ui.commons.ProcessFlowConnectionState.Highlighted){r.addClass("borderBottomStateHighlighted");r.addClass("stateHighlighted");}else if(c.right.state===sap.suite.ui.commons.ProcessFlowConnectionState.Dimmed){r.addClass("borderBottomStateDimmed");}else if(c.right.state===sap.suite.ui.commons.ProcessFlowConnectionState.Selected){r.addClass("borderBottomStateSelected");r.addClass("stateSelected");}else{r.addClass("borderBottomStateRegular");r.addClass("stateRegular");}r.writeClasses();r.write(">");if(c.labels&&C._showLabels){sap.suite.ui.commons.ProcessFlowConnectionRenderer._renderLabel(r,C,c);}if(c.arrow){r.write("<div");r.addClass("arrowRight");if(c.right.state===sap.suite.ui.commons.ProcessFlowConnectionState.Highlighted){r.addClass("borderLeftStateHighlighted");}else if(c.right.state===sap.suite.ui.commons.ProcessFlowConnectionState.Dimmed){r.addClass("borderLeftStateDimmed");}else if(c.right.state===sap.suite.ui.commons.ProcessFlowConnectionState.Selected){r.addClass("borderLeftStateSelected");}else{r.addClass("borderLeftStateRegular");}r.writeClasses();r.write(">");r.write("</div>");}r.write("</div>");};
sap.suite.ui.commons.ProcessFlowConnectionRenderer._writeSpecialLine=function(r,c,z,C){sap.suite.ui.commons.ProcessFlowConnectionRenderer._writeFirstRowOfSpecialLine(r,c,z,C);sap.suite.ui.commons.ProcessFlowConnectionRenderer._writeSecondRowOfSpecialLine(r,c,z,C);sap.suite.ui.commons.ProcessFlowConnectionRenderer._writeThirdRowOfSpecialLine(r,c,z,C);sap.suite.ui.commons.ProcessFlowConnectionRenderer._resetFloat(r);};
sap.suite.ui.commons.ProcessFlowConnectionRenderer._writeFirstRowOfSpecialLine=function(r,c,z,C){r.write("<div");r.addClass("floatLeft");if(C._getShowLabels()){r.addClass("sapSuiteUiPFWithLabel");}switch(z){case sap.suite.ui.commons.ProcessFlowZoomLevel.One:r.addClass("boxZoom1Width");r.addClass("boxTopZoom1Height");break;case sap.suite.ui.commons.ProcessFlowZoomLevel.Three:r.addClass("boxZoom3Width");r.addClass("boxTopZoom3Height");break;case sap.suite.ui.commons.ProcessFlowZoomLevel.Four:r.addClass("boxZoom4Width");r.addClass("boxTopZoom4Height");break;default:r.addClass("boxZoom2Width");r.addClass("boxTopZoom2Height");}r.writeClasses();r.write(">");r.write("</div>");r.write("<div");if(C._getShowLabels()){r.addClass("sapSuiteUiPFWithLabel");}r.addClass("floatLeft");switch(z){case sap.suite.ui.commons.ProcessFlowZoomLevel.One:r.addClass("boxTopZoom1Height");break;case sap.suite.ui.commons.ProcessFlowZoomLevel.Three:r.addClass("boxTopZoom3Height");break;case sap.suite.ui.commons.ProcessFlowZoomLevel.Four:r.addClass("boxTopZoom4Height");break;default:r.addClass("boxTopZoom2Height");}if(c.hasOwnProperty("top")&&c.top.draw){r.addClass("boxMiddleBorderWidth");r.addClass("borderLeft");if(c.top.type===sap.suite.ui.commons.ProcessFlowConnectionType.Planned){r.addClass("borderLeftTypePlanned");}else{r.addClass("borderLeftTypeNormal");}if(c.top.state===sap.suite.ui.commons.ProcessFlowConnectionState.Highlighted){r.addClass("borderLeftStateHighlighted");r.addClass("stateHighlighted");}else if(c.top.state===sap.suite.ui.commons.ProcessFlowConnectionState.Dimmed){r.addClass("borderLeftStateDimmed");}else if(c.top.state===sap.suite.ui.commons.ProcessFlowConnectionState.Selected){r.addClass("borderLeftStateSelected");r.addClass("stateSelected");}else{r.addClass("borderLeftStateRegular");r.addClass("stateRegular");}}else{r.addClass("boxMiddleWidth");}r.writeClasses();r.write(">");r.write("</div>");};
sap.suite.ui.commons.ProcessFlowConnectionRenderer._writeSecondRowOfSpecialLine=function(r,c,z,C){sap.suite.ui.commons.ProcessFlowConnectionRenderer._resetFloat(r);r.write("<div");r.addClass("floatLeft");if(C._getShowLabels()){r.addClass("sapSuiteUiPFWithLabel");}switch(z){case sap.suite.ui.commons.ProcessFlowZoomLevel.One:r.addClass("boxZoom1Width");break;case sap.suite.ui.commons.ProcessFlowZoomLevel.Three:r.addClass("boxZoom3Width");break;case sap.suite.ui.commons.ProcessFlowZoomLevel.Four:r.addClass("boxZoom4Width");break;default:r.addClass("boxZoom2Width");}if(c.hasOwnProperty("left")&&c.left.draw){r.addClass("boxMiddleBorderHeight");r.addClass("borderBottom");if(c.left.type===sap.suite.ui.commons.ProcessFlowConnectionType.Planned){r.addClass("borderBottomTypePlanned");}else{r.addClass("borderBottomTypeNormal");}if(c.left.state===sap.suite.ui.commons.ProcessFlowConnectionState.Highlighted){r.addClass("borderBottomStateHighlighted");r.addClass("stateHighlighted");}else if(c.left.state===sap.suite.ui.commons.ProcessFlowConnectionState.Dimmed){r.addClass("borderBottomStateDimmed");}else if(c.left.state===sap.suite.ui.commons.ProcessFlowConnectionState.Selected){r.addClass("borderBottomStateSelected");r.addClass("stateSelected");}else{r.addClass("borderBottomStateRegular");r.addClass("stateRegular");}}else{r.addClass("boxMiddleHeight");}r.writeClasses();r.write(">");r.write("</div>");r.write("<div");r.addClass("floatLeft");if(C._getShowLabels()){r.addClass("sapSuiteUiPFWithLabel");}r.addClass("boxMiddleWidth");r.addClass("boxMiddleBorderHeight");if((c.hasOwnProperty("left")&&c.left.draw)||(c.hasOwnProperty("right")&&c.right.draw)||(c.hasOwnProperty("top")&&c.top.draw)||(c.hasOwnProperty("bottom")&&c.bottom.draw)){r.addClass("borderBottom");r.addClass("borderBottomTypeNormal");if(c.right.state===sap.suite.ui.commons.ProcessFlowConnectionState.Highlighted||c.top.state===sap.suite.ui.commons.ProcessFlowConnectionState.Highlighted||c.left.state===sap.suite.ui.commons.ProcessFlowConnectionState.Highlighted||c.bottom.state===sap.suite.ui.commons.ProcessFlowConnectionState.Highlighted){r.addClass("borderBottomStateHighlighted");r.addClass("stateHighlighted");}else if(c.right.state===sap.suite.ui.commons.ProcessFlowConnectionState.Selected||c.top.state===sap.suite.ui.commons.ProcessFlowConnectionState.Selected||c.left.state===sap.suite.ui.commons.ProcessFlowConnectionState.Selected||c.bottom.state===sap.suite.ui.commons.ProcessFlowConnectionState.Selected){r.addClass("borderBottomStateSelected");r.addClass("stateSelected");}else if(c.right.state===sap.suite.ui.commons.ProcessFlowConnectionState.Dimmed||c.top.state===sap.suite.ui.commons.ProcessFlowConnectionState.Dimmed||c.left.state===sap.suite.ui.commons.ProcessFlowConnectionState.Dimmed||c.bottom.state===sap.suite.ui.commons.ProcessFlowConnectionState.Dimmed){r.addClass("borderBottomStateDimmed");}else{r.addClass("borderBottomStateRegular");r.addClass("stateRegular");}}r.writeClasses();r.write(">");r.write("</div>");r.write("<div");r.addClass("floatLeft");if(C._getShowLabels()){r.addClass("sapSuiteUiPFWithLabel");}if(c.arrow){r.addClass("parentPosition");switch(z){case sap.suite.ui.commons.ProcessFlowZoomLevel.One:r.addClass("boxArrowZoom1Width");break;case sap.suite.ui.commons.ProcessFlowZoomLevel.Three:r.addClass("boxArrowZoom3Width");break;case sap.suite.ui.commons.ProcessFlowZoomLevel.Four:r.addClass("boxArrowZoom4Width");break;default:r.addClass("boxArrowZoom2Width");}}else if(C._getShowLabels()){switch(z){case sap.suite.ui.commons.ProcessFlowZoomLevel.One:r.addClass("boxZoom1WidthWithLabel");break;case sap.suite.ui.commons.ProcessFlowZoomLevel.Three:r.addClass("boxZoom3WidthWithLabel");break;case sap.suite.ui.commons.ProcessFlowZoomLevel.Four:r.addClass("boxZoom4WidthWithLabel");break;default:r.addClass("boxZoom2WidthWithLabel");}}else{switch(z){case sap.suite.ui.commons.ProcessFlowZoomLevel.One:r.addClass("boxZoom1Width");break;case sap.suite.ui.commons.ProcessFlowZoomLevel.Three:r.addClass("boxZoom3Width");break;case sap.suite.ui.commons.ProcessFlowZoomLevel.Four:r.addClass("boxZoom4Width");break;default:r.addClass("boxZoom2Width");}}if(c.hasOwnProperty("right")&&c.right.draw){r.addClass("boxMiddleBorderHeight");r.addClass("borderBottom");if(c.right.type===sap.suite.ui.commons.ProcessFlowConnectionType.Planned){r.addClass("borderBottomTypePlanned");}else{r.addClass("borderBottomTypeNormal");}if(c.right.state===sap.suite.ui.commons.ProcessFlowConnectionState.Highlighted){r.addClass("borderBottomStateHighlighted");r.addClass("stateHighlighted");}else if(c.right.state===sap.suite.ui.commons.ProcessFlowConnectionState.Dimmed){r.addClass("borderBottomStateDimmed");}else if(c.right.state===sap.suite.ui.commons.ProcessFlowConnectionState.Selected){r.addClass("borderBottomStateSelected");r.addClass("stateSelected");}else{r.addClass("borderBottomStateRegular");r.addClass("stateRegular");}}else{r.addClass("boxMiddleHeight");}r.writeClasses();r.write(">");if(c.labels&&C._showLabels){sap.suite.ui.commons.ProcessFlowConnectionRenderer._renderLabel(r,C,c);}if(c.arrow){r.write("<div");r.addClass("arrowRight");if(c.hasOwnProperty("right")){if(c.right.state===sap.suite.ui.commons.ProcessFlowConnectionState.Highlighted){r.addClass("borderLeftStateHighlighted");}else if(c.right.state===sap.suite.ui.commons.ProcessFlowConnectionState.Dimmed){r.addClass("borderLeftStateDimmed");}else if(c.right.state===sap.suite.ui.commons.ProcessFlowConnectionState.Selected){r.addClass("borderLeftStateSelected");}else{r.addClass("borderLeftStateRegular");}}r.writeClasses();r.write(">");r.write("</div>");}r.write("</div>");};
sap.suite.ui.commons.ProcessFlowConnectionRenderer._writeThirdRowOfSpecialLine=function(r,c,z,C){sap.suite.ui.commons.ProcessFlowConnectionRenderer._resetFloat(r);r.write("<div");r.addClass("floatLeft");if(C._getShowLabels()){r.addClass("sapSuiteUiPFWithLabel");}switch(z){case sap.suite.ui.commons.ProcessFlowZoomLevel.One:r.addClass("boxZoom1Width");r.addClass("boxBottomZoom1Height");break;case sap.suite.ui.commons.ProcessFlowZoomLevel.Three:r.addClass("boxZoom3Width");r.addClass("boxBottomZoom3Height");break;case sap.suite.ui.commons.ProcessFlowZoomLevel.Four:r.addClass("boxZoom4Width");r.addClass("boxBottomZoom4Height");break;default:r.addClass("boxZoom2Width");r.addClass("boxBottomZoom2Height");}r.writeClasses();r.write(">");r.write("</div>");r.write("<div");if(C._getShowLabels()){r.addClass("sapSuiteUiPFWithLabel");}r.addClass("floatLeft");switch(z){case sap.suite.ui.commons.ProcessFlowZoomLevel.One:r.addClass("boxBottomZoom1Height");break;case sap.suite.ui.commons.ProcessFlowZoomLevel.Three:r.addClass("boxBottomZoom3Height");break;case sap.suite.ui.commons.ProcessFlowZoomLevel.Four:r.addClass("boxBottomZoom4Height");break;default:r.addClass("boxBottomZoom2Height");}if(c.hasOwnProperty("bottom")&&c.bottom.draw){r.addClass("boxMiddleBorderWidth");r.addClass("borderLeft");if(c.bottom.type===sap.suite.ui.commons.ProcessFlowConnectionType.Planned){r.addClass("borderLeftTypePlanned");}else{r.addClass("borderLeftTypeNormal");}if(c.bottom.state===sap.suite.ui.commons.ProcessFlowConnectionState.Highlighted){r.addClass("borderLeftStateHighlighted");r.addClass("stateHighlighted");}else if(c.bottom.state===sap.suite.ui.commons.ProcessFlowConnectionState.Dimmed){r.addClass("borderLeftStateDimmed");}else if(c.bottom.state===sap.suite.ui.commons.ProcessFlowConnectionState.Selected){r.addClass("borderLeftStateSelected");r.addClass("stateSelected");}else{r.addClass("borderLeftStateRegular");r.addClass("stateRegular");}}else{r.addClass("boxMiddleWidth");}r.writeClasses();r.write(">");r.write("</div>");};
sap.suite.ui.commons.ProcessFlowConnectionRenderer._resetFloat=function(r){r.write("<div");r.addClass("floatClear");r.writeClasses();r.write(">");r.write("</div>");};
sap.suite.ui.commons.ProcessFlowConnectionRenderer._renderLabel=function(r,c){var l=c._getVisibleLabel();if(c.getAggregation("_labels")){var L=c.getAggregation("_labels");for(var i=0;i<L.length;i++){if(L[i]._getSelected()){l._setDimmed(false);if(L[i].getId()!==l.getId()){l._setSelected(true);L[i]._setSelected(false);}}}}if(l){r.renderControl(l);}};