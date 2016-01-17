/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
/* global window*/
/**
 *@class stepGallery
 *@name  stepGallery Fragment
 *@description Holds the available steps of configuration and displays them in a dialog using js fragment
 *@memberOf sap.apf.ui.reuse.view
 * 
 */
sap.ui.jsfragment("sap.apf.ui.reuse.fragment.stepGallery", {
	createContent : function(oController) {
		var self = this;
		this.contentWidth = jQuery(window).height() * 0.6 + "px"; // height and width for the dialog relative to the window
		this.contentHeight = jQuery(window).height() * 0.6 + "px";
		this.oCoreApi = oController.oCoreApi;
		this.oUiApi = oController.oUiApi;
		var stepGalleryCategoryList = new sap.m.List().bindItems({
			path : '/GalleryElements',
			template : new sap.m.StandardListItem({
				title : '{title}',
				tooltip : '{title}',
				type : "Navigation",
				press : function(oEvent) {
					var oBindingContext = oEvent.getSource().getBindingContext(); // evt.getSource() is the ListItem
					stepGalleryStepPage.setBindingContext(oBindingContext); //set the data context to the page to which navigation has to happen
					stepGalleryStepPage.setTitle(oEvent.getSource().getTitle()); //set the title of step page as the selected category
					self.oStepGalleryNavContainer.to(self.oStepGalleryNavContainer.getPages()[1]); // navigate to the step page
				}
			})
		});
		var stepGalleryStepList = new sap.m.List().bindItems({
			path : 'stepTemplates',
			template : new sap.m.StandardListItem({
				title : '{title}',
				tooltip : '{title}',
				type : "Navigation",
				press : function(oEvent) {
					var oBindingContext = oEvent.getSource().getBindingContext(); // evt.getSource() is the ListItem
					stepGalleryRepresentationPage.setBindingContext(oBindingContext); //set the data context to the page to which navigation has to happen
					stepGalleryRepresentationPage.setTitle(oEvent.getSource().getTitle());//set the title of representation page as the selected step
					self.oStepGalleryNavContainer.to(self.oStepGalleryNavContainer.getPages()[2]);// navigate to the representation page
				}
			})
		});
		var onRepresentationPress = function(oEvent) {
			self.oUiApi.getLayoutView().setBusy(true);
			var eventBindingContext = oEvent.getSource().getBindingContext().sPath.split('/');
			var categoryIndex = eventBindingContext[2];
			var stepIndex = eventBindingContext[4];
			var representationIndex = eventBindingContext[6];
			var stepDetails = oController.getStepDetails(categoryIndex, stepIndex);
			oController.onStepPress(stepDetails.id, stepDetails.representationtypes[representationIndex].representationId);
		};
		var stepGalleryRepresentationList = new sap.m.List().bindItems({
			path : 'representationtypes',
			template : new sap.m.StandardListItem({
				title : '{title}',
				icon : '{picture}',
				tooltip : '{title}',
				type : "Active",
				press : onRepresentationPress
			}).bindProperty("description", "sortDescription", function(value) {
				if (value === undefined || value === null) {
					return null;
				}
				return self.oCoreApi.getTextNotHtmlEncoded("sortBy") + ": " + value;
			})
		});
		var onLiveChangeInSearchField = function(oEvent) {
			var aListItemFilters = [];
			var sSerachElement = oEvent.getSource().getValue();
			var oListForFiltering = self.oStepGalleryHierarchicalDialog.getContent()[0].getCurrentPage().getContent()[0];//get the current page and the list in it
			if (sSerachElement && sSerachElement.length > 0) {
				var oFilter = new sap.ui.model.Filter("title", sap.ui.model.FilterOperator.Contains, sSerachElement);
				aListItemFilters.push(oFilter);
			}
			var currentListBinding = oListForFiltering.getBinding("items");// update list binding
			currentListBinding.filter(aListItemFilters);
		};
		var stepGalleryCategoryPage = new sap.m.Page({
			title : self.oCoreApi.getTextNotHtmlEncoded("category"),
			subHeader : new sap.m.Bar({
				contentLeft : [ new sap.m.SearchField({
					enableFilterMode : true,
					liveChange : onLiveChangeInSearchField
				}) ]
			}),
			content : stepGalleryCategoryList
		});
		var stepGalleryStepPage = new sap.m.Page({
			subHeader : new sap.m.Bar({
				contentLeft : [ new sap.m.SearchField({
					enableFilterMode : true,
					liveChange : onLiveChangeInSearchField
				}) ]
			}),
			content : stepGalleryStepList,
			showNavButton : true,
			navButtonPress : function() {
				self.oStepGalleryNavContainer.back();
			}
		});
		var stepGalleryRepresentationPage = new sap.m.Page({
			subHeader : new sap.m.Bar({
				contentLeft : [ new sap.m.SearchField({
					enableFilterMode : true,
					liveChange : onLiveChangeInSearchField
				}) ]
			}),
			content : stepGalleryRepresentationList,
			showNavButton : true,
			navButtonPress : function() {
				self.oStepGalleryNavContainer.back();
			}
		});
		this.oStepGalleryNavContainer = new sap.m.NavContainer({
			pages : [ stepGalleryCategoryPage, stepGalleryStepPage, stepGalleryRepresentationPage ]
		});
		this.oStepGalleryNavContainer.setModel(oController.getView().getModel()); // set the model to the App; it will be propagated to the children
		this.oStepGalleryHierarchicalDialog = new sap.m.Dialog({ // step gallery
			contentWidth : self.contentWidth,
			contentHeight : self.contentHeight,
			showHeader : false,
			content : [ this.oStepGalleryNavContainer ],
			endButton : new sap.m.Button({
				text : self.oCoreApi.getTextNotHtmlEncoded("cancel"),
				press : function() {
					self.oStepGalleryHierarchicalDialog.close();
					self.oStepGalleryHierarchicalDialog.destroy();
				}
			})
		});
		return this.oStepGalleryHierarchicalDialog;
	}
});