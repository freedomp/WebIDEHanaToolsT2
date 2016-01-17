define([ "sap/watt/common/plugin/platform/service/ui/AbstractPart", "../view/TopRightPaneContainer.controller" ], function(AbstractPart) {
	"use strict";

	var fTopRightPane = AbstractPart.extend("sap.watt.platform.plugin.toprightpane.service.TopRightPane", {

		_oView : null,
		_currentDisplayedService : null,
		_oCloseBtn : null,

		configure : function(mConfig) {
			var that = this;
			mConfig.items.sort(this._sortByPrio);
			var aContentPromise = [];
			jQuery.each(mConfig.items, function(index, mItem) {
				aContentPromise.push(mItem.service.getContent());
			});
			Q.all(aContentPromise).then(function(aContentArray) {
				for ( var j = 0; j < aContentArray.length; j++) {
					var aContent = aContentArray[j];
					if (aContent !== null) {
						for ( var i = 0; i < aContent.length; i++) {
							that._oView.getController().addItem(aContent[i], j);
						}
					}
				}
			}).done();
		},

		init : function() {
			this._oView = sap.ui.view("toprightpane.Container", {
				viewName : "sap.watt.platform.plugin.toprightpane.view.TopRightPaneContainer",
				type : sap.ui.core.mvc.ViewType.XML
			}).addStyleClass("toprightpane");
			this._oView.attachAfterRendering(function() {
				// needed to remove the styling on the view itself since UI5 adds automatically
				// a value of 100% to the width and height of the view element... 
				document.getElementById("toprightpane.Container").removeAttribute("style");
			});
		},

		_sortByPrio : function(a, b) {
			return a.prio - b.prio;
		},

		getContent : function() {
			return this._oView;
		}

	});

	return fTopRightPane;
});