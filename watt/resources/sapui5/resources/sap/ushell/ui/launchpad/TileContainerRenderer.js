// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
(function(){"use strict";jQuery.sap.require("sap.ushell.resources");jQuery.sap.declare("sap.ushell.ui.launchpad.TileContainerRenderer");sap.ushell.ui.launchpad.TileContainerRenderer={};sap.ushell.ui.launchpad.TileContainerRenderer.render=function(r,c){var t=c.getTiles(),h=c.getHeaderActions(),b=c.getBeforeContent(),a=c.getAfterContent(),f=c.getFooterContent()||[],v=false,d,l=c.getLinks();r.write("<div");r.writeControlData(c);r.addClass("sapUshellTileContainer");r.writeClasses();r.writeAccessibilityState(undefined,{role:"list"});r.write(">");if(b.length){r.write("<div");r.addClass("sapUshellTileContainerBeforeContent");r.writeClasses();r.write(">");jQuery.each(b,function(){r.renderControl(this);});r.write("</div>");}r.write("<div");r.addClass("sapUshellTileContainerContent");if(c.getIsGroupLocked()){r.addClass("sapUshellTileContainerLocked");}if(c.getDefaultGroup()){r.addClass("sapUshellTileContainerDefault");}if(c.getShowBackground()){r.addClass("sapUshellTileContainerEditMode");}r.writeClasses();r.writeAttribute("tabindex","-1");r.write(">");if(c.getShowDragIndicator()){r.write("<div");r.addClass("sapUshellCircleBase");r.writeClasses();r.write(">");r.write("<div");r.addClass("sapUshellCircle");r.writeClasses();r.write(">");r.write("</div>");r.write("<div");r.addClass("sapUshellCircle");r.writeClasses();r.write(">");r.write("</div>");r.write("<div");r.addClass("sapUshellCircle");r.writeClasses();r.write(">");r.write("</div>");r.write("<div");r.addClass("sapUshellCircle");r.writeClasses();r.write(">");r.write("</div>");r.write("</div>");}if(c.getShowHeader()){r.write("<div");r.addClass("sapUshellTileContainerHeader");r.writeClasses();if(c.getIeHtml5DnD()&&!c.getIsGroupLocked()&&!c.getDefaultGroup()&&c.getTileActionModeActive()){r.writeAttribute("draggable","true");}r.writeAccessibilityState(c,{label:sap.ushell.resources.i18n.getText("tileContainerHeader")});r.write(">");r.write("<div");r.writeAttribute("id",c.getId()+"-title");r.write(">");r.write("<");r.write(c.getHeaderLevel().toLowerCase());r.addClass('sapUshellContainerTitle');r.addClass("sapUiStrongBackgroundTextColor");r.writeClasses();r.writeAttributeEscaped("title",c.getHeaderText());r.writeAccessibilityState(c,{label:sap.ushell.resources.i18n.getText("tileContainerTitle")+c.getHeaderText()});r.write(">");r.writeEscaped(c.getHeaderText());r.write("</");r.write(c.getHeaderLevel().toLowerCase());r.write(">");if(c.getShowIcon()){c.oIcon.removeStyleClass('sapUshellContainerIconHidden');}else{c.oIcon.addStyleClass('sapUshellContainerIconHidden');}r.renderControl(c.oIcon);r.renderControl(c.oEditInputField);r.write("<div");r.addClass('sapUshellContainerHeaderActions');r.writeClasses();r.write(">");jQuery.each(h,function(){r.renderControl(this);});r.write("</div>");r.write("</div>");r.write("</div>");}r.write("<div");d=c.data('containerHeight');if(d){r.writeAttribute("style",'height:'+d);}r.addClass('sapUshellTilesContainer-sortable');r.addClass('sapUshellInner');r.writeClasses();r.write(">");jQuery.each(t,function(){if(this.getVisible()){v=true;}if(this.getVisible){r.renderControl(this);}});if(c.getShowPlaceholder()){r.renderControl(c.oPlusTile);}if(c.getShowNoData()){this.renderNoData(r,c,!t.length||!v);}r.write("</div>");if(l.length>0){if(c.getShowBackground()&&!(c.getIsGroupLocked()&&t.length===0)){r.write("<div");r.addClass('sapUshellTilesContainerSeparator');r.writeClasses();r.write(">");r.write("</div>");}r.write("<div");r.addClass('sapUshellLinksContainer');r.writeClasses();r.write(">");jQuery.each(l,function(){r.renderControl(this);});r.write("</div>");}if(f.length>0){r.write("<footer");r.addClass('sapUshellTilesContainerFtr');r.writeClasses();r.write(">");jQuery.each(f,function(){r.renderControl(this);});r.write("</footer>");}r.write("</div>");if(a.length){r.write("<div");r.addClass("sapUshellTileContainerAfterContent");r.writeClasses();r.write(">");jQuery.each(a,function(){r.renderControl(this);});r.write("</div>");}r.write("</div>");};sap.ushell.ui.launchpad.TileContainerRenderer.renderNoData=function(r,c,d){r.write("<div id='"+c.getId()+"-listNoData' class='sapUshellNoFilteredItems sapUiStrongBackgroundTextColor'>");if(d){if(c.getNoDataText()){r.writeEscaped(c.getNoDataText());}else{r.writeEscaped(c.getNoDataText(sap.ushell.resources.i18n.getText("noFilteredItems")));}}else{r.writeEscaped("");}r.write("</div>");};}());
