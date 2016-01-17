/*
* ! @copyright@
*/
sap.ui.define(["sap/ui/base/Object", "sap/ui/model/Filter", "sap/ui/model/FilterOperator", "sap/m/CustomListItem", "sap/m/Label"], function(Object, Filter, FilterOperator, CustomListItem, Label) {
	
	var Mode = Object.extend("sap.collaboration.components.feed.Mode", {
		constructor: function(oFeedController, sModelName) {
			// The questions below may help me in refactoring.
			// Do controls define byId("")
			// Do views have the getController method?
			// Do controllers have a getView method?
			
			// The group feed component's controller.
			this._oFeedController = oFeedController;
			
			// view properties
			this._oViewDataModel = this._oFeedController.getModel();
			this._oJamModel = this._oFeedController.getModel("jam");
			
			// fragment
			this._oGroupSelectPopover = sap.ui.xmlfragment("sap.collaboration.components.feed.fragments.GroupSelector");
			
			// attach event handlers to the list
			this._oList = this._oGroupSelectPopover.getContent()[1];
			this._oList.attachSelectionChange(this.onGroupSelected, this);
			this._oList.attachUpdateStarted(this.onGroupSelectorUpdateStarted, this);
			this._oList.attachUpdateFinished(this.onGroupSelectorUpdateFinished, this);
			this._oList.setModel(this._oFeedController.getModel(sModelName));
			
			// attach event handlers for search field
			this._oSearchField = this._oGroupSelectPopover.getContent()[0];
			this._oSearchField.attachLiveChange(this.onGroupSearch, this);
			
			// bind the list items
			this._oLabel = new Label({
				text: "{Name}"
			}).addStyleClass("sapUiTinyMarginBeginEnd").addStyleClass("sapUiTinyMarginTopBottom");
			this._oItemTemplate = new CustomListItem({
				content: this._oLabel
			});
		}
	});
	
	/*********************
	 * HTTP GET Requests
	 ********************/
	/**
	 * Get Jam group wall feed entries
	 * @param {string} groupId id of the Group
	 * @param [string] skipToken the skip token from the next link
	 * @public
	 * @memberOf sap.collaboration.components.feed.Mode
	 */
	Mode.prototype.getFeedEntries = function (url, skipToken) {
		var that = this;
		var loadingFeedEntriesPromise = jQuery.Deferred();
		var sPath = url;
		var mParameters = {
				"urlParameters": {
					"$expand": "Creator,TargetObjectReference"
				},
				"success": function(oData, response) {
					that._oNextLinks.feedEntriesNextLink = oData.__next;
					loadingFeedEntriesPromise.resolveWith(that, [oData, response]);
				},
				"error": function(oError) {
					loadingFeedEntriesPromise.rejectWith(that, [oError]);
				}
			};
		
		if (skipToken) {
			mParameters.urlParameters.$skiptoken = skipToken;
		}
				
		return loadingFeedEntriesPromise.promise(this._oJamModel.read(sPath, mParameters));
	};
	
	/*********************
	 * HTTP POST Requests
	 ********************/
	/**
	 * Post comment to Jam
	 * @public
	 * @param {string} content The comment to post in Jam
	 * @param {string} path The Jam path to post the comment to
	 * @memberOf sap.collaboration.components.feed.Mode
	 */
	Mode.prototype.addPost = function (content, path) {
		var postingCommentPromise = jQuery.Deferred();
		var oDataPayload = { "Text" : content };
		var mParameters = {
				"success": function(oData, response) {
					postingCommentPromise.resolve(oData, response);
				},
				"error": function(oError) {
					postingCommentPromise.reject(oError);
				}
		};
		// return the path and payload along with the promise in case the caller wants to make the request again (i.e. CSRF token refresh)
		return {
			"path" : path,
			"payload" : oDataPayload,
			"promise" : postingCommentPromise.promise(this._oJamModel.create(path, oDataPayload, mParameters))
		};
	};
	
	return Mode;
}, /* bExport */ true);
