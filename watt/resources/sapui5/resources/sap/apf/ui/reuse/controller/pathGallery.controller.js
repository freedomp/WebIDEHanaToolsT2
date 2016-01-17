/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
sap.ui.controller("sap.apf.ui.reuse.controller.pathGallery",{onInit:function(){this.oCoreApi=this.getView().getViewData().oInject.oCoreApi;this.oUiApi=this.getView().getViewData().oInject.uiApi;this.oSerializationMediator=this.getView().getViewData().oInject.oSerializationMediator;},openPathGallery:function(){if(this.oHierchicalPathGalleryDialog){this.oHierchicalPathGalleryDialog.destroy();}this.oHierchicalPathGalleryDialog=new sap.ui.jsfragment("sap.apf.ui.reuse.fragment.pathGallery",this);var m=new sap.ui.model.json.JSONModel();var j=this.getPathGalleryData();m.setData(j);this.oHierchicalPathGalleryDialog.setModel(m);this.oHierchicalPathGalleryDialog.open();},getPathGalleryData:function(){var s=this;var a=this.getView().getViewData()?this.getView().getViewData().jsonData:{};var f=function(){var c={"steps":s.oCoreApi.getStepTemplates()};return c;};if(a.GalleryElements.length!==0){var b=a.GalleryElements;var c=f();var i,j,k,d;for(i=0;i<b.length;i++){for(j=0;j<b[i].StructuredAnalysisPath.steps.length;j++){for(k=0;k<c.steps.length;k++){var e=b[i].StructuredAnalysisPath.steps[j].stepId;var g=b[i].StructuredAnalysisPath.steps[j].selectedRepresentationId;if(e===c.steps[k].id){for(d in c.steps[k].getRepresentationInfo()){if(g===c.steps[k].getRepresentationInfo()[d].representationId){a.GalleryElements[i].StructuredAnalysisPath.steps[j].imgSrc=c.steps[k].getRepresentationInfo()[d].picture;a.GalleryElements[i].StructuredAnalysisPath.steps[j].title=s.oCoreApi.getTextNotHtmlEncoded(c.steps[k].title.key);}}}}}}}return a;},openPath:function(p,g,a){var s=this;var m;var c=s.oUiApi.getAnalysisPath().getCarousel();this.oUiApi.getAnalysisPath().getCarousel().oController.removeAllSteps();s.oSerializationMediator.openPath(g,(function(s){return function(r,e,b){if(b===undefined&&(typeof r==="object")){s.oUiApi.getAnalysisPath().getController().isOpenPath=true;s.oUiApi.contextChanged();s.oUiApi.getAnalysisPath().getController().refresh(-1);s.oCoreApi.updatePath(s.oUiApi.getAnalysisPath().getController().callBackForUpdatePath.bind(s.oUiApi.getAnalysisPath().getController()));s.oUiApi.getAnalysisPath().oSavedPathName.setTitle(p);s.oUiApi.getAnalysisPath().getController().bIsDirtyState=false;if(s.oHierchicalPathGalleryDialog!==undefined){s.oHierchicalPathGalleryDialog.close();}c.rerender();s.oUiApi.getLayoutView().setBusy(false);}else{m=s.oCoreApi.createMessageObject({code:"6008",aParameters:[p]});m.setPrevious(b);s.oUiApi.getLayoutView().setBusy(false);s.oCoreApi.putMessage(m);}};}(this)),a);}});
