/*
* ! @copyright@
*/
sap.ui.define(["./Mode", "sap/ui/model/Filter", "sap/ui/model/FilterOperator", "sap/collaboration/components/utils/PendingRequestsUtil"], function(Mode, Filter, FilterOperator, PendingRequestsUtil) {
	
	var GroupIDsMode = Mode.extend("sap.collaboration.components.feed.GroupIDsMode", {
		constructor: function(oFeedController) {
			Mode.apply(this, [oFeedController]);
			
			// Utility to keep track of the pending OData requests.
			// Can be used to abort all the pending requests.
			this._oPendingRequestsUtil = new PendingRequestsUtil();

			this._oList.setModel(this._oViewDataModel);
		}
	});
	
	/**
	 * Asks the GroupIDsMode object to start.
	 * @param oFeedSourcesData - Uses this object if defined. Uses the current object otherwise.
	 * @memberOf sap.collaboration.components.feed.GroupIDsMode
	 */
	GroupIDsMode.prototype.start = function(aFeedSourcesData) {
		
		// fill the property /groups in the model
		this._oViewDataModel.setProperty("/groups", []);
		
		this._iOpenGroupRequests = 0;
		this._aGroupsToLoad = jQuery.merge([], aFeedSourcesData);
		
		if (this._iOpenGroupRequests !==0){
			this._oGroupSelectPopover.setBusy(true);
		}
		
		this._oList.bindItems({
			path: "/groups",
			template: this._oItemTemplate
		});
		this._fillGroupInfo(); // get the group info (name, weburl ...)
	};
	
	GroupIDsMode.prototype.onBatchCompleted = function(oEvent) {
		this._oJamModel.setUseBatch(false); // batch is required for initial load, turn off for all subsequent requests
		if (this._iOpenGroupRequests === 0){
			if (this._oGroupSelectPopover !== undefined){
				this._oGroupSelectPopover.setBusy(false);					
			}
		}
	};
	
	/**
	 * Asks the GroupIDsMode object to stop.
	 * @memberOf sap.collaboration.components.feed.GroupIDsMode
	 */
	GroupIDsMode.prototype.stop = function() {
		this._oPendingRequestsUtil.abortAll();
	};
	
	/**
	 * Event handler for the selector list when an item is selected.
	 * The structure of the model set on the individual list items
	 * must be known, and there must exist a way of mapping the
	 * selected list item 
	 * @param {object} oEvent
	 * @memberOf sap.collaboration.components.feed.GroupIDsMode
	 */
	GroupIDsMode.prototype.onGroupSelected = function(oEvent) {
		var oGroupSelected = oEvent.getSource().getSelectedItem().getBindingContext().getObject();
		this._oViewDataModel.setProperty("/groupSelected", oGroupSelected);
		
		this._oViewDataModel.setProperty("/url", "/Groups('" + oGroupSelected.Id + "')/FeedEntries");
		
		this._oGroupSelectPopover.close();
	};
	
	/**
	 * Event handler for when the top left button is pressed to allow
	 * the user to select a feed source. In this case, the feed
	 * source list is a list of groups.
	 * @param {object} oEvent - This event handler is registered to listen to the the top left
	 * button's onPress event. This means't the event's source's control is the
	 * button. Shouldn't be any need of this button control.
	 * @memberOf sap.collaboration.components.feed.GroupIDsMode
	 */
	GroupIDsMode.prototype.onGroupSelectorButtonPress = function(oEvent) {
		if (this._oGroupSelectPopover === undefined ){
			this._oList.bindAggregation("items", {path: "/groups", template: this._oItemTemplate});
			this._oList.setModel(this._oViewDataModel);
			this._oList.setSelectedItem(this._oList.getItems()[0]); // select the first item by default
			
			
			if (this._iOpenGroupRequests !== 0){
				this._oLabel.setVisible(false);
				this._oList.setVisible(false);
				this._oGroupSelectPopover.setBusy(true);
			}
		}

		this._oGroupSelectPopover.openBy(oEvent.getSource());
	};
	
	GroupIDsMode.prototype.onGroupSelectorUpdateStarted = function(oControlEvent) {
	};
	
	GroupIDsMode.prototype.onGroupSelectorUpdateFinished = function(oControlEvent) {
		var sReason = oControlEvent.getParameter("reason");
		if (sReason === "Refresh" || sReason === "Change") { // Refresh->BOGroups; Change->GroupIds;
			this._oList.setSelectedItem(this._oList.getItems()[0]);
		}
	};
	
	/**
	 * Get and fill the group info of the groups
	 * @private
	 * @memberOf sap.collaboration.components.feed.GroupIDsMode
	 */
	GroupIDsMode.prototype._fillGroupInfo = function() {
		var iBatchLimit = 10; //max batch size
		var iBatchId = 0; //id of the current batch
		var iBatchRequestCount = 0; // number of requests in current batch
		var iGroupsInRequestCount = 0; // number of groups in current request
		var iGroupsPerRequestLimit = 20; // limit for number of groups per request
		this._oJamModel.setUseBatch(true); 
		var sFilterParameter = "$filter=Id eq '";
		this.oResult;
		var iODataResultLength;
					
		for(var iLoopCounter = 0, iGroupsToLoadCount = this._aGroupsToLoad.length; iLoopCounter<iGroupsToLoadCount; iLoopCounter++ ){
			// building $filter URL parameter
			if(!(iLoopCounter%iGroupsPerRequestLimit == 0)){
				sFilterParameter = sFilterParameter.concat(" or Id eq '" + this._aGroupsToLoad[iLoopCounter] + "'");
			}else{
				sFilterParameter = sFilterParameter.concat(this._aGroupsToLoad[iLoopCounter] + "'");
			};
			iGroupsInRequestCount++;
			
			// limit of groups per request or end of array reached
			if (iGroupsInRequestCount === iGroupsPerRequestLimit || iLoopCounter+1 === iGroupsToLoadCount){
				this._iOpenGroupRequests++;
				var oResult = undefined;
				this._loadGroups(sFilterParameter, iBatchId).done((function(oData, oResponse) {
					if (oData.results && oData.results != []){
						oResult = oData.results;
					}else{ 
						if (oData && oData != []){
							oResult = oData;
						};
					};
					iODataResultLength = oResult.length;
					if(oResult != undefined && iODataResultLength>0){
						var iIndexInFeedSources = this._aGroupsToLoad.indexOf(oResult[0].Id);
						for(var iCount = 0; iCount<iODataResultLength;iCount++){
				// if the current group is selected, fill the groups info
							if (this._oViewDataModel.getProperty("/groupSelected/Id") ===  oResult[iCount].Id) {
								this._oViewDataModel.setProperty("/groupSelected", oResult[iCount]);
							};
							iIndexInFeedSources++;
							this._oViewDataModel.setProperty("/groups/"+iIndexInFeedSources, oResult[iCount]);
				}
					};
					this._iOpenGroupRequests--;
					//After all request are handled clean up the data model
					if (this._iOpenGroupRequests === 0){
						var oRemoveUndefined = this._oViewDataModel.getProperty("/groups/");
						oRemoveUndefined = oRemoveUndefined.filter(function(n){ return n != undefined });
						this._oViewDataModel.setProperty("/groups/", oRemoveUndefined);
						if (this._oViewDataModel.getProperty("/groupSelected/Id") === undefined && oRemoveUndefined.length>0){
							this._oViewDataModel.setProperty("/groupSelected", oRemoveUndefined[0]);
							this._oViewDataModel.setProperty("/url", "/Groups('" + oRemoveUndefined[0].Id + "')/FeedEntries");
						}
					};
				}).bind(this));

				iBatchRequestCount++;
				iGroupsInRequestCount = 0;
				var sFilterParameter = "$filter=Id eq '";
			};
			
			// limit of requests per batch reached
			if (iBatchRequestCount == iBatchLimit){
				iBatchId++;
				iBatchRequestCount = 0;
			}				
	};
		var oRemoveUndefined = this._oViewDataModel.getProperty("/groups/");
		oRemoveUndefined = oRemoveUndefined.filter(function(n){ return n != undefined });
		this._oViewDataModel.getProperty("/groups/", oRemoveUndefined);
	};
	
	/**
	 * Fetches ID,Name and WebUrl for a list of groups definded in the $filter URL parameter
	 * @param {string} URL parameter for $filter
	 * @param {string} batchGroupId
	 * @private
	 * @return {object} A deferred promise object
	 * @memberOf sap.collaboration.components.feed.GroupIDsMode
	 */
	GroupIDsMode.prototype._loadGroups = function(sFilterParameter, batchGroupId) {
		// if Jam is not configured, do not execute
		if (!this._oFeedController._isJamConfigured()) {
			return;
		}

		var that = this;
		
		var loadingGroups = jQuery.Deferred();
		
		var sPath ="/Groups/";
		var mParameters = {
			"urlParameters": sFilterParameter + "&$select=Id,Name,WebURL",
			"success": function(oData, response) {
				loadingGroups.resolveWith(that, [oData,response]);
			}, 
			"error": function(oError) {
				loadingGroups.rejectWith(that, [oError]);
				that._oFeedController.logError("The group information was not retrieved.");
			},
			"batchGroupId": batchGroupId
		};
		
		var request = this._oJamModel.read(sPath,mParameters);
		this._oPendingRequestsUtil.add(request);
		var oPromise = loadingGroups.promise(request);
		oPromise.always(function(){
			this._oPendingRequestsUtil.remove(request);
		});
		return oPromise;
	};
	
	/**
	 * Add post to Jam
	 * @public
	 * @param {string} content The content to post to Jam
	 * @param {string} groupId The Jam Group Id to post to
	 * @return {object} A deferred promise object
	 * @memberOf sap.collaboration.components.feed.GroupIDsMode
	 */
	GroupIDsMode.prototype.addPost = function (content, groupId) {
		var sPath = "/Groups('"+ groupId +"')/FeedEntries";
		
		return Mode.prototype.addPost.apply(this, [content, sPath]);
	};
	
	return GroupIDsMode;
}, /* bExport */ true);
