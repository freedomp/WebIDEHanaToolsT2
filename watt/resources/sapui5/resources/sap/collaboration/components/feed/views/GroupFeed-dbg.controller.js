/*
* ! @copyright@
*/
sap.ui.define(["jquery.sap.global","sap/ui/core/mvc/Controller","sap/suite/ui/commons/TimelineItem","sap/m/MessageBox",
               "sap/collaboration/components/utils/LanguageBundle","sap/collaboration/components/utils/DateUtil",
               "sap/collaboration/components/controls/FeedEntryEmbedded","sap/collaboration/components/controls/ReplyPopover",
               "sap/collaboration/components/controls/AddPostPopover", "sap/collaboration/components/controls/FilterPopover", 
               "sap/collaboration/components/feed/GroupIDsMode", "sap/collaboration/components/feed/BOMode"],
	function(jQuery, Controller, TimelineItem, MessageBox, 
			LanguageBundle, DateUtil, FeedEntryEmbedded,
			ReplyPopover, AddPostPopover, FilterPopover, 
			GroupIDsMode, BOMode) {
	"use strict";
	var sControllerName = "sap.collaboration.components.feed.views.GroupFeed";
	var sJamServiceUrl = "/sap/bc/ui2/smi/rest_tunnel/Jam/api/v1/OData";
	var sSMIv2ServiceUrl = "/sap/opu/odata/sap/SM_INTEGRATION_V2_SRV";
	
	var oGroupFeed =  Controller.extend(sControllerName, {
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		onInit: function() {
			
			this._initializeUtilities();
			this._initializeRequestStateData();
			this._initializeSystemData();
			this._initializeModels();						
			this._initializeTimeline();
		},
		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		onBeforeRendering: function() {
			if (!this._isJamConfigured()) {
				this._displayErrorMessage();
			}
		},
		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		onAfterRendering: function() {
		},
		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		onExit: function() {
			this._abortAllPendingRequests();
			
			// destroy controls
			this.byId("filter_popover").destroy();
			this.byId("addPost_popover").destroy();
		},
		
		
		/************************************************************************
		 * Initialization
		 ************************************************************************/
		/**
		 * Initialize the utility classes that will be needed
		 * @private
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_initializeUtilities: function() {
			this._oLogger = new jQuery.sap.log.getLogger(sControllerName);
			this._oLanguageBundle = new LanguageBundle();
			this._oDateUtil = new DateUtil();
		},
		/**
		 * Initialize feed component system data for to keep track of the Group Feed's state
		 * @private
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_initializeSystemData: function() {
			this._oModes = {};
			this._mCurrentUser;
		},
		/**
		 * Initialize data to keep track of the requests 
		 * @private
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_initializeRequestStateData: function() {
			this._oNextLinks = {
				"feedEntriesNextLink": "",
				"repliesNextLink": ""	
			};
			this._oPendingRequests = {
				"loadingFeedEntriesRequest": undefined,
				"loadingRepliesRequest": undefined,
				"loadingSuggestionsRequest": undefined,
				"loadingFeedAtMentions": undefined,
				"refreshingSecurityToken": undefined
			};
			
			this._oPostRequestData = {
				"path": undefined,
				"payload": undefined,
				"parameters": undefined
			};
		},
		/**
		 * Create and initialized the models for the view
		 * 1- Jam model: OData model for connecting to Jam
		 * 2- SMI v2 model: OData model for connecting to SMIntegration V2 gateway service
		 * 3- View model: JSON model for the controls' properties
		 * @private
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_initializeModels: function() {
			// resource model
			var i18nModel = this._oLanguageBundle.createResourceModel();
			this.getView().setModel(i18nModel, "i18n");
			this._i18nModel = i18nModel;
			
			// SMIv2 model
			var oSMIModel =  new sap.ui.model.odata.ODataModel(sSMIv2ServiceUrl, true);
			this.getView().setModel(oSMIModel, "smi");
			this._oSMIModel = oSMIModel;
			
			// Jam model
			var oJamModel =  new sap.ui.model.odata.v2.ODataModel(sJamServiceUrl);
			oJamModel.attachMetadataFailed(this._onMetadataFailed, this);
			oJamModel.attachRequestCompleted(this._onJamRequestCompleted, this);
			oJamModel.attachRequestFailed(this._onJamRequestFailed, this);
			oJamModel.attachRequestSent(this._onJamRequestSent, this);
			oJamModel.attachBatchRequestCompleted(this._onBatchCompleted, this);
			oJamModel.attachBatchRequestFailed(this._onBatchFailed, this);
			oJamModel.attachBatchRequestSent(this._onBatchSent, this);
			this.getView().setModel(oJamModel, "jam");
			this._oJamModel = oJamModel;
			
			// View Data model
			var oViewDataModel = new sap.ui.model.json.JSONModel(); 
			oViewDataModel.setData({
				"feedSources": undefined,
				
				"axisOrientation": undefined,
				"enableSocial": true,
				"enableScroll": false,
				"forceGrowing": true,
				"growingThreshold": 20,
					
				"groupSelectorEnabled": true,
				"groupSelected": {},
				"groups":[],
								
				"filterEnabled": false,
				"filter": [],
				"filterMessage": "",
				
				"url": undefined,
				
				"addPostButtonEnabled": true,
			});
			oViewDataModel.bindProperty("/feedSources").attachChange(this._onFeedSourcesChange, this);
			oViewDataModel.bindProperty("/url").attachChange(this.onUrlChange, this);
			oViewDataModel.bindProperty("/filterMessage").attachChange(this.onFilterMessageChange, this);
			this.getView().setModel(oViewDataModel);
			this._oViewDataModel = oViewDataModel;
		},
		
		/************************************************************************
		 * Timeline manipulation
		 ************************************************************************/
		/**
		 * Initialize timeline
		 * @private
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_initializeTimeline: function() {
			var oTimeline = this.byId("timeline");
			oTimeline.setContent([]);
			
			this._modifyHeaderBar();
			this._createSocialProfile();
		},
		/**
		 * Modify the Timeline Header Bar
		 * @private
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_modifyHeaderBar: function(){
			var oHeaderBar = this.byId("timeline").getHeaderBar();
			
			// remove all content
			oHeaderBar.removeAllContent();
			
			// add the group selector
			var oGroupSelector = this._createGroupSelector();
			oHeaderBar.insertContent(oGroupSelector, 0);
			
			// add a spacer
			var oSpacer = new sap.m.ToolbarSpacer(this.createId("header_spacer"));
			oHeaderBar.insertContent(oSpacer, 1);
			
			// Add the filter
			var oFilterButton = this._createFilterButton();
			oHeaderBar.insertContent(oFilterButton, 2);
			
			// create the Add Post button
			var oAddPostButton = this._createAddPostButton();
			oHeaderBar.insertContent(oAddPostButton, 3);
		},
		/**
		 * Create the Context Selector Control
		 * @private
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_createGroupSelector: function(){
			var oGroupSelectButton = new sap.m.Button( this.createId("groupSelect_button"), { 	
				icon: "sap-icon://navigation-down-arrow",
				iconFirst: false,
				text: "{/groupSelected/Name}",
				width: "20em",
				enabled: "{/groupSelectorEnabled}",
				type: sap.m.ButtonType.Transparent,
				press: [this.onGroupSelectorButtonPress, this]
			});
			oGroupSelectButton.setModel(this._oViewDataModel);
			
			return oGroupSelectButton;
		},
		/**
		 * Create the filter button
		 * @private
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_createFilterButton: function() {
			if (!this.byId("filter_popover")) {
				var oStandardListItem = new sap.m.StandardListItem(this.createId("filterListItem"), {
					title: "{text}"
				});
				
				new FilterPopover(this.createId("filter_popover"), {
					title: this._oLanguageBundle.getText("ST_FILTER_HEADER"),
				}).setModel(this._oViewDataModel).bindItems("/filter", oStandardListItem);
			}
			
			var oFilterButton = new sap.m.Button(this.createId("filter_button"), {
				enabled: "{/filterEnabled}",
				visible: "{/filterEnabled}",
				icon: "sap-icon://filter",
				type: sap.m.ButtonType.Transparent,
				press: [function() {
					this.byId("filter_popover").openBy(this.byId("filter_button"));
				}, this]
			}).setModel(this._oViewDataModel);
			
			return oFilterButton;
		},
		/**
		 * Create the Add Post button
		 * @private
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_createAddPostButton: function(){
			
			if (this.byId("addPost_popover") === undefined){
				new AddPostPopover(this.createId("addPost_popover"), {
					notifyAllEnabled: true,
					postPress: [this.onAddPost, this],
					suggest: [this.onSuggest, this],
					afterSuggestionClose: [function(){
						this._oPendingRequests.loadingSuggestionsRequest && this._oPendingRequests.loadingSuggestionsRequest.abort();
					}, this]
				});
			}
			
			var oAddPostButton = new sap.m.Button(this.createId("addPost_button") , {
				enabled: "{/addPostButtonEnabled}",
				icon: "sap-icon://add",
				type: sap.m.ButtonType.Transparent,
				press: [function(){
					 this.byId("addPost_popover").openBy(this.byId("addPost_button"));
				}, this]
			});
			oAddPostButton.setModel(this._oViewDataModel);
			
			return oAddPostButton;
		},
		/**
		 * Clear the timeline of all its content
		 * @private
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_clearTimeline: function() {
			var oTimeline = this.byId("timeline");
			oTimeline.destroyContent();
		},
		/**
		 * Create a timeline item control
		 * @param oFeedEntry
		 * @private
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_createTimelineItem: function(oFeedEntry) {
			var oFeedEntryModel = new sap.ui.model.json.JSONModel(oFeedEntry);
			var oFeedEntryEmbedded = new FeedEntryEmbedded(this.createId(oFeedEntry.Id+"_embedded"), {
				"feedEntry": "{/}",
				"atMentionClick": [this.onAtMentionClicked, this]
			});
			
			var oReplyPopover = new ReplyPopover(this.createId("replyPostPopover_" + oFeedEntry.Id), {
				notifyAllEnabled: true,
				postReplyPress: [this.onPostReplyPress, this],
				moreRepliesPress: [function(oEvent){
					var oTimelineItem = oEvent.getSource().getParent();
					this._getReplies(undefined, oTimelineItem.getModel().getData().Replies.__next, oTimelineItem);
				}, this],
				suggest: [this.onSuggest, this],
				afterSuggestionClose: [function(){
					if (this._oPendingRequests.loadingSuggestionsRequest){
						this._oPendingRequests.loadingSuggestionsRequest.abort();
					}
				}, this],
				afterClose: [function(){
					if(this._oPendingRequests.loadingRepliesRequest){
						this._oPendingRequests.loadingRepliesRequest.abort();
					}
				}, this]
			});
			
			var oMoreLinkCustomAction = new sap.ui.core.CustomData({
				key:"1", 
				value:this._oLanguageBundle.getText("ST_MORE_CUSTOM_ACTION")
			});
						
			var oTimelineItem = new TimelineItem(this.createId(oFeedEntry.Id), {
				"dateTime": "{/CreatedAt}",
				"userName": "{/Creator/FullName}", 
				"title": "{/Action}",
				"text": "{/Text}",
				"icon": "sap-icon://post",
				"userNameClickable": this._oViewDataModel.getProperty("/enableSocial"),
				"userNameClicked": [this.onUserNameClicked, this],
				"userPicture": {
					path: "/Creator/Id",
					formatter: this._buildThumbnailImageURL.bind(this)
				},
				"replyCount": "{/RepliesCount}",
				"embeddedControl": oFeedEntryEmbedded,
				"customReply": oReplyPopover,
				"replyListOpen": [this.onReplyListOpen, this],
				"customAction": oMoreLinkCustomAction,
				"customActionClicked": [this.onMoreClicked, this]
			});
			oTimelineItem.setModel(oFeedEntryModel);
			return oTimelineItem;
		},
		/**
		 * Add the feed entries to the Timeline control
		 * @param {object[]} feedEntries - array of feed entries entities
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_addFeedEntriesToTimeline: function(feedEntries) {

			// create timeline item controls for each feed entry and add it to the timeline
			var oTimeline = this.byId("timeline");
			
			feedEntries.forEach(function(oFeedEntry){
				var oTimelineItem = this._createTimelineItem(oFeedEntry);
				oTimeline.addContent(oTimelineItem);
			}, this);
		},
		/**
		 * Process the addition of more feed entries
		 * 1a - Add Timeline items for each feed entry
		 * 1b - If no feed entries, disable the more button
		 * 2 - Set timeline to not busy
		 * @param {object[]} aFeedEntries
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_processFeedEntries: function(feedEntries) {
			if (feedEntries.length > 0) {
				this._addFeedEntriesToTimeline(feedEntries);
			}
			else {
				this._oViewDataModel.setProperty("/forceGrowing",false); // disable the more button 
			}
			this._setTimelineToNotBusy();
		},
		/**
		 * Create the Social Profile component
		 * @private
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_createSocialProfile: function(){
			this._oSocialProfile = new sap.ui.getCore().createComponent("sap.collaboration.components.socialprofile");
			return this._oSocialProfile;
		},
		/**
		 * Sets the busy indicator for the Timeline control
		 * @private
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_setTimelineToBusy: function(){
			var oTimeline = this.byId("timeline");
			oTimeline.setBusyIndicatorDelay(0).setBusy(true);
		},
		/**
		 * Turn off the busy indicator for the Timeline control
		 * @private
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_setTimelineToNotBusy: function(){
			var oTimeline = this.byId("timeline");
			oTimeline.setBusyIndicatorDelay(0).setBusy(false);
		},
		/************************************************************************
		 * Controls event handlers
		 ***********************************************************************/
		/**
		 * Event handler for the "Show More" button of the Timeline Control
		 * @param oEvent
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		onGrow: function(oEvent) {
			// if there's a pending request, do not start a new one
			if (!this._oPendingRequests.loadingFeedEntriesRequest || !this._oPendingRequests.loadingFeedEntriesRequest.state() != "pending") {
				var sUrl = this._oViewDataModel.getProperty("/url");
				this._loadFeedEntries(sUrl).done(function(oData, response) {
					var aFeedEntries = oData.results;
					this._processFeedEntries(aFeedEntries);
				});	
			}
		},
		/**
		 * Event handler for the Group Selector button of the Timeline Control
		 * @param oEvent
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		onGroupSelectorButtonPress: function(oEvent){
			this._oMode.onGroupSelectorButtonPress(oEvent);
		},
		/**
		 * Event handler for getting more in the group selector list
		 * @param {object} oControlEvent
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		onGroupSelectorUpdateStarted: function(oControlEvent) {
			this._oMode.onGroupSelectorUpdateStarted(oControlEvent);
		},
		/**
		 * Event handler for getting more in the group selector list
		 * @param {object} oControlEvent
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		onGroupSelectorUpdateFinished: function(oControlEvent) {
			this._oMode.onGroupSelectorUpdateFinished(oControlEvent);
		},
		/**
		 * Event handler for the group search
		 * @param {object} oControlEvent
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		onGroupSearch: function(oControlEvent) {
			this._oMode.onGroupSearch(oControlEvent);
		},
		/**
		 * Event handler for the add post button. Opens a pop over to add a post.
		 * @param {object} event
		 * @public
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		onAddPost: function(event) {
			var that = this;		
			var sContent = event.getParameter("value");
			this._getLoggedInUser();
			
			// post the user content if it's not empty
			if (sContent && sContent.trim() !== "") {
				this._setTimelineToBusy();
				
				var fnSuccessCallback = function (oData, response) { // success callback
					that._setTimelineToNotBusy();
					
					var oFeedEntry = oData.results;
					oFeedEntry.Creator = that._mCurrentUser;
					
					var oTimelineItem = that._createTimelineItem(oFeedEntry);
					that.byId("timeline").insertContent(oTimelineItem, 0); // add timeline item to timeline
				};
				var fnFailCallback = function (oError) { // fail callback
					that._oLogger.error("Error occured when adding a post.", oError.stack);
				};
				
				var mAddPostReturn = this._oMode.addPost(sContent, this._oViewDataModel.getProperty("/groupSelected/Id"));

				this._oPostRequestData = { "path" : mAddPostReturn.path, "payload" : mAddPostReturn.payload }; // save the request data
				this._oPostRequestData.parameters = { success : fnSuccessCallback, error : fnFailCallback };
				
				var oAddPostPromise = mAddPostReturn.promise;
				oAddPostPromise.then(fnSuccessCallback, fnFailCallback);
			}
			else {
				this._oLogger.info('Posting an empty comment is not allowed, no feed entry will be created.');
			}
		},
		/**
		 * Event handler when the ReplyPopover is opened.
		 * @param oEvent
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		onReplyListOpen: function(oEvent){
			var oTimelineItem = oEvent.getSource();
			var sFeedId = oTimelineItem.getModel().getProperty("/Id");
			this._getReplies(sFeedId, undefined, oTimelineItem);
		},
		/**
		 * Event handler when the "Post" button is pressed on the ReplyPopover.
		 * @param oEvent
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		onPostReplyPress: function(oEvent){
			var that = this;
			var sValue = oEvent.getParameter("value");
			var oTimelineItem = oEvent.getSource().getParent();
			var oCustomReply = oTimelineItem.getCustomReply();
			var sFeedId = oTimelineItem.getModel().getData().Id;
			var sPath = "/FeedEntries('" + jQuery.sap.encodeURL(sFeedId) + "')/Replies";
			var oDataPayload = {"Text" : sValue};
			this._getLoggedInUser();
			var mParameters = {
				"async": true,
				"success": function(oData, response){
					oCustomReply.setBusy(false);
					
					var oJamResults = oData.results;
					
					var oReply = {
						"CreatedAt": that._oDateUtil.formatDateToString(oJamResults.CreatedAt),
						"Text": oJamResults.Text,
						"Creator" : that._mCurrentUser
					};
					oReply.Creator.ThumbnailImage = that._buildThumbnailImageURL(that._mCurrentUser.Id);
					
					oCustomReply.addReply(oReply);
					
					oTimelineItem.getModel().setProperty("/RepliesCount", oTimelineItem.getModel().getProperty("/RepliesCount") + 1); // +1 to the reply count
				},
				"error": function(oError){
					that._oLogger.error("Failed to post reply: " + oError.statusText, oError.stack);
				}
			};
					
			// We need to put the focus on the text area to avoid the Popover from closing - not sure why it closes
			oCustomReply.getTextArea().focus();
			oCustomReply.setBusyIndicatorDelay(0).setBusy(true);
			this._oPostRequestData = {"path": sPath, "payload": oDataPayload, "parameters": mParameters}; // save the request data
			this._oJamModel.create(sPath, oDataPayload, mParameters);
		},
		/**
		 * Event handler for the suggestions
		 * @param {object} oEvent
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		onSuggest: function(oEvent){
			var that = this;
			
			if (this._oPendingRequests.loadingSuggestionsRequest){
				this._oPendingRequests.loadingSuggestionsRequest.abort();
			}
			
			var oPopover = oEvent.getSource();
			var sValue = oEvent.getParameter("value");
			if (sValue.trim() === ""){ // if value is empty then it's the suggestions is triggered but user has not entered any text yet
				oPopover.setSuggestionData([]);
			}
			else {
				var sPath = "/Members_Autocomplete";
				var sGroupId = this._oViewDataModel.getProperty("/groupSelected/Id");
				var mParameters = {
					"async": true,
					"urlParameters": {
						"Query": "'" + sValue + "'",
						"GroupId": "'" + sGroupId + "'",
						"$top": "4"
					},
					"success": function(oData, response){
						gettingSuggestionsPromise.resolveWith(that, [oData,response]);
					},
					"error": function(oError){
						that._oLogger.error("Failed to get suggestions: " + oError.statusText);
						gettingSuggestionsPromise.rejectWith(that, [oError]);
					}
				};
				
				var gettingSuggestionsPromise = jQuery.Deferred();
				gettingSuggestionsPromise.done(function(oData, response){
					var aJamResults = oData.results;
					if (aJamResults.length === 0) { // if nothing is returns from jam then close the suggestion popover
						oPopover.closeSuggestionPopover();
					}
					else {
						var aSuggestions = [];
						var iJamResultsLength = aJamResults.length;
						for(var i = 0; i < iJamResultsLength; i++){
							aSuggestions.push({
								fullName: aJamResults[i].FullName,
								email: aJamResults[i].Email,
								userImage: that._buildThumbnailImageURL(aJamResults[i].Id)
							});
						}
						oPopover.setSuggestionData(aSuggestions);
					}
				});
				this._oPendingRequests.loadingSuggestionsRequest = gettingSuggestionsPromise.promise(this._oJamModel.read(sPath, mParameters));
			}
		},
		/**
		 * Event handler for userNameClicked event
		 * @param {object} oControlEvent - event when the user name is clicked
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		onUserNameClicked: function(oControlEvent){
			var oTimelineEntry = oControlEvent.getSource();
			var oTimelineEntryModel = oTimelineEntry.getModel(); 
			var oSettings = {
					openingControl: oTimelineEntry._userNameLink,
					memberId: oTimelineEntryModel.getProperty("/Creator/Email")
			};
			this._oSocialProfile.setSettings(oSettings);
			this._oSocialProfile.open();
		},
		/**
		 * Event handler for the more custom action. Opens a pop over that contain links to the group and feed entry.
		 * @param oControlEvent - event when a custom action is clicked
		 * @public
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */		
		onMoreClicked: function(oControlEvent){
			var sFeedEntryWebURL  = oControlEvent.getSource().getModel().getProperty("/WebURL");		
			var sFeedEntryId = oControlEvent.getSource().getModel().getProperty("/Id");
			
			var sSelectedGroupName = oControlEvent.getSource().getParent().getModel().getProperty("/groupSelected/Name");	
			var sSelectedGroupWebURL = oControlEvent.getSource().getParent().getModel().getProperty("/groupSelected/WebURL");	

			var oMorePopover = this.byId(this.createId("moreListPopover_" + sFeedEntryId));
			
			if (oMorePopover === undefined){
				var oMoreList = new sap.m.List(this.createId("moreList_" + sFeedEntryId), {});
	         
		        var oGroupNameLink = new sap.m.Link(this.createId("groupNameLink_" + sFeedEntryId), {
		        	text: this._oLanguageBundle.getText("ST_GROUP_NAME_LINK", sSelectedGroupName),
		            target: "_blank",
		            href: sSelectedGroupWebURL
		        }).addStyleClass("sapCollaborationCustomLinkPadding");
		         
		        var oGroupNameLinkListItem = new sap.m.CustomListItem(this.createId( sFeedEntryId + "_groupNameLinkListItem" ), {
		            content: oGroupNameLink
		        });
		         
		        oMoreList.addItem(oGroupNameLinkListItem);
	            
	            var oFeedEntryLink = new sap.m.Link(this.createId("feedEntryLink_" + sFeedEntryId), {
	                 text: this._oLanguageBundle.getText("ST_FEED_ENTRY_LINK"),
	                 target: "_blank",
	                 href: sFeedEntryWebURL
	            }).addStyleClass("sapCollaborationCustomLinkPadding");
	            
	            var oFeedEntryLinkListItem = new sap.m.CustomListItem(this.createId("feedEntryLinkListItem_" + sFeedEntryId), {
	                 content: oFeedEntryLink
	            });
	            
	            oMoreList.addItem(oFeedEntryLinkListItem);
	            
	            oMorePopover = new sap.m.ResponsivePopover(this.createId("moreListPopover_" + sFeedEntryId), {
	                content: oMoreList,
	                showHeader: false,
	                placement: sap.m.PlacementType.VerticalPreferedBottom
	            });
			}
            oMorePopover.openBy(oControlEvent.getParameter("linkObj"));
		},
		/**
		 * Event handler when an AtMention in the embedded control is clicked
		 * @param {object} oControlEvent - event when the user name is clicked
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		onAtMentionClicked: function(oControlEvent){
			if (this._oPendingRequests.loadingFeedAtMentions && 
					this._oPendingRequests.loadingFeedAtMentions.state("pending")) {
				this._oPendingRequests.loadingFeedAtMentions.abort();
			}
			
			var sFeedId = oControlEvent.getSource().getModel().getProperty("/Id");
			var oUserNameLink = oControlEvent.getParameter("link");
			var placeholderIndex = oUserNameLink.getModel().getProperty("/placeholderIndex");
			
			var getAtMentionsPromise = jQuery.Deferred();
			var that = this;
			var sPath = "/FeedEntries("+ jQuery.sap.encodeURL("'"+sFeedId+"'") + ")/AtMentions";
			var mParameters = {
				"success": function(oData, response){
					getAtMentionsPromise.resolveWith(that, [oData,response]);
				},
				"error": function(oError){
					that._oLogger.error('Failed to retrieve the @mentions.');
					getAtMentionsPromise.rejectWith(that, [oError]);
				}
			};
			
			getAtMentionsPromise.done(function(oData, response){
				var aAtMentions = oData.results;
				
				var oSettings = {
					openingControl: oUserNameLink,
					memberId: aAtMentions[placeholderIndex].Email
				};
				this._oSocialProfile.setSettings(oSettings);
				this._oSocialProfile.open();
			});
			
			this._oPendingRequests.loadingFeedAtMentions = getAtMentionsPromise.promise(this._oJamModel.read(sPath, mParameters));
		},


		/************************************************************************
		 * View model's event handlers
		 ************************************************************************/
		/**
		 * Event handler when the url is changed
		 * @param {object} event
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		onUrlChange: function(event) {
			if (this._oPendingRequests.loadingFeedEntriesRequest) {
				this._oPendingRequests.loadingFeedEntriesRequest.abort();
			}
			this._initializeRequestStateData();
			this._oViewDataModel.setProperty("/forceGrowing", true); // enable the more button 
			
			var sUrl = event.getSource().getValue();
			this._loadFeedEntries(sUrl).done(function(oData, response) {
				this._clearTimeline();
				
				var aFeedEntries = oData.results; // get the feed entries from the results
				this._processFeedEntries(aFeedEntries);
			});
		},
		/**
		 * Event handler for when the property feedSources changes
		 * @param oEvent
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_onFeedSourcesChange: function(oEvent) {
			// The oFeedSources object is the object that
			// is sent to the Feed component. From this
			// object we extract the object oFeedSourcesData.
			// oFeedSourcesData can be an object object in
			// case of BO mode or an array in case of
			// group ids mode.
			var oFeedSources = oEvent.getSource().getValue();
			var oFeedSourcesData;
			if (this._oMode) {
				this._oMode.stop();
			}
			if (Array.isArray(oFeedSources)) {
				oFeedSourcesData = jQuery.merge([], oFeedSources);
				
				if (this._oModes[sap.collaboration.FeedType.GroupIds] === undefined) {
					this._oModes[sap.collaboration.FeedType.GroupIds] = new GroupIDsMode(this);
				}
				this._oMode = this._oModes[sap.collaboration.FeedType.GroupIds];
			}
			else if (Object.prototype.toString.call(oFeedSources) === "[object Object]" &&
					oFeedSources.mode && oFeedSources.mode === sap.collaboration.FeedType.GroupIds &&
					Array.isArray(oFeedSources.data)) {
				oFeedSourcesData = jQuery.merge([], oFeedSources.data);
				if (this._oModes[sap.collaboration.FeedType.GroupIds] === undefined) {
					this._oModes[sap.collaboration.FeedType.GroupIds] = new GroupIDsMode(this);
				}
				this._oMode = this._oModes[sap.collaboration.FeedType.GroupIds];
			}
			else if (Object.prototype.toString.call(oFeedSources) === "[object Object]" &&
					oFeedSources.mode && oFeedSources.mode === sap.collaboration.FeedType.BusinessObjectGroups &&
					Object.prototype.toString.call(oFeedSources.data) === "[object Object]" &&
					Object.prototype.toString.call(oFeedSources.data.appContext) === "[object String]" &&
					Object.prototype.toString.call(oFeedSources.data.odataServicePath) === "[object String]" &&
					Object.prototype.toString.call(oFeedSources.data.collection) === "[object String]" &&
					Object.prototype.toString.call(oFeedSources.data.key) === "[object String]" &&
					Object.prototype.toString.call(oFeedSources.data.name) === "[object String]") {
				if (this._oModes[sap.collaboration.FeedType.BusinessObjectGroups] === undefined) {
					this._oModes[sap.collaboration.FeedType.BusinessObjectGroups] = new BOMode(this, this._oLanguageBundle);
				}
				oFeedSourcesData = oFeedSources.data;
				this._oMode = this._oModes[sap.collaboration.FeedType.BusinessObjectGroups];
			}
			else{
				this._oLogger.error("The paramater feedSources is not valid.");
				this._displayErrorMessage();
				return;
			}
			this._oMode.start(oFeedSourcesData);
		},
		/**
		 * Event handler when the property 'filterMessage' is changed.
		 * Sets the custom message on the timeline.
		 * @param {object} event
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		onFilterMessageChange: function(event) {
			var sText = event.getSource().getValue();
			this.byId("timeline").setCustomMessage(sText);
		},
		/************************************************************************
		 * SM Integration V2 model's event handlers
		 ************************************************************************/
		/**
		 * Event handler for when Jam or SMI fail to load their metadata
		 * @param oEvent
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */ 
		_onMetadataFailed: function(oEvent) {
			
			switch(oEvent.oSource.sServiceUrl) {
			case sJamServiceUrl:
				this._oLogger.error("Failed to load Jam metadata.");
				this._displayJamConnectionErrorMessage();
				break;
				
			case sSMIv2ServiceUrl:
				this._oLogger.error("Failed to load SMIv2 metadata.");
				this._displayErrorMessage();
				break;
			}
			this._disableGroupFeed();
		},
		/************************************************************************
		 * Jam model's event handlers
		 ************************************************************************/
		/**
		 * Event handler for when the requests to Jam are completed
		 * @param oEvent
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_onJamRequestCompleted: function(oEvent) {
			var sMethod = oEvent.getParameter("method");
			
			if (oEvent.success && sMethod === "POST") {
				// reset the refreshing security token request because it is not needed
				this._oPendingRequests.refreshingSecurityToken = undefined;				
			}
		},
		/**
		 * Event handler for when the requests to Jam fail
		 * @param oEvent
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_onJamRequestFailed: function(oEvent) {
			this._setTimelineToNotBusy();
			
			var sMethod = oEvent.getParameter("method");
			var sUrl = oEvent.getParameter("url");
			var iStatusCode = parseInt(oEvent.getParameter("response").statusCode, 10);
			
			if (/ExternalObjects_FindByExidAndObjectType/.test(sUrl)) {
				// Leave the BOMode class handle its own error messages.
				// This assumes that only the BOMode makes this call and
				// no other part of the code relies on this method to
				// display errors when a failure occurs for this call.
				this._disableGroupFeed();
				return;
			}
			
			switch(iStatusCode) {
			case 403: // Forbidden
				// For Post requests, we must refresh the security token and re-execute the request
				// to make sure it's actually a forbidden request
				if (sMethod === "POST") {
					if (this._oPendingRequests.refreshingSecurityToken === undefined) {
						this._refreshSecurityToken().done(function(oData,response){
							this._oJamModel.create(this._oPostRequestData.path, this._oPostRequestData.payload, this._oPostRequestData.parameters);
						});
					}
					else {
						this._oPendingRequests.refreshingSecurityToken = undefined;
						this._displayErrorMessage(this._oLanguageBundle.getText('JAM_NO_ACCESS_TO_POST_TO_GROUP'));
					}
				}
				else{
					this._displayErrorMessage(this._oLanguageBundle.getText('JAM_FORBIDDEN_ACCESS'));
				}
				break;
			case 404: // Not Found
				if (/Groups\(.*\)\/FeedEntries/.test(sUrl)) { // /Groups(*)/FeedEntries 
					this._displayErrorMessage(this._oLanguageBundle.getText('JAM_NO_ACCESS_TO_GROUP'));
					this._disableGroupFeed();
				}
				else if (/Groups\(.*\)/.test(sUrl)) { // /Groups(*) 
					this._displayErrorMessage(this._oLanguageBundle.getText('JAM_NO_ACCESS_TO_GROUP'));
					this._disableGroupFeed();
				}
				else{
					this._displayErrorMessage(); 	
				}
				break;
			case 500: // Internal Server Error
			case 503: // Service Unavailable
				this._displayJamConnectionErrorMessage();
				break;
			default:
				this._displayErrorMessage();
			}
			
		},
		/**
		 * Event handler for when the requests to Jam is sent
		 * @param oEvent
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_onJamRequestSent: function(oEvent) {
		},
		/**
		 * Event handler for when the requests to Jam batch call is completed
		 * @param oEvent
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_onBatchCompleted: function(oEvent) {
			this._oJamModel.setUseBatch(false); // batch is required for initial load, turn off for all subsequent requests
			this._oMode.onBatchCompleted(oEvent);
		},
		/**
		 * Event handler for when the requests to Jam batch call fails
		 * @param oEvent
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_onBatchFailed: function(oEvent) {
		},
		/**
		 * Event handler for when the requests to Jam batch call is sent
		 * @param oEvent
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_onBatchSent: function(oEvent) {
		},
		/************************************************************************
		 * Requests
		 ************************************************************************/
		/**
		 * Abort all pending requests
		 * @private
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_abortAllPendingRequests: function() {
			if (this._oPendingRequests.loadingFeedEntriesRequest) {
				this._oPendingRequests.loadingFeedEntriesRequest.abort();
			}
			if (this._oPendingRequests.loadingRepliesRequest) {
				this._oPendingRequests.loadingRepliesRequest.abort();
			}
			if (this._oPendingRequests.loadingSuggestionsRequest) {
				this._oPendingRequests.loadingSuggestionsRequest.abort();
			}
		},
		/**
		 * Check Jam configuration
		 * @private
		 * @return {boolean} bIsJamConfigured
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_isJamConfigured: function(){
			var oSMIModel = this.getView().getModel("smi");
			if (this._bIsJamConfigured === undefined) {
				var that = this;
				var sPath = "/GetJamConfigurationStatus";
				var mParameters = {
					"async": false,
					"success": function(oData, response){
						that._bIsJamConfigured = true;
					},
					"error": function(oError){
						that._bIsJamConfigured = false;
						that._oLogger.error("Error in the Social Media Integration configuration for the connection to SAP Jam.");
						that._disableGroupFeed();
					}
				};
				oSMIModel.read(sPath, mParameters);
			}
			
			return this._bIsJamConfigured;
		},
		/**
		 * Refreshes the security token and performs a POST to the path provided
		 * @private
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_refreshSecurityToken: function(){
			var that = this;
			var refreshingSecurityToken = jQuery.Deferred();
			
			return this._oPendingRequests.refreshingSecurityToken = 
				refreshingSecurityToken.promise(this._oJamModel.refreshSecurityToken(
					function(oData, response){
						that._oLogger.info("Security token refreshed");
						refreshingSecurityToken.resolveWith(that,[oData, response]);
					},
					function(oSecurityTokenError){
						that._oLogger.error("Security token error: " + oSecurityTokenError.statusText);
						refreshingSecurityToken.rejectWith([oSecurityTokenError],that);
					}
				));
		},
		/**
		 * Get the logged in user from Jam and assign it to a member attribute of the controller.
		 * @private
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_getLoggedInUser: function(){
			if(!this._mCurrentUser){
				var that = this;
				var sPath = "/Self";
				var mParameters = {
					"success": function(oData, response){
						that._mCurrentUser = oData.results;
					},
					"error": function(oError){
						that._oLogger.error('Failed to get the logged in user', oError.stack);
					}
				};
				
				this._oJamModel.read(sPath, mParameters);
			}
		},
		/**
		 * Load the feed entries for the selected group. If a next link exists, get the next page.
		 * @private
		 * @param {string} url the url to fetch the feed entries
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_loadFeedEntries: function(url) {
			// if Jam is not configured, do not execute
			if (!this._isJamConfigured()) {
				return;
			}
			this._setTimelineToBusy();
			
			// resolve next link
			var sNextLink = this._oNextLinks.feedEntriesNextLink;
			if (sNextLink !== "") {
				sNextLink = decodeURIComponent(sNextLink);
				var sSkipToken = this._extractUrlParams(sNextLink).$skiptoken;
			}
			
			return this._oPendingRequests.loadingFeedEntriesRequest = this._oMode.getFeedEntries.apply(this, [url, sSkipToken]);
		},
		/**
		 * Get the Replies based on whether the sFeedEntryId or sNextLink is passed:
		 * i- If the sFeedEntryId is passed, then the assumption is that it's the initial set of replies
		 * ii- If the sNextLink is passed, then the assumption is that the "Show More" link is pressed and the next link from SAP Jam is used
		 * to make the call to retrieve the next set of Replies
		 * 
		 * @param {string} sFeedId - the feed entry id
		 * @param {string} sNextLink - the next link from SAP Jam
		 * @param {object} oTimelineItem - the timeline item that corresponds to this Reply
		 * @private
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_getReplies: function(sFeedId, sNextLink, oTimelineItem) { 
			var that = this;
			var sPath;
			var mParameters = {
				"async": true,
				"urlParameters": {
						'$orderby': 'CreatedAt desc',
						'$expand': 'Creator'
				},
				"success": function(oData, response){
					that._oLogger.info("Replies were successfully retrieved.");
					gettingRepliesPromise.resolveWith(that, [oData,response]);
				},
				"error": function(oError){
					that._oLogger.error("Failed to retrieve replies: " + oError.statusText);
					gettingRepliesPromise.rejectWith(that, [oError]);
				}
			};
			var oCustomReply = oTimelineItem.getCustomReply();
			
			if (sNextLink){
				sPath = "/" + sNextLink;
				mParameters.urlParameters = this._extractUrlParams(decodeURIComponent(sNextLink));
				mParameters.urlParameters.$orderby = mParameters.urlParameters.$orderby.replace("+", " ");
			}
			else {
				sPath = "/FeedEntries('" + jQuery.sap.encodeURL(sFeedId) + "')/Replies";
			}
			
			var gettingRepliesPromise = jQuery.Deferred();
			gettingRepliesPromise.done(function(oData, response){
				var aReplies = oData.results.reverse();
				
				// for each reply, build the image url and format the date
				aReplies.forEach(function(oReply){
					oReply.Creator.ThumbnailImage = that._buildThumbnailImageURL(oReply.Creator.Id);
					oReply.CreatedAt = that._oDateUtil.formatDateToString(oReply.CreatedAt);
				});
				
				oCustomReply.addReplies({
					data : aReplies,
					more : oData.__next ? true : false
				});
				oTimelineItem.getModel().getData().Replies.__next = oData.__next;
			})
			.always(function(){
				oCustomReply.setBusy(false);
			})
			.fail(function(){
				oCustomReply._oReplyPopover.close();
			});
			
			oCustomReply.setBusyIndicatorDelay(0).setBusy(true);
			this._oPendingRequests.loadingRepliesRequest = gettingRepliesPromise.promise(this._oJamModel.read(sPath, mParameters));
			
		},
		/************************************************************************
		 * Logging Services
		 ************************************************************************/
		 /**
		  * A service method to allow class instances needed by the controller
		  * to log their errors.
		  * @param {string} sErrorMessageToLog - The error message to log.
		  * @memberOf sap.collaboration.components.feed.views.GroupFeed
		  */
		 logError: function(sErrorMessageToLog) {
		 	this._oLogger.error(sErrorMessageToLog);
		 },
		 /************************************************************************
		 * Public Methods to Expose Resources Needed by Collaboration Classes
		 ************************************************************************/
		 /**
		  * A service method to expose the controller's view's models.
		  * @param {string|undefined} [sName] name of the model to be retrieved
		  * @return {sap.ui.model.Model} the requested model
		  * @memberOf sap.collaboration.components.feed.views.GroupFeed
		  */
		 getModel: function(sName) {
	 		return this.getView().getModel(sName);
		 },
		/************************************************************************
		 * Error handling
		 ************************************************************************/
		/**
		 * Display error message
		 * @private
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_displayErrorMessage: function(sErrorText) { 
			var sMessage = sErrorText || this._oLanguageBundle.getText("SYSTEM_ERROR_MESSAGEBOX_GENERAL_TEXT");
			
			MessageBox.error(sMessage);
		},
		/**
		 * Display Jam connection error
		 * @private
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_displayJamConnectionErrorMessage: function() { 
			var sMessage = this._oLanguageBundle.getText("JAM_CONNECTION_ERROR_MESSAGEBOX_TEXT");
			
			MessageBox.error(sMessage);
		},
		/**
		 * Disable the Timeline control
		 * @private
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed 
		 */
		_disableGroupFeed: function(){
			this._abortAllPendingRequests();
			
			var oTimeline = this.byId("timeline");
			if (!jQuery.isEmptyObject(oTimeline)){
				oTimeline.setBusyIndicatorDelay(0).setBusy(false);

				this._clearTimeline();
				
				this._oViewDataModel.setProperty("/groupSelectorEnabled",false);
				this._oViewDataModel.setProperty("/addPostButtonEnabled",false);
				this._oViewDataModel.setProperty("/forceGrowing",false);
			}
		},	
		
		
		/************************************************************************
		 * Utilities
		 ************************************************************************/
		/**
		 * Returns a map containing URL parameters extracted from a URL
		 * @param {string} sURL
		 * @return {map} mUrlParameters
		 * @private
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_extractUrlParams: function(sURL) {
			var sUrlParameters = sURL.slice(sURL.indexOf("?")+1);
			var aUrlParameters = sUrlParameters.split("&");
			var mUrlParameters = {};
			
			aUrlParameters.forEach(function(urlParameter) {
				var indexOfEqual = urlParameter.indexOf("=");
				mUrlParameters[urlParameter.slice(0, indexOfEqual)] = urlParameter.slice(indexOfEqual+1);
			});
			return mUrlParameters;
		},
		/**
		 * Returns a URL for the ThumbnailImage
		 * @param {string} sUserId
		 * @return {string}
		 * @private
		 * @memberOf sap.collaboration.components.feed.views.GroupFeed
		 */
		_buildThumbnailImageURL: function(sUserId) {
			return this._oJamModel.sServiceUrl + "/Members('" + jQuery.sap.encodeURL(sUserId) + "')/ThumbnailImage/$value";
		}

	});
	return oGroupFeed;
}, /* bExport= */ true);
