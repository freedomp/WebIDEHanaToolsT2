/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
sap.ui.jsview("sap.apf.ui.reuse.view.step",{getControllerName:function(){return"sap.apf.ui.reuse.controller.step";},stepContent:function(){this.oCoreApi=this.getViewData().oCoreApi;this.oUiApi=this.getViewData().uiApi;this.oTopLayout=new sap.m.FlexBox({items:[new sap.m.Text({text:'{/thumbnail/leftUpper}',tooltip:'{/thumbnail/leftUpper}',wrapping:true,maxLines:2,textAlign:sap.ui.core.TextAlign.Left}).addStyleClass("thumbanilText"),new sap.m.Text({text:'{/thumbnail/rightUpper}',tooltip:'{/thumbnail/rightUpper}',wrapping:true,maxLines:2,textAlign:sap.ui.core.TextAlign.Right}).addStyleClass("thumbanilText")],alignItems:sap.m.FlexAlignItems.Start,justifyContent:sap.m.FlexJustifyContent.SpaceBetween}).addStyleClass("topLayout");this.oThumbnailChartLayout=new sap.m.VBox({height:"80px"}).addStyleClass('ChartArea');this.oThumbnailChartLayout.setBusy(true);this.oBottomLayout=new sap.m.FlexBox({items:[new sap.m.Text({text:'{/thumbnail/leftLower}',tooltip:'{/thumbnail/leftLower}',wrapping:true,maxLines:2,textAlign:sap.ui.core.TextAlign.Left}).addStyleClass("thumbanilText"),new sap.m.Text({text:'{/thumbnail/rightLower}',tooltip:'{/thumbnail/rightLower}',wrapping:true,maxLines:2,textAlign:sap.ui.core.TextAlign.Right}).addStyleClass("thumbanilText")],alignItems:sap.m.FlexAlignItems.Start,justifyContent:sap.m.FlexJustifyContent.SpaceBetween}).addStyleClass("bottomLayout");this.oThumbnailVLayout=new sap.m.VBox({items:[this.oTopLayout,this.oThumbnailChartLayout,this.oBottomLayout],height:"130px"}).addStyleClass('stepThumbnail');this.oStepTitle=new sap.m.Text({text:'{/title}',textAlign:sap.ui.core.TextAlign.Center,wrapping:true,width:"200px"});this.oVChartLayout=new sap.m.VBox({items:[this.oThumbnailVLayout,this.oStepTitle],width:"200px"}).addStyleClass("sapApfStepLayout");var h=new sap.m.VBox({items:[]}).addStyleClass("block-overlay-container");var s=this;h.addEventDelegate({onAfterRendering:function(){var a=new sap.m.Button({text:s.oCoreApi.getTextNotHtmlEncoded("showAnalyticalPath"),press:function(){s.oUiApi.getLayoutView().byId("detailFooter").removeAllContentLeft();s.oUiApi.getLayoutView().byId("applicationView").backToTopMaster();},lite:true,type:"Transparent"});jQuery(h.getDomRef()).on("mouseenter",function(){jQuery(this).addClass("sapThemeBarBG");jQuery(this).css({"opacity":"0.3"});});jQuery(h.getDomRef()).on("touchstart",function(e){var t=e.timeStamp,b=$(this).data('lastTouch')||t,d=t-b,f=e.originalEvent.touches.length;$(this).data('lastTouch',t);if(!d||d>500||f>1){return;}e.preventDefault();$(this).trigger('click').trigger('click');jQuery(this).addClass("sapThemeBarBG");jQuery(this).css({"opacity":"0"});});jQuery(h.getDomRef()).on("mouseleave",function(){jQuery(this).removeClass("sapThemeBarBG");jQuery(this).css({"opacity":"1"});});jQuery(h.getDomRef()).on("touchend touchmove",function(){jQuery(this).removeClass("sapThemeBarBG");jQuery(this).css({"opacity":"0"});});if(sap.ui.Device.system.phone){jQuery(h.getDomRef()).on("tap",function(){s.oUiApi.getLayoutView().getController().hideMaster();s.oUiApi.getLayoutView().byId("detailFooter").removeContentLeft(a);s.oUiApi.getLayoutView().getController().addDetailFooterContentLeft(a);s.oUiApi.getStepContainer().getController().drawStepContent();});}}});this.oVChartTiltleLayout=new sap.m.VBox({items:[h,this.oVChartLayout],width:"200px"}).addStyleClass("sapUiTableCCnt");return this.oVChartTiltleLayout;},createContent:function(c){var s=this.stepContent();return s;},toggleActiveStep:function(){var a=this.oUiApi.getAnalysisPath().getCarousel().stepViews;for(var i in a){if(a[i].oThumbnailVLayout.hasStyleClass('sapThemeBaseBG-asBackgroundColor')){a[i].oThumbnailVLayout.removeStyleClass('sapThemeBaseBG-asBackgroundColor');a[i].oStepTitle.removeStyleClass('activeStepTitle');a[i].oThumbnailVLayout.removeStyleClass('activeStepThumbnail');break;}}this.oThumbnailVLayout.addStyleClass('sapThemeBaseBG-asBackgroundColor');this.oStepTitle.addStyleClass('activeStepTitle');this.oThumbnailVLayout.addStyleClass('activeStepThumbnail');}});
